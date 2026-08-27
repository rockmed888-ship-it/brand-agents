(() => {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  const btn = document.querySelector("[data-menu]");
  const links = document.querySelector("[data-nav-links]");
  if (btn && links) {
    btn.addEventListener("click", () => links.classList.toggle("open"));
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
