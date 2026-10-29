import React, { useRef, useState, useEffect } from 'react';
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
import { videoEngine } from '../services/videoEngine';

export default function PalmierTimeline({ 
  clips = [],
  currentTime = 7.958, 
  totalDuration = 33.541, 
  isPlaying = false,
  selectedClipId,
  onSelectClip,
  onSplitClip,
  onDeleteClip,
  onSeek 
}) {
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'razor' | 'ripple' | 'range' | 'text'
  const [zoomLevel, setZoomLevel] = useState(30); // pixels per second
  const [liveWaveform, setLiveWaveform] = useState(null);
  const timelineTracksRef = useRef(null);

  // Animate real audio waveform bars while playing
  useEffect(() => {
    let animId;
    if (isPlaying) {
      const updateWave = () => {
        const data = videoEngine.getLiveWaveformData();
        if (data) setLiveWaveform(data);
        animId = requestAnimationFrame(updateWave);
      };
      animId = requestAnimationFrame(updateWave);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'c' || e.key === 'C') {
        setActiveTool('razor');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
        if (onDeleteClip) onDeleteClip(selectedClipId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, onDeleteClip]);

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

  const handleClipClick = (e, clip) => {
    e.stopPropagation();
    if (activeTool === 'razor') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const splitOffsetSec = clickX / zoomLevel;
      const splitTime = clip.startTime + splitOffsetSec;
      if (onSplitClip) onSplitClip(clip.id, splitTime);
    } else {
      if (onSelectClip) onSelectClip(clip.id);
    }
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
            title="Razor Tool (C) — Click clip to cut"
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
              {clips.filter(c => c.trackId === 'V1').map((clip) => {
                const widthPx = clip.duration * zoomLevel;
                const leftPx = clip.startTime * zoomLevel;
                const isSelected = clip.id === selectedClipId;
                return (
                  <div 
                    key={clip.id} 
                    className={`v1-timeline-clip ${isSelected ? 'selected' : ''}`}
                    style={{ 
                      left: `${leftPx}px`, 
                      width: `${widthPx}px`,
                      cursor: activeTool === 'razor' ? 'crosshair' : 'pointer'
                    }}
                    onClick={(e) => handleClipClick(e, clip)}
                    title={`${clip.name} (Click to ${activeTool === 'razor' ? 'cut' : 'select'})`}
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
                  {Array.from({ length: 80 }).map((_, i) => {
                    const dynamicHeight = liveWaveform 
                      ? Math.max(4, (liveWaveform[i] / 255) * 32)
                      : (15 + Math.sin(i * 0.4) * 12 + (i % 3) * 4);
                    return (
                      <div 
                        key={i} 
                        className="wf-bar"
                        style={{ height: `${dynamicHeight}px` }}
                      />
                    );
                  })}
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
                  {Array.from({ length: 80 }).map((_, i) => {
                    const dynamicHeight = liveWaveform 
                      ? Math.max(3, (liveWaveform[79 - i] / 255) * 24)
                      : (10 + Math.cos(i * 0.5) * 8 + (i % 2) * 5);
                    return (
                      <div 
                        key={i} 
                        className="wf-bar"
                        style={{ height: `${dynamicHeight}px` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
