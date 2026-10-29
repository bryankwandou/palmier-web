import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function PalmierShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause playback' },
    { key: 'J / K / L', desc: 'Shuttle Reverse / Pause / Forward' },
    { key: 'C', desc: 'Razor Tool (Click to split clip)' },
    { key: 'V', desc: 'Selection Tool' },
    { key: 'Delete / Backspace', desc: 'Remove selected clip from track' },
    { key: 'Left / Right Arrow', desc: 'Step 1 frame backward / forward' },
    { key: 'Home / End', desc: 'Jump to timeline start / end' },
    { key: 'Cmd/Ctrl + Z', desc: 'Undo' },
    { key: 'Cmd/Ctrl + Shift + Z', desc: 'Redo' },
    { key: 'Cmd/Ctrl + E', desc: 'Export Master Video' },
    { key: 'M', desc: 'Add timeline marker' }
  ];

  return (
    <div className="export-modal-backdrop" onClick={onClose}>
      <div className="mcp-instructions-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="mcp-header-title">
            <Keyboard size={14} className="mcp-icon" />
            <span className="modal-title">Palmier Pro Keyboard Shortcuts</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div className="shortcuts-grid">
            {shortcuts.map((s, idx) => (
              <div key={idx} className="shortcut-row">
                <span className="shortcut-key-badge">{s.key}</span>
                <span className="shortcut-desc">{s.desc}</span>
              </div>
            ))}
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
