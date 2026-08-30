(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem("ba-theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("ba-theme", next);
  });

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
