export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 你的 Vercel 后端真实地址
  const VERCEL_DOMAIN = 'ecg-show.vercel.app';
  const targetUrl = `https://${VERCEL_DOMAIN}${url.pathname}${url.search}`;

  // 1. 克隆并清理 Headers
  const newHeaders = new Headers(request.headers);
  newHeaders.set('Host', VERCEL_DOMAIN);
  newHeaders.delete('Referer'); // 避免 Vercel 的安全校验拦截

  // 2. 准备请求配置
  const options = {
    method: request.method,
    headers: newHeaders,
    redirect: 'follow',
  };

  // 3. 处理 Body (登录/注册等 POST 请求)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // 关键：直接透传 request.body，不需要转 buffer
    options.body = request.body;
  }

  try {
    const response = await fetch(targetUrl, options);
    // 4. 将 Vercel 的响应原样返回给前端
    return new Response(response.body, response);
  } catch (e) {
    return new Response('Proxy Error: ' + e.message, { status: 502 });
  }
}
