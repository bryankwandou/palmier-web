/**
 * Complete Palmier Pro Multi-Sequence & Multi-Track Project Architecture
 * Faithful to Swift Sources/PalmierPro/Models:
 * - Timeline.swift, ClipType.swift, Effect.swift, MulticamSource.swift, ProjectFile.swift, TimelineMarker.swift
 */

export const INITIAL_SEQUENCES = [
  {
    id: 'seq-1',
    name: 'Aesthetic video',
    fps: 24,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    format: 'FHD',
    currentFrame: 191, // 00:00:07:23
    totalDuration: 33.541
  },
  {
    id: 'seq-2',
    name: 'Vertical 9:16 Reel',
    fps: 30,
    resolution: '1080x1920',
    aspectRatio: '9:16',
    format: 'Vertical',
    currentFrame: 0,
    totalDuration: 15.0
  },
  {
    id: 'seq-3',
    name: 'Trailer 60s Cut',
    fps: 24,
    resolution: '3840x2160',
    aspectRatio: '16:9',
    format: '4K',
    currentFrame: 0,
    totalDuration: 60.0
  }
];

export const INITIAL_TRACKS_CONFIG = [
  { id: 'V2', type: 'video', label: 'V2 Overlay', muted: false, locked: false, hidden: false },
  { id: 'V1', type: 'video', label: 'V1 Main Video', muted: false, locked: false, hidden: false },
  { id: 'T1', type: 'text', label: 'T1 Titles & Captions', muted: false, locked: false, hidden: false },
  { id: 'A1', type: 'audio', label: 'A1 Dialogue / VO', muted: false, locked: false, hidden: false },
  { id: 'A2', type: 'audio', label: 'A2 Music Score', muted: false, locked: false, hidden: false },
  { id: 'A3', type: 'audio', label: 'A3 SFX & Foley', muted: false, locked: false, hidden: false }
];

export const MULTICAM_ANGLES = [
  { id: 'angle-1', label: 'Angle 1 (Wide Cam A)', thumb: '/welcome-butterfly.jpg' },
  { id: 'angle-2', label: 'Angle 2 (Close Cam B)', thumb: '/tour-hero.jpg' },
  { id: 'angle-3', label: 'Angle 3 (Detail Cam C)', thumb: '/welcome-butterfly.jpg' },
  { id: 'angle-4', label: 'Angle 4 (Screen Cam D)', thumb: '/tour-hero.jpg' }
];

export const SOLID_MATTE_PRESETS = [
  { id: 'matte-black', name: 'Black Matte', hex: '#000000' },
  { id: 'matte-white', name: 'White Matte', hex: '#ffffff' },
  { id: 'matte-orange', name: 'Palmier Gold Matte', hex: '#f59e0b' },
  { id: 'matte-teal', name: 'Teal Matte', hex: '#0ea5e9' },
  { id: 'matte-violet', name: 'Solarize Violet', hex: '#8b5cf6' }
];

export const INITIAL_MARKERS = [
  { id: 'm-1', startFrame: 108, time: 4.5, name: 'B-Roll Cut In', color: '#f59e0b', status: 'resolved', comment: 'B-roll cutaway aligned with narrator mention' },
  { id: 'm-2', startFrame: 328, time: 13.7, name: 'Sabattier Solarize', color: '#8b5cf6', status: 'review', comment: 'Verify violet solarization contrast on HDR display' },
  { id: 'm-3', startFrame: 504, time: 21.0, name: 'Audio Transition', color: '#10b981', status: 'open', comment: 'Cross-fade dialogue into music bed' }
];

