const API_URL = "https://dark-market-backend.onrender.com"; // укажи свой бекенд Render

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
        console.warn("⚠ Сервер отвечает с ошибкой:", res.status);
        alert("⚠ Сервер доступен, но отвечает с ошибкой");
      }
    } catch (err) {
      console.warn("❌ Нет связи с бекендом:", err);
      alert("❌ Нет связи с бекендом. Проверь Render.");
    }
  })();

  initAuth();
  initCatAndBat();
  initChat();
  loadImagesGallery();
});

// === Авторизация ===
function initAuth() {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");

  loginBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

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
        alert("Ошибка: " + (data.error || "Неизвестно"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });

  registerBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Регистрация успешна! Теперь войдите.");
      } else {
        alert("Ошибка: " + (data.error || "Неизвестно"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });
  }
// === Кошка 🐈‍⬛ ===
function initCatAndBat() {
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
      alert("❌ Сервер недоступен");
    }
  });
}

// === Летучая мышь 🦇 ===
async function loadBatMessage() {
  try {
    const res = await fetch(`${API_URL}/messages/bat`);
    const data = await res.json();
    const batMessage = document.getElementById("bat-message");
    if (batMessage) {
      batMessage.textContent = data.message;
      batMessage.style.display = "block";
      setTimeout(() => (batMessage.style.display = "none"), 5000);
    }
  } catch {
    console.warn("⚠ Ошибка загрузки сообщения летучей мыши");
  }
}
document.getElementById("flying-bat")?.addEventListener("click", loadBatMessage);

// === Чат ===
function initChat() {
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  async function loadChat() {
    try {
      const res = await fetch(`${API_URL}/chat/global`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      chatMessages.innerHTML = data
        .map((msg) => `<p><b>${msg.username}</b>: ${msg.content}</p>`)
        .join("");
    } catch {
      console.warn("⚠ Ошибка загрузки чата");
    }
  }

  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!chatInput.value.trim()) return;

    try {
      const res = await fetch(`${API_URL}/chat/global`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ content: chatInput.value }),
      });
      const data = await res.json();
      if (data.success) {
        chatInput.value = "";
        loadChat();
      } else {
        alert("Ошибка: " + (data.error || "Не удалось отправить"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });

  setInterval(loadChat, 5000);
  loadChat();
}
// === Стикеры ===
async function loadStickers() {
  try {
    const panel = document.getElementById("sticker-panel");
    if (!panel) return;

    const res = await fetch(`${API_URL}/stickers`);
    if (!res.ok) throw new Error("Ошибка загрузки стикеров");
    const stickers = await res.json();

    panel.innerHTML = stickers
      .map((s) => `<img src="${API_URL}${s.url}" alt="${s.name}" class="sticker">`)
      .join("");

    panel.querySelectorAll(".sticker").forEach((sticker) => {
      sticker.addEventListener("click", async () => {
        const stickerTag = `[sticker:${sticker.alt}]`;
        try {
          await fetch(`${API_URL}/chat/global`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({ content: stickerTag }),
          });
        } catch {
          alert("Ошибка отправки стикера");
        }
      });
    });
  } catch (err) {
    console.error("Ошибка загрузки стикеров:", err);
  }
}
document.getElementById("sticker-toggle")?.addEventListener("click", () => {
  const panel = document.getElementById("sticker-panel");
  if (panel) {
    panel.style.display = panel.style.display === "block" ? "none" : "block";
  }
});
loadStickers();

// === Галерея картинок + лайки ===
const imagesGallery = [
  { id: 1, src: "images/pic1.jpg", title: "Тёмный лес", desc: "Мистическая тьма и свет луны." },
  { id: 2, src: "images/pic2.jpg", title: "Космос", desc: "Неоновая галактика 🌌" },
  { id: 3, src: "images/pic3.jpg", title: "Ведьма", desc: "Силуэты магии в ночи." },
  { id: 4, src: "images/pic4.jpg", title: "Замок", desc: "Древние руины на утёсе." },
];

