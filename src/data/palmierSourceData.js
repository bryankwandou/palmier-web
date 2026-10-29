export const PALMIER_PROJECT = {
  name: 'Aesthetic video',
  fps: 24,
  resolution: '1920x1080',
  aspectRatio: '16:9',
  format: 'FHD',
  currentFrame: 7 * 24 + 23, // 00:00:07:23
  totalDuration: 33 + 13 / 24, // 00:00:33:13
};

export const AGENT_CHAT_HISTORY = [
  {
    id: 'shot-19',
    number: '19',
    title: 'Eye looking hard left',
    prompt: 'extreme macro close-up human eye looking far left, white dominant right side, extreme push processed 16mm, Kodak Tri-X pushed 5 stops, massive clumped grain, solarized Sabattier effect, deep navy shadows, yellow-green edge halation, blown white highlights, coarse sand-like film grain --ar 16:9 --style raw --chaos 15'
  },
  {
    id: 'shot-20',
    number: '20',
    title: 'Two eyes side by side, different people',
    prompt: 'extreme macro close-up two different human eyes side by side, one dark one light, extreme push processed 16mm, Kodak Tri-X pushed 5 stops, massive clumped grain, solarized Sabattier effect, deep navy shadows, yellow-green edge halation, blown white highlights, coarse sand-like film grain --ar 16:9 --style raw --chaos 15'
  },
  {
    id: 'agent-msg-1',
    isAgent: true,
    text: "Bring those back in and I'll sequence them right after the current 20!"
  }
];

export const MEDIA_LIBRARY_ITEMS = [
  { id: 'm-1', name: 'juicy...347c_2', duration: '47,780', thumb: '/welcome-butterfly.jpg' },
  { id: 'm-2', name: 'juicy...b6a1_1', duration: '47,780', thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&q=80' },
  { id: 'm-3', name: 'juicy...b6a1_3', duration: '47,780', thumb: 'https://images.unsplash.com/photo-1549740425-8e95b4522340?w=300&q=80' },
  { id: 'm-4', name: 'juicy...936_3', duration: '47,780', thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80' },
  { id: 'm-5', name: 'juicy...7816_1', duration: '47,780', thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
  { id: 'm-6', name: 'juicy...7816_3', duration: '47,780', thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80' },
  { id: 'm-7', name: 'juicy...a7c4_1', duration: '47,780', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80' },
  { id: 'm-8', name: 'juicy...a7c4_3', duration: '47,780', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80' },
  { id: 'm-9', name: 'juicy...0f0a7_1', duration: '47,780', thumb: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&q=80' },
];

export const TIMELINE_CLIPS_SOURCE = [
  { id: 'v-clip-1', name: 'juicyma', startTime: 0.0, duration: 2.2, trackId: 'V1', thumb: '/welcome-butterfly.jpg' },
  { id: 'v-clip-2', name: 'juicyma', startTime: 2.2, duration: 2.3, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&q=80' },
  { id: 'v-clip-3', name: 'juicyma', startTime: 4.5, duration: 2.1, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1549740425-8e95b4522340?w=300&q=80' },
  { id: 'v-clip-4', name: 'juicyma', startTime: 6.6, duration: 2.5, trackId: 'V1', thumb: '/welcome-butterfly.jpg' },
  { id: 'v-clip-5', name: 'juicyma', startTime: 9.1, duration: 2.2, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80' },
  { id: 'v-clip-6', name: 'juicyma', startTime: 11.3, duration: 2.4, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
  { id: 'v-clip-7', name: 'juicyma', startTime: 13.7, duration: 2.2, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80' },
  { id: 'v-clip-8', name: 'juicyma', startTime: 15.9, duration: 2.5, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80' },
  { id: 'v-clip-9', name: 'juicyma', startTime: 18.4, duration: 2.2, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80' },
  { id: 'v-clip-10', name: 'juicyma', startTime: 20.6, duration: 2.4, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&q=80' },
  { id: 'v-clip-11', name: 'juicyma', startTime: 23.0, duration: 2.3, trackId: 'V1', thumb: '/welcome-butterfly.jpg' },
  { id: 'v-clip-12', name: 'juicyma', startTime: 25.3, duration: 2.5, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&q=80' },
  { id: 'v-clip-13', name: 'juicyma', startTime: 27.8, duration: 2.4, trackId: 'V1', thumb: 'https://images.unsplash.com/photo-1549740425-8e95b4522340?w=300&q=80' },
  { id: 'v-clip-14', name: 'juicyma', startTime: 30.2, duration: 3.3, trackId: 'V1', thumb: '/welcome-butterfly.jpg' },
];
