
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
        'customers': '客户管理',
        'inventory': '库存流水',
        'alerts': '库存预警',
        'supply-list': '供货清单'
    };
    document.querySelector('.header-title').textContent = titles[sectionId] || '管理员控制台';
    // 修改开始：当切换到员工管理页面时，加载员工数据
    if (sectionId === 'employees') {
        fetchEmployees();
    }
    // 修改结束
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        alert('已退出登录，即将跳转到登录页面...');
        // 这里可以添加实际的登出逻辑
        // window.location.href = '/login';
    }
}

// 修改开始：打开添加员工模态框
//员工管理功能
function openAddEmployeeModal() {
    document.getElementById('addEmployeeForm').reset(); // 清空表单
    document.getElementById('addEmployeeModal').style.display = 'flex'; // 使用 flex 布局居中
}
// 修改结束

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
// 修改结束
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
// 修改结束
// 修改开始：添加员工表单提交
document.addEventListener('DOMContentLoaded', () => { // 确保在 DOM 加载后绑定事件
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    if (addEmployeeForm) {
        addEmployeeForm.addEventListener('submit', submitAddEmployeeForm);
    }

    const editEmployeeForm = document.getElementById('editEmployeeForm');
    if (editEmployeeForm) {
        editEmployeeForm.addEventListener('submit', submitEditEmployeeForm);
    }

    // 页面加载完成后的初始化操作
    console.log('仓库管理系统已启动');
    
    // 初始加载员工数据 (如果员工管理是默认显示或在需要时手动调用)
    // fetchEmployees(); // 可以在 showSection('employees') 中调用
});

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
            case '4':
                e.preventDefault();
                showSection('customers');
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
