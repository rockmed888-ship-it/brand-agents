/**
 * Choose your click — Dale, DD, BeeDee.
 * Each body works on computer or phone. User names them.
 * Funny task loops: 3D Mixamo clips or overlay sprite rows.
 */
const AGENTS = [
  {
    id: "dale",
    title: "Dale",
    kind: "Desk body",
    file: "./assets/body/dale-ray.glb",
    kind3d: true,
    suggested: "Dale",
    getWin: "https://github.com/rockmed888-ship-it/brand-agents/releases/download/click-1/DaleRaySetup.exe",
    getPhone: "releases/DD.apk",
    clips: [
      { names: ["Talking"], line: "Dictating the boring part" },
      { names: ["Pointing"], line: "That button. That one." },
      { names: ["Waving", "wave"], line: "Done. Your mouse is still yours." },
      { names: ["Rapping"], line: "Status report, with rhythm" },
      { names: ["Strut Walking"], line: "Walking over to the app" },
      { names: ["Flying"], line: "Skipping the loading screen" },
      { names: ["mixamo.com", "Floating", "idle"], line: "On the desk. Waiting." },
    ],
  },
  {
    id: "dd",
    title: "DD",
    kind: "Phone overlay · also desk",
    sheet: "./assets/body/dd-spritesheet.webp",
    suggested: "DD",
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
    kind: "Phone overlay · also desk",
    sheet: "./assets/body/beedee-spritesheet.webp",
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

async function playDale(canvas, agent) {
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 80);
  camera.position.set(0, 1.12, 4.2);
  scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x141820, 1.35));
  const key = new THREE.DirectionalLight(0xfff6e8, 2.4);
  key.position.set(2.4, 4.2, 3.2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4f8cff, 0.9);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
  const gltf = await new Promise((resolve, reject) => {
    new GLTFLoader().load(agent.file, resolve, undefined, reject);
  });
  const model = gltf.scene;
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.scale.setScalar(1.55 / Math.max(size.x, size.y, size.z, 0.001));
  const scaled = new THREE.Box3().setFromObject(model);
  const center = scaled.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -scaled.min.y, -center.z);
  scene.add(model);
  const mixer = new THREE.AnimationMixer(model);
  const clips = gltf.animations || [];
  const clock = new THREE.Clock();
  let clipI = 0;
  let line = agent.clips[0].line;
  let nextAt = 0;
  function playClip() {
    const spec = agent.clips[clipI % agent.clips.length];
    clipI += 1;
    const clip =
      clips.find((c) => spec.names.some((n) => c.name.toLowerCase() === n.toLowerCase())) ||
      clips.find((c) => spec.names.some((n) => c.name.toLowerCase().includes(n.toLowerCase()))) ||
      clips[0];
    if (!clip) return;
    mixer.stopAllAction();
    const action = mixer.clipAction(clip);
    action.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.2).play();
    line = spec.line;
    canvas.dataset.line = line;
    nextAt = performance.now() + 3200;
  }
  playClip();
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const parent = canvas.parentElement;
    const w = Math.max(1, parent.clientWidth);
    const h = Math.max(1, parent.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    mixer.update(clock.getDelta());
    if (performance.now() > nextAt) playClip();
    renderer.render(scene, camera);
  };
  tick();
  return {
    stop() {
      cancelAnimationFrame(raf);
      renderer.dispose();
    },
    line() {
      return canvas.dataset.line || line;
    },
  };
}

function mountCard(el, agent, saved) {
  const name = saved?.name || agent.suggested;
  const device = saved?.device || (agent.id === "dale" ? "computer" : "phone");
  el.innerHTML = `
    <div class="vitrine-stage">
      <canvas></canvas>
      <p class="task-line" data-task>${agent.kind}</p>
    </div>
    <div class="vitrine-meta">
      <p class="choose-hint">${agent.kind}</p>
      <h3>${agent.title}</h3>
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
  el.querySelector("[data-save]").addEventListener("click", () => {
    const all = loadAll();
    const n = (nameInput.value || agent.suggested).trim().slice(0, 24);
    all[agent.id] = { name: n, device: deviceNow, body: agent.id, at: Date.now() };
    saveAll(all);
    savedEl.textContent = `${n} · ${deviceNow}`;
    nameInput.value = n;
  });
  if (saved?.name) savedEl.textContent = `${saved.name} · ${saved.device}`;

  const boot = agent.kind3d
    ? playDale(canvas, agent)
    : loadImage(agent.sheet).then((img) => playSprite(canvas, img, agent.tasks));

  boot.then((player) => {
    const tickLine = () => {
      if (taskEl) taskEl.textContent = player.line();
    };
    tickLine();
    setInterval(tickLine, 400);
  }).catch((err) => {
    if (taskEl) taskEl.textContent = err.message || "Body failed to load";
  });
}

function mountChooser(root) {
  if (!root) return;
  const saved = loadAll();
  root.innerHTML = AGENTS.map((a) => `<article class="vitrine" data-agent="${a.id}"></article>`).join("");
  root.querySelectorAll(".vitrine").forEach((el) => {
    const agent = AGENTS.find((a) => a.id === el.getAttribute("data-agent"));
    mountCard(el, agent, saved[agent.id]);
  });
}

const root = document.querySelector("[data-choose-show]");
if (root) mountChooser(root);
