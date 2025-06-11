//商品数据
let products = [];
// 购物车数据
let cart = [];

// 辅助函数：打开模态框 (确保这段代码在文件顶部)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    } else {
        console.error(`Error: Modal with ID '${modalId}' not found.`);
    }
}

// 辅助函数：关闭模态框 (确保这段代码在文件顶部)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    } else {
        console.error(`Error: Modal with ID '${modalId}' not found.`);
    }
}
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // 1. 加载商品
        const productsResponse = await fetch('/products');
        products = await productsResponse.json();
        displayProducts(products);
        
        // 2. 等待购物车加载
        await loadCart();
    } catch (error) {
        console.error('初始化失败:', error);
    }
});


//加载购物车数据
function loadCart(){
    fetch('/load_cart',{
        method:'GET',
        headers:{
          'Content-Type':'application/json',
        }
    })
    .then(response=>response.json())
    .then(data=>{
        cart=data;
        updateCartDisplay();
    })
}
// 显示商品
function displayProducts(productList) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    productList.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        let stockClass = '';
        let stockText = `库存: ${product.stock} 件`;
        let buttonDisabled = '';
        let buttonText = '加入购物车';
        
        if (product.stock === 0) {
            stockClass = 'stock-out';
            stockText = '暂时缺货';
            buttonText = '暂时缺货';
        } else if (product.stock < 10) {
            stockClass = 'stock-low';
            stockText = `仅剩 ${product.stock} 件`;
        }
        
        productCard.innerHTML = `
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-price">¥${Number(product.price).toFixed(2)}</div>
                <div class="product-stock ${stockClass}">${stockText}</div>
                <button class="add-to-cart-btn" onclick="addToCart(event,${product.id})" ${buttonDisabled}>
                    ${buttonText}
                </button>
            </div>
        `;
        
        grid.appendChild(productCard);
    });
}

// 搜索商品
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filteredProducts);
}

// 按分类筛选
function filterByCategory() {
    searchProducts();
}

// 添加到购物车
function addToCart(event,productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } 
        else {
            existingItem.quantity++;
            alert('库存不足！若持续购买需等待较长时间交货');
        }
    }  
    else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    
    // 显示添加成功提示
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '已添加！';
    button.style.background = '#27ae60';
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 1000);
}

// 更新购物车显示
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const totalPrice = document.getElementById('totalPrice');
    
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalQuantity;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div style="font-size: 4em; margin-bottom: 1rem;">🛒</div>
                <p>购物车是空的</p>
                <p>快去选购商品吧！</p>
            </div>
        `;
        cartSummary.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">¥${item.price}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                                onchange="setQuantity(${item.id}, this.value)" min="1" max="${item.stock}">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="remove-item" onclick="removeFromCart(${item.id})">🗑️</div>
            </div>
        `).join('');
        
        totalPrice.textContent = `总计: ¥${totalAmount.toFixed(2)}`;
        cartSummary.style.display = 'block';
    }
}

// 更新商品数量
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity>product.stock){
            alert('库存不足，仍购买需待较长时间交货！');
        }
        if (newQuantity<=0){
            removeFromCart(productId);
        }
        item.quantity=newQuantity;
        updateCartDisplay();
    }
}

// 设置商品数量
function setQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    const qty = parseInt(quantity);
    if (qty>product.stock){
        alert('库存不足，仍购买需待较长时间交货！');
    }
    if (qty<=0){
        removeFromCart(productId);
    }
    item.quantity=qty;
    updateCartDisplay();
}

// 从购物车移除商品
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

// 切换购物车显示
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// 关闭购物车
function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

// 保存购物车到数据库
function saveCartToDB() {
    fetch('/save_cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart })
    })
    .then(response=>response.json())
    .then(data=>{
        if (!data.success){
            throw new Error(data.message);
        }
    })
    .catch(error=>{
        console.error('保存购物车出错',error);
    });
}

