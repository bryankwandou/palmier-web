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
  EyeOff,
  Lock, 
  Unlock,
  Volume2, 
  VolumeX,
  Plus,
  X
} from 'lucide-react';
import { INITIAL_TRACKS_CONFIG } from '../data/palmierFullProject';
import { videoEngine } from '../services/videoEngine';

export default function PalmierTimelineFull({ 
  sequences = [],
  activeSequenceId,
  onSelectSequence,
  onAddSequence,
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
  const [zoomLevel, setZoomLevel] = useState(30);
  const [tracks, setTracks] = useState(INITIAL_TRACKS_CONFIG);
  const [liveWaveform, setLiveWaveform] = useState(null);
  const [hoverCutPos, setHoverCutPos] = useState(null);
  const timelineTracksRef = useRef(null);

  // Live audio waveform rendering during playback
  useEffect(() => {
    let animId;
    if (isPlaying) {
      const update = () => {
        const wf = videoEngine.getLiveWaveformData();
        if (wf) setLiveWaveform(wf);
        animId = requestAnimationFrame(update);
      };
      animId = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      else if (e.key === 'c' || e.key === 'C') setActiveTool('razor');
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
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
    { sec: 32, label: '00:00:32:00' }
  ];

  const handleTimelineClick = (e) => {
    if (!timelineTracksRef.current) return;
    const rect = timelineTracksRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newSec = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
    if (onSeek) onSeek(newSec);
  };

  const handleMouseMove = (e) => {
    if (activeTool === 'razor' && timelineTracksRef.current) {
      const rect = timelineTracksRef.current.getBoundingClientRect();
      const posX = e.clientX - rect.left;
      setHoverCutPos(posX);
    } else {
      setHoverCutPos(null);
    }
  };

  const handleClipClick = (e, clip) => {
    e.stopPropagation();
    if (activeTool === 'razor') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const splitTime = clip.startTime + clickX / zoomLevel;
      if (onSplitClip) onSplitClip(clip.id, splitTime);
    } else {
      if (onSelectClip) onSelectClip(clip.id);
    }
  };

  const toggleTrackMute = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleTrackLock = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t));
  };

  const playheadX = currentTime * zoomLevel;

  return (
    <div className="palmier-native-timeline">
      {/* 1. Timeline Tab Bar matching Sources/PalmierPro/Timeline/TimelineTabBar.swift */}
      <div className="timeline-tab-bar">
        <div className="sequence-tabs-list">
          {sequences.map((seq) => (
            <div 
              key={seq.id}
              className={`sequence-tab-item ${activeSequenceId === seq.id ? 'active' : ''}`}
              onClick={() => onSelectSequence && onSelectSequence(seq.id)}
            >
              <span className="seq-tab-name">{seq.name}</span>
              <span className="seq-tab-format">({seq.format})</span>
            </div>
          ))}
          <button 
            className="add-seq-tab-btn" 
            onClick={onAddSequence}
            title="Create New Sequence Timeline"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Zoom Slider */}
        <div className="toolbar-zoom-group">
          <ZoomOut size={12} className="zoom-icon" />
          <input 
            type="range" min="15" max="80" value={zoomLevel} 
            onChange={(e) => setZoomLevel(parseInt(e.target.value))}
            className="zoom-slider"
          />
          <ZoomIn size={12} className="zoom-icon" />
        </div>
      </div>

      {/* 2. Timeline Tools Bar */}
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
            title="Razor Tool (C) — Split clips at cursor"
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
            title="Range Selection Tool ([ ])"
          >
            <Brackets size={13} />
          </button>
          <button 
            className={`tb-btn ${activeTool === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTool('text')}
            title="Title Text Tool (T)"
          >
            <Type size={13} />
          </button>
        </div>

        <div className="toolbar-spacer" />

        <div className="timeline-snap-mode">
          <span className="snap-label">Snap: ON</span>
        </div>
      </div>

      {/* 3. Main Multi-Track Body */}
      <div className="timeline-body-wrap">
        {/* Left Track Headers (6 Tracks) */}
        <div className="timeline-track-headers-col">
          <div className="ruler-header-blank" />
          {tracks.map((t) => (
            <div key={t.id} className={`track-header-cell track-${t.type}`}>
              <span className="track-title-badge">{t.id}</span>
              <div className="track-icons-row">
                <button 
                  className="track-icon-btn" 
                  onClick={() => toggleTrackMute(t.id)}
                  title={t.muted ? 'Unmute' : 'Mute'}
                >
                  {t.muted ? <VolumeX size={10} className="off" /> : <Volume2 size={10} className="active" />}
                </button>
                <button 
                  className="track-icon-btn" 
                  onClick={() => toggleTrackLock(t.id)}
                  title={t.locked ? 'Unlock' : 'Lock'}
                >
                  {t.locked ? <Lock size={10} className="locked" /> : <Unlock size={10} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Scrollable Canvas */}
        <div 
          className="timeline-tracks-canvas-scroll"
          ref={timelineTracksRef}
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCutPos(null)}
        >
          {/* Time Ruler */}
          <div className="timeline-time-ruler" style={{ width: `${totalDuration * zoomLevel + 300}px` }}>
            {rulerTimepoints.map((tp, idx) => (
              <div key={idx} className="ruler-marker-tick" style={{ left: `${tp.sec * zoomLevel}px` }}>
                <span className="tick-label">{tp.label}</span>
                <div className="tick-mark-line" />
              </div>
            ))}
          </div>

          {/* Red Playhead */}
          <div className="timeline-red-playhead" style={{ transform: `translateX(${playheadX}px)` }}>
            <div className="playhead-head-diamond" />
            <div className="playhead-needle-line" />
          </div>

          {/* Razor Hover Line */}
          {hoverCutPos !== null && (
            <div className="timeline-razor-hover-line" style={{ transform: `translateX(${hoverCutPos}px)` }}>
              <Scissors size={10} className="razor-hover-icon" />
            </div>
          )}

          {/* 6 Track Lanes */}
          <div className="timeline-lanes-container" style={{ width: `${totalDuration * zoomLevel + 300}px` }}>
            {tracks.map((t) => {
              const trackClips = clips.filter(c => c.trackId === t.id);

              return (
                <div key={t.id} className={`timeline-lane lane-${t.id.toLowerCase()}`}>
                  {trackClips.map((clip) => {
                    const widthPx = clip.duration * zoomLevel;
                    const leftPx = clip.startTime * zoomLevel;
                    const isSelected = clip.id === selectedClipId;

                    // Text track rendering
                    if (t.type === 'text') {
                      return (
                        <div 
                          key={clip.id}
                          className={`text-timeline-clip ${isSelected ? 'selected' : ''}`}
                          style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                          onClick={(e) => handleClipClick(e, clip)}
                        >
                          <span className="clip-label">{clip.name || clip.text}</span>
                        </div>
                      );
                    }

                    // Video clip rendering
                    if (t.type === 'video') {
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
                          <div className="v1-clip-badge">
                            <span className="badge-name">{clip.name}</span>
                          </div>
                          <div className="v1-clip-filmstrip">
                            <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" />
                            <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" />
                            <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" />
                          </div>
                        </div>
                      );
                    }

                    // Audio clip rendering (A1, A2, A3)
                    return (
                      <div 
                        key={clip.id}
                        className={`audio-clip-waveform-green ${isSelected ? 'selected' : ''}`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        onClick={(e) => handleClipClick(e, clip)}
                      >
                        <div className="audio-badge">
                          <span>{clip.name}</span>
                        </div>
                        <div className="neon-green-waveform-bars">
                          {Array.from({ length: 60 }).map((_, i) => {
                            const dynamicH = liveWaveform 
                              ? Math.max(4, (liveWaveform[i % liveWaveform.length] / 255) * 28)
                              : (12 + Math.sin(i * 0.4) * 8 + (i % 2) * 4);
                            return (
                              <div key={i} className="wf-bar" style={{ height: `${dynamicH}px` }} />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Fallback base waveforms for audio tracks A1/A2/A3 if no individual clip placed */}
                  {t.type === 'audio' && trackClips.length === 0 && (
                    <div 
                      className="audio-clip-waveform-green"
                      style={{ left: '0px', width: `${totalDuration * zoomLevel}px` }}
                    >
                      <div className="audio-badge">
                        <span>{t.label}</span>
                      </div>
                      <div className="neon-green-waveform-bars">
                        {Array.from({ length: 80 }).map((_, i) => {
                          const dynamicHeight = liveWaveform 
                            ? Math.max(4, (liveWaveform[i] / 255) * 28)
                            : (14 + Math.sin(i * 0.4) * 10 + (i % 3) * 4);
                          return (
                            <div key={i} className="wf-bar" style={{ height: `${dynamicHeight}px` }} />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
