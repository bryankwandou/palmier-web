import React, { useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  SkipBack, 
  StepBack, 
  Play, 
  Pause, 
  StepForward, 
  SkipForward, 
  Camera
} from 'lucide-react';
import { videoEngine } from '../services/videoEngine';

export default function PalmierPreview({ 
  currentClip,
  currentTime = 7.958, // 00:00:07:23 at 24fps
  totalDuration = 33.541, // 00:00:33:13
  isPlaying = false,
  onTogglePlay,
  onSeek,
  onStepFrame
}) {
  const canvasRef = useRef(null);

  // Format frames to standard timecode HH:MM:SS:FF at 24fps
  const formatTimecode = (seconds) => {
    const fps = 24;
    const totalFrames = Math.floor(seconds * fps);
    const hrs = Math.floor(totalFrames / (fps * 3600));
    const mins = Math.floor((totalFrames % (fps * 3600)) / (fps * 60));
    const secs = Math.floor((totalFrames % (fps * 60)) / fps);
    const frames = totalFrames % fps;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
  };

  // Render canvas frame on state change or playback tick
  useEffect(() => {
    if (canvasRef.current) {
      videoEngine.renderFrame(canvasRef.current, currentClip, currentTime);
    }
  }, [currentClip, currentTime, isPlaying]);

  const handleSeek = (newSec) => {
    videoEngine.playScrubSound();
    if (onSeek) onSeek(newSec);
  };

  const handleStep = (dir) => {
    videoEngine.playScrubSound();
    if (onStepFrame) onStepFrame(dir);
  };

  const handleSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Palmier_Snapshot_f${Math.floor(currentTime * 24)}.png`;
    a.click();
  };

  return (
    <div className="palmier-preview-monitor">
      {/* Top Preview Bar */}
      <div className="preview-top-bar">
        <div className="preview-nav-left">
          <button className="preview-nav-btn"><ChevronLeft size={13} /></button>
          <button className="preview-nav-btn"><ChevronRight size={13} /></button>
          <span className="preview-nav-title">Timeline</span>
          <MoreHorizontal size={13} className="preview-more-icon" />
        </div>
      </div>

      {/* Main 16:9 Video Canvas Display */}
      <div className="preview-canvas-container">
        <div className="preview-canvas-frame">
          <canvas 
            ref={canvasRef}
            width={1920}
            height={1080}
            className="preview-viewport-canvas"
          />
        </div>
      </div>

      {/* Timecode & Transport Controls Bar */}
      <div className="preview-bottom-controls">
        {/* Amber / Gold Timecode matching palmier-ui.png */}
        <div className="preview-timecode-badge">
          <span className="tc-current">{formatTimecode(currentTime)}</span>
          <span className="tc-sep">/</span>
          <span className="tc-total">{formatTimecode(totalDuration)}</span>
        </div>

        {/* Transport Buttons */}
        <div className="preview-transport-group">
          <button 
            className="transport-btn" 
            onClick={() => handleSeek(0)}
            title="Go to Start (Home)"
          >
            <SkipBack size={13} />
          </button>
          <button 
            className="transport-btn" 
            onClick={() => handleStep(-1)}
            title="Step Back 1 Frame (Left Arrow)"
          >
            <StepBack size={13} />
          </button>
          <button 
            className="transport-btn play-btn" 
            onClick={() => {
              videoEngine.initAudio();
              if (onTogglePlay) onTogglePlay();
            }}
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          <button 
            className="transport-btn" 
            onClick={() => handleStep(1)}
            title="Step Forward 1 Frame (Right Arrow)"
          >
            <StepForward size={13} />
          </button>
          <button 
            className="transport-btn" 
            onClick={() => handleSeek(totalDuration)}
            title="Go to End (End)"
          >
            <SkipForward size={13} />
          </button>

          <button 
            className="transport-btn" 
            onClick={handleSnapshot}
            title="Capture Still Snapshot (PNG)"
          >
            <Camera size={13} />
          </button>
        </div>

        {/* Format Spec Pills */}
        <div className="preview-format-pills">
          <span className="spec-pill">16:9</span>
          <span className="spec-pill">24</span>
          <span className="spec-pill">FHD</span>
          <span className="spec-pill highlight">Fit</span>
        </div>
      </div>
    </div>
  );
}
