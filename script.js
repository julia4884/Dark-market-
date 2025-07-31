// === Авторизация ===
async function register(username, email, password) {
  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return await res.json();
}

async function login(email, password) {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
  }
  return data;
}

async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    const user = await res.json();
    renderProfile(user);
  }
}

function renderProfile(user) {
  const profile = document.getElementById("profile");
  if (!profile) return;

  profile.innerHTML = `
    <div class="user-card">
      <img src="${user.avatar || 'uploads/avatars/default.png'}" alt="avatar" class="avatar">
      <h3>
        ${user.username}
        ${user.role === "admin" ? "👑" : ""}
      </h3>
      <p>${user.about || "Нет информации"}</p>
    </div>
  `;
}

// === Загрузка файлов ===
async function uploadFile(file, category) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const res = await fetch(`/upload/${category}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return await res.json();
}

// === Летающая мышь ===
const mouse = document.createElement("div");
mouse.id = "flying-mouse";
mouse.textContent = "🐭";
mouse.style.position = "fixed";
mouse.style.fontSize = "28px";
mouse.style.cursor = "pointer";
mouse.style.transition = "transform 0.8s ease";
document.body.appendChild(mouse);

function moveMouseRandomly() {
  const x = Math.random() * (window.innerWidth - 50);
  const y = Math.random() * (window.innerHeight - 50);
  mouse.style.transform = `translate(${x}px, ${y}px)`;
}
setInterval(moveMouseRandomly, 4000);

// Сообщения от мыши
const mouseMessages = [
  "Привет, я твой проводник 🐭",
  "Не забудь проверить профиль!",
  "А ты знал, что тут есть секреты?",
  "Пи-пи! Я люблю сыр 🧀",
  "Отправь сообщение администратору через кошку 🐱",
  "Кликни на меня, и я убегу!"
];

function showMouseMessage(text) {
  const msg = document.createElement("div");
  msg.className = "mouse-message";
  msg.textContent = text;
  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 3000);
}

// Писк при клике
mouse.addEventListener("click", () => {
  // Web Audio API
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.15);

  // Сообщение
  const randomMsg = mouseMessages[Math.floor(Math.random() * mouseMessages.length)];
  showMouseMessage(randomMsg);

  moveMouseRandomly();
});

// === Кошка для обратной связи ===
const cat = document.createElement("div");
cat.id = "contact-cat";
cat.textContent = "🐱";
cat.style.position = "fixed";
cat.style.bottom = "20px";
cat.style.right = "20px";
cat.style.fontSize = "34px";
cat.style.cursor = "pointer";
document.body.appendChild(cat);

cat.addEventListener("click", () => {
  const form = document.createElement("div");
  form.className = "contact-form";
  form.innerHTML = `
    <h3>Свяжись с администратором</h3>
    <input type="email" id="contact-email" placeholder="Ваш Email">
    <textarea id="contact-message" placeholder="Ваше сообщение"></textarea>
    <button id="send-contact">Отправить</button>
  `;
  document.body.appendChild(form);

  document.getElementById("send-contact").onclick = async () => {
    const email = document.getElementById("contact-email").value;
    const message = document.getElementById("contact-message").value;

    const res = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });

    const data = await res.json();
    alert(data.success ? "Сообщение отправлено!" : "Ошибка: " + data.error);
    form.remove();
  };
});

// === Автозагрузка профиля при входе ===
document.addEventListener("DOMContentLoaded", loadProfile);
