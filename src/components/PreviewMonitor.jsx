import React, { useState, useEffect, useRef } from 'react';
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
  Tv,
  Grid,
  Maximize2,
  Repeat,
  Sparkles
} from 'lucide-react';

export default function PreviewMonitor({
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  fps = 30,
  aspectRatio = '16:9',
  activeVideoClip,
  activeTextClip,
  selectedClip,
  onUpdateClip
}) {
  const [showSafeGuides, setShowSafeGuides] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState('fit'); // 'fit' | '50%' | '100%' | '200%'
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Real HTML5 Video element ref
  const videoRef = useRef(null);
  const monitorContainerRef = useRef(null);

  // VU meter levels
  const [vuLeft, setVuLeft] = useState(-18);
  const [vuRight, setVuRight] = useState(-16);

  // Synchronize HTML5 video element with Timeline Playhead & State
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoClip || !activeVideoClip.mediaUrl) return;

    const clipLocalTime = Math.max(0, currentTime - activeVideoClip.startTime);

    // Sync time if drifted more than 0.25 seconds
    if (Math.abs(video.currentTime - clipLocalTime) > 0.25) {
      video.currentTime = clipLocalTime;
    }

    if (isPlaying) {
      video.playbackRate = playbackSpeed;
      video.play().catch(() => {
        // Autoplay policy fallback: mute and play
        video.muted = true;
        video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [currentTime, isPlaying, activeVideoClip, playbackSpeed]);

  // Handle VU meter audio simulation during playback
  useEffect(() => {
    let interval;
    if (isPlaying && activeVideoClip) {
      interval = setInterval(() => {
        const base = (activeVideoClip.volume ?? 1) > 0 ? -14 : -48;
        setVuLeft(base + (Math.random() * 8 - 4));
        setVuRight(base + 1 + (Math.random() * 8 - 4));
      }, 75);
    } else {
      setVuLeft(-48);
      setVuRight(-48);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeVideoClip]);

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

  // J-K-L Shuttle control
  const handleShuttle = (direction) => {
    if (direction === 'K') {
      if (isPlaying) onTogglePlay();
      setPlaybackSpeed(1);
    } else if (direction === 'L') {
      if (!isPlaying) onTogglePlay();
      setPlaybackSpeed((prev) => Math.min(4, prev * 2));
    } else if (direction === 'J') {
      stepFrame(-10);
    }
  };

  const isVertical = aspectRatio === '9:16';

  return (
    <div className={`preview-container ${isFullscreen ? 'fullscreen-preview' : ''}`} ref={monitorContainerRef}>
      {/* Top Preview Canvas Toolbar */}
      <div className="preview-canvas-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select 
            value={canvasZoom} 
            onChange={(e) => setCanvasZoom(e.target.value)}
            className="preview-select"
          >
            <option value="fit">Fit ({isVertical ? '9:16 Vertical' : '16:9 Standard'})</option>
            <option value="50%">50%</option>
            <option value="100%">100% (Pixel Native)</option>
            <option value="200%">200%</option>
          </select>

          <button 
            className={`preview-tool-toggle ${showSafeGuides ? 'active' : ''}`}
            onClick={() => setShowSafeGuides((g) => !g)}
            title="Toggle Title & Action Safe Guides (80% / 90%)"
          >
            <Grid size={11} />
            <span>Safe Guides</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span>Color: Rec.709 10-bit</span>
          <span className="resolution-badge">
            {isVertical ? '1080x1920 (9:16)' : '1920x1080 (16:9)'} @ {fps}fps
          </span>

          <button 
            className="btn-icon" 
            style={{ width: '22px', height: '22px', padding: 0 }}
            title="Toggle Maximize Preview Monitor"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* Main Canvas & VU Meter Split View */}
      <div className="preview-canvas-area">
        <div 
          className="preview-screen-wrapper"
          style={{
            aspectRatio: isVertical ? '9 / 16' : '16 / 9',
            maxWidth: isVertical ? '340px' : '100%',
          }}
        >
          {activeVideoClip ? (
            <div 
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Real HTML5 Video Player */}
              {activeVideoClip.mediaUrl ? (
                <video
                  ref={videoRef}
                  src={activeVideoClip.mediaUrl}
                  poster={activeVideoClip.posterUrl}
                  playsInline
                  loop={isLooping}
                  className="preview-canvas"
                  style={{
                    filter: `contrast(${100 + (activeVideoClip.contrast || 0)}%) saturate(${100 + (activeVideoClip.saturation || 0)}%) brightness(${100 + (activeVideoClip.exposure || 0)}%) blur(${activeVideoClip.blur || 0}px)`,
                    transform: `scale(${activeVideoClip.scale || 1}) translate(${activeVideoClip.posX || 0}px, ${activeVideoClip.posY || 0}px) rotate(${activeVideoClip.rotation || 0}deg)`,
                    opacity: activeVideoClip.opacity ?? 1,
                    transition: 'filter 0.05s ease'
                  }}
                  onEnded={() => {
                    if (isLooping) onSeek(0);
                  }}
                />
              ) : (
                <img 
                  src={activeVideoClip.posterUrl} 
                  alt={activeVideoClip.name}
                  className="preview-canvas"
                  style={{
                    filter: `contrast(${100 + (activeVideoClip.contrast || 0)}%) saturate(${100 + (activeVideoClip.saturation || 0)}%) brightness(${100 + (activeVideoClip.exposure || 0)}%) blur(${activeVideoClip.blur || 0}px)`,
                    transform: `scale(${activeVideoClip.scale || 1}) translate(${activeVideoClip.posX || 0}px, ${activeVideoClip.posY || 0}px) rotate(${activeVideoClip.rotation || 0}deg)`,
                    opacity: activeVideoClip.opacity ?? 1,
                  }}
                />
              )}

              {/* Bounding Box Transform Handles when clip is selected */}
              {selectedClip && selectedClip.id === activeVideoClip.id && (
                <div className="preview-bounding-box">
                  <div className="bbox-handle handle-tl" />
                  <div className="bbox-handle handle-tr" />
                  <div className="bbox-handle handle-bl" />
                  <div className="bbox-handle handle-br" />
                  <div className="bbox-handle handle-tm" />
                  <div className="bbox-handle handle-bm" />
                  <div className="bbox-handle handle-ml" />
                  <div className="bbox-handle handle-mr" />
                  <div className="bbox-center-anchor" />
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-disabled)' }}>
              <Tv size={36} strokeWidth={1.5} />
              <span style={{ fontSize: '10.5px', letterSpacing: '0.5px', fontWeight: '500' }}>PALMIER PLAYHEAD IDLE</span>
            </div>
          )}

          {/* Safe Guides Overlay (80% Title Safe, 90% Action Safe) */}
          {showSafeGuides && (
            <div className="safe-guides-overlay">
              <div className="action-safe-box">
                <span className="safe-label">Action Safe 90%</span>
              </div>
              <div className="title-safe-box">
                <span className="safe-label">Title Safe 80%</span>
              </div>
            </div>
          )}

          {/* Overlaid Active Text Layer */}
          {activeTextClip && (
            <div 
              style={{
                position: 'absolute',
                bottom: isVertical ? '48px' : '28px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: activeTextClip.color || '#fff',
                fontSize: isVertical ? '20px' : `${activeTextClip.fontSize || 24}px`,
                fontFamily: activeTextClip.fontFamily || 'Inter, sans-serif',
                fontWeight: activeTextClip.fontWeight || '800',
                textShadow: '0 2px 14px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.85)',
                padding: '6px 16px',
                borderRadius: '4px',
                textAlign: 'center',
                letterSpacing: '0.5px',
                pointerEvents: 'none',
                zIndex: 10,
                width: '85%'
              }}
            >
              {activeTextClip.text}
            </div>
          )}

          {/* Active Clip Name HUD */}
          <div className="preview-hud">
            {activeVideoClip ? `${activeVideoClip.name} [${activeVideoClip.model || 'AVPlayer 4K'}]` : 'PALMIER ENGINE READY'}
          </div>
        </div>

        {/* Stereo VU Peak Audio Meter on Right side */}
        <div className="preview-vu-meter">
          <div className="vu-channel">
            <span className="vu-channel-label">L</span>
            <div className="vu-bar-track">
              <div 
                className="vu-bar-fill" 
                style={{ height: `${Math.min(100, Math.max(0, ((vuLeft + 48) / 48) * 100))}%` }} 
              />
            </div>
          </div>

          <div className="vu-channel">
            <span className="vu-channel-label">R</span>
            <div className="vu-bar-track">
              <div 
                className="vu-bar-fill" 
                style={{ height: `${Math.min(100, Math.max(0, ((vuRight + 48) / 48) * 100))}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="preview-controls-bar">
        <div className="timecode-display">
          <span>{formatTimecode(currentTime)}</span>
          <span className="timecode-total">/ {formatTimecode(totalDuration)}</span>
        </div>

        {/* Transport Buttons: Step Back, Play/Pause, Step Forward */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            className="btn-icon" 
            onClick={() => handleShuttle('J')} 
            title="Shuttle Reverse (J)"
          >
            <span style={{ fontSize: '10px', fontWeight: '700' }}>J</span>
          </button>

          <button 
            className="btn-icon" 
            onClick={() => stepFrame(-1)} 
            title="Step 1 Frame Back (Left Arrow)"
          >
            <SkipBack size={13} />
          </button>

          <button 
            className="btn-play-pause"
            onClick={onTogglePlay}
            title="Play / Pause (Space / K)"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
          </button>

          <button 
            className="btn-icon" 
            onClick={() => stepFrame(1)} 
            title="Step 1 Frame Forward (Right Arrow)"
          >
            <SkipForward size={13} />
          </button>

          <button 
            className="btn-icon" 
            onClick={() => handleShuttle('L')} 
            title="Shuttle Forward (L)"
          >
            <span style={{ fontSize: '10px', fontWeight: '700' }}>L</span>
          </button>

          <button 
            className={`btn-icon ${isLooping ? 'active' : ''}`}
            onClick={() => setIsLooping((l) => !l)}
            title="Toggle Loop Playback"
          >
            <Repeat size={12} color={isLooping ? 'var(--accent-blue)' : 'inherit'} />
          </button>
        </div>

        {/* Speed / Format readout */}
        <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
          {playbackSpeed > 1 ? `${playbackSpeed}x SPEED` : '1.0x PLAY'}
        </div>
      </div>
    </div>
  );
}
