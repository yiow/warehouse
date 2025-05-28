
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
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        alert('已退出登录，即将跳转到登录页面...');
        // 这里可以添加实际的登出逻辑
        // window.location.href = '/login';
    }
}

// 员工管理功能
function addEmployee() {
    alert('打开添加员工表单...');
    // 这里可以实现模态框或跳转到添加页面
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

// 表格编辑功能
function editRow(button) {
    const row = button.closest('tr');
    alert('编辑功能开发中...');
}

// 表格删除功能
function deleteRow(button) {
    if (confirm('确定要删除这条记录吗？')) {
        const row = button.closest('tr');
        row.remove();
        alert('删除成功！');
    }
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
