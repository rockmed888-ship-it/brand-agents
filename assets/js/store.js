(() => {
  const APPS = [
    {
      id: "dale",
      name: "Dale Ray",
      kind: "Windows · desk",
      blurb: "Sits on the desk. Named clicks. You stay on Send.",
      art: "assets/store/tile-dale.jpg",
      cover: "assets/store/hero-dale.jpg",
      get: "https://github.com/rockmed888-ship-it/brand-agents/releases/download/click-1/DaleRaySetup.exe",
      getLabel: "Get",
      more: "download.html",
      code: '#DaleRay Window "Dale Ray" Invoke',
    },
    {
      id: "dd",
      name: "DD",
      kind: "Android · phone",
      blurb: "Overlay on the phone. Grok talks. DD taps.",
      art: "assets/store/tile-dd.jpg",
      cover: "assets/store/tile-dd.jpg",
      get: "releases/DD.apk",
      getLabel: "Get",
      more: "dd.html",
      code: '#DD Overlay "Start DD" Invoke',
    },
    {
      id: "beedee",
      name: "BeeDee",
      kind: "Android · phone",
      blurb: "Same click as DD. Different overlay.",
      art: "assets/store/click.jpg",
      cover: "assets/store/click.jpg",
      get: "releases/BeeDee.apk",
      getLabel: "Get",
      more: "beedee.html",
      code: '#BeeDee Overlay "Start BeeDee" Invoke',
    },
    {
      id: "voice",
      name: "Grok Voice connector",
      kind: "Voice · car · phone",
      blurb: "Name + Server URL only. Same connector for voice and text.",
      art: "assets/store/mica.jpg",
      cover: "assets/store/mica.jpg",
      get: "connect.html",
      getLabel: "Join",
      more: "connect.html",
      code: '#ServerUrl Edit "Server URL" Invoke',
    },
  ];

  document.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("pointermove", (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty("--mx", `${e.clientX - r.left}px`);
      tile.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  const sheet = document.getElementById("storeSheet");
  const sprite = document.getElementById("clickSprite");

  function openSheet(app) {
    if (!sheet || !app) return;
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    sheet.querySelector("[data-sheet-art]").src = app.cover || app.art;
    sheet.querySelector("[data-sheet-name]").textContent = app.name;
    sheet.querySelector("[data-sheet-kind]").textContent = app.kind;
    sheet.querySelector("[data-sheet-blurb]").textContent = app.blurb;
    sheet.querySelector("[data-sheet-code]").textContent = app.code;
    const get = sheet.querySelector("[data-sheet-get]");
    get.href = app.get;
    get.textContent = app.getLabel || "Get";
    sheet.querySelector("[data-sheet-more]").href = app.more;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => embodiedTo(get));
  }

  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("a.btn-get").forEach((a) => {
    a.addEventListener("click", (e) => e.stopPropagation());
  });

  document.querySelectorAll("[data-app]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("a.btn-get") || e.target.closest("[data-watch-click]")) return;
      const app = APPS.find((a) => a.id === el.getAttribute("data-app"));
      openSheet(app);
    });
  });
  sheet?.querySelector("[data-sheet-close]")?.addEventListener("click", closeSheet);
  sheet?.querySelector(".sheet-dim")?.addEventListener("click", closeSheet);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });

  const search = document.querySelector("[data-store-search]");
  if (search) {
    search.addEventListener("input", () => {
      const q = search.value.toLowerCase().trim();
      document.querySelectorAll("[data-app]").forEach((el) => {
        if (el.classList.contains("store-hero")) return;
        const hay = (el.getAttribute("data-search") || "").toLowerCase();
        el.style.display = !q || hay.includes(q) ? "" : "none";
      });
    });
  }

  function embodiedTo(target) {
    if (!sprite || !target) return;
    const r = target.getBoundingClientRect();
    sprite.classList.add("on");
    sprite.style.left = `${r.left + r.width / 2}px`;
    sprite.style.top = `${r.top + r.height / 2}px`;
    setTimeout(() => {
      const rip = document.createElement("span");
      rip.className = "ripple";
      rip.style.left = `${r.width / 2 - 9}px`;
      rip.style.top = `${r.height / 2 - 9}px`;
      target.style.position = "relative";
      target.appendChild(rip);
      setTimeout(() => rip.remove(), 700);
      sprite.classList.remove("on");
    }, 720);
  }

  const demo = document.querySelector("[data-watch-click]");
  if (demo) {
    demo.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const get = document.querySelector(".store-hero .btn-get");
      embodiedTo(get);
    });
  }

  window.BrandStore = { APPS, openSheet, embodiedTo };
})();
