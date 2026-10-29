import React from 'react';
import { Upload, HelpCircle, Server, Command } from 'lucide-react';

export default function PalmierTopBar({ 
  projectName = 'Aesthetic video', 
  onExport, 
  onOpenMcp,
  onOpenShortcuts 
}) {
  return (
    <div className="palmier-native-titlebar">
      {/* macOS Traffic Lights */}
      <div className="macos-traffic-lights">
        <span className="traffic-dot dot-close" />
        <span className="traffic-dot dot-minimize" />
        <span className="traffic-dot dot-maximize" />
      </div>

      {/* Centered Window Title matching palmier-ui.png */}
      <div className="native-titlebar-center">
        <span className="native-window-title">{projectName}</span>
      </div>

      {/* Right Actions: MCP Status, Shortcuts, Export, Avatar */}
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
        <div className="user-avatar-circle" title="Account">
          M
        </div>
      </div>
    </div>
  );
}
