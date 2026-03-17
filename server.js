const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

// 连接MongoDB Atlas - 使用标准复制集连接
const MONGODB_URI = process.env.MONGODB_URI;

const mongooseOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    tls: true,
    tlsAllowInvalidCertificates: true, // 允许无效证书（仅用于测试）
    tlsAllowInvalidHostnames: true // 允许无效主机名（仅用于测试）
};

mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
        console.log('MongoDB连接成功');
        // 测试数据库操作
        mongoose.connection.db.listCollections().toArray((err, collections) => {
            if (err) {
                console.error('获取集合列表失败:', err);
            } else {
                console.log('数据库集合:', collections.map(c => c.name));
            }
        });
    })
    .catch(err => {
        console.error('MongoDB连接失败:', err);
        console.error('错误详情:', JSON.stringify(err, null, 2));
    });

// 监听MongoDB连接事件
mongoose.connection.on('connected', () => {
    console.log('MongoDB连接已建立');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB连接已断开');
});

// 定义用户模型
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}));

// 定义波形数据模型
const WaveData = mongoose.model('WaveData', new mongoose.Schema({
    name: { type: String, required: true },
    waveData: { type: [[Number]], required: true },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}));

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 验证token中间件
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: '未提供token' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: '无效的token' });
    }
}

// 注册路由
app.post('/api/auth/register', async (req, res) => {
    try {
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

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '注册失败，请稍后重试' });
    }
});

// 登录路由
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

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

        res.json({ username: user.username, token });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '登录失败，请稍后重试' });
    }
});

// 获取数据列表
app.get('/api/data', verifyToken, async (req, res) => {
    try {
        const userData = await WaveData.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(userData);
    } catch (error) {
        console.error('获取数据列表错误:', error);
        res.status(500).json({ message: '获取数据失败，请稍后重试' });
    }
});

// 获取单个数据
app.get('/api/data/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // 验证ID格式
        if (!id) {
            return res.status(400).json({ message: '无效的数据ID' });
        }
        
        const dataItem = await WaveData.findOne({ _id: id, userId: req.user.id });
        if (!dataItem) {
            return res.status(404).json({ message: '数据不存在' });
        }
        res.json(dataItem);
    } catch (error) {
        console.error('获取数据错误:', error);
        res.status(500).json({ message: '获取数据失败，请稍后重试' });
    }
});

// 保存数据
app.post('/api/data', verifyToken, async (req, res) => {
    try {
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

        // 创建新数据项
        const newData = new WaveData({
            name,
            waveData,
            userId: req.user.id
        });

        await newData.save();
        res.status(201).json(newData);
    } catch (error) {
        console.error('保存数据错误:', error);
        res.status(500).json({ message: '保存数据失败，请稍后重试' });
    }
});

// 删除数据
app.delete('/api/data/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // 验证ID格式
        if (!id) {
            return res.status(400).json({ message: '无效的数据ID' });
        }
        
        const result = await WaveData.deleteOne({ _id: id, userId: req.user.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '数据不存在' });
        }
        res.json({ message: '删除成功' });
    } catch (error) {
        console.error('删除数据错误:', error);
        res.status(500).json({ message: '删除数据失败，请稍后重试' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
