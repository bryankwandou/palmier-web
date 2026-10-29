import React from 'react';
import { Sliders, Sun, Contrast, Droplets, Volume2, Maximize, Type } from 'lucide-react';

export default function Inspector({ clip, onUpdateClip }) {
  if (!clip) {
    return (
      <div className="palmier-inspector">
        <div className="inspector-header">Inspector</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)', fontSize: '12px', padding: '20px', textAlign: 'center' }}>
          Select a clip on the timeline to edit properties, color grades, and audio stems.
        </div>
      </div>
    );
  }

  const handleChange = (key, value) => {
    onUpdateClip(clip.id, { [key]: value });
  };

  return (
    <div className="palmier-inspector">
      <div className="inspector-header">
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clip.name}</span>
      </div>

      <div className="inspector-content">
        {/* Timing Information */}
        <div className="inspector-group">
          <div className="inspector-group-title">Timing & Speed</div>
          <div className="inspector-row">
            <label>Start (s)</label>
            <input 
              type="number" 
              step="0.1" 
              value={clip.startTime.toFixed(2)} 
              onChange={(e) => handleChange('startTime', Number(e.target.value))}
              style={{ width: '80px' }}
            />
          </div>
          <div className="inspector-row">
            <label>Duration (s)</label>
            <input 
              type="number" 
              step="0.1" 
              value={clip.duration.toFixed(2)} 
              onChange={(e) => handleChange('duration', Number(e.target.value))}
              style={{ width: '80px' }}
            />
          </div>
          <div className="inspector-row">
            <label>Speed</label>
            <select 
              value={clip.speed || 1} 
              onChange={(e) => handleChange('speed', Number(e.target.value))}
            >
              <option value={0.5}>0.5x (Slow-Mo)</option>
              <option value={1}>1.0x (Normal)</option>
              <option value={1.5}>1.5x (Fast)</option>
              <option value={2}>2.0x (Hyper)</option>
            </select>
          </div>
        </div>

        {/* Text Properties (if Text Clip) */}
        {clip.type === 'text' && (
          <div className="inspector-group">
            <div className="inspector-group-title">Text & Typography</div>
            <div className="inspector-row">
              <label>Caption Text</label>
              <input 
                type="text" 
                value={clip.text || ''} 
                onChange={(e) => handleChange('text', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div className="inspector-row">
              <label>Font Size</label>
              <input 
                type="number" 
                min="12" 
                max="72"
                value={clip.fontSize || 24} 
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                style={{ width: '60px' }}
              />
            </div>
          </div>
        )}

        {/* Video Transform Properties */}
        {(clip.type === 'video' || clip.model) && (
          <>
            <div className="inspector-group">
              <div className="inspector-group-title">Transform & Video</div>
              <div className="inspector-row">
                <label>Opacity</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={clip.opacity ?? 1} 
                  onChange={(e) => handleChange('opacity', Number(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px' }}>
                  {Math.round((clip.opacity ?? 1) * 100)}%
                </span>
              </div>

              <div className="inspector-row">
                <label>Scale</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.05"
                  value={clip.scale || 1} 
                  onChange={(e) => handleChange('scale', Number(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px' }}>
                  {(clip.scale || 1).toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Color Grading */}
            <div className="inspector-group">
              <div className="inspector-group-title">Color Grading</div>
              <div className="inspector-row">
                <label>Exposure</label>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  value={clip.exposure || 0} 
                  onChange={(e) => handleChange('exposure', Number(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px' }}>
                  {clip.exposure || 0}
                </span>
              </div>

              <div className="inspector-row">
                <label>Contrast</label>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  value={clip.contrast || 0} 
                  onChange={(e) => handleChange('contrast', Number(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px' }}>
                  {clip.contrast || 0}
                </span>
              </div>

              <div className="inspector-row">
                <label>Saturation</label>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  value={clip.saturation || 0} 
                  onChange={(e) => handleChange('saturation', Number(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px' }}>
                  {clip.saturation || 0}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Audio Volume */}
        {(clip.type === 'audio' || clip.type === 'video') && (
          <div className="inspector-group">
            <div className="inspector-group-title">Audio Levels</div>
            <div className="inspector-row">
              <label>Volume</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.05"
                value={clip.volume ?? 1} 
                onChange={(e) => handleChange('volume', Number(e.target.value))}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px' }}>
                {Math.round((clip.volume ?? 1) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
