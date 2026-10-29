import React, { useState, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * Palmier Pro Interactive Curve Editor
 * Faithful to Sources/PalmierPro/Inspector/Components/Adjust/CurveEditorView.swift
 * Supports Master (Y), Red (R), Green (G), Blue (B) spline curve editing.
 */
export default function CurveEditorView({
  curves = {
    master: [[0, 0], [0.5, 0.5], [1, 1]],
    red: [[0, 0], [0.5, 0.5], [1, 1]],
    green: [[0, 0], [0.5, 0.5], [1, 1]],
    blue: [[0, 0], [0.5, 0.5], [1, 1]]
  },
  onChangeCurve
}) {
  const [activeChannel, setActiveChannel] = useState('master'); // 'master' | 'red' | 'green' | 'blue'
  const svgRef = useRef(null);
  const [selectedPointIdx, setSelectedPointIdx] = useState(1);

  const currentPoints = curves[activeChannel] || [[0, 0], [0.5, 0.5], [1, 1]];

  const channelColors = {
    master: '#e5e7eb',
    red: '#ef4444',
    green: '#10b981',
    blue: '#3b82f6'
  };

  const currentColor = channelColors[activeChannel];

  const handlePointerDown = (index, e) => {
    e.stopPropagation();
    setSelectedPointIdx(index);

    const onPointerMove = (moveEvt) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (moveEvt.clientX - rect.left) / rect.width;
      const rawY = 1 - (moveEvt.clientY - rect.top) / rect.height;

      const clampedX = Math.max(0, Math.min(1, parseFloat(rawX.toFixed(2))));
      const clampedY = Math.max(0, Math.min(1, parseFloat(rawY.toFixed(2))));

      const updated = currentPoints.map((pt, i) => {
        if (i === index) {
          // Keep ends pinned to x=0 and x=1 if boundary
          const newX = index === 0 ? 0 : index === currentPoints.length - 1 ? 1 : clampedX;
          return [newX, clampedY];
        }
        return pt;
      });

      if (onChangeCurve) {
        onChangeCurve(activeChannel, updated);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleReset = () => {
    const defaultPts = [[0, 0], [0.5, 0.5], [1, 1]];
    if (onChangeCurve) onChangeCurve(activeChannel, defaultPts);
  };

  // Convert points to SVG bezier path
  const p0 = currentPoints[0] || [0, 0];
  const p1 = currentPoints[1] || [0.5, 0.5];
  const p2 = currentPoints[2] || [1, 1];

  // Map 0..1 to viewBox 0..200
  const sx = (v) => v * 200;
  const sy = (v) => 200 - v * 200;

  const pathD = `M ${sx(p0[0])} ${sy(p0[1])} Q ${sx(p1[0])} ${sy(p1[1])} ${sx(p2[0])} ${sy(p2[1])}`;

  return (
    <div className="curve-editor-container">
      {/* Channel Selector Header */}
      <div className="curve-channel-strip">
        <div className="channel-btns-group">
          {[
            { id: 'master', label: 'Y' },
            { id: 'red', label: 'R' },
            { id: 'green', label: 'G' },
            { id: 'blue', label: 'B' }
          ].map((ch) => (
            <button
              key={ch.id}
              className={`curve-ch-btn ${activeChannel === ch.id ? 'active' : ''}`}
              style={{
                color: activeChannel === ch.id ? channelColors[ch.id] : undefined,
                borderColor: activeChannel === ch.id ? channelColors[ch.id] : undefined
              }}
              onClick={() => setActiveChannel(ch.id)}
            >
              {ch.label}
            </button>
          ))}
        </div>

        <button 
          className="curve-reset-btn" 
          onClick={handleReset}
          title="Reset Curve"
        >
          <RotateCcw size={11} />
        </button>
      </div>

      {/* SVG Curve Plot */}
      <div className="curve-canvas-box">
        <svg 
          ref={svgRef}
          viewBox="0 0 200 200" 
          className="curve-svg-canvas"
        >
          {/* Quarter Grid Lines */}
          <line x1="50" y1="0" x2="50" y2="200" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="150" y1="0" x2="150" y2="200" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="0" y1="150" x2="200" y2="150" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Linear Reference Diagonal */}
          <line x1="0" y1="200" x2="200" y2="0" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* Active Spline Curve */}
          <path d={pathD} fill="none" stroke={currentColor} strokeWidth="2.5" />

          {/* Interactive Control Points */}
          {currentPoints.map((pt, i) => {
            const cx = sx(pt[0]);
            const cy = sy(pt[1]);
            const isSel = selectedPointIdx === i;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={isSel ? 6 : 4.5}
                fill={isSel ? '#ffffff' : currentColor}
                stroke="#0a0a0e"
                strokeWidth="1.5"
                className="curve-control-handle"
                onPointerDown={(e) => handlePointerDown(i, e)}
              />
            );
          })}
        </svg>
      </div>

      <div className="curve-readout-row">
        <span>IN: {(currentPoints[selectedPointIdx]?.[0] * 100).toFixed(0)}%</span>
        <span>OUT: {(currentPoints[selectedPointIdx]?.[1] * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
