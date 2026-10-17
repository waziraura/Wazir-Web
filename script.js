
import * as THREE from "three";

const canvas = document.querySelector("#webgl-scene");
const body = document.body;
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const touchDevice = window.matchMedia("(pointer: coarse)").matches;

const state = {
  theme: "space",
  pointerX: 0,
  pointerY: 0,
  targetX: 0,
  targetY: 0
};

let renderer;
let scene;
let camera;
let clock;
let spaceGroup;
let gardenGroup;
let planet;
let planetRing;
let starField;
let flowers;

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

/* ---------- THREE.JS INITIALIZATION ---------- */

function initScene() {
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !touchDevice,
      alpha: false,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, touchDevice ? 1.25 : 1.7)
    );

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene = new THREE.Scene();
    scene.background = new THREE.Color("#08090d");

    camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );

    camera.position.set(0, 0.4, 12);
    clock = new THREE.Clock();

    buildSpace();
    buildGarden();

    gardenGroup.visible = false;

    window.addEventListener("resize", resizeScene);
    window.addEventListener("pointermove", onPointerMove, {
      passive: true
    });

    animate();
    setTheme("space");
  } catch (error) {
    console.error("WebGL scene initialization failed:", error);
    showToast(
      "The 3D scene could not start. The rest of the website is still available."
    );
  }
}

/* ---------- SPACE SCENE ---------- */

function buildSpace() {
  spaceGroup = new THREE.Group();
  scene.add(spaceGroup);

  // Star field
  const count = touchDevice ? 800 : 1700;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 48;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = -Math.random() * 35 - 2;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    color: 0xf4e6c8,
    size: 0.045,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });

  starField = new THREE.Points(starGeometry, starMaterial);
  spaceGroup.add(starField);

  spaceGroup.add(new THREE.AmbientLight(0xaaa5a0, 1.2));

  const goldLight = new THREE.PointLight(0xffd69a, 110, 35, 2);
  goldLight.position.set(-4, 4, 5);
  spaceGroup.add(goldLight);

  const rimLight = new THREE.PointLight(0x9ba7ba, 60, 30, 2);
  rimLight.position.set(5, -1, -1);
  spaceGroup.add(rimLight);

  // Main planet
  const planetGeometry = new THREE.SphereGeometry(
    2.1,
    touchDevice ? 40 : 72,
    touchDevice ? 40 : 72
  );

  const planetMaterial = new THREE.MeshStandardMaterial({
    color: 0xc8a773,
    roughness: 0.9,
    metalness: 0.04
  });

  planet = new THREE.Mesh(planetGeometry, planetMaterial);
  planet.position.set(3.5, 0.25, -1.5);
  spaceGroup.add(planet);

  // Procedural banded surface texture
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 512;
  textureCanvas.height = 256;

  const context = textureCanvas.getContext("2d");
  const bands = context.createLinearGradient(0, 0, 0, 256);

  bands.addColorStop(0, "#493b2a");
  bands.addColorStop(0.17, "#b99a68");
  bands.addColorStop(0.29, "#806547");
  bands.addColorStop(0.44, "#ddc18d");
  bands.addColorStop(0.58, "#8a704f");
  bands.addColorStop(0.73, "#c4a775");
  bands.addColorStop(1, "#41372b");

  context.fillStyle = bands;
  context.fillRect(0, 0, 512, 256);

  for (let i = 0; i < 36; i++) {
    context.globalAlpha = Math.random() * 0.14;
    context.fillStyle = i % 2 ? "#f4dca9" : "#29241e";
    context.fillRect(0, Math.random() * 256, 512, Math.random() * 6 + 1);
  }

  context.globalAlpha = 1;

  const surfaceTexture = new THREE.CanvasTexture(textureCanvas);
  surfaceTexture.colorSpace = THREE.SRGBColorSpace;
  planet.material.map = surfaceTexture;
  planet.material.color.set("#ffffff");
  planet.material.needsUpdate = true;

  // Planet rings
  const ringGeometry = new THREE.RingGeometry(2.55, 3.5, 144);
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9c39a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.68,
    roughness: 0.8,
    depthWrite: false
  });

  planetRing = new THREE.Mesh(ringGeometry, ringMaterial);
  planetRing.position.copy(planet.position);
  planetRing.rotation.x = Math.PI * 0.38;
  planetRing.rotation.y = -0.12;
  spaceGroup.add(planetRing);

  // Distant small planet
  const distantPlanet = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x9a7254,
      roughness: 0.96
    })
  );

  distantPlanet.position.set(-7, 3.1, -8);
  spaceGroup.add(distantPlanet);

  // Soft nebula made as a generated texture, not a blurry filter
  const nebulaCanvas = document.createElement("canvas");
  nebulaCanvas.width = 256;
  nebulaCanvas.height = 256;

  const nebulaContext = nebulaCanvas.getContext("2d");
  const nebulaGradient = nebulaContext.createRadialGradient(
    128, 128, 3, 128, 128, 128
  );

  nebulaGradient.addColorStop(0, "rgba(155,110,62,.22)");
  nebulaGradient.addColorStop(0.5, "rgba(80,60,45,.12)");
  nebulaGradient.addColorStop(1, "rgba(10,10,20,0)");

  nebulaContext.fillStyle = nebulaGradient;
  nebulaContext.fillRect(0, 0, 256, 256);

  const nebulaTexture = new THREE.CanvasTexture(nebulaCanvas);
  const nebula = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: nebulaTexture,
      transparent: true,
      depthWrite: false
    })
  );

  nebula.scale.set(19, 13, 1);
  nebula.position.set(0, 1, -15);
  spaceGroup.add(nebula);
}

