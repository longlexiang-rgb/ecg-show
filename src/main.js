// 主应用模块
import { API_BASE_URL, USE_MOCK } from './config.js';
import { getCurrentUser, setCurrentUser, removeCurrentUser, getToken, setToken, removeToken } from './storage.js';
import { register, login, getDataList, getDataById, saveData, deleteData, updateData } from './api.js';
import { parseWaveDataInput, parseFileContent, formatDate, showLoading, showError, showEmptyState } from './utils.js';

// 全局变量
let currentUser = getCurrentUser();
let token = getToken();

// 初始化密码显示/隐藏功能
function initPasswordToggle() {
    // 登录表单密码切换
    const toggleLoginPassword = document.getElementById('toggle-login-password');
    const loginPassword = document.getElementById('login-password');
    
    if (toggleLoginPassword && loginPassword) {
        toggleLoginPassword.addEventListener('click', function() {
            const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPassword.setAttribute('type', type);
            
            // 切换图标
            const svg = toggleLoginPassword.querySelector('svg');
            if (type === 'text') {
                svg.innerHTML = '<path d="M15.47 8.34172C14.8819 6.82054 13.861 5.50503 12.5334 4.55776C11.2058 3.6105 9.62971 3.07301 7.99997 3.01172C6.37023 3.07301 4.79416 3.6105 3.46657 4.55776C2.13898 5.50503 1.11805 6.82054 0.52997 8.34172C0.490254 8.45157 0.490254 8.57187 0.52997 8.68172C1.11805 10.2029 2.13898 11.5184 3.46657 12.4657C4.79416 13.4129 6.37023 13.9504 7.99997 14.0117C9.62971 13.9504 11.2058 13.4129 12.5334 12.4657C13.861 11.5184 14.8819 10.2029 15.47 8.68172C15.5097 8.57187 15.5097 8.45157 15.47 8.34172ZM7.99997 13.0117C5.34997 13.0117 2.54997 11.0467 1.53497 8.51172C2.54997 5.97672 5.34997 4.01172 7.99997 4.01172C10.65 4.01172 13.45 5.97672 14.465 8.51172C13.45 11.0467 10.65 13.0117 7.99997 13.0117Z"></path><path d="M7.99997 5.51172C7.40663 5.51172 6.82661 5.68767 6.33326 6.01731C5.83991 6.34695 5.45539 6.81549 5.22833 7.36367C5.00127 7.91185 4.94186 8.51505 5.05761 9.09699C5.17337 9.67893 5.45909 10.2135 5.87865 10.633C6.29821 11.0526 6.83276 11.3383 7.4147 11.4541C7.99664 11.5698 8.59984 11.5104 9.14802 11.2834C9.6962 11.0563 10.1647 10.6718 10.4944 10.1784C10.824 9.68508 11 9.10506 11 8.51172C11 7.71607 10.6839 6.95301 10.1213 6.3904C9.55868 5.82779 8.79562 5.51172 7.99997 5.51172ZM7.99997 10.5117C7.60441 10.5117 7.21773 10.3944 6.88883 10.1747C6.55993 9.9549 6.30359 9.64254 6.15221 9.27709C6.00084 8.91163 5.96123 8.5095 6.0384 8.12154C6.11557 7.73358 6.30605 7.37721 6.58576 7.09751C6.86546 6.8178 7.22183 6.62732 7.60979 6.55015C7.99775 6.47298 8.39988 6.51258 8.76534 6.66396C9.13079 6.81533 9.44315 7.07168 9.66291 7.40058C9.88267 7.72948 9.99997 8.11616 9.99997 8.51172C9.99997 9.04215 9.78926 9.55086 9.41418 9.92593C9.03911 10.301 8.5304 10.5117 7.99997 10.5117Z"></path>';
            } else {
                svg.innerHTML = '<path d="M2.61997 11.7667L3.33497 11.0567C2.55208 10.3538 1.93696 9.48406 1.53497 8.51172C2.54997 5.97672 5.34997 4.01172 7.99997 4.01172C8.68192 4.02072 9.35769 4.14236 9.99997 4.37172L10.775 3.59172C9.8963 3.22038 8.95382 3.02339 7.99997 3.01172C6.37023 3.07301 4.79416 3.6105 3.46657 4.55776C2.13898 5.50503 1.11805 6.82054 0.52997 8.34172C0.490254 8.45157 0.490254 8.57187 0.52997 8.68172C0.974094 9.86023 1.69018 10.9172 2.61997 11.7667Z"></path><path d="M5.99997 8.37672C6.03474 7.89758 6.24082 7.44696 6.58051 7.10726C6.92021 6.76756 7.37083 6.56149 7.84997 6.52672L8.75497 5.61672C8.24785 5.48319 7.71459 5.48493 7.20835 5.62175C6.70211 5.75857 6.24058 6.02571 5.86977 6.39652C5.49896 6.76733 5.23182 7.22886 5.095 7.7351C4.95818 8.24134 4.95644 8.7746 5.08997 9.28172L5.99997 8.37672Z"></path><path d="M15.47 8.34172C14.8966 6.84832 13.899 5.55523 12.6 4.62172L15 2.21672L14.295 1.51172L0.99997 14.8067L1.70497 15.5117L4.25497 12.9617C5.39191 13.6287 6.68199 13.9904 7.99997 14.0117C9.62971 13.9504 11.2058 13.4129 12.5334 12.4657C13.861 11.5184 14.8819 10.2029 15.47 8.68172C15.5097 8.57187 15.5097 8.45157 15.47 8.34172ZM9.99997 8.51172C9.99786 8.86177 9.90392 9.20514 9.72752 9.5075C9.55113 9.80987 9.29846 10.0606 8.99477 10.2347C8.69109 10.4089 8.34702 10.5002 7.99697 10.4997C7.64691 10.4992 7.30312 10.4068 6.99997 10.2317L9.71997 7.51172C9.89972 7.81458 9.99631 8.15955 9.99997 8.51172ZM7.99997 13.0117C6.951 12.9934 5.92192 12.7224 4.99997 12.2217L6.26997 10.9517C6.84764 11.3525 7.54774 11.5377 8.24804 11.475C8.94833 11.4122 9.60434 11.1054 10.1015 10.6083C10.5987 10.1111 10.9054 9.45508 10.9682 8.75478C11.031 8.05449 10.8458 7.35439 10.445 6.77672L11.88 5.34172C13.0273 6.12921 13.9244 7.22943 14.465 8.51172C13.45 11.0467 10.65 13.0117 7.99997 13.0117Z"></path>';
            }
        });
    }
    
    // 注册表单密码切换
    const toggleRegisterPassword = document.getElementById('toggle-register-password');
    const registerPassword = document.getElementById('register-password');
    
    if (toggleRegisterPassword && registerPassword) {
        toggleRegisterPassword.addEventListener('click', function() {
            const type = registerPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            registerPassword.setAttribute('type', type);
            
            // 切换图标
            const svg = toggleRegisterPassword.querySelector('svg');
            if (type === 'text') {
                svg.innerHTML = '<path d="M15.47 8.34172C14.8819 6.82054 13.861 5.50503 12.5334 4.55776C11.2058 3.6105 9.62971 3.07301 7.99997 3.01172C6.37023 3.07301 4.79416 3.6105 3.46657 4.55776C2.13898 5.50503 1.11805 6.82054 0.52997 8.34172C0.490254 8.45157 0.490254 8.57187 0.52997 8.68172C1.11805 10.2029 2.13898 11.5184 3.46657 12.4657C4.79416 13.4129 6.37023 13.9504 7.99997 14.0117C9.62971 13.9504 11.2058 13.4129 12.5334 12.4657C13.861 11.5184 14.8819 10.2029 15.47 8.68172C15.5097 8.57187 15.5097 8.45157 15.47 8.34172ZM7.99997 13.0117C5.34997 13.0117 2.54997 11.0467 1.53497 8.51172C2.54997 5.97672 5.34997 4.01172 7.99997 4.01172C10.65 4.01172 13.45 5.97672 14.465 8.51172C13.45 11.0467 10.65 13.0117 7.99997 13.0117Z"></path><path d="M7.99997 5.51172C7.40663 5.51172 6.82661 5.68767 6.33326 6.01731C5.83991 6.34695 5.45539 6.81549 5.22833 7.36367C5.00127 7.91185 4.94186 8.51505 5.05761 9.09699C5.17337 9.67893 5.45909 10.2135 5.87865 10.633C6.29821 11.0526 6.83276 11.3383 7.4147 11.4541C7.99664 11.5698 8.59984 11.5104 9.14802 11.2834C9.6962 11.0563 10.1647 10.6718 10.4944 10.1784C10.824 9.68508 11 9.10506 11 8.51172C11 7.71607 10.6839 6.95301 10.1213 6.3904C9.55868 5.82779 8.79562 5.51172 7.99997 5.51172ZM7.99997 10.5117C7.60441 10.5117 7.21773 10.3944 6.88883 10.1747C6.55993 9.9549 6.30359 9.64254 6.15221 9.27709C6.00084 8.91163 5.96123 8.5095 6.0384 8.12154C6.11557 7.73358 6.30605 7.37721 6.58576 7.09751C6.86546 6.8178 7.22183 6.62732 7.60979 6.55015C7.99775 6.47298 8.39988 6.51258 8.76534 6.66396C9.13079 6.81533 9.44315 7.07168 9.66291 7.40058C9.88267 7.72948 9.99997 8.11616 9.99997 8.51172C9.99997 9.04215 9.78926 9.55086 9.41418 9.92593C9.03911 10.301 8.5304 10.5117 7.99997 10.5117Z"></path>';
            } else {
                svg.innerHTML = '<path d="M2.61997 11.7667L3.33497 11.0567C2.55208 10.3538 1.93696 9.48406 1.53497 8.51172C2.54997 5.97672 5.34997 4.01172 7.99997 4.01172C8.68192 4.02072 9.35769 4.14236 9.99997 4.37172L10.775 3.59172C9.8963 3.22038 8.95382 3.02339 7.99997 3.01172C6.37023 3.07301 4.79416 3.6105 3.46657 4.55776C2.13898 5.50503 1.11805 6.82054 0.52997 8.34172C0.490254 8.45157 0.490254 8.57187 0.52997 8.68172C0.974094 9.86023 1.69018 10.9172 2.61997 11.7667Z"></path><path d="M5.99997 8.37672C6.03474 7.89758 6.24082 7.44696 6.58051 7.10726C6.92021 6.76756 7.37083 6.56149 7.84997 6.52672L8.75497 5.61672C8.24785 5.48319 7.71459 5.48493 7.20835 5.62175C6.70211 5.75857 6.24058 6.02571 5.86977 6.39652C5.49896 6.76733 5.23182 7.22886 5.095 7.7351C4.95818 8.24134 4.95644 8.7746 5.08997 9.28172L5.99997 8.37672Z"></path><path d="M15.47 8.34172C14.8966 6.84832 13.899 5.55523 12.6 4.62172L15 2.21672L14.295 1.51172L0.99997 14.8067L1.70497 15.5117L4.25497 12.9617C5.39191 13.6287 6.68199 13.9904 7.99997 14.0117C9.62971 13.9504 11.2058 13.4129 12.5334 12.4657C13.861 11.5184 14.8819 10.2029 15.47 8.68172C15.5097 8.57187 15.5097 8.45157 15.47 8.34172ZM9.99997 8.51172C9.99786 8.86177 9.90392 9.20514 9.72752 9.5075C9.55113 9.80987 9.29846 10.0606 8.99477 10.2347C8.69109 10.4089 8.34702 10.5002 7.99697 10.4997C7.64691 10.4992 7.30312 10.4068 6.99997 10.2317L9.71997 7.51172C9.89972 7.81458 9.99631 8.15955 9.99997 8.51172ZM7.99997 13.0117C6.951 12.9934 5.92192 12.7224 4.99997 12.2217L6.26997 10.9517C6.84764 11.3525 7.54774 11.5377 8.24804 11.475C8.94833 11.4122 9.60434 11.1054 10.1015 10.6083C10.5987 10.1111 10.9054 9.45508 10.9682 8.75478C11.031 8.05449 10.8458 7.35439 10.445 6.77672L11.88 5.34172C13.0273 6.12921 13.9244 7.22943 14.465 8.51172C13.45 11.0467 10.65 13.0117 7.99997 13.0117Z"></path>';
            }
        });
    }
}

