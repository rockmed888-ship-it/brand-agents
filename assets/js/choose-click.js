/**
 * Choose your click — pick a free body, name it, save on this phone/PC.
 * One GLB at a time. Dale is the default name.
 */
const BODIES = [
  {
    id: "dale",
    file: "./assets/body/dale-ray.glb",
    hint: "Desk body",
    suggested: "Dale",
  },
  {
    id: "xbot",
    file: "./assets/body/roster/xbot.glb",
    hint: "Street",
    suggested: "",
  },
  {
    id: "soldier",
    file: "./assets/body/roster/soldier.glb",
    hint: "Field",
    suggested: "",
  },
  {
    id: "robot",
    file: "./assets/body/roster/robot.glb",
    hint: "Workshop",
    suggested: "",
  },
];

const KEY = "ba-choose-click";

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null") || {};
  } catch {
    return {};
  }
}

function saveChoice(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

function mountChooser(root) {
  if (!root) return;
  const saved = loadSaved();
  let selected = BODIES.find((b) => b.id === saved.body) || BODIES[0];
  let renderer, scene, camera, mixer, model, clock, frameId, THREE;

  const stage = root.querySelector("[data-choose-canvas]");
  const status = root.querySelector("[data-choose-status]");
  const nameInput = root.querySelector("[data-choose-name]");
  const deviceSel = root.querySelector("[data-choose-device]");
  const saveBtn = root.querySelector("[data-choose-save]");
  const savedLine = root.querySelector("[data-choose-saved]");
  const grid = root.querySelector("[data-choose-grid]");

  grid.innerHTML = BODIES.map(
    (b) =>
      `<button type="button" class="choose-card${b.id === selected.id ? " on" : ""}" data-body="${b.id}">
        <span class="choose-hint">${b.hint}</span>
        <strong>${b.id === "dale" ? "Dale" : "Name this click"}</strong>
      </button>`,
  ).join("");

  nameInput.value = saved.name || selected.suggested || "";
  nameInput.placeholder = selected.id === "dale" ? "Dale" : "Name your click";
  if (deviceSel) deviceSel.value = saved.device || "windows";
  if (saved.name) {
    savedLine.textContent = `${saved.name} · ${saved.device || "windows"} · ${saved.body || "dale"}`;
  }

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function dispose() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    mixer = null;
    model = null;
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
  }

  async function showBody(body) {
    selected = body;
    grid.querySelectorAll(".choose-card").forEach((c) => {
      c.classList.toggle("on", c.getAttribute("data-body") === body.id);
    });
    if (!nameInput.value.trim() || BODIES.some((b) => b.suggested && nameInput.value === b.suggested)) {
      nameInput.value = body.suggested || "";
    }
    nameInput.placeholder = body.id === "dale" ? "Dale" : "Name your click";
    setStatus("Loading body…");
    dispose();
    THREE = THREE || (await import("three"));
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    renderer = new THREE.WebGLRenderer({ canvas: stage, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(28, 1, 0.05, 80);
    camera.position.set(0, 1.15, 4.4);
    scene.add(new THREE.HemisphereLight(0xddeeff, 0x1a2233, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2.2, 4, 3);
    scene.add(key);
    clock = new THREE.Clock();
    const gltf = await new Promise((resolve, reject) => {
      new GLTFLoader().load(body.file, resolve, undefined, reject);
    });
    model = gltf.scene;
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    model.scale.setScalar(1.5 / maxDim);
    const scaled = new THREE.Box3().setFromObject(model);
    const center = scaled.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.y -= scaled.min.y;
    model.position.z -= center.z;
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    const clip = (gltf.animations || [])[0];
    if (clip) mixer.clipAction(clip).play();
    setStatus(body.id === "dale" ? "Dale · on the desk" : "Tap a body. Type a name.");
    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const parent = stage.parentElement;
      const w = Math.max(1, parent.clientWidth);
      const h = Math.max(1, parent.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const d = clock.getDelta();
      if (mixer) mixer.update(d);
      if (model) model.rotation.y += d * 0.35;
      renderer.render(scene, camera);
    };
    tick();
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-body]");
    if (!btn) return;
    const body = BODIES.find((b) => b.id === btn.getAttribute("data-body"));
    if (body) showBody(body).catch((err) => setStatus(err.message || "Could not load body"));
  });

  saveBtn?.addEventListener("click", () => {
    const name = (nameInput.value || selected.suggested || "Dale").trim().slice(0, 24);
    const device = deviceSel?.value || "windows";
    const next = { body: selected.id, name, device, at: Date.now() };
    saveChoice(next);
    nameInput.value = name;
    savedLine.textContent = `${name} is your click on ${device}.`;
    setStatus(`${name} saved on this device`);
  });

  showBody(selected).catch((err) => setStatus(err.message || "Could not load body"));
}

const root = document.getElementById("chooseClick");
if (root) mountChooser(root);
