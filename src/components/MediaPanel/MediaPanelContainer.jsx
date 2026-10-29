import React, { useState, useRef } from 'react';
import { 
  Film, 
  Music, 
  Type, 
  Bookmark, 
  Upload, 
  Plus, 
  Video, 
  Folder, 
  Wand2, 
  Sparkles, 
  Play, 
  Volume2 
} from 'lucide-react';
import { SFX_LIBRARY, TRANSCRIPTION_WORDS, CAPTION_TEMPLATES } from '../../data/projectData';

export default function MediaPanelContainer({
  mediaList,
  onAddMedia,
  onInsertToTimeline,
  markers,
  onSeek,
  onApplyCaptionTemplate,
  onAutoTranscribe
}) {
  const [activeTab, setActiveTab] = useState('media'); // 'media' | 'audio' | 'captions' | 'markers'
  const [filterFolder, setFilterFolder] = useState('All');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const isImage = file.type.startsWith('image');

      const newAsset = {
        id: `upload-${Date.now()}-${i}`,
        name: file.name,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        duration: 8.0,
        resolution: isVideo ? '1920x1080' : null,
        fps: 30,
        thumbnail: isImage ? URL.createObjectURL(file) : '',
        source: 'User Import',
        folder: isAudio ? 'Audio' : 'Footage',
        blobUrl: URL.createObjectURL(file),
      };

      onAddMedia(newAsset);
    }
  };

  const filteredMedia = filterFolder === 'All' 
    ? mediaList 
    : mediaList.filter((m) => m.folder === filterFolder);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 4 Tabs matching Palmier Pro MediaPanel */}
      <div className="drawer-tabs">
        <button 
          className={`drawer-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <Film size={13} />
          <span>Media</span>
        </button>

        <button 
          className={`drawer-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <Music size={13} />
          <span>Audio/SFX</span>
        </button>

        <button 
          className={`drawer-tab-btn ${activeTab === 'captions' ? 'active' : ''}`}
          onClick={() => setActiveTab('captions')}
        >
          <Type size={13} />
          <span>Captions</span>
        </button>

        <button 
          className={`drawer-tab-btn ${activeTab === 'markers' ? 'active' : ''}`}
          onClick={() => setActiveTab('markers')}
        >
          <Bookmark size={13} />
          <span>Index</span>
        </button>
      </div>

      <div className="drawer-content">
        {/* TAB 1: MEDIA BIN */}
        {activeTab === 'media' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['All', 'Footage', 'B-Roll', 'Audio'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterFolder(f)}
                    style={{
                      background: filterFolder === f ? 'var(--bg-panel-secondary)' : 'transparent',
                      color: filterFolder === f ? 'var(--accent-blue)' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Upload size={12} />
                <span>Import</span>
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                multiple 
                accept="video/*,audio/*,image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredMedia.map((asset) => (
                <div 
                  key={asset.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease'
                  }}
                  onClick={() => onInsertToTimeline(asset)}
                  title="Click to insert at playhead"
                >
                  <div style={{ 
                    width: '48px', 
                    height: '32px', 
                    background: '#000', 
                    borderRadius: '2px', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {asset.thumbnail ? (
                      <img src={asset.thumbnail} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Video size={16} color="var(--accent-blue)" />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asset.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{asset.duration.toFixed(1)}s</span>
                      {asset.resolution && <span>• {asset.resolution}</span>}
                    </div>
                  </div>

                  <Plus size={13} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIO & SFX */}
        {activeTab === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Sound Effects & Stems ({SFX_LIBRARY.length})
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SFX_LIBRARY.map((sfx) => (
                <div 
                  key={sfx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                  onClick={() => onInsertToTimeline({
                    id: `sfx-clip-${Date.now()}`,
                    name: sfx.name,
                    type: 'audio',
                    duration: sfx.duration,
                    waveformPeaks: [30, 50, 70, 90, 60, 40, 20]
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Volume2 size={14} color="var(--accent-emerald)" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-primary)' }}>{sfx.name}</div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{sfx.category} • {sfx.duration}s</span>
                    </div>
                  </div>
                  <Plus size={13} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CAPTIONS & AUTO-TRANSCRIPTION */}
        {activeTab === 'captions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                <Sparkles size={14} />
                <span>Whisper AI Auto-Captions</span>
              </div>
              <button 
                onClick={onAutoTranscribe}
                style={{
                  background: 'var(--accent-blue)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Transcribe Timeline
              </button>
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Presets for animated vertical subtitles:
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CAPTION_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => onApplyCaptionTemplate(tpl)}
                  style={{
                    padding: '10px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: '600', color: tpl.color }}>{tpl.name}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Animation: {tpl.anim}</span>
                </div>
              ))}
            </div>

            <div style={{ 
              background: '#040508', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '10px',
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Synced Word Timestamps
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {TRANSCRIPTION_WORDS.map((w, i) => (
                  <span 
                    key={i}
                    onClick={() => onSeek(w.start)}
                    style={{
                      fontSize: '11px',
                      background: 'var(--bg-panel)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                    title={`Jump to ${w.start}s`}
                  >
                    {w.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MARKERS & INDEX */}
        {activeTab === 'markers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Timeline Markers ({markers.length})
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {markers.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => onSeek(m.time)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color }} />
                    <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-primary)' }}>{m.label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{m.time.toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
