import React from 'react';
import { 
  Upload, 
  Server, 
  Command, 
  ChevronLeft, 
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';

export default function PalmierTopBar({ 
  projectName = 'Aesthetic video', 
  onBackToHome,
  onOpenSettings,
  onExport, 
  onOpenMcp,
  onOpenShortcuts 
}) {
  return (
    <div className="palmier-native-titlebar">
      {/* Left traffic lights and Projects Hub back button */}
      <div className="titlebar-left-zone">
        <div className="macos-traffic-lights">
          <span className="traffic-dot dot-close" />
          <span className="traffic-dot dot-minimize" />
          <span className="traffic-dot dot-maximize" />
        </div>

        {/* Home / Projects Hub Button */}
        <button 
          className="topbar-home-nav-btn"
          onClick={onBackToHome}
          title="Return to Projects Library (Home)"
        >
          <ChevronLeft size={13} />
          <span>Projects</span>
        </button>
      </div>

      {/* Centered Window Title */}
      <div className="native-titlebar-center">
        <button className="native-project-name-btn" onClick={onBackToHome}>
          <span className="native-window-title">{projectName}</span>
          <ChevronDown size={12} className="project-chevron" />
        </button>
      </div>

      {/* Right Actions: MCP Status, Settings, Shortcuts, Export, Avatar */}
      <div className="native-titlebar-right">
        {/* MCP Server Live Badge */}
        <button 
          className="mcp-top-status-badge" 
          onClick={onOpenMcp}
          title="Click to view MCP Instructions for Claude & Cursor"
        >
          <Server size={11} />
          <span>MCP :19789</span>
          <span className="live-dot" />
        </button>

        {/* Settings button */}
        <button 
          className="topbar-icon-action-btn"
          onClick={onOpenSettings}
          title="Palmier Pro Settings"
        >
          <SettingsIcon size={12} />
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button 
          className="topbar-icon-action-btn" 
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts"
        >
          <Command size={12} />
        </button>

        {/* Export Master Video Button */}
        <button className="native-export-btn" onClick={onExport} title="Export Master Video">
          <Upload size={12} strokeWidth={2} />
          <span>Export</span>
        </button>

        {/* User Account Avatar */}
        <div 
          className="user-avatar-circle" 
          onClick={onOpenSettings}
          title="Bryan Kwandou - Pro Studio"
        >
          B
        </div>
      </div>
    </div>
  );
}
