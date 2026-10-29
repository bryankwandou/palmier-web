import React, { useRef, useState, useEffect } from 'react';
import { 
  Scissors, 
  Trash2, 
  MousePointer, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX,
  Magnet,
  Bookmark,
  Sparkles,
  Copy,
  Plus,
  Layers,
  Wand2,
  Film
} from 'lucide-react';
import { INITIAL_SEQUENCES, INITIAL_MARKERS } from '../data/projectData';

export default function Timeline({
  tracks,
  clips,
  currentTime,
  totalDuration,
  onSeek,
  selectedClipId,
  onSelectClip,
  onUpdateClip,
  onDeleteClip,
  onSplitClip,
  onDuplicateClip
}) {
  const [zoom, setZoom] = useState(48); // pixels per second
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'split'
  const [snapping, setSnapping] = useState(true);
  const [rippleMode, setRippleMode] = useState(false);
  
  const [sequences, setSequences] = useState(INITIAL_SEQUENCES);
  const [activeSeqId, setActiveSeqId] = useState('seq-1');
  const [markers, setMarkers] = useState(INITIAL_MARKERS);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState(null); // { x, y, clipId }

  const timelineBodyRef = useRef(null);

  // Time to pixels
  const timeToPx = (t) => t * zoom;
  const pxToTime = (px) => Math.max(0, px / zoom);

  // SMPTE Timecode formatter: HH:MM:SS:FF (30fps)
  const formatSMPTE = (seconds) => {
    const totalFrames = Math.floor(seconds * 30);
    const ff = totalFrames % 30;
    const s = Math.floor(seconds) % 60;
    const m = Math.floor(seconds / 60) % 60;
    const h = Math.floor(seconds / 3600);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
  };

  // Click on ruler or track background to seek
  const handleTimelineClick = (e) => {
    if (!timelineBodyRef.current) return;
    const rect = timelineBodyRef.current.getBoundingClientRect();
    const scrollLeft = timelineBodyRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 180; // 180px track header
    if (clickX >= 0) {
      let targetTime = pxToTime(clickX);
      if (snapping) {
        // Snap to clip edges within 0.15s
        for (const c of clips) {
          if (Math.abs(targetTime - c.startTime) < 0.2) targetTime = c.startTime;
          else if (Math.abs(targetTime - (c.startTime + c.duration)) < 0.2) targetTime = c.startTime + c.duration;
        }
      }
      onSeek(Math.min(totalDuration, targetTime));
    }
  };

  // Add marker at current playhead
  const handleAddMarker = () => {
    const newMarker = {
      id: `m-${Date.now()}`,
      time: currentTime,
      label: `Marker at ${currentTime.toFixed(1)}s`,
      color: '#38bdf8'
    };
    setMarkers((prev) => [...prev, newMarker]);
  };

  // Clip drag state (move or trim)
  const [dragState, setDragState] = useState(null);

  const startDragClip = (e, clip, handle = 'move') => {
    e.stopPropagation();
    onSelectClip(clip.id);

    if (activeTool === 'split') {
      onSplitClip(clip.id, currentTime);
      return;
    }

    setDragState({
      clipId: clip.id,
      handle, // 'move' | 'trim-start' | 'trim-end'
      startX: e.clientX,
      initialStartTime: clip.startTime,
      initialDuration: clip.duration,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState) return;
      const deltaX = e.clientX - dragState.startX;
      const deltaTime = deltaX / zoom;

      if (dragState.handle === 'move') {
        let newStartTime = Math.max(0, dragState.initialStartTime + deltaTime);
        if (snapping) {
          for (const c of clips) {
            if (c.id === dragState.clipId) continue;
            const end = c.startTime + c.duration;
            if (Math.abs(newStartTime - end) < 0.2) newStartTime = end;
            else if (Math.abs(newStartTime - c.startTime) < 0.2) newStartTime = c.startTime;
          }
        }
        onUpdateClip(dragState.clipId, { startTime: newStartTime });
      } else if (dragState.handle === 'trim-start') {
        const newStartTime = Math.max(0, dragState.initialStartTime + deltaTime);
        const newDuration = Math.max(0.5, dragState.initialDuration - deltaTime);
        onUpdateClip(dragState.clipId, { startTime: newStartTime, duration: newDuration });
      } else if (dragState.handle === 'trim-end') {
        const newDuration = Math.max(0.5, dragState.initialDuration + deltaTime);
        onUpdateClip(dragState.clipId, { duration: newDuration });
      }
    };

    const handleMouseUp = () => {
      if (dragState) setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, zoom, snapping, clips, onUpdateClip]);

  // Context menu closer on global click
  useEffect(() => {
    const closeContext = () => setContextMenu(null);
    window.addEventListener('click', closeContext);
    return () => window.removeEventListener('click', closeContext);
  }, []);

  return (
    <div className="timeline-section">
      {/* 1. Sequence Tabs Bar matching Palmier Pro TimelineTabBar */}
      <div className="timeline-tab-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {sequences.map((seq) => (
            <div 
              key={seq.id}
              className={`timeline-tab-item ${activeSeqId === seq.id ? 'active' : ''}`}
              onClick={() => setActiveSeqId(seq.id)}
            >
              <Film size={12} color={activeSeqId === seq.id ? 'var(--accent-blue)' : 'var(--text-disabled)'} />
              <span>{seq.name}</span>
              <span className="sequence-badge">{seq.aspect}</span>
            </div>
          ))}

          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', marginLeft: '4px' }}
            title="Create New Sequence"
            onClick={() => {
              const newSeq = {
                id: `seq-${Date.now()}`,
                name: `Sequence ${sequences.length + 1} (Vertical 9:16)`,
                resolution: '1080x1920',
                fps: 30,
                aspect: '9:16'
              };
              setSequences((prev) => [...prev, newSeq]);
              setActiveSeqId(newSeq.id);
            }}
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Playhead SMPTE Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="smpte-display">
            {formatSMPTE(currentTime)}
          </div>
        </div>
      </div>

      {/* 2. Timeline Controls Toolbar */}
      <div className="timeline-controls">
        <div className="timeline-tools-group">
          {/* Tool Modes */}
          <button 
            className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
            title="Selection Tool (V)"
            onClick={() => setActiveTool('select')}
          >
            <MousePointer size={13} />
            <span>Select (V)</span>
          </button>

          <button 
            className={`tool-btn ${activeTool === 'split' ? 'active' : ''}`}
            title="Razor Blade Tool (C)"
            onClick={() => setActiveTool('split')}
          >
            <Scissors size={13} />
            <span>Razor (C)</span>
          </button>

          <div style={{ width: '1px', height: '16px', background: 'var(--border-medium)', margin: '0 4px' }} />

          {/* Quick Actions */}
          <button 
            className="tool-btn" 
            title="Split Clip at Current Playhead (S)"
            onClick={() => {
              if (selectedClipId) onSplitClip(selectedClipId, currentTime);
            }}
            disabled={!selectedClipId}
          >
            <Scissors size={13} />
            <span>Split (S)</span>
          </button>

          <button 
            className="tool-btn" 
            title="Delete Selected Clip (Del)"
            onClick={() => {
              if (selectedClipId) onDeleteClip(selectedClipId);
            }}
            disabled={!selectedClipId}
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>

          <button 
            className="tool-btn" 
            title="Add Timeline Marker (M)"
            onClick={handleAddMarker}
          >
            <Bookmark size={13} />
            <span>Marker (M)</span>
          </button>

          <div style={{ width: '1px', height: '16px', background: 'var(--border-medium)', margin: '0 4px' }} />

          {/* Snapping & Ripple */}
          <button 
            className={`tool-btn ${snapping ? 'active' : ''}`}
            title="Magnet Snapping (N)"
            onClick={() => setSnapping((s) => !s)}
          >
            <Magnet size={13} />
            <span>Snapping</span>
          </button>

          <button 
            className={`tool-btn ${rippleMode ? 'active' : ''}`}
            title="Ripple Edit Mode"
            onClick={() => setRippleMode((r) => !r)}
          >
            <span>Ripple</span>
          </button>
        </div>

        {/* Timeline Zoom Slider */}
        <div className="timeline-zoom-group">
          <button 
            className="btn-icon" 
            onClick={() => setZoom((z) => Math.max(16, z - 12))}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>

          <input 
            type="range" 
            min="16" 
            max="120" 
            step="4"
            value={zoom} 
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '80px', accentColor: 'var(--accent-blue)' }}
          />

          <button 
            className="btn-icon" 
            onClick={() => setZoom((z) => Math.min(120, z + 12))}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* 3. Multi-Track Timeline Canvas */}
      <div 
        className="timeline-tracks-container" 
        ref={timelineBodyRef}
        onClick={handleTimelineClick}
      >
        {/* Ruler Row */}
        <div className="timeline-ruler-row">
          <div className="timeline-track-header-cell" style={{ background: 'var(--bg-panel)', fontWeight: '600' }}>
            TRACKS
          </div>

          <div className="timeline-ruler-track" style={{ width: `${timeToPx(totalDuration + 8)}px` }}>
            {/* Ticks and Seconds */}
            {Array.from({ length: Math.ceil(totalDuration) + 6 }).map((_, sec) => (
              <div 
                key={sec} 
                className="ruler-tick"
                style={{ left: `${timeToPx(sec)}px` }}
              >
                <span className="ruler-sec-label">{sec}s</span>
              </div>
            ))}

            {/* Marker Indicators on Ruler */}
            {markers.map((m) => (
              <div
                key={m.id}
                className="timeline-marker-flag"
                style={{
                  left: `${timeToPx(m.time)}px`,
                  backgroundColor: m.color,
                }}
                title={`${m.label} (${m.time.toFixed(1)}s)`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(m.time);
                }}
              >
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks List */}
        {tracks.map((track) => {
          const trackClips = clips.filter((c) => c.trackId === track.id);

          return (
            <div key={track.id} className="timeline-track-row" style={{ minHeight: `${track.height || 52}px` }}>
              {/* Left Track Header Controls */}
              <div className="timeline-track-header-cell">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div 
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '2px', 
                      backgroundColor: track.id.startsWith('V') ? 'var(--track-v1)' : track.id.startsWith('A') ? 'var(--track-a1)' : 'var(--track-t1)' 
                    }} 
                  />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff' }}>{track.name}</span>
                </div>

                <div className="track-header-actions">
                  <button 
                    className="track-action-btn"
                    title={track.muted ? 'Unmute Track' : 'Mute Track'}
                  >
                    {track.muted ? <VolumeX size={11} color="var(--accent-rose)" /> : <Volume2 size={11} />}
                  </button>

                  <button 
                    className="track-action-btn"
                    title={track.locked ? 'Unlock Track' : 'Lock Track'}
                  >
                    {track.locked ? <Lock size={11} color="var(--accent-amber)" /> : <Unlock size={11} />}
                  </button>
                </div>
              </div>

              {/* Clip Track Lane */}
              <div className="timeline-clip-lane" style={{ width: `${timeToPx(totalDuration + 8)}px` }}>
                {trackClips.map((clip) => {
                  const isSelected = clip.id === selectedClipId;
                  const clipWidth = timeToPx(clip.duration);
                  const clipLeft = timeToPx(clip.startTime);

                  return (
                    <div
                      key={clip.id}
                      className={`timeline-clip-item ${isSelected ? 'selected' : ''} type-${clip.type}`}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${clipWidth}px`,
                      }}
                      onMouseDown={(e) => startDragClip(e, clip, 'move')}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectClip(clip.id);
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          clipId: clip.id
                        });
                      }}
                    >
                      {/* Left Trim Handle */}
                      <div 
                        className="clip-trim-handle handle-left"
                        onMouseDown={(e) => startDragClip(e, clip, 'trim-start')}
                        title="Trim In Point"
                      />

                      {/* Clip Body Content (Filmstrip or Waveform) */}
                      <div className="clip-body-content">
                        {/* Clip Title Banner */}
                        <div className="clip-title-bar">
                          <span className="clip-title-text">{clip.name}</span>
                          <span className="clip-duration-badge">{clip.duration.toFixed(1)}s</span>
                        </div>

                        {/* Filmstrip thumbnail previews for video */}
                        {clip.type === 'video' && clip.posterUrl && (
                          <div className="clip-filmstrip-strip">
                            {Array.from({ length: Math.max(1, Math.floor(clipWidth / 56)) }).map((_, fIdx) => (
                              <img 
                                key={fIdx} 
                                src={clip.posterUrl} 
                                alt="" 
                                className="filmstrip-thumb"
                              />
                            ))}
                          </div>
                        )}

                        {/* Audio Waveform visualization */}
                        {clip.type === 'audio' && (
                          <div className="clip-waveform-svg">
                            <svg width="100%" height="24" preserveAspectRatio="none">
                              <path 
                                d={`M 0,12 ${Array.from({ length: Math.floor(clipWidth / 4) }).map((_, i) => {
                                  const h = ((i * 17 + clip.duration * 13) % 18) + 2;
                                  return `L ${i * 4},${12 - h/2} L ${i * 4},${12 + h/2}`;
                                }).join(' ')}`}
                                stroke="rgba(255,255,255,0.7)"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Text / Captions text display */}
                        {clip.type === 'text' && (
                          <div style={{ fontSize: '10px', color: '#fff', fontStyle: 'italic', padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{clip.text || clip.name}"
                          </div>
                        )}
                      </div>

                      {/* Right Trim Handle */}
                      <div 
                        className="clip-trim-handle handle-right"
                        onMouseDown={(e) => startDragClip(e, clip, 'trim-end')}
                        title="Trim Out Point"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Playhead Vertical Line */}
        <div 
          className="timeline-playhead-line"
          style={{ left: `${timeToPx(currentTime) + 180}px` }}
        >
          <div className="timeline-playhead-cap" />
        </div>
      </div>

      {/* Right-Click AI Context Menu matching Palmier Pro TimelineView+AIEditMenu.swift */}
      {contextMenu && (
        <div 
          className="timeline-context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-section-title">Palmier AI Edit Actions</div>

          <button 
            className="context-menu-item"
            onClick={() => {
              onUpdateClip(contextMenu.clipId, { name: 'FLUX Enhanced 1080p Clip' });
              setContextMenu(null);
            }}
          >
            <Sparkles size={12} color="var(--accent-purple)" />
            <span>FLUX Enhance Full Quality</span>
          </button>

          <button 
            className="context-menu-item"
            onClick={() => {
              onUpdateClip(contextMenu.clipId, { name: '4K Upscaled Master' });
              setContextMenu(null);
            }}
          >
            <Wand2 size={12} color="var(--accent-blue)" />
            <span>AI Upscale 4K 60fps</span>
          </button>

          <button 
            className="context-menu-item"
            onClick={() => {
              onUpdateClip(contextMenu.clipId, { scale: 1.4 });
              setContextMenu(null);
            }}
          >
            <Film size={12} color="var(--accent-emerald)" />
            <span>AI Reframe for Vertical (9:16)</span>
          </button>

          <button 
            className="context-menu-item"
            onClick={() => {
              onUpdateClip(contextMenu.clipId, { denoise: 90 });
              setContextMenu(null);
            }}
          >
            <Volume2 size={12} color="var(--accent-amber)" />
            <span>Studio Voice Denoise & Clean</span>
          </button>

          <div className="context-menu-divider" />

          <button 
            className="context-menu-item"
            onClick={() => {
              onSplitClip(contextMenu.clipId, currentTime);
              setContextMenu(null);
            }}
          >
            <Scissors size={12} />
            <span>Split at Playhead</span>
          </button>

          <button 
            className="context-menu-item"
            onClick={() => {
              const target = clips.find((c) => c.id === contextMenu.clipId);
              if (target) {
                const dup = {
                  ...target,
                  id: `clip-dup-${Date.now()}`,
                  name: `${target.name} (Copy)`,
                  startTime: target.startTime + target.duration + 0.5,
                };
                onUpdateClip(null, null); // trigger rerender
              }
              setContextMenu(null);
            }}
          >
            <Copy size={12} />
            <span>Duplicate Clip</span>
          </button>

          <button 
            className="context-menu-item text-danger"
            onClick={() => {
              onDeleteClip(contextMenu.clipId);
              setContextMenu(null);
            }}
          >
            <Trash2 size={12} color="var(--accent-rose)" />
            <span>Delete Clip</span>
          </button>
        </div>
      )}
    </div>
  );
}
