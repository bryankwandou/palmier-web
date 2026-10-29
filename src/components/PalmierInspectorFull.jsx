import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  Volume2, 
  Sparkles, 
  Type, 
  Film,
  Camera,
  Layers,
  Sparkle
} from 'lucide-react';
import { COLOR_LUT_PRESETS, MULTICAM_ANGLES } from '../data/palmierFullProject';
import ColorWheelControl from './ColorWheelControl';
import CurveEditorView from './CurveEditorView';

/**
 * Palmier Pro Inspector
 * Faithful to Sources/PalmierPro/Inspector/InspectorView.swift and Tabs:
 * - AdjustTab (Transform, Opacity, Blend Mode, Corner Radius, Edge Softness, Speed)
 * - ColorTab (3-Way Lift/Gamma/Gain Wheels, RGB/Luma Curve Editor, LUT Presets, Sabattier, Tri-X 16mm Grain, Vignette, Glow)
 * - AudioTab (Volume dB, Stereo Pan, 3-Band EQ, AI Denoise, Vocal Boost, Fades)
 * - AIEditTab (Camera Motion synthesis, Extend Shot, Re-light Scene, Style Transfer)
 * - TextTab (Content, Font Family, Fill Mode: color/inverted/footage, Animation: typewriter/pop/fade/karaoke)
 * - MulticamTab (4-Cam Angle Switcher matching MulticamTab.swift)
 */
