const API_URL = "https://dark-market-backend.onrender.com"; // замени на свой backend

// Храним токен
let token = localStorage.getItem("token") || null;
let userRole = localStorage.getItem("role") || "user";

// ================== AUTH ==================
async function register(email, password, username) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username })
  });
  return res.json();
}

async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    localStorage.setItem("token", token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", data.username);
    window.location.href = "home.html"; // переброс в личный кабинет
  } else {
    alert(data.error || "Ошибка входа");
  }
}

// ================== PROFILE ==================
async function loadProfile() {
  if (!token) return;
  const res = await fetch(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await res.json();
  document.getElementById("profile-username").innerText = user.username;
  document.getElementById("profile-role").innerText = user.role;
  document.getElementById("profile-about").innerText = user.about || "Нет информации";

  if (user.avatar) {
    document.getElementById("profile-avatar").src = `${API_URL}/uploads/${user.avatar}`;
  }
}

// Загрузка аватара
async function uploadAvatar(file) {
  if (!token) return alert("Сначала войдите!");
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API_URL}/upload-avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (data.success) {
    alert("Аватар обновлён!");
    loadProfile();
  } else {
    alert("Ошибка загрузки аватара");
  }
}

// Обновить "о себе"
async function updateAbout(text) {
  const res = await fetch(`${API_URL}/about-me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ about: text })
  });
  const data = await res.json();
  if (data.success) {
    alert("Информация обновлена!");
    loadProfile();
  }
}

// ================== FILE UPLOAD ==================
async function uploadFile(file, section) {
  if (!token) return alert("Сначала войдите!");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", section);

  const progressBar = document.getElementById("upload-progress");
  progressBar.style.display = "block";
  progressBar.value = 0;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_URL}/upload-file`, true);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.value = percent;
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      alert("Файл загружен!");
      loadGallery(section);
    } else {
      alert("Ошибка загрузки");
    }
    progressBar.style.display = "none";
  };

  xhr.send(formData);
}

// ================== GALLERY ==================
async function loadGallery(section) {
  const res = await fetch(`${API_URL}/my-files`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const files = await res.json();
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  files.filter(f => f.section === section && f.blocked === 0).forEach(f => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p>${f.filename}</p>
      <a href="${API_URL}/uploads/${f.filename}" target="_blank">Скачать</a>
    `;
    gallery.appendChild(div);
  });
}

// ================== ADMIN FUNCTIONS ==================
async function blockUser(userId, reason) {
  if (userRole !== "admin") return alert("Нет доступа");
  const res = await fetch(`${API_URL}/block-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId, reason })
  });
  const data = await res.json();
  alert(data.success ? "Пользователь заблокирован" : "Ошибка");
}

async function blockApp(fileId) {
  if (userRole !== "admin") return alert("Нет доступа");
  const res = await fetch(`${API_URL}/block-app`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ fileId })
  });
  const data = await res.json();
  alert(data.success ? "Приложение заблокировано" : "Ошибка");
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("profile-username")) {
    loadProfile();
  }
});
