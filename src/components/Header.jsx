import React from 'react';
import { 
  Film, 
  Layers, 
  Download, 
  Settings, 
  Maximize2, 
  Bot,
  LayoutTemplate
} from 'lucide-react';
import { WORKSPACE_LAYOUTS } from '../data/projectData';

export default function Header({ 
  projectName, 
  setProjectName, 
  activeLayout,
  setActiveLayout,
  resolution, 
  setResolution, 
  fps, 
  setFps,
  showAgentSidebar,
  setShowAgentSidebar,
  onExport
}) {
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

        {/* Workspace Layouts Switcher */}
        <div className="layout-presets-bar">
          {WORKSPACE_LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              className={`layout-preset-btn ${activeLayout === layout.id ? 'active' : ''}`}
              onClick={() => setActiveLayout(layout.id)}
            >
              {layout.name}
            </button>
          ))}
        </div>
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
            <option value="3840x2160">4K UHD (16:9)</option>
            <option value="1920x1080">1080p FHD (16:9)</option>
            <option value="1080x1920">9:16 Shorts/Reels</option>
            <option value="1080x1080">1:1 Square</option>
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
          className={`btn-icon ${showAgentSidebar ? 'active' : ''}`}
          onClick={() => setShowAgentSidebar(!showAgentSidebar)}
          title="Toggle Palmier AI Copilot Sidebar"
        >
          <Bot size={16} />
        </button>

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
          <span>Export Master</span>
        </button>
      </div>
    </header>
  );
}
