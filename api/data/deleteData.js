// 1. 替换 CommonJS 为 ESModule（Vercel 推荐的 Serverless 规范）
import { connectDB, WaveData } from '../db.js'; // 补充 .js 后缀（Vercel 严格要求）
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

    // 新增：仅允许 DELETE 方法（避免其他方法请求导致错误，核心逻辑补充）
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: '仅支持 DELETE 方法' });
    }

    try {
        // 保留 Token 验证逻辑（核心功能完全不变）
        const token = getTokenFromHeader(req);
        const decoded = verifyToken(token);
        const userId = decoded.id;

        // 保留路径参数获取 + 补充容错（适配 Vercel 路由参数解析）
        // 兼容 req.query.id（GET 参数）和 req.params[0]（路由通配符参数）
        const id = req.query.id || (req.params && req.params[0]);

        // 保留 ID 验证逻辑（核心功能不变）
        if (!id) {
            return res.status(400).json({ message: '无效的数据ID' });
        }

        // 保留数据库连接逻辑（核心功能不变）
        await connectDB();

        // 保留数据删除逻辑（核心功能不变：校验 userId 确保权限）
        const result = await WaveData.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '数据不存在或无删除权限' });
        }

        // 保留成功响应（核心功能不变）
        return res.status(200).json({ message: '删除成功' });
    } catch (error) {
        console.error('删除数据错误:', error);
        // 保留错误分类处理（核心功能不变，补充更多 Token 错误场景）
        if (
            error.name === 'JsonWebTokenError' || 
            error.name === 'TokenExpiredError' || 
            error.message === '未提供token' ||
            error.message === 'token格式错误，应为 Bearer <token>'
        ) {
            return res.status(401).json({ message: '无效的token' });
        }
        // 补充 MongoDB ID 格式错误处理（提升用户体验）
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ message: '数据ID格式错误' });
        }
        return res.status(500).json({ message: '删除数据失败，请稍后重试' });
    }
}
