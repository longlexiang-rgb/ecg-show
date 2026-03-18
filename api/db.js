const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const mongooseOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
};

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

// 数据库连接
let dbConnection = null;

async function connectDB() {
    if (!dbConnection) {
        try {
            dbConnection = await mongoose.connect(MONGODB_URI, mongooseOptions);
            console.log('MongoDB连接成功');
        } catch (error) {
            console.error('MongoDB连接失败:', error);
            throw error;
        }
    }
    return dbConnection;
}

module.exports = {
    connectDB,
    User,
    WaveData
};