/* =========================================
   WAZIR AURA — WEBSITE JAVASCRIPT
   Mobile menu, theme, forms, interactions
========================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  /* -----------------------------------------
     Toast notifications
  ----------------------------------------- */

  const toastContainer = $("#toast-container");

  function showToast(message, type = "success") {
    if (!toastContainer) {
      window.alert(message);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "status");
    toast.textContent = message;

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";

      window.setTimeout(() => {
        toast.remove();
      }, 250);
    }, 4000);
  }

  /* -----------------------------------------
     Loading screen
  ----------------------------------------- */

  const splashScreen = $("#splash-screen");

  function hideSplashScreen() {
    if (splashScreen) {
      splashScreen.classList.add("hidden");
      splashScreen.setAttribute("aria-hidden", "true");
    }
  }

  if (splashScreen) {
    window.addEventListener("load", hideSplashScreen, { once: true });

    // Keep the page usable if the load event takes longer than expected.
    window.setTimeout(hideSplashScreen, 1800);
  }

  /* -----------------------------------------
     Footer year
  ----------------------------------------- */

  const currentYear = $("#current-year");

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------------------
     Mobile navigation
  ----------------------------------------- */

  const menuToggle = $("#menu-toggle");
  const navigation = $("#primary-navigation");

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    $$("a", navigation).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        navigation.classList.contains("is-open") &&
        !navigation.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }

  /* -----------------------------------------
     Light and dark theme
  ----------------------------------------- */

  const themeToggle = $("#theme-toggle");
  const themeIcon = $("#theme-icon");
  const savedThemeKey = "wazir-aura-theme";

  function applyTheme(theme) {
    const isLight = theme === "light";

    document.body.classList.toggle("light-theme", isLight);

    if (themeIcon) {
      themeIcon.textContent = isLight ? "☾" : "☼";
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
      );

      themeToggle.setAttribute(
        "title",
        isLight ? "Switch to dark theme" : "Switch to light theme"
      );
    }

    const themeColor = $('meta[name="theme-color"]');

    if (themeColor) {
      themeColor.setAttribute("content", isLight ? "#f7f8fc" : "#0b0d12");
    }
  }

  let initialTheme = "dark";

  try {
    const savedTheme = window.localStorage.getItem(savedThemeKey);

    if (savedTheme === "light" || savedTheme === "dark") {
      initialTheme = savedTheme;
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      initialTheme = "light";
    }
  } catch {
    // The theme still works if browser storage is unavailable.
  }

  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("light-theme")
        ? "dark"
        : "light";

      applyTheme(nextTheme);

      try {
        window.localStorage.setItem(savedThemeKey, nextTheme);
      } catch {
        // Theme switching remains functional for this page view.
      }
    });
  }

  /* -----------------------------------------
     Smooth in-page navigation
  ----------------------------------------- */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = $(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (window.location.hash !== href) {
        window.history.replaceState(null, "", href);
      }
    });
  });

  /* -----------------------------------------
     Service links preselect contact service
  ----------------------------------------- */

  const contactService = $("#contact-service");

  $$("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      if (!contactService) return;

      const requestedService = link.dataset.service;

      const matchingOption = Array.from(contactService.options).find(
        (option) => option.value === requestedService
      );

      if (matchingOption) {
        contactService.value = requestedService;
      }
    });
  });

  /* -----------------------------------------
     Contact form
     Opens the visitor's email application.
     Does not silently claim to send or store data.
  ----------------------------------------- */

  const contactForm = $("#contact-form");
  const contactStatus = $("#contact-status");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);

      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const budget = String(formData.get("budget") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !service || !message) {
        if (contactStatus) {
          contactStatus.textContent = "Please complete all required fields.";
        }
        return;
      }

      const subject = `Wazir Aura Project Inquiry — ${service}`;

      const body = [
        "Hello Wazir Aura,",
        "",
        "I would like to discuss a project.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Service: ${service}`,
        `Estimated budget: ${budget || "Not specified"}`,
        "",
        "Project details:",
        message,
        "",
        "Sent through the Wazir Aura website."
      ].join("\n");

      const mailtoURL =
        "mailto:zuhaibwazir558@gmail.com" +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      if (contactStatus) {
        contactStatus.textContent =
          "Your email app should open. Review the message and press Send to submit your inquiry.";
      }

      showToast(
        "Opening your email app. You still need to send the email.",
        "success"
      );

      // Open the visitor's configured email application.
      window.location.href = mailtoURL;
    });
  }

  /* -----------------------------------------
     Feedback form
     No fake submission or false success.
     Backend integration is required to receive feedback.
  ----------------------------------------- */

  const feedbackForm = $("#feedback-form");
  const feedbackStatus = $("#feedback-status");

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!feedbackForm.reportValidity()) return;

      if (feedbackStatus) {
        feedbackStatus.textContent =
          "Feedback submission is not connected yet. Please email your feedback to zuhaibwazir558@gmail.com.";
      }

      showToast(
        "Feedback is not connected yet. Please use the email link.",
        "error"
      );
    });
  }

  /* -----------------------------------------
     FAQ behavior
     Allow one answer open at a time.
  ----------------------------------------- */

  const faqItems = $$(".faq-item");

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });

  /* -----------------------------------------
     External links safety
  ----------------------------------------- */

  $$('a[target="_blank"]').forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
  });

  /* -----------------------------------------
     Respect reduced-motion preferences
  ----------------------------------------- */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function syncMotionPreference() {
    document.documentElement.classList.toggle(
      "reduced-motion",
      reducedMotion.matches
    );
  }

  syncMotionPreference();

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", syncMotionPreference);
  }

  /* -----------------------------------------
     Initial page setup
  ----------------------------------------- */

  document.body.classList.add("js-ready");

  console.info("Wazir Aura website initialized.");
});
