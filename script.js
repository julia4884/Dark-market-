document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // === Загрузка профиля ===
  if (token) {
    fetch("/profile", { headers: { Authorization: "Bearer " + token } })
      .then((res) => res.json())
      .then((user) => {
        if (user.username) {
          const profileEl = document.getElementById("user-profile");
          if (profileEl) {
            profileEl.innerHTML = `
              <img src="/${user.avatar}" alt="avatar" class="avatar">
              <span>${user.username}</span>
              ${role === "admin" ? '<span class="admin-crown">👑</span>' : ""}
            `;
          }

          // Запоминаем email для кошки
          localStorage.setItem("userEmail", user.email || "");
        }
      })
      .catch(() => console.warn("Не удалось загрузить профиль"));
  }

  // === Галерея ===
  const category =
    window.location.pathname.split("/").pop().replace(".html", "") || "books";
  const gallery = document.getElementById("gallery");
  if (gallery) loadGallery(category);

// === Летучая мышь ===
function spawnBat() {
  const bat = document.createElement("div");
  bat.className = "flying-bat";
  bat.innerHTML = "🦇";
  document.body.appendChild(bat);

  const messages = [
    "Я лечу за тобой!",
    "Ты видел мою тень?",
    "Секреты скрыты в тени...",
    "Хочешь подарок?",
    "Кликни меня — и будет сюрприз!",
    "Кто не боится тьмы, тот мой друг.",
  ];

  function moveBat() {
    const x = Math.random() * (window.innerWidth - 50);
    const y = Math.random() * (window.innerHeight - 50);
    bat.style.position = "fixed";
    bat.style.left = `${x}px`;
    bat.style.top = `${y}px`;
    bat.style.transition = "all 1.5s ease-in-out";
  }

  moveBat();
  setInterval(moveBat, 5000);

  bat.addEventListener("click", () => {
    const msg = document.createElement("div");
    msg.className = "bat-message";
    msg.textContent = messages[Math.floor(Math.random() * messages.length)];
    document.body.appendChild(msg);

    const rect = bat.getBoundingClientRect();
    msg.style.left = rect.left + "px";
    msg.style.top = rect.top - 30 + "px";

    setTimeout(() => msg.remove(), 3000);
  });
}

document.addEventListener("DOMContentLoaded", spawnBat);

  // === Кошка 🐱 ===
  const catWidget = document.getElementById("cat-widget");
  const formContainer = document.getElementById("contact-form-container");
  if (catWidget && formContainer) {
    catWidget.addEventListener("click", () => {
      formContainer.style.display =
        formContainer.style.display === "none" ? "block" : "none";
    });

    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const textarea = contactForm.querySelector("textarea");
        const userEmail = localStorage.getItem("userEmail") || "user@site.com";

        try {
          const res = await fetch("/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, message: textarea.value }),
          });

          const data = await res.json();
          alert(data.success ? "Сообщение отправлено!" : "Ошибка: " + data.error);
          if (data.success) textarea.value = "";
        } catch {
          alert("Не удалось отправить сообщение");
        }
      });
    }
  }
});
// === Летающая мышь 🦇 ===
document.addEventListener("DOMContentLoaded", () => {
  const bat = document.createElement("div");
  bat.className = "flying-bat";
  document.body.appendChild(bat);

  const messages = [
    "Привет, смертный!",
    "Хочешь секрет? 🦇",
    "Мяу... ой, я же мышь!",
    "Темнота любит тебя...",
    "Лови момент, пока я тут!"
  ];

  function moveBat() {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    bat.style.left = `${x}px`;
    bat.style.top = `${y}px`;
  }

  function showMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "bat-message";
    bubble.textContent = text;
    document.body.appendChild(bubble);

    bubble.style.left = `${bat.offsetLeft}px`;
    bubble.style.top = `${bat.offsetTop - 30}px`;

    setTimeout(() => bubble.remove(), 3000);
  }

  bat.addEventListener("click", () => {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    showMessage(msg);
  });

  setInterval(moveBat, 4000);
  moveBat();
});

// === Кошка-виджет 🐱 ===
document.addEventListener("DOMContentLoaded", () => {
  const cat = document.createElement("div");
  cat.id = "cat-widget";
  cat.textContent = "🐱";
  document.body.appendChild(cat);

  const formContainer = document.createElement("div");
  formContainer.id = "contact-form-container";
  formContainer.innerHTML = `
    <form id="contact-form">
      <h3>Напиши администратору</h3>
      <input type="email" id="contact-email" placeholder="Твой email" required>
      <textarea id="contact-message" placeholder="Сообщение..." required></textarea>
      <button type="submit">Отправить</button>
    </form>
  `;
  document.body.appendChild(formContainer);

  cat.addEventListener("click", () => {
    formContainer.style.display =
      formContainer.style.display === "block" ? "none" : "block";
  });

  document.getElementById("contact-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("contact-email").value;
    const message = document.getElementById("contact-message").value;

    const res = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });

    const data = await res.json();
    alert(data.success ? "Сообщение отправлено!" : "Ошибка: " + data.error);
  });
});
