import React, { useRef, useState } from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  MousePointer, 
  Scissors, 
  SlidersHorizontal, 
  Brackets, 
  Type, 
  ZoomIn, 
  ZoomOut,
  Eye,
  Lock,
  Volume2
} from 'lucide-react';
import { TIMELINE_CLIPS_SOURCE } from '../data/palmierSourceData';

export default function PalmierTimeline({ 
  currentTime = 7.958, 
  totalDuration = 33.541, 
  onSeek 
}) {
  const [clips, setClips] = useState(TIMELINE_CLIPS_SOURCE);
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'razor' | 'ripple' | 'range' | 'text'
  const [zoomLevel, setZoomLevel] = useState(30); // pixels per second
  const timelineTracksRef = useRef(null);

  const rulerTimepoints = [
    { sec: 0, label: '00:00:00:00' },
    { sec: 4, label: '00:00:04:00' },
    { sec: 8, label: '00:00:08:00' },
    { sec: 9, label: '00:00:09:00' },
    { sec: 12, label: '00:00:12:00' },
    { sec: 16, label: '00:00:16:00' },
    { sec: 20, label: '00:00:20:00' },
    { sec: 24, label: '00:00:24:00' },
    { sec: 28, label: '00:00:28:00' },
    { sec: 32, label: '00:00:32:00' },
  ];

  const handleTimelineClick = (e) => {
    if (!timelineTracksRef.current) return;
    const rect = timelineTracksRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newSec = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
    if (onSeek) onSeek(newSec);
  };

  const playheadX = currentTime * zoomLevel;

  return (
    <div className="palmier-native-timeline">
      {/* Top Toolbar */}
      <div className="timeline-toolbar">
        <div className="toolbar-history-group">
          <button className="tb-btn" title="Undo (Cmd+Z)"><RotateCcw size={13} /></button>
          <button className="tb-btn" title="Redo (Cmd+Shift+Z)"><RotateCw size={13} /></button>
        </div>

        <div className="toolbar-tools-group">
          <button 
            className={`tb-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => setActiveTool('select')}
            title="Selection Tool (V)"
          >
            <MousePointer size={13} />
          </button>
          <button 
            className={`tb-btn ${activeTool === 'razor' ? 'active' : ''}`}
            onClick={() => setActiveTool('razor')}
            title="Razor Tool (C)"
          >
            <Scissors size={13} />
          </button>
          <button 
            className={`tb-btn ${activeTool === 'ripple' ? 'active' : ''}`}
            onClick={() => setActiveTool('ripple')}
            title="Ripple Edit Tool"
          >
            <SlidersHorizontal size={13} />
          </button>
          <button 
            className={`tb-btn ${activeTool === 'range' ? 'active' : ''}`}
            onClick={() => setActiveTool('range')}
            title="Range Selection ([ ])"
          >
            <Brackets size={13} />
          </button>
          <button 
            className={`tb-btn ${activeTool === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTool('text')}
            title="Text Tool (T)"
          >
            <Type size={13} />
          </button>
        </div>

        <div className="toolbar-spacer" />

        {/* Zoom Slider */}
        <div className="toolbar-zoom-group">
          <ZoomOut size={12} className="zoom-icon" />
          <input 
            type="range" 
            min="15" 
            max="80" 
            value={zoomLevel} 
            onChange={(e) => setZoomLevel(parseInt(e.target.value))}
            className="zoom-slider"
          />
          <ZoomIn size={12} className="zoom-icon" />
        </div>
      </div>

      {/* Main Tracks & Ruler Container */}
      <div className="timeline-body-wrap">
        {/* Left Track Headers Column */}
        <div className="timeline-track-headers-col">
          <div className="ruler-header-blank" />

          {/* V1 Header */}
          <div className="track-header-cell v1-header">
            <span className="track-title-badge">V1</span>
            <div className="track-icons-row">
              <Eye size={11} className="track-icon active" />
              <Lock size={11} className="track-icon" />
            </div>
          </div>

          {/* A1 Header */}
          <div className="track-header-cell a1-header">
            <span className="track-title-badge">A1</span>
            <div className="track-icons-row">
              <Volume2 size={11} className="track-icon active" />
              <Lock size={11} className="track-icon" />
            </div>
          </div>

          {/* A2 Header */}
          <div className="track-header-cell a2-header">
            <span className="track-title-badge">A2</span>
            <div className="track-icons-row">
              <Volume2 size={11} className="track-icon active" />
              <Lock size={11} className="track-icon" />
            </div>
          </div>
        </div>

        {/* Right Scrollable Timeline Canvas */}
        <div 
          className="timeline-tracks-canvas-scroll"
          ref={timelineTracksRef}
          onClick={handleTimelineClick}
        >
          {/* Time Ruler */}
          <div className="timeline-time-ruler" style={{ width: `${totalDuration * zoomLevel + 200}px` }}>
            {rulerTimepoints.map((tp, idx) => (
              <div 
                key={idx} 
                className="ruler-marker-tick" 
                style={{ left: `${tp.sec * zoomLevel}px` }}
              >
                <span className="tick-label">{tp.label}</span>
                <div className="tick-mark-line" />
              </div>
            ))}
          </div>

          {/* Red Playhead Line */}
          <div 
            className="timeline-red-playhead"
            style={{ transform: `translateX(${playheadX}px)` }}
          >
            <div className="playhead-head-diamond" />
            <div className="playhead-needle-line" />
          </div>

          {/* Lanes Container */}
          <div className="timeline-lanes-container" style={{ width: `${totalDuration * zoomLevel + 200}px` }}>
            {/* V1 Video Track Lane */}
            <div className="timeline-lane lane-v1">
              {clips.map((clip) => {
                const widthPx = clip.duration * zoomLevel;
                const leftPx = clip.startTime * zoomLevel;
                return (
                  <div 
                    key={clip.id} 
                    className="v1-timeline-clip"
                    style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                  >
                    {/* Purple Clip Header Badge */}
                    <div className="v1-clip-badge">
                      <span className="badge-name">{clip.name}</span>
                    </div>

                    {/* Continuous Filmstrip Thumbnails */}
                    <div className="v1-clip-filmstrip">
                      <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" />
                      <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" />
                      <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* A1 Audio Track Lane (Neon Green Waveform) */}
            <div className="timeline-lane lane-a1">
              <div 
                className="audio-clip-waveform-green"
                style={{ left: '0px', width: `${totalDuration * zoomLevel}px` }}
              >
                <div className="audio-badge">
                  <span>Audio Master L/R</span>
                </div>
                <div className="neon-green-waveform-bars">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="wf-bar"
                      style={{ height: `${15 + Math.sin(i * 0.4) * 12 + (i % 3) * 4}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* A2 Audio Track Lane (Neon Green Waveform) */}
            <div className="timeline-lane lane-a2">
              <div 
                className="audio-clip-waveform-green"
                style={{ left: '0px', width: `${totalDuration * zoomLevel}px` }}
              >
                <div className="audio-badge">
                  <span>Ambience / SFX</span>
                </div>
                <div className="neon-green-waveform-bars">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="wf-bar"
                      style={{ height: `${10 + Math.cos(i * 0.5) * 8 + (i % 2) * 5}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
