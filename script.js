// === Глобальная настройка API ===
const API_URL = "https://dark-market-backend.onrender.com"; // замени на свой бекенд на Render

document.addEventListener("DOMContentLoaded", () => {
  alert("✅ Скрипт загружен и работает!");
});
// Проверка API
fetch(`${API_URL}/messages/cat`)
  .then(res => res.json())
  .then(data => console.log("✅ API доступен:", data))
  .catch(() => alert("❌ Нет связи с бекендом. Проверь Render."));
  // === Авторизация ===
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // Поддержка новых id без ломки старых
  function getById(...ids) {
    for (let id of ids) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  // Привязка к полям ввода
  const chatInput   = getById("chat-input-main", "chat-input");
  const chatSendBtn = getById("chat-send-main", "chat-send");
  const stickerPanel = getById("sticker-panel-main", "sticker-panel");
  const stickerPanelOwl = getById("sticker-panel-owl", "sticker-panel");
  const stickerToggle = getById("sticker-toggle");

  console.log("✅ Проверка элементов:");
  console.log("chatInput:", chatInput);
  console.log("chatSendBtn:", chatSendBtn);
  console.log("stickerPanel:", stickerPanel);
  console.log("stickerToggle:", stickerToggle);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  updateUI();
});

// === Глобальные переменные ===
let token = localStorage.getItem("token");
let role = localStorage.getItem("role");

// === Обновление интерфейса ===
async function updateUI() {
  const authSection = document.getElementById("auth-section");
  const logoutSection = document.getElementById("logout-section");

  if (token) {
    if (authSection) authSection.style.display = "none";
    if (logoutSection) logoutSection.style.display = "block";

    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data || data.error) {
        logout();
        return;
      }

      role = data.role;
      localStorage.setItem("role", role);

      const profileInfo = document.getElementById("profile-info");
      if (profileInfo) {
        let badge = "";
        if (role === "admin") badge = "👑";
        else if (role === "developer") badge = "💎";

        profileInfo.innerHTML = `
          <div>
            <img src="${data.avatar}" alt="avatar" class="avatar">
            <p><strong>${data.username}</strong> ${badge}</p>
            <p>${data.about || "Нет описания"}</p>
            ${
              role === "admin"
                ? '<a href="admin.html" class="admin-btn">Перейти в админку</a>'
                : role === "developer"
                ? '<a href="developer.html" class="admin-btn">Перейти в кабинет разработчика 💎</a>'
                : '<a href="cabinet.html" class="user-btn">Перейти в личный кабинет</a>'
            }
          </div>
        `;
      }
    } catch {
      logout();
    }
  } else {
    if (authSection) authSection.style.display = "block";
    if (logoutSection) logoutSection.style.display = "none";
  }
}

// === Выход ===
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
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

  fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", email);
        token = data.token;
        role = data.role;

        await updateUI();

        if (role === "admin") {
          alert("Добро пожаловать, Администратор 👑");
          window.location.href = "admin.html";
        } else if (role === "developer") {
          alert("Добро пожаловать, Разработчик 💎");
          window.location.href = "developer.html";
        } else {
          alert("Вход выполнен успешно!");
          window.location.href = "cabinet.html";
        }
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

  fetch(`${API_URL}/register`, {
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
// === Чат ===
let currentChat = "global";

async function loadChat() {
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/chat/${currentChat}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const messagesDiv = document.getElementById("chat-messages");

    if (messagesDiv) {
      messagesDiv.innerHTML = data
        .map(
          (msg) => `
          <div class="chat-msg">
            <strong>${msg.username}</strong>: ${msg.content}
          </div>
        `
        )
        .join("");
    }
  } catch (err) {
    console.error("Ошибка загрузки чата:", err);
  }
}

document.querySelectorAll(".chat-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".chat-tab").forEach((t) =>
      t.classList.remove("active")
    );
    tab.classList.add("active");
    currentChat = tab.dataset.tab;
    loadChat();
  });
});

document.getElementById("chat-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!token) return alert("Войдите, чтобы писать в чат");

  const input = document.getElementById("chat-input");
  const content = input.value.trim();
  if (!content) return;

  try {
    await fetch(`${API_URL}/chat/${currentChat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    input.value = "";
    loadChat();
  } catch {
    alert("Ошибка отправки сообщения");
  }
});

// === Стикеры ===
async function loadStickers() {
  try {
    const res = await fetch(`${API_URL}/stickers`);
    const stickers = await res.json();
    const panel = document.getElementById("sticker-panel");
    if (!panel) return;

    panel.innerHTML = stickers
      .map(
        (sticker) => `
      <img src="${API_URL}${sticker.url}" alt="sticker" class="sticker-img">
    `
      )
      .join("");

    document.querySelectorAll(".sticker-img").forEach((img) => {
      img.addEventListener("click", async () => {
        if (!token) return alert("Войдите, чтобы отправлять стикеры");
        const stickerTag = `<img src="${img.src}" class="chat-sticker">`;

        try {
          await fetch(`${API_URL}/chat/${currentChat}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: stickerTag }),
          });
          loadChat();
        } catch {
          alert("Ошибка отправки стикера");
        }
      });
    });
  } catch (err) {
    console.error("Ошибка загрузки стикеров:", err);
  }
}
loadStickers();

// Автообновление чата
setInterval(loadChat, 5000);
loadChat();

// === Кошка 🐈‍⬛ ===
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

  fetch(`${API_URL}/contact`, {
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
  { id: 1, src: "images/pic1.jpg", title: "Тёмный лес", desc: "Мистическая тьма и свет луны." },
  { id: 2, src: "images/pic2.jpg", title: "Космос", desc: "Неоновая галактика 🌌" },
  { id: 3, src: "images/pic3.jpg", title: "Ведьма", desc: "Силуэты магии в ночи." },
  { id: 4, src: "images/pic4.jpg", title: "Замок", desc: "Древние руины на утёсе." }
];

async function loadImagesGallery() {
  const container = document.getElementById("images-gallery");
  if (!container) return;

  container.innerHTML = imagesGallery.map(img => `
    <div class="card" data-id="${img.id}">
      <img src="${img.src}" alt="${img.title}">
      <h3>${img.title}</h3>
      <p>${img.desc}</p>
      <button class="meow-btn">🐾 Мяук</button>
      <span class="like-count">0</span>
    </div>
  `).join("");

  for (const fileCard of container.querySelectorAll(".card")) {
    const fileId = fileCard.dataset.id;
    const likeCount = fileCard.querySelector(".like-count");
    const btn = fileCard.querySelector(".meow-btn");

    try {
      const res = await fetch(`${API_URL}/files/${fileId}/likes`);
      const data = await res.json();
      likeCount.textContent = data.total || 0;

      btn.addEventListener("click", async () => {
        try {
          const res = await fetch(`${API_URL}/files/${fileId}/like`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();

          if (data.success) {
            const res2 = await fetch(`${API_URL}/files/${fileId}/likes`);
            const countData = await res2.json();
            likeCount.textContent = countData.total;

            btn.textContent = data.liked ? "👍🏻 Мяук" : "🐾 Мяук";
          } else {
            alert("Ошибка: " + (data.error || "Не удалось поставить лайк"));
          }
        } catch {
          alert("Сервер недоступен");
        }
      });
    } catch {
      likeCount.textContent = "⚠";
    }
  }
}

// === Запуск ===
document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  loadImagesGallery();
});