export const WORD_LEVEL_TRANSCRIPT = [
  { id: 'w-1', text: 'Extreme', start: 0.0, end: 0.5, isFiller: false },
  { id: 'w-2', text: 'macro', start: 0.5, end: 1.0, isFiller: false },
  { id: 'w-3', text: 'um', start: 1.0, end: 1.4, isFiller: true },
  { id: 'w-4', text: 'close-up', start: 1.4, end: 2.0, isFiller: false },
  { id: 'w-5', text: '[silence 0.8s]', start: 2.0, end: 2.8, isSilence: true },
  { id: 'w-6', text: 'Kodak', start: 2.8, end: 3.3, isFiller: false },
  { id: 'w-7', text: 'Tri-X', start: 3.3, end: 3.8, isFiller: false },
  { id: 'w-8', text: 'like', start: 3.8, end: 4.1, isFiller: true },
  { id: 'w-9', text: 'pushed', start: 4.1, end: 4.6, isFiller: false },
  { id: 'w-10', text: 'five', start: 4.6, end: 5.0, isFiller: false },
  { id: 'w-11', text: 'stops', start: 5.0, end: 5.5, isFiller: false },
  { id: 'w-12', text: '[dead air 1.2s]', start: 5.5, end: 6.7, isSilence: true },
  { id: 'w-13', text: 'Solarized', start: 6.7, end: 7.3, isFiller: false },
  { id: 'w-14', text: 'Sabattier', start: 7.3, end: 8.0, isFiller: false },
  { id: 'w-15', text: 'uh', start: 8.0, end: 8.4, isFiller: true },
  { id: 'w-16', text: 'effect', start: 8.4, end: 9.0, isFiller: false },
  { id: 'w-17', text: 'shimmering', start: 9.0, end: 9.6, isFiller: false },
  { id: 'w-18', text: 'in', start: 9.6, end: 9.8, isFiller: false },
  { id: 'w-19', text: 'light', start: 9.8, end: 10.4, isFiller: false }
];

export const FULL_MEDIA_ITEMS = [
  { id: 'm-1', name: 'juicy...347c_2', folder: 'Animals', duration: '47,780', thumb: '/welcome-butterfly.jpg', type: 'video' },
  { id: 'm-2', name: 'juicy...b6a1_1', folder: 'Animals', duration: '47,780', thumb: '/tour-hero.jpg', type: 'video' },
  { id: 'm-3', name: 'juicy...b6a1_3', folder: 'Animals', duration: '47,780', thumb: '/welcome-butterfly.jpg', type: 'video' },
  { id: 'm-4', name: 'juicy...936_3', folder: 'B-Roll', duration: '47,780', thumb: '/tour-hero.jpg', type: 'video' },
  { id: 'm-5', name: 'juicy...7816_1', folder: 'B-Roll', duration: '47,780', thumb: '/welcome-butterfly.jpg', type: 'video' },
  { id: 'm-6', name: 'juicy...7816_3', folder: 'AI Renders', duration: '47,780', thumb: '/tour-hero.jpg', type: 'video' },
  { id: 'm-7', name: 'juicy...a7c4_1', folder: 'AI Renders', duration: '47,780', thumb: '/welcome-butterfly.jpg', type: 'video' },
  { id: 'm-8', name: 'juicy...a7c4_3', folder: 'Animals', duration: '47,780', thumb: '/tour-hero.jpg', type: 'video' },
  { id: 'm-9', name: 'juicy...0f0a7_1', folder: 'Animals', duration: '47,780', thumb: '/welcome-butterfly.jpg', type: 'video' }
];

export const AUDIO_LIBRARY_ITEMS = [
  { id: 'aud-1', name: 'Cinematic Sub Bass Drone', category: 'Score', duration: '00:32:00', format: 'WAV 48kHz' },
  { id: 'aud-2', name: '16mm Projector Tape Hiss', category: 'Ambience', duration: '01:15:00', format: 'WAV 48kHz' },
  { id: 'aud-3', name: 'Deep Whoosh Cinematic Riser', category: 'SFX', duration: '00:04:12', format: 'WAV 96kHz' },
  { id: 'aud-4', name: 'Butterfly Wings Shimmer Foley', category: 'Foley', duration: '00:08:20', format: 'WAV 96kHz' },
  { id: 'aud-5', name: 'Analog Tape Click & Stop', category: 'Foley', duration: '00:01:05', format: 'WAV 48kHz' }
];

