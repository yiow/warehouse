document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('registerForm');

  const userType = document.getElementById('userType');
  const username = document.getElementById('username');
  const phone = document.getElementById('phone');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');

  const userTypeError = document.getElementById('userTypeError');
  const usernameError = document.getElementById('usernameError');
  const phoneError = document.getElementById('phoneError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');

  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // 重置错误信息
    userTypeError.style.display = 'none';
    usernameError.style.display = 'none';
    phoneError.style.display = 'none';
    passwordError.style.display = 'none';
    confirmPasswordError.style.display = 'none';

    let hasError = false;

    // 校验
    if (userType.selectedIndex === 0) {
      userTypeError.textContent = '请选择用户类型';
      userTypeError.style.display = 'block';
      hasError = true;
    }

    if (username.value.trim() === '') {
      usernameError.textContent = '请输入用户名';
      usernameError.style.display = 'block';
      hasError = true;
    }

    if (phone.value.trim() === '') {
      phoneError.textContent = '请输入手机号';
      phoneError.style.display = 'block';
      hasError = true;
    }

    if (password.value.trim() === '') {
      passwordError.textContent = '请输入密码';
      passwordError.style.display = 'block';
      hasError = true;
    }

    if (confirmPassword.value.trim() === '') {
      confirmPasswordError.textContent = '请确认密码';
      confirmPasswordError.style.display = 'block';
      hasError = true;
    } else if (password.value !== confirmPassword.value) {
      confirmPasswordError.textContent = '两次密码不一致';
      confirmPasswordError.style.display = 'block';
      hasError = true;
    }

    if (!hasError) {
      // 构造发送数据
      const data = {
        userType: userType.value,
        username: username.value,
        phone: phone.value,
        password: password.value
      };

      fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('注册成功，请登录！');
            window.location.href = '/login';
          } 
          else {
            alert(data.message || '注册失败，请重试');
          }
        })
        .catch(error => {
          console.error('注册请求出错:', error);
          alert('注册过程中发生错误');
        });
    }
  });
});
