
/* ==========================================
   WAZIR AURA — MAIN JAVASCRIPT
   Cinematic • Responsive • Silent
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  // ------------------------------------------
  // 1. ELEMENTS
  // ------------------------------------------

  const introScreen = $(
    "#introScreen, .intro-screen"
  );

  const siteShell = $(
    "#siteShell, .site-shell"
  );

  const enterButton = $(
    "#enterAura, .intro-enter"
  );

  const skipButton = $(
    "#skipIntro, .intro-skip"
  );

  const themeToggle = $(
    "#themeToggle, .theme-toggle"
  );

  const menuToggle = $(
    "#menuToggle, .menu-toggle"
  );

  const navigation = $(
    ".main-nav, #mainNav, .site-nav"
  );

  const navLinks = $$(
    '.main-nav a, #mainNav a, .site-nav a, [data-page]'
  );

  const pageSections = $$(
    ".page-section, [id^='page-']"
  );

  const contactForm = $("#contactForm");

  // ------------------------------------------
  // 2. INTRO SCREEN
  // ------------------------------------------

  function enterWebsite() {
    if (introScreen) {
      introScreen.classList.add("is-hidden");
      introScreen.classList.add("intro-hidden");
      introScreen.setAttribute("aria-hidden", "true");
    }

    if (siteShell) {
      siteShell.classList.add("is-visible");
      siteShell.classList.add("site-ready");
      siteShell.removeAttribute("aria-hidden");
    }

    document.body.classList.add("intro-complete");

    try {
      sessionStorage.setItem("wazirAuraIntroSeen", "true");
    } catch (_) {
      // The website still works if storage is unavailable.
    }
  }

  if (enterButton) {
    enterButton.addEventListener("click", enterWebsite);
  }

  if (skipButton) {
    skipButton.addEventListener("click", enterWebsite);
  }

  // Allow the intro to be skipped with the Escape key.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && introScreen) {
      enterWebsite();
    }
  });

  // Do not leave visitors stuck behind the intro.
  if (introScreen) {
    try {
      if (sessionStorage.getItem("wazirAuraIntroSeen") === "true") {
        enterWebsite();
      }
    } catch (_) {
      // Keep the intro available if storage is blocked.
    }
  }

  // ------------------------------------------
  // 3. DARK / LIGHT THEME
  // ------------------------------------------

  const THEME_KEY = "wazirAuraTheme";

  function applyTheme(theme) {
    const lightMode = theme === "light";

    document.body.classList.toggle(
      "light-mode",
      lightMode
    );

    document.documentElement.dataset.theme =
      lightMode ? "light" : "dark";

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        lightMode
          ? "Switch to dark mode"
          : "Switch to light mode"
      );

      themeToggle.setAttribute(
        "title",
        lightMode
          ? "Switch to dark mode"
          : "Switch to light mode"
      );

      const label = $(
        "[data-theme-label], .theme-label",
        themeToggle
      );

      if (label) {
        label.textContent = lightMode
          ? "Light Mode"
          : "Dark Mode";
      }

      const icon = $(
        "svg, i, .icon",
        themeToggle
      );

      if (icon && !icon.classList.contains("icon")) {
        icon.setAttribute(
          "aria-hidden",
          "true"
        );
      }
    }

    try {
      localStorage.setItem(
        THEME_KEY,
        lightMode ? "light" : "dark"
      );
    } catch (_) {
      // Theme switching still works for this page.
    }
  }

  let savedTheme = "dark";

  try {
    savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  } catch (_) {
    // Use dark mode by default.
  }

  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight =
        document.body.classList.contains("light-mode");

      applyTheme(isLight ? "dark" : "light");
    });
  }

  // ------------------------------------------
  // 4. MOBILE NAVIGATION
  // ------------------------------------------

  function closeMenu() {
    if (menuToggle) {
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }

    if (navigation) {
      navigation.classList.remove("active");
      navigation.classList.remove("is-open");
    }

    document.body.classList.remove("menu-open");
  }

  if (menuToggle && navigation) {
    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.addEventListener("click", () => {
      const isOpen =
        navigation.classList.contains("active") ||
        navigation.classList.contains("is-open");

      if (isOpen) {
        closeMenu();
      } else {
        navigation.classList.add("active");
        navigation.classList.add("is-open");
        menuToggle.classList.add("active");
        menuToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
      }
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu =
        navigation.contains(event.target) ||
        menuToggle.contains(event.target);

      if (!clickedInsideMenu) {
        closeMenu();
      }
    });
  }

  // ------------------------------------------
  // 5. PAGE / SECTION NAVIGATION
  // ------------------------------------------

  function getPageTarget(link) {
    const pageName = link.dataset.page;

    if (pageName) {
      return (
        document.getElementById(`page-${pageName}`) ||
        document.getElementById(pageName)
      );
    }

    const href = link.getAttribute("href");

    if (href && href.startsWith("#")) {
      return $(href);
    }

    return null;
  }

  function showPage(target, link) {
    if (!target) return false;

    const isPageLayout =
      pageSections.length > 0 &&
      (
        target.classList.contains("page-section") ||
        target.id.startsWith("page-")
      );

    if (isPageLayout) {
      pageSections.forEach((section) => {
        const active = section === target;

        section.classList.toggle("active", active);
        section.classList.toggle("is-active", active);

        section.setAttribute(
          "aria-hidden",
          active ? "false" : "true"
        );
      });

      target.classList.add("active", "is-active");

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } else {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    navLinks.forEach((navLink) => {
      const active =
        navLink === link ||
        (
          link.dataset.page &&
          navLink.dataset.page === link.dataset.page
        );

      navLink.classList.toggle("active", active);

      if (active) {
        navLink.setAttribute("aria-current", "page");
      } else {
        navLink.removeAttribute("aria-current");
      }
    });

    closeMenu();
    return true;
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = getPageTarget(link);

      if (!target) return;

      event.preventDefault();
      showPage(target, link);
    });
  });

  // ------------------------------------------
  // 6. CURRENT YEAR
  // ------------------------------------------

  const currentYear = $("#currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Also support common footer year markup.
  const footerYear = $("[data-current-year]");

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ------------------------------------------
  // 7. SCROLL REVEAL ANIMATIONS
  // ------------------------------------------

  const revealElements = $$(
    ".feature-card, .service-card, .marketplace-card, " +
    ".about-layout, .contact-method, .social-link, " +
    ".hero-content, .hero-highlights, .section-heading, " +
    "[data-reveal]"
  );

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      element.classList.add("reveal-ready");
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("revealed", "is-visible");
    });
  }

  // ------------------------------------------
  // 8. SUBTLE POINTER GLOW
  // ------------------------------------------

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    const glowCards = $$(
      ".feature-card, .service-card, .marketplace-card"
    );

    glowCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        card.style.setProperty("--pointer-x", `${x}px`);
        card.style.setProperty("--pointer-y", `${y}px`);
      });
    });
  }

  // ------------------------------------------
  // 9. CONTACT FORM
  // ------------------------------------------

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);

      const name = String(
        formData.get("name") || ""
      ).trim();

      const email = String(
        formData.get("email") || ""
      ).trim();

      const subject = String(
        formData.get("subject") || "Website enquiry"
      ).trim();

      const message = String(
        formData.get("message") || ""
      ).trim();

      if (!name || !email || !message) {
        showFormMessage(
          "Please complete your name, email and message.",
          true
        );
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        showFormMessage(
          "Please enter a valid email address.",
          true
        );
        return;
      }

      const recipient = "zuhaibwazir558@gmail.com";

      const mailSubject = encodeURIComponent(subject);

      const mailBody = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}`
      );

      showFormMessage(
        "Opening your email app. Please send the message there."
      );

      window.location.href =
        `mailto:${recipient}?subject=${mailSubject}&body=${mailBody}`;
    });
  }

  function showFormMessage(message, isError = false) {
    let status = $("#formStatus");

    if (!status && contactForm) {
      status = document.createElement("p");
      status.id = "formStatus";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      contactForm.appendChild(status);
    }

    if (status) {
      status.textContent = message;
      status.classList.toggle("error", isError);
      status.classList.toggle("success", !isError);
    }
  }

  // ------------------------------------------
  // 10. SOCIAL LINKS: OPEN EXTERNAL PROFILES
  // ------------------------------------------

  $$(
    'a[href*="linkedin.com"], ' +
    'a[href*="fiverr.com"], ' +
    'a[href*="facebook.com"], ' +
    'a[href*="instagram.com"], ' +
    'a[href*="x.com"]'
  ).forEach((link) => {
    if (!link.hasAttribute("aria-label")) {
      const label = link.textContent.trim();

      if (label) {
        link.setAttribute("aria-label", label);
      }
    }
  });

  // ------------------------------------------
  // 11. KEYBOARD ACCESSIBILITY
  // ------------------------------------------

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  // ------------------------------------------
  // 12. INITIAL PAGE STATE
  // ------------------------------------------

  if (pageSections.length > 0) {
    const hasActivePage = pageSections.some(
      (section) =>
        section.classList.contains("active") ||
        section.classList.contains("is-active")
    );

    if (!hasActivePage) {
      const home =
        $("#page-home") ||
        pageSections.find((section) =>
          section.id === "home"
        ) ||
        pageSections[0];

      if (home) {
        home.classList.add("active", "is-active");
        home.setAttribute("aria-hidden", "false");
      }
    }
  }

  console.log("Wazir Aura initialized successfully.");
});
