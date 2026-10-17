import * as THREE from "three";
import { submitContactMessage } from "./supabase.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const body = document.body;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

/* -----------------------------
   CINEMATIC WELCOME
----------------------------- */
const welcomeScreen = $("#welcomeScreen");
const welcomeEnter = $("#welcomeEnter");
const welcomeSkip = $("#welcomeSkip");

function enterExperience() {
  if (!welcomeScreen || welcomeScreen.classList.contains("is-leaving")) return;

  welcomeScreen.classList.add("is-leaving");
  welcomeEnter?.setAttribute("aria-expanded", "false");

  window.setTimeout(() => {
    welcomeScreen.hidden = true;
  }, reducedMotion ? 0 : 1050);

  showToast("Welcome to Wazir Aura.");
}

welcomeEnter?.addEventListener("click", enterExperience);
welcomeSkip?.addEventListener("click", enterExperience);

welcomeScreen?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") enterExperience();
});

/* -----------------------------
   TOAST
----------------------------- */
const toast = $("#toast");
let toastTimeout;

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* -----------------------------
   THREE.JS BACKGROUND
----------------------------- */
const canvas = $("#webgl-scene");
let renderer;
let scene;
let camera;
let starField;
let planet;
let planetMaterial;
let planetGroup;
let gardenObjects = [];
let animationFrame = 0;
let sceneReady = false;

function createStarField() {
  const count = 1400;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 90;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 65;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 65;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xc5c5ff,
    size: 0.075,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  return new THREE.Points(geometry, material);
}

function createSpaceObjects() {
  planetGroup = new THREE.Group();

  const geometry = new THREE.SphereGeometry(3.6, 64, 64);
  planetMaterial = new THREE.MeshStandardMaterial({
    color: 0x6355ac,
    roughness: 0.78,
    metalness: 0.12,
    emissive: 0x171238,
    emissiveIntensity: 0.6
  });

  planet = new THREE.Mesh(geometry, planetMaterial);
  planetGroup.add(planet);

  const ringGeometry = new THREE.TorusGeometry(5.1, 0.035, 3, 180);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x8d91ff,
    transparent: true,
    opacity: 0.55
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI * 0.36;
  ring.rotation.y = Math.PI * 0.1;
  planetGroup.add(ring);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.2, 0.018, 3, 180),
    new THREE.MeshBasicMaterial({
      color: 0x65e4ff,
      transparent: true,
      opacity: 0.3
    })
  );

  outerRing.rotation.x = Math.PI * 0.45;
  outerRing.rotation.y = -Math.PI * 0.2;
  planetGroup.add(outerRing);

  planetGroup.position.set(4.5, 0, -8);
  scene.add(planetGroup);

  const pointLight = new THREE.PointLight(0x8c75ff, 25, 30);
  pointLight.position.set(2, 4, 0);
  scene.add(pointLight);

  const blueLight = new THREE.PointLight(0x53dfff, 16, 25);
  blueLight.position.set(-7, -2, -5);
  scene.add(blueLight);
}

function createGardenObjects() {
  const groundGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d2b20,
    roughness: 1,
    metalness: 0
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5;
  scene.add(ground);
  gardenObjects.push(ground);

  const flowerColors = [0x86e5b3, 0x8b9eff, 0xffd5a2, 0xc8aaff];

  for (let i = 0; i < 60; i++) {
    const flowerGroup = new THREE.Group();

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.025, 0.65, 5),
      new THREE.MeshStandardMaterial({ color: 0x4a9b70 })
    );
    stem.position.y = 0.3;
    flowerGroup.add(stem);

    const petalMaterial = new THREE.MeshStandardMaterial({
      color: flowerColors[i % flowerColors.length],
      emissive: flowerColors[i % flowerColors.length],
      emissiveIntensity: 0.18,
      roughness: 0.5
    });

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      petalMaterial
    );
    center.position.y = 0.68;
    flowerGroup.add(center);

    for (let j = 0; j < 5; j++) {
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        petalMaterial
      );

      const angle = (j / 5) * Math.PI * 2;
      petal.position.set(
        Math.cos(angle) * 0.16,
        0.68,
        Math.sin(angle) * 0.16
      );
      petal.scale.set(1, 0.55, 0.8);
      flowerGroup.add(petal);
    }

    flowerGroup.position.set(
      (Math.random() - 0.5) * 42,
      -4.5,
      -Math.random() * 30
    );

    flowerGroup.rotation.y = Math.random() * Math.PI;
    flowerGroup.userData.phase = Math.random() * Math.PI * 2;
    scene.add(flowerGroup);
    gardenObjects.push(flowerGroup);
  }

  const gardenLight = new THREE.PointLight(0x65d9a1, 28, 45);
  gardenLight.position.set(-4, 7, -8);
  scene.add(gardenLight);
}