export const TRANSCRIPT_CAPTIONS = [
  { id: 'c-1', startTime: 0.0, endTime: 2.2, text: 'Extreme macro close-up human eye looking far left.' },
  { id: 'c-2', startTime: 2.2, endTime: 4.5, text: 'Kodak Tri-X pushed 5 stops with massive clumped grain.' },
  { id: 'c-3', startTime: 4.5, endTime: 6.6, text: 'Solarized Sabattier effect with deep navy shadows.' },
  { id: 'c-4', startTime: 6.6, endTime: 9.1, text: 'Iridescent butterfly wing scales shimmer in 8k cinematic light.' }
];

export const INITIAL_FULL_CLIPS = [
  // V1 Clips
  { 
    id: 'v-clip-1', 
    trackId: 'V1', 
    name: 'juicyma', 
    startTime: 0.0, 
    duration: 2.2, 
    thumb: '/welcome-butterfly.jpg', 
    scale: 100, 
    posX: 0, 
    posY: 0, 
    speed: 1.0, 
    volumeDb: 0.0, 
    solarize: false, 
    grain: false,
    multicamAngle: 'angle-1',
    lift_x: 0, lift_y: 0, lift_m: 0,
    gamma_x: 0, gamma_y: 0, gamma_m: 1,
    gain_x: 0, gain_y: 0, gain_m: 1,
    keyframes: { opacity: [{ frame: 0, value: 0 }, { frame: 24, value: 1 }] }
  },
  { 
    id: 'v-clip-2', 
    trackId: 'V1', 
    name: 'juicyma', 
    startTime: 2.2, 
    duration: 2.3, 
    thumb: '/tour-hero.jpg', 
    scale: 100, 
    posX: 0, 
    posY: 0, 
    speed: 1.0, 
    volumeDb: 0.0, 
    solarize: false, 
    grain: false,
    multicamAngle: 'angle-2'
  },
  { 
    id: 'v-clip-3', 
    trackId: 'V1', 
    name: 'juicyma', 
    startTime: 4.5, 
    duration: 2.1, 
    thumb: '/welcome-butterfly.jpg', 
    scale: 100, 
    posX: 0, 
    posY: 0, 
    speed: 1.0, 
    volumeDb: 0.0, 
    solarize: true, 
    grain: true,
    multicamAngle: 'angle-3'
  },
  { 
    id: 'v-clip-4', 
    trackId: 'V1', 
    name: 'juicyma', 
    startTime: 6.6, 
    duration: 2.5, 
    thumb: '/welcome-butterfly.jpg', 
    scale: 105, 
    posX: 0, 
    posY: 0, 
    speed: 1.0, 
    volumeDb: 0.0, 
    solarize: false, 
    grain: true,
    multicamAngle: 'angle-1',
    lift_x: 0.1, lift_y: -0.1, lift_m: 0,
    gamma_x: 0, gamma_y: 0, gamma_m: 1.1,
    gain_x: 0.15, gain_y: 0.05, gain_m: 1.05
  },
  { id: 'v-clip-5', trackId: 'V1', name: 'juicyma', startTime: 9.1, duration: 2.2, thumb: '/tour-hero.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-6', trackId: 'V1', name: 'juicyma', startTime: 11.3, duration: 2.4, thumb: '/welcome-butterfly.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-7', trackId: 'V1', name: 'juicyma', startTime: 13.7, duration: 2.2, thumb: '/tour-hero.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-8', trackId: 'V1', name: 'juicyma', startTime: 15.9, duration: 2.5, thumb: '/welcome-butterfly.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-9', trackId: 'V1', name: 'juicyma', startTime: 18.4, duration: 2.2, thumb: '/tour-hero.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-10', trackId: 'V1', name: 'juicyma', startTime: 20.6, duration: 2.4, thumb: '/welcome-butterfly.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-11', trackId: 'V1', name: 'juicyma', startTime: 23.0, duration: 2.3, thumb: '/welcome-butterfly.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-12', trackId: 'V1', name: 'juicyma', startTime: 25.3, duration: 2.5, thumb: '/tour-hero.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-13', trackId: 'V1', name: 'juicyma', startTime: 27.8, duration: 2.4, thumb: '/welcome-butterfly.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },
  { id: 'v-clip-14', trackId: 'V1', name: 'juicyma', startTime: 30.2, duration: 3.3, thumb: '/tour-hero.jpg', scale: 100, posX: 0, posY: 0, speed: 1.0, volumeDb: 0.0, solarize: false, grain: false },

  // V2 Overlay Clip (B-roll cutaway)
  { id: 'v2-clip-1', trackId: 'V2', name: 'broll_cutaway', startTime: 4.5, duration: 4.6, thumb: '/tour-hero.jpg', scale: 65, posX: 140, posY: -80, opacity: 0.95 },

  // T1 Text Overlay Title
  { id: 't1-clip-1', trackId: 'T1', name: 'Title: AESTHETIC VIDEO', startTime: 0.5, duration: 5.5, text: 'AESTHETIC VIDEO // SHOT 19', animation: 'typewriter' }
];

export const COLOR_LUT_PRESETS = [
  { id: 'tri-x', name: 'Kodak Tri-X 400 (Shot 19)', exposure: 1.2, contrast: 1.6, saturation: 0.1, grain: true, solarize: false },
  { id: 'sabattier', name: 'Sabattier Solarization', exposure: 1.0, contrast: 2.4, saturation: 1.8, grain: true, solarize: true },
  { id: 'kodak-2383', name: 'Kodak 2383 Print LUT', exposure: 0.1, contrast: 1.2, saturation: 1.15, grain: false, solarize: false },
  { id: 'bleach-bypass', name: 'Bleach Bypass Silver', exposure: 0.3, contrast: 1.8, saturation: 0.4, grain: true, solarize: false },
  { id: 'teal-orange', name: 'Teal & Orange Hollywood', exposure: 0.0, contrast: 1.3, saturation: 1.25, grain: false, solarize: false },
  { id: 'film-noir', name: 'Film Noir 16mm Monochrome', exposure: -0.2, contrast: 2.0, saturation: 0.0, grain: true, solarize: false }
];

export const AI_MODELS_CATALOG = [
  { id: 'seedance-2', name: 'Seedance 2', provider: 'ByteDance', maxRes: '1080p', maxDuration: '10s', costPerSec: '$0.068' },
  { id: 'kling-1-5', name: 'Kling 1.5 Pro', provider: 'Kuaishou', maxRes: '1080p', maxDuration: '10s', costPerSec: '$0.080' },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', provider: 'Palmier Lab', maxRes: '4K', maxDuration: '15s', costPerSec: '$0.045' },
  { id: 'minimax-hailuo', name: 'MiniMax Hailuo 01', provider: 'MiniMax', maxRes: '1080p', maxDuration: '6s', costPerSec: '$0.050' },
  { id: 'luma-ray-2', name: 'Luma Ray 2', provider: 'Luma AI', maxRes: '1080p', maxDuration: '9s', costPerSec: '$0.090' }
];

export const SAMPLE_PROJECTS_CATALOG = [
  {
    id: 'sample-1',
    name: 'Butterfly Macro 4K',
    duration: '00:33',
    fps: 24,
    resolution: '4K 2160p',
    aspectRatio: '16:9',
    tag: 'Macro Nature',
    thumb: '/welcome-butterfly.jpg'
  },
  {
    id: 'sample-2',
    name: 'Tokyo Cyberpunk Reel',
    duration: '00:15',
    fps: 30,
    resolution: '1080x1920',
    aspectRatio: '9:16',
    tag: 'Vertical Short',
    thumb: '/tour-hero.jpg'
  },
  {
    id: 'sample-3',
    name: 'Trailer 60s Cut',
    duration: '01:00',
    fps: 24,
    resolution: '3840x2160',
    aspectRatio: '16:9',
    tag: 'Cinematic',
    thumb: '/tour-hero.jpg'
  }
];

export const INITIAL_USER_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Aesthetic video',
    duration: '00:33:13',
    fps: 24,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    modifiedDate: '2 minutes ago',
    thumb: '/welcome-butterfly.jpg'
  },
  {
    id: 'proj-2',
    name: 'Vertical 9:16 Reel',
    duration: '00:15:00',
    fps: 30,
    resolution: '1080x1920',
    aspectRatio: '9:16',
    modifiedDate: 'Yesterday',
    thumb: '/tour-hero.jpg'
  }
];
