/**
 * Choose your click — Patch and BeeDee.
 * Each body works on computer or phone. User names them.
 * Funny task loops on overlay sprite rows.
 */
const AGENTS = [
  {
    id: "patch",
    title: "Patch",
    kind: "Click pet · computer or phone",
    sheet: "./assets/body/dd-spritesheet.webp",
    face: "./assets/body/patch-face.jpg",
    suggested: "Patch",
    getWin: "https://github.com/rockmed888-ship-it/brand-agents/releases/download/click-1/DaleRaySetup.exe",
    getPhone: "releases/DD.apk",
    tasks: [
      { row: 0, frames: 6, line: "Watching the screen" },
      { row: 7, frames: 6, line: "On the task" },
      { row: 3, frames: 4, line: "Hey — your turn" },
      { row: 6, frames: 6, line: "Waiting on Send" },
      { row: 8, frames: 6, line: "Checking the work" },
      { row: 4, frames: 5, line: "Got it" },
    ],
  },
  {
    id: "beedee",
    title: "BeeDee",
    kind: "Click pet · computer or phone",
    sheet: "./assets/body/beedee-spritesheet.webp",
    face: "./assets/body/beedee-face.webp",
    suggested: "BeeDee",
    getWin: "https://github.com/rockmed888-ship-it/brand-agents/releases/download/click-1/DaleRaySetup.exe",
    getPhone: "releases/BeeDee.apk",
    tasks: [
      { row: 0, frames: 6, line: "Sparkle-staring at the inbox" },
      { row: 7, frames: 6, line: "Tapping through it" },
      { row: 3, frames: 4, line: "Hi. Your move." },
      { row: 6, frames: 6, line: "Waiting on Send" },
      { row: 8, frames: 6, line: "Reviewing like a critic" },
      { row: 4, frames: 5, line: "Cute. And done." },
    ],
  },
];

const KEY = "ba-choose-click-v2";
const COLS = 8;
const ROWS = 11;

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function savedFor(agent, all) {
  if (all[agent.id]) return all[agent.id];
  if (agent.id === "patch" && all.dd) return { ...all.dd, body: "patch" };
  return null;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function playSprite(canvas, img, tasks) {
  const ctx = canvas.getContext("2d");
  const cellW = img.width / COLS;
  const cellH = img.height / ROWS;
  let taskI = 0;
  let frame = 0;
  let acc = 0;
  let last = performance.now();
  let raf = 0;
  const draw = (now) => {
    raf = requestAnimationFrame(draw);
    const task = tasks[taskI];
    acc += now - last;
    last = now;
    if (acc > 150) {
      acc = 0;
      frame = (frame + 1) % task.frames;
      if (frame === 0) taskI = (taskI + 1) % tasks.length;
    }
    const t = tasks[taskI];
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const scale = Math.min((w * 0.78) / cellW, (h * 0.92) / cellH);
    const dw = cellW * scale;
    const dh = cellH * scale;
    ctx.drawImage(img, t.frames ? frame * cellW : 0, t.row * cellH, cellW, cellH, (w - dw) / 2, h - dh - 8, dw, dh);
    canvas.dataset.line = t.line;
  };
  raf = requestAnimationFrame(draw);
  return {
    stop() {
      cancelAnimationFrame(raf);
    },
    line() {
      return canvas.dataset.line || tasks[0].line;
    },
  };
}

function mountCard(el, agent, saved) {
  const name = saved?.name || agent.suggested;
  const device = saved?.device || (agent.id === "patch" ? "computer" : "phone");
  const face = agent.face
    ? `<img class="vitrine-face" src="${agent.face}" alt="" />`
    : "";
  el.innerHTML = `
    <div class="vitrine-stage">
      <canvas></canvas>
      <p class="task-line" data-task>${agent.kind}</p>
    </div>
    <div class="vitrine-meta">
      <p class="choose-hint">${agent.kind}</p>
      <div class="vitrine-title">
        ${face}
        <h3>${agent.title}</h3>
      </div>
      <label>Your name for them
        <input data-name maxlength="24" value="${name.replace(/"/g, "")}" placeholder="${agent.suggested}" />
      </label>
      <div class="device-pills" role="group" aria-label="Computer or phone">
        <button type="button" data-device="computer" class="${device === "computer" ? "on" : ""}">Computer</button>
        <button type="button" data-device="phone" class="${device === "phone" ? "on" : ""}">Phone</button>
      </div>
      <button type="button" class="btn btn-get" data-save>This is my click</button>
      <p class="choose-saved" data-saved></p>
    </div>`;
  const canvas = el.querySelector("canvas");
  const taskEl = el.querySelector("[data-task]");
  const nameInput = el.querySelector("[data-name]");
  const savedEl = el.querySelector("[data-saved]");
  let deviceNow = device;
  el.querySelectorAll("[data-device]").forEach((btn) => {
    btn.addEventListener("click", () => {
      deviceNow = btn.getAttribute("data-device");
      el.querySelectorAll("[data-device]").forEach((b) => b.classList.toggle("on", b === btn));
    });
  });
  function downloadChosen(all) {
    const agents = {};
    AGENTS.forEach((a) => {
      if (all[a.id]) agents[a.id] = { ...all[a.id], body: a.id };
    });
    const payload = {
      version: 1,
      put: "Drop this in the Brand Agents app console / office/files so the name sticks. Phone: keep this file in Downloads.",
      active: agent.id,
      agents,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "CHOSEN-AGENT.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  el.querySelector("[data-save]").addEventListener("click", () => {
    const all = loadAll();
    const n = (nameInput.value || agent.suggested).trim().slice(0, 24);
    all[agent.id] = { name: n, device: deviceNow, body: agent.id, at: Date.now() };
    if (agent.id === "patch") delete all.dd;
    saveAll(all);
    savedEl.textContent = `${n} · ${deviceNow} · file downloaded`;
    nameInput.value = n;
    downloadChosen(all);
  });
  if (saved?.name) savedEl.textContent = `${saved.name} · ${saved.device}`;

  loadImage(agent.sheet)
    .then((img) => playSprite(canvas, img, agent.tasks))
    .then((player) => {
      const tickLine = () => {
        if (taskEl) taskEl.textContent = player.line();
      };
      tickLine();
      setInterval(tickLine, 400);
    })
    .catch((err) => {
      if (taskEl) taskEl.textContent = err.message || "Body failed to load";
    });
}

function mountChooser(root) {
  if (!root) return;
  const saved = loadAll();
  root.innerHTML = AGENTS.map((a) => `<article class="vitrine" data-agent="${a.id}"></article>`).join("");
  root.querySelectorAll(".vitrine").forEach((el) => {
    const agent = AGENTS.find((a) => a.id === el.getAttribute("data-agent"));
    mountCard(el, agent, savedFor(agent, saved));
  });
}

const root = document.querySelector("[data-choose-show]");
if (root) mountChooser(root);
