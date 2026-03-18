const { connectDB, WaveData } = require('../db');
const { verifyToken, getTokenFromHeader } = require('../auth/verifyToken');

module.exports = async (req, res) => {
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

        // 获取数据
        const dataItem = await WaveData.findOne({ _id: id, userId });
        if (!dataItem) {
            return res.status(404).json({ message: '数据不存在' });
        }

        return res.status(200).json(dataItem);
    } catch (error) {
        console.error('获取数据错误:', error);
        if (error.name === 'JsonWebTokenError' || error.message === '未提供token') {
            return res.status(401).json({ message: '无效的token' });
        }
        return res.status(500).json({ message: '获取数据失败，请稍后重试' });
    }
};