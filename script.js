
/* =========================================
   WAZIR AURA — CINEMATIC INTERACTIONS
   ========================================= */

(() => {
  "use strict";
   
  // Supabase connection for Wazir Aura
  const SUPABASE_URL = "https://azjmjotzysprjecydomg.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FHgg_rr679vsEzBGtAMygg_Ug-pLfms";

  const supabaseClient = window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  if (!supabaseClient) {
    console.error("Supabase library did not load. Please check the connection.");
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const body = document.body;
  const intro = $("#introScreen");
  const siteShell = $("#siteShell");
  const enterButton = $("#enterAura");
  const skipButton = $("#skipIntro");
  const soundButton = $("#soundToggle");
  const soundLabel = $("#soundLabel");
  const themeButton = $("#themeToggle");
  const menuButton = $("#menuToggle");
  const navigation = $(".main-nav");
  const year = $("#currentYear");

  let introFinished = false;
  let soundEnabled = false;
  let audioContext = null;
  let masterGain = null;
  let ambientNodes = [];
  let transitionInProgress = false;

  // Respect visitors who prefer less animation.
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =========================================
     STAR PARTICLES
     ========================================= */

  function createStars() {
    const starContainer = $("#introStars");
    if (!starContainer || reducedMotion) return;

    const fragment = document.createDocumentFragment();
    const count = window.innerWidth < 600 ? 35 : 75;

    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");

      const size = Math.random() * 2 + 0.5;
      const duration = 3 + Math.random() * 6;
      const delay = Math.random() * -8;

      Object.assign(star.style, {
        position: "absolute",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: Math.random() > 0.7 ? "#a7eaff" : "#ffffff",
        opacity: `${0.25 + Math.random() * 0.7}`,
        boxShadow: `0 0 ${size * 5}px rgba(132, 220, 255, .8)`,
        animation: `starTwinkle ${duration}s ${delay}s ease-in-out infinite alternate`,
        pointerEvents: "none"
      });

      fragment.appendChild(star);
    }

    starContainer.appendChild(fragment);
  }

  /* =========================================
     INTRO TRANSITION
     ========================================= */

  function enterWebsite() {
    if (introFinished || transitionInProgress) return;

    transitionInProgress = true;
    introFinished = true;

    // Fade the intro out and reveal the website.
    body.classList.add("site-ready");

    window.setTimeout(() => {
      body.classList.add("intro-complete");

      if (intro) {
        intro.setAttribute("aria-hidden", "true");
      }

      // Remove the intro after the transition.
      window.setTimeout(() => {
        if (intro) intro.hidden = true;
        transitionInProgress = false;
      }, reducedMotion ? 50 : 1200);
    }, 30);

    // Sound is only started when a visitor explicitly enabled it.
    if (soundEnabled) stopAmbientSound();
  }

  if (enterButton) {
    enterButton.addEventListener("click", enterWebsite);
  }

  if (skipButton) {
    skipButton.addEventListener("click", enterWebsite);
  }

  /* =========================================
     ORIGINAL SYNTHESIZED AMBIENT SOUND
     ========================================= */

  function createAmbientSound() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      if (soundLabel) soundLabel.textContent = "AUDIO UNSUPPORTED";
      return false;
    }

    try {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.0001;
      masterGain.connect(audioContext.destination);

      // Soft, original synthesized atmospheric tones.
      // No external audio file or copyrighted soundtrack is used.
      const frequencies = [55, 82.41, 110, 164.81];

      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const lowPass = audioContext.createBiquadFilter();

        oscillator.type = index === 2 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;

        lowPass.type = "lowpass";
        lowPass.frequency.value = 350 + index * 120;

        gain.gain.value = index === 0 ? 0.28 : 0.08;

        oscillator.connect(lowPass);
        lowPass.connect(gain);
        gain.connect(masterGain);

        oscillator.start();

        ambientNodes.push({ oscillator, gain, lowPass });
      });

      return true;
    } catch (error) {
      console.warn("Ambient audio could not be initialized.", error);
      return false;
    }
  }

  async function startAmbientSound() {
    if (introFinished) return;

    if (!audioContext && !createAmbientSound()) return;

    try {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (!masterGain) return;

      const now = audioContext.currentTime;

      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(0.12, now, 1.5);

      soundEnabled = true;
      intro?.classList.add("sound-playing");

      if (soundLabel) soundLabel.textContent = "SOUND ON";
      soundButton?.setAttribute("aria-pressed", "true");
    } catch (error) {
      console.warn("Please interact with the page to enable audio.", error);
    }
  }

  function stopAmbientSound() {
    soundEnabled = false;
    intro?.classList.remove("sound-playing");

    if (soundLabel) soundLabel.textContent = "SOUND OFF";
    soundButton?.setAttribute("aria-pressed", "false");

    if (audioContext && masterGain) {
      const now = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(0.0001, now, 0.2);
    }
  }

  if (soundButton) {
    soundButton.addEventListener("click", () => {
      if (soundEnabled) {
        stopAmbientSound();
      } else {
        startAmbientSound();
      }
    });
  }

  /* =========================================
     SECTION NAVIGATION
     ========================================= */

  function showPage(pageName) {
    const target = $(`#page-${pageName}`);

    if (!target) return;

    $$(".page-section").forEach((section) => {
      section.classList.remove("active");
      section.setAttribute("aria-hidden", "true");
    });

    target.classList.add("active");
    target.setAttribute("aria-hidden", "false");

    $$(".nav-link").forEach((button) => {
      const active = button.dataset.page === pageName;
      button.classList.toggle("active", active);

      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    closeMobileMenu();

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  }

  $$("[data-page]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();

      const pageName = control.dataset.page;
      if (!pageName) return;

      showPage(pageName);
    });
  });

  /* =========================================
     MOBILE MENU
     ========================================= */

  function closeMobileMenu() {
    navigation?.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("menu-open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    document.addEventListener("click", (event) => {
      if (
        !navigation.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        closeMobileMenu();
      }
    });
  }

  /* =========================================
     DARK / LIGHT THEME
     ========================================= */

  function updateThemeButton() {
    const isLight = body.classList.contains("light-mode");

    if (themeButton) {
      themeButton.textContent = isLight ? "☾" : "☼";
      themeButton.setAttribute(
        "aria-label",
        isLight ? "Switch to dark space theme" : "Switch to light sky theme"
      );
      themeButton.title = isLight
        ? "Switch to dark space theme"
        : "Switch to light sky theme";
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", isLight ? "#edf5ff" : "#050713");
    }
  }

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      body.classList.toggle("light-mode");
      updateThemeButton();
    });
  }

  updateThemeButton();

  /* =========================================
     CONTACT FORM
     ========================================= */

  const contactForm = $("#contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);

      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const emailSubject = `Wazir Aura enquiry: ${subject}`;

      const emailBody = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Service: ${subject}`,
        "",
        "Project details:",
        message
      ].join("\n");

      const mailto =
        `mailto:zuhaibwazir558@gmail.com?subject=${encodeURIComponent(emailSubject)}` +
        `&body=${encodeURIComponent(emailBody)}`;

      window.location.href = mailto;
    });
  }

  /* =========================================
     INITIALIZE
     ========================================= */

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  createStars();

  // Keep the intro on screen until the visitor chooses to enter or skip.
  // No forced timeout, so the visitor can enjoy the complete opening.
  if (intro) {
    intro.hidden = false;
    intro.setAttribute("aria-hidden", "false");
  }

  // Start with Home as the visible section.
  showPage("home");

  // Make the initial view accessible even when the visitor uses
  // the Enter button or Skip Intro.
  if (enterButton) {
    enterButton.setAttribute("aria-label", "Enter Wazir Aura website");
  }
})();
