(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const names = JSON.parse(localStorage.getItem("ba-agent-names") || "{}");
  const state = {
    agents: localStorage.getItem("ba-agents") !== "off",
    demo: true,
  };

  function brandChrome(active) {
    const items = [
      ["index.html", "Home"],
      ["index.html#demo", "How they work"],
      ["index.html#uses", "Uses"],
      ["download.html", "Get"],
      ["connect.html", "Buy"],
      ["pricing.html", "Price"],
    ];
    const links = items
      .map(
        ([href, label]) =>
          `<a href="${href}" class="${active === href.split("#")[0] ? "active" : ""}">${label}</a>`
      )
      .join("");
    return `
      <aside class="ba-rail" aria-label="Brand Agents">
        <button type="button" data-rail-open title="Menu" aria-expanded="false">☰</button>
        <a class="rail-ico" href="index.html" title="Home"><img class="mark" src="assets/brand/mark.jpg" alt="" /></a>
        <a class="rail-ico" href="https://grok.com" target="_blank" rel="noopener" title="Open Grok">✦</a>
        <span class="spacer"></span>
        <button type="button" data-theme-toggle title="Light or dark">◐</button>
      </aside>
      <div class="ba-scrim" data-scrim hidden></div>
      <aside class="ba-drawer acrylic-pane" data-drawer>
        <a class="word" href="index.html">
          <img src="assets/brand/mark.jpg" alt="" />
          <span><strong>Brand Agents</strong><span>It clicks. You stay on Send.</span></span>
        </a>
        <nav>${links}</nav>
        <div class="toggles">
          <div class="toggle">Agents on the glass <button type="button" data-tog="agents" class="${state.agents ? "on" : ""}" aria-pressed="${state.agents}"><i></i></button></div>
          <div class="toggle">Play the desk demo <button type="button" data-tog="demo" class="on" aria-pressed="true"><i></i></button></div>
        </div>
        <div class="grok-row" style="margin-top:18px">
          <a class="btn btn-get" href="https://grok.com" target="_blank" rel="noopener">Open Grok</a>
          <a class="btn btn-secondary" href="https://grok.com/connectors" target="_blank" rel="noopener">Connectors</a>
        </div>
      </aside>
      <div class="glass-agent" data-id="a" data-src="patch" hidden>
        <img src="assets/body/patch-face.jpg" alt="" />
        <span class="tag" data-tag>Name this Brand Agent</span>
      </div>
      <div class="glass-agent" data-id="b" data-src="dazzed" hidden>
        <img src="assets/body/dazzed-face.jpg" alt="" />
        <span class="tag" data-tag>Name this Brand Agent</span>
      </div>
      <div class="glass-agent" data-id="c" data-src="beedee" hidden>
        <img src="assets/body/beedee-face.webp" alt="" />
        <span class="tag" data-tag>Name this Brand Agent</span>
      </div>
      <form class="name-pop acrylic-pane" data-name-pop>
        <label>This Brand Agent’s name is yours</label>
        <p class="hint">They ship unnamed. Brand Agents is the product. You name who clicks.</p>
        <input name="n" maxlength="24" placeholder="Type a name" autocomplete="off" />
        <button class="btn btn-get" type="submit">Save on this glass</button>
      </form>
    `;
  }

  const mount = document.getElementById("ba-shell");
  if (mount) {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";
    mount.innerHTML = brandChrome(path);
  }

  const drawer = $("[data-drawer]");
  const scrim = $("[data-scrim]");
  const openBtn = $("[data-rail-open]");
  function setOpen(on) {
    drawer?.classList.toggle("open", on);
    if (scrim) {
      scrim.hidden = !on;
      scrim.classList.toggle("show", on);
    }
    openBtn?.setAttribute("aria-expanded", on ? "true" : "false");
  }
  openBtn?.addEventListener("click", () => setOpen(!drawer.classList.contains("open")));
  scrim?.addEventListener("click", () => setOpen(false));

  function paintNames() {
    $$(".glass-agent").forEach((el) => {
      const id = el.getAttribute("data-id");
      const tag = $("[data-tag]", el);
      const n = names[id];
      if (tag) tag.textContent = n || "Name this Brand Agent";
    });
  }

  function showAgents(on) {
    document.body.classList.toggle("hide-agents", !on);
    $$(".glass-agent").forEach((el) => {
      el.hidden = !on;
    });
    localStorage.setItem("ba-agents", on ? "on" : "off");
  }
  showAgents(state.agents);
  paintNames();

  $$("[data-tog]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-tog");
      const on = !btn.classList.contains("on");
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", String(on));
      if (key === "agents") showAgents(on);
      if (key === "demo" && on) playDemo();
    });
  });

  const pop = $("[data-name-pop]");
  let naming = null;
  $$(".glass-agent").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      naming = el.getAttribute("data-id");
      const r = el.getBoundingClientRect();
      pop.style.left = Math.min(window.innerWidth - 340, Math.max(16, r.left)) + "px";
      pop.style.top = Math.min(window.innerHeight - 200, r.top + 40) + "px";
      pop.classList.add("show");
      const input = $("input", pop);
      input.value = names[naming] || "";
      input.focus();
    });
  });
  pop?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!naming) return;
    names[naming] = $("input", pop).value.trim();
    localStorage.setItem("ba-agent-names", JSON.stringify(names));
    paintNames();
    pop.classList.remove("show");
  });
  document.addEventListener("click", (e) => {
    if (pop && !pop.contains(e.target) && !e.target.closest(".glass-agent")) pop.classList.remove("show");
  });

  const desk = $("[data-desk]");
  const stepBtns = $$("[data-step]");
  let timer;
  function goStep(n) {
    if (!desk) return;
    desk.classList.remove("step-1", "step-2", "step-3");
    desk.classList.add("step-" + n);
    stepBtns.forEach((b) => b.classList.toggle("on", b.getAttribute("data-step") === String(n)));
    const agent = $(`.glass-agent[data-id="${n === 1 ? "a" : n === 2 ? "b" : "c"}"]`);
    agent?.classList.remove("clicking");
    void agent?.offsetWidth;
    agent?.classList.add("clicking");
  }
  function playDemo() {
    let i = 1;
    goStep(1);
    clearInterval(timer);
    timer = setInterval(() => {
      i = i === 3 ? 1 : i + 1;
      goStep(i);
    }, 2800);
  }
  stepBtns.forEach((b) =>
    b.addEventListener("click", () => {
      clearInterval(timer);
      goStep(Number(b.getAttribute("data-step")));
    })
  );
  if (desk) playDemo();

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
