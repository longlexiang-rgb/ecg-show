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

        // 从路径参数获取数据ID
        const { id } = req.query;

        // 验证ID
        if (!id) {
            return res.status(400).json({ message: '无效的数据ID' });
        }

        // 连接数据库
        await connectDB();

        // 删除数据
        const result = await WaveData.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '数据不存在' });
        }

        return res.status(200).json({ message: '删除成功' });
    } catch (error) {
        console.error('删除数据错误:', error);
        if (error.name === 'JsonWebTokenError' || error.message === '未提供token') {
            return res.status(401).json({ message: '无效的token' });
        }
        return res.status(500).json({ message: '删除数据失败，请稍后重试' });
    }
};
