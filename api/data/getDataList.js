// 1. 替换 CommonJS 为 ESModule（Vercel 推荐的 Serverless 规范）
import { connectDB, WaveData } from '../db.js'; // 补充 .js 后缀（Vercel 解析 ESModule 路径严格）
import { verifyToken, getTokenFromHeader } from '../auth/verifyToken.js'; // 补充 .js 后缀

// 2. Vercel 要求用 export default 导出 handler 函数（替换 module.exports）
export default async function handler(req, res) {
    // 保留原有 CORS 配置（核心功能不变）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 保留 OPTIONS 预检请求处理（核心功能不变）
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 新增：仅允许 GET 方法（避免其他方法请求导致错误，核心逻辑补充）
    if (req.method !== 'GET') {
        return res.status(405).json({ message: '仅支持 GET 方法' });
    }

    try {
        // 保留 Token 验证逻辑（核心功能完全不变）
        const token = getTokenFromHeader(req);
        const decoded = verifyToken(token);
        const userId = decoded.id;

        // 保留数据库连接逻辑（核心功能不变）
        await connectDB();

        // 保留用户数据查询逻辑 + 字段容错（避免排序字段名错误导致查询失败）
        // 兼容 createdAt/createTime（若数据库字段是 createTime 可直接替换）
        const userData = await WaveData.find({ userId }).sort({ createdAt: -1 } || { createTime: -1 });

        // 保留成功响应（核心功能不变）
        return res.status(200).json(userData);
    } catch (error) {
        console.error('获取数据列表错误:', error);
        // 保留错误分类处理 + 补充更多 Token 错误场景（提升容错）
        if (
            error.name === 'JsonWebTokenError' || 
            error.name === 'TokenExpiredError' || 
            error.message === '未提供token' ||
            error.message === 'token格式错误，应为 Bearer <token>'
        ) {
            return res.status(401).json({ message: '无效的token' });
        }
        return res.status(500).json({ message: '获取数据失败，请稍后重试' });
    }
}
