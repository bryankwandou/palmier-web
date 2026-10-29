/**
 * Palmier Pro Video & Audio Engine
 * Real-time 24fps multi-layer video compositing engine (V1 + V2 + T1 + Shaders + 16mm Grain),
 * Web Audio API multi-track synthesis, and MediaRecorder master video export.
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
      // Audio autoplay policy
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
      // audio error
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
   * Renders V1 (background), V2 (overlay B-roll), T1 (titles/captions),
   * applies color adjustments, solarization shaders, and dynamic 16mm film grain.
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

    // 2. Draw Layer V1 (Main Track)
    if (activeClip) {
      this.drawMediaLayer(ctx, activeClip, width, height, currentTime, false);
    }

    // 3. Draw Layer V2 (B-roll Overlay) if present
    if (v2Clip) {
      this.drawMediaLayer(ctx, v2Clip, width, height, currentTime, true);
    }

    // 4. Draw Layer T1 (Title & Subtitle Captions) if present
    if (t1Clip && t1Clip.text) {
      this.drawTextLayer(ctx, t1Clip, width, height);
    }

    // 5. Global / Active Clip Shaders (Solarize & Film Grain)
    const targetShaderClip = v1Clip || activeClip;
    if (targetShaderClip?.solarize) {
      this.applySabattierShader(ctx, width, height);
    }

    if (targetShaderClip?.grain || targetShaderClip?.solarize) {
      this.apply16mmFilmGrain(ctx, width, height);
    }

    // 6. Safe Area Guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
    ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

    // 7. Frame Counter Burn-In (matching PalmierPro inspectTimeline)
    const fps = sequence?.fps || 24;
    const currentFrame = Math.floor(currentTime * fps);
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.fillText(`f${currentFrame}`, 40, 60);

    // Resolution badge in corner
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(`${sequence?.resolution || '1920x1080'} · ${fps}fps`, width - 210, 60);
  }

  drawMediaLayer(ctx, clip, width, height, currentTime, isOverlay = false) {
    const thumbUrl = clip.thumb || '/welcome-butterfly.jpg';
    const img = this.getImage(thumbUrl);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.save();

    // Opacity
    const opacity = (clip.opacity !== undefined ? clip.opacity : 100) / 100;
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    // Transform parameters
    const scale = (clip.scale || 100) / 100;
    const posX = clip.posX || 0;
    const posY = clip.posY || 0;
    const rotation = ((clip.rotation || 0) * Math.PI) / 180;

    // Camera motion drift
    let driftX = 0;
    let driftY = 0;
    if (clip.cameraMotion === 'pan-left') {
      driftX = -(currentTime % 5) * 10;
    } else if (clip.cameraMotion === 'dolly-in') {
      driftY = (currentTime % 5) * 6;
    } else {
      driftY = Math.sin(currentTime * 1.5) * 4;
    }

    const centerX = width / 2 + posX + driftX;
    const centerY = height / 2 + posY + driftY;

    ctx.translate(centerX, centerY);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // Color Filters
    const exposure = clip.exposure !== undefined ? clip.exposure : 0.0;
    const contrast = clip.contrast !== undefined ? clip.contrast : 1.0;
    const saturation = clip.saturation !== undefined ? clip.saturation : 1.0;

    const brightnessVal = 100 + exposure * 25;
    const contrastVal = contrast * 100;
    const saturateVal = saturation * 100;
    ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturateVal}%)`;

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

  drawTextLayer(ctx, t1Clip, width, height) {
    ctx.save();
    const text = t1Clip.text || t1Clip.name || '';
    const fontSize = t1Clip.fontSize || 42;
    const fontFamily = t1Clip.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif';
    const tracking = t1Clip.tracking || 2;
    const color = t1Clip.color || '#ffffff';

    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = color;
    ctx.letterSpacing = `${tracking}px`;

    // Position text in lower third
    const textY = height * 0.82;
    ctx.fillText(text, width / 2, textY);
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
    // Animated dynamic grain buffer
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
        const totalSteps = 6;
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
