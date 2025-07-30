// Используем API_URL из config.js
document.addEventListener("DOMContentLoaded", () => {
    // Регистрация
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const username = document.getElementById("username").value;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, username }),
                });

                const data = await response.json();
                if (response.ok) {
                    document.getElementById("registerMessage").innerText =
                        "✅ Регистрация прошла успешно!";
                } else {
                    document.getElementById("registerMessage").innerText =
                        `❌ Ошибка: ${data.error || "Неизвестная ошибка"}`;
                }
            } catch (error) {
                document.getElementById("registerMessage").innerText =
                    "⚠️ Ошибка соединения с сервером.";
            }
        });
    }

    // Вход
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok) {
                    document.getElementById("loginMessage").innerText =
                        "✅ Вход выполнен!";
                    // редирект через 1.5 сек
                    setTimeout(() => {
                        window.location.href = "home.html";
                    }, 1500);
                } else {
                    document.getElementById("loginMessage").innerText =
                        `❌ Ошибка: ${data.error || "Неверный логин или пароль"}`;
                }
            } catch (error) {
                document.getElementById("loginMessage").innerText =
                    "⚠️ Ошибка соединения с сервером.";
            }
        });
    }
});
