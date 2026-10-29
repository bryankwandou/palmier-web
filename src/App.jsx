import React, { useState, useEffect, useRef } from 'react';
import PalmierTopBar from './components/PalmierTopBar';
import PalmierAgentChat from './components/PalmierAgentChat';
import PalmierNavStrip from './components/PalmierNavStrip';
import PalmierMediaBin from './components/PalmierMediaBin';
import PalmierPreview from './components/PalmierPreview';
import PalmierInspector from './components/PalmierInspector';
import PalmierTimeline from './components/PalmierTimeline';
import { PALMIER_PROJECT } from './data/palmierSourceData';
import { Check, Download, X } from 'lucide-react';

export default function App() {
  const [projectName, setProjectName] = useState(PALMIER_PROJECT.name);
  const [currentTime, setCurrentTime] = useState(PALMIER_PROJECT.currentFrame / 24); // 7.958s -> 00:00:07:23
  const [isPlaying, setIsPlaying] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const totalDuration = PALMIER_PROJECT.totalDuration; // 33.541s -> 00:00:33:13

  // 24fps playback loop
  const lastTimeRef = useRef(performance.now());
  useEffect(() => {
    let animId;
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const tick = () => {
        const now = performance.now();
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
        animId = requestAnimationFrame(tick);
      };
      animId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, totalDuration]);

  // Spacebar play/pause shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 1 / 24));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(totalDuration, prev + 1 / 24));
      } else if (e.code === 'Home') {
        e.preventDefault();
        setCurrentTime(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        setCurrentTime(totalDuration);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalDuration]);

  const handleStartExport = () => {
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };

  return (
    <div className="palmier-pro-root-container">
      {/* Top Titlebar */}
      <PalmierTopBar 
        projectName={projectName} 
        onExport={() => {
          setExportModal(true);
          handleStartExport();
        }} 
      />

      {/* Main Workspace Row: 5-panel layout matching palmier-ui.png */}
      <div className="palmier-main-workspace-row">
        {/* Left Agent Chat Sidebar */}
        <PalmierAgentChat />

        {/* 36px Vertical Nav Strip */}
        <PalmierNavStrip />

        {/* Media Library Bin & Seedance 2 Generation Studio */}
        <PalmierMediaBin />

        {/* Center Preview Monitor */}
        <PalmierPreview 
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onSeek={(t) => setCurrentTime(t)}
          onStepFrame={(d) => setCurrentTime((prev) => Math.max(0, Math.min(totalDuration, prev + d * (1 / 24))))}
        />

        {/* Right Inspector */}
        <PalmierInspector />
      </div>

      {/* Bottom Timeline with Purple Clips, Filmstrips, and Neon Green Audio Waveforms */}
      <PalmierTimeline 
        currentTime={currentTime}
        totalDuration={totalDuration}
        onSeek={(t) => setCurrentTime(t)}
      />

      {/* Export Modal */}
      {exportModal && (
        <div className="export-modal-backdrop" onClick={() => setExportModal(false)}>
          <div className="export-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Export Master: {projectName}</span>
              <button className="modal-close" onClick={() => setExportModal(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="modal-body">
              <div className="export-meta-row">
                <span>Preset: Apple ProRes 422 HQ</span>
                <span>1920x1080 @ 24fps</span>
              </div>
              <div className="export-progress-container">
                <div className="progress-bar-fill" style={{ width: `${exportProgress}%` }} />
              </div>
              <div className="export-status-label">
                {exportProgress < 100 ? `Rendering frames... ${exportProgress}%` : 'Export Complete! Ready for delivery.'}
              </div>
            </div>
            <div className="modal-footer">
              {exportProgress === 100 && (
                <button className="export-download-btn" onClick={() => setExportModal(false)}>
                  <Download size={13} />
                  <span>Download MP4</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
