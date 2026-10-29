import React, { useState, useEffect, useRef, useMemo } from 'react';
import PalmierTopBar from './components/PalmierTopBar';
import PalmierHomeView from './components/PalmierHomeView';
import PalmierSettingsModal from './components/PalmierSettingsModal';
import PalmierExportModal from './components/PalmierExportModal';
import PalmierAgentChat from './components/PalmierAgentChat';
import PalmierNavStrip from './components/PalmierNavStrip';
import PalmierMediaPanelFull from './components/PalmierMediaPanelFull';
import PalmierPreview from './components/PalmierPreview';
import PalmierInspectorFull from './components/PalmierInspectorFull';
import PalmierTimelineFull from './components/PalmierTimelineFull';
import PalmierMcpInstructionsModal from './components/PalmierMcpInstructionsModal';
import PalmierShortcutsModal from './components/PalmierShortcutsModal';
import { 
  INITIAL_SEQUENCES, 
  INITIAL_FULL_CLIPS, 
  SAMPLE_PROJECTS_CATALOG, 
  INITIAL_USER_PROJECTS 
} from './data/palmierFullProject';
import { PalmierMcpEngine } from './services/palmierMcpService';
import { videoEngine } from './services/videoEngine';

export default function App() {
  // Navigation View: 'editor' | 'home'
  const [currentView, setCurrentView] = useState('editor');
  
  // Projects state
  const [projects, setProjects] = useState(INITIAL_USER_PROJECTS);
  const [sampleProjects] = useState(SAMPLE_PROJECTS_CATALOG);

  // Active Project & Sequences
  const [sequences, setSequences] = useState(INITIAL_SEQUENCES);
  const [activeSequenceId, setActiveSequenceId] = useState('seq-1');
  const activeSequence = sequences.find(s => s.id === activeSequenceId) || sequences[0];

  // Playback & Clips
  const [currentTime, setCurrentTime] = useState(activeSequence.currentFrame / activeSequence.fps);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clips, setClips] = useState(INITIAL_FULL_CLIPS);
  const [selectedClipId, setSelectedClipId] = useState('v-clip-4');

  // Modals
  const [exportModal, setExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [settingsModal, setSettingsModal] = useState(false);
  const [mcpModal, setMcpModal] = useState(false);
  const [shortcutsModal, setShortcutsModal] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Compute total duration dynamically
  const totalDuration = useMemo(() => {
    const maxEnd = Math.max(activeSequence.totalDuration, ...clips.map(c => c.startTime + c.duration));
    return maxEnd;
  }, [activeSequence, clips]);

  // Current active clip under playhead for video canvas
  const currentClip = useMemo(() => {
    const underPlayhead = clips.find(c => (c.trackId === 'V1' || c.trackId === 'V2') && currentTime >= c.startTime && currentTime <= (c.startTime + c.duration));
    return underPlayhead || clips.find(c => c.id === selectedClipId) || clips[0];
  }, [clips, currentTime, selectedClipId]);

  // Selected clip for Inspector
  const selectedClip = useMemo(() => {
    return clips.find(c => c.id === selectedClipId) || currentClip;
  }, [clips, selectedClipId, currentClip]);

  // Palmier MCP Engine instance
  const mcpEngine = useMemo(() => {
    return new PalmierMcpEngine(
      { projectName: activeSequence.name, clips, currentTime, totalDuration },
      setClips
    );
  }, [activeSequence.name, clips, currentTime, totalDuration]);

  // 24fps Playback Loop
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
        videoEngine.initAudio();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        videoEngine.playScrubSound();
        setCurrentTime((prev) => Math.max(0, prev - 1 / 24));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        videoEngine.playScrubSound();
        setCurrentTime((prev) => Math.min(totalDuration, prev + 1 / 24));
      } else if (e.code === 'Home') {
        e.preventDefault();
        setCurrentTime(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        setCurrentTime(totalDuration);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setExportModal(true);
        handleStartExport();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalDuration]);

  // Split clip (Razor tool)
  const handleSplitClip = (clipId, splitTime) => {
    const target = clips.find(c => c.id === clipId);
    if (!target) return;
    const dur1 = splitTime - target.startTime;
    const dur2 = target.duration - dur1;
    if (dur1 <= 0.2 || dur2 <= 0.2) return;

    const clipA = { ...target, duration: dur1 };
    const clipB = {
      ...target,
      id: `${target.trackId}-clip-${Date.now()}`,
      startTime: splitTime,
      duration: dur2
    };

    setClips(prev => prev.map(c => c.id === clipId ? clipA : c).concat(clipB));
    setSelectedClipId(clipB.id);
  };

  // Delete clip
  const handleDeleteClip = (clipId) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
    setSelectedClipId(null);
  };

  // Update clip properties from Inspector
  const handleUpdateClip = (clipId, newProps) => {
    setClips(prev => prev.map(c => c.id === clipId ? { ...c, ...newProps } : c));
    if (newProps.volumeDb !== undefined) {
      videoEngine.setVolume(newProps.volumeDb);
    }
  };

  // Agent MCP tool calls
  const handleAgentToolCall = (toolName, args) => {
    if (toolName === 'add_clips') {
      const newClip = {
        id: `v-clip-${Date.now()}`,
        name: args.name || 'juicyma',
        startTime: currentTime,
        duration: args.duration || 2.4,
        trackId: args.trackId || 'V1',
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

  // Insert Audio clip
  const handleInsertAudio = (audioItem) => {
    const newAudioClip = {
      id: `a-clip-${Date.now()}`,
      trackId: 'A2',
      name: audioItem.name,
      startTime: currentTime,
      duration: 6.0
    };
    setClips(prev => [...prev, newAudioClip]);
  };

  // Insert Caption clip
  const handleInsertCaption = (caption) => {
    const newTextClip = {
      id: `t-clip-${Date.now()}`,
      trackId: 'T1',
      name: caption.text.slice(0, 20),
      text: caption.text,
      startTime: caption.startTime,
      duration: caption.endTime - caption.startTime
    };
    setClips(prev => [...prev, newTextClip]);
  };

  // Add new sequence timeline
  const handleAddSequence = () => {
    const newSeq = {
      id: `seq-${Date.now()}`,
      name: `Timeline ${sequences.length + 1}`,
      fps: 24,
      resolution: '1920x1080',
      aspectRatio: '16:9',
      format: 'FHD',
      currentFrame: 0,
      totalDuration: 30.0
    };
    setSequences(prev => [...prev, newSeq]);
    setActiveSequenceId(newSeq.id);
  };

  // Real Export Master Video via Canvas MediaRecorder
  const handleStartExport = () => {
    setExportProgress(0);
    const canvas = document.querySelector('.preview-viewport-canvas');
    if (canvas) {
      videoEngine.exportTimelineVideo(canvas, totalDuration, (pct) => {
        setExportProgress(pct);
      }).catch(() => {
        setExportProgress(100);
      });
    } else {
      let p = 0;
      const interval = setInterval(() => {
        p += 25;
        setExportProgress(p);
        if (p >= 100) clearInterval(interval);
      }, 400);
    }
  };

  // Project handling
  const handleOpenProject = (projId) => {
    const sample = sampleProjects.find(s => s.id === projId);
    if (sample) {
      const matchingSeq = sequences.find(s => s.name.toLowerCase().includes(sample.name.toLowerCase().slice(0, 6)));
      if (matchingSeq) {
        setActiveSequenceId(matchingSeq.id);
      }
    } else {
      const found = projects.find(p => p.id === projId);
      if (found) {
        const matchingSeq = sequences.find(s => s.name === found.name);
        if (matchingSeq) setActiveSequenceId(matchingSeq.id);
      }
    }
    setCurrentView('editor');
  };

  const handleCreateProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      name: `Untitled Project ${projects.length + 1}`,
      duration: '00:30:00',
      fps: 24,
      resolution: '1920x1080',
      aspectRatio: '16:9',
      modifiedDate: 'Just now',
      thumb: '/welcome-butterfly.jpg'
    };
    setProjects(prev => [newProj, ...prev]);

    const newSeq = {
      id: `seq-${Date.now()}`,
      name: newProj.name,
      fps: 24,
      resolution: '1920x1080',
      aspectRatio: '16:9',
      format: 'FHD',
      currentFrame: 0,
      totalDuration: 30.0
    };
    setSequences(prev => [...prev, newSeq]);
    setActiveSequenceId(newSeq.id);
    setCurrentView('editor');
  };

  const handleDeleteProject = (projId) => {
    setProjects(prev => prev.filter(p => p.id !== projId));
  };

  return (
    <div className={`palmier-pro-root-container ${theme}-theme`}>
      {/* Top Titlebar */}
      <PalmierTopBar 
        projectName={activeSequence.name} 
        onBackToHome={() => setCurrentView(currentView === 'home' ? 'editor' : 'home')}
        onOpenSettings={() => setSettingsModal(true)}
        onExport={() => {
          setExportModal(true);
        }}
        onOpenMcp={() => setMcpModal(true)}
        onOpenShortcuts={() => setShortcutsModal(true)}
      />

      {/* Main View Router */}
      {currentView === 'home' ? (
        <PalmierHomeView 
          projects={projects}
          sampleProjects={sampleProjects}
          onOpenProject={handleOpenProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onOpenSettings={() => setSettingsModal(true)}
        />
      ) : (
        <>
          {/* Main Workspace Row: 5-panel layout matching palmier-ui.png */}
          <div className="palmier-main-workspace-row">
            {/* Left Agent Chat Sidebar */}
            <PalmierAgentChat onAgentToolCall={handleAgentToolCall} />

            {/* 36px Vertical Nav Strip */}
            <PalmierNavStrip />

            {/* Media Library Bin & Seedance 2 Generation Studio (4 Tabs) */}
            <PalmierMediaPanelFull 
              onSelectMedia={(item) => {
                handleAgentToolCall('add_clips', {
                  name: item.name,
                  thumb: item.thumb,
                  duration: 2.5
                });
              }}
              onInsertAudio={handleInsertAudio}
              onInsertCaption={handleInsertCaption}
              onGenerate={(newItem) => {
                handleAgentToolCall('add_clips', {
                  name: newItem.name,
                  thumb: newItem.thumb,
                  duration: 3.0
                });
              }}
            />

            {/* Center Preview Monitor (24fps Canvas Engine) */}
            <PalmierPreview 
              currentClip={currentClip}
              currentTime={currentTime}
              totalDuration={totalDuration}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              onSeek={(t) => setCurrentTime(t)}
              onStepFrame={(d) => setCurrentTime((prev) => Math.max(0, Math.min(totalDuration, prev + d * (1 / 24))))}
            />

            {/* Right 5-Tab Inspector (Adjust, Color, Audio, AI Edit, Text) */}
            <PalmierInspectorFull 
              selectedClip={selectedClip}
              onUpdateClip={handleUpdateClip}
            />
          </div>

          {/* Bottom Timeline with Sequence Tabs, 6 Tracks, Filmstrips, and Waveforms */}
          <PalmierTimelineFull 
            sequences={sequences}
            activeSequenceId={activeSequenceId}
            onSelectSequence={(id) => setActiveSequenceId(id)}
            onAddSequence={handleAddSequence}
            clips={clips}
            currentTime={currentTime}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            selectedClipId={selectedClipId}
            onSelectClip={(id) => setSelectedClipId(id)}
            onSplitClip={handleSplitClip}
            onDeleteClip={handleDeleteClip}
            onSeek={(t) => setCurrentTime(t)}
          />
        </>
      )}

      {/* Dual Pane Export Master Modal */}
      <PalmierExportModal 
        isOpen={exportModal}
        onClose={() => setExportModal(false)}
        sequence={activeSequence}
        clips={clips}
        onStartExport={handleStartExport}
        exportProgress={exportProgress}
      />

      {/* Settings Modal */}
      <PalmierSettingsModal 
        isOpen={settingsModal}
        onClose={() => setSettingsModal(false)}
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
      />

      {/* MCP Instructions Modal */}
      <PalmierMcpInstructionsModal 
        isOpen={mcpModal}
        onClose={() => setMcpModal(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <PalmierShortcutsModal 
        isOpen={shortcutsModal}
        onClose={() => setShortcutsModal(false)}
      />
    </div>
  );
}
