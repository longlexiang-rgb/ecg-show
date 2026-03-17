// API请求模块
import { API_BASE_URL, USE_MOCK } from './config.js';
import { getToken, getUsers, setUsers, getDataItems, setDataItems } from './storage.js';

// 模拟bcrypt加密（仅用于模拟模式）
function mockHashPassword(password) {
    // 简单的模拟加密，实际项目中应该使用真实的bcrypt
    return `hashed_${password}`;
}

// 模拟密码验证（仅用于模拟模式）
function mockComparePassword(password, hashedPassword) {
    return `hashed_${password}` === hashedPassword;
}

// 注册
export async function register(username, password) {
    if (USE_MOCK) {
        // 模拟注册
        const users = getUsers();
        if (users.some(user => user.username === username)) {
            throw new Error('用户名已存在');
        }

        // 对密码进行加密
        const hashedPassword = mockHashPassword(password);
        users.push({ id: Date.now().toString(), username, password: hashedPassword });
        setUsers(users);
        return { message: '注册成功' };
    } else {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
        // 模拟登录
        const users = getUsers();
        const user = users.find(user => user.username === username);
        if (!user || !mockComparePassword(password, user.password)) {
            throw new Error('用户名或密码错误');
        }

        return { username, token: 'mock-token' };
    } else {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
        // 模拟获取数据列表
        const dataItems = getDataItems();
        return dataItems.filter(item => item.userId === userId);
    } else {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/data`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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
    if (USE_MOCK) {
        // 模拟获取单个数据
        const dataItems = getDataItems();
        return dataItems.find(item => item.id === id);
    } else {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/data/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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
        // 模拟保存数据
        const dataItem = {
            id: Date.now().toString(),
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
                body: JSON.stringify({
                    name,
                    waveData
                })
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
    // 验证id是否存在
    if (!id) {
        throw new Error('无效的数据ID');
    }
    
    if (USE_MOCK) {
        // 模拟删除数据
        const dataItems = getDataItems();
        const filteredItems = dataItems.filter(item => (item.id !== id) && (item._id !== id));
        setDataItems(filteredItems);
        return { message: '删除成功' };
    } else {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/data/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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
    // 验证id是否存在
    if (!id) {
        throw new Error('无效的数据ID');
    }
    
    if (USE_MOCK) {
        // 模拟更新数据
        const dataItems = getDataItems();
        const index = dataItems.findIndex(item => (item.id === id) || (item._id === id));
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
            const response = await fetch(`${API_BASE_URL}/api/data/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    waveData
                })
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
