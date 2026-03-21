import { connectDB, WaveData } from '../db.js';
import { verifyToken, getTokenFromHeader } from '../auth/verifyToken.js';
import { ObjectId } from 'mongodb'; // 关键：导入ObjectId

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ message: '仅支持GET方法' });

    try {
        const token = getTokenFromHeader(req);
        const decoded = verifyToken(token);
        const userId = decoded.id;

        // 1. 精准获取ID + 去空
        const id = (req.query.id || (req.params && req.params[0]) || '').trim();
        if (!id) return res.status(400).json({ message: '无效的数据ID：ID不能为空' });

        // 2. 校验MongoDB ObjectId格式
        if (!ObjectId.isValid(id)) return res.status(400).json({ message: '无效的数据ID：格式错误' });
        const validId = new ObjectId(id);

        await connectDB();
        const dataItem = await WaveData.findOne({ _id: validId, userId });
        if (!dataItem) return res.status(404).json({ message: '数据不存在或无权限' });

        return res.status(200).json(dataItem);
    } catch (error) {
        console.error('获取数据错误:', error);
        if (error.name.includes('Token')) return res.status(401).json({ message: '登录过期，请重新登录' });
        if (error.name === 'CastError') return res.status(400).json({ message: '数据ID格式错误' });
        return res.status(500).json({ message: '服务器错误' });
    }
}
