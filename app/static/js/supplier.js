
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
    fetchSupplyRequests();
    displayRequests();
    updateStatistics();
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
    } else if (tabId === 'products') {
        fetchSupplierGoods();
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




// **新增 fetchSupplyRequests 函数**
async function fetchSupplyRequests() {
    console.log('正在获取供应请求...');
    try {
        const response = await fetch('/supplier/requests'); // 调用新的后端接口
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const requests = await response.json();
        // 更新全局的 supplyRequests 变量
        supplyRequests = requests;
        displayRequests(); // 获取数据后渲染
        updateNotificationBadge(); // 更新通知角标
    } catch (error) {
        console.error('获取供应请求失败:', error);
        showNotification('获取供应请求失败，请稍后再试。', 'error');
    }
}


// 修改 displayRequests 函数以渲染从后端获取的数据
function displayRequests() {
    const tableBody = document.getElementById('supplyRequestsTableBody');
    const noRequestsMessage = document.getElementById('noRequestsMessage');
    tableBody.innerHTML = ''; // 清空现有内容

    if (!supplyRequests || supplyRequests.length === 0) {
        if (noRequestsMessage) noRequestsMessage.style.display = 'block';
        return;
    }
    if (noRequestsMessage) noRequestsMessage.style.display = 'none';

    supplyRequests.forEach(request => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = request.Request_ID;
        row.insertCell().textContent = request.Good_Num;
        row.insertCell().textContent = request.Good_Name || '未知商品'; // 显示商品名称
        row.insertCell().textContent = request.Request_Quantity;
        row.insertCell().textContent = request.Matched_Price ? request.Matched_Price : 'N/A';
        row.insertCell().textContent = request.Status;
        row.insertCell().textContent = new Date(request.Request_Time).toLocaleString();

        const actionsCell = row.insertCell();
        // 根据请求状态添加操作按钮
        if (request.Status === 'Matched' || request.Status === 'Pending') {
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = '接受';
            acceptBtn.classList.add('btn', 'btn-primary', 'btn-small');
            // TODO: 为接受按钮添加事件处理器，向后端发送接受请求
            acceptBtn.onclick = () => handleRequestAction(request.Request_ID, 'accept');
            actionsCell.appendChild(acceptBtn);

            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = '拒绝';
            rejectBtn.classList.add('btn', 'btn-secondary', 'btn-small');
            // TODO: 为拒绝按钮添加事件处理器，向后端发送拒绝请求
            rejectBtn.onclick = () => handleRequestAction(request.Request_ID, 'reject');
            actionsCell.appendChild(rejectBtn);
        } else {
            actionsCell.textContent = '已处理';
        }
    });
}

// **处理请求操作的示例函数 (您需要根据实际需求实现后端API)**
async function handleRequestAction(requestId, actionType) {
    // 这是一个占位符，您需要根据业务逻辑和后端API来实现
    console.log(`处理请求 ${requestId} 的操作: ${actionType}`);
    try {
        const response = await fetch(`/supplier/handle_request/${requestId}`, {
            method: 'POST', // 或 PUT
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: actionType })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        showNotification(result.message, 'success');
        fetchSupplyRequests(); // 刷新列表
    } catch (error) {
        console.error(`处理请求失败: ${error}`);
        showNotification('处理请求失败，请检查网络或联系管理员。', 'error');
    }
}


// 修改 updateNotificationBadge 以基于后端数据计算未处理请求
function updateNotificationBadge() {
    const pendingCount = supplyRequests.filter(req => req.Status === 'Pending' || req.Status === 'Matched').length;
    const badgeElement = document.getElementById('pendingCount');
    if (badgeElement) {
        badgeElement.textContent = pendingCount > 0 ? pendingCount : '0';
        badgeElement.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
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

