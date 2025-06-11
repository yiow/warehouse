
// 供应商商品数据
let supplierProducts = [];

// 供应请求数据
let supplyRequests = [];

let currentEditingProduct = null;

// 辅助函数：打开模态框
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // 使用 'flex' 来居中模态框，与 CSS 保持一致
        modal.classList.add('active');
    } else {
        console.error(`Error: Modal with ID '${modalId}' not found.`);
    }
}

// 辅助函数：关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // 移除 active 类来触发淡出效果
        modal.classList.remove('active');
        // 等待过渡完成（0.3秒），然后将 display 设置为 none
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // 这里的 300ms 应该与 CSS 中的 transition 时间一致
    } else {
        console.error(`Error: Modal with ID '${modalId}' not found.`);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    fetchSupplierGoods(); 
    displayRequests();
    updateStatistics();
    updateNotificationBadge();
});

// 切换标签页
function switchTab(tabName) {
    // 移除所有活动状态
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 激活选中的标签页
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // 更新数据显示
    if (tabName === 'products') {
        fetchSupplierGoods(); // 加载供应商商品
    } else if (tabName === 'requests') {
        displayRequests();
    } else if (tabName === 'statistics') {
        updateStatistics();
    }
}

// 获取并显示供应商供货商品
async function fetchSupplierGoods() {
    const tableBody = document.querySelector('#supplier-products-table tbody');
    tableBody.innerHTML = ''; // 清空现有内容
    const noProductsMessage = document.getElementById('no-supplier-products');

    try {
        const response = await fetch('/supplier/my_goods'); // Fetch from backend
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const goods = await response.json();

        if (goods.length === 0) {
            noProductsMessage.style.display = 'block'; // Show empty state
            return;
        } else {
            noProductsMessage.style.display = 'none'; // Hide empty state
        }

        // Populate table with fetched goods
        goods.forEach(good => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = good.Good_Num;
            row.insertCell().textContent = good.Good_Name;
            row.insertCell().textContent = good.Description;

            // 关键修改：在使用前将价格字符串转换为浮点数
            const supplierPrice = parseFloat(good.Supplier_Price);
            const retailPrice = parseFloat(good.Retail_Price);

            // 修正后的代码：检查转换后的价格是否为有效数字
            row.insertCell().textContent = !isNaN(supplierPrice) ? supplierPrice.toFixed(2) : 'N/A'; // 供应商价格
            row.insertCell().textContent = !isNaN(retailPrice) ? retailPrice.toFixed(2) : 'N/A'; // 销售价格

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-edit';
            editButton.textContent = '编辑价格';
            editButton.onclick = () => openEditGoodModal(good); // Call edit modal
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-delete';
            deleteButton.textContent = '删除';
            deleteButton.onclick = () => deleteSupplierGood(good.Good_Num); // Call delete function
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('获取供应商商品失败:', error);
        alert('获取供应商商品失败，请稍后再试。');
    }
}

// 打开添加供货商品模态框
async function openAddGoodModal() {
    document.getElementById('addEditGoodModalTitle').textContent = '添加供货商品';
    document.getElementById('saveGoodButton').textContent = '添加';
    document.getElementById('addEditGoodForm').reset();
    document.getElementById('goodSelect').value = ''; // 清空选择
    document.getElementById('goodSelect').disabled = false; // 添加时可选择

    await populateWarehouseGoodsSelect(); // 填充仓库商品下拉列表
    openModal('addEditGoodModal'); // <--- 这一行调用了 openModal
}


// 打开编辑供货商品模态框
async function openEditGoodModal(good) {
    document.getElementById('addEditGoodModalTitle').textContent = '编辑供货商品';
    document.getElementById('saveGoodButton').textContent = '保存';
    document.getElementById('addEditGoodForm').reset();

    // 填充 Good_Num
    document.getElementById('modalGoodNum').value = good.Good_Num;
    
    // 填充供应商价格
    document.getElementById('supplierGoodPrice').value = good.Supplier_Price;

    // 填充并禁用商品选择，因为是编辑现有商品
    await populateWarehouseGoodsSelect(good.Good_Num);
    document.getElementById('goodSelect').value = good.Good_Num;
    document.getElementById('goodSelect').disabled = true; // 编辑时不可修改商品

    openModal('addEditGoodModal');
}

// 填充仓库商品下拉列表
async function populateWarehouseGoodsSelect(selectedGoodNum = null) {
    const goodSelect = document.getElementById('goodSelect');
    goodSelect.innerHTML = '<option value="">请选择商品</option>'; // 初始选项

    try {
        const response = await fetch('/supplier/warehouse_goods');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const warehouseGoods = await response.json();

        warehouseGoods.forEach(good => {
            const option = document.createElement('option');
            option.value = good.Good_Num;
            option.textContent = `${good.Good_Name} (${good.Good_Num})`;
            if (selectedGoodNum && good.Good_Num === selectedGoodNum) {
                option.selected = true;
            }
            goodSelect.appendChild(option);
        });
    } catch (error) {
        console.error('获取仓库商品失败:', error);
        alert('获取仓库商品列表失败，请稍后再试。');
    }
}

// 处理添加/编辑供货商品表单提交
document.getElementById('addEditGoodForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const goodNum = document.getElementById('goodSelect').value;
    const supplierGoodPrice = document.getElementById('supplierGoodPrice').value;
    const isEditing = document.getElementById('addEditGoodModalTitle').textContent.includes('编辑');

    const data = {
        Good_Num: parseInt(goodNum),
        Good_Price: parseFloat(supplierGoodPrice)
    };

    let url = '';
    let method = '';

    if (isEditing) {
        url = `/supplier/edit_my_good/${goodNum}`;
        method = 'PUT';
    } else {
        url = '/supplier/add_my_good';
        method = 'POST';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            closeModal('addEditGoodModal');
            fetchSupplierGoods(); // 刷新列表
        } else {
            alert('操作失败: ' + (result.error || '未知错误'));
        }
    } catch (error) {
        console.error('保存供货商品失败:', error);
        alert('保存供货商品失败，请稍后再试。');
    }
});

