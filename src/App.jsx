import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MediaBin from './components/MediaBin';
import AIGenerativeStudio from './components/AIGenerativeStudio';
import MCPAgentConsole from './components/MCPAgentConsole';
import PreviewMonitor from './components/PreviewMonitor';
import Timeline from './components/Timeline';
import Inspector from './components/Inspector';
import { INITIAL_TRACKS, INITIAL_CLIPS, MEDIA_LIBRARY } from './data/initialProject';
import { Film, Sparkles, Bot, Layers, Download, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [projectName, setProjectName] = useState('Palmier Pro — Project Alpha');
  const [resolution, setResolution] = useState('1920x1080');
  const [fps, setFps] = useState(30);

  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [clips, setClips] = useState(INITIAL_CLIPS);
  const [mediaList, setMediaList] = useState(MEDIA_LIBRARY);

  const [currentTime, setCurrentTime] = useState(2.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState('clip-1');
  const [activeDrawerTab, setActiveDrawerTab] = useState('media'); // 'media' | 'ai' | 'mcp'

  const [exportModal, setExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Compute total timeline duration
  const totalDuration = Math.max(
    18,
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in inputs/textareas
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

  const handleInsertMedia = (media) => {
    const newClip = {
      id: `clip-media-${Date.now()}`,
      name: media.name,
      trackId: media.type === 'audio' ? 'A1' : 'V1',
      startTime: currentTime,
      duration: media.duration || 6.0,
      type: media.type,
      posterUrl: media.thumbnail,
      opacity: 1,
      scale: 1,
      volume: 1,
      speed: 1,
    };
    setClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
  };

  const handleGenerateClip = (aiClip) => {
    const positionedClip = {
      ...aiClip,
      startTime: currentTime,
    };
    setClips((prev) => [...prev, positionedClip]);
    setSelectedClipId(positionedClip.id);
  };

  // MCP action dispatcher
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
        name: action.text,
        trackId: 'T1',
        startTime: currentTime,
        duration: 4.0,
        type: 'text',
        text: action.text,
        fontSize: 26,
        color: '#ffffff',
      };
      setClips((prev) => [...prev, titleClip]);
      setSelectedClipId(titleClip.id);
    } else if (action.type === 'DELETE_SELECTED') {
      if (selectedClipId) {
        handleDeleteClip(selectedClipId);
      }
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
        return p + 15;
      });
    }, 200);
  };

  return (
    <div className="palmier-root">
      {/* Top Application Header */}
      <Header 
        projectName={projectName}
        setProjectName={setProjectName}
        resolution={resolution}
        setResolution={setResolution}
        fps={fps}
        setFps={setFps}
        onExport={handleStartExport}
      />

      {/* Main Split Workspace */}
      <div className="palmier-workspace">
        {/* Left Drawer (Media Bin, AI Generation, MCP Agent Console) */}
        <aside className="palmier-left-drawer">
          <div className="drawer-tabs">
            <button 
              className={`drawer-tab-btn ${activeDrawerTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveDrawerTab('media')}
            >
              <Film size={14} />
              <span>Assets</span>
            </button>

            <button 
              className={`drawer-tab-btn ${activeDrawerTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveDrawerTab('ai')}
            >
              <Sparkles size={14} />
              <span>AI Studio</span>
            </button>

            <button 
              className={`drawer-tab-btn ${activeDrawerTab === 'mcp' ? 'active' : ''}`}
              onClick={() => setActiveDrawerTab('mcp')}
            >
              <Bot size={14} />
              <span>MCP Agent</span>
            </button>
          </div>

          <div className="drawer-content">
            {activeDrawerTab === 'media' && (
              <MediaBin 
                mediaList={mediaList}
                onAddMedia={(newAsset) => setMediaList((prev) => [newAsset, ...prev])}
                onInsertToTimeline={handleInsertMedia}
              />
            )}

            {activeDrawerTab === 'ai' && (
              <AIGenerativeStudio 
                onGenerateClip={handleGenerateClip}
              />
            )}

            {activeDrawerTab === 'mcp' && (
              <MCPAgentConsole 
                onExecuteMcpAction={handleExecuteMcpAction}
                currentTime={currentTime}
                clipsCount={clips.length}
              />
            )}
          </div>
        </aside>

        {/* Center Stage (Monitor + Multi-Track Timeline) */}
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
          />
        </main>

        {/* Right Inspector Panel */}
        <Inspector 
          clip={selectedClip}
          onUpdateClip={handleUpdateClip}
        />
      </div>

      {/* Export Render Modal */}
      {exportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            width: '420px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Film size={22} color="var(--accent-blue)" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Exporting {projectName}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ProRes 422 / H.265 Master ({resolution} @ {fps}fps)</p>
              </div>
            </div>

            <div style={{ width: '100%', background: 'var(--bg-app)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${exportProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-emerald))', transition: 'width 0.2s ease' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>{exportProgress < 100 ? 'Encoding video streams & audio stems...' : 'Render completed successfully!'}</span>
              <span>{exportProgress}%</span>
            </div>

            {exportProgress === 100 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    const blob = new Blob([`PALMIER PRO VIDEO EXPORT\nProject: ${projectName}\nResolution: ${resolution}\nFramerate: ${fps}fps`], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${projectName.replace(/\s+/g, '_')}_master.txt`;
                    a.click();
                    setExportModal(false);
                  }}
                >
                  <Download size={14} />
                  <span>Download Master File</span>
                </button>
                <button 
                  className="btn-icon" 
                  style={{ padding: '8px 16px', background: 'var(--bg-panel-secondary)' }}
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
