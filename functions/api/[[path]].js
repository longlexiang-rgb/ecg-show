export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  
  // 你的 Vercel 后端地址
  const VERCEL_DOMAIN = 'ecg-show.vercel.app';
  const targetUrl = `https://${VERCEL_DOMAIN}${url.pathname}${url.search}`;

  // 手动构建一个新的请求，避开所有可能导致兼容性问题的自动化 Headers 复制
  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: {
      'Host': VERCEL_DOMAIN,
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
      'Authorization': request.headers.get('Authorization') || ''
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    redirect: 'follow'
  });

  try {
    const response = await fetch(newRequest);
    return new Response(response.body, response);
  } catch (e) {
    return new Response('中转失败: ' + e.message, { status: 502 });
  }
}
