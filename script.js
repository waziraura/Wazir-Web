"use strict";

/* ==========================================
   WAZIR AURA — WEBSITE CONFIGURATION
   Replace these with your own Supabase values.
   Never put a service_role/secret key here.
========================================== */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

let supabaseClient = null;

const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_SUPABASE") &&
  SUPABASE_PUBLISHABLE_KEY.length > 20 &&
  !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_SUPABASE");

if (isSupabaseConfigured && window.supabase) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}

/* ---------- Helpers ---------- */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

/* ---------- Animated space canvas ---------- */

function initializeSpace() {
  const canvas = $("#spaceCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width = 0;
  let height = 0;
  let stars = [];
  let shootingStars = [];
  let frameId = 0;
  let lastFrame = 0;
  let paused = document.hidden;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const starCount = Math.min(
      360,
      Math.max(100, Math.round((width * height) / 3500))
    );

    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.25 + 0.25,
      alpha: Math.random() * 0.65 + 0.2,
      speed: Math.random() * 0.6 + 0.15,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.78 ? "120,245,229" : "208,218,255"
    }));
  }

  function draw(timestamp = 0) {
    if (paused) return;

    if (timestamp - lastFrame < 30) {
      frameId = requestAnimationFrame(draw);
      return;
    }
    lastFrame = timestamp;

    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      const twinkle = reducedMotion
        ? 0.85
        : 0.62 + Math.sin(timestamp * 0.001 * star.speed + star.phase) * 0.3;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${star.color},${Math.max(0.08, star.alpha * twinkle)})`;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reducedMotion && Math.random() < 0.008 && shootingStars.length < 2) {
      shootingStars.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.45,
        length: Math.random() * 90 + 45,
        velocity: Math.random() * 5 + 5,
        life: 1
      });
    }

    shootingStars = shootingStars.filter((star) => star.life > 0);

    for (const star of shootingStars) {
      const gradient = ctx.createLinearGradient(
        star.x, star.y,
        star.x - star.length, star.y + star.length * 0.55
      );
      gradient.addColorStop(0, `rgba(120,245,229,${star.life})`);
      gradient.addColorStop(1, "rgba(120,245,229,0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x - star.length, star.y + star.length * 0.55);
      ctx.stroke();

      if (!reducedMotion) {
        star.x += star.velocity;
        star.y -= star.velocity * 0.55;
        star.life -= 0.018;
      } else {
        star.life = 0;
      }
    }

    frameId = requestAnimationFrame(draw);
  }

  function setPaused(value) {
    paused = value;

    if (paused) {
      cancelAnimationFrame(frameId);
      ctx.clearRect(0, 0, width, height);
    } else {
      frameId = requestAnimationFrame(draw);
    }
  }

  resize();
  setPaused(document.hidden);

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    setPaused(document.hidden);
  });
}

/* ---------- Mobile navigation ---------- */

function initializeNavigation() {
  const menuButton = $("#menuToggle");
  const nav = $("#mainNav");

  if (!menuButton || !nav) return;

  function closeMenu() {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }

  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  $$(".nav-link", nav).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const sections = $$(".section[id]");
  const links = $$(".nav-link");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
        });
      });
    }, { rootMargin: "-25% 0px -60% 0px" });

    sections.forEach((section) => observer.observe(section));
  }
}

/* ---------- Dark / light theme ---------- */

function initializeTheme() {
  const button = $("#themeToggle");
  if (!button) return;

  let savedTheme = "dark";

  try {
    savedTheme = localStorage.getItem("wazir-aura-theme") || "dark";
  } catch (error) {
    console.warn("Theme preference storage is unavailable.");
  }

  function applyTheme(theme) {
    const light = theme === "light";
    document.body.classList.toggle("light-theme", light);
    button.textContent = light ? "☾" : "☼";
    button.setAttribute(
      "aria-label",
      light ? "Switch to dark theme" : "Switch to light theme"
    );
  }

  applyTheme(savedTheme);

  button.addEventListener("click", () => {
    const next = document.body.classList.contains("light-theme")
      ? "dark"
      : "light";

    applyTheme(next);

    try {
      localStorage.setItem("wazir-aura-theme", next);
    } catch (error) {
      console.warn("Could not save theme preference.");
    }
  });
}

/* ---------- Scroll reveal ---------- */

function initializeReveal() {
  const items = $$(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach((item) => observer.observe(item));
}

/* ---------- Project filters ---------- */

function initializeProjectFilters() {
  const filters = $("#projectFilters");
  const grid = $("#projectGrid");
  const count = $("#projectCount");

  if (!filters || !grid) return;

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    $$(".filter-btn", filters).forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    const category = button.dataset.filter;
    let visible = 0;

    $$(".project-card", grid).forEach((card) => {
      const show = category === "all" || card.dataset.category === category;
      card.hidden = !show;
      if (show) visible++;
    });

    if (count) count.textContent = `${visible} project${visible === 1 ? "" : "s"}`;
  });
}

/* ---------- FAQ accordion ---------- */

function initializeFAQ() {
  $$(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const willOpen = !item.classList.contains("open");

      item.classList.toggle("open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });
}

/* ---------- Supabase: load portfolio projects ---------- */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function renderDatabaseProjects(projects) {
  const grid = $("#projectGrid");
  const count = $("#projectCount");
  if (!grid || !Array.isArray(projects)) return;

  if (projects.length === 0) {
    if (count) count.textContent = "Featured projects";
    return; // Keep the concept cards if the database is empty.
  }

  grid.replaceChildren();

  projects.forEach((project, index) => {
    const category = ["web", "ui", "creative"].includes(project.category)
      ? project.category
      : "web";

    const title = escapeHTML(project.title || "Untitled project");
    const description = escapeHTML(project.description || "Digital project");
    const imageUrl = validHttpUrl(project.image_url || "")
      ? project.image_url
      : "";

    const card = document.createElement("article");
    card.className = "project-card reveal visible";
    card.dataset.category = category;

    const art = document.createElement("div");
    art.className = "project-art art-aurora";
    art.setAttribute("aria-label", title);

    if (imageUrl) {
      art.style.backgroundImage =
        `linear-gradient(0deg, rgba(7,9,20,.25), rgba(7,9,20,.05)), url("${imageUrl}")`;
      art.style.backgroundSize = "cover";
      art.style.backgroundPosition = "center";
    } else {
      art.innerHTML =
        `<span class="project-art-label">PROJECT ${String(index + 1).padStart(2, "0")}</span>
         <div class="prism-shape">WA<span>✦</span></div>`;
    }

    const info = document.createElement("div");
    info.className = "project-info";

    const text = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = project.title || "Untitled project";

    const detail = document.createElement("p");
    detail.textContent = project.description || "Digital project";

    text.append(heading, detail);
    info.append(text);

    if (validHttpUrl(project.project_url || "")) {
      const link = document.createElement("a");
      link.className = "project-arrow";
      link.href = project.project_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "↗";
      link.setAttribute("aria-label", `Open ${project.title || "project"}`);
      info.append(link);
    }

    card.append(art, info);
    grid.append(card);
  });

  if (count) count.textContent = `${projects.length} live project${projects.length === 1 ? "" : "s"}`;
}

async function loadProjects() {
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from("projects")
      .select("id, title, description, category, image_url, project_url, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    renderDatabaseProjects(data || []);
  } catch (error) {
    console.error("Supabase projects could not load:", error.message);
    // The static concept cards remain visible if the table is not ready.
  }
}

/* ---------- Supabase: contact form ---------- */

function initializeContactForm() {
  const form = $("#contactForm");
  const status = $("#formStatus");
  const submitButton = $("#submitButton");

  if (!form || !status || !submitButton) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (!supabaseClient) {
      status.textContent =
        "Supabase is not configured yet. Add your project URL and publishable key in script.js.";
      showToast("Add your Supabase settings first.");
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      project_type: String(data.get("projectType") || "").trim(),
      message: String(data.get("message") || "").trim()
    };

    if (
      !payload.name || payload.name.length > 100 ||
      !payload.email || payload.email.length > 254 ||
      !payload.project_type || payload.project_type.length > 100 ||
      !payload.message || payload.message.length > 5000
    ) {
      status.textContent = "Please check your details and try again.";
      return;
    }

    submitButton.disabled = true;
    submitButton.style.opacity = ".65";
    submitButton.querySelector("span").textContent = "…";
    status.textContent = "Sending your message securely…";

    try {
      const { error } = await supabaseClient
        .from("contact_messages")
        .insert([payload]);

      if (error) throw error;

      form.reset();
      status.textContent = "Message sent successfully. Thank you for reaching out!";
      showToast("Your message has been sent.");
    } catch (error) {
      console.error("Contact submission failed:", error.message);
      status.textContent =
        "Your message could not be saved. Please try again later or check the Supabase table and policies.";
      showToast("Message not sent. Check the Supabase setup.");
    } finally {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
      submitButton.querySelector("span").textContent = "↗";
    }
  });
}

/* ---------- Startup ---------- */

document.addEventListener("DOMContentLoaded", () => {
  const year = $("#currentYear");
  if (year) year.textContent = new Date().getFullYear();

  initializeSpace();
  initializeNavigation();
  initializeTheme();
  initializeReveal();
  initializeProjectFilters();
  initializeFAQ();
  initializeContactForm();
  loadProjects();

  if (!supabaseClient) {
    console.info(
      "Wazir Aura: add your Supabase project URL and publishable key to enable database features."
    );
  }
});
