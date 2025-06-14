
// 全局变量
let currentSection = 'dashboard';

// 显示指定模块
function showSection(sectionId) {
    // 隐藏所有section
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // 显示指定section
    document.getElementById(sectionId).classList.add('active');

    // 更新导航状态
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    currentSection = sectionId;

    // 更新标题
    const titles = {
        'dashboard': '仪表盘',
        'employees': '员工管理',
        'suppliers': '供应商管理', 
        'inventory': '库存流水',
        'alerts': '库存预警',
        'supply-list': '供货清单',
        'supplier-price-list': '供应商价格表'
    };
    document.querySelector('.header-title').textContent = titles[sectionId] || '管理员控制台';
    // 修改开始：当切换到员工管理页面时，加载员工数据
    if (sectionId === 'employees') {
        fetchEmployees();
    }else if (sectionId === 'suppliers') { 
        fetchSuppliers(); // 调用加载供应商数据的函数
    }else if (sectionId === 'inventory') {
        fetchInventorySummary(); // Load inventory data
    }else if (sectionId === 'alerts') { 
        fetchAlerts(); // 调用加载库存预警数据的函数
    } else if (sectionId === 'dashboard') { 
        fetchDashboardStats(); // 调用加载仪表盘统计数据的函数
    }else if (sectionId === 'supply-list'){
        fetchPurchaseOrders();
    }else if (sectionId === 'supplier-price-list') { // <-- 新增
        fetchSupplierPrices(); // 加载供应商价格表数据
    }
    // 修改结束
}

// 退出登录
function logout() {
    alert('即将返回登陆界面');
    window.location.href='/logout';
}

// 新增：获取并显示供应商商品价格表数据
async function fetchSupplierPrices() {
    const supplierPriceTableBody = document.getElementById('supplierPriceTableBody');
    supplierPriceTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">加载中...</td></tr>'; // 显示加载状态

    try {
        const response = await fetch('/staff/supplier_prices'); // 调用新的后端路由
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '获取供应商价格数据失败');
        }

        supplierPriceTableBody.innerHTML = ''; // 清空现有内容
        if (data.length === 0) {
            supplierPriceTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">暂无供应商商品价格数据。</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = supplierPriceTableBody.insertRow();
            row.insertCell().textContent = item.Good_Num;
            row.insertCell().textContent = item.Good_Name;
            row.insertCell().textContent = item.Supplier_Num;
            row.insertCell().textContent = item.Supplier_UserName;
            row.insertCell().textContent = parseFloat(item.Good_Price).toFixed(2); // 格式化价格
        });
    } catch (error) {
        console.error('获取供应商价格数据失败:', error);
        supplierPriceTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">加载供应商价格数据失败: ${error.message}</td></tr>`;
        alert('获取供应商价格数据失败，请稍后再试。');
    }
}

// 修改开始：打开添加员工模态框
function openAddEmployeeModal() {
    document.getElementById('addEmployeeForm').reset(); // 清空表单
    document.getElementById('addEmployeeModal').style.display = 'flex'; // 使用 flex 布局居中
}


function exportEmployees() {
    alert('正在导出员工数据...');
    // 这里可以实现数据导出功能
}

// 供应商管理功能
function addSupplier() {
    alert('打开添加供应商表单...');
}

function exportSuppliers() {
    alert('正在导出供应商数据...');
}

// 客户管理功能
function addCustomer() {
    alert('打开添加客户表单...');
}

function exportCustomers() {
    alert('正在导出客户数据...');
}

// 库存流水功能
function exportInventory() {
    alert('正在导出库存流水...');
}

function printReport() {
    alert('正在打印报表...');
    // window.print();
}

// 库存预警功能
function refreshAlerts() {
    alert('正在刷新预警信息...');
    // 这里可以重新加载预警数据
}

function exportAlerts() {
    alert('正在导出预警报表...');
}

function sendAlert() {
    alert('预警通知已发送给相关人员！');
}

// 供货清单功能
function createSupplyList() {
    document.getElementById('supply-form').style.display = 'block';
}