function initScene() {
  if (!canvas || sceneReady || reducedMotion) return;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !coarsePointer,
      powerPreference: "low-power"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080912, 0.008);

    camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      150
    );
    camera.position.set(0, 0, 19);

    scene.add(new THREE.AmbientLight(0x9e9dca, 1.5));

    starField = createStarField();
    scene.add(starField);

    createSpaceObjects();
    createGardenObjects();

    sceneReady = true;
    applyTheme(body.classList.contains("theme-garden") ? "garden" : "space");
    animateScene();
  } catch (error) {
    console.warn("3D background unavailable; the website will remain usable.", error);
    canvas.style.display = "none";
  }
}

function applyTheme(theme) {
  const gardenMode = theme === "garden";

  body.classList.toggle("theme-garden", gardenMode);
  body.classList.toggle("theme-space", !gardenMode);

  const label = $("#themeLabel");
  const toggle = $("#themeToggle");

  if (label) label.textContent = gardenMode ? "Garden mode" : "Space mode";
  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      gardenMode ? "Switch to space theme" : "Switch to garden theme"
    );
  }

  if (planetMaterial) {
    planetMaterial.color.set(gardenMode ? 0x397a60 : 0x6355ac);
    planetMaterial.emissive.set(gardenMode ? 0x0c3321 : 0x171238);
  }

  if (starField?.material) {
    starField.material.color.set(gardenMode ? 0xb5f2ce : 0xc5c5ff);
  }

  if (scene?.fog) {
    scene.fog.color.set(gardenMode ? 0x08130f : 0x080912);
  }

  if (renderer) {
    renderer.setClearColor(gardenMode ? 0x08130f : 0x080912, 0);
  }
}

function animateScene() {
  if (!renderer || !scene || !camera) return;

  animationFrame = requestAnimationFrame(animateScene);
  const time = performance.now() * 0.0002;

  if (starField) {
    starField.rotation.y = time * 0.22;
    starField.rotation.x = Math.sin(time) * 0.04;
  }

  if (planetGroup) {
    planetGroup.rotation.y = time * 0.5;
    planetGroup.rotation.z = Math.sin(time * 0.7) * 0.04;
    planetGroup.position.y = Math.sin(time * 1.5) * 0.3;
  }

  gardenObjects.forEach((object) => {
    if (object.userData.phase !== undefined) {
      object.rotation.z = Math.sin(time * 2 + object.userData.phase) * 0.08;
    }
  });

  renderer.render(scene, camera);
}

function resizeScene() {
  if (!renderer || !camera) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
}

$("#themeToggle")?.addEventListener("click", () => {
  const nextTheme = body.classList.contains("theme-garden") ? "space" : "garden";
  applyTheme(nextTheme);
});

window.addEventListener("resize", resizeScene, { passive: true });

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
  } else if (sceneReady && !reducedMotion) {
    animateScene();
  }
});

/* -----------------------------
   MOBILE NAVIGATION
----------------------------- */
const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");

function closeMenu() {
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
  mainNav?.classList.remove("is-open");
}

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  mainNav?.classList.toggle("is-open", open);
});