/* ---------- GARDEN SCENE ---------- */

function buildGarden() {
  gardenGroup = new THREE.Group();
  scene.add(gardenGroup);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(55, 32, 24),
    new THREE.MeshBasicMaterial({
      color: 0xc8dfb3,
      side: THREE.BackSide
    })
  );

  gardenGroup.add(sky);

  // Sun
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffe7a0 })
  );

  sun.position.set(5.7, 4.4, -8);
  gardenGroup.add(sun);

  const sunLight = new THREE.PointLight(0xffe5a3, 60, 35, 2);
  sunLight.position.copy(sun.position);
  gardenGroup.add(sunLight);

  gardenGroup.add(
    new THREE.HemisphereLight(0xe9f7d9, 0x59794c, 2.2)
  );

  const daylight = new THREE.DirectionalLight(0xfff0ce, 2.2);
  daylight.position.set(-3, 8, 6);
  gardenGroup.add(daylight);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({
      color: 0x739b5a,
      roughness: 1
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.8;
  gardenGroup.add(ground);

  // Rolling landscape hills
  const hills = [
    { x: -7, y: -2.2, z: -7, sx: 9, sy: 2.1, sz: 4, c: 0x8fae73 },
    { x: 3, y: -2.4, z: -9, sx: 11, sy: 2.4, sz: 4.5, c: 0x72965c },
    { x: 10, y: -2.5, z: -4, sx: 8, sy: 2.7, sz: 4, c: 0x9ebd7b },
    { x: -12, y: -2.6, z: -4, sx: 8, sy: 2.5, sz: 5, c: 0x688c55 }
  ];

  hills.forEach(hill => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 22),
      new THREE.MeshStandardMaterial({
        color: hill.c,
        roughness: 1
      })
    );

    mesh.position.set(hill.x, hill.y, hill.z);
    mesh.scale.set(hill.sx, hill.sy, hill.sz);
    gardenGroup.add(mesh);
  });

  // Flowers
  flowers = new THREE.Group();
  gardenGroup.add(flowers);

  const petalColors = [
    0xf0a5bd, 0xffe59a, 0xe9e4dc,
    0xc6a8e8, 0xf5a36b, 0xf8c6d7
  ];

  const flowerCount = touchDevice ? 36 : 68;

  for (let i = 0; i < flowerCount; i++) {
    const flower = new THREE.Group();
    const size = 0.14 + Math.random() * 0.22;

    flower.position.set(
      (Math.random() - 0.5) * 25,
      -2.65,
      -Math.random() * 13 + 1
    );

    flower.userData.phase = Math.random() * Math.PI * 2;

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.022, 0.45 + size, 6),
      new THREE.MeshStandardMaterial({ color: 0x456c3b })
    );

    stem.position.y = 0.23;
    flower.add(stem);

    const petalMaterial = new THREE.MeshStandardMaterial({
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      roughness: 0.8
    });

    for (let p = 0; p < 6; p++) {
      const angle = p / 6 * Math.PI * 2;

      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(size * 0.44, 10, 8),
        petalMaterial
      );

      petal.position.set(
        Math.cos(angle) * size * 0.58,
        0.47 + size * 0.1,
        Math.sin(angle) * size * 0.58
      );

      petal.scale.set(1, 0.55, 1);
      flower.add(petal);
    }

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.28, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffd76b,
        roughness: 0.7
      })
    );

    center.position.y = 0.49 + size * 0.1;
    flower.add(center);
    flowers.add(flower);
  }
}

