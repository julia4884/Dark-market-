const API_URL = "https://dark-market-backend.onrender.com";

// === Загрузка профиля ===
async function loadProfile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Необходимо войти в систему!");
      window.location.href = "index.html";
      return;
    }

    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Ошибка авторизации");
    const data = await res.json();

    document.getElementById("profile-username").textContent =
      data.username + (data.role === "admin" ? " 👑" : "");
    document.getElementById("profile-role").textContent = data.role;
    document.getElementById("profile-about").textContent =
      data.about || "Информация не указана";

    document.getElementById("profile-avatar").src =
      `${API_URL}/user-avatar/${data.id}?t=${Date.now()}`;

    if (data.role === "admin") {
      document.getElementById("admin-panel").style.display = "block";
    }
  } catch (err) {
    console.error("Ошибка загрузки профиля:", err);
    alert("Ошибка: нужно войти снова!");
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }
}

// === Загрузка аватара ===
async function uploadAvatar() {
  const file = document.getElementById("avatar-upload").files[0];
  if (!file) return alert("Выберите файл");

  const formData = new FormData();
  formData.append("avatar", file);

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/upload-avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) throw new Error("Ошибка загрузки аватара");

    alert("Аватар обновлён!");
    loadProfile();
  } catch (err) {
    console.error(err);
    alert("Ошибка загрузки");
  }
}

// === Обновление "О себе" ===
async function updateAbout() {
  const about = document.getElementById("about-input").value;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/update-about`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ about })
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("profile-about").textContent = data.about;
      alert("Информация сохранена!");
    } else {
      alert("Ошибка: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Ошибка сохранения");
  }
}

// === Блокировка пользователя ===
async function banUser() {
  const username = document.getElementById("ban-user-input").value;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/ban-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username })
    });

    const data = await res.json();
    if (data.success) {
      alert("Пользователь заблокирован");
    } else {
      alert("Ошибка: " + data.error);
    }
  } catch (err) {
    console.error(err);
  }
}

// === Блокировка приложения ===
async function banApp() {
  const appId = document.getElementById("ban-app-input").value;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/ban-app`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ appId })
    });

    const data = await res.json();
    if (data.success) {
      alert("Приложение заблокировано");
    } else {
      alert("Ошибка: " + data.error);
    }
  } catch (err) {
    console.error(err);
  }
}

// === Навешиваем события ===
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  document.getElementById("upload-avatar-btn").onclick = uploadAvatar;
  document.getElementById("save-about-btn").onclick = updateAbout;
  document.getElementById("ban-user-btn").onclick = banUser;
  document.getElementById("ban-app-btn").onclick = banApp;
});
