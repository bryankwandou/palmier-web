import React, { useRef } from 'react';
import { Video, Music, Image as ImageIcon, Plus, Upload, Play, Clock } from 'lucide-react';

export default function MediaBin({ mediaList, onAddMedia, onInsertToTimeline }) {
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
        source: 'Local Upload',
        blobUrl: URL.createObjectURL(file),
      };

      onAddMedia(newAsset);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          Project Assets ({mediaList.length})
        </span>

        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            padding: '4px 8px',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {mediaList.map((asset) => (
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
            title="Click to insert into timeline at playhead"
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
              ) : asset.type === 'video' ? (
                <Video size={16} color="var(--accent-blue)" />
              ) : asset.type === 'audio' ? (
                <Music size={16} color="var(--accent-emerald)" />
              ) : (
                <ImageIcon size={16} color="var(--accent-amber)" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {asset.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>{asset.duration.toFixed(1)}s</span>
                {asset.resolution && <span>• {asset.resolution}</span>}
                <span style={{ color: 'var(--accent-purple)' }}>• {asset.source}</span>
              </div>
            </div>

            <Plus size={14} color="var(--text-muted)" />
          </div>
        ))}
      </div>
    </div>
  );
}
