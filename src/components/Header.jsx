import React, { useState } from 'react';
import { 
  Film, 
  Layers, 
  Download, 
  Settings, 
  CheckCircle2, 
  Cpu, 
  Share2, 
  Maximize2 
} from 'lucide-react';

export default function Header({ 
  projectName, 
  setProjectName, 
  resolution, 
  setResolution, 
  fps, 
  setFps,
  onExport
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="palmier-header">
      <div className="header-left">
        <div className="app-brand">
          <Film size={20} color="#3b82f6" />
          <span>PALMIER</span>
          <span className="brand-badge">PRO</span>
        </div>

        <input 
          type="text" 
          className="project-title-input" 
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          title="Click to rename project"
        />
      </div>

      <div className="header-center">
        <div className="mcp-indicator" title="Palmier Pro MCP Server running on port 19789">
          <div className="mcp-pulse"></div>
          <span>MCP :19789 (LIVE)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select 
            value={resolution} 
            onChange={(e) => setResolution(e.target.value)}
            style={{ 
              background: 'var(--bg-panel)', 
              color: 'var(--text-secondary)', 
              border: '1px solid var(--border-subtle)', 
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              outline: 'none'
            }}
          >
            <option value="3840x2160">4K UHD (3840x2160)</option>
            <option value="1920x1080">1080p FHD (1920x1080)</option>
            <option value="1080x1920">9:16 Vertical (1080x1920)</option>
            <option value="1080x1080">1:1 Square (1080x1080)</option>
          </select>

          <select 
            value={fps} 
            onChange={(e) => setFps(Number(e.target.value))}
            style={{ 
              background: 'var(--bg-panel)', 
              color: 'var(--text-secondary)', 
              border: '1px solid var(--border-subtle)', 
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              outline: 'none'
            }}
          >
            <option value={24}>24 fps (Cinema)</option>
            <option value={30}>30 fps (Standard)</option>
            <option value={60}>60 fps (Smooth)</option>
          </select>
        </div>
      </div>

      <div className="header-right">
        <button 
          className="btn-icon" 
          title="Toggle Fullscreen"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
        >
          <Maximize2 size={16} />
        </button>

        <button className="btn-primary" onClick={onExport}>
          <Download size={14} />
          <span>Export Render</span>
        </button>
      </div>
    </header>
  );
}
