document.addEventListener('DOMContentLoaded', function() {
  // 获取表单和错误元素
  const loginForm = document.getElementById('loginForm');
  const userType = document.getElementById('userType');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const userTypeError = document.getElementById('userTypeError');
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');

  // 表单提交处理
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 重置错误信息
    userTypeError.style.display = 'none';
    usernameError.style.display = 'none';
    passwordError.style.display = 'none';
    
    let hasError = false;
    
    // 验证用户类型
    if (userType.selectedIndex === 0) {
        userTypeError.textContent = '请选择用户类型';
        userTypeError.style.display = 'block';
        hasError = true;
    }

    if (!hasError) {
        alert("成功进入系统，即将跳转下一页面");
    }
  });

  // 添加输入框焦点效果
  const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'scale(1)';
    });
  });

  // 忘记密码链接处理
  document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    alert('请联系系统管理员重置密码');
  });

  // 注册链接处理
  document.querySelector('.register-link a').addEventListener('click', function(e) {
    e.preventDefault();
    alert('请联系系统管理员创建新账户');
  });
});