// === Проверка авторизации и загрузка профиля ===
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Ошибка авторизации");

    const data = await res.json();

    // Заполняем профиль
    document.getElementById("username").textContent = data.username;
    document.getElementById("role").textContent = data.role;

    if (data.avatar) document.getElementById("avatar").src = data.avatar;
    if (data.about) document.getElementById("about").value = data.about;

    // Админка
    if (data.role === "admin") {
      document.getElementById("admin-section").style.display = "block";
    }
  } catch (err) {
    console.error(err);
    window.location.href = "index.html";
  }
});

// === Загрузка аватара ===
document.getElementById("upload-avatar-btn")?.addEventListener("click", async () => {
  const file = document.getElementById("avatar-input").files[0];
  if (!file) return alert("Выберите файл");

  const formData = new FormData();
  formData.append("avatar", file);

  const token = localStorage.getItem("token");
  const res = await fetch("/upload-avatar", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.ok) {
    alert("Аватар обновлен!");
    window.location.reload();
  } else {
    alert("Ошибка загрузки аватара");
  }
});

// === Обновление "О себе" ===
document.getElementById("save-about-btn")?.addEventListener("click", async () => {
  const about = document.getElementById("about").value;
  const token = localStorage.getItem("token");

  const res = await fetch("/update-about", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ about }),
  });

  if (res.ok) {
    alert("Информация обновлена!");
  } else {
    alert("Ошибка сохранения");
  }
});

// === Бан пользователя (админ) ===
async function banUser(username) {
  const token = localStorage.getItem("token");
  const res = await fetch("/ban-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  if (res.ok) alert("Пользователь заблокирован!");
  else alert("Ошибка при блокировке");
}

// === Бан приложения (админ) ===
async function banApp(appName) {
  const token = localStorage.getItem("token");
  const res = await fetch("/ban-app", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ appName }),
  });

  if (res.ok) alert("Приложение заблокировано!");
  else alert("Ошибка при блокировке");
}

// === Летучая мышь ===
document.addEventListener("DOMContentLoaded", () => {
  const bat = document.createElement("div");
  bat.id = "bat";
  bat.textContent = "🦇";
  document.body.appendChild(bat);

  const squeak = new Audio("https://www.fesliyanstudios.com/play-mp3/387");

  const messages = [
    "Кто посмел нажать на меня?",
    "Тёмные силы всегда рядом...",
    "Я храню тайны этого сайта...",
    "Не пугайся, я не кусаю (пока)...",
    "Каждый клик приближает тебя к истине.",
    "🦇 Ты уверен, что хочешь продолжить?",
  ];

  bat.style.position = "fixed";
  bat.style.left = "50%";
  bat.style.top = "20%";
  bat.style.fontSize = "32px";
  bat.style.cursor = "pointer";
  bat.style.transition = "transform 0.4s ease, left 0.4s ease, top 0.4s ease";

  bat.addEventListener("click", () => {
    squeak.play();
    const msg = document.createElement("div");
    msg.textContent = messages[Math.floor(Math.random() * messages.length)];
    msg.style.position = "fixed";
    msg.style.bottom = "20px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.background = "rgba(0,0,0,0.8)";
    msg.style.color = "#5eead4";
    msg.style.padding = "10px 15px";
    msg.style.borderRadius = "8px";
    msg.style.boxShadow = "0 0 15px #0ea5e9";
    msg.style.fontSize = "14px";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);

    const newLeft = Math.random() * 80 + 10;
    const newTop = Math.random() * 60 + 10;
    bat.style.left = newLeft + "%";
    bat.style.top = newTop + "%";
  });
});

// === Кошка для связи с админом ===
document.addEventListener("DOMContentLoaded", () => {
  const cat = document.createElement("div");
  cat.id = "cat";
  cat.textContent = "🐱";
  document.body.appendChild(cat);

  cat.style.position = "fixed";
  cat.style.right = "20px";
  cat.style.bottom = "20px";
  cat.style.fontSize = "40px";
  cat.style.cursor = "pointer";
  cat.style.transition = "transform 0.3s ease";

  const hint = document.createElement("div");
  hint.textContent = "Есть вопросы? Нажми на меня!";
  hint.style.position = "fixed";
  hint.style.right = "70px";
  hint.style.bottom = "40px";
  hint.style.background = "rgba(0,0,0,0.8)";
  hint.style.color = "#5eead4";
  hint.style.padding = "8px 12px";
  hint.style.borderRadius = "6px";
  hint.style.fontSize = "13px";
  hint.style.boxShadow = "0 0 12px #22d3ee";
  document.body.appendChild(hint);

  const messageBox = document.createElement("div");
  messageBox.id = "cat-message-box";
  messageBox.style.display = "none";
  messageBox.innerHTML = `
    <form id="contact-form">
      <input type="email" id="user-email" placeholder="Ваш email" required><br><br>
      <textarea id="user-message" placeholder="Ваше сообщение" required></textarea><br><br>
      <button type="submit">Отправить</button>
    </form>
  `;
  messageBox.style.position = "fixed";
  messageBox.style.right = "20px";
  messageBox.style.bottom = "80px";
  messageBox.style.background = "rgba(0,0,0,0.9)";
  messageBox.style.padding = "15px";
  messageBox.style.borderRadius = "10px";
  messageBox.style.boxShadow = "0 0 20px #5eead4";
  document.body.appendChild(messageBox);

  cat.addEventListener("click", () => {
    messageBox.style.display =
      messageBox.style.display === "none" ? "block" : "none";
  });

  document.getElementById("contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("user-email").value;
    const msg = document.getElementById("user-message").value;

    window.location.href = `mailto:juliaangelss26@gmail.com?subject=Сообщение&body=Email: ${encodeURIComponent(
      email
    )}%0A${encodeURIComponent(msg)}`;

    messageBox.style.display = "none";
    e.target.reset();
  });
});
