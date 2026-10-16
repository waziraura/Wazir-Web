/* =========================================================
   WAZIR AURA — WEBSITE INTERACTIONS
   Matches index.html and style.css
   No music, audio, or sound effects.
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const intro = $("#introScreen");
  const site = $("#siteShell");
  const enterButton = $("#enterAura");
  const skipButton = $("#skipIntro");
  const nav = $("#mainNav");
  const menuToggle = $("#menuToggle");
  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");
  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");
  const currentYear = $("#currentYear");
  const backToTop = $("#backToTop");

  const validPages = new Set([
    "home",
    "services",
    "portfolio",
    "marketplace",
    "about",
    "faq",
    "contact"
  ]);

  let introFinished = false;
  let revealObserver = null;

  /* ---------------------------------------------------------
     INTRO STARFIELD
     --------------------------------------------------------- */

  function createIntroStars() {
    const starfield = $("#introStars");
    if (!starfield) return;

    starfield.replaceChildren();

    const count = Math.min(
      150,
      Math.max(55, Math.floor((window.innerWidth * window.innerHeight) / 8500))
    );

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const star = document.createElement("span");
      star.className = "intro-star";
      star.setAttribute("aria-hidden", "true");

      const size = Math.random() < 0.13 ? 3 : Math.random() < 0.4 ? 2 : 1;

      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.animationDuration = `${2 + Math.random() * 4}s`;

      fragment.appendChild(star);
    }

    starfield.appendChild(fragment);
  }

  /* ---------------------------------------------------------
     THEME
     --------------------------------------------------------- */

  function readSavedTheme() {
    try {
      const saved = localStorage.getItem("wazir-aura-theme");
      return saved === "light" || saved === "dark" ? saved : "dark";
    } catch {
      return "dark";
    }
  }

  function applyTheme(theme, save = true) {
    const safeTheme = theme === "light" ? "light" : "dark";

    document.documentElement.dataset.theme = safeTheme;

    const isLight = safeTheme === "light";

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode"
      );

      themeToggle.setAttribute(
        "title",
        isLight ? "Switch to dark mode" : "Switch to light mode"
      );
    }

    if (themeIcon) {
      themeIcon.textContent = isLight ? "☾" : "☼";
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
      themeColor.setAttribute("content", isLight ? "#f5f8f5" : "#050817");
    }

    if (save) {
      try {
        localStorage.setItem("wazir-aura-theme", safeTheme);
      } catch {
        // The theme still works for the current page if storage is unavailable.
      }
    }
  }

  /* ---------------------------------------------------------
     PAGE NAVIGATION
     --------------------------------------------------------- */

  function closeMobileMenu() {
    if (!nav || !menuToggle) return;

    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }

  function showPage(pageName, options = {}) {
    const page = validPages.has(pageName) ? pageName : "home";
    const { updateHash = true, scroll = true } = options;

    $$(".page-section").forEach((section) => {
      const isActive = section.dataset.section === page;

      section.classList.toggle("active", isActive);

      if (isActive) {
        section.removeAttribute("aria-hidden");
      } else {
        section.setAttribute("aria-hidden", "true");
      }
    });

    $$(".nav-link").forEach((link) => {
      const isActive = link.dataset.page === page;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    closeMobileMenu();

    if (updateHash) {
      const nextHash = `#${page}`;

      if (window.location.hash !== nextHash) {
        try {
          window.history.replaceState(null, "", nextHash);
        } catch {
          window.location.hash = nextHash;
        }
      }
    }

    if (scroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    refreshRevealAnimations();
  }

  /* ---------------------------------------------------------
     INTRO EXIT
     --------------------------------------------------------- */

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;

    if (intro) {
      intro.classList.add("is-leaving");
      intro.setAttribute("aria-hidden", "true");
    }

    if (site) {
      site.classList.add("is-visible");
      site.removeAttribute("aria-hidden");
    }

    document.body.classList.remove("intro-active");

    const hashPage = window.location.hash.replace("#", "");

    if (validPages.has(hashPage)) {
      showPage(hashPage, { updateHash: false, scroll: false });
    } else {
      showPage("home", { updateHash: false, scroll: false });
    }

    window.setTimeout(() => {
      if (intro) {
        intro.hidden = true;
      }

      refreshRevealAnimations();
    }, 1000);
  }

  /* ---------------------------------------------------------
     SCROLL REVEAL
     --------------------------------------------------------- */

  function refreshRevealAnimations() {
    if (!site || !site.classList.contains("is-visible")) return;

    const activePage = $(".page-section.active");
    if (!activePage) return;

    const elements = $$("[data-reveal]", activePage);

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("revealed"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -35px 0px"
        }
      );
    }

    elements.forEach((element) => {
      if (!element.classList.contains("revealed")) {
        revealObserver.observe(element);
      }
    });
  }

  /* ---------------------------------------------------------
     CONTACT FORM
     This prepares an email; it does not send through a server.
     --------------------------------------------------------- */

  function handleContactForm(event) {
    event.preventDefault();

    if (!contactForm || !formStatus) return;

    formStatus.textContent = "";

    if (!contactForm.reportValidity()) {
      formStatus.textContent = "Please check the form and complete the required fields.";
      return;
    }

    const formData = new FormData(contactForm);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !subject || !message) {
      formStatus.textContent = "Please complete every field before preparing your email.";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      formStatus.textContent = "Please enter a valid email address.";
      return;
    }

    const recipient = "zuhaibwazir558@gmail.com";
    const emailSubject = `Wazir Aura Enquiry: ${subject}`;

    const emailBody = [
      "Wazir Aura — Project Enquiry",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${subject}`,
      "",
      "Project details:",
      message
    ].join("\n");

    const mailtoUrl =
      `mailto:${recipient}` +
      `?subject=${encodeURIComponent(emailSubject)}` +
      `&body=${encodeURIComponent(emailBody)}`;

    formStatus.textContent =
      "Your email draft is being opened. Review it in your email application before sending.";

    window.location.href = mailtoUrl;
  }

  /* ---------------------------------------------------------
     EVENT LISTENERS
     --------------------------------------------------------- */

  if (enterButton) {
    enterButton.addEventListener("click", finishIntro);
  }

  if (skipButton) {
    skipButton.addEventListener("click", finishIntro);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.dataset.theme;
      applyTheme(currentTheme === "light" ? "dark" : "light");
    });
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-page]");
    if (!trigger) return;

    const page = trigger.dataset.page;
    if (!validPages.has(page)) return;

    event.preventDefault();

    if (!introFinished) {
      finishIntro();
    }

    showPage(page);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("hashchange", () => {
    if (!introFinished) return;

    const page = window.location.hash.replace("#", "");

    if (validPages.has(page)) {
      showPage(page, { updateHash: false });
    }
  });

  if (contactForm) {
    contactForm.addEventListener("submit", handleContactForm);
  }

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      if (!introFinished) {
        finishIntro();
      }

      showPage("home");
    });
  }

  /* ---------------------------------------------------------
     INITIALIZE
     --------------------------------------------------------- */

  function initialize() {
    applyTheme(readSavedTheme(), false);
    createIntroStars();

    if (currentYear) {
      currentYear.textContent = String(new Date().getFullYear());
    }

    document.body.classList.add("intro-active");

    // Start with the main website hidden behind the intro.
    if (site) {
      site.classList.remove("is-visible");
      site.setAttribute("aria-hidden", "true");
    }

    // Respect reduced-motion preferences by skipping the intro.
    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      finishIntro();
    }
  }

  initialize();
})();
