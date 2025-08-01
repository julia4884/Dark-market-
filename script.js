// === Авторизация ===
let token = localStorage.getItem("token");
let role = localStorage.getItem("role");

function updateUI() {
  const authSection = document.getElementById("auth-section");
  const logoutSection = document.getElementById("logout-section");

  if (token) {
    if (authSection) authSection.style.display = "none";
    if (logoutSection) logoutSection.style.display = "block";

    fetch("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) {
          logout();
          return;
        }
        const profileInfo = document.getElementById("profile-info");
if (profileInfo) {
  profileInfo.innerHTML = `
    <div>
      <img src="${data.avatar}" alt="avatar" class="avatar">
      <p><strong>${data.username}</strong> ${data.role === "admin" ? "👑" : ""}</p>
      <p>${data.about || "Нет описания"}</p>
      ${data.role === "admin" ? '<a href="admin.html" class="admin-btn">Перейти в админку</a>' : ""}
    </div>
  `;
}
      })
      .catch(() => logout());
  } else {
    if (authSection) authSection.style.display = "block";
    if (logoutSection) logoutSection.style.display = "none";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  token = null;
  role = null;
  const authSection = document.getElementById("auth-section");
  const logoutSection = document.getElementById("logout-section");
  if (authSection) authSection.style.display = "block";
  if (logoutSection) logoutSection.style.display = "none";
}

// === Вход ===
document.getElementById("login-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) return alert("Заполните все поля!");

  // === Проверка на личный админ-аккаунт ===
  if (email === "juliaangelss26@gmail.com" && password === "dark4884") {
    localStorage.setItem("token", "admin-token");
    localStorage.setItem("role", "admin");
    token = "admin-token";
    role = "admin";
    alert("Добро пожаловать, Администратор 👑");
    window.location.href = "admin.html";
    return;
  }

  // === Обычный вход через сервер ===
  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        token = data.token;
        role = data.role;
        updateUI();

        if (data.role === "admin") {
          alert("Добро пожаловать, Администратор 👑");
          window.location.href = "admin.html";
        } else {
          alert("Вход выполнен успешно!");
        }
      } else {
        alert("Ошибка входа: " + (data.error || "Попробуйте снова"));
      }
    })
    .catch(() => alert("Сервер недоступен"));
});
    .then((res) => res.json())
    .then((data) => {
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    token = data.token;
    role = data.role;
    updateUI();

    if (data.role === "admin") {
      alert("Добро пожаловать, Администратор 👑");
      window.location.href = "admin.html";
    } else {
      alert("Вход выполнен успешно!");
    }
  } else {
    alert("Ошибка входа: " + (data.error || "Попробуйте снова"));
  }
})
      } else {
        alert("Ошибка входа: " + (data.error || "Попробуйте снова"));
      }
    })
    .catch(() => alert("Сервер недоступен"));
});

// === Регистрация ===
document.getElementById("register-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value.trim();

  if (!username || !email || !password) return alert("Заполните все поля!");

  fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Регистрация успешна! Войдите.");
      } else {
        alert("Ошибка регистрации: " + (data.error || "Попробуйте снова"));
      }
    })
    .catch(() => alert("Сервер недоступен"));
});

// === Выход ===
document.getElementById("logout-btn")?.addEventListener("click", () => logout());

// === Летучая мышь 🦇 ===
const bat = document.getElementById("flying-bat");
const batMessage = document.getElementById("bat-message");

const batMessages = [
  "Добро пожаловать в тёмный мир!",
  "Я тут просто пролетаю 🦇",
  "Осторожно... я наблюдаю за тобой 👀",
  "Ты сегодня отлично выглядишь!",
  "Не забудь проверить новые разделы!",
  "Псс... там скидки в магазине!",
  "Если боишься — жми на кошку 🐱",
];

