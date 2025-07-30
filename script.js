const API_URL = "https://dark-market-backend.onrender.com";

// ========================== АВТОРИЗАЦИЯ ==========================

// Загрузка профиля при входе
async function loadProfile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_URL}/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Ошибка авторизации");

    const data = await res.json();

    document.getElementById("profile-username").textContent = data.username;
    document.getElementById("profile-role").textContent = data.role;
    document.getElementById("profile-about").textContent = data.about || "Не указано";
    if (data.avatarUrl) {
      document.getElementById("profile-avatar").src = `${API_URL}/${data.avatarUrl}`;
    }

    // Сохраняем роль и ник в localStorage
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", data.username);

    // Проверяем — если админ, показываем панель
    if (data.role === "admin") {
      document.getElementById("admin-panel").style.display = "block";
      document.getElementById("crown").innerHTML = "👑";
    }
  } catch (err) {
    console.error(err);
    logout();
  }
}

// Выход
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

// ========================== АВАТАР ==========================

async function uploadAvatar(file) {
  if (!file) return alert("Выберите файл!");
  
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const res = await fetch(`${API_URL}/upload-avatar`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) throw new Error("Ошибка загрузки аватара");

    const data = await res.json();
    document.getElementById("profile-avatar").src = `${API_URL}/${data.path}`;
    alert("Аватар обновлен!");
  } catch (err) {
    console.error(err);
    alert("Не удалось загрузить аватар");
  }
}

// ========================== ОБНОВЛЕНИЕ О СЕБЕ ==========================

async function updateAbout(about) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/update-about`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ about })
    });

    if (!res.ok) throw new Error("Ошибка при обновлении профиля");

    alert("Информация обновлена!");
    document.getElementById("profile-about").textContent = about;
  } catch (err) {
    console.error(err);
    alert("Не удалось обновить информацию");
  }
}

// ========================== ЗАГРУЗКА ФАЙЛОВ ==========================

async function uploadFile(file, section) {
  if (!file) return alert("Выберите файл!");

  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", section);

  const progressBar = document.getElementById("upload-progress");
  progressBar.style.display = "block";
  progressBar.value = 0;

  try {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/upload`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        progressBar.value = percent;
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        alert("Файл успешно загружен!");
        loadGallery(section);
      } else {
        alert("Ошибка при загрузке файла!");
      }
    };

    xhr.send(formData);
  } catch (err) {
    console.error(err);
    alert("Ошибка сети");
  }
}

// ========================== ГАЛЕРЕЯ ==========================

async function loadGallery(section = "images") {
  try {
    const res = await fetch(`${API_URL}/files?section=${section}`);
    const files = await res.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    if (files.length === 0) {
      gallery.innerHTML = "<p>Файлов пока нет.</p>";
      return;
    }

    files.forEach(file => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${API_URL}/${file.path}" alt="${file.name}">
        <p>${file.name}</p>
        ${file.price > 0 
          ? `<button onclick="buyFile(${file.id})">Купить за ${file.price} $</button>` 
          : `<a href="${API_URL}/${file.path}" download>Скачать</a>`}
      `;
      gallery.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// ========================== АДМИН-ПАНЕЛЬ ==========================

async function blockUser(userId, reason) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/block-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId, reason })
    });

    if (!res.ok) throw new Error("Ошибка блокировки");

    alert("Пользователь заблокирован!");
  } catch (err) {
    console.error(err);
    alert("Не удалось заблокировать пользователя");
  }
}

async function blockApp(fileId) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/block-app`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ fileId })
    });

    if (!res.ok) throw new Error("Ошибка блокировки приложения");

    alert("Приложение заблокировано!");
  } catch (err) {
    console.error(err);
    alert("Не удалось заблокировать приложение");
  }
}