// 初始化页面
function initPage() {
    if (currentUser && (token || USE_MOCK)) {
        showUserData();
    } else {
        showAuthForms();
    }
    bindEvents();
    initMobileMenu();
    initPasswordToggle();
}



// 显示用户数据
function showUserData() {
    // 显示登录后导航，隐藏未登录导航
    document.getElementById('nav-links').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    
    // 更新用户名显示
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('mobile-username').textContent = currentUser.username;
    
    // 移动端导航
    document.getElementById('mobile-nav-links').classList.remove('active');
    document.getElementById('mobile-user-info').classList.remove('active');
    
    // 其他元素
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('data-container').classList.remove('hidden');
    document.getElementById('current-page').textContent = '数据管理';
    loadDataList();
}

// 显示认证表单
function showAuthForms() {
    // 显示未登录导航，隐藏登录后导航
    document.getElementById('nav-links').style.display = 'flex';
    document.getElementById('user-info').style.display = 'none';
    
    // 移动端导航
    document.getElementById('mobile-nav-links').classList.remove('active');
    document.getElementById('mobile-user-info').classList.remove('active');
    
    // 其他元素
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('data-container').classList.add('hidden');
    
    // 检查URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const formParam = urlParams.get('form');
    
    if (formParam === 'register') {
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('current-page').textContent = '注册';
    } else {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('current-page').textContent = '登录';
    }
}

