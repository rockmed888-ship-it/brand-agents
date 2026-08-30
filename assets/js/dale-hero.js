/**
 * Dale Ray body on the marketing site.
 * Same GLB as the Windows desktop agent (~4.94 MB).
 * 3D loads only on click so the page first-paints without the file.
 */
const BODY = "./assets/body/dale-ray.glb";

export function mountDaleHero(canvas, statusEl, opts = {}) {
  const btn = opts.button || null;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  async function boot() {
    if (btn) btn.hidden = true;
    canvas.hidden = false;
    setStatus("Loading Dale Ray…");

    const THREE = await import("three");
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");

    const STATE_CLIPS = {
      idle: ["mixamo.com", "Floating", "idle", "breath", "stand"],
      wave: ["Waving", "wave", "Big_Wave_Hello", "Agree_Gesture"],
    };

    function findClip(clips, terms) {
      const lower = terms.map((t) => t.toLowerCase());
      return (
        clips.find((c) => lower.some((t) => c.name.toLowerCase() === t)) ||
        clips.find((c) => lower.some((t) => c.name.toLowerCase().includes(t))) ||
        clips[0] ||
        null
      );
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 100);
    camera.position.set(0, 1.2, 4.6);
    scene.add(new THREE.HemisphereLight(0xddeeff, 0x1a2233, 1.55));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(2.2, 4.2, 3.0);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x99bbff, 0.75);
    fill.position.set(-2.5, 1.8, -1.5);
    scene.add(fill);

    const clock = new THREE.Clock();
    let model = null;
    let mixer = null;
    let clips = [];
    let activeAction = null;
    let modelBaseY = 0;

    function resize() {
      const parent = canvas.parentElement || canvas;
      const width = Math.max(1, parent.clientWidth || 320);
      const height = Math.max(1, parent.clientHeight || 420);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function setState(state) {
      if (!mixer || !clips.length) return;
      const clip = findClip(clips, STATE_CLIPS[state] || STATE_CLIPS.idle);
      if (!clip) return;
      const action = mixer.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.setEffectiveTimeScale(state === "idle" ? 0.45 : 1);
      if (activeAction && activeAction !== action) activeAction.fadeOut(0.2);
      action.fadeIn(0.2).play();
      activeAction = action;
      setStatus(state === "idle" ? "Dale Ray · on the desk" : state);
    }

    function frame() {
      requestAnimationFrame(frame);
      resize();
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      if (model) {
        model.rotation.y += delta * 0.12;
        model.position.y = modelBaseY + Math.sin(performance.now() / 1400) * 0.02;
      }
      renderer.render(scene, camera);
    }

    const loader = new GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        BODY,
        resolve,
        (ev) => {
          if (ev.total) setStatus(`Loading Dale Ray ${Math.round((ev.loaded / ev.total) * 100)}%`);
        },
        reject
      );
    });
    model = gltf.scene;
    clips = gltf.animations || [];
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    model.scale.setScalar(1.45 / maxDim);
    const scaled = new THREE.Box3().setFromObject(model);
    const center = scaled.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.y -= scaled.min.y;
    model.position.z -= center.z;
    modelBaseY = model.position.y;
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    setState("idle");
    canvas.addEventListener("click", () => {
      setState("wave");
      setTimeout(() => setState("idle"), 2200);
    });
    frame();
  }

  setStatus("Click to load 3D");
  if (btn) {
    btn.addEventListener("click", () => {
      boot().catch((err) => {
        console.error(err);
        setStatus("3D body not on this host — install Dale Ray on Windows");
        if (btn) {
          btn.hidden = false;
          btn.textContent = "3D unavailable — get Dale Ray";
        }
      });
    });
    return;
  }
  boot().catch((err) => {
    console.error(err);
    setStatus("Dale Ray body failed to load");
  });
}

const canvas = document.getElementById("daleCanvas");
const statusEl = document.getElementById("daleStatus");
const btn = document.getElementById("daleLoadBtn");
if (canvas) mountDaleHero(canvas, statusEl, { button: btn });
