// 路由规则：完全复刻你原 vercel.json 的配置（一字不改）
const ROUTES = [
  // 认证相关
  {
    path: "/api/auth/register",
    target: "/api/auth/register.js",
    methods: ["POST"]
  },
  {
    path: "/api/auth/login",
    target: "/api/auth/login.js",
    methods: ["POST"]
  },
  {
    path: "/api/auth/verifyToken",
    target: "/api/auth/verifyToken.js",
    methods: ["GET", "POST"]
  },

  // 数据相关（带参数）
  {
    path: "/api/data/:id",
    target: "/api/data/deleteData.js",
    methods: ["DELETE"]
  },
  {
    path: "/api/data/:id",
    target: "/api/data/updateData.js",
    methods: ["PUT"]
  },
  {
    path: "/api/data/:id",
    target: "/api/data/getDataById.js",
    methods: ["GET"]
  },

  // 数据相关（无参数）
  {
    path: "/api/data",
    target: "/api/data/saveData.js",
    methods: ["POST"]
  },
  {
    path: "/api/data",
    target: "/api/data/getDataList.js",
    methods: ["GET"]
  }
];

// CORS配置（解决跨域+OPTIONS预检，和Vercel一致）
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

// 核心：匹配路由 + 处理请求（适配Pages内置Worker）
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 1. 优先处理OPTIONS预检（解决405核心）
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
      status: 200
    });
  }

  // 2. 遍历匹配API路由
  for (const route of ROUTES) {
    const pathRegex = new RegExp(`^${route.path.replace(/:id/g, "([^/]+)")}$`);
    const match = path.match(pathRegex);

    if (match) {
      // 校验请求方法
      if (!route.methods.includes(method)) {
        return new Response(JSON.stringify({
          code: 405,
          message: `Method ${method} Not Allowed`
        }), {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }

      // 拼接目标API路径（带参数，还原Vercel的?id=$1逻辑）
      let targetPath = route.target;
      if (match[1]) {
        targetPath += `?id=${match[1]}`;
      }

      // 🔴 关键：强制以RAW模式加载API文件（绕过Pages路由兜底）
      const apiRequest = new Request(targetPath, {
        method: method,
        headers: {
          ...request.headers,
          // 强制识别为JS文件，不触发前端路由
          "Content-Type": "text/javascript",
          "Accept": "text/javascript"
        },
        body: method !== "GET" ? request.body : null,
        // 禁用缓存，确保加载最新代码
        cf: { cacheTtl: 0, cacheEverything: false }
      });

      // 转发请求到API文件，并添加CORS头
      const apiResponse = await fetch(apiRequest);
      const responseHeaders = new Headers(apiResponse.headers);
      // 覆盖CORS头，确保和Vercel一致
      Object.entries(CORS_HEADERS).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(apiResponse.body, {
        status: apiResponse.status,
        headers: responseHeaders
      });
    }
  }

  // 3. 非API请求：正常返回前端静态文件（兼容前端路由）
  const staticRequest = new Request(path, {
    method: method,
    headers: request.headers,
    body: request.body
  });

  const staticResponse = await fetch(staticRequest);
  // 对前端页面添加基础CORS头（可选，确保兼容性）
  const staticHeaders = new Headers(staticResponse.headers);
  staticHeaders.set("Access-Control-Allow-Origin", "*");

  return new Response(staticResponse.body, {
    status: staticResponse.status,
    headers: staticHeaders
  });
}

// Pages内置Worker入口（必须用这个事件名）
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
