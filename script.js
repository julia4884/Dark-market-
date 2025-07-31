// === Загрузка галереи ===
async function loadGallery(category) {
  try {
    const res = await fetch(`/uploads/${category}`);
    if (!res.ok) throw new Error("Ошибка загрузки галереи");
    const files = await res.json();

    const gallery = document.getElementById("gallery");
    if (!gallery) return;
    gallery.innerHTML = "";

    files.forEach((file) => {
      const card = document.createElement("div");
      card.className = "card";

      const img = document.createElement("img");
      img.src = `/uploads/${category}/${file}`;
      img.alt = file;

      card.appendChild(img);
      gallery.appendChild(card);
    });
  } catch (err) {
    console.error("Ошибка галереи:", err);
  }
}

// === Загрузка файла ===
async function uploadFile(file, category) {
  const formData = new FormData();
  formData.append("file", file);

  const progress = document.getElementById("upload-progress");
  if (progress) progress.style.display = "block";

  try {
    const res = await fetch(`/upload/${category}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Ошибка загрузки файла");
    await res.json();

    if (progress) progress.value = 100;
    alert("Файл загружен!");
    loadGallery(category);
  } catch (err) {
    console.error(err);
    alert("Ошибка при загрузке файла");
  } finally {
    if (progress) setTimeout(() => (progress.style.display = "none"), 1000);
  }
}

// === DOM Ready ===
document.addEventListener("DOMContentLoaded", () => {
  // Определяем категорию
  const category = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "") || "home";

  const titleEl = document.getElementById("page-title");
  if (titleEl) {
    titleEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  }

  // Загружаем галерею
  loadGallery(category);

  // Проверяем роль
  const role = localStorage.getItem("role");
  if (role === "developer" || role === "admin") {
    const uploadSection = document.getElementById("upload-section");
    if (uploadSection) uploadSection.style.display = "block";

    const uploadBtn = document.getElementById("upload-btn");
    if (uploadBtn) {
      uploadBtn.onclick = () => {
        const file = document.getElementById("file-input").files[0];
        if (file) uploadFile(file, category);
      };
    }
  }

  // === Контактная кошка ===
  const cat = document.getElementById("cat-widget");
  const dialog = document.getElementById("cat-dialog");
  const contactFormContainer = document.getElementById("contact-form-container");

  if (cat) {
    const messages = [
      "Привет! 👋",
      "Есть вопросы? Пиши!",
      "Не стесняйся нажать!",
      "Я передам твоё сообщение админу 🐾",
      "Нужна помощь? Жми!"
    ];

    cat.addEventListener("click", () => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      dialog.textContent = randomMsg;
      contactFormContainer.style.display =
        contactFormContainer.style.display === "block" ? "none" : "block";
    });
  }

  // === Форма связи ===
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = contactForm.querySelector("textarea").value.trim();

      if (!message) {
        alert("Введите сообщение!");
        return;
      }

      try {
        const res = await fetch("/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: localStorage.getItem("email") || "user@example.com",
            message,
          }),
        });
        const data = await res.json();

        if (data.success) {
          alert("Сообщение отправлено!");
          contactForm.reset();
          contactFormContainer.style.display = "none";
        } else {
          alert("Ошибка: " + (data.error || "Не удалось отправить"));
        }
      } catch (err) {
        console.error(err);
        alert("Ошибка соединения с сервером.");
      }
    });
  }

  // === PayPal Донат ===
  const donateBtn = document.getElementById("donateButton");
  if (donateBtn) {
    donateBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: "10.00" }),
        });
        const data = await res.json();

        if (data.id) {
          window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${data.id}`;
        } else {
          alert("Ошибка при создании заказа.");
        }
      } catch (err) {
        console.error(err);
        alert("Ошибка соединения с PayPal.");
      }
    });
  }
});
