// === Авторизация и токены ===
const API_URL = window.location.origin;

async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("✅ Вход выполнен");
      window.location.href = "admin.html"; // переход в личный кабинет
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    console.error("Ошибка входа:", err);
    alert("⚠ Ошибка соединения");
  }
}

async function register() {
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

    if (res.ok) {
      alert("✅ Регистрация успешна! Теперь войдите.");
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    alert("⚠ Ошибка соединения");
  }
}

document.getElementById("login-btn")?.addEventListener("click", login);
document.getElementById("register-btn")?.addEventListener("click", register);

// === Личный кабинет ===
async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById("profile-info").innerHTML = `
        <p><strong>${data.username}</strong> ${data.role === "admin" ? "👑" : ""}</p>
        <img src="${data.avatar}" alt="Аватар" style="width:80px;border-radius:50%;">
        <p>${data.about || "Нет описания"}</p>
      `;
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("logout-section").style.display = "block";
    } else {
      localStorage.removeItem("token");
    }
  } catch (err) {
    console.error("Ошибка профиля:", err);
  }
}

document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.reload();
});

loadProfile();

// === Летучая мышь ===
const bat = document.getElementById("flying-bat");
const batMessage = document.getElementById("bat-message");

const batPhrases = [
  "🦇 Привет! Хочешь узнать секрет?",
  "🦇 Смотри под крыло...",
  "🦇 Шшш... я храню тайны сайта!",
  "🦇 Ночью тут особенно красиво...",
  "🦇 Нажми ещё раз — и я улечу!",
];

if (bat) {
  bat.addEventListener("click", () => {
    const phrase = batPhrases[Math.floor(Math.random() * batPhrases.length)];
    batMessage.textContent = phrase;
    batMessage.style.display = "block";
    setTimeout(() => {
      batMessage.style.display = "none";
    }, 3000);
  });
}

// === Кошка ===
const catWidget = document.getElementById("cat-widget");
const contactFormContainer = document.getElementById("contact-form-container");
const contactForm = document.getElementById("contact-form");

catWidget?.addEventListener("click", () => {
  contactFormContainer.style.display =
    contactFormContainer.style.display === "block" ? "none" : "block";
});

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("contact-email").value;
  const message = document.getElementById("contact-message").value;

  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });
    const data = await res.json();

    if (res.ok) {
      alert("✅ Сообщение отправлено!");
      contactForm.reset();
      contactFormContainer.style.display = "none";
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    console.error("Ошибка отправки:", err);
    alert("⚠ Ошибка соединения");
  }
});
