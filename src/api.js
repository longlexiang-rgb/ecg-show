// API请求模块
import { API_BASE_URL, USE_MOCK } from './config.js';
import { getToken, getUsers, setUsers, getDataItems, setDataItems } from './storage.js';

// 模拟bcrypt加密（仅用于模拟模式）
function mockHashPassword(password) {
    return `hashed_${password}`;
}

// 模拟密码验证（仅用于模拟模式）
function mockComparePassword(password, hashedPassword) {
    return `hashed_${password}` === hashedPassword;
}

// 注册
export async function register(username, password) {
    if (USE_MOCK) {
        const users = getUsers();
        if (users.some(user => user.username === username)) {
            throw new Error('用户名已存在');
        }
        const hashedPassword = mockHashPassword(password);
        // 模拟模式：生成类MongoDB的24位ID（统一格式）
        const mockObjectId = Math.random().toString(16).slice(2, 26);
        users.push({ _id: mockObjectId, username, password: hashedPassword });
        setUsers(users);
        return { message: '注册成功' };
    } else {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '注册失败');
            }
            return await response.json();
        } catch (error) {
            console.error('注册错误:', error);
            throw error;
        }
    }
}

// 登录
export async function login(username, password) {
    if (USE_MOCK) {
        const users = getUsers();
        // 模拟模式：用_id匹配（统一字段名）
        const user = users.find(user => user.username === username);
        if (!user || !mockComparePassword(password, user.password)) {
            throw new Error('用户名或密码错误');
        }
        return { username, token: 'mock-token', id: user._id }; // 返回模拟的24位ID
    } else {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '登录失败');
            }
            return await response.json();
        } catch (error) {
            console.error('登录错误:', error);
            throw error;
        }
    }
}

// 获取数据列表
export async function getDataList(userId) {
    if (USE_MOCK) {
        const dataItems = getDataItems();
        // 模拟模式：用userId匹配（兼容ObjectId格式）
        return dataItems.filter(item => item.userId === userId);
    } else {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '获取数据失败');
            }
            return await response.json();
        } catch (error) {
            console.error('获取数据列表错误:', error);
            throw error;
        }
    }
}

// 获取单个数据
export async function getDataById(id) {
    // 统一兜底：前端只做空ID校验，格式校验交给后端
    if (!id || id.trim() === '') {
        throw new Error('数据ID不能为空');
    }
    if (USE_MOCK) {
        const dataItems = getDataItems();
        // 模拟模式：兼容id和_id字段（统一匹配）
        return dataItems.find(item => item.id === id || item._id === id);
    } else {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/data/${id.trim()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '获取数据失败');
            }
            return await response.json();
        } catch (error) {
            console.error('获取数据错误:', error);
            throw error;
        }
    }
}

// 保存数据
export async function saveData(name, waveData, userId) {
    if (USE_MOCK) {
        // 模拟模式：生成24位ObjectId格式的ID，统一用_id字段
        const mockObjectId = Math.random().toString(16).slice(2, 26);
        const dataItem = {
            _id: mockObjectId,
            name,
            waveData,
            userId,
            createdAt: new Date().toISOString()
        };
        const dataItems = getDataItems();
        dataItems.push(dataItem);
        setDataItems(dataItems);
        return dataItem;
    } else {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, waveData })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '保存失败');
            }
            return await response.json();
        } catch (error) {
            console.error('保存数据错误:', error);
            throw error;
        }
    }
}

// 删除数据
export async function deleteData(id) {
    // 仅做空ID校验，格式/存在性交给后端
    if (!id || id.trim() === '') {
        throw new Error('数据ID不能为空');
    }
    if (USE_MOCK) {
        const dataItems = getDataItems();
        const filteredItems = dataItems.filter(item => item.id !== id && item._id !== id);
        setDataItems(filteredItems);
        return { message: '删除成功' };
    } else {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/data/${id.trim()}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '删除失败');
            }
            return await response.json();
        } catch (error) {
            console.error('删除数据错误:', error);
            throw error;
        }
    }
}

// 更新数据
export async function updateData(id, name, waveData) {
    // 仅做空ID校验，格式/存在性交给后端
    if (!id || id.trim() === '') {
        throw new Error('数据ID不能为空');
    }
    if (USE_MOCK) {
        const dataItems = getDataItems();
        const index = dataItems.findIndex(item => item.id === id || item._id === id);
        if (index === -1) {
            throw new Error('数据不存在');
        }
        dataItems[index] = {
            ...dataItems[index],
            name,
            waveData,
            updatedAt: new Date().toISOString()
        };
        setDataItems(dataItems);
        return { message: '更新成功' };
    } else {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/data/${id.trim()}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, waveData })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '更新失败');
            }
            return await response.json();
        } catch (error) {
            console.error('更新数据错误:', error);
            throw error;
        }
    }
}
