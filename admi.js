const API_URL = "https://dark-market-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    alert("❌ Доступ запрещён! Войдите как администратор.");
    window.location.href = "index.html";
    return;
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
        alert("Ошибка: " + (data.error || "Не удалось загрузить"));
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
        alert("Ошибка: " + (data.error || "Не удалось загрузить"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });

  // === Загрузка списка файлов ===
  async function loadFiles() {
    try {
      const res = await fetch(`${API_URL}/admin/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const files = await res.json();
      const list = document.getElementById("file-list");
      if (!files.length) {
        list.innerHTML = "<li>Файлов пока нет.</li>";
      } else {
        list.innerHTML = files
          .map(f => `<li><a href="${API_URL}/${f.path}" target="_blank">${f.name}</a></li>`)
          .join("");
      }
    } catch {
      console.log("Не удалось загрузить список файлов");
    }
  }

  loadFiles();

  // === Панель управления кошкой и мышкой ===
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const messagesWindow = document.getElementById("messages-window");

  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    try {
      const res = await fetch(`${API_URL}/admin/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.success) {
        const newMsg = document.createElement("p");
        newMsg.textContent = message;
        messagesWindow.appendChild(newMsg);
        chatInput.value = "";
      } else {
        alert("Ошибка: " + (data.error || "не удалось отправить"));
      }
    } catch {
      alert("❌ Сервер недоступен");
    }
  });
});
