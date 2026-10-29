/**
 * Palmier Pro Video & Audio Engine
 * Real-time 24fps video canvas renderer, Web Audio API synthesis/analyzer,
 * and MediaRecorder timeline export.
 */

class PalmierVideoEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isAudioInitialized = false;
    this.frequencyData = new Uint8Array(80);
    this.butterflyImg = new Image();
    this.butterflyImg.src = '/welcome-butterfly.jpg';
    this.tourHeroImg = new Image();
    this.tourHeroImg.src = '/tour-hero.jpg';
  }

  initAudio() {
    if (this.isAudioInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

      // Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0.05; // Gentle background ambience

      // Cinematic Ambience Hum (432Hz harmonic)
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(54, this.audioCtx.currentTime); // Low cinematic sub-hum

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.oscillator.start();

      this.isAudioInitialized = true;
    } catch (e) {
      console.warn('AudioContext not allowed until user gesture', e);
    }
  }

  playScrubSound() {
    if (!this.audioCtx) this.initAudio();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 + Math.random() * 100, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  setVolume(volumeDb) {
    if (!this.gainNode || !this.audioCtx) return;
    const gainLinear = Math.pow(10, volumeDb / 20) * 0.05;
    this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, gainLinear)), this.audioCtx.currentTime);
  }

  getLiveWaveformData() {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      return Array.from(this.frequencyData.slice(0, 80));
    }
    return null;
  }

  renderFrame(canvas, clip, currentTime) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 0, width, height);

    // Pick active image (tour hero or butterfly)
    const img = (clip && clip.thumb === '/tour-hero.jpg') ? this.tourHeroImg : this.butterflyImg;

    if (img.complete && img.naturalWidth > 0) {
      ctx.save();

      // Clip transform (scale, position)
      const scale = (clip?.scale || 100) / 100;
      const posX = clip?.posX || 0;
      const posY = clip?.posY || 0;

      // Subtle live breathing motion during playback
      const drift = Math.sin(currentTime * 1.5) * 6;

      ctx.translate(width / 2 + posX, height / 2 + posY + drift);
      ctx.scale(scale, scale);

      // Aspect fill image onto canvas
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = width / height;
      let drawW, drawH;
      if (imgAspect > canvasAspect) {
        drawH = height;
        drawW = height * imgAspect;
      } else {
        drawW = width;
        drawH = width / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Sabattier Solarization shader simulation from Shot 19
      if (clip?.solarize) {
        ctx.save();
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'rgba(210, 180, 240, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.fillStyle = 'rgba(80, 140, 220, 0.35)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 16mm Kodak Tri-X film grain simulation from Shot 19
      if (clip?.grain || clip?.solarize) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let i = 0; i < 400; i++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.fillRect(gx, gy, 2, 2);
        }
        ctx.restore();
      }

      // Safe area guide lines (subtle overlay)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
      ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

      // Frame counter burn-in (matching PalmierPro inspectTimeline overlay)
      const currentFrame = Math.floor(currentTime * 24);
      ctx.font = '24px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`f${currentFrame}`, 40, 60);
    }
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
