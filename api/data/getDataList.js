const { connectDB, WaveData } = require('../db');
const { verifyToken, getTokenFromHeader } = require('../auth/verifyToken');

module.exports = async (req, res) => {
   // 添加 CORS 头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 验证token
        const token = getTokenFromHeader(req);
        const decoded = verifyToken(token);
        const userId = decoded.id;

        // 连接数据库
        await connectDB();

        // 获取用户数据
        const userData = await WaveData.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json(userData);
    } catch (error) {
        console.error('获取数据列表错误:', error);
        if (error.name === 'JsonWebTokenError' || error.message === '未提供token') {
            return res.status(401).json({ message: '无效的token' });
        }
        return res.status(500).json({ message: '获取数据失败，请稍后重试' });
    }
};
