import React from 'react';
import { Share, Upload, ArrowUpRight } from 'lucide-react';

export default function PalmierTopBar({ projectName = 'Aesthetic video', onExport }) {
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

      {/* Right Action: Export Button & User Avatar */}
      <div className="native-titlebar-right">
        <button className="native-export-btn" onClick={onExport} title="Export Master Video">
          <Upload size={12} strokeWidth={2} />
          <span>Export</span>
        </button>

        <div className="user-avatar-circle" title="Account">
          M
        </div>
      </div>
    </div>
  );
}
