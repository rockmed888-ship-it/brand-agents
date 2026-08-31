(() => {
  const WIN =
    "https://github.com/rockmed888-ship-it/brand-agents/releases/download/click-1/DaleRaySetup.exe";
  const PATCH_APK = "https://rockmed888-ship-it.github.io/brand-agents/releases/DD.apk";
  const BEEDEE_APK = "https://rockmed888-ship-it.github.io/brand-agents/releases/BeeDee.apk";

  const APPS = [
    {
      id: "patch-win",
      name: "Brand Agents for Windows",
      kind: "Windows · Patch on the desk",
      blurb: "Install Brand Agents. In the app choose Patch, BeeDee, or describe anyone. They click. You stay on Send.",
      art: "assets/store/tile-patch.jpg",
      cover: "assets/store/hero-patch.jpg",
      get: WIN,
      getLabel: "Get",
      more: "download.html#windows",
      code: '#BrandAgents Window "Brand Agents" Invoke',
    },
    {
      id: "patch-phone",
      name: "Patch",
      kind: "Android · app named DD",
      blurb: "Boy pet. Dark fox, orange scarf, 3D toy. File is DD.apk. Overlay, Hands, Accessibility DD, Start DD.",
      art: "assets/body/patch-face.jpg",
      cover: "assets/body/patch-face.jpg",
      get: PATCH_APK,
      getLabel: "Get",
      more: "dd.html",
      code: '#DD Overlay "Start DD" Invoke',
    },
    {
      id: "beedee-phone",
      name: "BeeDee",
      kind: "Android · app named BeeDee",
      blurb: "Girl pet. White fox, pink dress, 3D toy. Overlay, Hands, Accessibility BeeDee, Start BeeDee.",
      art: "assets/body/beedee-face.webp",
      cover: "assets/body/beedee-face.webp",
      get: BEEDEE_APK,
      getLabel: "Get",
      more: "beedee.html",
      code: '#BeeDee Overlay "Start BeeDee" Invoke',
    },
    {
      id: "trial",
      name: "Start trial",
      kind: "Server URL · Grok connector",
      blurb: "Phone APK is free. The trial is the Grok Server URL. After unlock, copy it and paste in Grok as Brand Agents.",
      art: "assets/store/mica.jpg",
      cover: "assets/store/mica.jpg",
      get: "connect.html",
      getLabel: "Start trial",
      more: "connect.html",
      code: "Name: Brand Agents",
    },
    {
      id: "how",
      name: "How it works",
      kind: "One path",
      blurb: "Explore → Trial → Get the app → Choose pet in the app → Save → copy connector → paste in Grok → reload. The pet shows.",
      art: "assets/store/click.jpg",
      cover: "assets/store/click.jpg",
      get: "how-it-works.html",
      getLabel: "Read the path",
      more: "how-it-works.html",
      code: "Explore → Trial → Get → App",
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

  document.querySelectorAll("[data-app]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
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
      const get = document.querySelector(".store-hero .btn-get") || document.querySelector(".product-id .btn-get");
      embodiedTo(get);
    });
  }

  window.BrandStore = { APPS, openSheet, embodiedTo };
})();
