/**
 * Explore Patch and BeeDee — starters only.
 * Custom pets are named and described in the Brand Agents app after install.
 */
const AGENTS = [
  {
    id: "patch",
    title: "Patch",
    kind: "Boy pet · 3D toy",
    blurb: "Dark fox, orange scarf. On the phone the app is named DD.",
    sheet: "./assets/body/dd-spritesheet.webp",
    face: "./assets/body/patch-face.jpg",
    getPhone: "https://rockmed888-ship-it.github.io/brand-agents/releases/DD.apk",
    phonePage: "dd.html",
    tasks: [
      { row: 0, frames: 6, line: "Watching the screen" },
      { row: 7, frames: 6, line: "On the task" },
      { row: 3, frames: 4, line: "Your turn" },
      { row: 6, frames: 6, line: "Waiting on Send" },
      { row: 8, frames: 6, line: "Checking the work" },
      { row: 4, frames: 5, line: "Done" },
    ],
  },
  {
    id: "beedee",
    title: "BeeDee",
    kind: "Girl pet · 3D toy",
    blurb: "White fox, pink dress. On the phone the app is named BeeDee.",
    sheet: "./assets/body/beedee-spritesheet.webp",
    face: "./assets/body/beedee-face.webp",
    getPhone: "https://rockmed888-ship-it.github.io/brand-agents/releases/BeeDee.apk",
    phonePage: "beedee.html",
    tasks: [
      { row: 0, frames: 6, line: "Watching the screen" },
      { row: 7, frames: 6, line: "On the task" },
      { row: 3, frames: 4, line: "Your turn" },
      { row: 6, frames: 6, line: "Waiting on Send" },
      { row: 8, frames: 6, line: "Checking the work" },
      { row: 4, frames: 5, line: "Done" },
    ],
  },
];

const COLS = 8;
const ROWS = 11;

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

function mountCard(el, agent) {
  el.innerHTML = `
    <div class="vitrine-stage">
      <canvas></canvas>
      <p class="task-line" data-task>${agent.kind}</p>
    </div>
    <div class="vitrine-meta">
      <p class="choose-hint">${agent.kind}</p>
      <div class="vitrine-title">
        <img class="vitrine-face" src="${agent.face}" alt="" />
        <h3>${agent.title}</h3>
      </div>
      <p class="choose-blurb">${agent.blurb}</p>
      <div class="device-pills" role="group" aria-label="Computer or phone">
        <a href="download.html#windows">Computer</a>
        <a class="on" href="${agent.phonePage}">Phone</a>
      </div>
      <a class="btn btn-get" href="${agent.getPhone}">Get ${agent.title}</a>
      <p class="choose-note">Name and describe in the app after install.</p>
    </div>`;
  const canvas = el.querySelector("canvas");
  const taskEl = el.querySelector("[data-task]");

  loadImage(agent.sheet)
    .then((img) => playSprite(canvas, img, agent.tasks))
    .then((player) => {
      const tickLine = () => {
        if (taskEl) taskEl.textContent = player.line();
      };
      tickLine();
      setInterval(tickLine, 400);
    })
    .catch(() => {
      if (taskEl) taskEl.textContent = agent.kind;
    });
}

function mountChooser(root) {
  if (!root) return;
  root.innerHTML = AGENTS.map((a) => `<article class="vitrine" data-agent="${a.id}"></article>`).join("");
  root.querySelectorAll(".vitrine").forEach((el) => {
    const agent = AGENTS.find((a) => a.id === el.getAttribute("data-agent"));
    mountCard(el, agent);
  });
}

const root = document.querySelector("[data-choose-show]");
if (root) mountChooser(root);
