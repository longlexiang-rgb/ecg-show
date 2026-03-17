// 工具函数模块

// 解析波形数据函数（支持纯数值、时间-电压格式和混合格式）
export function parseWaveData(data) {
    let parsedData = [];
    
    if (Array.isArray(data)) {
        // 处理混合格式：部分是时间-电压对，部分是纯数值
        data.forEach((item, index) => {
            if (Array.isArray(item) && item.length >= 2) {
                // 时间-电压格式：[时间, 电压]
                const time = parseFloat(item[0]);
                const voltage = parseFloat(item[1]);
                if (!isNaN(time) && !isNaN(voltage)) {
                    parsedData.push([time, voltage]);
                }
            } else {
                // 纯数值格式：值
                const voltage = parseFloat(item);
                if (!isNaN(voltage)) {
                    // 为纯数值生成时间索引
                    parsedData.push([parsedData.length, voltage]);
                }
            }
        });
    }
    
    return parsedData;
}

// 解析文件内容
export function parseFileContent(content, extension) {
    let parsedData = [];

    try {
        switch (extension) {
            case 'txt':
                // 解析文本文件，支持每行一个数值或时间 电压格式
                const lines = content.split('\n');
                parsedData = lines.map(line => {
                    const parts = line.trim().split(/[,\s]+/);
                    if (parts.length >= 2) {
                        // 时间 电压格式
                        const time = parseFloat(parts[0]);
                        const voltage = parseFloat(parts[1]);
                        if (!isNaN(time) && !isNaN(voltage)) {
                            return [time, voltage];
                        }
                    } else if (parts.length === 1) {
                        // 纯数值格式
                        const voltage = parseFloat(parts[0]);
                        if (!isNaN(voltage)) {
                            return [parsedData.length, voltage];
                        }
                    }
                    return null;
                }).filter(item => item !== null);
                break;
            case 'csv':
                // 解析CSV文件，支持时间,电压格式或纯数值格式
                parsedData = content.split('\n')
                    .map(line => {
                        const parts = line.split(',');
                        if (parts.length >= 2) {
                            // 时间,电压格式
                            const time = parseFloat(parts[0].trim());
                            const voltage = parseFloat(parts[1].trim());
                            if (!isNaN(time) && !isNaN(voltage)) {
                                return [time, voltage];
                            }
                        } else if (parts.length === 1) {
                            // 纯数值格式
                            const voltage = parseFloat(parts[0].trim());
                            if (!isNaN(voltage)) {
                                return [parsedData.length, voltage];
                            }
                        }
                        return null;
                    })
                    .filter(item => item !== null);
                break;
            case 'json':
                // 解析JSON文件，支持纯数值数组或时间-电压二维数组
                const jsonData = JSON.parse(content);
                parsedData = parseWaveData(jsonData);
                break;
            default:
                throw new Error('不支持的文件格式');
        }

        return parsedData;
    } catch (error) {
        console.error('文件解析错误:', error);
        throw error;
    }
}

// 解析波形数据输入
export function parseWaveDataInput(input) {
    let dataArray = [];
    try {
        // 尝试解析为JSON（支持时间-电压格式的二维数组、纯数值数组或混合格式）
        const parsedJson = JSON.parse(input);
        dataArray = parseWaveData(parsedJson);
    } catch (e) {
        // 检查是否包含时间-电压对格式：(时间, 电压)
        if (input.includes('(') && input.includes(')')) {
            // 先提取所有时间-电压对
            const pairs = input.match(/\([^()]+\)/g);
            if (pairs) {
                pairs.forEach(pair => {
                    // 移除括号并分割时间和电压
                    const values = pair.replace(/[()]/g, '').split(',').map(v => parseFloat(v.trim()));
                    if (values.length >= 2 && !isNaN(values[0]) && !isNaN(values[1])) {
                        dataArray.push([values[0], values[1]]);
                    }
                });
            }
            
            // 提取剩余的纯数值（不在括号内的部分）
            const remainingInput = input.replace(/\([^()]+\)/g, '').trim();
            if (remainingInput) {
                const values = remainingInput.split(',').map(item => parseFloat(item.trim())).filter(item => !isNaN(item));
                values.forEach(value => {
                    dataArray.push([dataArray.length, value]);
                });
            }
        } else {
            // 纯数值格式，按逗号分隔解析
            const values = input.split(',').map(item => parseFloat(item.trim())).filter(item => !isNaN(item));
            values.forEach((value, index) => {
                dataArray.push([index, value]);
            });
        }
    }
    
    return dataArray;
}

// 格式化日期
export function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

// 显示加载状态
export function showLoading(element, message = '加载中...') {
    element.innerHTML = `<p class="text-gray-500">${message}</p>`;
}

// 显示错误信息
export function showError(element, message) {
    element.innerHTML = `<p class="text-red-500">${message}</p>`;
}

// 显示空状态
export function showEmptyState(element, message = '暂无数据') {
    element.innerHTML = `<p class="text-gray-500">${message}</p>`;
}
