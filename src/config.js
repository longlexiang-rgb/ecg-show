// config.js

// 你的 Cloudflare Worker 中转站地址（这是你现在的“救命稻草”）
const PROXY_URL = 'https://ecg.cau-cbs.workers.dev';

/**
 * 修改逻辑：
 * 不再判断 currentHost，因为我们希望所有的 API 请求都经过 Worker 中转。
 * 这样可以利用 Cloudflare 的网络优势，绕过直连 Vercel 的丢包和超时。
 */
export const API_BASE_URL = PROXY_URL;

export const USE_MOCK = false;
