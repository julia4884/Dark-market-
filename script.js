document.addEventListener("DOMContentLoaded", () => {
  // === Проверка токена и загрузка профиля ===
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    fetch("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(user => {
        if (user.error) {
          console.error(user.error);
          return;
        }

        // Отображение аватара
        const header = document.querySelector("header");
        const avatar = document.createElement("img");
        avatar.src = user.avatar || "uploads/avatars/default.png";
        avatar.alt = "Аватар";
        avatar.className = "avatar";
        header.appendChild(avatar);

        // Коронка у админа
        if (user.role === "admin") {
          const crown = document.createElement("span");
          crown.textContent = "👑";
          crown.className = "admin-crown";
          header.appendChild(crown);
        }
      })
      .catch(err => console.error("Ошибка профиля:", err));
  }

  // === Галерея ===
  const category = window.location.pathname.split("/").pop().replace(".html", "") || "home";
  const title = document.getElementById("page-title");
  if (title) {
    title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  }
  loadGallery(category);

  // === Мышь ===
  const bat = document.createElement("div");
  bat.id = "flying-bat";
  bat.textContent = "🦇";
  document.body.appendChild(bat);

  const messages = [
    "Я хранитель тьмы 👀",
    "Ты не один здесь...",
    "Тишина такая... слишком тихо",
    "Шевелись быстрее, смертный!",
    "Где твоя коронка? 👑",
    "Мяу? Нет, я летучая мышь 🦇"
  ];

  function moveBat() {
    const x = Math.random() * (window.innerWidth - 50);
    const y = Math.random() * (window.innerHeight - 50);
    bat.style.left = `${x}px`;
    bat.style.top = `${y}px`;
  }
  setInterval(moveBat, 5000);

  bat.addEventListener("click", () => {
    const message = messages[Math.floor(Math.random() * messages.length)];
    alert(message);

    // Писк через Web Audio API
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(), 150);
  });

  // === Кошка ===
  const catWidget = document.getElementById("cat-widget");
  const catDialog = document.getElementById("cat-dialog");
  const contactFormContainer = document.getElementById("contact-form-container");
  const contactForm = document.getElementById("contact-form");

  if (catWidget) {
    catWidget.addEventListener("click", () => {
      contactFormContainer.style.display =
        contactFormContainer.style.display === "none" ? "block" : "none";
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const textarea = contactForm.querySelector("textarea");
      const message = textarea.value;

      try {
        const response = await fetch("/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "user@site.com", message }),
        });

        const data = await response.json();
        if (data.success) {
          alert("Сообщение отправлено!");
          textarea.value = "";
          contactFormContainer.style.display = "none";
        } else {
          alert(data.error || "Ошибка при отправке");
        }
      } catch (err) {
        console.error("Ошибка:", err);
        alert("Не удалось отправить сообщение");
      }
    });
  }
});

// === Загрузка галереи ===
function loadGallery(category) {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;
  gallery.innerHTML = `<div class="card"><p>Здесь будут материалы категории: ${category}</p></div>`;
}