/* ---------- POINTER AND CAMERA ---------- */

function onPointerMove(event) {
  state.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
  state.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
}

function resizeScene() {
  if (!renderer || !camera) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, touchDevice ? 1.25 : 1.7)
  );

  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------- ANIMATION LOOP ---------- */

function animate() {
  if (!renderer) return;

  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const motion = reducedMotion ? 0 : 1;

  state.pointerX += (state.targetX - state.pointerX) * 0.025;
  state.pointerY += (state.targetY - state.pointerY) * 0.025;

  if (spaceGroup) {
    spaceGroup.rotation.y = state.pointerX * 0.035;
    starField.rotation.y = state.pointerX * 0.018;
    starField.rotation.x = state.pointerY * 0.012;

    planet.rotation.y = elapsed * 0.035 * motion;
    planetRing.rotation.z = Math.sin(elapsed * 0.16) * 0.035 * motion;
  }

  if (flowers) {
    flowers.children.forEach(flower => {
      flower.rotation.z =
        Math.sin(elapsed * 0.7 * motion + flower.userData.phase) * 0.07;
    });
  }

  const cameraX = state.pointerX * 0.22;
  const cameraY = 0.4 - state.pointerY * 0.12;

  camera.position.x += (cameraX - camera.position.x) * 0.018;
  camera.position.y += (cameraY - camera.position.y) * 0.018;

  camera.lookAt(state.theme === "space" ? 0.6 : 0, 0, -3);

  renderer.render(scene, camera);
}

/* ---------- THEME SWITCH ---------- */

function setTheme(theme) {
  state.theme = theme;

  body.classList.toggle("theme-space", theme === "space");
  body.classList.toggle("theme-garden", theme === "garden");

  const label = document.querySelector("#themeLabel");
  const button = document.querySelector("#themeToggle");

  if (label) {
    label.textContent = theme === "space" ? "SPACE MODE" : "GARDEN MODE";
  }

  if (button) {
    button.setAttribute(
      "aria-label",
      theme === "space" ? "Switch to garden theme" : "Switch to space theme"
    );
  }

  if (scene) {
    scene.background = new THREE.Color(
      theme === "space" ? "#08090d" : "#c8dfb3"
    );

    spaceGroup.visible = theme === "space";
    gardenGroup.visible = theme === "garden";

    camera.position.z = theme === "space" ? 12 : 13;
  }
}

document.querySelector("#themeToggle")?.addEventListener("click", () => {
  setTheme(state.theme === "space" ? "garden" : "space");
});

/* ---------- DETAIL POPUPS ---------- */

