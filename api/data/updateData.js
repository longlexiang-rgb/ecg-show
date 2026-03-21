// 1. 替换 CommonJS 为 ESModule（Vercel 推荐的 Serverless 规范）
import { connectDB, WaveData } from '../db.js'; 
import { verifyToken, getTokenFromHeader } from '../auth/verifyToken.js'; 
// 新增：导入MongoDB的ObjectId（核心修复）
import { ObjectId } from 'mongodb';

// 2. Vercel 要求用 export default 导出 handler 函数
export default async function handler(req, res) {
    // 保留原有 CORS 配置
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 保留 OPTIONS 预检请求处理
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 新增：仅允许 PUT 方法
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: '仅支持 PUT 方法' });
    }

    try {
        // 保留 Token 验证逻辑
        const token = getTokenFromHeader(req);
        const decoded = verifyToken(token);
        const userId = decoded.id;

        // 修复1：精准获取ID + 去空处理（避免空字符串/空格）
        const id = (req.query.id || (req.params && req.params[0]) || '').trim();

        // 修复2：分步骤校验ID（空值 → 格式 → 合法性）
        if (!id) {
            return res.status(400).json({ message: '无效的数据ID：ID不能为空' });
        }
        // 核心：校验MongoDB ObjectId格式
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: '无效的数据ID：ID格式错误（需为24位十六进制字符串）' });
        }
        // 转换为合法的ObjectId（避免CastError）
        const validObjectId = new ObjectId(id);

        // 保留请求体解析 + 增加容错
        const { name, waveData } = req.body || {};

        // 保留所有输入验证逻辑
        if (!name) {
            return res.status(400).json({ message: '数据名称不能为空' });
        }
        if (!waveData || !Array.isArray(waveData)) {
            return res.status(400).json({ message: '波形数据不能为空且必须是数组格式' });
        }
        if (waveData.length === 0) {
            return res.status(400).json({ message: '波形数据不能为空' });
        }

        // 保留波形数据格式验证逻辑
        const isValidWaveData = waveData.every(item => {
            if (Array.isArray(item)) {
                return item.length >= 2 && !isNaN(item[0]) && !isNaN(item[1]);
            }
            return !isNaN(item);
        });
        
        if (!isValidWaveData) {
            return res.status(400).json({ message: '波形数据格式无效' });
        }

        // 保留数据库连接逻辑
        await connectDB();

        // 修复3：用转换后的validObjectId更新（而非原始id）
        const updatedData = await WaveData.findOneAndUpdate(
            { _id: validObjectId, userId },
            { name, waveData, updatedAt: new Date() },
            { new: true } // 确保返回更新后的最新数据
        );

        if (!updatedData) {
            return res.status(404).json({ message: '数据不存在或无更新权限' });
        }

        // 保留成功响应
        return res.status(200).json(updatedData);
    } catch (error) {
        console.error('更新数据错误:', error);
        // 分类处理错误，提升用户体验
        if (
            error.name === 'JsonWebTokenError' || 
            error.name === 'TokenExpiredError' || 
            error.message === '未提供token' ||
            error.message === 'token格式错误，应为 Bearer <token>'
        ) {
            return res.status(401).json({ message: '登录已过期，请重新登录' });
        }
        // 兜底处理CastError（避免未捕获的格式错误）
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ message: '数据ID格式错误，请检查ID是否正确' });
        }
        return res.status(500).json({ message: '更新数据失败，请稍后重试' });
    }
}
