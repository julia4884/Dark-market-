// Используем API_URL из config.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // чтобы страница не перезагружалась

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

            if (response.ok) {
                alert("✅ Регистрация успешна!");
                console.log("Ответ от сервера:", data);
            } else {
                alert("🚨 Ошибка: " + (data.error || "Неизвестная ошибка"));
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            alert("⚠️ Не удалось связаться с сервером");
        }
    });
});
