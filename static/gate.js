document.addEventListener("DOMContentLoaded", () => {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  loginTab.addEventListener("click", () => {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
  });

  registerTab.addEventListener("click", () => {
      registerForm.style.display = "block";
      loginForm.style.display = "none";
      registerTab.classList.add("active");
      loginTab.classList.remove("active");
  });

  document.getElementById('registerBtn').addEventListener('click', async () => {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        document.getElementById('registerNotification').innerText = 'Passwords do not match!';
        return;
    }

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    document.getElementById('registerNotification').innerText = result.message;
  });

  document.getElementById('loginBtn').addEventListener('click', async () => {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (result.success) {
        const roleMessage = result.roles.join(', '); 
        document.getElementById('loginNotification').innerText = `Welcome! Role: ${roleMessage}`;
            setTimeout(() => {
                window.location.href = '/index';
            }, 500);  
      } else {
          document.getElementById('loginNotification').innerText = result.message;
      }
  });

});
