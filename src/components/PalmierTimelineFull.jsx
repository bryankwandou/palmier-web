import React, { useRef, useState, useEffect } from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  MousePointer, 
  Scissors, 
  SlidersHorizontal, 
  Type, 
  ZoomIn, 
  ZoomOut,
  Lock, 
  Unlock,
  Volume2, 
  VolumeX,
  Plus,
  Bookmark,
  Split,
  ChevronRight,
  Sparkles
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
  onUpdateClip,
  onSeek,
  onAddTextClip,
  onSplitAtPlayhead,
  onTrimStartToPlayhead,
  onTrimEndToPlayhead,
  agentActivity
}) {
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'razor' | 'trim' | 'text'
  const [zoomLevel, setZoomLevel] = useState(32);
  const [tracks, setTracks] = useState(INITIAL_TRACKS_CONFIG);
  const [liveWaveform, setLiveWaveform] = useState(null);
  const [hoverCutPos, setHoverCutPos] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingClip, setDraggingClip] = useState(null);
  const [trimmingClip, setTrimmingClip] = useState(null); // { clipId, side: 'left' | 'right', startX, origStart, origDur }
  const [markers, setMarkers] = useState([
    { id: 'm-1', time: 4.5, label: 'B-Roll Start', color: '#f59e0b' },
    { id: 'm-2', time: 13.7, label: 'Chorus Drop', color: '#10b981' }
  ]);
  const [snappingEnabled, setSnappingEnabled] = useState(true);

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

  // Global mouse move & mouse up for dragging and trimming
  useEffect(() => {
    const handleWindowMouseMove = (e) => {
      if (isScrubbing && timelineTracksRef.current) {
        const rect = timelineTracksRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newSec = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
        if (onSeek) onSeek(newSec);
      }

      if (draggingClip) {
        const deltaSec = (e.clientX - draggingClip.startX) / zoomLevel;
        let newStartTime = Math.max(0, draggingClip.origStart + deltaSec);
        if (snappingEnabled && Math.abs(newStartTime - currentTime) < 0.25) {
          newStartTime = currentTime;
        }
        if (onUpdateClip) {
          onUpdateClip(draggingClip.clipId, { startTime: newStartTime });
        }
      }

      if (trimmingClip) {
        const deltaSec = (e.clientX - trimmingClip.startX) / zoomLevel;
        if (trimmingClip.side === 'left') {
          const newStart = Math.max(0, trimmingClip.origStart + deltaSec);
          const newDur = Math.max(0.3, trimmingClip.origDur - (newStart - trimmingClip.origStart));
          if (onUpdateClip) {
            onUpdateClip(trimmingClip.clipId, { startTime: newStart, duration: newDur });
          }
        } else {
          const newDur = Math.max(0.3, trimmingClip.origDur + deltaSec);
          if (onUpdateClip) {
            onUpdateClip(trimmingClip.clipId, { duration: newDur });
          }
        }
      }
    };

    const handleWindowMouseUp = () => {
      setIsScrubbing(false);
      setDraggingClip(null);
      setTrimmingClip(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isScrubbing, draggingClip, trimmingClip, zoomLevel, totalDuration, onSeek, onUpdateClip, snappingEnabled, currentTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      else if (e.key === 'c' || e.key === 'C') setActiveTool('razor');
      else if (e.key === 't' || e.key === 'T') {
        if (onAddTextClip) onAddTextClip();
      } else if (e.key === 'm' || e.key === 'M') {
        handleAddMarker();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (onSplitAtPlayhead) onSplitAtPlayhead();
      } else if (e.key === 'q' || e.key === 'Q') {
        if (onTrimStartToPlayhead) onTrimStartToPlayhead();
      } else if (e.key === 'w' || e.key === 'W') {
        if (onTrimEndToPlayhead) onTrimEndToPlayhead();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
        if (onDeleteClip) onDeleteClip(selectedClipId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, onDeleteClip, onAddTextClip, onSplitAtPlayhead, onTrimStartToPlayhead, onTrimEndToPlayhead, currentTime]);

  const handleAddMarker = () => {
    const newMarker = {
      id: `m-${Date.now()}`,
      time: currentTime,
      label: `Marker ${markers.length + 1}`,
      color: '#f59e0b'
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  const handleRulerMouseDown = (e) => {
    setIsScrubbing(true);
    if (!timelineTracksRef.current) return;
    const rect = timelineTracksRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newSec = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
    if (onSeek) onSeek(newSec);
  };

  const handleMouseMoveOverTracks = (e) => {
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

  const handleClipMouseDown = (e, clip) => {
    if (activeTool === 'razor') return;
    e.stopPropagation();
    if (onSelectClip) onSelectClip(clip.id);
    setDraggingClip({
      clipId: clip.id,
      startX: e.clientX,
      origStart: clip.startTime
    });
  };

  const handleTrimMouseDown = (e, clip, side) => {
    e.stopPropagation();
    setTrimmingClip({
      clipId: clip.id,
      side,
      startX: e.clientX,
      origStart: clip.startTime,
      origDur: clip.duration
    });
  };

  const toggleTrackMute = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleTrackLock = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t));
  };

  const playheadX = currentTime * zoomLevel;

  // Generate ticks every 4 seconds dynamically up to totalDuration
  const tickInterval = 4;
  const numTicks = Math.ceil(totalDuration / tickInterval) + 2;
  const rulerTimepoints = Array.from({ length: numTicks }).map((_, i) => {
    const sec = i * tickInterval;
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return { sec, label: `00:${pad(mins)}:${pad(secs)}:00` };
  });

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

      {/* 2. Timeline Tools Bar matching ToolbarView.swift */}
      <div className="timeline-toolbar">
        <div className="toolbar-history-group">
          <button className="tb-btn" title="Undo (⌘Z)"><RotateCcw size={13} /></button>
          <button className="tb-btn" title="Redo (⇧⌘Z)"><RotateCw size={13} /></button>
        </div>

        <div className="toolbar-divider" />

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
            className={`tb-btn ${activeTool === 'trim' ? 'active' : ''}`}
            onClick={() => setActiveTool('trim')}
            title="Trim Tool (T)"
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-edit-operations">
          <button 
            className="tb-btn"
            onClick={onSplitAtPlayhead}
            title="Split at Playhead (⌘K)"
          >
            <Split size={13} />
          </button>
          <button 
            className="tb-btn bracket-btn"
            onClick={onTrimStartToPlayhead}
            title="Trim Start to Playhead (Q)"
          >
            [
          </button>
          <button 
            className="tb-btn bracket-btn"
            onClick={onTrimEndToPlayhead}
            title="Trim End to Playhead (W)"
          >
            ]
          </button>
          <button 
            className="tb-btn"
            onClick={onAddTextClip}
            title="Add Text Clip on T1 (T)"
          >
            <Type size={13} />
          </button>
          <button 
            className="tb-btn"
            onClick={handleAddMarker}
            title="Add Timeline Marker (M)"
          >
            <Bookmark size={13} />
          </button>
        </div>

        <div className="toolbar-spacer" />

        <button 
          className={`timeline-snap-mode-btn ${snappingEnabled ? 'active' : ''}`}
          onClick={() => setSnappingEnabled(!snappingEnabled)}
          title="Toggle Magnetic Snapping (S)"
        >
          <span>Snap: {snappingEnabled ? 'ON' : 'OFF'}</span>
        </button>
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
          onMouseMove={handleMouseMoveOverTracks}
          onMouseLeave={() => setHoverCutPos(null)}
        >
          {/* Time Ruler */}
          <div 
            className="timeline-time-ruler" 
            style={{ width: `${totalDuration * zoomLevel + 400}px` }}
            onMouseDown={handleRulerMouseDown}
          >
            {rulerTimepoints.map((tp, idx) => (
              <div key={idx} className="ruler-marker-tick" style={{ left: `${tp.sec * zoomLevel}px` }}>
                <span className="tick-label">{tp.label}</span>
                <div className="tick-mark-line" />
              </div>
            ))}

            {/* Timeline Markers */}
            {markers.map((mk) => (
              <div 
                key={mk.id}
                className="timeline-marker-pin"
                style={{ left: `${mk.time * zoomLevel}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSeek) onSeek(mk.time);
                }}
                title={`${mk.label} at ${mk.time}s`}
              >
                <div className="marker-flag" style={{ backgroundColor: mk.color }} />
              </div>
            ))}
          </div>

          {/* Red Playhead */}
          <div className="timeline-red-playhead" style={{ transform: `translateX(${playheadX}px)` }}>
            <div className="playhead-head-diamond" onMouseDown={handleRulerMouseDown} />
            <div className="playhead-needle-line" />
          </div>

          {/* Razor Hover Line */}
          {hoverCutPos !== null && activeTool === 'razor' && (
            <div className="timeline-razor-hover-line" style={{ transform: `translateX(${hoverCutPos}px)` }}>
              <Scissors size={10} className="razor-hover-icon" />
            </div>
          )}

          {/* Agent Activity Overlay matching TimelineView.swift agentActivityLayer */}
          {agentActivity && agentActivity.active && (
            <div 
              className="timeline-agent-activity-bracket"
              style={{
                left: `${(agentActivity.startTime || 0) * zoomLevel}px`,
                width: `${(agentActivity.duration || 4.0) * zoomLevel}px`
              }}
            >
              <div className="agent-activity-tag">
                <Sparkles size={9} />
                <span>{agentActivity.label || 'MCP Agent'}</span>
              </div>
            </div>
          )}

          {/* 6 Track Lanes */}
          <div 
            className="timeline-lanes-container" 
            style={{ width: `${totalDuration * zoomLevel + 400}px` }}
            onMouseDown={(e) => {
              if (e.target.classList.contains('timeline-lane') || e.target.classList.contains('timeline-lanes-container')) {
                handleRulerMouseDown(e);
              }
            }}
          >
            {tracks.map((t) => {
              const trackClips = clips.filter(c => c.trackId === t.id);

              return (
                <div key={t.id} className={`timeline-lane lane-${t.id.toLowerCase()}`}>
                  {trackClips.map((clip) => {
                    const widthPx = clip.duration * zoomLevel;
                    const leftPx = clip.startTime * zoomLevel;
                    const isSelected = clip.id === selectedClipId;

                    // Text track rendering (T1)
                    if (t.type === 'text') {
                      return (
                        <div 
                          key={clip.id}
                          className={`text-timeline-clip ${isSelected ? 'selected' : ''}`}
                          style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                          onClick={(e) => handleClipClick(e, clip)}
                          onMouseDown={(e) => handleClipMouseDown(e, clip)}
                        >
                          <div 
                            className="clip-trim-handle left"
                            onMouseDown={(e) => handleTrimMouseDown(e, clip, 'left')} 
                          />
                          <span className="clip-label">{clip.name || clip.text}</span>
                          <div 
                            className="clip-trim-handle right"
                            onMouseDown={(e) => handleTrimMouseDown(e, clip, 'right')} 
                          />
                        </div>
                      );
                    }

                    // Video clip rendering (V1, V2)
                    if (t.type === 'video') {
                      return (
                        <div 
                          key={clip.id}
                          className={`v1-timeline-clip ${isSelected ? 'selected' : ''} ${t.id === 'V2' ? 'v2-overlay-clip' : ''}`}
                          style={{ 
                            left: `${leftPx}px`, 
                            width: `${widthPx}px`,
                            cursor: activeTool === 'razor' ? 'crosshair' : 'grab'
                          }}
                          onClick={(e) => handleClipClick(e, clip)}
                          onMouseDown={(e) => handleClipMouseDown(e, clip)}
                          title={`${clip.name} (Drag to move, edges to trim)`}
                        >
                          {/* Left Trim Handle */}
                          <div 
                            className="clip-trim-handle left"
                            onMouseDown={(e) => handleTrimMouseDown(e, clip, 'left')}
                            title="Trim Start"
                          />

                          <div className="v1-clip-badge">
                            <span className="badge-name">{clip.name}</span>
                          </div>
                          <div className="v1-clip-filmstrip">
                            <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" draggable="false" />
                            <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" draggable="false" />
                            <img src={clip.thumb} alt={clip.name} className="filmstrip-frame" draggable="false" />
                          </div>

                          {/* Right Trim Handle */}
                          <div 
                            className="clip-trim-handle right"
                            onMouseDown={(e) => handleTrimMouseDown(e, clip, 'right')}
                            title="Trim End"
                          />
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
                        onMouseDown={(e) => handleClipMouseDown(e, clip)}
                      >
                        <div 
                          className="clip-trim-handle left"
                          onMouseDown={(e) => handleTrimMouseDown(e, clip, 'left')} 
                        />
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
                        <div 
                          className="clip-trim-handle right"
                          onMouseDown={(e) => handleTrimMouseDown(e, clip, 'right')} 
                        />
                      </div>
                    );
                  })}

                  {/* Fallback base waveforms for audio tracks if empty */}
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
                            ? Math.max(4, (liveWaveform[i % liveWaveform.length] / 255) * 28)
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
