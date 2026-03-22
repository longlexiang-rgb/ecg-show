
// config.js

// 第一步：获取当前浏览器的域名
const currentHost = window.location.hostname;

// 第二步：定义你的 Vercel 后端真实地址（请务必填入你自己的 Vercel 域名）
const VERCEL_URL = 'https://ecg-show.vercel.app'; 

/**
 * 第三步：判断逻辑
 * 1. 如果在本地 (localhost) 或 Vercel 预览环境运行：
 * 我们保持 API_BASE_URL 为空 ''。这样它会请求相对路径，规避跨域。
 * 2. 如果在 Cloudflare (或其他任何地方) 运行：
 * 我们必须强制它去请求 Vercel 的绝对地址，否则它会找不到后端。
 */
export const API_BASE_URL = (currentHost.includes('vercel.app') || currentHost === 'localhost') 
    ? '' 
    : VERCEL_URL;

export const USE_MOCK = false;
