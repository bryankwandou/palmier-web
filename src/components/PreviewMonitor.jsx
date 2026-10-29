import React, { useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Square, 
  Tv 
} from 'lucide-react';

export default function PreviewMonitor({
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  fps = 30,
  activeVideoClip,
  activeTextClip
}) {
  const formatTimecode = (seconds) => {
    const s = Math.max(0, seconds);
    const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(s % 60).toString().padStart(2, '0');
    const frames = Math.floor((s % 1) * fps).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}:${frames}`;
  };

  const stepFrame = (frames) => {
    const newTime = Math.max(0, Math.min(totalDuration, currentTime + frames / fps));
    onSeek(newTime);
  };

  return (
    <div className="preview-container">
      <div className="preview-screen-wrapper">
        {activeVideoClip?.posterUrl ? (
          <img 
            src={activeVideoClip.posterUrl} 
            alt={activeVideoClip.name}
            className="preview-canvas"
            style={{
              filter: `contrast(${100 + (activeVideoClip.contrast || 0)}%) saturate(${100 + (activeVideoClip.saturation || 0)}%) brightness(${100 + (activeVideoClip.exposure || 0)}%)`,
              transform: `scale(${activeVideoClip.scale || 1})`,
              opacity: activeVideoClip.opacity ?? 1,
              transition: 'filter 0.1s ease, transform 0.1s ease'
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-disabled)' }}>
            <Tv size={42} />
            <span style={{ fontSize: '12px', letterSpacing: '0.5px' }}>NO ACTIVE VIDEO CLIP AT PLAYHEAD</span>
          </div>
        )}

        {/* Overlaid Active Text Layer */}
        {activeTextClip && (
          <div 
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: activeTextClip.color || '#fff',
              fontSize: `${activeTextClip.fontSize || 24}px`,
              fontFamily: activeTextClip.fontFamily || 'Inter',
              fontWeight: '700',
              textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)',
              padding: '6px 16px',
              borderRadius: '4px',
              textAlign: 'center',
              letterSpacing: '1px',
              pointerEvents: 'none'
            }}
          >
            {activeTextClip.text}
          </div>
        )}

        <div className="preview-hud">
          {activeVideoClip ? `${activeVideoClip.name} [${activeVideoClip.model || 'Source'}]` : 'CANVAS READY'}
        </div>
      </div>

      <div className="preview-controls-bar">
        <div className="timecode-display">
          <span>{formatTimecode(currentTime)}</span>
          <span className="timecode-total">/ {formatTimecode(totalDuration)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-icon" onClick={() => onSeek(0)} title="Jump to Start">
            <SkipBack size={15} />
          </button>

          <button className="btn-icon" onClick={() => stepFrame(-1)} title="Step Backward 1 Frame">
            <RotateCcw size={14} />
          </button>

          <button 
            className="btn-icon"
            onClick={onTogglePlay}
            style={{ 
              background: 'var(--accent-blue)', 
              color: '#fff', 
              borderRadius: '50%', 
              padding: '8px' 
            }}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '1px' }} />}
          </button>

          <button className="btn-icon" onClick={() => stepFrame(1)} title="Step Forward 1 Frame">
            <RotateCcw size={14} style={{ transform: 'scaleX(-1)' }} />
          </button>

          <button className="btn-icon" onClick={() => onSeek(totalDuration)} title="Jump to End">
            <SkipForward size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={15} color="var(--text-secondary)" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              defaultValue="0.8" 
              style={{ width: '60px', accentColor: 'var(--accent-blue)' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
