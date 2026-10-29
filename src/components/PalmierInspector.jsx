import React from 'react';

export default function PalmierInspector({ 
  selectedClip, 
  onUpdateClip 
}) {
  const clip = selectedClip || {
    id: 'default',
    name: 'juicyma',
    volumeDb: 0.0,
    fadeIn: 0.0,
    fadeOut: 0.0,
    speed: 1.0,
    scale: 100,
    posX: 0,
    posY: 0,
    solarize: false,
    grain: false
  };

  const handleChange = (key, value) => {
    if (onUpdateClip && selectedClip) {
      onUpdateClip(selectedClip.id, { [key]: value });
    }
  };

  return (
    <div className="palmier-native-inspector">
      <div className="inspector-top-header">
        <span className="inspector-heading">Inspector {selectedClip ? `— ${selectedClip.name}` : ''}</span>
      </div>

      <div className="inspector-content-scroll">
        {/* LEVELS Section */}
        <div className="inspector-section">
          <div className="section-title-row">
            <span className="section-title">LEVELS</span>
          </div>

          <div className="param-row">
            <span className="param-label">Volume</span>
            <div className="param-control">
              <input 
                type="range" 
                min="-24" 
                max="6" 
                step="0.5"
                value={clip.volumeDb !== undefined ? clip.volumeDb : 0.0} 
                onChange={(e) => handleChange('volumeDb', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{(clip.volumeDb || 0.0).toFixed(1)} dB</span>
            </div>
          </div>

          <div className="param-row">
            <span className="param-label">Fade In</span>
            <div className="param-control">
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="0.1"
                value={clip.fadeIn || 0.0} 
                onChange={(e) => handleChange('fadeIn', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{(clip.fadeIn || 0.0).toFixed(2)} s</span>
            </div>
          </div>

          <div className="param-row">
            <span className="param-label">Fade Out</span>
            <div className="param-control">
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="0.1"
                value={clip.fadeOut || 0.0} 
                onChange={(e) => handleChange('fadeOut', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{(clip.fadeOut || 0.0).toFixed(2)} s</span>
            </div>
          </div>
        </div>

        {/* PLAYBACK Section */}
        <div className="inspector-section">
          <div className="section-title-row">
            <span className="section-title">PLAYBACK</span>
          </div>

          <div className="param-row">
            <span className="param-label">Speed</span>
            <div className="param-control">
              <input 
                type="range" 
                min="0.25" 
                max="4" 
                step="0.25"
                value={clip.speed || 1.0} 
                onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{(clip.speed || 1.0).toFixed(2)}x</span>
            </div>
          </div>

          <div className="playback-chips-row">
            <button className="playback-chip active">Forward</button>
            <button className="playback-chip">Reverse</button>
            <button className="playback-chip">Loop</button>
          </div>
        </div>

        {/* TRANSFORM Section */}
        <div className="inspector-section">
          <div className="section-title-row">
            <span className="section-title">TRANSFORM</span>
          </div>

          <div className="param-row">
            <span className="param-label">Scale</span>
            <div className="param-control">
              <input 
                type="range" 
                min="10" 
                max="200" 
                value={clip.scale || 100} 
                onChange={(e) => handleChange('scale', parseInt(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{clip.scale || 100}%</span>
            </div>
          </div>

          <div className="param-row">
            <span className="param-label">Position X</span>
            <div className="param-control">
              <input 
                type="number" 
                value={clip.posX || 0} 
                onChange={(e) => handleChange('posX', parseInt(e.target.value) || 0)}
                className="param-number-input"
              />
              <span className="param-value">px</span>
            </div>
          </div>

          <div className="param-row">
            <span className="param-label">Position Y</span>
            <div className="param-control">
              <input 
                type="number" 
                value={clip.posY || 0} 
                onChange={(e) => handleChange('posY', parseInt(e.target.value) || 0)}
                className="param-number-input"
              />
              <span className="param-value">px</span>
            </div>
          </div>
        </div>

        {/* AI STYLES & EFFECTS (Shot 19 Tri-X & Sabattier) */}
        <div className="inspector-section">
          <div className="section-title-row">
            <span className="section-title">AI COLOR & EMULSION</span>
          </div>

          <div className="param-row">
            <span className="param-label">Sabattier Solarize</span>
            <div className="param-control">
              <input 
                type="checkbox"
                checked={!!clip.solarize}
                onChange={(e) => handleChange('solarize', e.target.checked)}
              />
            </div>
          </div>

          <div className="param-row">
            <span className="param-label">Tri-X Film Grain</span>
            <div className="param-control">
              <input 
                type="checkbox"
                checked={!!clip.grain}
                onChange={(e) => handleChange('grain', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