// 显示结算模态框
function showCheckoutModal() {
    if (cart.length === 0) {
        alert('购物车是空的！');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    const orderSummary = document.getElementById('orderSummary');
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orderSummary.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #2c3e50;">订单详情</h3>
        ${cart.map(item => `
            <div class="order-item">
                <div>
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="color: #666; font-size: 0.9em;">数量: ${item.quantity}</div>
                </div>
                <div style="font-weight: bold; color: #e74c3c;">
                    ¥${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('')}
        <div class="order-item" style="border-top: 2px solid #eee; margin-top: 1rem; padding-top: 1rem;">
            <div style="font-size: 1.2em; font-weight: bold;">总计</div>
            <div style="font-size: 1.5em; font-weight: bold; color: #e74c3c;">
                ¥${totalAmount.toFixed(2)}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// 关闭结算模态框
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
}

// 确认订单
function confirmOrder() {
    if (cart.length === 0) {
        alert('购物车是空的！');
        return;
    }

    // Start: 改进点 10 - 不再在客户端生成订单号
    // const orderNumber = 'WMS' + Date.now();
    // End: 改进点 10

    const orderDate = new Date().toLocaleString('zh-CN');
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 发送订单数据到后端保存
    fetch('/save_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: cart })
    })
   .then(response => response.json())
   .then(data => {
        if (data.success) {
            // Start: 改进点 11 - 从后端获取订单号
            const orderNumber = data.order_number; // 后端返回的订单号
            // End: 改进点 11

            // 生成购买清单 (现在订单号来自后端)
            const orderDetails = {
                orderNumber: orderNumber,
                orderDate: orderDate, // 日期仍可在前端生成，或从后端获取
                items: [...cart],
                totalAmount: totalAmount,
                status: '待处理'
            };
            // 显示订单成功页面
            showOrderSuccess(orderDetails);

            // 清空购物车
            cart = [];
            updateCartDisplay();
            closeCart();
        } else {
            alert('订单保存失败: ' + data.error);
        }
    })
   .catch(error => {
        console.error('保存订单出错', error);
        alert('保存订单出错，请稍后重试');
    });
}

// 显示订单成功页面
function showOrderSuccess(orderDetails) {
    const modal = document.getElementById('checkoutModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4em; color: #27ae60; margin-bottom: 1rem;">✅</div>
            <h2 style="color: #27ae60; margin-bottom: 1rem;">订单提交成功！</h2>
            <p style="color: #666; margin-bottom: 2rem;">感谢您的购买，我们将尽快为您处理订单</p>
            
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; text-align: left;">
                <h3 style="color: #2c3e50; margin-bottom: 1rem;">订单信息</h3>
                <div style="margin-bottom: 0.5rem;"><strong>订单号:</strong> ${orderDetails.orderNumber}</div>
                <div style="margin-bottom: 0.5rem;"><strong>下单时间:</strong> ${orderDetails.orderDate}</div>
                <div style="margin-bottom: 1rem;"><strong>订单状态:</strong> <span style="color: #27ae60;">${orderDetails.status}</span></div>
                
                <h4 style="color: #2c3e50; margin-bottom: 1rem;">商品清单</h4>
                ${orderDetails.items.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                        <div>
                            <div style="font-weight: 600;">${item.name}</div>
                            <div style="color: #666; font-size: 0.9em;">单价: ¥${item.price} × ${item.quantity}</div>
                        </div>
                        <div style="font-weight: bold; color: #e74c3c;">
                            ¥${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-top: 2px solid #eee; margin-top: 1rem;">
                    <div style="font-size: 1.2em; font-weight: bold;">订单总额</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #e74c3c;">
                        ¥${orderDetails.totalAmount.toFixed(2)}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                </button>
                <button onclick="closeOrderSuccess()" 
                        style="padding: 0.75rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    继续购物
                </button>
            </div>
        </div>
    `;
    
}


// 关闭订单成功页面
function closeOrderSuccess() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
    
    // 恢复模态框原始内容
    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">确认订单</h2>
            <button class="modal-close" onclick="closeCheckoutModal()">×</button>
        </div>
        <div class="order-summary" id="orderSummary">
            <!-- 订单详情将通过JavaScript动态生成 -->
        </div>
        <button class="confirm-btn" onclick="confirmOrder()">确认下单</button>
    `;
}


// 全局变量：模态框元素（避免重复创建）
let ordersModal = null;

// 打开订单模态框
async function openOrdersModal() {
    // 首次创建模态框
    if (!ordersModal) {
        ordersModal = document.createElement('div');
        ordersModal.className = 'orders-modal';
        ordersModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>我的订单</h2>
                    <button class="modal-close" onclick="closeOrdersModal()">&times;</button>
                </div>
                <div class="modal-body" id="ordersBody"></div>
            </div>
        `;
        document.body.appendChild(ordersModal);
    }

    // 显示加载状态
    document.getElementById('ordersBody').innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        // 获取订单数据
        const response = await fetch('/orders');
        const orders = await response.json();
        // 渲染订单列表
        renderOrders(orders);
        // 显示模态框
        ordersModal.style.display = 'flex';
    } catch (error) {
        console.error('加载订单失败:', error);
        document.getElementById('ordersBody').innerHTML = '<div class="error">加载失败，请重试</div>';
    }
}

