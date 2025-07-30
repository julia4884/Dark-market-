// 📌 config.js должен содержать API_URL, например:
// const API_URL = "http://localhost:3000";

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

                if (data.success) {
                    document.getElementById("registerMessage").innerText = "✅ Регистрация успешна!";
                } else {
                    document.getElementById("registerMessage").innerText = `❌ Ошибка: ${data.error}`;
                }
            } catch (err) {
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
            } catch (err) {
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
                    document.getElementById("nickname").innerText = user.username;
                    document.getElementById("status").innerText = user.role;
                    document.getElementById("subscription").innerText = user.subscription ? "✅ Активна" : "❌ Нет";
                    if (user.photo) document.getElementById("profile-photo").src = user.photo;
                    if (user.about) document.getElementById("aboutMe").value = user.about;
                } else {
                    localStorage.removeItem("token");
                    window.location.href = "index.html";
                }
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
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
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    body: JSON.stringify({ about })
                });

                const data = await response.json();
                if (data.success) {
                    alert("✅ Информация сохранена!");
                } else {
                    alert("❌ Ошибка сохранения: " + data.error);
                }
            } catch (err) {
                alert("⚠️ Ошибка соединения с сервером.");
            }
        });

        // Загрузка фото
        document.getElementById("savePhotoBtn").addEventListener("click", async () => {
            const fileInput = document.getElementById("photoUpload");
            if (!fileInput.files.length) return alert("⚠️ Выберите файл!");

            const formData = new FormData();
            formData.append("photo", fileInput.files[0]);

            try {
                const response = await fetch(`${API_URL}/profile/photo`, {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    document.getElementById("profile-photo").src = data.photo;
                    alert("✅ Фото обновлено!");
                } else {
                    alert("❌ Ошибка загрузки фото: " + data.error);
                }
            } catch (err) {
                alert("⚠️ Ошибка соединения с сервером.");
            }
        });
    }
});
