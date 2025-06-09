
// 模拟数据
// let pendingTasks = [];
// let completedTasks = [];

// 确认任务函数
async function confirmTask(goodNum, type) { // 接收 Good_Num 作为任务ID (现在确保它始终是字符串)
    const taskElement = document.querySelector(`[data-good-num="${goodNum}"]`); // 根据 data-good-num 查找元素
    if (!taskElement) {
        console.error("Task element not found for Good_Num:", goodNum);
        return;
    }

    const confirmBtn = taskElement.querySelector('.confirm-btn');

    // 按钮状态变更
    confirmBtn.textContent = '处理中...';
    confirmBtn.disabled = true;

    try {
        // 向后端发送确认请求
        const response = await fetch('/confirm_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ goodNum: goodNum }) // 发送 Good_Num
        });

        const result = await response.json();

        if (result.status === 'success') {
            // 移动到已完成区域
            moveToCompleted(taskElement, type);

            // 更新计数
            updateCounts();

            // 显示成功消息
            showNotification(`${type === 'in' ? '入库' : '出库'}任务已确认完成！`, 'success');
        } else {
            // 恢复按钮状态
            confirmBtn.textContent = `确认${type === 'in' ? '入库' : '出库'}完成`;
            confirmBtn.disabled = false;
            showNotification(`任务确认失败: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error confirming task:', error);
        // 恢复按钮状态
        confirmBtn.textContent = `确认${type === 'in' ? '入库' : '出库'}完成`;
        confirmBtn.disabled = false;
        showNotification('网络错误，任务确认失败。', 'error');
    }
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
    // 修改开始 - 处理空状态显示
    const pendingNotificationsDiv = document.getElementById('pendingNotifications');
    const completedNotificationsDiv = document.getElementById('completedNotifications');

    if (pendingCount === 0 && !pendingNotificationsDiv.querySelector('.empty-state')) {
        pendingNotificationsDiv.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🎉</span>
                <p>暂无待处理任务！</p>
            </div>
        `;
    } else if (pendingCount > 0 && pendingNotificationsDiv.querySelector('.empty-state')) {
        // 如果有任务了，移除空状态提示
        pendingNotificationsDiv.querySelector('.empty-state').remove();
    }

    if (completedCount === 0 && !completedNotificationsDiv.querySelector('.empty-state')) {
        completedNotificationsDiv.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">✨</span>
                <p>暂无已完成任务。</p>
            </div>
        `;
    } else if (completedCount > 0 && completedNotificationsDiv.querySelector('.empty-state')) {
        // 如果有任务了，移除空状态提示
        completedNotificationsDiv.querySelector('.empty-state').remove();
    }
    // 修改结束
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
// function simulateNewNotification() {
//     const notifications = [
//         {
//             type: 'in',
//             title: '入库通知',
//             product: '游戏机 PlayStation 5',
//             code: 'P006-PS5',
//             quantity: '15 台',
//             location: 'D区-3号货架',
//             supplier: '索尼娱乐有限公司'
//         },
//         {
//             type: 'out',
//             title: '出库通知',
//             product: '平板电脑 iPad Air',
//             code: 'P007-iPadAir',
//             quantity: '40 台',
//             location: 'E区-1号货架',
//             customer: '教育设备采购中心'
//         }
//     ];
    
//     const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
//     addNewNotification(randomNotification);
// }
// 修改开始 - 新增函数：通过AJAX获取待处理任务并渲染
async function fetchAndRenderPendingTasks() {
    try {
        const response = await fetch('/get_pending_tasks');
        const tasks = await response.json();
        const pendingArea = document.getElementById('pendingNotifications');
        pendingArea.innerHTML = ''; // 清空现有内容

        if (tasks.length === 0) {
            pendingArea.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🎉</span>
                    <p>暂无待处理任务！</p>
                </div>
            `;
        } else {
            tasks.forEach((task, index) => {
                const notificationHTML = `
                    <div class="notification-item ${index === 0 ? 'urgent' : ''}" data-good-num="${task.Good_Num}">
                        <div class="notification-meta">
                            <span class="notification-type type-${task.Type === 0 ? 'out' : 'in'}">
                                ${task.Type === 0 ? '出库' : '入库'}
                            </span>
                            <span class="notification-time">${task.TIME}</span>
                        </div>
                        <div class="notification-content">
                            <strong>${task.Type === 0 ? '出库通知' : '入库通知'}</strong>
                            <div class="product-info">
                                <div><strong>产品名称：</strong>${task.Good_Name}</div>
                                <div><strong>产品编号：</strong>${task.Good_Num}</div>
                                <div><strong>数量：</strong>${task.Good_Quantity}</div>
                                <div><strong>仓位位置：</strong>${task.Position_Num}</div>
                            </div>
                        </div>
                        <button class="confirm-btn" onclick="confirmTask(${task.Good_Num}, '${task.Type === 0 ? 'out' : 'in'}')">
                            确认${task.Type === 0 ? '出库' : '入库'}完成
                        </button>
                    </div>
                `;
                pendingArea.insertAdjacentHTML('beforeend', notificationHTML);
            });
        }
        updateCounts(); // 更新计数
    } catch (error) {
        console.error('Error fetching pending tasks:', error);
        showNotification('获取待处理任务失败。', 'error');
    }
}
// 新增函数：通过AJAX获取已完成任务并渲染
async function fetchAndRenderCompletedTasks() {
    try {
        const response = await fetch('/get_completed_tasks');
        const tasks = await response.json();
        const completedArea = document.getElementById('completedNotifications');
        completedArea.innerHTML = ''; // 清空现有内容

        if (tasks.length === 0) {
            completedArea.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">✨</span>
                    <p>暂无已完成任务。</p>
                </div>
            `;
        } else {
            tasks.forEach(task => {
                const notificationHTML = `
                    <div class="completed-item">
                        <div class="notification-meta">
                            <span class="notification-type type-${task.Type === 0 ? 'out' : 'in'}">
                                ${task.Type === 0 ? '出库' : '入库'}
                            </span>
                            <span class="notification-time">已完成 - ${task.TIME}</span>
                        </div>
                        <div class="notification-content">
                            <strong>${task.Type === 0 ? '出库任务' : '入库任务'}</strong>
                            <div class="product-info">
                                <div><strong>产品名称：</strong>${task.Good_Name}</div>
                                <div><strong>产品编号：</strong>${task.Good_Num}</div>
                                <div><strong>数量：</strong>${task.Good_Quantity}</div>
                                <div><strong>仓位位置：</strong>${task.Position_Num}</div>
                                <div><strong>状态：</strong><span class="status-completed">✓ 已确认完成</span></div>
                            </div>
                        </div>
                    </div>
                `;
                completedArea.insertAdjacentHTML('beforeend', notificationHTML);
            });
        }
        updateCounts(); // 更新计数
    } catch (error) {
        console.error('Error fetching completed tasks:', error);
        showNotification('获取已完成任务失败。', 'error');
    }
}


// 添加新通知
// function addNewNotification(notificationData) {
//     const pendingArea = document.getElementById('pendingNotifications');
//     const newId = Date.now();
//     const currentTime = new Date().toLocaleString('zh-CN');
    
//     const notificationHTML = `
//         <div class="notification-item" data-id="${newId}">
//             <div class="notification-meta">
//                 <span class="notification-type type-${notificationData.type}">${notificationData.type === 'in' ? '入库' : '出库'}</span>
//                 <span class="notification-time">${currentTime}</span>
//             </div>
//             <div class="notification-content">
//                 <strong>${notificationData.title}</strong>
//                 <div class="product-info">
//                     <div><strong>产品名称：</strong>${notificationData.product}</div>
//                     <div><strong>产品编号：</strong>${notificationData.code}</div>
//                     <div><strong>数量：</strong>${notificationData.quantity}</div>
//                     <div><strong>${notificationData.type === 'in' ? '存放位置' : '目标位置'}：</strong>${notificationData.location}</div>
//                     <div><strong>${notificationData.type === 'in' ? '供应商' : '客户'}：</strong>${notificationData.type === 'in' ? notificationData.supplier : notificationData.customer}</div>
//                 </div>
//             </div>
//             <button class="confirm-btn" onclick="confirmTask(${newId}, '${notificationData.type}')">确认${notificationData.type === 'in' ? '入库' : '出库'}完成</button>
//         </div>
//     `;
    
//     pendingArea.insertAdjacentHTML('afterbegin', notificationHTML);
//     updateCounts();
//     showNotification(`收到新的${notificationData.type === 'in' ? '入库' : '出库'}通知！`, 'info');
// }

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始加载待处理和已完成任务
    fetchAndRenderPendingTasks();
    fetchAndRenderCompletedTasks(); // 新增：加载已完成任务

    // 如果需要定时刷新，可以启用轮询
    // setInterval(fetchAndRenderPendingTasks, 30000); // 每30秒刷新待处理任务

    showNotification('欢迎使用仓库管理系统！', 'success');
});
// 修改结束
