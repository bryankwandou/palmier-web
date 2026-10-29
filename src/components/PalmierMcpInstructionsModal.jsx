import React, { useState } from 'react';
import { X, Copy, Check, Server, Terminal, Code2 } from 'lucide-react';

export default function PalmierMcpInstructionsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('claude'); // 'claude' | 'codex' | 'cursor' | 'desktop'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const claudeCmd = 'claude mcp add --transport http palmier-pro http://127.0.0.1:19789/mcp';
  const codexCmd = 'codex mcp add palmier-pro --url http://127.0.0.1:19789/mcp';
  const cursorConfig = JSON.stringify({
    mcpServers: {
      "palmier-pro": {
        "type": "http",
        "url": "http://127.0.0.1:19789/mcp"
      }
    }
  }, null, 2);

  return (
    <div className="export-modal-backdrop" onClick={onClose}>
      <div className="mcp-instructions-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="mcp-header-title">
            <Server size={14} className="mcp-icon" />
            <span className="modal-title">Palmier Pro MCP Server (Model Context Protocol)</span>
            <span className="mcp-online-badge">● ONLINE :19789</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <p className="mcp-desc">
            When Palmier Pro is open, it exposes a local HTTP MCP server on <code>http://127.0.0.1:19789/mcp</code>.
            Connect your AI agents to query timeline state, add shots, and grade colors directly.
          </p>

          <div className="mcp-tabs-bar">
            <button 
              className={`mcp-tab-btn ${activeTab === 'claude' ? 'active' : ''}`}
              onClick={() => setActiveTab('claude')}
            >
              Claude Code
            </button>
            <button 
              className={`mcp-tab-btn ${activeTab === 'codex' ? 'active' : ''}`}
              onClick={() => setActiveTab('codex')}
            >
              Codex
            </button>
            <button 
              className={`mcp-tab-btn ${activeTab === 'cursor' ? 'active' : ''}`}
              onClick={() => setActiveTab('cursor')}
            >
              Cursor
            </button>
          </div>

          <div className="mcp-code-container">
            {activeTab === 'claude' && (
              <div className="code-box">
                <pre>{claudeCmd}</pre>
                <button className="copy-btn" onClick={() => copyCode(claudeCmd)}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>
            )}

            {activeTab === 'codex' && (
              <div className="code-box">
                <pre>{codexCmd}</pre>
                <button className="copy-btn" onClick={() => copyCode(codexCmd)}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>
            )}

            {activeTab === 'cursor' && (
              <div className="code-box">
                <p className="code-hint">Add this snippet to <code>~/.cursor/mcp.json</code>:</p>
                <pre>{cursorConfig}</pre>
                <button className="copy-btn" onClick={() => copyCode(cursorConfig)}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="export-download-btn" onClick={onClose}>
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
