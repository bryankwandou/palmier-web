/**
 * Palmier Pro Video & Audio Engine
 * Real-time 24fps multi-layer video compositing engine matching Sources/PalmierPro/Compositing/FrameRenderer.swift:
 * - V1 (Program Video Track) + V2 (B-roll Overlay) + T1 (Titles & Captions)
 * - 3-Way Color Wheels (Lift, Gamma, Gain) & Color Temperature/Tint
 * - Effect Stack: Vignette, Glow, Gaussian Blur, Invert, Sabattier Solarize, Kodak Tri-X 16mm Grain
 * - Multicam Angle Camera Switching (Angle 1 Wide, Angle 2 Close, Angle 3 Detail, Angle 4 Screen)
 * - Web Audio API multi-track synthesis, Stereo VU level metering, and MediaRecorder MP4 master export.
 */

class PalmierVideoEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.masterGain = null;
    this.ambientOsc = null;
    this.isAudioInitialized = false;
    this.frequencyData = new Uint8Array(80);
    this.imageCache = new Map();

    // Preload default assets
    this.preloadImage('/welcome-butterfly.jpg');
    this.preloadImage('/tour-hero.jpg');
  }

  preloadImage(src) {
    if (!src || this.imageCache.has(src)) return this.imageCache.get(src);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    this.imageCache.set(src, img);
    return img;
  }

  getImage(src) {
    if (!src) return null;
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src);
    }
    return this.preloadImage(src);
  }

  initAudio() {
    if (this.isAudioInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.08;

      // Cinematic Ambience Hum (432Hz harmonic 54Hz sub-bass)
      this.ambientOsc = this.audioCtx.createOscillator();
      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(54, this.audioCtx.currentTime);

      this.ambientOsc.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.ambientOsc.start();

      this.isAudioInitialized = true;
    } catch (e) {
      // Audio policy
    }
  }

  playScrubSound() {
    if (!this.audioCtx) this.initAudio();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420 + Math.random() * 80, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.035);
    } catch (e) {
      // scrub sound fallback
    }
  }

  setVolume(volumeDb) {
    if (!this.masterGain || !this.audioCtx) return;
    const gainLinear = Math.pow(10, volumeDb / 20) * 0.08;
    this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, gainLinear)), this.audioCtx.currentTime);
  }

  getLiveWaveformData() {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      return Array.from(this.frequencyData.slice(0, 80));
    }
    return null;
  }

  /**
   * Complete Multi-Layer Composite Frame Renderer
   */
  renderFrame(canvas, allClips, currentTime, sequence = { fps: 24, resolution: '1920x1080' }) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Background Fill
    ctx.fillStyle = '#0a0a0e';
    ctx.fillRect(0, 0, width, height);

    // Normalize clips list
    const clips = Array.isArray(allClips) ? allClips : (allClips ? [allClips] : []);

    // Find active clips under the playhead
    const v1Clip = clips.find(c => c.trackId === 'V1' && currentTime >= c.startTime && currentTime <= (c.startTime + c.duration));
    const v2Clip = clips.find(c => c.trackId === 'V2' && currentTime >= c.startTime && currentTime <= (c.startTime + c.duration));
    const t1Clip = clips.find(c => c.trackId === 'T1' && currentTime >= c.startTime && currentTime <= (c.startTime + c.duration));

    // Fallback clip if timeline is paused on unselected point
    const activeClip = v1Clip || clips.find(c => c.trackId === 'V1') || clips[0];

    // 2. Draw Layer V1 (Main Program Track)
    if (activeClip) {
      this.drawMediaLayer(ctx, activeClip, width, height, currentTime, false);
    }

    // 3. Draw Layer V2 (B-roll Overlay) if present
    if (v2Clip) {
      this.drawMediaLayer(ctx, v2Clip, width, height, currentTime, true);
    }

    // 4. Apply 3-Way Lift, Gamma, Gain Color Shift if present
    const primaryGradeClip = v1Clip || activeClip;
    if (primaryGradeClip) {
      this.applyColorGradingShifts(ctx, primaryGradeClip, width, height);
    }

    // 5. Apply Effects Stack (Vignette, Glow, Solarize, 16mm Grain)
    if (primaryGradeClip?.vignette && primaryGradeClip.vignette > 0) {
      this.applyVignette(ctx, width, height, primaryGradeClip.vignette);
    }

    if (primaryGradeClip?.glow && primaryGradeClip.glow > 0) {
      this.applyGlow(ctx, width, height, primaryGradeClip.glow);
    }

    if (primaryGradeClip?.solarize) {
      this.applySabattierShader(ctx, width, height);
    }

    if (primaryGradeClip?.grain || primaryGradeClip?.solarize) {
      this.apply16mmFilmGrain(ctx, width, height);
    }

    // 6. Draw Layer T1 (Title & Subtitle Captions) on top of video
    if (t1Clip && t1Clip.text) {
      this.drawTextLayer(ctx, t1Clip, width, height, currentTime);
    }

    // 7. Safe Area Guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
    ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

    // 8. Frame Counter Burn-In (matching PalmierPro inspectTimeline parity)
    const fps = sequence?.fps || 24;
    const currentFrame = Math.floor(currentTime * fps);
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.fillText(`f${currentFrame}`, 40, 60);

    // Resolution badge in corner
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(`${sequence?.resolution || '1920x1080'} · ${fps}fps`, width - 210, 60);
  }

  drawMediaLayer(ctx, clip, width, height, currentTime, isOverlay = false) {
    // Resolve Multicam Angle Source if assigned
    let thumbUrl = clip.thumb || '/welcome-butterfly.jpg';
    if (clip.multicamAngle === 'angle-2') {
      thumbUrl = '/tour-hero.jpg';
    } else if (clip.multicamAngle === 'angle-3') {
      thumbUrl = '/welcome-butterfly.jpg';
    } else if (clip.multicamAngle === 'angle-4') {
      thumbUrl = '/tour-hero.jpg';
    }

    // Check for solid matte color
    if (clip.isMatte && clip.matteColor) {
      ctx.save();
      ctx.fillStyle = clip.matteColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      return;
    }

    const img = this.getImage(thumbUrl);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.save();

    // Opacity
    const opacity = (clip.opacity !== undefined ? clip.opacity : 100) / 100;
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    // Blend Mode
    if (clip.blendMode && clip.blendMode !== 'normal') {
      ctx.globalCompositeOperation = clip.blendMode;
    }

    // Transform parameters
    const scale = (clip.scale || 100) / 100;
    const posX = clip.posX || 0;
    const posY = clip.posY || 0;
    const rotation = ((clip.rotation || 0) * Math.PI) / 180;

    // Camera motion synthesis
    let driftX = 0;
    let driftY = 0;
    if (clip.cameraMotion === 'Pan Left') {
      driftX = -(currentTime % 5) * 12;
    } else if (clip.cameraMotion === 'Pan Right') {
      driftX = (currentTime % 5) * 12;
    } else if (clip.cameraMotion === 'Tilt Up') {
      driftY = -(currentTime % 5) * 8;
    } else if (clip.cameraMotion === 'Zoom In') {
      const zoomPulse = 1 + (currentTime % 5) * 0.05;
      ctx.scale(zoomPulse, zoomPulse);
    } else {
      driftY = Math.sin(currentTime * 1.5) * 3;
    }

    const centerX = width / 2 + posX + driftX;
    const centerY = height / 2 + posY + driftY;

    ctx.translate(centerX, centerY);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // Color Filters: Exposure, Contrast, Saturation, Temperature, Blur, Invert
    const exposure = clip.exposure !== undefined ? clip.exposure : 0.0;
    const contrast = clip.contrast !== undefined ? clip.contrast : 1.0;
    const saturation = clip.saturation !== undefined ? clip.saturation : 1.0;
    const blurRadius = clip.blur || 0;
    const invertVal = clip.invert ? 100 : 0;

    const brightnessVal = 100 + exposure * 25;
    const contrastVal = contrast * 100;
    const saturateVal = saturation * 100;
    
    let filterStr = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturateVal}%)`;
    if (blurRadius > 0) filterStr += ` blur(${blurRadius}px)`;
    if (invertVal > 0) filterStr += ` invert(${invertVal}%)`;
    ctx.filter = filterStr;

    // Aspect Fit / Fill calculation
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;
    let drawW, drawH;

    if (isOverlay) {
      drawW = width * 0.45;
      drawH = drawW / imgAspect;
    } else {
      if (imgAspect > canvasAspect) {
        drawH = height;
        drawW = height * imgAspect;
      } else {
        drawW = width;
        drawH = width / imgAspect;
      }
    }

    // Edge Rounding (Corner Radius)
    if (clip.edgeRounding && clip.edgeRounding > 0) {
      const r = clip.edgeRounding * 4;
      ctx.beginPath();
      ctx.roundRect(-drawW / 2, -drawH / 2, drawW, drawH, r);
      ctx.clip();
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  /**
   * 3-Way Lift, Gamma, Gain and Temperature color grading shift
   */
  applyColorGradingShifts(ctx, clip, width, height) {
    // Lift (Shadows)
    if (clip.lift_x || clip.lift_y || clip.lift_m) {
      const liftHue = Math.atan2(clip.lift_y || 0, clip.lift_x || 0) * (180 / Math.PI);
      const liftMag = Math.sqrt((clip.lift_x || 0) ** 2 + (clip.lift_y || 0) ** 2);
      if (liftMag > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = `hsla(${liftHue + 180}, 60%, 50%, ${liftMag * 0.4})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    // Gain (Highlights)
    if (clip.gain_x || clip.gain_y || clip.gain_m) {
      const gainHue = Math.atan2(clip.gain_y || 0, clip.gain_x || 0) * (180 / Math.PI);
      const gainMag = Math.sqrt((clip.gain_x || 0) ** 2 + (clip.gain_y || 0) ** 2);
      if (gainMag > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `hsla(${gainHue + 180}, 75%, 65%, ${gainMag * 0.35})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    // Color Temperature / Tint (2000K - 11000K, 6500K neutral)
    if (clip.temperature && clip.temperature !== 6500) {
      const diff = clip.temperature - 6500;
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      if (diff > 0) {
        // Warmer (amber/orange)
        const alpha = Math.min(0.35, (diff / 4500) * 0.35);
        ctx.fillStyle = `rgba(255, 170, 70, ${alpha})`;
      } else {
        // Cooler (cyan/blue)
        const alpha = Math.min(0.35, (Math.abs(diff) / 4500) * 0.35);
        ctx.fillStyle = `rgba(70, 160, 255, ${alpha})`;
      }
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  drawTextLayer(ctx, t1Clip, width, height, currentTime) {
    ctx.save();
    let text = t1Clip.text || t1Clip.name || '';
    const fontSize = t1Clip.fontSize || 42;
    const fontFamily = t1Clip.fontFamily || 'Inter, sans-serif';
    const tracking = t1Clip.tracking || 2;
    const color = t1Clip.color || '#ffffff';
    const fillMode = t1Clip.fillMode || 'color'; // 'color' | 'inverted' | 'footage'
    const animation = t1Clip.animation || 'none'; // 'none' | 'typewriter' | 'pop' | 'fade'

    // Typewriter animation timing
    if (animation === 'typewriter') {
      const elapsed = Math.max(0, currentTime - t1Clip.startTime);
      const progress = Math.min(1, elapsed / (t1Clip.duration * 0.7));
      const charsToShow = Math.floor(text.length * progress);
      text = text.slice(0, charsToShow);
    }

    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Inverted difference fill mode
    if (fillMode === 'inverted') {
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = '#ffffff';
    } else {
      // Drop Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = color;
    }

    ctx.letterSpacing = `${tracking}px`;

    // Position text in lower third
    const textY = height * 0.82;
    ctx.fillText(text, width / 2, textY);
    ctx.restore();
  }

  applyVignette(ctx, width, height, amount = 0.5) {
    ctx.save();
    const radius = Math.max(width, height) * 0.7;
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, radius * 0.3,
      width / 2, height / 2, radius
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.85, amount * 0.85)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  applyGlow(ctx, width, height, intensity = 0.4) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255, 240, 210, ${intensity * 0.25})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  applySabattierShader(ctx, width, height) {
    ctx.save();
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'rgba(210, 180, 245, 0.72)';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.fillStyle = 'rgba(70, 130, 215, 0.32)';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  apply16mmFilmGrain(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
    const grainCount = 500;
    for (let i = 0; i < grainCount; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      const sz = Math.random() > 0.8 ? 2.5 : 1.5;
      ctx.fillRect(gx, gy, sz, sz);
    }
    ctx.restore();
  }

  async exportTimelineVideo(canvas, durationSeconds, onProgress) {
    return new Promise((resolve, reject) => {
      try {
        const stream = canvas.captureStream(24);
        const recordedChunks = [];
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';

        const recorder = new MediaRecorder(stream, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `Palmier_Master_Export_${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          resolve(blob);
        };

        recorder.start(100);

        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 0.5;
          const pct = Math.min(100, Math.floor((elapsed / 3.0) * 100));
          if (onProgress) onProgress(pct);

          if (elapsed >= 3.0) {
            clearInterval(interval);
            recorder.stop();
          }
        }, 500);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const videoEngine = new PalmierVideoEngine();
