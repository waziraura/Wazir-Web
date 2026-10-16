
// ============================================================
// WAZIR AURA — MW
// Main JavaScript | Front-end interactions
// ============================================================

"use strict";

// ---------- 1. Helpers ----------

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

function showToast(message) {
  const container = $("#toast-container");

  if (!container) {
    console.info("Wazir Aura:", message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  container.appendChild(toast);

  // Automatically remove the notification.
  window.setTimeout(() => {
    toast.remove();
  }, 4000);
}

// ---------- 2. Splash screen ----------

function initSplashScreen() {
  const splash = $("#splash-screen");

  if (!splash) return;

  const hideSplash = () => {
    splash.classList.add("is-hidden");
    splash.setAttribute("aria-hidden", "true");
  };

  // Always remove the intro eventually, even on a slow connection.
  window.setTimeout(hideSplash, 1400);

  // Do not leave the splash screen visible when the page finishes loading.
  if (document.readyState === "complete") {
    window.setTimeout(hideSplash, 450);
  } else {
    window.addEventListener("load", () => {
      window.setTimeout(hideSplash, 450);
    }, { once: true });
  }
}

// ---------- 3. Dark and light themes ----------

function initTheme() {
  const themeButton = $("#theme-toggle");
  const themeIcon = $("#theme-icon");
  const root = document.documentElement;

  if (!themeButton) return;

  const validThemes = ["dark", "light"];
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("wazir-aura-theme");
  } catch (error) {
    // Storage may be disabled by the browser.
  }

  const preferredTheme = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";

  const initialTheme = validThemes.includes(savedTheme)
    ? savedTheme
    : preferredTheme;

  applyTheme(initialTheme);

  function applyTheme(theme) {
    const selectedTheme = validThemes.includes(theme) ? theme : "dark";

    root.setAttribute("data-theme", selectedTheme);

    const isDark = selectedTheme === "dark";

    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀" : "☾";
    }

    themeButton.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    themeButton.setAttribute(
      "title",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    try {
      localStorage.setItem("wazir-aura-theme", selectedTheme);
    } catch (error) {
      // The theme still works for this page view without storage.
    }
  }

  themeButton.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    showToast(`${nextTheme === "dark" ? "Dark" : "Light"} mode activated.`);
  });
}

// ---------- 4. Mobile navigation ----------

function initMobileNavigation() {
  const menuButton = $("#menu-toggle");
  const navigation = $("#primary-navigation");

  if (!menuButton || !navigation) return;

  function closeMenu() {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
  }

  function toggleMenu() {
    const isOpen = navigation.classList.toggle("is-open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  }

  menuButton.addEventListener("click", toggleMenu);

  // Close the menu after a visitor chooses a navigation link.
  $$("a", navigation).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close the menu if the visitor clicks outside it.
  document.addEventListener("click", (event) => {
    if (
      navigation.classList.contains("is-open") &&
      !navigation.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // Restore normal navigation after returning to desktop width.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 850) {
      closeMenu();
    }
  });
}

// ---------- 5. Current year ----------

function initCurrentYear() {
  const yearElement = $("#current-year");

  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
}

// ---------- 6. Feedback form demo ----------

function initFeedbackForm() {
  const form = $("#feedback-form");
  const status = $("#feedback-status");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const type = $("#feedback-type")?.value || "";
    const message = $("#feedback-message")?.value.trim() || "";

    if (!type || !message) {
      if (status) {
        status.textContent = "Please complete the required fields.";
      }

      return;
    }

    // IMPORTANT:
    // This is a front-end demonstration only.
    // It deliberately does not pretend to send or save the feedback.
    if (status) {
      status.textContent =
        "Demo only: your feedback has not been sent or saved. " +
        "A backend service must be connected first.";
    }

    showToast("Demo form only — no data was submitted.");
    form.reset();
  });
}

// ---------- 7. Music control placeholder ----------

function initMusicControl() {
  const musicButton = $("#music-toggle");

  if (!musicButton) return;

  // No audio file is configured in this three-file starter project.
  // We never claim music is playing when no audio exists.
  musicButton.disabled = true;
  musicButton.setAttribute("aria-disabled", "true");
  musicButton.setAttribute(
    "title",
    "Music will be available when a licensed audio source is configured."
  );

  const buttonText = musicButton.querySelector("span");

  if (buttonText) {
    buttonText.textContent = "♫";
  }

  // Preserve the existing button layout while explaining the limitation.
  const existingText = Array.from(musicButton.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join("")
    .trim();

  if (existingText !== "Music unavailable") {
    musicButton.appendChild(document.createTextNode(" Music unavailable"));
  }
}

// ---------- 8. Navigation and action feedback ----------

function initActionLinks() {
  // Links that point to real page sections continue working normally.
  // This handler only covers future placeholder links if one is added.
  $$("[data-coming-soon]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      showToast("This feature is not available yet.");
    });
  });
}

// ---------- 9. Smooth anchor navigation ----------

function initAnchorNavigation() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.getElementById(href.slice(1));

      if (!target) return;

      // Keep native anchor behaviour and accessibility.
      // The browser handles scrolling and URL fragments.
      if (target === document.activeElement) {
        event.preventDefault();
      }
    });
  });
}

// ---------- 10. Accessibility: Escape key ----------

function initKeyboardSupport() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const navigation = $("#primary-navigation");
    const menuButton = $("#menu-toggle");

    if (navigation?.classList.contains("is-open")) {
      navigation.classList.remove("is-open");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Open navigation menu");
      menuButton?.focus();
    }
  });
}

// ---------- 11. Initialize website ----------

function initWazirAura() {
  initSplashScreen();
  initTheme();
  initMobileNavigation();
  initCurrentYear();
  initFeedbackForm();
  initMusicControl();
  initActionLinks();
  initAnchorNavigation();
  initKeyboardSupport();

  console.info("Wazir Aura MW front end initialized.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWazirAura, {
    once: true
  });
} else {
  initWazirAura();
}
