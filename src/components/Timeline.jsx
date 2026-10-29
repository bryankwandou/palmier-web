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
  Maximize2
} from 'lucide-react';

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
  onSplitClip
}) {
  const [zoom, setZoom] = useState(48); // pixels per second
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'split'
  const timelineBodyRef = useRef(null);

  // Time to pixels
  const timeToPx = (t) => t * zoom;
  const pxToTime = (px) => Math.max(0, px / zoom);

  // Handle click on timeline ruler or background to seek
  const handleTimelineClick = (e) => {
    if (!timelineBodyRef.current) return;
    const rect = timelineBodyRef.current.getBoundingClientRect();
    const scrollLeft = timelineBodyRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 180; // 180px track header width
    if (clickX >= 0) {
      const targetTime = pxToTime(clickX);
      onSeek(Math.min(totalDuration, targetTime));
    }
  };

  // Generate ruler markers
  const rulerMarks = [];
  const totalSeconds = Math.ceil(totalDuration) + 5;
  for (let s = 0; s <= totalSeconds; s++) {
    rulerMarks.push(s);
  }

  // Handle clip dragging
  const [dragState, setDragState] = useState(null);

  const startDragClip = (e, clip) => {
    e.stopPropagation();
    onSelectClip(clip.id);

    if (activeTool === 'split') {
      onSplitClip(clip.id, currentTime);
      return;
    }

    setDragState({
      clipId: clip.id,
      startX: e.clientX,
      initialStartTime: clip.startTime,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState) return;
      const deltaX = e.clientX - dragState.startX;
      const deltaTime = deltaX / zoom;
      const newStartTime = Math.max(0, dragState.initialStartTime + deltaTime);
      onUpdateClip(dragState.clipId, { startTime: newStartTime });
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
  }, [dragState, zoom, onUpdateClip]);

  return (
    <div className="timeline-section">
      {/* Timeline Controls Toolbar */}
      <div className="timeline-toolbar">
        <div className="timeline-tools-left">
          <button 
            className={`btn-icon ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => setActiveTool('select')}
            title="Selection Tool (V)"
          >
            <MousePointer size={14} />
          </button>

          <button 
            className={`btn-icon ${activeTool === 'split' ? 'active' : ''}`}
            onClick={() => setActiveTool('split')}
            title="Razor / Split Tool (C)"
          >
            <Scissors size={14} />
          </button>

          <button 
            className="btn-icon"
            onClick={() => selectedClipId && onDeleteClip(selectedClipId)}
            disabled={!selectedClipId}
            title="Delete Selected Clip (Del)"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ZoomOut size={13} color="var(--text-muted)" />
          <input 
            type="range" 
            min="20" 
            max="120" 
            value={zoom} 
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '90px', accentColor: 'var(--accent-blue)' }} 
            title="Timeline Zoom"
          />
          <ZoomIn size={13} color="var(--text-muted)" />
        </div>
      </div>

      {/* Main Track & Timeline Body */}
      <div 
        ref={timelineBodyRef}
        className="timeline-scroll-container"
        onClick={handleTimelineClick}
      >
        <div style={{ display: 'flex', minWidth: `${timeToPx(totalDuration + 8) + 200}px`, position: 'relative' }}>
          
          {/* Track Headers Column (Pinned Left) */}
          <div style={{ 
            width: '180px', 
            position: 'sticky', 
            left: 0, 
            zIndex: 30, 
            background: 'var(--bg-sidebar)', 
            borderRight: '1px solid var(--border-subtle)',
            flexShrink: 0
          }}>
            {/* Corner Cell above track headers */}
            <div style={{ height: '28px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-panel)' }}></div>

            {tracks.map((track) => (
              <div 
                key={track.id} 
                style={{ 
                  height: `${track.height}px`, 
                  borderBottom: '1px solid var(--border-subtle)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)'
                }}
              >
                <span>{track.name}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-icon" style={{ padding: '2px' }} title="Toggle Mute / Hide">
                    {track.type.startsWith('a') ? <Volume2 size={12} /> : <Eye size={12} />}
                  </button>
                  <button className="btn-icon" style={{ padding: '2px' }} title="Lock Track">
                    <Unlock size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Tracks & Ruler Content Area */}
          <div style={{ flex: 1, position: 'relative' }}>
            
            {/* Top Time Ruler */}
            <div style={{ 
              height: '28px', 
              background: 'var(--bg-panel)', 
              borderBottom: '1px solid var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {rulerMarks.map((s) => (
                <div 
                  key={s}
                  style={{ 
                    position: 'absolute', 
                    left: `${timeToPx(s)}px`, 
                    top: 0, 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'flex-end',
                    paddingBottom: '3px',
                    borderLeft: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '9px', 
                    color: 'var(--text-muted)', 
                    paddingLeft: '4px' 
                  }}>
                    {s}s
                  </span>
                </div>
              ))}
            </div>

            {/* Red Playhead Line */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${timeToPx(currentTime)}px`,
                width: '1px',
                background: 'var(--accent-red)',
                zIndex: 40,
                pointerEvents: 'none',
              }}
            >
              {/* Playhead Marker Pin */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-6px',
                  width: '13px',
                  height: '14px',
                  background: 'var(--accent-red)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 65%, 50% 100%, 0 65%)',
                }}
              />
            </div>

            {/* Track Rows */}
            {tracks.map((track) => {
              const trackClips = clips.filter((c) => c.trackId === track.id);

              return (
                <div 
                  key={track.id}
                  style={{
                    height: `${track.height}px`,
                    borderBottom: '1px solid var(--border-subtle)',
                    position: 'relative',
                    background: track.id.startsWith('A') ? 'rgba(13, 74, 70, 0.05)' : 'rgba(30, 58, 95, 0.05)'
                  }}
                >
                  {trackClips.map((clip) => {
                    const isSelected = selectedClipId === clip.id;
                    const clipWidth = timeToPx(clip.duration);
                    const clipLeft = timeToPx(clip.startTime);

                    const getClipColor = () => {
                      if (clip.model) return isSelected ? 'var(--bg-clip-ai-active)' : 'var(--bg-clip-ai)';
                      if (clip.type === 'video') return isSelected ? 'var(--bg-clip-video-active)' : 'var(--bg-clip-video)';
                      if (clip.type === 'audio') return isSelected ? 'var(--bg-clip-audio-active)' : 'var(--bg-clip-audio)';
                      return isSelected ? 'var(--bg-clip-text-active)' : 'var(--bg-clip-text)';
                    };

                    return (
                      <div
                        key={clip.id}
                        onMouseDown={(e) => startDragClip(e, clip)}
                        style={{
                          position: 'absolute',
                          left: `${clipLeft}px`,
                          top: '3px',
                          bottom: '3px',
                          width: `${clipWidth}px`,
                          background: getClipColor(),
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                          boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'var(--shadow-sm)',
                          cursor: activeTool === 'split' ? 'crosshair' : 'grab',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          overflow: 'hidden',
                          userSelect: 'none',
                          zIndex: 20
                        }}
                        title={`${clip.name} (${clip.duration.toFixed(1)}s)`}
                      >
                        {/* Clip Content & Label */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', overflow: 'hidden' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '600', 
                            color: '#fff', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {clip.name}
                          </span>
                        </div>

                        {/* Waveform Visualization for Audio Clips */}
                        {clip.type === 'audio' && clip.waveformPeaks && (
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', display: 'flex', alignItems: 'flex-end', opacity: 0.35, pointerEvents: 'none' }}>
                            {clip.waveformPeaks.map((peak, idx) => (
                              <div key={idx} style={{ flex: 1, height: `${peak}%`, background: '#fff', margin: '0 1px' }} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
}
