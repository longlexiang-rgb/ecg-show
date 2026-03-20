// 1. 替换 CommonJS 为 ESModule（Vercel 推荐规范）
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// 2. 保留原有环境变量配置（核心功能不变）
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI 环境变量未配置');
}

// 3. 核心：数据库连接复用（解决 Vercel 冷启动重复连接问题）
let isConnected = false;

/**
 * 数据库连接函数（保留核心连接逻辑，补充复用机制）
 */
export async function connectDB() {
    // 已连接则直接返回，避免重复连接
    if (isConnected) {
        console.log('复用已有数据库连接');
        return;
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Vercel 超时优化
            socketTimeoutMS: 45000
        });
        isConnected = true;
        console.log('数据库连接成功');
        return conn;
    } catch (error) {
        console.error('数据库连接失败:', error);
        throw new Error(`数据库连接错误：${error.message}`);
    }
}

// 4. 保留原有 User 模型定义（核心结构不变）
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// 5. 保留原有 WaveData 模型定义（核心结构不变）
const WaveDataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    waveData: { type: [[Number]], required: true }, // 保持二维数组格式
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }, // 补充创建时间（可选，提升实用性）
    updatedAt: { type: Date, default: Date.now }  // 补充更新时间（可选）
});
export const WaveData = mongoose.models.WaveData || mongoose.model('WaveData', WaveDataSchema);

// 6. 保留你原有的统一处理函数（适配 ESModule，补充 CORS 完整配置）
export default async function handler(req, res) {
    // 保留核心 CORS 配置 + 补充完整跨域支持
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // 补充PUT/DELETE
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 保留 OPTIONS 预检处理
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 复用连接函数（核心：避免重复连接）
        await connectDB();

        // 保留原有接口路由判断逻辑（可根据实际需求扩展）
        if (req.url.includes('/api/auth/login')) {
            return res.status(200).json({ message: "登录成功" });
        }
        
        if (req.url.includes('/api/data')) {
            const data = await WaveData.find({});
            return res.status(200).json(data);
        }

        res.status(404).json({ message: "接口路径没对上" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
