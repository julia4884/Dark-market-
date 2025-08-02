alert("🚀 Финальный скрипт загружен!");
// === Конфиг ===
const API_URL = "https://dark-market-backend.onrender.com";
// === Тестовый запрос к серверу для отладки ===
(async () => {
  try {
    const res = await fetch(`${API_URL}/messages/cat`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ""}` }
    });
    if (!res.ok) {
      const text = await res.text();
      alert(`⚠️ Render ответил ошибкой!\nСтатус: ${res.status}\nСообщение: ${text}`);
    } else {
      const data = await res.json();
      alert("✅ Render ответил успешно!\nДанные: " + JSON.stringify(data));
    }
  } catch (err) {
    alert("❌ Render не отвечает: " + err.message);
  }
})();

// === Проверка загрузки ===
document.addEventListener("DOMContentLoaded", () => {
  alert("✅ Скрипт загружен и работает!");

  // Проверка связи с API
  (async () => {
    try {
      const res = await fetch(`${API_URL}/messages/cat`);
      if (res.ok) {
        console.log("✅ API доступен");
      } else {
        console.warn("⚠ Сервер отвечает с ошибкой:", res.status);
      }
    } catch (err) {
      console.error("❌ Нет связи с бекендом:", err);
    }
  })();

  updateUI();
});

// === Обновление интерфейса в зависимости от авторизации ===
function updateUI() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const authSection = document.getElementById("auth-section");
  const logoutSection = document.getElementById("logout-section");
  const profileInfo = document.getElementById("profile-info");

  if (token) {
    authSection.style.display = "none";
    logoutSection.style.display = "block";
    profileInfo.textContent = `Вы вошли как: ${localStorage.getItem("username") || "Пользователь"}`;
  } else {
    authSection.style.display = "block";
    logoutSection.style.display = "none";
  }

  // Перенаправление в админку
  if (role === "admin" && window.location.pathname.endsWith("admin.html")) {
    console.log("👑 Админ авторизован");
  }
}

// === Авторизация ===
function initAuth() {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // Вход
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

  if (data.role) {
    localStorage.setItem("role", data.role); // сохраняем роль
  }

  if (data.username) {
    localStorage.setItem("username", data.username);
  }

  alert("✅ Успешный вход!\nРоль: " + (data.role || "❌ нет"));
  // Перенаправление в нужный кабинет
if (data.role === "admin") {
    window.location.href = "/admin.html";
} else if (data.role === "developer") {
    window.location.href = "/developer.html";
} else {
    window.location.href = "/cabinet.html";
}
} else {
  alert("Ошибка: " + (data.error || "неизвестно"));
      }
    } catch (err) {
      console.error("Ошибка входа:", err);
      alert("❌ Сервер недоступен");
    }
  });

  // Регистрация
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
    } catch (err) {
      console.error("Ошибка регистрации:", err);
      alert("❌ Сервер недоступен");
    }
  });

  // Выход
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    alert("Вы вышли из аккаунта");
    location.reload();
  });
}

initAuth();
// === Чат ===
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

async function loadChat() {
  try {
    const res = await fetch(`${API_URL}/chat/global`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();

    chatMessages.innerHTML = data
      .map(msg => `
        <div class="chat-message ${msg.username === localStorage.getItem("username") ? "me" : ""}">
          <strong>${msg.username}:</strong> ${msg.content}
        </div>
      `)
      .join("");
  } catch {
    chatMessages.innerHTML = "<p>⚠ Чат недоступен</p>";
  }
}

// Отправка сообщений
chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = chatInput.value.trim();
  if (!content) return;

  try {
    const res = await fetch(`${API_URL}/chat/global`, {
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
      alert("Ошибка: " + (data.error || "не удалось отправить сообщение"));
    }
  } catch {
    alert("❌ Сервер недоступен");
  }
});

// Автообновление чата
setInterval(loadChat, 5000);
loadChat();

// === Панель стикеров ===
const stickerToggle = document.getElementById("sticker-toggle");
const stickerPanel = document.getElementById("sticker-panel");

async function loadStickers() {
  try {
    const res = await fetch(`${API_URL}/stickers`);
    const stickers = await res.json();

    stickerPanel.innerHTML = stickers
      .map(sticker => `<span class="sticker">${sticker.icon}</span>`)
      .join("");

    for (const stickerEl of stickerPanel.querySelectorAll(".sticker")) {
      stickerEl.addEventListener("click", async () => {
        const stickerTag = stickerEl.textContent;

        try {
          await fetch(`${API_URL}/chat/global`, {
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
  stickerPanel.style.display =
    stickerPanel.style.display === "block" ? "none" : "block";
  document.getElementById("chat-overlay").style.display =
    stickerPanel.style.display;
});

loadStickers();

// === Пёрышко 🪶 ===
const feather = document.createElement("div");
feather.id = "chat-feather";
feather.textContent = "🪶";
document.querySelector("#chat-form")?.appendChild(feather);

// лёгкое подпрыгивание
setInterval(() => {
  feather.style.transform = "translateY(-5px)";
  setTimeout(() => (feather.style.transform = "translateY(0)"), 300);
}, 2000);

// === Сова 🦉 ===
const owlButton = document.getElementById("sticker-toggle");
if (owlButton) {
  owlButton.textContent = "🦉 Стикеры";
  owlButton.classList.add("glow-owl"); // в style.css подсветка
      }
// === Кошка 🐈‍⬛ ===
const catWidget = document.getElementById("cat-widget");
const contactFormContainer = document.getElementById("contact-form-container");
const contactForm = document.getElementById("contact-form");
const closeContact = document.getElementById("close-contact");

catWidget?.addEventListener("click", () => {
  contactFormContainer.style.display =
    contactFormContainer.style.display === "block" ? "none" : "block";
});

closeContact?.addEventListener("click", () => {
  contactFormContainer.style.display = "none";
});

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("contact-email").value.trim();
  const message = document.getElementById("contact-message").value.trim();
  if (!email || !message) return alert("Заполните все поля!");

  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });
    const data = await res.json();
    alert(data.success ? "Сообщение отправлено!" : "Ошибка: " + data.error);
    if (data.success) contactFormContainer.style.display = "none";
  } catch {
    alert("Сервер недоступен");
  }
});

// === Летучая мышь 🦇 ===
const bat = document.getElementById("flying-bat");
const batMessage = document.getElementById("bat-message");

bat?.addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_URL}/messages/bat`);
    const data = await res.json();
    batMessage.textContent = data.message || "🦇 Нет сообщений";
    batMessage.style.display = "block";
    setTimeout(() => (batMessage.style.display = "none"), 4000);
  } catch {
    alert("Не удалось получить сообщение от мыши");
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

      const checkRes = await fetch(`${API_URL}/files/${fileId}/liked`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.liked) {
          btn.textContent = "👍🏻 Мяук";
        }
      }
    } catch {
      likeCount.textContent = "⚠";
    }

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
  }
}

document.addEventListener("DOMContentLoaded", loadImagesGallery);
// === PayPal Донат ===
document.addEventListener("DOMContentLoaded", () => {
  const donateBtn = document.getElementById("donate-btn");
  if (donateBtn) {
    donateBtn.addEventListener("click", () => {
      alert("🔮 Перенаправление на PayPal...");
      window.location.href = `${API_URL}/paypal/donate`;
    });
  }
});

// === Защита гостей в чате ===
document.addEventListener("DOMContentLoaded", () => {
  const chatInput = document.getElementById("chat-input");
  const chatForm = document.getElementById("chat-form");

  if (!localStorage.getItem("token")) {
    if (chatInput) chatInput.disabled = true;
    if (chatForm) {
      const submitBtn = chatForm.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = true;
    }
    if (chatInput) chatInput.placeholder = "Войдите, чтобы отправлять сообщения";
  }
});

// === Проверка загрузки скрипта ===
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

// === Итоговый запуск всех функций ===
document.addEventListener("DOMContentLoaded", () => {
  initAuth();        // авторизация
  initStickers();    // стикеры
  initCatAndBat();   // кошка и летучая мышь
  loadImagesGallery(); // галерея
  loadChat();        // чат
});