async function loadImagesGallery() {
  const container = document.getElementById("images-gallery");
  if (!container) return;

  container.innerHTML = imagesGallery
    .map(
      (img) => `
    <div class="card" data-id="${img.id}">
      <img src="${img.src}" alt="${img.title}">
      <h3>${img.title}</h3>
      <p>${img.desc}</p>
      <button class="meow-btn">🐾 Мяук</button>
      <span class="like-count">0</span>
    </div>
  `
    )
    .join("");

  for (const fileCard of container.querySelectorAll(".card")) {
    const fileId = fileCard.dataset.id;
    const likeCount = fileCard.querySelector(".like-count");
    const btn = fileCard.querySelector(".meow-btn");

    try {
      const res = await fetch(`${API_URL}/files/${fileId}/likes`);
      const data = await res.json();
      likeCount.textContent = data.total || 0;

      const checkRes = await fetch(`${API_URL}/files/${fileId}/liked`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
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
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
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
// === Стикеры 🦉 ===
function initStickers() {
  const stickerToggle = document.getElementById("sticker-toggle");
  const stickerPanel = document.getElementById("sticker-panel");
  const chatOverlay = document.getElementById("chat-overlay");

  if (!stickerToggle || !stickerPanel || !chatOverlay) return;

  // Открытие / закрытие панели
  stickerToggle.addEventListener("click", () => {
    const isVisible = stickerPanel.style.display === "block";
    stickerPanel.style.display = isVisible ? "none" : "block";
    chatOverlay.style.display = isVisible ? "none" : "block";
  });

  chatOverlay.addEventListener("click", () => {
    stickerPanel.style.display = "none";
    chatOverlay.style.display = "none";
  });

  // Подгрузка стикеров с бэкенда
  fetch(`${API_URL}/stickers`)
    .then((res) => res.json())
    .then((stickers) => {
      if (!Array.isArray(stickers)) return;
      stickerPanel.innerHTML = stickers
        .map(
          (sticker) =>
            `<img src="${API_URL}${sticker.url}" 
                  alt="${sticker.name}" 
                  class="sticker-img">`
        )
        .join("");

      // Отправка стикера в чат
      stickerPanel.querySelectorAll(".sticker-img").forEach((img) => {
        img.addEventListener("click", async () => {
          try {
            const stickerTag = `[sticker:${img.alt}]`;
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
      });
    })
    .catch(() => console.warn("⚠ Не удалось загрузить стикеры"));
}

// === Запуск всех модулей ===
document.addEventListener("DOMContentLoaded", () => {
  alert("✅ Скрипт загружен и работает!");

  updateUI();        // проверка токена и отображение UI
  initAuth();        // кнопки входа/регистрации
  initCatAndBat();   // кошка 🐈‍⬛ и летучая мышь 🦇
  initStickers();    // сова‑стикер 🦉
  loadImagesGallery(); // галерея с лайками

  // Автообновление чата
  setInterval(loadChat, 5000);
  loadChat();
});
// === Адаптивное поведение под мобильные устройства ===
function applyMobileAdjustments() {
  const isMobile = window.innerWidth <= 768; // <=768px считаем мобилкой
  const chatInput = document.getElementById("chat-input");
  const stickerPanel = document.getElementById("sticker-panel");
  const catWidget = document.getElementById("cat-widget");

  if (isMobile) {
    console.log("📱 Мобильный режим активирован");

    // Подстройка чата
    if (chatInput) chatInput.style.fontSize = "14px";

    // Панель стикеров делаем адаптивной
    if (stickerPanel) {
      stickerPanel.style.position = "fixed";
      stickerPanel.style.bottom = "0";
      stickerPanel.style.left = "0";
      stickerPanel.style.width = "100%";
      stickerPanel.style.maxHeight = "40%";
      stickerPanel.style.overflowY = "auto";
    }

    // Кошка (переносим кнопку выше, если мешает)
    if (catWidget) {
      catWidget.style.position = "fixed";
      catWidget.style.bottom = "60px";
      catWidget.style.right = "20px";
    }
  } else {
    console.log("💻 Десктопный режим активирован");

    // Возвращаем дефолт
    if (chatInput) chatInput.style.fontSize = "";
    if (stickerPanel) {
      stickerPanel.style = "";
    }
    if (catWidget) {
      catWidget.style = "";
    }
  }
}

// Запускаем при загрузке и при изменении размеров окна
document.addEventListener("DOMContentLoaded", applyMobileAdjustments);
window.addEventListener("resize", applyMobileAdjustments);