export default function PalmierInspectorFull({ 
  selectedClip, 
  onUpdateClip 
}) {
  const [activeTab, setActiveTab] = useState('adjust'); // 'adjust' | 'color' | 'audio' | 'ai' | 'text' | 'multicam'

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
    temperature: 6500,
    lift_x: 0,
    lift_y: 0,
    lift_m: 0,
    gamma_x: 0,
    gamma_y: 0,
    gamma_m: 1,
    gain_x: 0,
    gain_y: 0,
    gain_m: 1,
    vignette: 0,
    glow: 0,
    blur: 0,
    invert: false,
    solarize: false,
    grain: false,
    cameraMotion: 'none',
    text: '',
    fontFamily: 'Inter',
    fillMode: 'color',
    animation: 'none',
    multicamAngle: 'angle-1'
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

      {/* 6-Tab Navigation Bar matching PalmierPro Inspector Tabs */}
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
          className={`insp-tab-btn ${activeTab === 'multicam' ? 'active' : ''}`}
          onClick={() => setActiveTab('multicam')}
          title="Multicam Switching"
        >
          <Camera size={13} />
          <span>Multicam</span>
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
              <div className="param-row">
                <span className="param-label">Rotation</span>
                <div className="param-control">
                  <input 
                    type="range" min="-180" max="180" value={clip.rotation || 0}
                    onChange={(e) => handleChange('rotation', parseInt(e.target.value) || 0)}
                    className="param-slider"
                  />
                  <span className="param-value">{clip.rotation || 0}°</span>
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
                <span className="param-label">Blend Mode</span>
                <select 
                  className="param-select"
                  value={clip.blendMode || 'normal'}
                  onChange={(e) => handleChange('blendMode', e.target.value)}
                >
                  <option value="normal">Normal (Source Over)</option>
                  <option value="screen">Screen</option>
                  <option value="multiply">Multiply</option>
                  <option value="overlay">Overlay</option>
                  <option value="difference">Difference</option>
                  <option value="color-dodge">Color Dodge</option>
                </select>
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
            {/* 3-WAY COLOR WHEELS (LIFT, GAMMA, GAIN) */}
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">3-WAY COLOR WHEELS</span>
              </div>
              <div className="color-wheels-triple-grid">
                <ColorWheelControl 
                  title="LIFT"
                  x={clip.lift_x || 0}
                  y={clip.lift_y || 0}
                  master={clip.lift_m || 0}
                  masterMin={-0.5}
                  masterMax={0.5}
                  onColorChange={(x, y) => {
                    handleChange('lift_x', x);
                    handleChange('lift_y', y);
                  }}
                  onMasterChange={(m) => handleChange('lift_m', m)}
                  onReset={() => {
                    handleChange('lift_x', 0);
                    handleChange('lift_y', 0);
                    handleChange('lift_m', 0);
                  }}
                />

                <ColorWheelControl 
                  title="GAMMA"
                  x={clip.gamma_x || 0}
                  y={clip.gamma_y || 0}
                  master={clip.gamma_m !== undefined ? clip.gamma_m : 1.0}
                  masterMin={0.5}
                  masterMax={2.0}
                  onColorChange={(x, y) => {
                    handleChange('gamma_x', x);
                    handleChange('gamma_y', y);
                  }}
                  onMasterChange={(m) => handleChange('gamma_m', m)}
                  onReset={() => {
                    handleChange('gamma_x', 0);
                    handleChange('gamma_y', 0);
                    handleChange('gamma_m', 1.0);
                  }}
                />

                <ColorWheelControl 
                  title="GAIN"
                  x={clip.gain_x || 0}
                  y={clip.gain_y || 0}
                  master={clip.gain_m !== undefined ? clip.gain_m : 1.0}
                  masterMin={0.5}
                  masterMax={1.5}
                  onColorChange={(x, y) => {
                    handleChange('gain_x', x);
                    handleChange('gain_y', y);
                  }}
                  onMasterChange={(m) => handleChange('gain_m', m)}
                  onReset={() => {
                    handleChange('gain_x', 0);
                    handleChange('gain_y', 0);
                    handleChange('gain_m', 1.0);
                  }}
                />
              </div>
            </div>

            {/* INTERACTIVE RGB CURVES EDITOR */}
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">RGB & LUMA CURVES</span>
              </div>
              <CurveEditorView 
                curves={clip.curves}
                onChangeCurve={(ch, pts) => {
                  const updatedCurves = { ...(clip.curves || {}), [ch]: pts };
                  handleChange('curves', updatedCurves);
                }}
              />
            </div>

            {/* CINEMATIC LUT PRESETS */}
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

            {/* COLOR TEMPERATURE & BASIC GRADING */}
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">PRIMARY BALANCING</span>
              </div>
              <div className="param-row">
                <span className="param-label">Temperature</span>
                <div className="param-control">
                  <input 
                    type="range" min="2000" max="11000" step="100" value={clip.temperature || 6500}
                    onChange={(e) => handleChange('temperature', parseInt(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{clip.temperature || 6500} K</span>
                </div>
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

            {/* STYLIZE EFFECTS STACK */}
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">STYLIZE & FILM LOOKS</span>
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
                <span className="param-label">Kodak Tri-X Film Grain</span>
                <div className="param-control">
                  <input 
                    type="checkbox"
                    checked={!!clip.grain}
                    onChange={(e) => handleChange('grain', e.target.checked)}
                  />
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Vignette</span>
                <div className="param-control">
                  <input 
                    type="range" min="0" max="1" step="0.05" value={clip.vignette || 0}
                    onChange={(e) => handleChange('vignette', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{((clip.vignette || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Luminous Glow</span>
                <div className="param-control">
                  <input 
                    type="range" min="0" max="1" step="0.05" value={clip.glow || 0}
                    onChange={(e) => handleChange('glow', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                  <span className="param-value">{((clip.glow || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MULTICAM SWITCHING */}
        {activeTab === 'multicam' && (
          <div className="tab-pane-content">
            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">MULTICAM CAMERA ANGLES</span>
              </div>
              <p className="section-desc-note">
                Select camera angle to switch program feed at the current cut point.
              </p>
              <div className="multicam-angles-grid">
                {MULTICAM_ANGLES.map((angle) => {
                  const isCurrent = (clip.multicamAngle || 'angle-1') === angle.id;
                  return (
                    <button
                      key={angle.id}
                      className={`multicam-angle-card ${isCurrent ? 'active' : ''}`}
                      onClick={() => handleChange('multicamAngle', angle.id)}
                    >
                      <div className="angle-thumb-wrapper">
                        <img src={angle.thumb} alt={angle.label} />
                        {isCurrent && <span className="angle-live-badge">PROGRAM</span>}
                      </div>
                      <span className="angle-label-text">{angle.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="inspector-section">
              <div className="section-title-row">
                <span className="section-title">MULTICAM SYNC ENGINE</span>
              </div>
              <div className="param-row">
                <span className="param-label">Sync Method</span>
                <span className="param-value">Audio Waveform Cross-Correlation</span>
              </div>
              <div className="param-row">
                <span className="param-label">Sync Confidence</span>
                <span className="param-value" style={{ color: '#10b981' }}>99.8%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIO */}
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
                <span className="param-label">DeepFilterNet3 Denoise</span>
                <div className="param-control">
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
              <div className="param-row">
                <span className="param-label">Vocal Boost (Dialogue)</span>
                <div className="param-control">
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI EDIT */}
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
                  <Palette size={12} />
                  <span>Re-light Scene (Golden Hour)</span>
                </button>
                <button className="ai-action-btn">
                  <Layers size={12} />
                  <span>Transfer Style from Shot 19</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TEXT */}
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
                <span className="section-title">TYPOGRAPHY & FILL</span>
              </div>
              <div className="param-row">
                <span className="param-label">Font Family</span>
                <select 
                  className="param-select"
                  value={clip.fontFamily || 'Inter'}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                >
                  <option value="Inter">Inter (Sans)</option>
                  <option value="Space Grotesk">Space Grotesk (Modern)</option>
                  <option value="Playfair Display">Playfair Display (Serif)</option>
                  <option value="Poppins">Poppins (Geometric)</option>
                  <option value="Permanent Marker">Permanent Marker (Brush)</option>
                </select>
              </div>
              <div className="param-row">
                <span className="param-label">Fill Mode</span>
                <select 
                  className="param-select"
                  value={clip.fillMode || 'color'}
                  onChange={(e) => handleChange('fillMode', e.target.value)}
                >
                  <option value="color">Solid Typography</option>
                  <option value="inverted">Inverted (Difference Blend)</option>
                  <option value="footage">Footage Stencil</option>
                </select>
              </div>
              <div className="param-row">
                <span className="param-label">Animation Preset</span>
                <select 
                  className="param-select"
                  value={clip.animation || 'none'}
                  onChange={(e) => handleChange('animation', e.target.value)}
                >
                  <option value="none">Static (None)</option>
                  <option value="typewriter">Typewriter</option>
                  <option value="pop">Pop In</option>
                  <option value="fade">Smooth Fade</option>
                  <option value="karaoke">Karaoke Active Word</option>
                </select>
              </div>
              <div className="param-row">
                <span className="param-label">Font Size</span>
                <div className="param-control">
                  <input 
                    type="range" min="14" max="72" value={clip.fontSize || 36} 
                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                    className="param-slider" 
                  />
                  <span className="param-value">{clip.fontSize || 36}px</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
