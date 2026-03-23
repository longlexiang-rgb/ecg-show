export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  
  // 目标 Vercel 域名
  const VERCEL_DOMAIN = 'ecg-show.vercel.app';
  const targetUrl = 'https://' + VERCEL_DOMAIN + url.pathname + url.search;

  // 1. 极简 Headers 处理 (不使用任何 Node 特有的 API)
  const newHeaders = new Headers();
  const headersToCopy = ['content-type', 'authorization', 'accept'];
  
  headersToCopy.forEach(header => {
    const value = request.headers.get(header);
    if (value) newHeaders.set(header, value);
  });
  
  newHeaders.set('Host', VERCEL_DOMAIN);

  // 2. 构造请求
  const fetchOptions = {
    method: request.method,
    headers: newHeaders,
    redirect: 'follow'
  };

  // 3. 只有非 GET 请求才传递 body
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    fetchOptions.body = request.body;
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    // 4. 返回响应
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } catch (e) {
    return new Response('Proxy Error: ' + e.message, { status: 502 });
  }
}
