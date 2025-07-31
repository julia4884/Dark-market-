// === Авторизация ===
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

function updateUI() {
  const authSection = document.getElementById("auth-section");
  const logoutSection = document.getElementById("logout-section");

  if (token) {
    authSection.style.display = "none";
    logoutSection.style.display = "block";

    fetch("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const profileInfo = document.getElementById("profile-info");
        profileInfo.innerHTML = `
          <div>
            <img src="${data.avatar}" alt="avatar" class="avatar">
            <p><strong>${data.username}</strong> ${
              data.role === "admin" ? "👑" : ""
            }</p>
            <p>${data.about || "Нет описания"}</p>
          </div>
        `;
      });
  } else {
    authSection.style.display = "block";
    logoutSection.style.display = "none";
  }
}

document.getElementById("login-btn")?.addEventListener("click", () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

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
        updateUI();
        if (data.role === "admin") window.location.href = "admin.html";
      } else {
        alert("Ошибка входа: " + (data.error || "Попробуйте снова"));
      }
    });
});

document.getElementById("register-btn")?.addEventListener("click", () => {
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

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
    });
});

document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
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
  const x = Math.random() * (window.innerWidth - 50);
  const y = Math.random() * (window.innerHeight - 50);
  bat.style.transform = `translate(${x}px, ${y}px)`;
}
setInterval(moveBat, 4000);

bat.addEventListener("click", () => {
  const msg = batMessages[Math.floor(Math.random() * batMessages.length)];
  batMessage.textContent = msg;
  batMessage.style.left = bat.style.left;
  batMessage.style.top = bat.style.top;
  batMessage.style.opacity = 1;

  // Писк через Web Audio API (без файлов)
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
  }, 600);
});

// === Кошка 🐱 ===
const catWidget = document.getElementById("cat-widget");
const contactFormContainer = document.getElementById("contact-form-container");
const contactForm = document.getElementById("contact-form");

catWidget.addEventListener("click", () => {
  contactFormContainer.style.display =
    contactFormContainer.style.display === "none" ? "block" : "none";
});

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("user-email").value;
  const message = document.getElementById("user-message").value;

  fetch("/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.success ? "Сообщение отправлено!" : "Ошибка: " + data.error);
      if (data.success) contactFormContainer.style.display = "none";
    });
});

// === Инициализация ===
document.addEventListener("DOMContentLoaded", updateUI);
