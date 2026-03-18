const { connectDB, WaveData } = require('../db');
const { verifyToken, getTokenFromHeader } = require('../auth/verifyToken');

module.exports = async (req, res) => {
    try {
        // 验证token
        const token = getTokenFromHeader(req);
        const decoded = verifyToken(token);
        const userId = decoded.id;

        // 解析请求体
        const { name, waveData } = req.body;

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

        // 创建新数据项
        const newData = new WaveData({
            name,
            waveData,
            userId
        });

        await newData.save();

        return res.status(201).json(newData);
    } catch (error) {
        console.error('保存数据错误:', error);
        if (error.name === 'JsonWebTokenError' || error.message === '未提供token') {
            return res.status(401).json({ message: '无效的token' });
        }
        return res.status(500).json({ message: '保存数据失败，请稍后重试' });
    }
};