import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Volume2, 
  Type, 
  Layers, 
  RotateCcw, 
  Sun, 
  Contrast, 
  Eye, 
  Wand2, 
  Scissors, 
  ArrowUpRight, 
  Music, 
  Mic, 
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Film
} from 'lucide-react';

export default function Inspector({ clip, onUpdateClip }) {
  const [activeTab, setActiveTab] = useState('adjust'); // 'adjust' | 'ai-edit' | 'audio' | 'text' | 'multicam'
  const [replaceSource, setReplaceSource] = useState(false);
  const [useTrimmed, setUseTrimmed] = useState(true);
  const [aiGeneratingAction, setAiGeneratingAction] = useState(null);

  if (!clip) {
    return (
      <aside className="palmier-inspector">
        <div className="inspector-header">
          <span>Inspector</span>
        </div>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'var(--text-disabled)', 
          fontSize: '12px', 
          padding: '24px', 
          textAlign: 'center',
          gap: '10px'
        }}>
          <Sliders size={28} strokeWidth={1.5} color="var(--border-medium)" />
          <span>Select a clip on the timeline to inspect parameters, color grade, AI transforms, and audio stems.</span>
        </div>
      </aside>
    );
  }

  const handleChange = (key, value) => {
    onUpdateClip(clip.id, { [key]: value });
  };

  const handleTriggerAI = (actionTitle) => {
    setAiGeneratingAction(actionTitle);
    setTimeout(() => {
      setAiGeneratingAction(null);
      if (actionTitle === 'Upscale') {
        handleChange('name', `${clip.name} (4K Upscaled)`);
      } else if (actionTitle === 'Denoise') {
        handleChange('denoise', 85);
      } else if (actionTitle === 'Reframe') {
        handleChange('scale', 1.4);
      }
    }, 1200);
  };

  return (
    <aside className="palmier-inspector">
      {/* Inspector Header with Clip Name & Badges */}
      <div className="inspector-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span style={{ 
            fontSize: '9px', 
            fontWeight: '700', 
            background: clip.type === 'video' ? 'var(--track-v1)' : clip.type === 'audio' ? 'var(--track-a1)' : 'var(--track-t1)',
            padding: '2px 5px',
            borderRadius: '2px',
            textTransform: 'uppercase',
            color: '#fff'
          }}>
            {clip.trackId || clip.type}
          </span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600', fontSize: '12px' }}>
            {clip.name}
          </span>
        </div>

        <button 
          title="Reset All Parameters" 
          className="btn-icon" 
          style={{ width: '22px', height: '22px' }}
          onClick={() => {
            onUpdateClip(clip.id, {
              scale: 1,
              posX: 0,
              posY: 0,
              rotation: 0,
              opacity: 1,
              exposure: 0,
              contrast: 0,
              saturation: 0,
              temp: 0,
              tint: 0,
              volume: 1,
              speed: 1,
            });
          }}
        >
          <RotateCcw size={11} />
        </button>
      </div>

      {/* 5-Tab Bar matching Palmier Pro Inspector */}
      <div className="inspector-tabs-bar">
        <button 
          className={`inspector-tab-btn ${activeTab === 'adjust' ? 'active' : ''}`}
          onClick={() => setActiveTab('adjust')}
        >
          <Sliders size={12} />
          <span>Adjust</span>
        </button>

        <button 
          className={`inspector-tab-btn ${activeTab === 'ai-edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-edit')}
        >
          <Sparkles size={12} />
          <span>AI Edit</span>
        </button>

        <button 
          className={`inspector-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <Volume2 size={12} />
          <span>Audio</span>
        </button>

        <button 
          className={`inspector-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <Type size={12} />
          <span>Text</span>
        </button>

        <button 
          className={`inspector-tab-btn ${activeTab === 'multicam' ? 'active' : ''}`}
          onClick={() => setActiveTab('multicam')}
        >
          <Layers size={12} />
          <span>Multi</span>
        </button>
      </div>

      {/* Inspector Body Content */}
      <div className="inspector-content">
        {/* ================= TAB 1: ADJUST ================= */}
        {activeTab === 'adjust' && (
          <div>
            {/* Timing & Speed */}
            <div className="inspector-group">
              <div className="inspector-group-title">Timing & Playback</div>
              <div className="inspector-row">
                <label>Start Point</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={clip.startTime.toFixed(2)} 
                    onChange={(e) => handleChange('startTime', Number(e.target.value))}
                    style={{ width: '70px' }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>s</span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Duration</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={clip.duration.toFixed(2)} 
                    onChange={(e) => handleChange('duration', Number(e.target.value))}
                    style={{ width: '70px' }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>s</span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Playback Speed</label>
                <select 
                  value={clip.speed || 1} 
                  onChange={(e) => handleChange('speed', Number(e.target.value))}
                  style={{ width: '90px' }}
                >
                  <option value={0.25}>0.25x (Slow)</option>
                  <option value={0.5}>0.5x (Half)</option>
                  <option value={1}>1.0x (Normal)</option>
                  <option value={1.5}>1.5x (Fast)</option>
                  <option value={2}>2.0x (Double)</option>
                  <option value={4}>4.0x (Hyper)</option>
                </select>
              </div>
            </div>

            {/* Transform */}
            <div className="inspector-group">
              <div className="inspector-group-title">Transform</div>
              <div className="inspector-row">
                <label>Scale</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="3.0" 
                    step="0.05"
                    value={clip.scale ?? 1} 
                    onChange={(e) => handleChange('scale', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {Math.round((clip.scale ?? 1) * 100)}%
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Position X / Y</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="number" 
                    value={clip.posX || 0} 
                    onChange={(e) => handleChange('posX', Number(e.target.value))}
                    style={{ width: '50px' }}
                    placeholder="X"
                  />
                  <input 
                    type="number" 
                    value={clip.posY || 0} 
                    onChange={(e) => handleChange('posY', Number(e.target.value))}
                    style={{ width: '50px' }}
                    placeholder="Y"
                  />
                </div>
              </div>

              <div className="inspector-row">
                <label>Rotation</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    step="1"
                    value={clip.rotation || 0} 
                    onChange={(e) => handleChange('rotation', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.rotation || 0}°
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Opacity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={clip.opacity ?? 1} 
                    onChange={(e) => handleChange('opacity', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {Math.round((clip.opacity ?? 1) * 100)}%
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Blend Mode</label>
                <select 
                  value={clip.blendMode || 'normal'} 
                  onChange={(e) => handleChange('blendMode', e.target.value)}
                  style={{ width: '100px' }}
                >
                  <option value="normal">Normal</option>
                  <option value="screen">Screen</option>
                  <option value="multiply">Multiply</option>
                  <option value="overlay">Overlay</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="difference">Difference</option>
                </select>
              </div>
            </div>

            {/* Basic Tone */}
            <div className="inspector-group">
              <div className="inspector-group-title">Basic Tone</div>
              <div className="inspector-row">
                <label>Exposure</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={clip.exposure || 0} 
                    onChange={(e) => handleChange('exposure', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {(clip.exposure || 0) > 0 ? `+${clip.exposure}` : clip.exposure || 0}
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Contrast</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={clip.contrast || 0} 
                    onChange={(e) => handleChange('contrast', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {(clip.contrast || 0) > 0 ? `+${clip.contrast}` : clip.contrast || 0}
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Highlights</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={clip.highlights || 0} 
                    onChange={(e) => handleChange('highlights', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.highlights || 0}
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Shadows</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={clip.shadows || 0} 
                    onChange={(e) => handleChange('shadows', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.shadows || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* White Balance & Presence */}
            <div className="inspector-group">
              <div className="inspector-group-title">White Balance & Presence</div>
              <div className="inspector-row">
                <label>Temperature</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={clip.temp || 0} 
                    onChange={(e) => handleChange('temp', Number(e.target.value))}
                    style={{ 
                      width: '80px',
                      accentColor: (clip.temp || 0) < 0 ? '#38bdf8' : '#f59e0b' 
                    }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.temp || 0}
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Tint</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={clip.tint || 0} 
                    onChange={(e) => handleChange('tint', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.tint || 0}
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Saturation</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    value={clip.saturation || 0} 
                    onChange={(e) => handleChange('saturation', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.saturation || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Stylize & Blur */}
            <div className="inspector-group">
              <div className="inspector-group-title">Stylize & Blur</div>
              <div className="inspector-row">
                <label>Gaussian Blur</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={clip.blur || 0} 
                    onChange={(e) => handleChange('blur', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.blur || 0}px
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Vignette</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={clip.vignette || 0} 
                    onChange={(e) => handleChange('vignette', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.vignette || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: AI EDIT ================= */}
        {activeTab === 'ai-edit' && (
          <div>
            {/* Scope Toggles */}
            <div style={{ 
              background: 'var(--bg-app)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '10px', 
              marginBottom: '12px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', cursor: 'pointer' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Replace clip source</span>
                <input 
                  type="checkbox" 
                  checked={replaceSource} 
                  onChange={(e) => setReplaceSource(e.target.checked)}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', cursor: 'pointer' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Use trimmed portion only</span>
                <input 
                  type="checkbox" 
                  checked={useTrimmed} 
                  onChange={(e) => setUseTrimmed(e.target.checked)}
                />
              </label>
            </div>

            {/* AI Visual Actions Grid */}
            <div className="inspector-group">
              <div className="inspector-group-title">AI Enhance & Visual Models</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                {[
                  { id: 'upscale', title: 'Upscale', desc: 'Enhance to 4K 60fps' },
                  { id: 'flux', title: 'FLUX Enhance', desc: 'Re-render full quality' },
                  { id: 'reframe', title: 'Reframe', desc: 'Auto 9:16 or 16:9' },
                  { id: 'lipsync', title: 'Lip Sync', desc: 'Match voice audio' },
                  { id: 'edit', title: 'AI Inpaint', desc: 'Prompt transform' },
                  { id: 'rerun', title: 'Rerun Model', desc: 'Regenerate seed' },
                ].map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleTriggerAI(action.title)}
                    disabled={aiGeneratingAction !== null}
                    style={{
                      background: 'var(--bg-panel-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff' }}>{action.title}</span>
                      <Wand2 size={11} color="var(--accent-blue)" />
                    </div>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                      {aiGeneratingAction === action.title ? 'Processing...' : action.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Audio Actions Grid */}
            <div className="inspector-group">
              <div className="inspector-group-title">AI Audio Intelligence</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                {[
                  { id: 'denoise', title: 'Denoise', desc: 'Remove room reverb' },
                  { id: 'dubbing', title: 'AI Dubbing', desc: 'Translate & voice-clone' },
                  { id: 'score', title: 'Score Music', desc: 'Generate soundtrack' },
                  { id: 'sfx', title: 'SFX Match', desc: 'Contextual sound effects' },
                ].map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleTriggerAI(action.title)}
                    disabled={aiGeneratingAction !== null}
                    style={{
                      background: 'var(--bg-panel-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff' }}>{action.title}</span>
                      <Sparkles size={11} color="var(--accent-purple)" />
                    </div>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                      {aiGeneratingAction === action.title ? 'Synthesizing...' : action.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: AUDIO ================= */}
        {activeTab === 'audio' && (
          <div>
            {/* Audio Levels */}
            <div className="inspector-group">
              <div className="inspector-group-title">Levels & Envelopes</div>
              <div className="inspector-row">
                <label>Volume</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.05"
                    value={clip.volume ?? 1} 
                    onChange={(e) => handleChange('volume', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {Math.round((clip.volume ?? 1) * 100)}%
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Fade In (s)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  max="5"
                  value={clip.fadeIn || 0} 
                  onChange={(e) => handleChange('fadeIn', Number(e.target.value))}
                  style={{ width: '60px' }}
                />
              </div>

              <div className="inspector-row">
                <label>Fade Out (s)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  max="5"
                  value={clip.fadeOut || 0} 
                  onChange={(e) => handleChange('fadeOut', Number(e.target.value))}
                  style={{ width: '60px' }}
                />
              </div>
            </div>

            {/* Denoise & Enhancement */}
            <div className="inspector-group">
              <div className="inspector-group-title">AI Audio Clean & EQ</div>
              <div className="inspector-row">
                <label>Studio Denoise</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={clip.denoise || 0} 
                    onChange={(e) => handleChange('denoise', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.denoise || 0}%
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Low Bass (100Hz)</label>
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  value={clip.eqBass || 0} 
                  onChange={(e) => handleChange('eqBass', Number(e.target.value))}
                  style={{ width: '80px' }}
                />
              </div>

              <div className="inspector-row">
                <label>Mid Vocals (1kHz)</label>
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  value={clip.eqMid || 0} 
                  onChange={(e) => handleChange('eqMid', Number(e.target.value))}
                  style={{ width: '80px' }}
                />
              </div>

              <div className="inspector-row">
                <label>High Treble (10kHz)</label>
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  value={clip.eqTreble || 0} 
                  onChange={(e) => handleChange('eqTreble', Number(e.target.value))}
                  style={{ width: '80px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: TEXT ================= */}
        {activeTab === 'text' && (
          <div>
            <div className="inspector-group">
              <div className="inspector-group-title">Text Content</div>
              <textarea 
                value={clip.text || clip.name}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Enter title or caption text..."
                style={{
                  width: '100%',
                  minHeight: '70px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginBottom: '10px'
                }}
              />
            </div>

            <div className="inspector-group">
              <div className="inspector-group-title">Typography & Style</div>
              <div className="inspector-row">
                <label>Font Size</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <input 
                    type="range" 
                    min="14" 
                    max="72" 
                    value={clip.fontSize || 28} 
                    onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
                    {clip.fontSize || 28}px
                  </span>
                </div>
              </div>

              <div className="inspector-row">
                <label>Font Weight</label>
                <select 
                  value={clip.fontWeight || '700'} 
                  onChange={(e) => handleChange('fontWeight', e.target.value)}
                  style={{ width: '90px' }}
                >
                  <option value="400">Regular (400)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>

              <div className="inspector-row">
                <label>Text Color</label>
                <input 
                  type="color" 
                  value={clip.color || '#ffffff'} 
                  onChange={(e) => handleChange('color', e.target.value)}
                  style={{ width: '36px', height: '24px', padding: 0, cursor: 'pointer' }}
                />
              </div>

              <div className="inspector-row">
                <label>Animation Preset</label>
                <select 
                  value={clip.textAnim || 'pop'} 
                  onChange={(e) => handleChange('textAnim', e.target.value)}
                  style={{ width: '110px' }}
                >
                  <option value="pop">Viral Pop (Hormozi)</option>
                  <option value="typewriter">Typewriter</option>
                  <option value="slide-up">Slide Up</option>
                  <option value="karaoke">Karaoke Highlight</option>
                  <option value="fade">Subtle Fade</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: MULTICAM ================= */}
        {activeTab === 'multicam' && (
          <div>
            <div className="inspector-group">
              <div className="inspector-group-title">Camera Angles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {[
                  { angle: 'Angle 1 (Wide Main)', offset: '+0.00s', sync: '100%', isMaster: true },
                  { angle: 'Angle 2 (Close Up Cam)', offset: '+0.04s', sync: '98%', isMaster: false },
                  { angle: 'Angle 3 (Overhead 4K)', offset: '-0.12s', sync: '96%', isMaster: false },
                ].map((cam, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'var(--bg-panel-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff' }}>{cam.angle}</span>
                        {cam.isMaster && (
                          <span style={{ fontSize: '9px', background: 'var(--accent-amber)', color: '#000', padding: '1px 4px', borderRadius: '2px', fontWeight: '700' }}>MASTER</span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Offset: {cam.offset} &middot; Sync: {cam.sync}
                      </div>
                    </div>

                    <button 
                      className="btn-icon" 
                      style={{ fontSize: '10px', padding: '4px 8px', height: 'auto', background: 'var(--bg-app)' }}
                      onClick={() => handleChange('name', `${clip.name} [${cam.angle}]`)}
                    >
                      Cut To
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
