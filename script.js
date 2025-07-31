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
          localStorage.setItem("userEmail", user.email || "");
        }
      })
      .catch(() => console.warn("Не удалось загрузить профиль"));
  }

  // === Галерея ===
  const category =
    window.location.pathname.split("/").pop().replace(".html", "") || "books";
  const gallery = document.getElementById("gallery");
  if (gallery && typeof loadGallery === "function") loadGallery(category);

  // === Летающая мышь 🦇 ===
  const bat = document.createElement("div");
  bat.className = "flying-bat";
  bat.textContent = "🦇";
  document.body.appendChild(bat);

  const batMessages = [
    "Я лечу за тобой!",
    "Ты видел мою тень?",
    "Секреты скрыты в тени...",
    "Кликни меня — и будет сюрприз!",
    "Темнота любит тебя...",
    "Мяу... ой, я же мышь!"
  ];

  function moveBat() {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    bat.style.left = `${x}px`;
    bat.style.top = `${y}px`;
  }

  function showBatMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "bat-message";
    bubble.textContent = text;
    document.body.appendChild(bubble);

    bubble.style.left = `${bat.offsetLeft}px`;
    bubble.style.top = `${bat.offsetTop - 30}px`;

    setTimeout(() => bubble.remove(), 3000);
  }

  bat.addEventListener("click", () => {
    const msg = batMessages[Math.floor(Math.random() * batMessages.length)];
    showBatMessage(msg);
  });

  setInterval(moveBat, 4000);
  moveBat();

  // === Кошка 🐱 ===
  const cat = document.createElement("div");
  cat.id = "cat-widget";
  cat.textContent = "🐱";
  document.body.appendChild(cat);

  const formContainer = document.createElement("div");
  formContainer.id = "contact-form-container";
  formContainer.style.display = "none";
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

    try {
      const res = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      const data = await res.json();
      alert(data.success ? "Сообщение отправлено!" : "Ошибка: " + data.error);
      if (data.success) document.getElementById("contact-message").value = "";
    } catch {
      alert("Не удалось отправить сообщение");
    }
  });
});