// 删除供货商品
async function deleteSupplierGood(goodNum) {
    if (!confirm('确定要删除此供货商品吗？')) {
        return;
    }

    try {
        const response = await fetch(`/supplier/delete_my_good/${goodNum}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            fetchSupplierGoods(); // 刷新列表
        } else {
            alert('删除失败: ' + (result.error || '未知错误'));
        }
    } catch (error) {
        console.error('删除供货商品失败:', error);
        alert('删除供货商品失败，请稍后再试。');
    }
}


// 搜索商品
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filteredProducts = supplierProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}




// 显示供应请求
function displayRequests() {
    const container = document.getElementById('requestsContainer');
    
    if (supplyRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 4em; margin-bottom: 1rem;">📋</div>
                <p>暂无供应请求</p>
                <p>仓库管理员会在需要商品时向您发送供应请求</p>
            </div>
        `;
        return;
    }

    container.innerHTML = supplyRequests.map(request => {
        const totalAmount = request.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        
        let statusClass = '';
        let statusText = '';
        
        switch (request.status) {
            case 'pending':
                statusClass = 'status-pending';
                statusText = '待处理';
                break;
            case 'accepted':
                statusClass = 'status-accepted';
                statusText = '已接受';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusText = '已拒绝';
                break;
        }

        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-info">
                        <div>
                            <div class="request-id">请求编号: ${request.id}</div>
                            <div class="request-date">请求时间: ${request.date}</div>
                            <div style="margin-top: 0.5rem;">仓库编号: ${request.warehouseId}</div>
                        </div>
                        <div class="request-status ${statusClass}">${statusText}</div>
                    </div>
                </div>
                
                <div class="request-content">
                    <div class="request-items">
                        <h4 style="margin-bottom: 1rem; color: #2d3748;">需求商品清单</h4>
                        ${request.items.map(item => `
                            <div class="request-item">
                                <div class="item-info">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-details">单价: ¥${item.unitPrice.toFixed(2)} | 小计: ¥${(item.quantity * item.unitPrice).toFixed(2)}</div>
                                </div>
                                <div class="item-quantity">需求: ${item.quantity} 件</div>
                            </div>
                        `).join('')}
                        
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 600; color: #2d3748;">总金额</span>
                                <span style="font-size: 1.2em; font-weight: bold; color: #e53e3e;">¥${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${request.status === 'pending' ? `
                        <div class="request-actions">
                            <button class="btn btn-reject" onclick="handleRequest('${request.id}', 'rejected')">拒绝</button>
                            <button class="btn btn-accept" onclick="handleRequest('${request.id}', 'accepted')">接受</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 处理供应请求
function handleRequest(requestId, action) {
    const request = supplyRequests.find(r => r.id === requestId);
    if (!request) return;

    const actionText = action === 'accepted' ? '接受' : '拒绝';
    
    if (confirm(`确定要${actionText}这个供应请求吗？`)) {
        request.status = action;
        
        if (action === 'accepted') {
            // 如果接受请求，可以更新库存或生成供应单
            generateSupplyOrder(request);
            showNotification(`供应请求已接受，供应单已生成`, 'success');
        } else {
            showNotification(`供应请求已拒绝`, 'info');
        }
        
        displayRequests();
        updateStatistics();
        updateNotificationBadge();
    }
}

// 生成供应单
function generateSupplyOrder(request) {
    const supplyOrder = {
        orderId: 'SO' + Date.now(),
        requestId: request.id,
        date: new Date().toLocaleString('zh-CN'),
        warehouseId: request.warehouseId,
        items: request.items,
        totalAmount: request.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        status: '待发货'
    };

    // 保存供应单到本地存储
    let supplyOrders = JSON.parse(localStorage.getItem('supplyOrders') || '[]');
    supplyOrders.push(supplyOrder);
    localStorage.setItem('supplyOrders', JSON.stringify(supplyOrders));

    console.log('供应单已生成:', supplyOrder);
}

// 更新统计数据
function updateStatistics() {
    const totalProducts = supplierProducts.length;
    const totalRequests = supplyRequests.length;
    const acceptedRequests = supplyRequests.filter(r => r.status === 'accepted').length;
    const totalValue = supplierProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalRequests').textContent = totalRequests;
    document.getElementById('acceptedRequests').textContent = acceptedRequests;
    document.getElementById('totalValue').textContent = `¥${totalValue.toFixed(2)}`;
}

// 更新通知徽章
function updateNotificationBadge() {
    const pendingRequests = supplyRequests.filter(r => r.status === 'pending').length;
    const badge = document.getElementById('pendingCount');
    badge.textContent = pendingRequests;
    badge.style.display = pendingRequests > 0 ? 'flex' : 'none';
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // 根据类型设置颜色
    switch (type) {
        case 'success':
            notification.style.background = '#38a169';
            break;
        case 'error':
            notification.style.background = '#e53e3e';
            break;
        case 'info':
            notification.style.background = '#3182ce';
            break;
        default:
            notification.style.background = '#718096';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 退出登录
function logout() {
    alert('即将返回登陆界面');
    window.location.href='/logout'
}

// 页面关闭前保存数据
window.addEventListener('beforeunload', function() {
    const supplierData = {
        products: supplierProducts,
        requests: supplyRequests
    };
    localStorage.setItem('supplierData', JSON.stringify(supplierData));
});

// 页面加载时恢复数据
window.addEventListener('load', function() {
    const savedData = localStorage.getItem('supplierData');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.products) supplierProducts = data.products;
        if (data.requests) supplyRequests = data.requests;
        
        displayRequests();
        updateStatistics();
        updateNotificationBadge();
    }
});

// 模拟接收新的供应请求（用于演示）
function simulateNewRequest() {
    const newRequest = {
        id: "REQ" + Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        status: "pending",
        warehouseId: "WH003",
        items: [
            { name: "高端商务笔记本", quantity: 5, unitPrice: 6999.00 },
            { name: "全自动咖啡机", quantity: 2, unitPrice: 2599.00 }
        ]
    };
    
    supplyRequests.unshift(newRequest);
    displayRequests();
    updateStatistics();
    updateNotificationBadge();
    showNotification('收到新的供应请求！', 'info');
}

// 5秒后模拟一个新请求（仅用于演示）
setTimeout(() => {
    simulateNewRequest();
}, 5000);
