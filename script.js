document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (token) {
    showProfile();
  }

  // === Авторизация ===
  document.getElementById("login-btn").onclick = async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      showProfile();
    } else {
      alert(data.error || "Ошибка входа");
    }
  };

  // === Регистрация ===
  document.getElementById("register-btn").onclick = async () => {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Регистрация успешна!");
    } else {
      alert(data.error || "Ошибка регистрации");
    }
  };

  // === Выход ===
  document.getElementById("logout-btn").onclick = () => {
    localStorage.clear();
    location.reload();
  };

  // === Показ профиля ===
  async function showProfile() {
    const res = await fetch("/profile", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    const data = await res.json();
    if (data.username) {
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("logout-section").style.display = "block";
      document.getElementById("profile-info").innerHTML = `
        <p><img src="/${data.avatar}" alt="avatar" width="60"> 
        ${data.username} ${data.role === "admin" ? "👑" : ""}</p>
        <p>${data.about || "О себе пока пусто"}</p>`;
    }
  }

  // === Летучая мышь ===
  const bat = document.getElementById("bat");
  const batMsg = document.getElementById("bat-message");
  const messages = [
    "Я лечу над тобой!",
    "Темнота всегда рядом...",
    "Не забывай про донат 😉",
    "🦇 Я твой ночной страж!",
    "Береги свет, человек..."
  ];

  function moveBat() {
    bat.style.top = Math.random() * 80 + "%";
    bat.style.left = Math.random() * 80 + "%";
  }
  setInterval(moveBat, 4000);

  bat.addEventListener("click", () => {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    batMsg.textContent = msg;
    batMsg.style.display = "block";
    setTimeout(() => batMsg.style.display = "none", 3000);
  });

  // === Кошка ===
  const catWidget = document.getElementById("cat-widget");
  const contactForm = document.getElementById("contact-form-container");
  const closeContact = document.getElementById("close-contact");

  catWidget.addEventListener("click", () => {
    contactForm.classList.toggle("hidden");
  });
  closeContact.addEventListener("click", () => {
    contactForm.classList.add("hidden");
  });

  document.getElementById("contact-form").onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById("contact-email").value;
    const message = document.getElementById("contact-message").value;

    const res = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Сообщение отправлено!");
      contactForm.classList.add("hidden");
    } else {
      alert("Ошибка: " + (data.error || "Не удалось отправить"));
    }
  };
});
