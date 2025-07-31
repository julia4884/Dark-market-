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
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          if (authSection) authSection.style.display = "block";
          if (logoutSection) logoutSection.style.display = "none";
          return;
        }
        const profileInfo = document.getElementById("profile-info");
        if (profileInfo) {
          profileInfo.innerHTML = `
            <div>
              <img src="${data.avatar}" alt="avatar" class="avatar">
              <p><strong>${data.username}</strong> ${
            data.role === "admin" ? "👑" : ""
          }</p>
              <p>${data.about || "Нет описания"}</p>
            </div>
          `;
        }
      })
      .catch((err) => console.error("Ошибка профиля:", err));
  } else {
    if (authSection) authSection.style.display = "block";
    if (logoutSection) logoutSection.style.display = "none";
  }
}

document.getElementById("login-btn")?.addEventListener("click", () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) return alert("Заполните все поля!");

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
        if (data.role === "admin") window.location.href = "admin.html";
      } else {
        alert("Ошибка входа: " + (data.error || "Попробуйте снова"));
      }
    })
    .catch(() => alert("Сервер недоступен"));
});

document.getElementById("register-btn")?.addEventListener("click", () => {
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

document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  token = null;
  role = null;
  updateUI();
});

// === Летучая мышь 🦇 ===
const bat = document.getElementById("flying-bat");
const batMessage = document.getElementById("bat-message");

const batMessages = [
  "Добро пожаловать на тёмную сторону!",
  "Не бойся, я не кусаю... сильно 🦇",
  "Тсс... у меня для тебя секрет!",
  "Эй, ты! Нужна помощь?",
  "Время магии и тьмы!",
  "Ты выглядишь подозрительно счастливым 😈",
  "Не забудь проверить новые разделы!",
];

function moveBat() {
  if (!bat) return;
  const x = Math.random() * (window.innerWidth - 60);
  const y = Math.random() * (window.innerHeight - 60);
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
  batMessage.style.opacity = 1;

  // Писк через Web Audio API
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.value = 800;
  osc.start();
  setTimeout(() => {
    osc.stop();
    batMessage.style.opacity = 0;
  }, 800);
});

// === Кошка 🐱 ===
const catWidget = document.getElementById("cat-widget");
const contactFormContainer = document.getElementById("contact-form-container");
const contactForm = document.getElementById("contact-form");

catWidget?.addEventListener("click", () => {
  if (!contactFormContainer) return;
  contactFormContainer.classList.toggle("visible");
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
      if (data.success) contactFormContainer.classList.remove("visible");
    })
    .catch(() => alert("Сервер недоступен"));
});

// === Запуск ===
document.addEventListener("DOMContentLoaded", updateUI);
