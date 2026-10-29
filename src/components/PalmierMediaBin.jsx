import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Sparkles, 
  Search, 
  LayoutGrid, 
  ChevronRight, 
  ChevronDown, 
  RotateCw,
  UploadCloud
} from 'lucide-react';
import { MEDIA_LIBRARY_ITEMS } from '../data/palmierSourceData';

export default function PalmierMediaBin({ onSelectMedia, onGenerate }) {
  const [items, setItems] = useState(MEDIA_LIBRARY_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenTab, setActiveGenTab] = useState('first-last'); // 'first-last' | 'reference'
  const [promptText, setPromptText] = useState('extreme macro close-up iridescent butterfly wing scales shimmer, cinematic lighting, 8k');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newItem = {
        id: `m-${Date.now()}`,
        name: `juicy...gen_${Math.floor(Math.random() * 9000 + 1000)}`,
        duration: '47,780',
        thumb: '/welcome-butterfly.jpg'
      };
      setItems(prev => [newItem, ...prev]);
      setIsGenerating(false);
      if (onGenerate) onGenerate(newItem);
    }, 1000);
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
        vid.onloadeddata = () => {
          vid.currentTime = 0.5;
        };
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
            duration: `${Math.floor(vid.duration * 1000)}`,
            thumb: thumbUrl,
            rawUrl: url
          };
          setItems(prev => [newItem, ...prev]);
          if (onSelectMedia) onSelectMedia(newItem);
        };
      } else {
        const newItem = {
          id: `m-${Date.now()}`,
          name: file.name.slice(0, 16),
          duration: '47,780',
          thumb: url,
          rawUrl: url
        };
        setItems(prev => [newItem, ...prev]);
        if (onSelectMedia) onSelectMedia(newItem);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileImport({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div 
      className="palmier-media-bin"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Hidden File Input for Real Native Imports */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="video/*,image/*" 
        multiple 
        onChange={handleFileImport}
      />

      {/* Top Header Actions */}
      <div className="media-bin-top-header">
        <div className="header-action-buttons">
          <button 
            className="bin-btn btn-import"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Import Video or Image from Disk"
          >
            <Plus size={13} />
            <span>Import</span>
          </button>
          <button 
            className="bin-btn btn-sparkle" 
            onClick={handleGenerate}
            title="Generate AI Shot"
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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bin-view-toggle" title="Grid View">
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Breadcrumb Row */}
      <div className="media-bin-breadcrumb">
        <span className="crumb-root">Library</span>
        <ChevronRight size={12} className="crumb-separator" />
        <span className="crumb-current">Animals</span>
        <span className="crumb-count">{filteredItems.length} items</span>
      </div>

      {/* 3-Column Media Grid */}
      <div className="media-bin-grid">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="media-grid-card"
            onClick={() => onSelectMedia && onSelectMedia(item)}
            title={`${item.name} (Click to insert to timeline)`}
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

      {/* Bottom Seedance 2 Generation Studio Box */}
      <div className="seedance-gen-box">
        {/* Seedance Mode Tabs */}
        <div className="seedance-tabs">
          <button 
            className={`seedance-tab ${activeGenTab === 'first-last' ? 'active' : ''}`}
            onClick={() => setActiveGenTab('first-last')}
          >
            First / Last
          </button>
          <button 
            className={`seedance-tab ${activeGenTab === 'reference' ? 'active' : ''}`}
            onClick={() => setActiveGenTab('reference')}
          >
            Reference
          </button>
        </div>

        {/* Frames Row */}
        <div className="seedance-frames-row">
          <div className="seedance-frame-card active">
            <img src="/welcome-butterfly.jpg" alt="First Frame" />
            <span className="frame-label">First</span>
          </div>
          <div 
            className="seedance-frame-card empty"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Upload Last Frame from Computer"
            style={{ cursor: 'pointer' }}
          >
            <Plus size={16} />
            <span className="frame-label">Last</span>
          </div>
        </div>

        {/* Prompt Input Textarea */}
        <div className="seedance-prompt-area">
          <textarea 
            rows={2}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe camera movement, action, and lighting..."
          />
        </div>

        {/* Bottom Model Selector & Generate Button */}
        <div className="seedance-bottom-bar">
          <div className="seedance-model-pill">
            <span className="model-name">Seedance 2</span>
            <span className="model-divider">|</span>
            <span className="model-spec">1080p · 5s · 1...</span>
            <span className="model-divider">|</span>
            <span className="model-credit">$ 340</span>
            <ChevronDown size={11} className="pill-chevron" />
          </div>

          <button 
            className={`seedance-generate-circle-btn ${isGenerating ? 'generating' : ''}`}
            onClick={handleGenerate}
            disabled={isGenerating}
            title="Generate Clip with Seedance 2"
          >
            <RotateCw size={14} className={isGenerating ? 'spin-icon' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}
