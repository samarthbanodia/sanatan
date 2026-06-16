// Backend base URL for the deity chat/voice service.
//
// Deployed on Render (free tier — note it cold-starts after ~15 min idle, so the
// first request can take 30–60s). For local backend development, swap this to
// 'http://localhost:8787' (works on web; on a device use a tunnel/LAN URL).
export const API_BASE = 'https://sanatan-zp8m.onrender.com';