// 关闭订单模态框
function closeOrdersModal() {
    if (ordersModal) {
        ordersModal.style.display = 'none';
        // 清空内容以便下次加载
        document.getElementById('ordersBody').innerHTML = '';
    }
}

// 渲染订单数据
function renderOrders(orders) {
    const ordersBody = document.getElementById('ordersBody');
    ordersBody.innerHTML = '';

    if (orders.length === 0) {
        ordersBody.innerHTML = '<div class="empty-orders">暂无订单记录</div>';
        return;
    }

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        // Start: 改进点 12 - 退单按钮显示条件
        // 允许“待处理”和“已完成”状态的订单退货，需要与后端逻辑保持一致
        const canReturn = order.status === '待处理' || order.status === '已完成';
        // End: 改进点 12

        orderCard.innerHTML = `
            <div class="order-info">
                <div><strong>订单号:</strong> ${order.order_number}</div>
                <div><strong>下单时间:</strong> ${new Date(order.order_date).toLocaleString()}</div>
                <div><strong>订单总额:</strong> ¥${parseFloat(order.total_amount).toFixed(2)}</div>
                <div><strong>订单状态:</strong> ${getStatusText(order.status)}</div>
            </div>
            <div class="order-items">
                <h3>商品清单</h3>
                <ul>
                    ${order.items.map(item => `
                        <li>${item.product_name} × ${item.quantity} = ¥${(parseFloat(item.price) * item.quantity).toFixed(2)}</li>
                    `).join('')}
                </ul>
            </div>
            ${canReturn ? `<button class="return-btn" onclick="returnOrder('${order.order_number}')">退订单</button>` : ''} `;
        ordersBody.appendChild(orderCard);
    });
}


// 状态转换函数（保持不变）
function getStatusText(status) {
    const statusMap = {
        '待处理': '待处理',
        '处理中': '处理中',
        '已完成': '已完成',
        '已取消': '已取消'
    };
    return statusMap[status] || status;
}
// 新增：退订单函数  <-- 从这里开始新增
async function returnOrder(orderNumber) {
    if (confirm(`确定要退回订单 ${orderNumber} 吗？`)) {
        try {
            const response = await fetch('/return_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ order_number: orderNumber })
            });
            const data = await response.json();
            if (data.success) {
                alert('退单申请成功！等待处理。');
                openOrdersModal(); // 刷新订单列表
            } else {
                alert('退单失败: ' + data.error);
            }
        } catch (error) {
            console.error('退单出错:', error);
            alert('退单出错，请稍后重试');
        }
    }
}

// 全局变量：模态框元素（避免重复创建）
let profileModal = null;

