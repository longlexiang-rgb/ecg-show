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

        // 解析请求体
        const { name, waveData } = req.body;

        // 验证ID
        if (!id) {
            return res.status(400).json({ message: '无效的数据ID' });
        }

        // 验证输入
        if (!name) {
            return res.status(400).json({ message: '数据名称不能为空' });
        }
        if (!waveData || !Array.isArray(waveData)) {
            return res.status(400).json({ message: '波形数据不能为空且必须是数组格式' });
        }
        if (waveData.length === 0) {
            return res.status(400).json({ message: '波形数据不能为空' });
        }

        // 验证波形数据格式
        const isValidWaveData = waveData.every(item => {
            if (Array.isArray(item)) {
                return item.length >= 2 && !isNaN(item[0]) && !isNaN(item[1]);
            }
            return !isNaN(item);
        });
        
        if (!isValidWaveData) {
            return res.status(400).json({ message: '波形数据格式无效' });
        }

        // 连接数据库
        await connectDB();

        // 更新数据
        const updatedData = await WaveData.findOneAndUpdate(
            { _id: id, userId },
            { name, waveData, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedData) {
            return res.status(404).json({ message: '数据不存在' });
        }

        return res.status(200).json(updatedData);
    } catch (error) {
        console.error('更新数据错误:', error);
        if (error.name === 'JsonWebTokenError' || error.message === '未提供token') {
            return res.status(401).json({ message: '无效的token' });
        }
        return res.status(500).json({ message: '更新数据失败，请稍后重试' });
    }
};
