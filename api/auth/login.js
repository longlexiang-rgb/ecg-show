// 1. 替换 CommonJS 为 ESModule（Vercel 推荐，兼容 Serverless）
import bcrypt from 'bcryptjs'; // 替换 bcrypt 为 bcryptjs（解决 Vercel 编译兼容问题）
import jwt from 'jsonwebtoken';
import { connectDB, User } from '../db.js'; // 补充 .js 后缀（Vercel 严格要求）
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key-123456'; // 增加默认值，避免 undefined

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

    try {
        // 保留请求体解析（核心功能不变）
        const { username, password } = req.body || {}; // 增加 || {}，避免 req.body 为 undefined 时报错

        // 保留输入验证（核心功能不变）
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 保留数据库连接（核心功能不变）
        await connectDB();

        // 保留用户查询（核心功能不变）
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 保留密码验证（bcryptjs API 与 bcrypt 完全一致，无需修改逻辑）
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 保留 JWT 生成（核心功能不变）
        const token = jwt.sign(
            { id: user._id.toString(), username: user.username },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        // 保留成功响应（核心功能不变）
        return res.status(200).json({ username: user.username, token });
    } catch (error) {
        console.error('登录错误:', error);
        // 保留错误响应（核心功能不变，补充错误详情便于排查）
        return res.status(500).json({ 
            message: '登录失败，请稍后重试', 
            error: error.message // 新增：返回错误详情，便于 Vercel 日志排查
        });
    }
}