$$(".main-nav a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

/* -----------------------------
   DETAIL MODALS
----------------------------- */
const details = {
  about: {
    title: "The approach behind Wazir Aura",
    body: "I’m Murad Wazir. My work spans frontend development, web research, data services, office productivity and creative digital projects. I focus on understanding the brief, communicating clearly and delivering against agreed requirements."
  },
  frontend: {
    title: "Frontend & Web Development",
    body: "Responsive interfaces, layouts, interactive elements and visual website concepts. The technical scope, design direction and deliverables are agreed before work starts."
  },
  research: {
    title: "Web Research & Lead Generation",
    body: "Structured online research, information gathering and organised lead lists based on your target criteria. The sources, fields and expected format are confirmed in advance."
  },
  data: {
    title: "Data Entry & Formatting",
    body: "Accurate data entry, spreadsheet updates, copy-paste tasks and information formatting. Share your preferred structure and validation requirements before work begins."
  },
  design: {
    title: "Social Media Banner Design",
    body: "Promotional banners and social graphics shaped around your content, brand direction and intended platform."
  },
  office: {
    title: "Office Documents",
    body: "Typing, Microsoft Word formatting, Excel data organisation and PowerPoint presentation support. The required files and final format are agreed in advance."
  },
  games: {
    title: "2D Game Development",
    body: "Small interactive concepts and learning-focused 2D game projects. Feasibility and technical scope should be discussed before committing to a delivery."
  },
  "project-space": {
    title: "Beyond the Orbit",
    body: "A space-inspired visual concept exploring depth, glowing orbits, atmospheric lighting and immersive web presentation. This is a concept direction, not a claim of a completed client project."
  },
  "project-garden": {
    title: "Quiet Digital Garden",
    body: "A nature-inspired interface concept with softer colour, organic shapes and calm motion. It explores how the same digital experience can feel different through visual direction."
  },
  lab: {
    title: "Inside the Digital Lab",
    body: "The lab is where I explore frontend techniques, 3D effects, interface animation, responsive design and small game concepts. I use tools—including AI tools—where they help implement and refine my own ideas."
  }
};

const detailDialog = $("#detailDialog");
const dialogTitle = $("#dialogTitle");
const dialogBody = $("#dialogBody");
const dialogClose = $("#dialogClose");
const dialogContact = $("#dialogContact");

function openDetails(key) {
  const item = details[key];
  if (!item || !detailDialog) return;

  dialogTitle.textContent = item.title;
  dialogBody.textContent = item.body;

  if (typeof detailDialog.showModal === "function") {
    detailDialog.showModal();
  } else {
    detailDialog.setAttribute("open", "");
  }
}

$$("[data-modal]").forEach((button) => {
  button.addEventListener("click", () => openDetails(button.dataset.modal));
});

dialogClose?.addEventListener("click", () => detailDialog?.close());

detailDialog?.addEventListener("click", (event) => {
  if (event.target === detailDialog) detailDialog.close();
});

dialogContact?.addEventListener("click", () => {
  detailDialog?.close();
});

/* -----------------------------
   SCROLL REVEAL
----------------------------- */
const revealElements = $$(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
}

/* -----------------------------
   CLOUDFLARE TURNSTILE
----------------------------- */
let turnstileToken = "";
let turnstileWidgetId = null;
let turnstileReady = false;

window.onTurnstileSuccess = (token) => {
  turnstileToken = String(token || "");
  const status = $("#formStatus");

  if (status?.classList.contains("error") &&
      status.textContent.includes("verification")) {
    status.textContent = "";
    status.className = "form-status";
  }
};

window.onTurnstileExpired = () => {
  turnstileToken = "";
};

window.onTurnstileError = () => {
  turnstileToken = "";
  const status = $("#formStatus");

  if (status) {
    status.textContent = "Security verification failed. Please reload the verification and try again.";
    status.className = "form-status error";
  }
};

window.onTurnstileLoad = () => {
  const widget = $("#turnstileWidget");
  if (!widget || !window.turnstile) return;

  const siteKey = widget.dataset.sitekey?.trim();

  if (!siteKey ||
      siteKey === "PASTE_YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY_HERE") {
    console.warn("Add your public Cloudflare Turnstile Site Key in index.html.");
    return;
  }

  try {
    turnstileWidgetId = window.turnstile.render(widget, {
      sitekey: siteKey,
      theme: "dark",
      callback: window.onTurnstileSuccess,
      "expired-callback": window.onTurnstileExpired,
      "error-callback": window.onTurnstileError
    });

    turnstileReady = true;
  } catch (error) {
    console.error("Could not initialise Turnstile.", error);
  }
};

/* -----------------------------
   CONTACT FORM
----------------------------- */
const contactForm = $("#contactForm");
const submitButton = $("#submitButton");
const formStatus = $("#formStatus");

function setFormStatus(message, type = "") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}

function resetTurnstile() {
  turnstileToken = "";

  if (window.turnstile && turnstileWidgetId !== null) {
    try {
      window.turnstile.reset(turnstileWidgetId);
    } catch (error) {
      console.warn("Turnstile reset failed.", error);
    }
  }
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  if (!turnstileReady || !window.turnstile) {
    setFormStatus(
      "Security verification is not configured yet. Please try again later or email zuhaibwazir558@gmail.com.",
      "error"
    );
    return;
  }

  if (!turnstileToken) {
    setFormStatus("Please complete the security verification first.", "error");
    $("#turnstileWidget")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    return;
  }

  const originalButtonText = submitButton?.innerHTML;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = "<span>Sending securely…</span><span>↗</span>";
  }

  setFormStatus("Sending your message…");

  const payload = {
    name: $("#name")?.value.trim(),
    email: $("#email")?.value.trim(),
    subject: $("#subject")?.value.trim(),
    message: $("#message")?.value.trim(),
    turnstileToken
  };

  try {
    await submitContactMessage(payload);

    contactForm.reset();
    resetTurnstile();
    setFormStatus("Your message has been sent. Thank you for reaching out!", "success");
    showToast("Message sent successfully.");
  } catch (error) {
    console.error("Contact submission failed.", error);

    setFormStatus(
      error instanceof Error
        ? error.message
        : "Your message could not be sent. Please try again or email zuhaibwazir558@gmail.com.",
      "error"
    );

    // A token may be single-use, so request a fresh verification.
    resetTurnstile();
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText || "<span>Send your message</span><span>↗</span>";
    }
  }
});

/* -----------------------------
   FOOTER + START
----------------------------- */
const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());

initScene();
