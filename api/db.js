const mongoose = require('mongoose');
require('dotenv').config();

// --- 1. 原有的数据库定义保持不变 ---
const MONGODB_URI = process.env.MONGODB_URI;
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const WaveData = mongoose.models.WaveData || mongoose.model('WaveData', new mongoose.Schema({
    name: { type: String, required: true },
    waveData: { type: [[Number]], required: true },
    userId: { type: String, required: true }
}));

// --- 2. 核心：增加一个处理函数 (Handler) ---
export default async function handler(req, res) {
    // 【关键】统一在这里加 CORS 头，解决你所有 JS 的报错
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await mongoose.connect(MONGODB_URI); // 连接数据库

        // 根据前端 api.js 发来的请求路径做判断
        if (req.url.includes('/api/auth/login')) {
            // 这里写登录逻辑...
            return res.status(200).json({ message: "登录成功" });
        }
        
        if (req.url.includes('/api/data')) {
            // 这里写获取数据的逻辑...
            const data = await WaveData.find({});
            return res.status(200).json(data);
        }

        res.status(404).json({ message: "接口路径没对上" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
