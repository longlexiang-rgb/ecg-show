// 路由规则：完全复刻你原vercel.json的配置
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

// CORS配置（解决跨域+OPTIONS预检）
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

// 匹配路由
function matchRoute(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 处理OPTIONS预检
  if (method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // 遍历路由规则匹配
  for (const route of ROUTES) {
    // 转换通配符为正则
    const pathRegex = new RegExp(`^${route.path.replace(/:id/g, "([^/]+)")}$`);
    const match = path.match(pathRegex);

    if (match) {
      // 校验请求方法
      if (!route.methods.includes(method)) {
        return new Response(JSON.stringify({
          code: 405,
          message: "Method Not Allowed"
        }), {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }

      // 拼接目标URL（带参数，还原vercel的?id=$1逻辑）
      let targetUrl = route.target;
      if (match[1]) {
        targetUrl += `?id=${match[1]}`;
      }

      // 转发请求到原有API文件
      return fetch(new Request(targetUrl, request), {
        headers: {
          ...Object.fromEntries(request.headers),
          ...CORS_HEADERS
        }
      });
    }
  }

  // 未匹配到路由
  return new Response(JSON.stringify({
    code: 404,
    message: "Not Found"
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}

// Worker入口
addEventListener("fetch", (event) => {
  event.respondWith(matchRoute(event.request));
});