function moveBat() {
  if (!bat) return;
  const x = Math.random() * (window.innerWidth - 80);
  const y = Math.random() * (window.innerHeight - 80);
  bat.style.left = `${x}px`;
  bat.style.top = `${y}px`;
}
setInterval(moveBat, 4000);

bat?.addEventListener("click", () => {
  if (!batMessage) return;
  const msg = batMessages[Math.floor(Math.random() * batMessages.length)];
  batMessage.textContent = msg;
  batMessage.style.left = bat.style.left;
  batMessage.style.top = `calc(${bat.style.top} - 40px)`;
  batMessage.style.display = "block";
  batMessage.style.opacity = 1;
  setTimeout(() => (batMessage.style.display = "none"), 2500);
});

// === Кошка 🐱 ===
const catWidget = document.getElementById("cat-widget");
const contactFormContainer = document.getElementById("contact-form-container");
const contactForm = document.getElementById("contact-form");
const closeContact = document.getElementById("close-contact");

catWidget?.addEventListener("click", () => {
  if (!contactFormContainer) return;
  contactFormContainer.style.display =
    contactFormContainer.style.display === "block" ? "none" : "block";
});

closeContact?.addEventListener("click", () => {
  if (contactFormContainer) contactFormContainer.style.display = "none";
});

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("contact-email").value.trim();
  const message = document.getElementById("contact-message").value.trim();

  if (!email || !message) return alert("Заполните все поля!");

  fetch("/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.success ? "Сообщение отправлено!" : "Ошибка: " + data.error);
      if (data.success) contactFormContainer.style.display = "none";
    })
    .catch(() => alert("Сервер недоступен"));
});

// === Галерея картинок ===
const imagesGallery = [
  { src: "images/pic1.jpg", title: "Тёмный лес", desc: "Мистическая тьма и свет луны." },
  { src: "images/pic2.jpg", title: "Космос", desc: "Неоновая галактика 🌌" },
  { src: "images/pic3.jpg", title: "Ведьма", desc: "Силуэты магии в ночи." },
  { src: "images/pic4.jpg", title: "Замок", desc: "Древние руины на утёсе." }
];

function loadImagesGallery() {
  const container = document.getElementById("images-gallery");
  if (!container) return;
  container.innerHTML = imagesGallery.map(img => `
    <div class="card">
      <img src="${img.src}" alt="${img.title}">
      <h3>${img.title}</h3>
      <p>${img.desc}</p>
    </div>
  `).join("");
   }
// === Запуск ===
document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  // === Панель сообщений кошки и мыши ===
let currentType = "cat";

function loadMessages(type) {
  fetch(`/admin/messages`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then(res => res.json())
    .then(data => {
      const windowEl = document.getElementById("messages-window");
      windowEl.innerHTML = "";
      data
        .filter(msg => msg.type === type)
        .forEach(msg => {
          const div = document.createElement("div");
          div.classList.add("message-item");
          div.innerHTML = `
            <span>${msg.content}</span>
            <button class="edit-btn" data-id="${msg.id}">✏️</button>
            <button class="delete-btn" data-id="${msg.id}">🗑️</button>
          `;
          windowEl.appendChild(div);
        });
    });
}

// Переключение вкладок
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    loadMessages(currentType);
  });
});

// Добавление сообщения
document.getElementById("chat-form").addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const content = input.value.trim();
  if (!content) return;

  fetch("/admin/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ type: currentType, content })
  })
    .then(res => res.json())
    .then(() => {
      input.value = "";
      loadMessages(currentType);
    });
});

// Обработчики редактирования и удаления
document.getElementById("messages-window").addEventListener("click", e => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    fetch(`/admin/messages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(() => loadMessages(currentType));
  }
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;
    const newText = prompt("Введите новый текст:");
    if (newText) {
      fetch(`/admin/messages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ content: newText })
      }).then(() => loadMessages(currentType));
    }
  }
});

// Загружаем сообщения при открытии страницы
loadMessages(currentType);
  loadImagesGallery(); // Запускаем загрузку картинок, если есть блок
});
