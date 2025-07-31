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

  // === Летучая мышь 🦇 ===
  const bat = document.createElement("div");
  bat.id = "flying-bat";
  bat.textContent = "🦇";
  document.body.appendChild(bat);

  const messages = [
    "Я лечу за тобой!",
    "Ты видел мою пещеру?",
    "Секреты скрыты в тени...",
    "Хочешь подарок?",
    "Кликни меня — и будет сюрприз!",
    "Кто не боится тьмы, тот мой друг.",
  ];

  function moveBat() {
    const x = Math.random() * (window.innerWidth - 50);
    const y = Math.random() * (window.innerHeight - 50);
    bat.style.transform = `translate(${x}px, ${y}px)`;
  }

  // плавные перелёты
  bat.style.position = "fixed";
  bat.style.transition = "transform 1.5s ease-in-out";
  moveBat();
  setInterval(moveBat, 5000);

  // писк + сообщение
  bat.addEventListener("click", () => {
    // звук через Web Audio API
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);

    // текстовое сообщение
    const msg = document.createElement("div");
    msg.className = "bat-message";
    msg.textContent =
      messages[Math.floor(Math.random() * messages.length)];
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
  });

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
