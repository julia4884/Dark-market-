// 📌 config.js должен содержать API_URL, например:
// const API_URL = "https://dark-market-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    // --- Регистрация ---
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const username = document.getElementById("username").value;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, username })
                });

                const data = await response.json();
                document.getElementById("registerMessage").innerText = data.success 
                    ? "✅ Регистрация успешна!" 
                    : `❌ Ошибка: ${data.error}`;
            } catch {
                document.getElementById("registerMessage").innerText = "⚠️ Ошибка соединения с сервером.";
            }
        });
    }

    // --- Логин ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (data.success && data.token) {
                    localStorage.setItem("token", data.token);
                    window.location.href = "home.html";
                } else {
                    document.getElementById("loginMessage").innerText = `❌ Ошибка: ${data.error || "Неверный логин/пароль"}`;
                }
            } catch {
                document.getElementById("loginMessage").innerText = "⚠️ Ошибка соединения с сервером.";
            }
        });
    }

    // --- Личный кабинет ---
    if (window.location.pathname.includes("home.html")) {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "index.html";
            return;
        }

        (async () => {
            try {
                const response = await fetch(`${API_URL}/profile`, {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + token }
                });

                const user = await response.json();
                if (user.success) {
                    document.getElementById("nickname").innerText = 
                        user.role === "admin" ? `👑 ${user.username}` : user.username;
                    document.getElementById("status").innerText = user.role;
                    document.getElementById("subscription").innerText = user.subscription ? "✅ Активна" : "❌ Нет";
                    if (user.photo) document.getElementById("profile-photo").src = user.photo;
                    if (user.about) document.getElementById("aboutMe").value = user.about;
                } else {
                    localStorage.removeItem("token");
                    window.location.href = "index.html";
                }
            } catch {
                localStorage.removeItem("token");
                window.location.href = "index.html";
            }
        })();

        // Выход
        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });

        // Сохранение "О себе"
        document.getElementById("saveAboutBtn").addEventListener("click", async () => {
            const about = document.getElementById("aboutMe").value;
            try {
                const response = await fetch(`${API_URL}/profile/update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({ about })
                });
                const data = await response.json();
                alert(data.success ? "✅ Информация сохранена!" : "❌ Ошибка: " + data.error);
            } catch {
                alert("⚠️ Ошибка соединения с сервером.");
            }
        });

        // --- Загрузка фото с прогрессом ---
        document.getElementById("savePhotoBtn").addEventListener("click", async () => {
            const fileInput = document.getElementById("photoUpload");
            if (!fileInput.files.length) return alert("⚠️ Выберите файл!");

            const formData = new FormData();
            formData.append("photo", fileInput.files[0]);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${API_URL}/profile/photo`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + token);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    document.getElementById("uploadProgress").innerText = `Загрузка: ${percent}%`;
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        document.getElementById("profile-photo").src = data.photo;
                        alert("✅ Фото обновлено!");
                    } else {
                        alert("❌ Ошибка: " + data.error);
                    }
                } else {
                    alert("⚠️ Ошибка соединения с сервером.");
                }
            };

            xhr.send(formData);
        });
    }

    // --- Загрузка файлов в галереи (универсально) ---
    const uploadForms = document.querySelectorAll(".uploadForm");
    uploadForms.forEach(form => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const token = localStorage.getItem("token");

            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${API_URL}${form.dataset.endpoint}`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + token);

            const progressEl = form.querySelector(".uploadProgress");
            if (progressEl) {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        progressEl.innerText = `Загрузка: ${percent}%`;
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        alert("✅ Файл загружен!");
                        location.reload();
                    } else {
                        alert("❌ Ошибка: " + data.error);
                    }
                } else {
                    alert("⚠️ Ошибка соединения с сервером.");
                }
            };

            xhr.send(formData);
        });
    });
});
