const API_URL = "https://dark-market-backend.onrender.com"; 

document.addEventListener("DOMContentLoaded", () => {
  alert("✅ Скрипт загружен и работает!");

  // Проверка API
  (async () => {
    try {
      const res = await fetch(`${API_URL}/messages/cat`);
      if (res.ok) {
        const data = await res.json();
        console.log("✅ API доступен:", data);
      } else {
        console.warn("⚠ Сервер отвечает ошибкой:", res.status);
        alert("⚠ Сервер отвечает, но с ошибкой. Проверь Render.");
      }
    } catch (err) {
      console.warn("❌ Нет связи с бекендом:", err);
      alert("❌ Нет связи с бекендом. Проверь Render.");
    }
  })();
});

// === Глобальные DOM элементы ===
const chatInput = document.getElementById("chat-input");
const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const stickerToggle = document.getElementById("sticker-toggle");
const stickerPanel = document.getElementById("sticker-panel");
const chatOverlay = document.getElementById("chat-overlay");

let currentChat = "global";
// === UI обновление ===
function updateUI() {
  const token = localStorage.getItem("token");
  document.getElementById("auth-section").style.display = token ? "none" : "block";
  document.getElementById("logout-section").style.display = token ? "block" : "none";
}

// === Аутентификация ===
function initAuth() {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const logoutBtn = document.getElementById("logout-btn");

  loginBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("✅ Успешный вход!");
        location.reload();
      } else {
        alert("Ошибка: " + (data.error || "неизвестно"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });

  registerBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Регистрация успешна!");
        location.reload();
      } else {
        alert("Ошибка: " + (data.error || "неизвестно"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("🚪 Вы вышли");
    location.reload();
  });
}
// === Чат ===
async function loadChat() {
  try {
    const res = await fetch(`${API_URL}/chat/${currentChat}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();

    chatMessages.innerHTML = data.map(msg => `
      <div class="chat-msg ${msg.role}">
        <span class="user">${msg.username}</span>: 
        <span class="content">${msg.content}</span>
      </div>
    `).join("");
  } catch (err) {
    console.error("Ошибка загрузки чата:", err);
  }
}

chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = chatInput.value.trim();
  if (!content) return;

  try {
    const res = await fetch(`${API_URL}/chat/${currentChat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.success) {
      chatInput.value = "";
      loadChat();
    } else {
      alert("Ошибка: " + (data.error || "Не удалось отправить сообщение"));
    }
  } catch {
    alert("❌ Сервер недоступен");
  }
});

setInterval(loadChat, 5000);

// === Стикеры ===
async function loadStickers() {
  try {
    const res = await fetch(`${API_URL}/stickers`);
    const stickers = await res.json();
    if (!Array.isArray(stickers) || stickers.length === 0) return;

    stickerPanel.innerHTML = stickers.map(st =>
      `<img src="${API_URL}${st.url}" class="sticker" alt="${st.name}" title="${st.name}">`
    ).join("");

    for (const sticker of stickerPanel.querySelectorAll(".sticker")) {
      sticker.addEventListener("click", async () => {
        const stickerTag = `[sticker:${sticker.alt}]`;
        try {
          await fetch(`${API_URL}/chat/${currentChat}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ content: stickerTag }),
          });
          loadChat();
        } catch {
          alert("Ошибка отправки стикера");
        }
      });
    }
  } catch (err) {
    console.error("Ошибка загрузки стикеров:", err);
  }
}

stickerToggle?.addEventListener("click", () => {
  if (stickerPanel.style.display === "block") {
    stickerPanel.style.display = "none";
    chatOverlay.style.display = "none";
  } else {
    stickerPanel.style.display = "block";
    chatOverlay.style.display = "block";
  }
});
chatOverlay?.addEventListener("click", () => {
  stickerPanel.style.display = "none";
  chatOverlay.style.display = "none";
});

// === Кошка 🐈‍⬛ ===
function initCat() {
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
}

// === Летучая мышь 🦇 ===
function initBat() {
  const bat = document.getElementById("flying-bat");
  const batMsg = document.getElementById("bat-message");

  bat?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_URL}/messages/bat`);
      const data = await res.json();
      batMsg.textContent = data.message || "Шшш... Я молчу 🦇";
      batMsg.style.display = "block";

      setTimeout(() => (batMsg.style.display = "none"), 4000);
    } catch {
      alert("❌ Не удалось получить сообщение мыши");
    }
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
      <div class="comments">
        <textarea class="comment-input" placeholder="Ваш комментарий..."></textarea>
        <button class="comment-btn">💬 Отправить</button>
        <div class="comment-list"></div>
      </div>
    </div>
  `).join("");

  for (const fileCard of container.querySelectorAll(".card")) {
    const fileId = fileCard.dataset.id;
    const likeCount = fileCard.querySelector(".like-count");
    const btn = fileCard.querySelector(".meow-btn");
    const commentBtn = fileCard.querySelector(".comment-btn");
    const commentInput = fileCard.querySelector(".comment-input");
    const commentList = fileCard.querySelector(".comment-list");

    // Загружаем лайки
    try {
      const res = await fetch(`${API_URL}/files/${fileId}/likes`);
      const data = await res.json();
      likeCount.textContent = data.total || 0;
    } catch {
      likeCount.textContent = "⚠";
    }

    // Ставим лайк
    btn.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API_URL}/files/${fileId}/like`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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

    // Загружаем комментарии
    async function loadComments() {
      try {
        const res = await fetch(`${API_URL}/files/${fileId}/comments`);
        const comments = await res.json();
        commentList.innerHTML = comments.map(c =>
          `<div class="comment"><b>${c.username}</b>: ${c.content}</div>`
        ).join("");
      } catch {
        commentList.innerHTML = "<div class='comment'>⚠ Ошибка загрузки комментариев</div>";
      }
    }
    loadComments();

    // Отправляем комментарий
    commentBtn.addEventListener("click", async () => {
      const content = commentInput.value.trim();
      if (!content) return alert("Введите комментарий");

      try {
        const res = await fetch(`${API_URL}/files/${fileId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content }),
        });
        const data = await res.json();

        if (data.success) {
          commentInput.value = "";
          loadComments();
        } else {
          alert("Ошибка: " + (data.error || "Не удалось добавить комментарий"));
        }
      } catch {
        alert("Сервер недоступен");
      }
    });
  }
}
// === PayPal интеграция ===
function initPayPal() {
  const donateBtn = document.getElementById("donate-btn");
  if (!donateBtn) return;

  donateBtn.addEventListener("click", async () => {
    try {
      const amount = prompt("Введите сумму доната в EUR:");
      if (!amount || isNaN(amount)) {
        return alert("⚠ Пожалуйста, введите корректную сумму.");
      }

      const res = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || "Ошибка создания заказа");
      }

      // Перенаправление пользователя на PayPal
      const approveLink = data.links.find(link => link.rel === "approve");
      if (approveLink) {
        window.location.href = approveLink.href;
      } else {
        alert("⚠ Не удалось получить ссылку PayPal.");
      }
    } catch (err) {
      console.error("Ошибка PayPal:", err);
      alert("❌ Не удалось создать заказ PayPal. Проверь сервер.");
    }
  }
// === Запуск всех функций ===
document.addEventListener("DOMContentLoaded", () => {
  alert("✅ Скрипт загружен и работает!");
  updateUI();
  loadChat();
  loadStickers();
  initCat();
  initBat();
  loadImagesGallery();
  initPayPal();
});                            
