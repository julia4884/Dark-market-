const API_URL = "https://dark-market-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    alert("❌ Доступ запрещён!");
    window.location.href = "index.html";
    return;
  }

  // === Блок информации для админа ===
  const adminInfo = document.getElementById("admin-info");
  if (adminInfo) {
    adminInfo.innerHTML = `
      <p><strong>Ваш Email:</strong> juliaangelss26@gmail.com 👑</p>
      <p>У вас полный доступ к панели управления.</p>
    `;
  }

  // === Загрузка аватара ===
  const avatarForm = document.getElementById("avatar-form");
  avatarForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const avatarInput = document.getElementById("avatar-upload");
    if (!avatarInput.files.length) return alert("Выберите картинку!");

    const formData = new FormData();
    formData.append("avatar", avatarInput.files[0]);

    try {
      const res = await fetch(`${API_URL}/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Аватар обновлён!");
        location.reload();
      } else {
        alert("Ошибка: " + (data.error || "не удалось загрузить"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });

  // === Загрузка файлов ===
  const fileForm = document.getElementById("file-form");
  fileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("file-upload");
    if (!fileInput.files.length) return alert("Выберите файл!");

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const res = await fetch(`${API_URL}/upload-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Файл загружен!");
        loadFiles();
      } else {
        alert("Ошибка: " + (data.error || "не удалось загрузить"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });

  // === Список файлов ===
  async function loadFiles() {
    try {
      const res = await fetch(`${API_URL}/admin/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const files = await res.json();
      const list = document.getElementById("file-list");
      list.innerHTML = files.length
        ? files.map(f => `<li><a href="${API_URL}/${f.path}" target="_blank">${f.name}</a></li>`).join("")
        : "<li>Нет загруженных файлов.</li>";
    } catch {
      console.log("Не удалось загрузить список файлов");
    }
  }
  loadFiles();

  // === Кошка 🐈‍⬛ ===
  const catWidget = document.getElementById("cat-widget");
  const contactFormContainer = document.getElementById("contact-form-container");
  const contactForm = document.getElementById("contact-form");
  const closeContact = document.getElementById("close-contact");

  catWidget?.addEventListener("click", () => {
    contactFormContainer.style.display =
      contactFormContainer.style.display === "block" ? "none" : "block";
  });

  closeContact?.addEventListener("click", () => {
    contactFormContainer.style.display = "none";
  });

  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("contact-email").value.trim();
    const message = document.getElementById("contact-message").value.trim();
    if (!email || !message) return alert("Заполните все поля!");

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      const data = await res.json();
      alert(data.success ? "Сообщение отправлено!" : "Ошибка: " + data.error);
      if (data.success) contactFormContainer.style.display = "none";
    } catch {
      alert("❌ Сервер недоступен");
    }
  });

  // === Летучая мышь 🦇 ===
  const bat = document.getElementById("flying-bat");
  const batMessage = document.getElementById("bat-message");

  bat?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_URL}/messages/bat`);
      const data = await res.json();
      batMessage.textContent = data.message || "🦇 Нет сообщений";
      batMessage.style.display = "block";
      setTimeout(() => (batMessage.style.display = "none"), 4000);
    } catch {
      alert("❌ Не удалось получить сообщение от мыши");
    }
  });
});
