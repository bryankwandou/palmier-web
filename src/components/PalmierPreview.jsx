import React, { useRef, useEffect, useState } from 'react';
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
  Camera,
  Activity
} from 'lucide-react';
import { videoEngine } from '../services/videoEngine';

export default function PalmierPreview({ 
  clips = [],
  activeSequence = { fps: 24, resolution: '1920x1080', aspectRatio: '16:9' },
  currentTime = 7.958,
  totalDuration = 33.541,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  onStepFrame
}) {
  const canvasRef = useRef(null);
  const [vuLevels, setVuLevels] = useState({ left: 35, right: 38 });

  // Format frames to standard timecode HH:MM:SS:FF at sequence fps
  const formatTimecode = (seconds) => {
    const fps = activeSequence?.fps || 24;
    const totalFrames = Math.floor(seconds * fps);
    const hrs = Math.floor(totalFrames / (fps * 3600));
    const mins = Math.floor((totalFrames % (fps * 3600)) / (fps * 60));
    const secs = Math.floor((totalFrames % (fps * 60)) / fps);
    const frames = totalFrames % fps;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
  };

  // Render canvas frame on any state change or playback tick
  useEffect(() => {
    if (canvasRef.current) {
      videoEngine.renderFrame(canvasRef.current, clips, currentTime, activeSequence);
    }
  }, [clips, currentTime, isPlaying, activeSequence]);

  // Stereo VU meters loop
  useEffect(() => {
    let animId;
    if (isPlaying) {
      const updateVu = () => {
        const wf = videoEngine.getLiveWaveformData();
        if (wf) {
          const avgL = wf.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
          const avgR = wf.slice(20, 40).reduce((a, b) => a + b, 0) / 20;
          const leftPct = Math.min(100, Math.max(10, (avgL / 255) * 100));
          const rightPct = Math.min(100, Math.max(10, (avgR / 255) * 100));
          setVuLevels({ left: leftPct, right: rightPct });
        } else {
          setVuLevels({
            left: 40 + Math.random() * 30,
            right: 42 + Math.random() * 30
          });
        }
        animId = requestAnimationFrame(updateVu);
      };
      animId = requestAnimationFrame(updateVu);
    } else {
      setVuLevels({ left: 0, right: 0 });
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

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
    a.download = `Palmier_Snapshot_f${Math.floor(currentTime * (activeSequence?.fps || 24))}.png`;
    a.click();
  };

  // Determine canvas width and height based on aspect ratio
  const isVertical = activeSequence?.aspectRatio === '9:16';
  const isCinemascope = activeSequence?.aspectRatio === '21:9';
  const canvasW = isVertical ? 1080 : isCinemascope ? 2560 : 1920;
  const canvasH = isVertical ? 1920 : 1080;
  const frameAspect = isVertical ? '9/16' : isCinemascope ? '21/9' : '16/9';

  return (
    <div className="palmier-preview-monitor">
      {/* Top Preview Bar */}
      <div className="preview-top-bar">
        <div className="preview-nav-left">
          <button className="preview-nav-btn"><ChevronLeft size={13} /></button>
          <button className="preview-nav-btn"><ChevronRight size={13} /></button>
          <span className="preview-nav-title">Timeline ({activeSequence?.name || 'Aesthetic video'})</span>
          <MoreHorizontal size={13} className="preview-more-icon" />
        </div>

        <div className="preview-nav-right">
          <span className="preview-aspect-tag">{activeSequence?.resolution || '1920x1080'}</span>
        </div>
      </div>

      {/* Main Multi-Layer Video Canvas Display */}
      <div className="preview-canvas-container">
        <div className="preview-canvas-frame" style={{ aspectRatio: frameAspect }}>
          <canvas 
            ref={canvasRef}
            width={canvasW}
            height={canvasH}
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
            title="Snapshot Frame (PNG)"
          >
            <Camera size={13} />
          </button>
        </div>

        {/* Stereo Audio VU Meters (Left / Right Peak) */}
        <div className="preview-stereo-vu-meter" title="Master Audio Peak Meter (Stereo L/R)">
          <div className="vu-channel">
            <span className="vu-label">L</span>
            <div className="vu-meter-bar">
              <div 
                className="vu-fill" 
                style={{ width: `${isPlaying ? vuLevels.left : 0}%` }} 
              />
            </div>
          </div>
          <div className="vu-channel">
            <span className="vu-label">R</span>
            <div className="vu-meter-bar">
              <div 
                className="vu-fill" 
                style={{ width: `${isPlaying ? vuLevels.right : 0}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
