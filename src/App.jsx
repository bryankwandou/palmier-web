import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MediaPanelContainer from './components/MediaPanel/MediaPanelContainer';
import PreviewMonitor from './components/PreviewMonitor';
import Timeline from './components/Timeline';
import Inspector from './components/Inspector';
import AgentSidebar from './components/AgentSidebar/AgentSidebar';
import { 
  INITIAL_TRACKS, 
  INITIAL_CLIPS, 
  MEDIA_LIBRARY, 
  INITIAL_MARKERS,
  CAPTION_TEMPLATES 
} from './data/projectData';
import { Film, Download, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [projectName, setProjectName] = useState('Palmier Pro — Project Alpha');
  const [activeLayout, setActiveLayout] = useState('editing'); // 'editing' | 'color' | 'audio' | 'captions' | 'ai-studio'
  const [resolution, setResolution] = useState('1920x1080');
  const [fps, setFps] = useState(30);

  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [clips, setClips] = useState(INITIAL_CLIPS);
  const [mediaList, setMediaList] = useState(MEDIA_LIBRARY);
  const [markers, setMarkers] = useState(INITIAL_MARKERS);

  const [currentTime, setCurrentTime] = useState(2.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState('clip-1');
  const [showAgentSidebar, setShowAgentSidebar] = useState(true);

  const [exportModal, setExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Compute total timeline duration
  const totalDuration = Math.max(
    24,
    ...clips.map((c) => c.startTime + c.duration)
  );

  // Playhead animation loop
  const lastTimeRef = useRef(performance.now());
  useEffect(() => {
    let animId;
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const tick = () => {
        const now = performance.now();
        const deltaSec = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + deltaSec;
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

  // Global Keyboard shortcuts (Space, Split S, Delete, Frame arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (selectedClipId) {
          handleSplitClip(selectedClipId, currentTime);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 1 / fps));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(totalDuration, t + 1 / fps));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, currentTime, fps, totalDuration]);

  // Find active video and text clips at playhead
  const activeVideoClip = clips.find(
    (c) => (c.trackId === 'V1' || c.trackId === 'V2') &&
           currentTime >= c.startTime && 
           currentTime < c.startTime + c.duration
  );

  const activeTextClip = clips.find(
    (c) => c.trackId === 'T1' &&
           currentTime >= c.startTime && 
           currentTime < c.startTime + c.duration
  );

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  // Clip actions
  const handleUpdateClip = (id, updates) => {
    if (!id && !updates) {
      setClips([...clips]);
      return;
    }
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteClip = (id) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (selectedClipId === id) setSelectedClipId(null);
  };

  const handleSplitClip = (clipId, splitTime) => {
    const target = clips.find((c) => c.id === clipId);
    if (!target) return;
    if (splitTime <= target.startTime || splitTime >= target.startTime + target.duration) return;

    const firstDuration = splitTime - target.startTime;
    const secondDuration = target.duration - firstDuration;

    const updatedFirst = { ...target, duration: firstDuration };
    const secondClip = {
      ...target,
      id: `${target.id}-split-${Date.now()}`,
      name: `${target.name} (Part 2)`,
      startTime: splitTime,
      duration: secondDuration,
    };

    setClips((prev) => [
      ...prev.map((c) => (c.id === clipId ? updatedFirst : c)),
      secondClip,
    ]);
    setSelectedClipId(secondClip.id);
  };

  const handleDuplicateClip = (clipId) => {
    const target = clips.find((c) => c.id === clipId);
    if (!target) return;

    const duplicated = {
      ...target,
      id: `clip-dup-${Date.now()}`,
      name: `${target.name} (Copy)`,
      startTime: target.startTime + target.duration + 0.2,
    };

    setClips((prev) => [...prev, duplicated]);
    setSelectedClipId(duplicated.id);
  };

  const handleInsertMedia = (media) => {
    const newClip = {
      id: `clip-media-${Date.now()}`,
      name: media.name,
      trackId: media.type === 'audio' ? 'A1' : media.type === 'image' ? 'V2' : 'V1',
      startTime: currentTime,
      duration: media.duration || 6.0,
      type: media.type,
      posterUrl: media.thumbnail,
      opacity: 1,
      scale: 1,
      volume: 1,
      speed: 1,
      exposure: 0,
      contrast: 0,
      saturation: 0,
      temp: 0,
      tint: 0
    };
    setClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
  };

  const handleApplyCaptionTemplate = (template) => {
    const captionClip = {
      id: `caption-${Date.now()}`,
      name: `Viral Captions (${template.name})`,
      trackId: 'T1',
      startTime: currentTime,
      duration: 5.0,
      type: 'text',
      text: 'AI Video Editor Built For Agents',
      color: template.color,
      textAnim: template.anim,
      fontSize: 28,
      fontWeight: '800'
    };
    setClips((prev) => [...prev, captionClip]);
    setSelectedClipId(captionClip.id);
  };

  const handleAutoTranscribe = () => {
    const caption1 = {
      id: `transcribe-1-${Date.now()}`,
      name: 'Subtitle: Welcome to Palmier Pro',
      trackId: 'T1',
      startTime: 0.5,
      duration: 3.2,
      type: 'text',
      text: 'Welcome to Palmier Pro.',
      color: '#facc15',
      fontSize: 26,
      textAnim: 'pop'
    };

    const caption2 = {
      id: `transcribe-2-${Date.now()}`,
      name: 'Subtitle: First editor built for agents',
      trackId: 'T1',
      startTime: 4.0,
      duration: 5.0,
      type: 'text',
      text: 'The first video editor built for AI agents.',
      color: '#ffffff',
      fontSize: 26,
      textAnim: 'pop'
    };

    setClips((prev) => [...prev, caption1, caption2]);
  };

  // MCP action dispatcher from Palmier Agent Copilot
  const handleExecuteMcpAction = (action) => {
    if (action.type === 'SPLIT_PLAYHEAD') {
      const clipUnderPlayhead = clips.find(
        (c) => currentTime > c.startTime && currentTime < c.startTime + c.duration
      );
      if (clipUnderPlayhead) {
        handleSplitClip(clipUnderPlayhead.id, currentTime);
      }
    } else if (action.type === 'APPLY_COLOR_GRADE') {
      if (selectedClipId) {
        handleUpdateClip(selectedClipId, {
          contrast: 25,
          saturation: 35,
          exposure: 5,
        });
      }
    } else if (action.type === 'ADD_TITLE') {
      const titleClip = {
        id: `title-${Date.now()}`,
        name: action.payload?.text || 'Palmier Title',
        trackId: 'T1',
        startTime: currentTime,
        duration: 4.5,
        type: 'text',
        text: action.payload?.text || 'Palmier Title',
        fontSize: 28,
        color: '#facc15',
      };
      setClips((prev) => [...prev, titleClip]);
      setSelectedClipId(titleClip.id);
    } else if (action.type === 'ADD_BROLL') {
      const brollClip = {
        id: `broll-${Date.now()}`,
        name: 'Neural Matrix 4K B-Roll',
        trackId: 'V2',
        startTime: currentTime,
        duration: 4.5,
        type: 'video',
        posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
        scale: 1,
        opacity: 0.95
      };
      setClips((prev) => [...prev, brollClip]);
      setSelectedClipId(brollClip.id);
    } else if (action.type === 'SCORE_MUSIC') {
      const musicClip = {
        id: `music-${Date.now()}`,
        name: 'Cyberpunk Ambient Master Stem',
        trackId: 'A2',
        startTime: currentTime,
        duration: 8.0,
        type: 'audio',
        volume: 0.75,
        fadeIn: 0.8,
        fadeOut: 0.8
      };
      setClips((prev) => [...prev, musicClip]);
      setSelectedClipId(musicClip.id);
    }
  };

  const handleStartExport = () => {
    setExportModal(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 20;
      });
    }, 180);
  };

  return (
    <div className="palmier-root">
      {/* 1. Top Application Header matching Palmier Pro Toolbar */}
      <Header 
        projectName={projectName}
        setProjectName={setProjectName}
        activeLayout={activeLayout}
        setActiveLayout={setActiveLayout}
        resolution={resolution}
        setResolution={setResolution}
        fps={fps}
        setFps={setFps}
        showAgentSidebar={showAgentSidebar}
        setShowAgentSidebar={setShowAgentSidebar}
        onExport={handleStartExport}
      />

      {/* 2. Main 5-Panel Workspace */}
      <div className="palmier-workspace">
        {/* Left Panel: MediaPanelContainer (Media, Audio/SFX, Captions, Index) */}
        <aside className="palmier-left-drawer">
          <MediaPanelContainer 
            mediaList={mediaList}
            onAddMedia={(newAsset) => setMediaList((prev) => [newAsset, ...prev])}
            onInsertToTimeline={handleInsertMedia}
            markers={markers}
            onSeek={(t) => setCurrentTime(t)}
            onApplyCaptionTemplate={handleApplyCaptionTemplate}
            onAutoTranscribe={handleAutoTranscribe}
          />
        </aside>

        {/* Center Stage: Preview Monitor & Timeline */}
        <main className="palmier-stage">
          <PreviewMonitor 
            currentTime={currentTime}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onSeek={(t) => setCurrentTime(t)}
            fps={fps}
            activeVideoClip={activeVideoClip}
            activeTextClip={activeTextClip}
            selectedClip={selectedClip}
          />

          <Timeline 
            tracks={tracks}
            clips={clips}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onSeek={(t) => setCurrentTime(t)}
            selectedClipId={selectedClipId}
            onSelectClip={(id) => setSelectedClipId(id)}
            onUpdateClip={handleUpdateClip}
            onDeleteClip={handleDeleteClip}
            onSplitClip={handleSplitClip}
            onDuplicateClip={handleDuplicateClip}
          />
        </main>

        {/* Right Inspector Panel matching Palmier Pro 5 Tabs */}
        <Inspector 
          clip={selectedClip}
          onUpdateClip={handleUpdateClip}
        />

        {/* Rightmost Copilot Sidebar matching Palmier Pro AgentPanelView.swift */}
        {showAgentSidebar && (
          <AgentSidebar 
            onExecuteMcpAction={handleExecuteMcpAction}
            currentTime={currentTime}
            clipsCount={clips.length}
            onClose={() => setShowAgentSidebar(false)}
          />
        )}
      </div>

      {/* 3. Export Modal with ProRes 422 / H.265 Master Exporter */}
      {exportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '450px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Film size={22} color="var(--accent-blue)" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Exporting {projectName}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ProRes 422 / H.265 Master ({resolution} @ {fps}fps)</p>
              </div>
            </div>

            <div style={{ width: '100%', background: 'var(--bg-app)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${exportProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-emerald))', transition: 'width 0.2s ease' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span>{exportProgress < 100 ? 'Encoding video streams & audio stems...' : 'Master export completed successfully!'}</span>
              <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{exportProgress}%</span>
            </div>

            {exportProgress === 100 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, justifyContent: 'center', gap: '6px' }}
                  onClick={() => {
                    const blob = new Blob([
                      `<?xml version="1.0" encoding="UTF-8"?>\n<fcpxml version="1.9">\n  <project name="${projectName}">\n    <sequence duration="${totalDuration}s" format="${resolution}" fps="${fps}">\n      <timeline clips="${clips.length}"/>\n    </sequence>\n  </project>\n</fcpxml>`
                    ], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${projectName.replace(/\s+/g, '_')}_master.fcpxml`;
                    a.click();
                    setExportModal(false);
                  }}
                >
                  <Download size={14} />
                  <span>Download FCPXML / Master</span>
                </button>
                <button 
                  className="btn-icon" 
                  style={{ padding: '8px 16px', background: 'var(--bg-panel-secondary)', height: 'auto' }}
                  onClick={() => setExportModal(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
