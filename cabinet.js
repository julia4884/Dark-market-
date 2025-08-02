const API_URL = "https://dark-market-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const nickname = localStorage.getItem("nickname");

  // === Проверка авторизации ===
  if (!token || !role) {
    alert("❌ Вы не авторизованы!");
    window.location.href = "index.html";
    return;
  }

  // === Отображение роли и ника ===
  const userRoleDisplay = document.getElementById("user-role");
  if (role === "admin") {
    userRoleDisplay.innerHTML = `👑 Админ ${nickname || ""}`;
    userRoleDisplay.classList.add("gold-text");
  } else if (role === "developer") {
    userRoleDisplay.innerHTML = `💎 Разработчик ${nickname || ""}`;
    userRoleDisplay.classList.add("blue-text");
  } else {
    userRoleDisplay.innerHTML = `👤 Пользователь ${nickname || ""}`;
    userRoleDisplay.classList.add("dark-text");
  }

  // === Изменение ника ===
  const nicknameForm = document.getElementById("nickname-form");
  nicknameForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const newNick = document.getElementById("nickname-input").value.trim();
    if (!newNick) return alert("Введите ник!");
    localStorage.setItem("nickname", newNick);
    alert("✅ Ник обновлён!");
    location.reload();
  });

  // === Счётчик мяуков / VIP ===
  const meowsDisplay = document.getElementById("meows-count");
  fetch(`${API_URL}/users/meows`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      meowsDisplay.textContent =
        role === "user"
          ? `VIP: ${data.vip || 0}`
          : `Мяуков: ${data.totalMeows || 0}`;
    })
    .catch(() => {
      meowsDisplay.textContent = role === "user" ? "VIP: 0" : "Мяуков: 0";
    });
});
