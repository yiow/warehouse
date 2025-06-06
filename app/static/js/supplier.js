
// 供应商商品数据
let supplierProducts = [
    {
        id: 1,
        name: "高端商务笔记本",
        category: "电子产品",
        description: "Intel i7处理器，16GB内存，512GB SSD",
        price: 6999.00,
        stock: 25,
        image: "💻"
    },
    {
        id: 2,
        name: "人体工学无线鼠标",
        category: "电子产品",
        description: "2.4GHz无线连接，DPI可调，人体工学设计",
        price: 129.90,
        stock: 80,
        image: "🖱️"
    },
    {
        id: 3,
        name: "多功能激光打印机",
        category: "办公用品",
        description: "打印、复印、扫描三合一，支持双面打印",
        price: 1899.00,
        stock: 15,
        image: "🖨️"
    },
    {
        id: 4,
        name: "A4文件夹套装",
        category: "办公用品",
        description: "PP材质，多种颜色，办公整理必备",
        price: 15.50,
        stock: 200,
        image: "📁"
    },
    {
        id: 5,
        name: "全自动咖啡机",
        category: "家居用品",
        description: "意式浓缩，多种口味选择，一键操作",
        price: 2599.00,
        stock: 8,
        image: "☕"
    }
];

// 供应请求数据
let supplyRequests = [
    {
        id: "REQ20241122001",
        date: "2024-11-22 10:30",
        status: "pending",
        warehouseId: "WH001",
        items: [
            { name: "高端商务笔记本", quantity: 10, unitPrice: 6999.00 },
            { name: "人体工学无线鼠标", quantity: 20, unitPrice: 129.90 }
        ]
    },
    {
        id: "REQ20241122002",
        date: "2024-11-22 14:15",
        status: "pending",
        warehouseId: "WH002",
        items: [
            { name: "多功能激光打印机", quantity: 5, unitPrice: 1899.00 },
            { name: "A4文件夹套装", quantity: 50, unitPrice: 15.50 }
        ]
    },
    {
        id: "REQ20241121001",
        date: "2024-11-21 16:45",
        status: "accepted",
        warehouseId: "WH001",
        items: [
            { name: "全自动咖啡机", quantity: 3, unitPrice: 2599.00 }
        ]
    }
];

let currentEditingProduct = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
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
        displayProducts();
    } else if (tabName === 'requests') {
        displayRequests();
    } else if (tabName === 'statistics') {
        updateStatistics();
    }
}

// 显示商品列表
function displayProducts(productList = supplierProducts) {
    const tbody = document.getElementById('productsTableBody');
    
    if (productList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div style="font-size: 4em; margin-bottom: 1rem;">📦</div>
                        <p>暂无商品数据</p>
                        <p>点击"添加商品"开始添加您的商品</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = productList.map(product => {
        let stockStatus = '';
        let stockClass = '';
        
        if (product.stock === 0) {
            stockStatus = '缺货';
            stockClass = 'stock-out';
        } else if (product.stock < 20) {
            stockStatus = '库存偏低';
            stockClass = 'stock-low';
        } else {
            stockStatus = '库存充足';
            stockClass = 'stock-sufficient';
        }
        
        return `
            <tr>
                <td>
                    <div class="product-image">${product.image}</div>
                </td>
                <td>
                    <div class="product-name">${product.name}</div>
                    <div style="color: #718096; font-size: 0.875rem;">${product.description}</div>
                </td>
                <td>${product.category}</td>
                <td class="product-price">¥${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="stock-status ${stockClass}">${stockStatus}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editProduct(${product.id})">编辑</button>
                        <button class="btn btn-delete" onclick="deleteProduct(${product.id})">删除</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
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

// 显示添加商品模态框
function showAddProductModal() {
    currentEditingProduct = null;
    document.getElementById('productModalTitle').textContent = '添加商品';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.add('active');
}

// 编辑商品
function editProduct(productId) {
    const product = supplierProducts.find(p => p.id === productId);
    if (!product) return;

    currentEditingProduct = product;
    document.getElementById('productModalTitle').textContent = '编辑商品';
    
    // 填充表单数据
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image;
    
    document.getElementById('productModal').classList.add('active');
}

// 删除商品
function deleteProduct(productId) {
    const product = supplierProducts.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`确定要删除商品"${product.name}"吗？此操作不可撤销。`)) {
        supplierProducts = supplierProducts.filter(p => p.id !== productId);
        displayProducts();
        updateStatistics();
        
        // 显示删除成功提示
        showNotification('商品删除成功', 'success');
    }
}

// 关闭商品模态框
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    currentEditingProduct = null;
}

// 处理商品表单提交
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        image: formData.get('image')
    };

    if (currentEditingProduct) {
        // 编辑现有商品
        Object.assign(currentEditingProduct, productData);
        showNotification('商品更新成功', 'success');
    } else {
        // 添加新商品
        productData.id = Date.now(); // 简单的ID生成
        supplierProducts.push(productData);
        showNotification('商品添加成功', 'success');
    }

    displayProducts();
    updateStatistics();
    closeProductModal();
});

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
        
        displayProducts();
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

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Esc键关闭模态框
    if (e.key === 'Escape') {
        closeProductModal();
    }
    
    // Ctrl+N 添加新商品
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        showAddProductModal();
    }
});

// 5秒后模拟一个新请求（仅用于演示）
setTimeout(() => {
    simulateNewRequest();
}, 5000);