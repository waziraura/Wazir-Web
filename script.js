
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  const body = document.body;
  const menuToggle = $("#menu-toggle");
  const navigation = $("#primary-navigation");
  const themeToggle = $("#theme-toggle");
  const themeIcon = $("#theme-icon");
  const contactForm = $("#contact-form");
  const contactStatus = $("#contact-status");
  const splashScreen = $("#splash-screen");

  // Footer year
  const year = $("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  // Remove the intro screen after the page has initialized.
  body.classList.add("js-ready");

  if (splashScreen) {
    window.setTimeout(() => {
      splashScreen.style.display = "none";
    }, 700);
  }

  // Mobile navigation
  const closeMenu = () => {
    if (!menuToggle || !navigation) return;

    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  };

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

    document.addEventListener("click", (event) => {
      if (
        navigation.classList.contains("is-open") &&
        !navigation.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // Theme toggle with saved preference
  const savedTheme = (() => {
    try {
      return localStorage.getItem("wazir-aura-theme");
    } catch {
      return null;
    }
  })();

  const prefersLight = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  const applyTheme = (light) => {
    body.classList.toggle("light-theme", light);

    if (themeIcon) {
      themeIcon.textContent = light ? "☾" : "☼";
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        light ? "Switch to dark theme" : "Switch to light theme"
      );
    }

    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", light ? "#f5f7ff" : "#080b16");
    }
  };

  applyTheme(savedTheme ? savedTheme === "light" : prefersLight);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const light = !body.classList.contains("light-theme");
      applyTheme(light);

      try {
        localStorage.setItem("wazir-aura-theme", light ? "light" : "dark");
      } catch {
        // Theme still works for the current page if storage is unavailable.
      }
    });
  }

  // Smooth scrolling for internal links
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = $(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (window.location.hash !== targetId) {
        history.replaceState(null, "", targetId);
      }
    });
  });

  // Service cards lead to the contact form where appropriate.
  $$("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      const serviceSelect = $("#contact-service");
      if (serviceSelect) {
        serviceSelect.value = link.dataset.service;
      }
    });
  });

  // Contact form: prepare an email; nothing is uploaded or stored.
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const name = $("#contact-name")?.value.trim() || "";
      const email = $("#contact-email")?.value.trim() || "";
      const service = $("#contact-service")?.value || "";
      const budget = $("#contact-budget")?.value || "Not specified";
      const message = $("#contact-message")?.value.trim() || "";

      const subject = `Wazir Aura project inquiry — ${service}`;
      const emailBody = [
        "Hello Murad Wazir,",
        "",
        "I would like to discuss a project.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Service: ${service}`,
        `Budget: ${budget}`,
        "",
        "Project details:",
        message,
        "",
        "Sent via the Wazir Aura website."
      ].join("\n");

      const mailto =
        `mailto:zuhaibwazir558@gmail.com?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(emailBody)}`;

      if (contactStatus) {
        contactStatus.textContent =
          "Your email app should open with the inquiry prepared. Please review and send it there.";
      }

      window.location.href = mailto;
    });
  }

  // Keep any optional feedback form honest: no backend is connected.
  const feedbackForm = $("#feedback-form");

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const status = $("#feedback-status");
      if (status) {
        status.textContent =
          "Online feedback is not enabled yet. Please contact Murad by email instead.";
      }
    });
  }

  // Only one FAQ details element open at a time, if FAQs are added later.
  const faqItems = $$("details");

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  // Add safe target attributes to external links.
  $$('a[target="_blank"]').forEach((link) => {
    const relValues = new Set((link.getAttribute("rel") || "").split(/\s+/));
    relValues.add("noopener");
    relValues.add("noreferrer");
    link.setAttribute("rel", Array.from(relValues).join(" ").trim());
  });
});
