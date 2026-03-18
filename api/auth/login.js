const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB, User } = require('../db');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

module.exports = async (req, res) => {
    try {
        // 解析请求体
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 连接数据库
        await connectDB();

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成token
        const token = jwt.sign({ id: user._id.toString(), username: user.username }, SECRET_KEY, { expiresIn: '24h' });

        return res.status(200).json({ username: user.username, token });
    } catch (error) {
        console.error('登录错误:', error);
        return res.status(500).json({ message: '登录失败，请稍后重试' });
    }
};