// 初始化移动端菜单
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        // 为按钮和SVG都添加点击事件
        function handleMenuClick(e) {
            e.stopPropagation(); // 防止事件冒泡
            
            // 切换移动端导航菜单的显示/隐藏
            const mobileNavLinks = document.getElementById('mobile-nav-links');
            const mobileUserInfo = document.getElementById('mobile-user-info');
            
            // 检查当前用户状态
            if (currentUser && (token || USE_MOCK)) {
                mobileUserInfo.classList.toggle('active');
                mobileNavLinks.classList.remove('active');
                // 切换汉堡图标激活状态
                mobileMenuBtn.classList.toggle('active', mobileUserInfo.classList.contains('active'));
            } else {
                mobileNavLinks.classList.toggle('active');
                mobileUserInfo.classList.remove('active');
                // 切换汉堡图标激活状态
                mobileMenuBtn.classList.toggle('active', mobileNavLinks.classList.contains('active'));
            }
        }
        
        // 绑定到按钮
        mobileMenuBtn.addEventListener('click', handleMenuClick);
        
        // 绑定到SVG
        const svgElement = mobileMenuBtn.querySelector('svg');
        if (svgElement) {
            svgElement.addEventListener('click', handleMenuClick);
        }
        
        // 点击页面其他地方关闭菜单
        document.addEventListener('click', function(e) {
            const mobileNavLinks = document.getElementById('mobile-nav-links');
            const mobileUserInfo = document.getElementById('mobile-user-info');
            
            // 检查点击是否在菜单按钮或菜单内容之外
            if (mobileMenuBtn && !mobileMenuBtn.contains(e.target) && 
                mobileNavLinks && !mobileNavLinks.contains(e.target) && 
                mobileUserInfo && !mobileUserInfo.contains(e.target)) {
                // 关闭所有菜单
                mobileNavLinks.classList.remove('active');
                mobileUserInfo.classList.remove('active');
                // 移除汉堡图标激活状态
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
}

// 显示消息提示
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 表单验证
function validateForm(formId) {
    let isValid = true;
    
    if (formId === 'login') {
        const username = document.getElementById('login-username');
        const password = document.getElementById('login-password');
        const usernameError = document.getElementById('login-username-error');
        const passwordError = document.getElementById('login-password-error');
        
        // 验证用户名
        if (!username.value.trim()) {
            usernameError.textContent = '请输入用户名';
            username.classList.add('input-error');
            isValid = false;
        } else {
            usernameError.textContent = '';
            username.classList.remove('input-error');
        }
        
        // 验证密码
        if (!password.value) {
            passwordError.textContent = '请输入密码';
            password.classList.add('input-error');
            isValid = false;
        } else {
            passwordError.textContent = '';
            password.classList.remove('input-error');
        }
    } else if (formId === 'register') {
        const username = document.getElementById('register-username');
        const password = document.getElementById('register-password');
        const usernameError = document.getElementById('register-username-error');
        const passwordError = document.getElementById('register-password-error');
        
        // 验证用户名
        if (!username.value.trim()) {
            usernameError.textContent = '请输入用户名';
            username.classList.add('input-error');
            isValid = false;
        } else if (username.value.length < 3) {
            usernameError.textContent = '用户名至少需要3个字符';
            username.classList.add('input-error');
            isValid = false;
        } else {
            usernameError.textContent = '';
            username.classList.remove('input-error');
        }
        
        // 验证密码
        if (!password.value) {
            passwordError.textContent = '请输入密码';
            password.classList.add('input-error');
            isValid = false;
        } else if (password.value.length < 6) {
            passwordError.textContent = '密码至少需要6个字符';
            password.classList.add('input-error');
            isValid = false;
        } else {
            passwordError.textContent = '';
            password.classList.remove('input-error');
        }
    } else if (formId === 'data') {
        const name = document.getElementById('data-name');
        const waveData = document.getElementById('wave-data');
        const nameError = document.getElementById('data-name-error');
        const waveDataError = document.getElementById('wave-data-error');
        
        // 验证数据名称
        if (!name.value.trim()) {
            nameError.textContent = '请输入数据名称';
            name.classList.add('input-error');
            isValid = false;
        } else {
            nameError.textContent = '';
            name.classList.remove('input-error');
        }
        
        // 验证波形数据
        if (!waveData.value.trim()) {
            waveDataError.textContent = '请输入波形数据';
            waveData.classList.add('input-error');
            isValid = false;
        } else {
            const dataArray = parseWaveDataInput(waveData.value);
            if (dataArray.length === 0) {
                waveDataError.textContent = '请输入有效的波形数据';
                waveData.classList.add('input-error');
                isValid = false;
            } else {
                waveDataError.textContent = '';
                waveData.classList.remove('input-error');
            }
        }
    }
    
    return isValid;
}

// 绑定事件
function bindEvents() {
    // 导航栏登录按钮
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showAuthForms();
            document.getElementById('login-form').classList.remove('hidden');
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('current-page').textContent = '登录';
        });
    }

    // 导航栏注册按钮
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            showAuthForms();
            document.getElementById('register-form').classList.remove('hidden');
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('current-page').textContent = '注册';
        });
    }

    // 切换到注册表单
    document.getElementById('switch-to-register').addEventListener('click', function() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('current-page').textContent = '注册';
    });

    // 切换到登录表单
    document.getElementById('switch-to-login').addEventListener('click', function() {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('current-page').textContent = '登录';
    });

    // 注册功能
    document.getElementById('submit-register').addEventListener('click', async function() {
        // 验证表单
        if (!validateForm('register')) {
            return;
        }
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const registerButton = this;
        const originalText = registerButton.textContent;

        try {
            // 显示加载状态
            registerButton.textContent = '注册中...';
            registerButton.disabled = true;
            
            await register(username, password);
            showToast('注册成功，请登录', 'success');
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
            document.getElementById('current-page').textContent = '登录';
            // 清空表单
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
        } catch (error) {
            showToast(error.message || '注册失败', 'error');
        } finally {
            // 恢复按钮状态
            registerButton.textContent = originalText;
            registerButton.disabled = false;
        }
    });

    // 登录功能
    document.getElementById('submit-login').addEventListener('click', async function() {
        // 验证表单
        if (!validateForm('login')) {
            return;
        }
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const loginButton = this;
        const originalText = loginButton.textContent;

        try {
            // 显示加载状态
            loginButton.textContent = '登录中...';
            loginButton.disabled = true;
            
            const data = await login(username, password);
            currentUser = { username: data.username };
            token = data.token;
            setCurrentUser(currentUser);
            setToken(token);
            showUserData();
            showToast('登录成功', 'success');
            // 清空表单
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
        } catch (error) {
            showToast(error.message || '登录失败', 'error');
        } finally {
            // 恢复按钮状态
            loginButton.textContent = originalText;
            loginButton.disabled = false;
        }
    });

    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', function() {
        currentUser = null;
        token = null;
        removeCurrentUser();
        removeToken();
        showAuthForms();
        showToast('已退出登录', 'success');
    });

    // 文件上传处理
    document.getElementById('wave-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const extension = file.name.split('.').pop().toLowerCase();

            try {
                const parsedData = parseFileContent(content, extension);
                if (parsedData.length > 0) {
                    document.getElementById('wave-data').value = parsedData.join(',');
                    showToast('文件解析成功，数据已填充到输入框', 'success');
                } else {
                    showToast('文件解析失败，未找到有效的数值数据', 'error');
                }
            } catch (error) {
                console.error('文件解析错误:', error);
                showToast('文件解析失败，请检查文件格式', 'error');
            }
        };
        reader.readAsText(file);
    });

    // 保存数据
    document.getElementById('save-data').addEventListener('click', async function() {
        // 验证表单
        if (!validateForm('data')) {
            return;
        }
        
        const name = document.getElementById('data-name').value;
        const waveData = document.getElementById('wave-data').value;
        const saveButton = this;
        const originalText = saveButton.textContent;

        // 解析波形数据
        const dataArray = parseWaveDataInput(waveData);

        try {
            // 显示加载状态
            saveButton.textContent = '保存中...';
            saveButton.disabled = true;
            
            await saveData(name, dataArray, currentUser.username);
            await loadDataList();
            showToast('数据保存成功', 'success');

            // 清空表单
            document.getElementById('data-name').value = '';
            document.getElementById('wave-data').value = '';
        } catch (error) {
            showToast(error.message || '保存失败', 'error');
        } finally {
            // 恢复按钮状态
            saveButton.textContent = originalText;
            saveButton.disabled = false;
        }
    });

    // 数据列表事件委托
    document.getElementById('data-list').addEventListener('click', function(e) {
        const target = e.target;
        
        // 查看波形
        if (target.classList.contains('view-wave')) {
            e.preventDefault();
            const id = target.dataset.id;
            const originalText = target.textContent;
            
            (async function() {
                try {
                    // 显示加载状态
                    target.textContent = '加载中...';
                    target.disabled = true;
                    
                    const dataItem = await getDataById(id);
                    if (dataItem) {
                        renderWaveChart(dataItem.waveData, dataItem.name, dataItem.id || dataItem._id);
                        showToast('波形加载成功', 'success');
                    }
                } catch (error) {
                    showToast(error.message || '获取数据失败', 'error');
                } finally {
                    // 恢复按钮状态
                    target.textContent = originalText;
                    target.disabled = false;
                }
            })();
        }
        
        // 查看数据
        if (target.classList.contains('view-data')) {
            e.preventDefault();
            const id = target.dataset.id;
            const originalText = target.textContent;
            
            (async function() {
                try {
                    // 显示加载状态
                    target.textContent = '加载中...';
                    target.disabled = true;
                    
                    const dataItem = await getDataById(id);
                    if (dataItem) {
                        const maxDisplayItems = 20;
                        const displayData = dataItem.waveData.slice(0, maxDisplayItems);
                        const dataContent = displayData.map(item => `(${item[0]}, ${item[1]})`).join(', ');
                        const ellipsis = dataItem.waveData.length > maxDisplayItems ? ', ...' : '';
                        alert(`数据名称: ${dataItem.name}\n数据长度: ${dataItem.waveData.length}\n数据内容: [${dataContent}${ellipsis}]`);
                        showToast('数据加载成功', 'success');
                    }
                } catch (error) {
                    showToast(error.message || '获取数据失败', 'error');
                } finally {
                    // 恢复按钮状态
                    target.textContent = originalText;
                    target.disabled = false;
                }
            })();
        }
        
        // 删除按钮
        if (target.classList.contains('delete-btn')) {
            // 已经在loadDataList中为删除按钮添加了点击事件监听器
            // 这里不需要重复处理
            return;
        }
        
    });
}