// 打开个人信息模态框
async function openProfileModal() {
    const profileModal = document.getElementById('profileModal');
    const profileInfoBody = document.getElementById('profileInfo');
    profileInfoBody.innerHTML = '<div class="loading">加载中...</div>'; // 显示加载状态
    openModal('profileModal'); // 确保模态框显示

    try {
        const response = await fetch('/profile');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '获取个人信息失败');
        }

        // 保存当前个人信息，以便在编辑模式下恢复或取消时使用
        profileInfoBody.dataset.currentProfile = JSON.stringify(data);

        // 渲染显示模式
        profileInfoBody.innerHTML = `
            <div class="profile-display-mode">
                <p><strong>用户名:</strong> <span id="displayUsername">${data.username}</span></p>
                <p><strong>会员状态:</strong> <span id="displayVip">${data.vip ? '是' : '否'}</span></p>
                <p><strong>地址:</strong> <span id="displayAddress">${data.address || '未设置'}</span></p>
                <p><strong>电话:</strong> <span id="displayPhone">${data.phone || '未设置'}</span></p>
                <hr style="margin: 15px 0;">
                <h4>🛒 订单统计:</h4>
                <p><strong>总订单数:</strong> <span id="displayTotalOrders">${data.Total_Orders !== undefined ? data.Total_Orders : 'N/A'}</span></p>
                <p><strong>累计消费金额:</strong> ¥<span id="displayTotalDiscountedAmount">${data.Total_Discounted_Amount !== undefined ? parseFloat(data.Total_Discounted_Amount).toFixed(2) : '0.00'}</span></p>
                <p><strong>总退货次数:</strong> <span id="displayTotalReturns">${data.Total_Returns !== undefined ? data.Total_Returns : 'N/A'}</span></p>
                <p><strong>最常购买商品:</strong> <span id="displayTopGoods">${data.Top_Goods || '暂无'}</span></p>
                <div class="btn-group" style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="enableEditProfile()">编辑</button>
                </div>
            </div>
            <div class="profile-edit-mode" style="display:none;">
                <div class="form-group">
                    <label for="editAddress">地址:</label>
                    <input type="text" id="editAddress" value="${data.address || ''}" class="form-input">
                </div>
                <div class="form-group">
                    <label for="editPhone">电话:</label>
                    <input type="text" id="editPhone" value="${data.phone || ''}" class="form-input">
                </div>
                <div class="btn-group" style="margin-top: 20px;">
                    <button class="btn btn-success" onclick="saveProfile()">保存</button>
                    <button class="btn btn-secondary" onclick="cancelEditProfile()">取消</button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('加载个人信息失败:', error);
        profileInfoBody.innerHTML = `<div class="error-message" style="color: red;">加载个人信息失败: ${error.message}</div>`;
        // 可以选择在这里关闭模态框或者显示一个重试按钮
    }
}

// 辅助函数：关闭个人信息模态框
function closeProfileModal() {
    closeModal('profileModal');
}

// 渲染个人信息数据 (VIP 不可编辑)
function renderProfile(profile) {
    const profileInfoBody = document.getElementById('profileInfo');
    if (!profile) {
        profileInfoBody.innerHTML = '<div class="empty-profile">未找到个人信息</div>';
        return;
    }

    // 显示模式
    profileInfoBody.innerHTML = `
        <div class="profile-display-mode">
            <div class="profile-detail">
                <strong>地址:</strong> <span id="displayAddress">${profile.address || '未设置'}</span>
            </div>
            <div class="profile-detail">
                <strong>电话:</strong> <span id="displayPhone">${profile.phone || '未设置'}</span>
            </div>
            <div class="profile-detail">
                <strong>VIP用户:</strong> <span id="displayVip">${profile.vip}</span>
            </div>
            <button class="edit-profile-btn" onclick="editProfile()">修改</button>
        </div>

        <div class="profile-edit-mode" style="display: none;">
            <div class="profile-field">
                <label for="editAddress">地址:</label>
                <input type="text" id="editAddress" value="${profile.address || ''}">
            </div>
            <div class="profile-field">
                <label for="editPhone">电话:</label>
                <input type="text" id="editPhone" value="${profile.phone || ''}">
            </div>
            <div class="profile-field">
                <strong>VIP用户:</strong> <span id="uneditableVip">${profile.vip} (不可修改)</span>
            </div>
            <div class="profile-actions">
                <button class="save-profile-btn" onclick="saveProfile()">保存</button>
                <button class="cancel-profile-btn" onclick="cancelEditProfile()">取消</button>
            </div>
        </div>
    `;
    // 将当前 profile 数据存储在 DOM 元素上，方便取消时恢复
    profileInfoBody.dataset.currentProfile = JSON.stringify(profile);
}

// 启用编辑模式
function enableEditProfile() {
    const profileInfoBody = document.getElementById('profileInfo');
    profileInfoBody.querySelector('.profile-display-mode').style.display = 'none';
    profileInfoBody.querySelector('.profile-edit-mode').style.display = 'block';

    // 从 dataset 中获取当前数据并填充到编辑字段
    const currentProfile = JSON.parse(profileInfoBody.dataset.currentProfile);
    document.getElementById('editAddress').value = currentProfile.address || '';
    document.getElementById('editPhone').value = currentProfile.phone || '';
}

// 保存个人信息
async function saveProfile() {
    const profileInfoBody = document.getElementById('profileInfo');
    const address = document.getElementById('editAddress').value;
    const phone = document.getElementById('editPhone').value;

    try {
        const response = await fetch('/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address, phone })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '更新个人信息失败');
        }

        const data = await response.json();
        alert(data.message); // 显示成功消息

        // 重新加载个人信息以显示最新数据并回到显示模式
        openProfileModal();

    } catch (error) {
        console.error('保存个人信息出错:', error);
        alert('保存失败: ' + error.message);
    }
}

// 取消编辑
function cancelEditProfile() {
    const profileInfoBody = document.getElementById('profileInfo');
    profileInfoBody.querySelector('.profile-display-mode').style.display = 'block';
    profileInfoBody.querySelector('.profile-edit-mode').style.display = 'none';
}
// 退出登录
function logout() {
    alert('即将返回登陆界面');
    saveCartToDB();
    window.location.href='/logout';
}