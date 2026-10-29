import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Sparkles, 
  Search, 
  LayoutGrid, 
  ChevronRight, 
  ChevronDown, 
  RotateCw,
  Folder,
  Music,
  FileText,
  Play,
  Pause,
  Sliders,
  Check
} from 'lucide-react';
import { FULL_MEDIA_ITEMS, AUDIO_LIBRARY_ITEMS, TRANSCRIPT_CAPTIONS, AI_MODELS_CATALOG } from '../data/palmierFullProject';
import { videoEngine } from '../services/videoEngine';

export default function PalmierMediaPanelFull({ 
  onSelectMedia, 
  onInsertAudio, 
  onInsertCaption,
  onGenerate 
}) {
  const [activeTab, setActiveTab] = useState('media'); // 'media' | 'audio' | 'captions' | 'studio'
  const [items, setItems] = useState(FULL_MEDIA_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS_CATALOG[0]);
  const [promptText, setPromptText] = useState('extreme macro close-up iridescent butterfly wing scales shimmer, cinematic lighting, 8k');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const filteredMedia = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === 'All' || item.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const handleToggleAudio = (audio) => {
    videoEngine.initAudio();
    if (playingAudioId === audio.id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(audio.id);
      videoEngine.playScrubSound();
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newItem = {
        id: `m-${Date.now()}`,
        name: `juicy...${selectedModel.name.slice(0, 4)}_${Math.floor(Math.random() * 9000 + 1000)}`,
        folder: 'AI Renders',
        duration: '47,780',
        thumb: '/welcome-butterfly.jpg',
        type: 'video'
      };
      setItems(prev => [newItem, ...prev]);
      setIsGenerating(false);
      if (onGenerate) onGenerate(newItem);
    }, 1200);
  };

  const handleFileImport = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');

      if (isVideo) {
        const vid = document.createElement('video');
        vid.src = url;
        vid.onloadeddata = () => { vid.currentTime = 0.5; };
        vid.onseeked = () => {
          const offCanvas = document.createElement('canvas');
          offCanvas.width = 320;
          offCanvas.height = 180;
          const ctx = offCanvas.getContext('2d');
          ctx.drawImage(vid, 0, 0, 320, 180);
          const thumbUrl = offCanvas.toDataURL('image/jpeg');

          const newItem = {
            id: `m-${Date.now()}`,
            name: file.name.slice(0, 16),
            folder: 'Imported',
            duration: `${Math.floor(vid.duration * 1000)}`,
            thumb: thumbUrl,
            type: 'video'
          };
          setItems(prev => [newItem, ...prev]);
          if (onSelectMedia) onSelectMedia(newItem);
        };
      } else {
        const newItem = {
          id: `m-${Date.now()}`,
          name: file.name.slice(0, 16),
          folder: 'Imported',
          duration: '47,780',
          thumb: url,
          type: 'image'
        };
        setItems(prev => [newItem, ...prev]);
        if (onSelectMedia) onSelectMedia(newItem);
      }
    });
  };

  return (
    <div className="palmier-media-bin">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="video/*,image/*,audio/*" 
        multiple 
        onChange={handleFileImport}
      />

      {/* Media Panel Tabs Bar matching Sources/PalmierPro/MediaPanel */}
      <div className="media-panel-tabs-bar">
        <button 
          className={`mp-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <Folder size={12} />
          <span>Media</span>
        </button>

        <button 
          className={`mp-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <Music size={12} />
          <span>Audio</span>
        </button>

        <button 
          className={`mp-tab-btn ${activeTab === 'captions' ? 'active' : ''}`}
          onClick={() => setActiveTab('captions')}
        >
          <FileText size={12} />
          <span>Captions</span>
        </button>

        <button 
          className={`mp-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Sparkles size={12} />
          <span>AI Studio</span>
        </button>
      </div>

      {/* TAB 1: MEDIA LIBRARY */}
      {activeTab === 'media' && (
        <div className="media-tab-content">
          <div className="media-bin-top-header">
            <div className="header-action-buttons">
              <button 
                className="bin-btn btn-import"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Import files from disk"
              >
                <Plus size={13} />
                <span>Import</span>
              </button>
              <button 
                className="bin-btn btn-sparkle" 
                onClick={() => setActiveTab('studio')}
              >
                <Sparkles size={13} />
                <span>Generate</span>
              </button>
            </div>

            <div className="header-search-and-view">
              <div className="bin-search-box">
                <Search size={12} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bin-view-toggle">
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          {/* Folder Pills */}
          <div className="folder-filter-pills">
            {['All', 'Animals', 'B-Roll', 'AI Renders'].map(f => (
              <button 
                key={f}
                className={`folder-pill ${activeFolder === f ? 'active' : ''}`}
                onClick={() => setActiveFolder(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 3-Column Grid */}
          <div className="media-bin-grid">
            {filteredMedia.map((item) => (
              <div 
                key={item.id} 
                className="media-grid-card"
                onClick={() => onSelectMedia && onSelectMedia(item)}
                title={`${item.name} (Click to insert into timeline)`}
              >
                <div className="card-thumb-wrap">
                  <img src={item.thumb} alt={item.name} />
                  <span className="thumb-duration-badge">{item.duration}</span>
                </div>
                <div className="card-caption">
                  <span className="card-title">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIO LIBRARY */}
      {activeTab === 'audio' && (
        <div className="audio-tab-content">
          <div className="audio-list-header">
            <span className="section-title">SFX & CINEMATIC MUSIC</span>
          </div>

          <div className="audio-items-list">
            {AUDIO_LIBRARY_ITEMS.map((aud) => (
              <div key={aud.id} className="audio-item-row">
                <button 
                  className="audio-play-btn"
                  onClick={() => handleToggleAudio(aud)}
                >
                  {playingAudioId === aud.id ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <div className="audio-item-info">
                  <span className="audio-name">{aud.name}</span>
                  <span className="audio-meta">{aud.category} · {aud.duration} · {aud.format}</span>
                </div>
                <button 
                  className="audio-add-btn"
                  onClick={() => onInsertAudio && onInsertAudio(aud)}
                  title="Add to timeline audio track"
                >
                  <Plus size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CAPTIONS & TRANSCRIPT */}
      {activeTab === 'captions' && (
        <div className="captions-tab-content">
          <div className="captions-top-actions">
            <button className="captions-generate-btn">
              <Sparkles size={12} />
              <span>Auto-Transcribe Audio (Speech-to-Text)</span>
            </button>
          </div>

          <div className="transcript-list">
            {TRANSCRIPT_CAPTIONS.map((cap) => (
              <div 
                key={cap.id} 
                className="transcript-card"
                onClick={() => onInsertCaption && onInsertCaption(cap)}
                title="Click to insert as Title clip on T1"
              >
                <span className="tc-stamp">[{cap.startTime.toFixed(1)}s - {cap.endTime.toFixed(1)}s]</span>
                <p className="transcript-text">{cap.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI STUDIO */}
      {activeTab === 'studio' && (
        <div className="studio-tab-content">
          {/* SOTA Model Selector */}
          <div className="studio-models-selector">
            <span className="section-title">SELECT AI MODEL</span>
            <div className="models-chips-row">
              {AI_MODELS_CATALOG.map((m) => (
                <button 
                  key={m.id}
                  className={`model-chip ${selectedModel.id === m.id ? 'active' : ''}`}
                  onClick={() => setSelectedModel(m)}
                >
                  <span className="chip-name">{m.name}</span>
                  <span className="chip-res">{m.maxRes}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seedance Frames */}
          <div className="seedance-frames-row">
            <div className="seedance-frame-card active">
              <img src="/welcome-butterfly.jpg" alt="First Frame" />
              <span className="frame-label">First Frame</span>
            </div>
            <div 
              className="seedance-frame-card empty"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              title="Add Last Frame from Computer"
              style={{ cursor: 'pointer' }}
            >
              <Plus size={16} />
              <span className="frame-label">Last Frame</span>
            </div>
          </div>

          {/* Prompt Area */}
          <div className="seedance-prompt-area">
            <textarea 
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe camera movement, lighting, action..."
            />
          </div>

          {/* Bottom Generation Info & Trigger */}
          <div className="seedance-bottom-bar">
            <div className="seedance-model-pill">
              <span className="model-name">{selectedModel.name}</span>
              <span className="model-divider">|</span>
              <span className="model-spec">{selectedModel.maxRes} · 5s</span>
              <span className="model-divider">|</span>
              <span className="model-credit">$ 340</span>
            </div>

            <button 
              className={`seedance-generate-circle-btn ${isGenerating ? 'generating' : ''}`}
              onClick={handleGenerate}
              disabled={isGenerating}
              title={`Generate with ${selectedModel.name}`}
            >
              <RotateCw size={14} className={isGenerating ? 'spin-icon' : ''} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
