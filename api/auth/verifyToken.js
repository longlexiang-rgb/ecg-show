const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

// 验证token的辅助函数
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw error;
    }
}

// 从请求头中获取token
function getTokenFromHeader(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new Error('未提供token');
    }
    return authHeader.split(' ')[1];
}

module.exports = {
    verifyToken,
    getTokenFromHeader
};