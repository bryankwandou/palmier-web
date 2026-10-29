import React, { useState, useEffect, useRef, useMemo } from 'react';
import PalmierTopBar from './components/PalmierTopBar';
import PalmierAgentChat from './components/PalmierAgentChat';
import PalmierNavStrip from './components/PalmierNavStrip';
import PalmierMediaBin from './components/PalmierMediaBin';
import PalmierPreview from './components/PalmierPreview';
import PalmierInspector from './components/PalmierInspector';
import PalmierTimeline from './components/PalmierTimeline';
import { PALMIER_PROJECT, TIMELINE_CLIPS_SOURCE } from './data/palmierSourceData';
import { PalmierMcpEngine } from './services/palmierMcpService';
import { Download, X } from 'lucide-react';

export default function App() {
  const [projectName, setProjectName] = useState(PALMIER_PROJECT.name);
  const [currentTime, setCurrentTime] = useState(PALMIER_PROJECT.currentFrame / 24); // 7.958s -> 00:00:07:23
  const [isPlaying, setIsPlaying] = useState(false);
  const [clips, setClips] = useState(TIMELINE_CLIPS_SOURCE);
  const [selectedClipId, setSelectedClipId] = useState('v-clip-4'); // currently visible clip at 7.958s
  const [exportModal, setExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Compute total duration dynamically from clips
  const totalDuration = useMemo(() => {
    const maxEnd = Math.max(33.541, ...clips.map(c => c.startTime + c.duration));
    return maxEnd;
  }, [clips]);

  // Current active clip under playhead
  const currentClip = useMemo(() => {
    const underPlayhead = clips.find(c => c.trackId === 'V1' && currentTime >= c.startTime && currentTime <= (c.startTime + c.duration));
    return underPlayhead || clips.find(c => c.id === selectedClipId) || clips[0];
  }, [clips, currentTime, selectedClipId]);

  // Selected clip for Inspector
  const selectedClip = useMemo(() => {
    return clips.find(c => c.id === selectedClipId) || currentClip;
  }, [clips, selectedClipId, currentClip]);

  // Initialize Palmier MCP Engine
  const mcpEngine = useMemo(() => {
    return new PalmierMcpEngine(
      { projectName, clips, currentTime, totalDuration },
      setClips
    );
  }, [projectName, clips, currentTime, totalDuration]);

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

  // Spacebar and shuttle shortcuts
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

  // Razor split handler
  const handleSplitClip = (clipId, splitTime) => {
    const target = clips.find(c => c.id === clipId);
    if (!target) return;
    const dur1 = splitTime - target.startTime;
    const dur2 = target.duration - dur1;
    if (dur1 <= 0.2 || dur2 <= 0.2) return;

    const clipA = { ...target, duration: dur1 };
    const clipB = {
      ...target,
      id: `v-clip-${Date.now()}`,
      startTime: splitTime,
      duration: dur2
    };

    setClips(prev => prev.map(c => c.id === clipId ? clipA : c).concat(clipB));
    setSelectedClipId(clipB.id);
  };

  // Delete clip handler
  const handleDeleteClip = (clipId) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
    setSelectedClipId(null);
  };

  // Update clip properties from Inspector
  const handleUpdateClip = (clipId, newProps) => {
    setClips(prev => prev.map(c => c.id === clipId ? { ...c, ...newProps } : c));
  };

  // Agent MCP tool execution callback
  const handleAgentToolCall = (toolName, args) => {
    if (toolName === 'add_clips') {
      const newClip = {
        id: `v-clip-${Date.now()}`,
        name: args.name || 'juicyma',
        startTime: currentTime,
        duration: args.duration || 2.4,
        trackId: 'V1',
        thumb: args.thumb || '/welcome-butterfly.jpg'
      };
      setClips(prev => [...prev, newClip]);
      setSelectedClipId(newClip.id);
    } else if (toolName === 'apply_color') {
      if (selectedClipId) {
        handleUpdateClip(selectedClipId, {
          solarize: args.solarize,
          grain: args.grain
        });
      }
    }
  };

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
        <PalmierAgentChat onAgentToolCall={handleAgentToolCall} />

        {/* 36px Vertical Nav Strip */}
        <PalmierNavStrip />

        {/* Media Library Bin & Seedance 2 Generation Studio */}
        <PalmierMediaBin 
          onSelectMedia={(item) => {
            handleAgentToolCall('add_clips', {
              name: item.name,
              thumb: item.thumb,
              duration: 2.5
            });
          }}
          onGenerate={(newItem) => {
            handleAgentToolCall('add_clips', {
              name: newItem.name,
              thumb: newItem.thumb,
              duration: 3.0
            });
          }}
        />

        {/* Center Preview Monitor */}
        <PalmierPreview 
          currentClip={currentClip}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onSeek={(t) => setCurrentTime(t)}
          onStepFrame={(d) => setCurrentTime((prev) => Math.max(0, Math.min(totalDuration, prev + d * (1 / 24))))}
        />

        {/* Right Inspector */}
        <PalmierInspector 
          selectedClip={selectedClip}
          onUpdateClip={handleUpdateClip}
        />
      </div>

      {/* Bottom Timeline with Purple Clips, Filmstrips, and Neon Green Audio Waveforms */}
      <PalmierTimeline 
        clips={clips}
        currentTime={currentTime}
        totalDuration={totalDuration}
        selectedClipId={selectedClipId}
        onSelectClip={(id) => setSelectedClipId(id)}
        onSplitClip={handleSplitClip}
        onDeleteClip={handleDeleteClip}
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
