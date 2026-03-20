// 1. 替换 CommonJS 为 ESModule（Vercel 推荐的 Serverless 规范）
import bcrypt from 'bcryptjs'; // 替换 bcrypt 为 bcryptjs（解决 Vercel 编译兼容问题）
import { connectDB, User } from '../db.js'; // 补充 .js 后缀（Vercel 对 ESModule 路径要求严格）
import dotenv from 'dotenv';
dotenv.config();

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

    // 新增：仅允许 POST 方法（避免其他方法请求导致错误，核心逻辑补充）
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '仅支持 POST 方法' });
    }

    try {
        // 保留请求体解析 + 增加容错（避免 req.body 为 undefined 时报错）
        const { username, password } = req.body || {};

        // 保留所有输入验证逻辑（核心功能不变）
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: '用户名至少需要3个字符' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: '密码至少需要6个字符' });
        }

        // 保留数据库连接逻辑（核心功能不变）
        await connectDB();

        // 保留用户名查重逻辑（核心功能不变）
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 保留密码加密逻辑（bcryptjs API 与 bcrypt 完全一致，无需修改）
        const hashedPassword = await bcrypt.hash(password, 10);

        // 保留创建新用户逻辑（核心功能不变）
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // 保留成功响应（核心功能不变）
        return res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册错误:', error);
        // 保留错误响应 + 补充错误详情（便于 Vercel 日志排查问题）
        return res.status(500).json({ 
            message: '注册失败，请稍后重试', 
            error: error.message // 新增：返回错误详情，不影响核心功能
        });
    }
}
