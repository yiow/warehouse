
// 模拟数据
let pendingTasks = [];
let completedTasks = [];

// 确认任务函数
function confirmTask(taskId, type) {
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
    const confirmBtn = taskElement.querySelector('.confirm-btn');
    
    // 按钮状态变更
    confirmBtn.textContent = '处理中...';
    confirmBtn.disabled = true;
    
    // 模拟处理延迟
    setTimeout(() => {
        // 移动到已完成区域
        moveToCompleted(taskElement, type);
        
        // 更新计数
        updateCounts();
        
        // 显示成功消息
        showNotification(`${type === 'in' ? '入库' : '出库'}任务已确认完成！`, 'success');
    }, 1500);
}

// 移动任务到已完成区域
function moveToCompleted(taskElement, type) {
    const completedSection = document.getElementById('completedNotifications');
    const currentTime = new Date().toLocaleString('zh-CN');
    
    // 修改样式和内容
    taskElement.className = 'completed-item';
    
    // 更新时间显示
    const timeElement = taskElement.querySelector('.notification-time');
    timeElement.textContent = `已完成 - ${currentTime}`;
    
    // 添加完成状态
    const productInfo = taskElement.querySelector('.product-info');
    productInfo.innerHTML += '<div><strong>状态：</strong><span class="status-completed">✓ 已确认完成</span></div>';
    
    // 移除确认按钮
    const confirmBtn = taskElement.querySelector('.confirm-btn');
    confirmBtn.remove();
    
    // 移动元素
    completedSection.insertBefore(taskElement, completedSection.firstChild);
}

// 更新计数
function updateCounts() {
    const pendingCount = document.getElementById('pendingNotifications').children.length;
    const completedCount = document.getElementById('completedNotifications').children.length;
    
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('completedCount').textContent = completedCount;
}

// 显示通知消息
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 退出登录函数
function logout() {
    alert('即将返回登陆界面');
    window.location.href='/logout';
}

// 模拟接收新通知
function simulateNewNotification() {
    const notifications = [
        {
            type: 'in',
            title: '入库通知',
            product: '游戏机 PlayStation 5',
            code: 'P006-PS5',
            quantity: '15 台',
            location: 'D区-3号货架',
            supplier: '索尼娱乐有限公司'
        },
        {
            type: 'out',
            title: '出库通知',
            product: '平板电脑 iPad Air',
            code: 'P007-iPadAir',
            quantity: '40 台',
            location: 'E区-1号货架',
            customer: '教育设备采购中心'
        }
    ];
    
    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    addNewNotification(randomNotification);
}

// 添加新通知
function addNewNotification(notificationData) {
    const pendingArea = document.getElementById('pendingNotifications');
    const newId = Date.now();
    const currentTime = new Date().toLocaleString('zh-CN');
    
    const notificationHTML = `
        <div class="notification-item" data-id="${newId}">
            <div class="notification-meta">
                <span class="notification-type type-${notificationData.type}">${notificationData.type === 'in' ? '入库' : '出库'}</span>
                <span class="notification-time">${currentTime}</span>
            </div>
            <div class="notification-content">
                <strong>${notificationData.title}</strong>
                <div class="product-info">
                    <div><strong>产品名称：</strong>${notificationData.product}</div>
                    <div><strong>产品编号：</strong>${notificationData.code}</div>
                    <div><strong>数量：</strong>${notificationData.quantity}</div>
                    <div><strong>${notificationData.type === 'in' ? '存放位置' : '目标位置'}：</strong>${notificationData.location}</div>
                    <div><strong>${notificationData.type === 'in' ? '供应商' : '客户'}：</strong>${notificationData.type === 'in' ? notificationData.supplier : notificationData.customer}</div>
                </div>
            </div>
            <button class="confirm-btn" onclick="confirmTask(${newId}, '${notificationData.type}')">确认${notificationData.type === 'in' ? '入库' : '出库'}完成</button>
        </div>
    `;
    
    pendingArea.insertAdjacentHTML('afterbegin', notificationHTML);
    updateCounts();
    showNotification(`收到新的${notificationData.type === 'in' ? '入库' : '出库'}通知！`, 'info');
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 模拟定期接收新通知（实际应用中应该是WebSocket或轮询）
    setInterval(simulateNewNotification, 30000); // 30秒后模拟新通知
    
    showNotification('欢迎使用仓库管理系统！', 'success');
});
