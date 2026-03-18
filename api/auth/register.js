const bcrypt = require('bcrypt');
const { connectDB, User } = require('../db');

module.exports = async (req, res) => {
    try {
        // 解析请求体
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: '用户名至少需要3个字符' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: '密码至少需要6个字符' });
        }

        // 连接数据库
        await connectDB();

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册错误:', error);
        return res.status(500).json({ message: '注册失败，请稍后重试' });
    }
};