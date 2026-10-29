import React, { useState, useRef } from 'react';
import { 
  Folder, 
  Music, 
  FileText, 
  ListFilter, 
  Sparkles, 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Sliders, 
  Scissors, 
  Bookmark, 
  Check, 
  VolumeX,
  Palette
} from 'lucide-react';
import { 
  FULL_MEDIA_ITEMS, 
  AUDIO_LIBRARY_ITEMS, 
  TRANSCRIPT_CAPTIONS, 
  AI_MODELS_CATALOG,
  INITIAL_MARKERS,
  WORD_LEVEL_TRANSCRIPT,
  SOLID_MATTE_PRESETS
} from '../data/palmierFullProject';
import { videoEngine } from '../services/videoEngine';

/**
 * Palmier Pro Media Panel
 * Faithful to Sources/PalmierPro/MediaPanel:
 * - MediaTab (Assets inventory, folders, import, + Solid Matte)
 * - AudioTab (Score, SFX, Foley library)
 * - CaptionsTab (Captions presets gallery, subtitle generator)
 * - IndexTab (MarkerBrowser + TranscriptBrowser with Dead Air & Filler Word cutter)
 * - StudioTab (AI Generative model prompt studio)
 */
export default function PalmierMediaPanelFull({ 
  onSelectMedia, 
  onInsertAudio, 
  onInsertCaption,
  onGenerate,
  onSeek,
  onCutSilence,
  onCutFillerWords,
  onAddMatte
}) {
  const [activeTab, setActiveTab] = useState('media'); // 'media' | 'audio' | 'captions' | 'index' | 'studio'
  const [items, setItems] = useState(FULL_MEDIA_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS_CATALOG[0]);
  const [promptText, setPromptText] = useState('extreme macro close-up iridescent butterfly wing scales shimmer, cinematic lighting, 8k');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMatteModal, setShowMatteModal] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');
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

  const handleCreateMatte = (preset) => {
    const newMatte = {
      id: `matte-${Date.now()}`,
      name: preset.name,
      folder: 'Mattes',
      duration: '47,780',
      isMatte: true,
      matteColor: preset.hex,
      thumb: '/welcome-butterfly.jpg',
      type: 'image'
    };
    setItems(prev => [newMatte, ...prev]);
    setShowMatteModal(false);
    if (onAddMatte) onAddMatte(newMatte);
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
          title="Media Library"
        >
          <Folder size={12} />
          <span>Media</span>
        </button>

        <button 
          className={`mp-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
          title="Audio Library"
        >
          <Music size={12} />
          <span>Audio</span>
        </button>

        <button 
          className={`mp-tab-btn ${activeTab === 'captions' ? 'active' : ''}`}
          onClick={() => setActiveTab('captions')}
          title="Captions & Subtitles"
        >
          <FileText size={12} />
          <span>Captions</span>
        </button>

        <button 
          className={`mp-tab-btn ${activeTab === 'index' ? 'active' : ''}`}
          onClick={() => setActiveTab('index')}
          title="Index: Markers & Transcripts"
        >
          <ListFilter size={12} />
          <span>Index</span>
        </button>

        <button 
          className={`mp-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
          title="AI Studio"
        >
          <Sparkles size={12} />
          <span>AI Studio</span>
        </button>
      </div>

      {/* TAB 1: MEDIA INVENTORY */}
      {activeTab === 'media' && (
        <div className="mp-tab-content-area">
          {/* Action Row */}
          <div className="media-action-row">
            <div className="media-search-input-wrap">
              <Search size={11} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="media-search-input"
              />
            </div>
            <button 
              className="media-import-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Import local video or image"
            >
              <Plus size={11} />
              <span>Import</span>
            </button>
            <button 
              className="media-matte-btn"
              onClick={() => setShowMatteModal(true)}
              title="Create Solid Color Matte"
            >
              <Palette size={11} />
              <span>Matte</span>
            </button>
          </div>

          {/* Folder Chips */}
          <div className="media-folder-chips">
            {['All', 'Animals', 'B-Roll', 'AI Renders', 'Imported', 'Mattes'].map((f) => (
              <button 
                key={f}
                className={`folder-chip ${activeFolder === f ? 'active' : ''}`}
                onClick={() => setActiveFolder(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Asset Grid */}
          <div className="media-grid-scroll">
            {filteredMedia.map((item) => (
              <div 
                key={item.id} 
                className="media-tile-item"
                onClick={() => onSelectMedia && onSelectMedia(item)}
              >
                <div className="tile-thumb-container">
                  {item.isMatte ? (
                    <div 
                      className="tile-matte-preview" 
                      style={{ backgroundColor: item.matteColor }} 
                    />
                  ) : (
                    <img src={item.thumb} alt={item.name} />
                  )}
                  <span className="tile-badge-duration">{item.duration}</span>
                </div>
                <div className="tile-title-text">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIO LIBRARY */}
      {activeTab === 'audio' && (
        <div className="mp-tab-content-area">
          <div className="audio-list-container">
            {AUDIO_LIBRARY_ITEMS.map((aud) => (
              <div key={aud.id} className="audio-item-row">
                <button 
                  className={`audio-play-btn ${playingAudioId === aud.id ? 'playing' : ''}`}
                  onClick={() => handleToggleAudio(aud)}
                >
                  {playingAudioId === aud.id ? <Pause size={10} /> : <Play size={10} />}
                </button>
                <div className="audio-meta-col">
                  <span className="audio-title">{aud.name}</span>
                  <span className="audio-subtext">{aud.category} · {aud.format}</span>
                </div>
                <button 
                  className="audio-insert-btn"
                  onClick={() => onInsertAudio && onInsertAudio(aud)}
                  title="Insert to A2 track"
                >
                  <Plus size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CAPTIONS TAB */}
      {activeTab === 'captions' && (
        <div className="mp-tab-content-area">
          <div className="captions-header-bar">
            <span className="captions-heading">Auto-Generated Captions</span>
            <span className="captions-count">{TRANSCRIPT_CAPTIONS.length} Cues</span>
          </div>
          <div className="captions-list-scroll">
            {TRANSCRIPT_CAPTIONS.map((cap) => (
              <div key={cap.id} className="caption-segment-card">
                <div className="cap-time-row">
                  <span className="cap-timecode">{cap.startTime.toFixed(1)}s - {cap.endTime.toFixed(1)}s</span>
                  <button 
                    className="cap-insert-btn"
                    onClick={() => onInsertCaption && onInsertCaption(cap)}
                    title="Insert Caption onto T1"
                  >
                    Insert T1
                  </button>
                </div>
                <div className="cap-text-content">{cap.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INDEX TAB (MARKER & TRANSCRIPT BROWSER) */}
      {activeTab === 'index' && (
        <div className="mp-tab-content-area">
          {/* Index Action Strip: Dead Air & Filler Word Removal */}
          <div className="index-actions-bar">
            <button 
              className="index-quick-cut-btn"
              onClick={() => onCutSilence && onCutSilence()}
              title="Remove silence gaps on timeline"
            >
              <VolumeX size={11} />
              <span>Cut Dead Air (Silence)</span>
            </button>
            <button 
              className="index-quick-cut-btn filler"
              onClick={() => onCutFillerWords && onCutFillerWords()}
              title="Remove um, uh filler words"
            >
              <Scissors size={11} />
              <span>Cut Filler Words (um, uh)</span>
            </button>
          </div>

          {/* Marker Browser Section */}
          <div className="index-section-title">TIMELINE MARKERS</div>
          <div className="index-markers-list">
            {INITIAL_MARKERS.map((mk) => (
              <div 
                key={mk.id} 
                className="index-marker-row"
                onClick={() => onSeek && onSeek(mk.time)}
              >
                <div className="marker-dot" style={{ backgroundColor: mk.color }} />
                <div className="marker-info-col">
                  <div className="marker-name-row">
                    <span className="marker-name">{mk.name}</span>
                    <span className="marker-status-tag">{mk.status}</span>
                  </div>
                  <span className="marker-comment">{mk.comment}</span>
                </div>
                <span className="marker-time">{mk.time.toFixed(1)}s</span>
              </div>
            ))}
          </div>

          {/* Transcript Browser Section */}
          <div className="index-section-title" style={{ marginTop: '14px' }}>
            TRANSCRIPT WORD STREAM
          </div>
          <div className="transcript-words-cloud">
            {WORD_LEVEL_TRANSCRIPT.map((w) => (
              <span 
                key={w.id}
                className={`transcript-word-chip ${w.isFiller ? 'filler' : ''} ${w.isSilence ? 'silence' : ''}`}
                onClick={() => onSeek && onSeek(w.start)}
                title={`${w.start.toFixed(2)}s - ${w.end.toFixed(2)}s`}
              >
                {w.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI STUDIO TAB */}
      {activeTab === 'studio' && (
        <div className="mp-tab-content-area">
          <div className="studio-container">
            <span className="studio-label">MODEL GENERATOR</span>
            <select 
              className="studio-model-select"
              value={selectedModel.id}
              onChange={(e) => setSelectedModel(AI_MODELS_CATALOG.find(m => m.id === e.target.value) || selectedModel)}
            >
              {AI_MODELS_CATALOG.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
              ))}
            </select>

            <span className="studio-label" style={{ marginTop: '10px' }}>PROMPT</span>
            <textarea 
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="studio-prompt-input"
            />

            <button 
              className="studio-generate-btn"
              disabled={isGenerating}
              onClick={handleGenerate}
            >
              <Sparkles size={13} />
              <span>{isGenerating ? 'Rendering Neural Frame...' : 'Generate AI Clip'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Solid Matte Modal (MatteSheet.swift Parity) */}
      {showMatteModal && (
        <div className="matte-modal-overlay">
          <div className="matte-modal-card">
            <span className="matte-modal-title">Create Solid Color Matte</span>
            <p className="matte-modal-sub">Generate a clean solid color matte layer for the project.</p>
            <div className="matte-presets-grid">
              {SOLID_MATTE_PRESETS.map((p) => (
                <button 
                  key={p.id}
                  className="matte-preset-card"
                  onClick={() => handleCreateMatte(p)}
                >
                  <div className="matte-color-swatch" style={{ backgroundColor: p.hex }} />
                  <span className="matte-preset-name">{p.name}</span>
                </button>
              ))}
            </div>
            <button 
              className="matte-cancel-btn" 
              onClick={() => setShowMatteModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
