import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  Volume2, 
  Sparkles, 
  Type, 
  Check, 
  RotateCw,
  Eye,
  Film
} from 'lucide-react';
import { COLOR_LUT_PRESETS } from '../data/palmierFullProject';

export default function PalmierInspectorFull({ 
  selectedClip, 
  onUpdateClip 
}) {
  const [activeTab, setActiveTab] = useState('adjust'); // 'adjust' | 'color' | 'audio' | 'ai' | 'text'

  const clip = selectedClip || {
    id: 'default',
    name: 'juicyma',
    scale: 100,
    posX: 0,
    posY: 0,
    rotation: 0,
    opacity: 100,
    blendMode: 'normal',
    edgeRounding: 0,
    edgeSoftness: 0,
    volumeDb: 0.0,
    fadeIn: 0.0,
    fadeOut: 0.0,
    speed: 1.0,
    exposure: 0.0,
    contrast: 1.0,
    saturation: 1.0,
    temperature: 0,
    solarize: false,
    grain: false,
    cameraMotion: 'none',
    text: ''
  };

  const handleChange = (key, value) => {
    if (onUpdateClip && selectedClip) {
      onUpdateClip(selectedClip.id, { [key]: value });
    }
  };

  const applyLut = (lut) => {
    if (onUpdateClip && selectedClip) {
      onUpdateClip(selectedClip.id, {
        exposure: lut.exposure,
        contrast: lut.contrast,
        saturation: lut.saturation,
        grain: lut.grain,
        solarize: lut.solarize
      });
    }
  };

  return (
    <div className="palmier-native-inspector">
      {/* Top Header */}
      <div className="inspector-top-header">
        <span className="inspector-heading">
          Inspector {selectedClip ? `— ${selectedClip.name}` : ''}
        </span>
      </div>

      {/* 5-Tab Navigation Bar matching PalmierPro Inspector Tabs */}
      <div className="inspector-tabs-navbar">
        <button 
          className={`insp-tab-btn ${activeTab === 'adjust' ? 'active' : ''}`}
          onClick={() => setActiveTab('adjust')}
          title="Adjust & Transform"
        >
          <Sliders size={13} />
          <span>Adjust</span>
        </button>

        <button 
          className={`insp-tab-btn ${activeTab === 'color' ? 'active' : ''}`}
          onClick={() => setActiveTab('color')}
          title="Color & LUTs"
        >
          <Palette size={13} />
          <span>Color</span>
        </button>

        <button 
          className={`insp-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
          title="Audio & EQ"
        >
          <Volume2 size={13} />
          <span>Audio</span>
        </button>

        <button 
          className={`insp-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          title="AI Generative Edit"
        >
          <Sparkles size={13} />
          <span>AI Edit</span>
        </button>

        <button 
          className={`insp-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
          title="Text & Captions"
        >
          <Type size={13} />
          <span>Text</span>
        </button>
      </div>

      {/* Scrollable Content Container */}
      <div className="inspector-content-scroll">
        {/* TAB 1: ADJUST */}
        {activeTab === 'adjust' && (
          <div className="tab-pane-content">
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">TRANSFORM</span>
              </div>
              <div className="param-row">
                <span className="param-label">Scale</span>
                <div className="param-control">
                  <input 
                    type="range" min="10" max="250" value={clip.scale || 100}
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
                    type="number" value={clip.posX || 0}
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
                    type="number" value={clip.posY || 0}
                    onChange={(e) => handleChange('posY', parseInt(e.target.value) || 0)}
                    className="param-number-input"
                  />
                  <span className="param-value">px</span>
                </div>
              </div>
            </div>

            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">OPACITY & COMPOSITING</span>
              </div>
              <div className="param-row">
                <span className="param-label">Opacity</span>
                <div className="param-control">
                  <input 
                    type="range" min="0" max="100" value={clip.opacity !== undefined ? clip.opacity : 100}
                    onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{clip.opacity !== undefined ? clip.opacity : 100}%</span>
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Edge Rounding</span>
                <div className="param-control">
                  <input 
                    type="range" min="0" max="50" value={clip.edgeRounding || 0}
                    onChange={(e) => handleChange('edgeRounding', parseInt(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{clip.edgeRounding || 0}px</span>
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Edge Softness</span>
                <div className="param-control">
                  <input 
                    type="range" min="0" max="30" value={clip.edgeSoftness || 0}
                    onChange={(e) => handleChange('edgeSoftness', parseInt(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{clip.edgeSoftness || 0}px</span>
                </div>
              </div>
            </div>

            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">PLAYBACK SPEED</span>
              </div>
              <div className="param-row">
                <span className="param-label">Speed</span>
                <div className="param-control">
                  <input 
                    type="range" min="0.25" max="4" step="0.25" value={clip.speed || 1.0}
                    onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{(clip.speed || 1.0).toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLOR */}
        {activeTab === 'color' && (
          <div className="tab-pane-content">
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">CINEMATIC LUT PRESETS</span>
              </div>
              <div className="lut-chips-grid">
                {COLOR_LUT_PRESETS.map((lut) => (
                  <button 
                    key={lut.id}
                    className="lut-chip-btn"
                    onClick={() => applyLut(lut)}
                  >
                    <Film size={11} />
                    <span>{lut.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">COLOR GRADING</span>
              </div>
              <div className="param-row">
                <span className="param-label">Exposure</span>
                <div className="param-control">
                  <input 
                    type="range" min="-2" max="2" step="0.1" value={clip.exposure || 0}
                    onChange={(e) => handleChange('exposure', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{(clip.exposure || 0).toFixed(1)} EV</span>
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Contrast</span>
                <div className="param-control">
                  <input 
                    type="range" min="0.5" max="2.5" step="0.1" value={clip.contrast || 1.0}
                    onChange={(e) => handleChange('contrast', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{(clip.contrast || 1.0).toFixed(1)}</span>
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Saturation</span>
                <div className="param-control">
                  <input 
                    type="range" min="0" max="2" step="0.05" value={clip.saturation !== undefined ? clip.saturation : 1.0}
                    onChange={(e) => handleChange('saturation', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{(clip.saturation !== undefined ? clip.saturation : 1.0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">FILM EMULSION (SHOT 19)</span>
              </div>
              <div className="param-row">
                <span className="param-label">Sabattier Solarization</span>
                <div className="param-control">
                  <input 
                    type="checkbox"
                    checked={!!clip.solarize}
                    onChange={(e) => handleChange('solarize', e.target.checked)}
                  />
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Kodak Tri-X Film Grain</span>
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
        )}

        {/* TAB 3: AUDIO */}
        {activeTab === 'audio' && (
          <div className="tab-pane-content">
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">LEVELS & GAIN</span>
              </div>
              <div className="param-row">
                <span className="param-label">Volume</span>
                <div className="param-control">
                  <input 
                    type="range" min="-24" max="6" step="0.5" value={clip.volumeDb !== undefined ? clip.volumeDb : 0.0}
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
                    type="range" min="0" max="5" step="0.1" value={clip.fadeIn || 0.0}
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
                    type="range" min="0" max="5" step="0.1" value={clip.fadeOut || 0.0}
                    onChange={(e) => handleChange('fadeOut', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{(clip.fadeOut || 0.0).toFixed(2)} s</span>
                </div>
              </div>
            </div>

            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">VOCAL DENOISE & ISOLATION</span>
              </div>
              <div className="param-row">
                <span className="param-label">AI Denoise</span>
                <div className="param-control">
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Vocal Boost</span>
                <div className="param-control">
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI EDIT */}
        {activeTab === 'ai' && (
          <div className="tab-pane-content">
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">CAMERA MOTION SYNTHESIS</span>
              </div>
              <div className="camera-motion-grid">
                {['Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Zoom In', 'Zoom Out', 'Orbit 360', 'Static'].map((motion) => (
                  <button 
                    key={motion}
                    className={`motion-btn ${clip.cameraMotion === motion ? 'active' : ''}`}
                    onClick={() => handleChange('cameraMotion', motion)}
                  >
                    <span>{motion}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">GENERATIVE ACTIONS</span>
              </div>
              <div className="ai-actions-col">
                <button className="ai-action-btn">
                  <Sparkles size={12} />
                  <span>Extend Shot (+3s Outpainting)</span>
                </button>
                <button className="ai-action-btn">
                  <RotateCw size={12} />
                  <span>Re-light Scene (Golden Hour)</span>
                </button>
                <button className="ai-action-btn">
                  <Palette size={12} />
                  <span>Transfer Style from Shot 19</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TEXT */}
        {activeTab === 'text' && (
          <div className="tab-pane-content">
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">OVERLAY TEXT</span>
              </div>
              <textarea 
                rows={3}
                value={clip.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Enter caption or title text..."
                className="text-edit-area"
              />
            </div>

            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">TYPOGRAPHY</span>
              </div>
              <div className="param-row">
                <span className="param-label">Font Family</span>
                <select className="param-select">
                  <option>Inter</option>
                  <option>JetBrains Mono</option>
                  <option>Cinzel Decorative</option>
                  <option>Montserrat</option>
                </select>
              </div>
              <div className="param-row">
                <span className="param-label">Font Size</span>
                <div className="param-control">
                  <input type="range" min="14" max="72" defaultValue="28" className="param-slider" />
                  <span className="param-value">28px</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