const details = {
  about: {
    title: "My approach",
    body: `
      <p>I start by understanding the goal, the audience, and the feeling
      a brand should leave behind.</p>
      <ul>
        <li>Clear content hierarchy</li>
        <li>Responsive layouts</li>
        <li>Motion that supports the story</li>
        <li>Careful implementation and testing</li>
      </ul>`
  },

  frontend: {
    title: "Frontend development",
    body: `
      <p>Responsive interfaces built with attention to semantic HTML,
      accessibility, clean CSS, and maintainable JavaScript.</p>
      <ul>
        <li>Responsive pages and navigation</li>
        <li>Consistent visual systems</li>
        <li>Cross-device checks</li>
      </ul>`
  },

  ui: {
    title: "Interactive UI",
    body: `
      <p>Thoughtful interactions make websites feel intuitive and polished.</p>
      <ul>
        <li>Micro-interactions and hover states</li>
        <li>Scroll reveal animations</li>
        <li>Keyboard-friendly controls</li>
      </ul>`
  },

  landing: {
    title: "Creative landing pages",
    body: `
      <p>Landing pages designed to communicate the offer, build trust,
      and guide visitors towards a clear next step.</p>
      <ul>
        <li>Strong hero sections</li>
        <li>Brand-focused visual direction</li>
        <li>Responsive call-to-action sections</li>
      </ul>`
  },

  research: {
    title: "Web research and data work",
    body: `
      <p>Organized online research, accurate data entry, and document
      formatting based on the agreed project scope.</p>
      <p>Delivery details and pricing are confirmed before work begins.</p>`
  },

  "project-space": {
    title: "Beyond the Ordinary",
    body: `
      <p>A concept for a cinematic digital brand, combining a cosmic
      palette, 3D depth, and restrained movement.</p>
      <p><strong>Status:</strong> Concept direction, not a client project.</p>`
  },

  "project-garden": {
    title: "Field Notes",
    body: `
      <p>A concept for a natural brand world using landscape colors,
      organic forms, and an open visual layout.</p>
      <p><strong>Status:</strong> Concept direction, not a client project.</p>`
  },

  lab: {
    title: "Inside the digital lab",
    body: `
      <p>The hero scene uses Three.js, which renders interactive 3D
      graphics through WebGL in the browser.</p>
      <p>The space and garden scenes are real-time stylized 3D graphics,
      not pre-rendered photorealistic video.</p>`
  }
};

const dialog = document.querySelector("#detailDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogBody = document.querySelector("#dialogBody");

document.querySelectorAll(".detail-trigger").forEach(button => {
  button.addEventListener("click", () => {
    const item = details[button.dataset.modal];
    if (!item || !dialog) return;

    dialogTitle.textContent = item.title;
    dialogBody.innerHTML = item.body;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      showToast(item.title);
    }
  });
});

document.querySelector("#dialogClose")?.addEventListener("click", () => {
  dialog?.close();
});

document.querySelector("#dialogContact")?.addEventListener("click", () => {
  dialog?.close();
});

dialog?.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

/* ---------- MOBILE NAVIGATION ---------- */

const nav = document.querySelector("#mainNav");
const menuToggle = document.querySelector("#menuToggle");

menuToggle?.addEventListener("click", () => {
  const opened = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(opened));
});

nav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

/* ---------- SCROLL REVEALS ---------- */

if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(element => {
    observer.observe(element);
  });
} else {
  document.querySelectorAll(".reveal").forEach(element => {
    element.classList.add("is-visible");
  });
}

/* ---------- FOOTER YEAR ---------- */

document.querySelector("#year").textContent = new Date().getFullYear();

/* ---------- CONTACT FORM MODULE ---------- */
/* Supabase connection lives in supabase.js. */
import { submitContactMessage } from "./supabase.js";

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const submitButton = document.querySelector("#submitButton");

contactForm?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  const originalLabel = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.style.opacity = "0.65";
  formStatus.textContent = "Sending your message…";

  const formData = new FormData(contactForm);

  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    subject: String(formData.get("subject") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };

  try {
    await submitContactMessage(payload);

    contactForm.reset();
    formStatus.textContent =
      "Message sent successfully. Thank you — I'll get back to you by email.";

    showToast("Your message has been sent.");
  } catch (error) {
    console.error("Contact form error:", error);

    formStatus.textContent =
      "Message could not be sent. Please email zuhaibwazir558@gmail.com directly.";

    showToast("Sending failed. Please use the email link instead.");
  } finally {
    submitButton.disabled = false;
    submitButton.style.opacity = "";
    submitButton.innerHTML = originalLabel;
  }
});

/* Start the 3D experience. */
initScene();
