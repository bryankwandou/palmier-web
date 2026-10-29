import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Film, 
  FileCode, 
  Package, 
  CheckCircle2, 
  Clock, 
  Play, 
  Terminal,
  Activity
} from 'lucide-react';

export default function PalmierExportModal({ 
  isOpen, 
  onClose, 
  sequence, 
  clips, 
  onStartExport, 
  exportProgress 
}) {
  const [destination, setDestination] = useState('video'); // 'video' | 'timeline' | 'palmier'
  const [codec, setCodec] = useState('prores'); // 'prores' | 'h264' | 'hevc'
  const [resolution, setResolution] = useState('match');
  const [framerate, setFramerate] = useState('24');
  const [timelineFormat, setTimelineFormat] = useState('fcpxml'); // 'fcpxml' | 'xmeml'
  const [logMessages, setLogMessages] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (exportProgress > 0 && exportProgress < 100) {
      setIsExporting(true);
      const currentFrame = Math.round((exportProgress / 100) * (sequence.totalDuration * Number(framerate)));
      setLogMessages((prev) => {
        const lastMsg = `[RENDER] Composite frame ${currentFrame} / ${Math.round(sequence.totalDuration * Number(framerate))} (V1+V2+T1 shaders active)`;
        if (prev[prev.length - 1] === lastMsg) return prev;
        return [...prev.slice(-8), lastMsg];
      });
    } else if (exportProgress === 100) {
      setIsExporting(false);
      setIsCompleted(true);
      setLogMessages((prev) => [...prev.slice(-8), '[COMPLETE] Master pipeline finalized successfully. File written.']);
    }
  }, [exportProgress, sequence.totalDuration, framerate]);

  if (!isOpen) return null;

  const handleBeginExport = () => {
    setIsCompleted(false);
    setIsExporting(true);
    setLogMessages([
      `[INIT] Target: ${destination.toUpperCase()} | Codec: ${codec.toUpperCase()} | Res: ${sequence.resolution}`,
      `[SHADER] Loading Sabattier solarization & Tri-X 16mm grain compute kernels...`,
      `[AUDIO] Initializing 48kHz stereo master bus with 3-band EQ...`
    ]);

    if (destination === 'video') {
      onStartExport();
    } else if (destination === 'timeline') {
      // Generate actual FCPXML or XMEML file
      setTimeout(() => {
        const xmlContent = destination === 'timeline' && timelineFormat === 'fcpxml'
          ? `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.11">
  <resources>
    <format id="r1" name="FFVideoFormat1080p24" frameDuration="100/2400s" width="1920" height="1080"/>
  </resources>
  <library>
    <event name="Palmier Pro Export">
      <project name="${sequence.name}">
        <sequence format="r1" duration="${Math.round(sequence.totalDuration * 24)}/24s">
          <spine>
            ${clips.map((c, i) => `
              <clip name="${c.name}" offset="${Math.round(c.startTime * 24)}/24s" duration="${Math.round(c.duration * 24)}/24s" start="0s">
                <adjust-transform scale="${c.scale || 100}%" position="${c.posX || 0} ${c.posY || 0}"/>
              </clip>
            `).join('\n')}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`
          : `<?xml version="1.0" encoding="UTF-8"?>
<xmeml version="4">
  <sequence>
    <name>${sequence.name}</name>
    <duration>${Math.round(sequence.totalDuration * 24)}</duration>
    <rate><timebase>24</timebase></rate>
  </sequence>
</xmeml>`;

        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sequence.name.replace(/\s+/g, '_')}.${timelineFormat === 'fcpxml' ? 'fcpxml' : 'xml'}`;
        a.click();
        setIsExporting(false);
        setIsCompleted(true);
        setLogMessages(prev => [...prev, `[DOWNLOAD] Exported timeline interchange file.`]);
      }, 800);
    } else if (destination === 'palmier') {
      // Export .palmier package
      setTimeout(() => {
        const bundle = {
          version: '0.7.6',
          sequence,
          clips,
          exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sequence.name.replace(/\s+/g, '_')}.palmier`;
        a.click();
        setIsExporting(false);
        setIsCompleted(true);
        setLogMessages(prev => [...prev, `[DOWNLOAD] Exported .palmier project package.`]);
      }, 800);
    }
  };

  return (
    <div className="palmier-modal-backdrop" onClick={onClose}>
      <div className="palmier-export-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="export-window-header">
          <span className="export-window-title">Export Master: {sequence.name}</span>
          <button className="export-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {/* Dual Pane Layout matching ExportView.swift */}
        <div className="export-window-body">
          {/* Left Settings Pane */}
          <div className="export-settings-pane">
            {/* Destination Picker */}
            <div className="export-section">
              <span className="export-section-label">Destination</span>
              <div className="destination-toggle-bar">
                <button 
                  className={`dest-btn ${destination === 'video' ? 'active' : ''}`}
                  onClick={() => setDestination('video')}
                >
                  <Film size={13} />
                  <span>Video</span>
                </button>
                <button 
                  className={`dest-btn ${destination === 'timeline' ? 'active' : ''}`}
                  onClick={() => setDestination('timeline')}
                >
                  <FileCode size={13} />
                  <span>Timeline</span>
                </button>
                <button 
                  className={`dest-btn ${destination === 'palmier' ? 'active' : ''}`}
                  onClick={() => setDestination('palmier')}
                >
                  <Package size={13} />
                  <span>Palmier Project</span>
                </button>
              </div>
            </div>

            {/* If Video Destination */}
            {destination === 'video' && (
              <>
                <div className="export-section">
                  <span className="export-section-label">Video Codec</span>
                  <div className="export-options-grid">
                    <button 
                      className={`option-btn ${codec === 'prores' ? 'active' : ''}`}
                      onClick={() => setCodec('prores')}
                    >
                      <span className="opt-title">Apple ProRes 422 HQ</span>
                      <span className="opt-desc">Master quality, 10-bit 4:2:2 mastering</span>
                    </button>
                    <button 
                      className={`option-btn ${codec === 'h264' ? 'active' : ''}`}
                      onClick={() => setCodec('h264')}
                    >
                      <span className="opt-title">H.264 (MP4)</span>
                      <span className="opt-desc">Universal playback, high bitrate web delivery</span>
                    </button>
                    <button 
                      className={`option-btn ${codec === 'hevc' ? 'active' : ''}`}
                      onClick={() => setCodec('hevc')}
                    >
                      <span className="opt-title">HEVC (H.265 10-bit)</span>
                      <span className="opt-desc">Modern compressed HDR master</span>
                    </button>
                  </div>
                </div>

                <div className="export-section-row">
                  <div className="export-field">
                    <label>Resolution</label>
                    <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                      <option value="match">Match Timeline ({sequence.resolution})</option>
                      <option value="4k">4K UHD (3840x2160)</option>
                      <option value="fhd">1080p FHD (1920x1080)</option>
                      <option value="916">9:16 Vertical Reel (1080x1920)</option>
                      <option value="hd">720p HD (1280x720)</option>
                    </select>
                  </div>

                  <div className="export-field">
                    <label>Framerate</label>
                    <select value={framerate} onChange={(e) => setFramerate(e.target.value)}>
                      <option value="24">24 fps (Cinematic)</option>
                      <option value="30">30 fps (Broadcast)</option>
                      <option value="60">60 fps (High frame rate)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* If Timeline Destination */}
            {destination === 'timeline' && (
              <div className="export-section">
                <span className="export-section-label">Interchange Format</span>
                <div className="export-options-grid">
                  <button 
                    className={`option-btn ${timelineFormat === 'fcpxml' ? 'active' : ''}`}
                    onClick={() => setTimelineFormat('fcpxml')}
                  >
                    <span className="opt-title">FCPXML v1.11</span>
                    <span className="opt-desc">Best for DaVinci Resolve and Final Cut Pro</span>
                  </button>
                  <button 
                    className={`option-btn ${timelineFormat === 'xmeml' ? 'active' : ''}`}
                    onClick={() => setTimelineFormat('xmeml')}
                  >
                    <span className="opt-title">XMEML v4</span>
                    <span className="opt-desc">Best for Adobe Premiere Pro interchange</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Palmier Project Destination */}
            {destination === 'palmier' && (
              <div className="export-section">
                <span className="export-section-label">Palmier Project Archive</span>
                <p className="export-help-text">
                  Collects all multi-sequence metadata, timeline cut timestamps, 6-track clip configurations, 
                  and LUT color values into a standalone .palmier package.
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="export-action-bar">
              <button 
                className="start-export-btn"
                disabled={isExporting}
                onClick={handleBeginExport}
              >
                <Download size={14} />
                <span>{isExporting ? 'Exporting...' : 'Start Export'}</span>
              </button>
            </div>
          </div>

          {/* Right Log & Queue Pane matching ExportLog.swift */}
          <div className="export-queue-log-pane">
            <div className="queue-log-header">
              <div className="log-title-wrap">
                <Activity size={12} />
                <span>Export Queue & Engine Log</span>
              </div>
              <span className="queue-status-tag">
                {isExporting ? 'Rendering' : isCompleted ? 'Completed' : 'Ready'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="export-progress-track">
              <div 
                className="export-progress-fill" 
                style={{ width: `${destination === 'video' ? exportProgress : (isCompleted ? 100 : (isExporting ? 50 : 0))}%` }} 
              />
            </div>

            <div className="export-progress-info">
              <span>Progress: {destination === 'video' ? `${exportProgress}%` : (isCompleted ? '100%' : '0%')}</span>
              <span>Duration: {sequence.totalDuration.toFixed(1)}s</span>
            </div>

            {/* Terminal log output */}
            <div className="export-log-terminal">
              {logMessages.map((msg, idx) => (
                <div key={idx} className="terminal-line">{msg}</div>
              ))}
              {logMessages.length === 0 && (
                <div className="terminal-placeholder">Ready to dispatch export job to rendering pipeline.</div>
              )}
            </div>

            {isCompleted && (
              <div className="export-complete-banner">
                <CheckCircle2 size={15} className="banner-check" />
                <span>Master render finished and ready for download.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