function hideSupplyForm() {
    document.getElementById('supply-form').style.display = 'none';
}

function sendSupplyList() {
    alert('选择要发送的供货清单...');
}

function exportSupplyList() {
    alert('正在导出供货清单...');
}
// 修改开始：模态框控制函数
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 仪表盘统计功能
async function fetchDashboardStats() {
    try {
        const response = await fetch('/staff/dashboard_stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();

        document.getElementById('total-customers').textContent = stats.total_customers;
        document.getElementById('total-employees').textContent = stats.total_employees;
        document.getElementById('total-suppliers').textContent = stats.total_suppliers;
        document.getElementById('alert-items-count').textContent = stats.alert_items_count;

        // 如果预警商品数大于0，可以给预警卡片添加一个视觉提示
        const alertCard = document.querySelector('.stat-card.alert-card');
        if (stats.alert_items_count > 0) {
            alertCard.classList.add('has-alerts'); // 添加一个 CSS 类
        } else {
            alertCard.classList.remove('has-alerts');
        }

    } catch (error) {
        console.error('获取仪表盘统计数据失败:', error);
        alert('获取仪表盘统计数据失败，请稍后再试。');
    }
}

// 确保页面加载时就调用一次 fetchDashboardStats
document.addEventListener('DOMContentLoaded', () => {
    // 假设初始显示的是仪表盘
    showSection('dashboard'); 
});

//获取供应商数据
async function fetchSuppliers() {
    try {
        const response = await fetch('/staff/suppliers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const suppliers = await response.json();
        const tbody = document.querySelector('#suppliers-table tbody');
        tbody.innerHTML = ''; // 清空现有内容

        suppliers.forEach(supplier => {
            const row = tbody.insertRow();
            row.dataset.supplierNum = supplier.Supplier_Num; // 存储供应商编号

            row.insertCell().textContent = supplier.Supplier_Num;
            row.insertCell().textContent = supplier.Supplier_UserName;
            row.insertCell().textContent = supplier.Supplier_Phone;

            const actionsCell = row.insertCell();

            // 编辑按钮
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-edit'; // 可以自定义 CSS 样式
            editButton.textContent = '编辑';
            editButton.onclick = () => openEditSupplierModal(supplier); // 传递整个供应商对象
            actionsCell.appendChild(editButton);

            // 删除按钮
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-delete';
            deleteButton.textContent = '删除';
            deleteButton.onclick = () => deleteSupplier(supplier.Supplier_Num);
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('获取供应商数据失败:', error);
        alert('获取供应商数据失败，请稍后再试。');
    }
}

// 修改开始：打开编辑供应商模态框
function openEditSupplierModal(supplier) {
    document.getElementById('editSupplierNum').value = supplier.Supplier_Num;
    document.getElementById('editSupplierName').value = supplier.Supplier_UserName;
    document.getElementById('editSupplierPhone').value = supplier.Supplier_Phone;
    document.getElementById('editSupplierModal').style.display = 'flex';
}
// 修改结束

// 修改开始：提交编辑供应商表单
async function submitEditSupplierForm(event) {
    event.preventDefault();

    const form = event.target;
    const supplierNum = document.getElementById('editSupplierNum').value; // 获取供应商编号
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    // 删除 Supplier_Num，因为我们在 URL 中传递它，并且数据库通常不更新主键
    delete data.Supplier_Num;

    try {
        const response = await fetch(`/staff/edit_supplier/${supplierNum}`, {
            method: 'PUT', // 使用PUT方法进行更新
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            closeModal('editSupplierModal');
            fetchSuppliers(); // 重新加载供应商列表
        } else {
            alert('编辑供应商失败: ' + result.error);
        }
    } catch (error) {
        console.error('编辑供应商请求失败:', error);
        alert('编辑供应商失败，请检查网络连接。');
    }
}


// 修改开始：获取员工数据并填充表格
async function fetchEmployees() {
    try {
        const response = await fetch('/staff/employees'); // 从后端获取员工数据
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const employees = await response.json();
        const tbody = document.querySelector('#employees-table tbody');
        tbody.innerHTML = ''; // 清空现有内容

        employees.forEach(employee => {
            const row = tbody.insertRow();
            row.dataset.staffNum = employee.Staff_Num; // 存储工号以便编辑和删除

            row.insertCell().textContent = employee.Staff_Num;
            row.insertCell().textContent = employee.Staff_Name;
            row.insertCell().textContent = employee.Staff_Position;
            row.insertCell().textContent = employee.Is_On_Duty === 1 ? '在职' : '离职';

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-edit';
            editButton.textContent = '编辑';
            editButton.onclick = () => editRow(employee); // 直接传递员工对象
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-delete';
            deleteButton.textContent = '删除';
            deleteButton.onclick = () => deleteRow(employee.Staff_Num); // 直接传递工号
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('获取员工数据失败:', error);
        alert('获取员工数据失败，请稍后再试。');
    }
}


// 修改开始：删除供应商函数
async function deleteSupplier(supplierNum) {
    if (confirm(`确定要删除编号为 ${supplierNum} 的供应商吗？`)) {
        try {
            const response = await fetch(`/staff/delete_supplier/${supplierNum}`, { // 向后端发送DELETE请求
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchSuppliers(); // 重新加载供应商列表
            } else {
                alert('删除失败: ' + result.error);
            }
        } catch (error) {
            console.error('删除供应商请求失败:', error);
            alert('删除供应商失败，请检查网络连接。');
        }
    }
}

// 表单提交
document.addEventListener('DOMContentLoaded', () => { // 确保在 DOM 加载后绑定事件
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    if (addEmployeeForm) {
        addEmployeeForm.addEventListener('submit', submitAddEmployeeForm);
    }

    const editEmployeeForm = document.getElementById('editEmployeeForm');
    if (editEmployeeForm) {
        editEmployeeForm.addEventListener('submit', submitEditEmployeeForm);
    }

    const editSupplierForm = document.getElementById('editSupplierForm'); 
    if (editSupplierForm) {
        editSupplierForm.addEventListener('submit', submitEditSupplierForm);
    }

    // 页面加载完成后的初始化操作
    console.log('仓库管理系统已启动');
    
    // 初始加载员工数据 (如果员工管理是默认显示或在需要时手动调用)
    // fetchEmployees(); // 可以在 showSection('employees') 中调用
});

//员工表单提交
async function submitAddEmployeeForm(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    // 将 Is_On_Duty 转换为整数
    data['Is_On_Duty'] = parseInt(data['Is_On_Duty'], 10);

    try {
        const response = await fetch('/staff/add_employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            closeModal('addEmployeeModal');
            fetchEmployees(); // 重新加载员工列表
        } else {
            alert('添加员工失败: ' + result.error);
        }
    } catch (error) {
        console.error('添加员工请求失败:', error);
        alert('添加员工失败，请检查网络连接。');
    }
}
// 修改结束
// 修改开始：编辑员工表单提交
async function submitEditEmployeeForm(event) {
    event.preventDefault();

    const form = event.target;
    const staffNum = document.getElementById('editStaffNum').value; // 获取工号
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    // 将 Is_On_Duty 转换为整数
    data['Is_On_Duty'] = parseInt(data['Is_On_Duty'], 10);

    // 如果密码为空，则不发送密码字段
    if (!data['Password']) {
        delete data['Password'];
    }

    try {
        const response = await fetch(`/staff/edit_employee/${staffNum}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            closeModal('editEmployeeModal');
            fetchEmployees(); // 重新加载员工列表
        } else {
            alert('编辑员工失败: ' + result.error);
        }
    } catch (error) {
        console.error('编辑员工请求失败:', error);
        alert('编辑员工失败，请检查网络连接。');
    }
}
// 修改结束

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 页面加载完成后的初始化操作
    console.log('仓库管理系统已启动');
    
    // 添加表格行点击效果
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            // 移除其他行的选中状态
            tableRows.forEach(r => r.style.backgroundColor = '');
            // 设置当前行为选中状态
            this.style.backgroundColor = '#e3f2fd';
        });
    });

    // 添加搜索功能
    const searchInputs = document.querySelectorAll('.search-input[type="text"]');
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    });
});

// 搜索功能
function performSearch(keyword) {
    console.log('搜索关键词:', keyword);
    // 这里可以实现实际的搜索逻辑
    alert('搜索功能开发中，关键词：' + keyword);
}

// 修改开始：表格编辑功能
function editRow(employee) {
    // 填充编辑模态框
    document.getElementById('editStaffNum').value = employee.Staff_Num;
    document.getElementById('editStaffName').value = employee.Staff_Name;
    document.getElementById('editStaffPosition').value = employee.Staff_Position;
    document.getElementById('editIsOnDuty').value = employee.Is_On_Duty;
    document.getElementById('editPassword').value = ''; // 清空密码，让用户选择是否修改

    openModal('editEmployeeModal');
}
// 修改结束

// 修改开始：表格删除功能
async function deleteRow(staffNum) {
    if (confirm(`确定要删除工号为 ${staffNum} 的员工吗？`)) {
        try {
            const response = await fetch(`/staff/delete_employee/${staffNum}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchEmployees(); // 重新加载员工列表
            } else {
                alert('删除失败: ' + result.error);
            }
        } catch (error) {
            console.error('删除员工请求失败:', error);
            alert('删除员工失败，请检查网络连接。');
        }
    }
}
// 修改结束
//获取库存流水
async function fetchInventorySummary() {
    try {
        const response = await fetch('/staff/inventory_summary');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const inventoryData = await response.json();
        const tbody = document.querySelector('#inventory-table tbody'); // Make sure your HTML table has this ID
        tbody.innerHTML = ''; // Clear existing content

        inventoryData.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell().textContent = item.goods_id;
            row.insertCell().textContent = item.goods_name;
            row.insertCell().textContent = item.current_stock;
            row.insertCell().textContent = item.total_in;
            row.insertCell().textContent = item.total_out;
            // Add more cells as needed for other columns from your view
        });
    } catch (error) {
        console.error('获取库存流水数据失败:', error);
        alert('获取库存流水数据失败，请稍后再试。');
    }
}

// 库存预警功能
async function fetchAlerts() {
    try {
        const response = await fetch('/staff/alerts'); // 调用后端预警数据路由
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const alerts = await response.json();
        const tbody = document.querySelector('#alerts-table tbody');
        tbody.innerHTML = ''; // 清空现有内容

        alerts.forEach(alert => {
            const row = tbody.insertRow();
            row.insertCell().textContent = alert.Good_Num;
            row.insertCell().textContent = alert.Good_Name;
            row.insertCell().textContent = alert.Current_Quantity;
            row.insertCell().textContent = alert.Min_Quantity;
            row.insertCell().textContent = alert.Quantity_Gap;

            const alertLevelCell = row.insertCell();
            const alertLevelSpan = document.createElement('span');
            alertLevelSpan.textContent = alert.Alert_Level;
            // 根据预警级别设置样式
            if (alert.Alert_Level === 'CRITICAL') {
                alertLevelSpan.style.color = 'red';
                alertLevelSpan.style.fontWeight = 'bold';
                row.style.backgroundColor = '#ffebee'; // 浅红色背景
            } else if (alert.Alert_Level === 'DANGER') {
                alertLevelSpan.style.color = 'darkorange';
                alertLevelSpan.style.fontWeight = 'bold';
                row.style.backgroundColor = '#fff3e0'; // 浅橙色背景
            } else if (alert.Alert_Level === 'WARNING') {
                alertLevelSpan.style.color = 'orange';
                alertLevelSpan.style.fontWeight = 'bold';
                row.style.backgroundColor = '#fff8e1'; // 浅黄色背景
            } else if (alert.Alert_Level === 'LOW') {
                alertLevelSpan.style.color = 'blue'; // 可以是蓝色或其他表示较低级别的颜色
                row.style.backgroundColor = '#e3f2fd'; // 浅蓝色背景
            }
            alertLevelCell.appendChild(alertLevelSpan);

            row.insertCell().textContent = new Date(alert.Alert_Time).toLocaleString(); // 格式化时间

            const actionsCell = row.insertCell();
            const restockButton = document.createElement('button');
            restockButton.className = 'btn btn-edit'; // 可以重用编辑按钮的样式
            restockButton.textContent = '立即处理'; // 或者“立即补货”
            restockButton.onclick = () => openOrderQuantityModal(alert.Good_Num, alert.Good_Name);
            actionsCell.appendChild(restockButton);
        });
    } catch (error) {
        console.error('获取库存预警数据失败:', error);
        alert('获取库存预警数据失败，请稍后再试。');
    }
}

// 打开订购数量模态框
function openOrderQuantityModal(goodNum, goodName) {
    document.getElementById('orderGoodNum').value = goodNum;
    document.getElementById('orderGoodName').value = goodName;
    document.getElementById('requestQuantity').value = ''; // 清空上次的输入
    openModal('orderQuantityModal');
}

// 提交订单
document.getElementById('orderQuantityForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    const goodNum = document.getElementById('orderGoodNum').value;
    const requestQuantity = document.getElementById('requestQuantity').value;

    if (!requestQuantity || requestQuantity <= 0) {
        alert('订购数量必须大于0！');
        return;
    }

    const orderData = {
        Good_Num: goodNum,
        Request_Quantity: parseInt(requestQuantity)
    };

    try {
        const response = await fetch('/staff/add_request_record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message); // 显示成功消息

        closeModal('orderQuantityModal'); // 关闭模态框
        fetchAlerts(); // 刷新预警列表
    } catch (error) {
        console.error('提交订单失败:', error);
        alert('提交订单失败：' + error.message);
    }
});


async function fetchPurchaseOrders() {
    console.log('正在获取订购记录数据...');
    try {
        const response = await fetch('/staff/request_records');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const records = await response.json();
        const purchaseOrderTableBody = document.getElementById('purchaseOrderTableBody');
        purchaseOrderTableBody.innerHTML = ''; // 清空现有内容

        if (records.length === 0) {
            purchaseOrderTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">暂无订购记录。</td></tr>';
            return;
        }

        records.forEach(record => {
            const row = purchaseOrderTableBody.insertRow();
            row.insertCell().textContent = record.Request_ID;
            row.insertCell().textContent = record.Good_Num;
            row.insertCell().textContent = record.Good_Name || '未知商品'; // 如果Good_Name为空，显示“未知商品”
            row.insertCell().textContent = record.Request_Quantity;
            row.insertCell().textContent = record.Preferred_Supplier_ID || 'N/A'; // 如果没有匹配供应商
            row.insertCell().textContent = record.Status;
            row.insertCell().textContent = record.Matched_Price ? record.Matched_Price: 'N/A'; // 格式化价格
            row.insertCell().textContent = new Date(record.Request_Time).toLocaleString(); // 格式化时间
        });
    } catch (error) {
        console.error('获取订购记录数据失败:', error);
        // 可以添加一个用户友好的错误提示
        const purchaseOrderTableBody = document.getElementById('purchaseOrderTableBody');
        purchaseOrderTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">加载订购记录失败。</td></tr>';
    }
}


function refreshAlerts() {
    alert('正在刷新预警信息...');
    fetchAlerts(); // 调用 fetchAlerts 重新加载数据
}

// 动态更新统计数据
function updateStats() {
    // 这里可以通过API获取最新的统计数据
    console.log('更新统计数据...');
}

// 定时刷新数据（每5分钟）
setInterval(updateStats, 300000);

// 响应式菜单切换
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('mobile-open');
}

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showSection('dashboard');
                break;
            case '2':
                e.preventDefault();
                showSection('employees');
                break;
            case '3':
                e.preventDefault();
                showSection('suppliers');
                break;
            case '5':
                e.preventDefault();
                showSection('inventory');
                break;
            case 's':
                e.preventDefault();
                document.querySelector('.search-input').focus();
                break;
        }
    }
});
