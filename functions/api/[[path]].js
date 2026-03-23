export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 你的 Vercel 后端地址
  const VERCEL_DOMAIN = 'ecg-show.vercel.app';
  const targetUrl = `https://${VERCEL_DOMAIN}${url.pathname}${url.search}`;

  const newHeaders = new Headers(request.headers);
  newHeaders.set('Host', VERCEL_DOMAIN);
  newHeaders.set('Origin', `https://${VERCEL_DOMAIN}`);

  // 处理 POST/PUT 的 Body
  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer();
  }

  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders,
    body: body,
    redirect: 'follow',
  });

  try {
    return await fetch(newRequest);
  } catch (e) {
    return new Response('Gateway Error: ' + e.message, { status: 502 });
  }
}
