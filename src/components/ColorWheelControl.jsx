import React, { useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * Palmier Pro 3-Way Color Wheel Control
 * Faithful to Sources/PalmierPro/Inspector/Components/Adjust/ColorWheelControl.swift & ColorWheelPad.swift
 * Provides interactive 2D puck dragging in chromatic disk + master luminance slider.
 */
export default function ColorWheelControl({
  title = 'LIFT',
  x = 0,
  y = 0,
  master = 0,
  masterMin = -0.5,
  masterMax = 0.5,
  onColorChange,
  onMasterChange,
  onReset
}) {
  const padRef = useRef(null);
  const isDragging = useRef(false);

  const radius = 46;
  const size = radius * 2;
  const centerX = radius;
  const centerY = radius;

  // Puck coordinate in element space
  const puckX = centerX + x * radius;
  const puckY = centerY - y * radius;

  const updateFromPointer = (clientX, clientY) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const locX = clientX - rect.left;
    const locY = clientY - rect.top;

    let vx = (locX - centerX) / radius;
    let vy = (centerY - locY) / radius;
    const mag = Math.sqrt(vx * vx + vy * vy);
    if (mag > 1) {
      vx /= mag;
      vy /= mag;
    }
    if (onColorChange) {
      onColorChange(parseFloat(vx.toFixed(3)), parseFloat(vy.toFixed(3)));
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updateFromPointer(e.clientX, e.clientY);

    const onMouseMove = (moveEvent) => {
      if (isDragging.current) {
        updateFromPointer(moveEvent.clientX, moveEvent.clientY);
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleDoubleClick = () => {
    if (onReset) onReset();
    else if (onColorChange) onColorChange(0, 0);
  };

  return (
    <div className="color-wheel-unit">
      <div className="wheel-unit-header">
        <span className="wheel-title">{title}</span>
        <button 
          className="wheel-reset-btn" 
          onClick={handleDoubleClick}
          title={`Reset ${title}`}
        >
          <RotateCcw size={10} />
        </button>
      </div>

      {/* Circular Chromatic Pad */}
      <div 
        ref={padRef}
        className="wheel-pad-disk"
        style={{ width: `${size}px`, height: `${size}px` }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* Conic Hue Disc */}
        <div className="wheel-hue-disc" />

        {/* Center Radial Desaturation Mask */}
        <div className="wheel-radial-overlay" />

        {/* Hairline Crosshair */}
        <div className="wheel-crosshair-h" />
        <div className="wheel-crosshair-v" />

        {/* Outer Ring */}
        <div className="wheel-outer-ring" />

        {/* Draggable Puck */}
        <div 
          className="wheel-puck"
          style={{
            transform: `translate(${puckX - 5}px, ${puckY - 5}px)`
          }}
        />
      </div>

      {/* Master Luminance Slider */}
      <div className="wheel-slider-container">
        <input 
          type="range"
          min={masterMin}
          max={masterMax}
          step="0.02"
          value={master}
          onChange={(e) => onMasterChange && onMasterChange(parseFloat(e.target.value))}
          className="wheel-master-slider"
        />
        <span className="wheel-readout">
          {master > 0 ? `+${master.toFixed(2)}` : master.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
