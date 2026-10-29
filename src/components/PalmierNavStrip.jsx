import React from 'react';
import { Folder, MessageSquare, Music, Film, Settings } from 'lucide-react';

export default function PalmierNavStrip({ activeTab = 'media', onSelectTab }) {
  return (
    <div className="palmier-nav-strip">
      <button 
        className={`nav-strip-btn ${activeTab === 'media' ? 'active' : ''}`}
        onClick={() => onSelectTab && onSelectTab('media')}
        title="Media Library"
      >
        <Folder size={18} strokeWidth={1.8} />
      </button>

      <button 
        className={`nav-strip-btn ${activeTab === 'chat' ? 'active' : ''}`}
        onClick={() => onSelectTab && onSelectTab('chat')}
        title="Agent Sessions"
      >
        <MessageSquare size={18} strokeWidth={1.8} />
      </button>

      <button 
        className={`nav-strip-btn ${activeTab === 'audio' ? 'active' : ''}`}
        onClick={() => onSelectTab && onSelectTab('audio')}
        title="Audio Library"
      >
        <Music size={18} strokeWidth={1.8} />
      </button>

      <div className="nav-strip-spacer" />

      <button 
        className="nav-strip-btn"
        title="Settings"
      >
        <Settings size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}
