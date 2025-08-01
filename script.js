// === Авторизация ===
let token = localStorage.getItem("token");
let role = localStorage.getItem("role");

// Обновление интерфейса
async function updateUI() {
  const authSection = document.getElementById("auth-section");
  const logoutSection = document.getElementById("logout-section");

  if (token) {
    if (authSection) authSection.style.display = "none";
    if (logoutSection) logoutSection.style.display = "block";

    try {
      const res = await fetch("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data || data.error) {
        logout();
        return;
      }

      // Обновляем роль (если она изменилась на сервере)
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

// Выход
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

  fetch("/login", {
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

// === Донат PayPal (после оплаты) ===
async function handleDonation(orderID, amount = 10) {
  try {
    const res = await fetch("/capture-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ orderID, days: 30, amount }),
    });
    const data = await res.json();

    if (data.status === "COMPLETED") {
      alert("Спасибо за поддержку!");

      await updateUI();

      if (role === "developer") {
        window.location.href = "developer.html";
      } else {
        window.location.reload();
      }
    } else {
      alert("Оплата не завершена.");
    }
  } catch {
    alert("Ошибка при подтверждении платежа");
  }
}

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
  "Если боишься — жми на кошку 🐈‍⬛",
];

function moveBatSmoothly() {
  if (!bat) return;

  const x = Math.random() * (window.innerWidth - 80);
  const y = Math.random() * (window.innerHeight - 80);
  bat.style.left = `${x}px`;
  bat.style.top = `${y}px`;

// Иногда делаем паузу подольше (будто отдыхает)
let nextFlight;
if (Math.random() < 0.3) { 
  // 30% шанс подольше отдохнуть
  nextFlight = Math.random() * 5000 + 5000; // 5–10 секунд
} else {
  nextFlight = Math.random() * 4000 + 2000; // 2–6 секунд
}
setTimeout(moveBatSmoothly, nextFlight);
}

// Первый запуск через 2 секунды
setTimeout(moveBatSmoothly, 2000);

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
// === Чат ===
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatTabs = document.querySelectorAll(".chat-tab");
let currentChat = "global"; // вкладка по умолчанию

// Обновление чата
async function loadChat() {
  try {
    const res = await fetch(`/chat/${currentChat}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const messages = await res.json();
    chatWindow.innerHTML = messages
      .map(
        (msg) => `
        <div class="chat-message">
          <span class="chat-username ${
            msg.role === "admin" ? "admin" :
            msg.role === "developer" ? "developer" : "user"
          }">${msg.username}</span>:
          <span>${msg.content}</span>
          <div class="chat-actions">
            <button class="reply-btn" data-user="${msg.username}">Ответить</button>
            <button class="pm-btn" data-user="${msg.username}">Личка</button>
            <button class="report-btn" data-id="${msg.id}">Пожаловаться</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch {
    chatWindow.innerHTML = "<p>Не удалось загрузить сообщения.</p>";
  }
}

// Отправка сообщения
chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = chatInput.value.trim();
  if (!content) return;

  try {
    await fetch(`/chat/${currentChat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ content }),
    });
    chatInput.value = "";
    loadChat();
  } catch {
    alert("Ошибка отправки сообщения");
  }
});

// Переключение вкладок
chatTabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    chatTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentChat = tab.dataset.tab;
    loadChat();
  })
);

// Автообновление каждые 5 секунд
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
  loadImagesGallery();
});
