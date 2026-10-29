import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  User, 
  Cpu, 
  Palette, 
  HardDrive, 
  Check, 
  Server, 
  ShieldCheck, 
  Trash2,
  ExternalLink
} from 'lucide-react';

export default function PalmierSettingsModal({ 
  isOpen, 
  onClose,
  theme,
  onThemeChange
}) {
  const [activeTab, setActiveTab] = useState('agent');
  const [framerate, setFramerate] = useState('24');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [autoSaveInterval, setAutoSaveInterval] = useState('30');
  const [mcpPort, setMcpPort] = useState('19789');
  const [mcpStatus, setMcpStatus] = useState('Connected (Listening)');
  const [selectedAgentModel, setSelectedAgentModel] = useState('claude-3-7-sonnet');
  const [cacheSize, setCacheSize] = useState('1.42 GB');
  const [snapping, setSnapping] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="palmier-modal-backdrop" onClick={onClose}>
      <div className="palmier-settings-window" onClick={(e) => e.stopPropagation()}>
        {/* Settings Header */}
        <div className="settings-window-header">
          <div className="settings-window-title-row">
            <span className="settings-window-title">Palmier Pro Settings</span>
            <button className="settings-close-btn" onClick={onClose}>
              <X size={14} />
            </button>
          </div>

          {/* Settings Tabs Toolbar */}
          <div className="settings-tab-toolbar">
            <button 
              className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Sliders size={13} />
              <span>General</span>
            </button>
            <button 
              className={`settings-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <User size={13} />
              <span>Account</span>
            </button>
            <button 
              className={`settings-tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
              onClick={() => setActiveTab('agent')}
            >
              <Cpu size={13} />
              <span>Agent & MCP</span>
            </button>
            <button 
              className={`settings-tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette size={13} />
              <span>Appearance</span>
            </button>
            <button 
              className={`settings-tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
              onClick={() => setActiveTab('storage')}
            >
              <HardDrive size={13} />
              <span>Storage</span>
            </button>
          </div>
        </div>

        {/* Settings Body Pane */}
        <div className="settings-window-body">
          {/* General Pane */}
          {activeTab === 'general' && (
            <div className="settings-pane">
              <div className="settings-group">
                <span className="settings-group-title">Timeline Defaults</span>
                <div className="settings-row">
                  <label>Default Framerate</label>
                  <select value={framerate} onChange={(e) => setFramerate(e.target.value)}>
                    <option value="24">24 fps (Cinematic Film standard)</option>
                    <option value="30">30 fps (Web / Social Broadcast)</option>
                    <option value="60">60 fps (High Motion Smooth)</option>
                  </select>
                </div>
                <div className="settings-row">
                  <label>Default Aspect Ratio</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                    <option value="16:9">16:9 Widescreen (3840x2160 / 1920x1080)</option>
                    <option value="9:16">9:16 Vertical (1080x1920 Reel/Shorts)</option>
                    <option value="2.39:1">2.39:1 Anamorphic Cinemascope</option>
                  </select>
                </div>
                <div className="settings-row">
                  <label>Auto-Save Interval</label>
                  <select value={autoSaveInterval} onChange={(e) => setAutoSaveInterval(e.target.value)}>
                    <option value="15">Every 15 seconds</option>
                    <option value="30">Every 30 seconds (Default)</option>
                    <option value="60">Every 1 minute</option>
                  </select>
                </div>
                <div className="settings-row checkbox-row">
                  <label>Enable Timeline Snapping</label>
                  <input 
                    type="checkbox" 
                    checked={snapping} 
                    onChange={(e) => setSnapping(e.target.checked)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Account Pane */}
          {activeTab === 'account' && (
            <div className="settings-pane">
              <div className="settings-group">
                <span className="settings-group-title">User Profile</span>
                <div className="account-profile-card">
                  <div className="profile-large-avatar">B</div>
                  <div className="profile-details">
                    <span className="profile-display-name">Bryan Kwandou</span>
                    <span className="profile-email">bryankwandou@gmail.com</span>
                    <span className="profile-tier-badge">Palmier Pro Max Studio Tier</span>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <span className="settings-group-title">Generative AI Video Credits</span>
                <div className="settings-row">
                  <label>Monthly Quota</label>
                  <span className="settings-val-highlight">Unlimited Studio Access</span>
                </div>
                <div className="settings-row">
                  <label>Active Local GPU Mesh</label>
                  <span className="settings-val-highlight">Direct Canvas Hardware Acceleration</span>
                </div>
              </div>
            </div>
          )}

          {/* Agent & MCP Pane */}
          {activeTab === 'agent' && (
            <div className="settings-pane">
              <div className="settings-group">
                <span className="settings-group-title">Local MCP Video Server</span>
                <div className="settings-row">
                  <label>HTTP MCP Endpoint</label>
                  <span className="settings-code-pill">http://127.0.0.1:19789/mcp</span>
                </div>
                <div className="settings-row">
                  <label>Loopback Port</label>
                  <input 
                    type="text" 
                    value={mcpPort} 
                    onChange={(e) => setMcpPort(e.target.value)}
                    style={{ width: '90px' }}
                  />
                </div>
                <div className="settings-row">
                  <label>Server Status</label>
                  <div className="server-status-pill online">
                    <span className="status-dot green" />
                    <span>{mcpStatus}</span>
                  </div>
                </div>
                <div className="settings-row">
                  <label>Registered MCP Tools</label>
                  <span className="settings-val-highlight">36 Swift Tools (Sources/PalmierPro/Agent/MCP)</span>
                </div>
              </div>

              <div className="settings-group">
                <span className="settings-group-title">AI Engine Model</span>
                <div className="settings-row">
                  <label>Primary Assistant</label>
                  <select 
                    value={selectedAgentModel} 
                    onChange={(e) => setSelectedAgentModel(e.target.value)}
                  >
                    <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Hybrid Thinking)</option>
                    <option value="gpt-4o">GPT-4o Omnimodal</option>
                    <option value="gemini-2-flash">Gemini 2.0 Flash</option>
                    <option value="palmier-local">Palmier Native Engine (On-device)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Pane */}
          {activeTab === 'appearance' && (
            <div className="settings-pane">
              <div className="settings-group">
                <span className="settings-group-title">Studio Interface Theme</span>
                <div className="theme-selection-grid">
                  <div 
                    className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => onThemeChange && onThemeChange('dark')}
                  >
                    <div className="theme-preview dark-theme" />
                    <span>Studio Dark (Default)</span>
                  </div>
                  <div 
                    className={`theme-card ${theme === 'gray' ? 'active' : ''}`}
                    onClick={() => onThemeChange && onThemeChange('gray')}
                  >
                    <div className="theme-preview gray-theme" />
                    <span>Film Gray (Neutral)</span>
                  </div>
                  <div 
                    className={`theme-card ${theme === 'cyberpunk' ? 'active' : ''}`}
                    onClick={() => onThemeChange && onThemeChange('cyberpunk')}
                  >
                    <div className="theme-preview cyberpunk-theme" />
                    <span>Cyberpunk High Contrast</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Storage Pane */}
          {activeTab === 'storage' && (
            <div className="settings-pane">
              <div className="settings-group">
                <span className="settings-group-title">Cache & Scratch Disk</span>
                <div className="settings-row">
                  <label>Render Cache Directory</label>
                  <span className="settings-code-pill">C:\Users\arche\.palmier\render_cache</span>
                </div>
                <div className="settings-row">
                  <label>Current Cache Size</label>
                  <span className="settings-val-highlight">{cacheSize}</span>
                </div>
                <div className="settings-action-row">
                  <button 
                    className="purge-cache-btn"
                    onClick={() => {
                      setCacheSize('0.00 MB');
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Purge Render Cache</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Footer */}
        <div className="settings-window-footer">
          <button className="settings-done-btn" onClick={onClose}>
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
