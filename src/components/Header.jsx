import React from 'react';
import { 
  Film, 
  Layers, 
  Download, 
  Settings, 
  Maximize2, 
  Bot,
  Sliders,
  PanelLeftClose,
  PanelRightClose
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
  showMediaPanel,
  setShowMediaPanel,
  showInspector,
  setShowInspector,
  showAgentSidebar,
  setShowAgentSidebar,
  onExport
}) {
  return (
    <header className="palmier-header">
      <div className="header-left">
        <div className="app-brand">
          <Film size={18} color="#3b82f6" />
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

        {/* Workspace Layouts Switcher matching PalmierPro WorkspaceLayout.swift */}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select 
            value={resolution} 
            onChange={(e) => setResolution(e.target.value)}
            className="preview-select"
          >
            <option value="3840x2160">4K UHD (16:9)</option>
            <option value="1920x1080">1080p FHD (16:9)</option>
            <option value="1080x1920">9:16 Shorts/Reels</option>
            <option value="1080x1080">1:1 Square</option>
          </select>

          <select 
            value={fps} 
            onChange={(e) => setFps(Number(e.target.value))}
            className="preview-select"
          >
            <option value={24}>24 fps</option>
            <option value={30}>30 fps</option>
            <option value={60}>60 fps</option>
          </select>
        </div>
      </div>

      <div className="header-right">
        {/* Panel visibility toggles matching PalmierPro EditorView.swift */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-app)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn-icon ${showMediaPanel ? 'active' : ''}`}
            onClick={() => setShowMediaPanel(!showMediaPanel)}
            title="Toggle Media Panel (⌘1)"
          >
            <Layers size={13} />
          </button>

          <button 
            className={`btn-icon ${showInspector ? 'active' : ''}`}
            onClick={() => setShowInspector(!showInspector)}
            title="Toggle Inspector Panel (⌘2)"
          >
            <Sliders size={13} />
          </button>

          <button 
            className={`btn-icon ${showAgentSidebar ? 'active' : ''}`}
            onClick={() => setShowAgentSidebar(!showAgentSidebar)}
            title="Toggle Palmier AI Copilot Panel (⌘3)"
          >
            <Bot size={13} />
          </button>
        </div>

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
          <Maximize2 size={13} />
        </button>

        <button className="btn-primary" onClick={onExport}>
          <Download size={13} />
          <span>Export Master</span>
        </button>
      </div>
    </header>
  );
}
