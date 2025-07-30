// script.js

document.addEventListener("DOMContentLoaded", () => {
    // ---------- Форма регистрации ----------
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const username = document.getElementById("username").value.trim();
            const messageDiv = document.getElementById("registerMessage");

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, username }),
                });

                const data = await response.json();
                if (response.ok) {
                    messageDiv.textContent = "✅ Регистрация успешна!";
                    messageDiv.style.color = "green";
                } else {
                    messageDiv.textContent = `❌ Ошибка: ${data.error || "Неизвестная ошибка"}`;
                    messageDiv.style.color = "red";
                }
            } catch (error) {
                console.error("Ошибка при регистрации:", error);
                messageDiv.textContent = "⚠️ Ошибка соединения с сервером";
                messageDiv.style.color = "orange";
            }
        });
    }

    // ---------- Форма логина ----------
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value.trim();
            const messageDiv = document.getElementById("loginMessage");

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok) {
                    messageDiv.textContent = `✅ Добро пожаловать, ${data.username || "пользователь"}!`;
                    messageDiv.style.color = "green";
                } else {
                    messageDiv.textContent = `❌ Ошибка: ${data.error || "Неверные данные"}`;
                    messageDiv.style.color = "red";
                }
            } catch (error) {
                console.error("Ошибка при логине:", error);
                messageDiv.textContent = "⚠️ Ошибка соединения с сервером";
                messageDiv.style.color = "orange";
            }
        });
    }
});
