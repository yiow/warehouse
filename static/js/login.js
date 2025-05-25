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
    
    // 验证用户类型是否为空
    if (userType.selectedIndex === 0) {
        userTypeError.textContent = '请选择用户类型';
        userTypeError.style.display = 'block';
        hasError = true;
    }
    // 验证用户名和密码是否为空
    if (username.value.trim() === '') {
        usernameError.textContent = '请输入用户名';
        usernameError.style.display = 'block';
        hasError = true;
    }
    if (password.value.trim() === '') {
        passwordError.textContent = '请输入密码';
        passwordError.style.display = 'block';
        hasError = true;
    }
    if (!hasError) {
      // 发送数据到后端
      fetch('/login',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({
          userType:userType.value,
          username:username.value,
          password:password.value
        })
      })
      .then(response => response.json())
      .then(data =>{
        if (data.success){
          alert("登陆成功，即将跳转");
          const type=userType.value;
          if (type=='customer'){
            window.location.href = '/customer/dashboard';
          }
          if (type=='staff'){
            window.location.href = '/staff/dashboard';
          }
          if (type=='supplier'){
            window.location.href = '/supplier/dashboard';
          }
        }
        else{
          //显示错误信息
          if (data.message){
            alert(data.message);
          }
        }
      })
      .catch(error =>{
        console.error('Error:',error);
        alert('登陆过程中发生错误');
      });
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

});