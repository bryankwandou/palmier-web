import React, { useState } from 'react';
import { Sparkles, Wand2, PlayCircle, Sliders, RefreshCw, Layers } from 'lucide-react';

export default function AIGenerativeStudio({ onGenerateClip }) {
  const [prompt, setPrompt] = useState('Cinematic drone sweep over a neon cyber city at twilight, 8k octane render');
  const [model, setModel] = useState('Kling 1.5 Pro');
  const [duration, setDuration] = useState(5.0);
  const [motionScale, setMotionScale] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    setTimeout(() => {
      const generatedClip = {
        id: `ai-gen-${Date.now()}`,
        name: `AI: ${prompt.slice(0, 24)}...`,
        trackId: 'V1',
        startTime: 0, // will be appended by parent
        duration: Number(duration),
        type: 'video',
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&q=80',
        model: model,
        opacity: 1,
        scale: 1,
        volume: 1,
        speed: 1,
        exposure: 0,
        contrast: 15,
        saturation: 25,
      };

      onGenerateClip(generatedClip);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)', fontSize: '13px', fontWeight: '700' }}>
        <Sparkles size={16} />
        <span>Generative AI Engine</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>AI Video Model</label>
        <select 
          value={model} 
          onChange={(e) => setModel(e.target.value)}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="Kling 1.5 Pro">Kling 1.5 Pro (Photorealistic Motion)</option>
          <option value="Seedance Video v2">Seedance Video v2 (Dynamic Camera)</option>
          <option value="Nano Banana Pro">Nano Banana Pro (Stylized VFX)</option>
          <option value="Sora Motion v1">Sora Motion v1 (Complex Physics)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>Scene Prompt</label>
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the shot, lighting, atmosphere, lens, and motion..."
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            lineHeight: '1.4'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Duration</span>
            <span>{duration}s</span>
          </div>
          <input 
            type="range" 
            min="3" 
            max="12" 
            step="1"
            value={duration} 
            onChange={(e) => setDuration(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Motion Scale</span>
            <span>{motionScale}/10</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={motionScale} 
            onChange={(e) => setMotionScale(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {['Cyberpunk', 'Cinematic Drone', 'Anime Makoto', 'Hyperlapse', 'Macro Lens'].map((preset) => (
          <button 
            key={preset}
            onClick={() => setPrompt(`A breathtaking ${preset.toLowerCase()} video sequence, 4k ultra-detailed, smooth cinematic camera motion`)}
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '9999px',
              cursor: 'pointer'
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{
          marginTop: 'auto',
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
          border: 'none',
          color: '#fff',
          padding: '10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          fontWeight: '600',
          cursor: isGenerating ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isGenerating ? 0.7 : 1,
          transition: 'opacity 0.15s ease'
        }}
      >
        {isGenerating ? (
          <>
            <RefreshCw size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Synthesizing Clip...</span>
          </>
        ) : (
          <>
            <Wand2 size={14} />
            <span>Generate to Timeline</span>
          </>
        )}
      </button>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
