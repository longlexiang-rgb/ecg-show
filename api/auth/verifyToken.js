// 1. 替换 CommonJS 为 ESModule（Vercel 推荐的 Serverless 规范）
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// 2. 增加 SECRET_KEY 默认值（避免环境变量未配置时报错，核心逻辑不变）
const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key-123456';

// 保留验证token的辅助函数（核心功能完全不变）
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw error;
    }
}

// 保留从请求头中获取token的函数（核心功能完全不变，补充容错逻辑）
function getTokenFromHeader(req) {
    const authHeader = req.headers?.authorization; // 增加 ?. 容错，避免 req.headers 为 undefined 时报错
    if (!authHeader) {
        throw new Error('未提供token');
    }
    // 补充校验 Token 格式（Bearer <token>），提升鲁棒性
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        throw new Error('token格式错误，应为 Bearer <token>');
    }
    return tokenParts[1];
}

// 3. Vercel 要求 ESModule 导出方式（替换 module.exports）
export { verifyToken, getTokenFromHeader };
