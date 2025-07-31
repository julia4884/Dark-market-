// === Проверка авторизации и загрузка профиля ===
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; // редирект если нет токена
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

    if (data.avatar) {
      document.getElementById("avatar").src = data.avatar;
    }

    if (data.about) {
      document.getElementById("about").value = data.about;
    }

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

// === Обновление поля "О себе" ===
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

// === Бан пользователя (только админ) ===
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

// === Бан приложения (только админ) ===
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

  // Звук писка
  const squeak = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."); // вставлен короткий base64-звук писка

  // Сообщения летучей мыши
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

    // Показываем сообщение
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

    // Перелетает
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

  // Всплывающее сообщение
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

  cat.addEventListener("mouseenter", () => {
    cat.style.transform = "scale(1.2)";
  });

  cat.addEventListener("mouseleave", () => {
    cat.style.transform = "scale(1)";
  });

  cat.addEventListener("click", () => {
    const email = "juliaangelss26@gmail.com";
    const subject = encodeURIComponent("Сообщение администратору");
    const body = encodeURIComponent("Здравствуйте! Хотела бы обсудить...");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  });
});
document.addEventListener("DOMContentLoaded", () => {
  console.log("Сайт загружен и готов к работе");

  /* === Летучая мышь === */
  const bat = document.createElement("div");
  bat.className = "bat";
  document.body.appendChild(bat);

  // Писк мыши (реальный звук)
  const squeak = new Audio("https://www.fesliyanstudios.com/play-mp3/387"); 

  bat.addEventListener("click", () => {
    squeak.play();
    bat.style.transform = `translate(${Math.random() * 80}vw, ${Math.random() * 80}vh)`;
  });

  /* === Кошка === */
  const cat = document.createElement("div");
  cat.className = "cat";
  cat.innerHTML = "🐱";
  document.body.appendChild(cat);

  const messageBox = document.createElement("div");
  messageBox.id = "cat-message-box";
  messageBox.innerHTML = `
    <p>Есть вопросы или предложения?<br>
    Нажми на меня!</p>
    <form id="contact-form" style="display:none; margin-top:10px;">
      <input type="email" id="user-email" placeholder="Ваш email" required><br><br>
      <textarea id="user-message" placeholder="Ваше сообщение" required></textarea><br><br>
      <button type="submit">Отправить</button>
    </form>
  `;
  document.body.appendChild(messageBox);

  cat.addEventListener("click", () => {
    messageBox.style.display = "block";
    const form = document.getElementById("contact-form");
    form.style.display = "block";

    form.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById("user-email").value;
      const msg = document.getElementById("user-message").value;

      // Отправка письма (пока имитация)
      alert(`Ваше сообщение отправлено администратору!\nEmail: ${email}\nТекст: ${msg}`);
      form.reset();
      messageBox.style.display = "none";
    };
  });
});
