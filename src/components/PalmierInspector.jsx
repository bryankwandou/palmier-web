import React, { useState } from 'react';
import { Sliders, Volume2, FastForward, Move, Eye, RotateCw } from 'lucide-react';

export default function PalmierInspector({ selectedClip }) {
  const [volume, setVolume] = useState(0.0);
  const [fadeIn, setFadeIn] = useState(0.0);
  const [fadeOut, setFadeOut] = useState(0.0);
  const [speed, setSpeed] = useState(1.0);

  const [scale, setScale] = useState(100);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);

  return (
    <div className="palmier-native-inspector">
      <div className="inspector-top-header">
        <span className="inspector-heading">Inspector</span>
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
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{volume.toFixed(1)} dB</span>
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
                value={fadeIn} 
                onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{fadeIn.toFixed(2)} s</span>
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
                value={fadeOut} 
                onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{fadeOut.toFixed(2)} s</span>
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
                value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{speed.toFixed(2)}x</span>
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
                value={scale} 
                onChange={(e) => setScale(parseInt(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{scale}%</span>
            </div>
          </div>

          <div className="param-row">
            <span className="param-label">Position X</span>
            <div className="param-control">
              <input 
                type="number" 
                value={posX} 
                onChange={(e) => setPosX(parseInt(e.target.value))}
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
                value={posY} 
                onChange={(e) => setPosY(parseInt(e.target.value))}
                className="param-number-input"
              />
              <span className="param-value">px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
