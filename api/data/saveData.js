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

    // 新增：仅允许 POST 方法（避免其他方法请求导致错误，核心逻辑补充）
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '仅支持 POST 方法' });
    }

    try {
        // 保留 Token 验证逻辑（核心功能完全不变）
        const token = getTokenFromHeader(req);
        const decoded = verifyToken(token);
        const userId = decoded.id;

        // 保留请求体解析 + 增加容错（避免 req.body 为 undefined 时报错）
        const { name, waveData } = req.body || {};

        // 保留所有输入验证逻辑（核心功能不变）
        if (!name) {
            return res.status(400).json({ message: '数据名称不能为空' });
        }
        if (!waveData || !Array.isArray(waveData)) {
            return res.status(400).json({ message: '波形数据不能为空且必须是数组格式' });
        }
        if (waveData.length === 0) {
            return res.status(400).json({ message: '波形数据不能为空' });
        }

        // 保留波形数据格式验证逻辑（核心功能不变）
        const isValidWaveData = waveData.every(item => {
            if (Array.isArray(item)) {
                return item.length >= 2 && !isNaN(item[0]) && !isNaN(item[1]);
            }
            return !isNaN(item);
        });
        
        if (!isValidWaveData) {
            return res.status(400).json({ message: '波形数据格式无效' });
        }

        // 保留数据库连接逻辑（核心功能不变）
        await connectDB();

        // 保留创建新数据项逻辑（核心功能不变：关联 userId 确保权限）
        const newData = new WaveData({
            name,
            waveData,
            userId
        });

        await newData.save();

        // 保留成功响应（核心功能不变）
        return res.status(201).json(newData);
    } catch (error) {
        console.error('保存数据错误:', error);
        // 保留错误分类处理 + 补充更多 Token 错误场景（提升容错）
        if (
            error.name === 'JsonWebTokenError' || 
            error.name === 'TokenExpiredError' || 
            error.message === '未提供token' ||
            error.message === 'token格式错误，应为 Bearer <token>'
        ) {
            return res.status(401).json({ message: '无效的token' });
        }
        return res.status(500).json({ message: '保存数据失败，请稍后重试' });
    }
}
