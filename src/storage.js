// 存储管理模块

// 获取当前用户
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

// 设置当前用户
export function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// 移除当前用户
export function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}

// 获取token
export function getToken() {
    return localStorage.getItem('token') || null;
}

// 设置token
export function setToken(token) {
    localStorage.setItem('token', token);
}

// 移除token
export function removeToken() {
    localStorage.removeItem('token');
}

// 获取用户列表（仅用于模拟模式）
export function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// 设置用户列表（仅用于模拟模式）
export function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// 获取数据列表（仅用于模拟模式）
export function getDataItems() {
    return JSON.parse(localStorage.getItem('dataItems')) || [];
}

// 设置数据列表（仅用于模拟模式）
export function setDataItems(dataItems) {
    localStorage.setItem('dataItems', JSON.stringify(dataItems));
}

// 清除所有存储数据
export function clearStorage() {
    localStorage.clear();
}
