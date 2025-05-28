let products = [];

document.addEventListener('DOMContentLoaded', function () {
    fetch('/products')
    .then(response => response.json())
    .then(data => {
        products = data;
        displayProducts(products);
        updateCartDisplay();
    })
    .catch(error => {
        console.error('获取商品数据失败:', error);
    });
});

// 购物车数据
let cart = [];


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
        if (newQuantity > 0 && newQuantity <= product.stock) {
            item.quantity = newQuantity;
            updateCartDisplay();
        } else if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            alert('库存不足！');
        }
    }
}

// 设置商品数量
function setQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    const qty = parseInt(quantity);
    
    if (item && qty > 0 && qty <= product.stock) {
        item.quantity = qty;
        updateCartDisplay();
    } else if (qty <= 0) {
        removeFromCart(productId);
    } else {
        alert('库存不足！');
        updateCartDisplay();
    }
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
    
    // 生成订单号
    const orderNumber = 'WMS' + Date.now();
    const orderDate = new Date().toLocaleString('zh-CN');
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 生成购买清单
    const orderDetails = {
        orderNumber: orderNumber,
        orderDate: orderDate,
        customerName: '客户用户',
        items: [...cart],
        totalAmount: totalAmount,
        status: '已确认'
    };
    
    // 模拟提交订单到后端
    console.log('订单详情:', orderDetails);
    
    // 显示订单成功页面
    showOrderSuccess(orderDetails);
    
    // 清空购物车
    cart = [];
    updateCartDisplay();
    closeCheckoutModal();
    closeCart();
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
                <div style="margin-bottom: 0.5rem;"><strong>客户:</strong> ${orderDetails.customerName}</div>
                <div style="margin-bottom: 1rem;"><strong>订单状态:</strong> <span style="color: #27ae60;">${orderDetails.status}</span></div>
                
                <h4 style="color: #2c3e50; margin-bottom: 1rem;">商品清单</h4>
                ${orderDetails.items.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                        <div>
                            <div style="font-weight: 600;">${item.name}</div>
                            <div style="color: #666; font-size: 0.9em;">单价: ¥${item.price.toFixed(2)} × ${item.quantity}</div>
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
                <button onclick="printOrder('${orderDetails.orderNumber}')" 
                        style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    打印订单
                </button>
                <button onclick="downloadOrder('${orderDetails.orderNumber}')" 
                        style="padding: 0.75rem 1.5rem; background: #f39c12; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    下载订单
                </button>
                <button onclick="closeOrderSuccess()" 
                        style="padding: 0.75rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    继续购物
                </button>
            </div>
        </div>
    `;
    
    // 保存订单到本地存储（模拟数据库）
    saveOrderToStorage(orderDetails);
}

// 保存订单到本地存储
function saveOrderToStorage(orderDetails) {
    let orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    orders.push(orderDetails);
    localStorage.setItem('customerOrders', JSON.stringify(orders));
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

// 打印订单
function printOrder(orderNumber) {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
        alert('订单未找到！');
        return;
    }
    
    // 创建打印内容
    const printContent = `
        <html>
        <head>
            <title>订单打印 - ${order.orderNumber}</title>
            <style>
                body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .order-info { margin-bottom: 30px; }
                .order-info div { margin-bottom: 8px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .total { font-size: 1.2em; font-weight: bold; text-align: right; }
                .footer { margin-top: 30px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>仓库管理系统</h1>
                <h2>购买订单</h2>
            </div>
            
            <div class="order-info">
                <div><strong>订单号:</strong> ${order.orderNumber}</div>
                <div><strong>下单时间:</strong> ${order.orderDate}</div>
                <div><strong>客户:</strong> ${order.customerName}</div>
                <div><strong>订单状态:</strong> ${order.status}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>商品名称</th>
                        <th>单价</th>
                        <th>数量</th>
                        <th>小计</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>¥${item.price.toFixed(2)}</td>
                            <td>${item.quantity}</td>
                            <td>¥${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total">
                订单总额: ¥${order.totalAmount.toFixed(2)}
            </div>
            
            <div class="footer">
                <p>感谢您的购买！</p>
                <p>如有问题请联系客服</p>
            </div>
        </body>
        </html>
    `;
    
    // 打开打印窗口
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// 下载订单
function downloadOrder(orderNumber) {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
        alert('订单未找到！');
        return;
    }
    
    // 创建订单文本内容
    const orderText = `
仓库管理系统 - 购买订单

订单信息:
订单号: ${order.orderNumber}
下单时间: ${order.orderDate}
客户: ${order.customerName}
订单状态: ${order.status}

商品清单:
${order.items.map(item => 
`${item.name} - 单价: ¥${item.price.toFixed(2)} × ${item.quantity} = ¥${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

订单总额: ¥${order.totalAmount.toFixed(2)}

感谢您的购买！
如有问题请联系客服
    `.trim();
    
    // 创建并下载文件
    const blob = new Blob([orderText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `订单_${order.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 退出登录
function logout() {
    alert('即将返回登陆界面')
    window.location.href='/logout'
}

// 页面关闭前保存购物车
window.addEventListener('beforeunload', function() {
    localStorage.setItem('customerCart', JSON.stringify(cart));
});

// 页面加载时恢复购物车
window.addEventListener('load', function() {
    const savedCart = localStorage.getItem('customerCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
});
