async function loadHeader() {
  const res = await fetch("header.html");
  const headerHTML = await res.text();
  document.getElementById("header-placeholder").innerHTML = headerHTML;
}
document.addEventListener("DOMContentLoaded", loadHeader);