// 加载数据列表
async function loadDataList() {
    const dataList = document.getElementById('data-list');
    showLoading(dataList);

    try {
        const userDataItems = await getDataList(currentUser.username);

        if (userDataItems.length === 0) {
            showEmptyState(dataList);
            return;
        }

        dataList.innerHTML = '';
        userDataItems.forEach(item => {
            const dataItem = document.createElement('div');
            dataItem.className = 'data-item';
            
            // 创建查看波形按钮
            const viewWaveButton = document.createElement('button');
            viewWaveButton.className = 'mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700';
            viewWaveButton.textContent = '查看波形';
            viewWaveButton.dataset.id = item._id || item.id;
            viewWaveButton.addEventListener('click', async function() {
                const id = this.dataset.id;
                const originalText = this.textContent;
                
                try {
                    // 显示加载状态
                    this.textContent = '加载中...';
                    this.disabled = true;
                    
                    const dataItem = await getDataById(id);
                    if (dataItem) {
                        renderWaveChart(dataItem.waveData, dataItem.name, dataItem.id || dataItem._id);
                        showToast('波形加载成功', 'success');
                    }
                } catch (error) {
                    showToast(error.message || '获取数据失败', 'error');
                } finally {
                    // 恢复按钮状态
                    this.textContent = originalText;
                    this.disabled = false;
                }
            });
            
            // 创建查看数据按钮
            const viewDataButton = document.createElement('button');
            viewDataButton.className = 'mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700';
            viewDataButton.textContent = '查看数据';
            viewDataButton.dataset.id = item._id || item.id;
            viewDataButton.addEventListener('click', async function() {
                const id = this.dataset.id;
                const originalText = this.textContent;
                
                try {
                    // 显示加载状态
                    this.textContent = '加载中...';
                    this.disabled = true;
                    
                    const dataItem = await getDataById(id);
                    if (dataItem) {
                        const maxDisplayItems = 20;
                        const displayData = dataItem.waveData.slice(0, maxDisplayItems);
                        const dataContent = displayData.map(item => `(${item[0]}, ${item[1]})`).join(', ');
                        const ellipsis = dataItem.waveData.length > maxDisplayItems ? ', ...' : '';
                        alert(`数据名称: ${dataItem.name}\n数据长度: ${dataItem.waveData.length}\n数据内容: [${dataContent}${ellipsis}]`);
                        showToast('数据加载成功', 'success');
                    }
                } catch (error) {
                    showToast(error.message || '获取数据失败', 'error');
                } finally {
                    // 恢复按钮状态
                    this.textContent = originalText;
                    this.disabled = false;
                }
            });
            
            // 创建修改按钮
            const editButton = document.createElement('button');
            editButton.className = 'mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 edit-btn';
            editButton.textContent = '修改';
            editButton.dataset.id = item._id || item.id;
            editButton.addEventListener('click', async function(e) {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                const id = this.dataset.id;
                const originalText = this.textContent;
                const btn = this;
                
                // 验证id是否存在
                if (!id) {
                    showToast('无效的数据ID', 'error');
                    return;
                }
                
                try {
                    // 显示加载状态
                    btn.textContent = '加载中...';
                    btn.disabled = true;
                    
                    // 获取当前数据
                    const dataItem = await getDataById(id);
                    if (dataItem) {
                        // 显示修改表单
                        showEditForm(dataItem);
                    }
                } catch (error) {
                    console.error('获取数据失败:', error);
                    showToast(error.message || '获取数据失败', 'error');
                } finally {
                    // 恢复按钮状态
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
            
            // 创建删除按钮
            const deleteButton = document.createElement('button');
            deleteButton.className = 'mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 delete-btn';
            deleteButton.textContent = '删除';
            deleteButton.dataset.id = item._id || item.id;
            deleteButton.addEventListener('click', function(e) {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                const id = this.dataset.id;
                const originalText = this.textContent;
                const btn = this;
                
                // 验证id是否存在
                if (!id) {
                    showToast('无效的数据ID', 'error');
                    return;
                }
                
                // 显示加载状态
                btn.textContent = '删除中...';
                btn.disabled = true;
                
                // 执行删除操作
                deleteData(id)
                    .then(() => {
                        return loadDataList();
                    })
                    .then(() => {
                        // 检查并清除波形图表
                        if (window.waveChart && window.currentWaveDataId === id) {
                            window.waveChart.destroy();
                            window.waveChart = null;
                            window.currentWaveDataId = null;
                            // 清空图表区域
                            const chartCanvas = document.getElementById('wave-chart');
                            if (chartCanvas) {
                                const ctx = chartCanvas.getContext('2d');
                                ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
                            }
                        }
                        showToast('删除成功', 'success');
                    })
                    .catch((error) => {
                        console.error('删除操作失败:', error);
                        showToast(error.message || '删除失败', 'error');
                    })
                    .finally(() => {
                        // 恢复按钮状态
                        btn.textContent = originalText;
                        btn.disabled = false;
                    });
            });
            
            // 构建数据项内容
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = `
                <h3 class="font-bold text-lg">${item.name}</h3>
                <p class="text-sm text-gray-500">${formatDate(item.createdAt)}</p>
                <p class="text-sm text-gray-600 mt-1">数据点数量: ${item.waveData.length}</p>
            `;
            
            // 添加内容和按钮
            dataItem.appendChild(contentDiv);
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';
            btnGroup.appendChild(viewWaveButton);
            btnGroup.appendChild(viewDataButton);
            btnGroup.appendChild(editButton);
            btnGroup.appendChild(deleteButton);
            dataItem.appendChild(btnGroup);
            
            dataList.appendChild(dataItem);
        });
    } catch (error) {
        console.error('加载数据列表错误:', error);
        showError(dataList, '加载失败，请稍后重试');
        showToast('加载数据失败，请稍后重试', 'error');
    }
}

// 渲染波形图表
function renderWaveChart(data, name, id) {
    const ctx = document.getElementById('wave-chart').getContext('2d');
    
    // 销毁现有图表
    if (window.waveChart) {
        window.waveChart.destroy();
    }

    // 保存当前数据ID
    window.currentWaveDataId = id;

    // 准备图表数据
    let chartData = [];
    
    if (Array.isArray(data) && data.length > 0) {
        if (Array.isArray(data[0]) && data[0].length >= 2) {
            // 时间-电压对格式：转换为对象数组格式
            chartData = data.map(item => {
                return {
                    x: parseFloat(item[0]),
                    y: parseFloat(item[1])
                };
            });
        } else {
            // 纯数值格式：使用索引作为x值
            chartData = data.map((value, index) => {
                return {
                    x: index + 1,
                    y: parseFloat(value)
                };
            });
        }
        
        // 按照x值（时间）排序，确保数据点在图表中正确连接
        chartData.sort((a, b) => a.x - b.x);
    }
    
    // 创建新图表
    window.waveChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: name,
                data: chartData,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                pointRadius: 1,
                pointHoverRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: name,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '时间/索引'
                    },
                    type: 'linear', // 将x轴设置为数值型
                    position: 'bottom'
                },
                y: {
                    title: {
                        display: true,
                        text: '电压值'
                    },
                    beginAtZero: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// 显示修改表单
function showEditForm(dataItem) {
    // 创建修改表单容器
    const editFormContainer = document.createElement('div');
    editFormContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    editFormContainer.id = 'edit-form-container';
    
    // 创建表单
    const editForm = document.createElement('div');
    editForm.className = 'bg-white p-6 rounded-lg shadow-md w-full max-w-md';
    
    // 处理波形数据显示
    let waveDataText = '';
    if (Array.isArray(dataItem.waveData) && dataItem.waveData.length > 0) {
        if (Array.isArray(dataItem.waveData[0]) && dataItem.waveData[0].length >= 2) {
            // 时间-电压对格式：[[时间1, 电压1], [时间2, 电压2], ...]
            waveDataText = dataItem.waveData.map(item => item[1]).join(',');
        } else {
            // 纯数值格式：[值1, 值2, 值3, ...]
            waveDataText = dataItem.waveData.join(',');
        }
    }
    
    editForm.innerHTML = `
        <h2 class="text-xl font-bold mb-4">修改数据</h2>
        <div class="mb-4">
            <label class="block text-gray-700 mb-2">数据名称</label>
            <input type="text" id="edit-data-name" class="w-full px-4 py-2 border rounded" value="${dataItem.name}">
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 mb-2">波形数据</label>
            <textarea id="edit-wave-data" class="w-full px-4 py-2 border rounded h-32">${waveDataText}</textarea>
        </div>
        <div class="flex justify-end gap-4">
            <button id="cancel-edit" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">取消</button>
            <button id="save-edit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
    `;
    
    editFormContainer.appendChild(editForm);
    document.body.appendChild(editFormContainer);
    
    // 保存按钮点击事件
    document.getElementById('save-edit').addEventListener('click', async function() {
        const newName = document.getElementById('edit-data-name').value.trim();
        const newWaveData = document.getElementById('edit-wave-data').value.trim();
        
        if (!newName) {
            showToast('请输入数据名称', 'error');
            return;
        }
        
        if (!newWaveData) {
            showToast('请输入波形数据', 'error');
            return;
        }
        
        const dataArray = parseWaveDataInput(newWaveData);
        if (dataArray.length === 0) {
            showToast('请输入有效的波形数据', 'error');
            return;
        }
        
        try {
            await updateData(dataItem.id || dataItem._id, newName, dataArray);
            await loadDataList();
            showToast('修改成功', 'success');
            document.getElementById('edit-form-container').remove();
        } catch (error) {
            console.error('修改失败:', error);
            showToast(error.message || '修改失败', 'error');
        }
    });
    
    // 取消按钮点击事件
    document.getElementById('cancel-edit').addEventListener('click', function() {
        document.getElementById('edit-form-container').remove();
    });
    
    // 点击外部关闭
    editFormContainer.addEventListener('click', function(e) {
        if (e.target === editFormContainer) {
            editFormContainer.remove();
        }
    });
}

// 初始化页面
initPage();

// 隐藏加载页面
window.addEventListener('load', function() {
    setTimeout(function() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 500); // 延迟500ms，确保所有内容都已加载
});

// 实时表单验证
function setupRealTimeValidation() {
    // 登录表单验证
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    
    if (loginUsername) {
        loginUsername.addEventListener('input', function() {
            const errorElement = document.getElementById('login-username-error');
            if (!this.value.trim()) {
                errorElement.textContent = '请输入用户名';
                this.classList.add('input-error');
            } else {
                errorElement.textContent = '';
                this.classList.remove('input-error');
            }
        });
    }
    
    if (loginPassword) {
        loginPassword.addEventListener('input', function() {
            const errorElement = document.getElementById('login-password-error');
            if (!this.value) {
                errorElement.textContent = '请输入密码';
                this.classList.add('input-error');
            } else {
                errorElement.textContent = '';
                this.classList.remove('input-error');
            }
        });
    }
    
    // 注册表单验证
    const registerUsername = document.getElementById('register-username');
    const registerPassword = document.getElementById('register-password');
    
    if (registerUsername) {
        registerUsername.addEventListener('input', function() {
            const errorElement = document.getElementById('register-username-error');
            if (!this.value.trim()) {
                errorElement.textContent = '请输入用户名';
                this.classList.add('input-error');
            } else if (this.value.length < 3) {
                errorElement.textContent = '用户名至少需要3个字符';
                this.classList.add('input-error');
            } else {
                errorElement.textContent = '';
                this.classList.remove('input-error');
            }
        });
    }
    
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            const errorElement = document.getElementById('register-password-error');
            if (!this.value) {
                errorElement.textContent = '请输入密码';
                this.classList.add('input-error');
            } else if (this.value.length < 6) {
                errorElement.textContent = '密码至少需要6个字符';
                this.classList.add('input-error');
            } else {
                errorElement.textContent = '';
                this.classList.remove('input-error');
            }
        });
    }
    
    // 数据表单验证
    const dataName = document.getElementById('data-name');
    const waveData = document.getElementById('wave-data');
    
    if (dataName) {
        dataName.addEventListener('input', function() {
            const errorElement = document.getElementById('data-name-error');
            if (!this.value.trim()) {
                errorElement.textContent = '请输入数据名称';
                this.classList.add('input-error');
            } else {
                errorElement.textContent = '';
                this.classList.remove('input-error');
            }
        });
    }
    
    if (waveData) {
        waveData.addEventListener('input', function() {
            const errorElement = document.getElementById('wave-data-error');
            if (!this.value.trim()) {
                errorElement.textContent = '请输入波形数据';
                this.classList.add('input-error');
            } else {
                const dataArray = parseWaveDataInput(this.value);
                if (dataArray.length === 0) {
                    errorElement.textContent = '请输入有效的波形数据';
                    this.classList.add('input-error');
                } else {
                    errorElement.textContent = '';
                    this.classList.remove('input-error');
                }
            }
        });
    }
}

// 设置实时表单验证
setupRealTimeValidation();