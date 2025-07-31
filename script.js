// ==================== CONFIG ====================
const API_URL = "https://dark-market-backend.onrender.com";

// ==================== AUTH & TOKEN ====================

function getToken() {
  return localStorage.getItem("token");
}

async function verifyToken() {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Invalid token");
    const data = await res.json();
    return data.valid;
  } catch (err) {
    console.warn("Token check failed:", err.message);
    return false;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "index.html";
}

// ==================== PROFILE ====================

async function loadProfile() {
  if (!(await verifyToken())) {
    console.log("Гость: профиль скрыт");
    return;
  }

  const token = getToken();
  try {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Не удалось загрузить профиль");

    const user = await res.json();

    document.getElementById("profile-username").textContent = user.username;
    document.getElementById("profile-role").textContent = user.role;
    document.getElementById("profile-about").value = user.about || "";

    if (user.avatar) {
      document.getElementById("profile-avatar").src = user.avatar;
    }

    if (user.role === "admin") {
      const adminPanel = document.getElementById("admin-panel");
      if (adminPanel) adminPanel.style.display = "block";
      const crown = document.getElementById("crown");
      if (crown) crown.style.display = "inline";
    }
  } catch (err) {
    console.error("Ошибка загрузки профиля:", err);
  }
}

// === Обновление аватара ===
async function uploadAvatar(file) {
  if (!(await verifyToken())) {
    alert("Необходимо войти!");
    return;
  }

  const token = getToken();
  const formData = new FormData();
  formData.append("avatar", file);

  const progressBar = document.getElementById("avatar-progress");
  if (progressBar) progressBar.style.display = "block";

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_URL}/upload-avatar`, true);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable && progressBar) {
      progressBar.value = Math.round((event.loaded / event.total) * 100);
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      alert("Аватар обновлён!");
      loadProfile();
    } else {
      alert("Ошибка загрузки: " + xhr.statusText);
    }
    if (progressBar) progressBar.style.display = "none";
  };

  xhr.send(formData);
}

// === Обновление "о себе" ===
async function updateAbout(text) {
  if (!(await verifyToken())) {
    alert("Необходимо войти!");
    return;
  }

  const token = getToken();
  try {
    const res = await fetch(`${API_URL}/update-about`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ about: text }),
    });
    if (!res.ok) throw new Error("Ошибка обновления");

    alert("Информация обновлена!");
  } catch (err) {
    alert("Ошибка: " + err.message);
  }
}

// ==================== FILE UPLOAD ====================

async function uploadFile(file, category) {
  if (!(await verifyToken())) {
    alert("Только разработчики могут загружать файлы!");
    return;
  }

  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const progressBar = document.getElementById("upload-progress");
  if (progressBar) progressBar.style.display = "block";

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_URL}/upload`, true);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable && progressBar) {
      progressBar.value = Math.round((event.loaded / event.total) * 100);
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      alert("Файл загружен!");
      loadGallery(category);
    } else {
      alert("Ошибка загрузки: " + xhr.statusText);
    }
    if (progressBar) progressBar.style.display = "none";
  };

  xhr.send(formData);
}

// ==================== GALLERY ====================

async function loadGallery(category) {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/files?category=${category}`, { headers });

    if (!res.ok) throw new Error("Ошибка загрузки галереи");

    const files = await res.json();
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    files.forEach((file) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${file.url}" alt="${file.name}">
        <h3>${file.name}</h3>
        ${
          file.price > 0
            ? `<button onclick="buyFile('${file.id}', ${file.price})">Купить (${file.price}€)</button>`
            : `<a href="${file.url}" download><button>Скачать</button></a>`
        }
      `;

      gallery.appendChild(card);
    });
  } catch (err) {
    console.error("Ошибка галереи:", err);
  }
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", async () => {
  const loggedIn = await verifyToken();

  if (document.getElementById("gallery")) {
    const category = window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "") || "home";
    loadGallery(category);
  }

  if (loggedIn) {
    loadProfile();

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.onclick = logout;

    const avatarInput = document.getElementById("avatar-input");
    const avatarBtn = document.getElementById("avatar-upload-btn");
    if (avatarBtn && avatarInput) {
      avatarBtn.onclick = () => {
        const file = avatarInput.files[0];
        if (file) uploadAvatar(file);
      };
    }

    const aboutSaveBtn = document.getElementById("about-save-btn");
    if (aboutSaveBtn) {
      aboutSaveBtn.onclick = () => {
        const aboutText = document.getElementById("profile-about").value;
        updateAbout(aboutText);
      };
    }
  }
});
