
// ============================================
// WAZIR AURA — WEBSITE INTERACTIONS
// Created for Murad Wazir
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  // ---------- Footer year ----------
  const year = $("#currentYear");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Welcome intro ----------
  const splash = $("#splashScreen");
  const skipIntro = $("#skipIntro");

  function closeIntro() {
    if (!splash) return;
    splash.classList.add("hide");
    document.body.classList.add("js-ready");
    revealVisibleElements();
  }

  if (skipIntro) skipIntro.addEventListener("click", closeIntro);

  // Avoid leaving visitors stuck on the intro screen.
  if (splash) {
    window.setTimeout(closeIntro, 6500);
  } else {
    document.body.classList.add("js-ready");
  }

  // ---------- Optional intro sound ----------
  // Audio only starts after a user gesture.
  const soundToggle = $("#soundToggle");
  let soundEnabled = false;
  let audioContext = null;

  function playWelcomeSound() {
    if (!soundEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioContext) audioContext = new AudioContextClass();

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const notes = [440, 554.37, 659.25];

      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = audioContext.currentTime + index * 0.13;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.07, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(start);
        oscillator.stop(start + 0.3);
      });
    } catch (error) {
      console.warn("Welcome audio is unavailable in this browser.");
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundToggle.textContent = soundEnabled
        ? "🔊 Sound On"
        : "🔇 Sound Off";
      soundToggle.setAttribute("aria-pressed", String(soundEnabled));

      if (soundEnabled) playWelcomeSound();
    });
  }

  // ---------- Theme switch ----------
  const themeToggle = $("#themeToggle");

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-theme", isLight);

    if (themeToggle) {
      themeToggle.textContent = isLight ? "🌙" : "☀️";
      themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
      );
    }
  }

  let savedTheme = "dark";

  try {
    savedTheme = localStorage.getItem("wazir-aura-theme") || "dark";
  } catch (error) {
    // Continue with the default theme if storage is blocked.
  }

  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("light-theme")
        ? "dark"
        : "light";

      applyTheme(nextTheme);

      try {
        localStorage.setItem("wazir-aura-theme", nextTheme);
      } catch (error) {
        // Theme still works for this page view.
      }
    });
  }

  // ---------- English / Urdu language switch ----------
  const languageToggle = $("#languageToggle");
  let currentLanguage = "en";

  try {
    currentLanguage = localStorage.getItem("wazir-aura-language") || "en";
  } catch (error) {
    // Use English if storage is unavailable.
  }

  const translations = {
    en: {
      "Home": "Home",
      "Services": "Services",
      "Marketplace": "Marketplace",
      "Games": "Games",
      "About": "About",
      "Contact": "Contact"
    },
    ur: {
      "Home": "ہوم",
      "Services": "خدمات",
      "Marketplace": "مارکیٹ پلیس",
      "Games": "گیمز",
      "About": "تعارف",
      "Contact": "رابطہ"
    }
  };

  function applyLanguage(language) {
    currentLanguage = language;

    document.documentElement.lang = language === "ur" ? "ur" : "en";
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";

    $$("[data-en][data-ur]").forEach((element) => {
      element.textContent =
        language === "ur"
          ? element.dataset.ur
          : element.dataset.en;
    });

    if (languageToggle) {
      languageToggle.textContent = language === "ur" ? "EN" : "اردو";
      languageToggle.setAttribute(
        "aria-label",
        language === "ur" ? "Switch to English" : "اردو میں تبدیل کریں"
      );
    }
  }

  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      const nextLanguage = currentLanguage === "en" ? "ur" : "en";
      applyLanguage(nextLanguage);

      try {
        localStorage.setItem("wazir-aura-language", nextLanguage);
      } catch (error) {
        // Language still changes for this page view.
      }
    });
  }

  applyLanguage(currentLanguage);

  // ---------- Mobile navigation ----------
  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  function closeMenu() {
    if (!mainNav || !menuToggle) return;

    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );

      document.body.classList.toggle("menu-open", isOpen);
    });

    $$("a", mainNav).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // ---------- Reveal animations ----------
  const revealElements = $$(".reveal");

  function revealVisibleElements() {
    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.92) {
        element.classList.add("visible");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  window.addEventListener("scroll", revealVisibleElements, { passive: true });

  // ---------- Active navigation link ----------
  const navLinks = $$(".main-nav a");
  const observedSections = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const active =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", active);
          });
        });
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  // ---------- Contact form ----------
  const contactForm = $("#contactForm");
  const contactStatus = $("#contactStatus");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const emailSubject = encodeURIComponent(
        `[Wazir Aura Website] ${subject}`
      );

      const emailBody = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      );

      if (contactStatus) {
        contactStatus.textContent =
          "Your email app should open. Review the message and send it there.";
      }

      window.location.href =
        `mailto:zuhaibwazir558@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    });
  }

  // ---------- Tic-Tac-Toe ----------
  const tttBoard = $("#tttBoard");
  const tttStatus = $("#tttStatus");
  const tttReset = $("#tttReset");

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  let tttCells = Array(9).fill("");
  let currentPlayer = "X";
  let tttFinished = false;

  function renderTicTacToe() {
    if (!tttBoard) return;

    $$(".ttt-cell", tttBoard).forEach((cell, index) => {
      cell.textContent = tttCells[index];
      cell.disabled = tttFinished || tttCells[index] !== "";
      cell.setAttribute(
        "aria-label",
        `Cell ${index + 1}${tttCells[index] ? `: ${tttCells[index]}` : ""}`
      );
    });
  }

  function resetTicTacToe() {
    tttCells = Array(9).fill("");
    currentPlayer = "X";
    tttFinished = false;

    if (tttStatus) tttStatus.textContent = "Player X's turn";
    renderTicTacToe();
  }

  function saveTicTacToeResult(result) {
    try {
      const key = "wazir-aura-ttt-stats";
      const stats = JSON.parse(localStorage.getItem(key) || "{}");

      if (result === "X" || result === "O") {
        stats[result] = (Number(stats[result]) || 0) + 1;
      } else {
        stats.draws = (Number(stats.draws) || 0) + 1;
      }

      localStorage.setItem(key, JSON.stringify(stats));
    } catch (error) {
      // The game still works when storage is unavailable.
    }
  }

  if (tttBoard) {
    $$(".ttt-cell", tttBoard).forEach((cell) => {
      cell.addEventListener("click", () => {
        const index = Number(cell.dataset.cell);

        if (tttFinished || tttCells[index]) return;

        tttCells[index] = currentPlayer;

        const won = winningLines.some((line) =>
          line.every((cellIndex) => tttCells[cellIndex] === currentPlayer)
        );

        if (won) {
          tttFinished = true;
          if (tttStatus) {
            tttStatus.textContent = `Player ${currentPlayer} wins! 🎉`;
          }
          saveTicTacToeResult(currentPlayer);
        } else if (tttCells.every(Boolean)) {
          tttFinished = true;
          if (tttStatus) tttStatus.textContent = "It's a draw!";
          saveTicTacToeResult("draw");
        } else {
          currentPlayer = currentPlayer === "X" ? "O" : "X";
          if (tttStatus) {
            tttStatus.textContent = `Player ${currentPlayer}'s turn`;
          }
        }

        renderTicTacToe();
      });
    });
  }

  if (tttReset) {
    tttReset.addEventListener("click", resetTicTacToe);
  }

  resetTicTacToe();

  // ---------- Memory Match ----------
  const memoryBoard = $("#memoryBoard");
  const memoryStatus = $("#memoryStatus");
  const memoryReset = $("#memoryReset");

  const memorySymbols = ["🌙", "🚀", "💎", "🌟", "🎮", "🪐", "🎨", "⚡"];

  let memoryDeck = [];
  let firstCard = null;
  let secondCard = null;
  let memoryLocked = false;
  let memoryMoves = 0;
  let memoryMatches = 0;
  let memoryTimer = null;

  function shuffle(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function updateMemoryStatus() {
    if (!memoryStatus) return;

    memoryStatus.textContent =
      memoryMatches === memorySymbols.length
        ? `You won in ${memoryMoves} moves! 🎉`
        : `Moves: ${memoryMoves} · Pairs: ${memoryMatches}/${memorySymbols.length}`;
  }

  function resetMemoryGame() {
    if (memoryTimer) {
      window.clearTimeout(memoryTimer);
      memoryTimer = null;
    }

    memoryDeck = shuffle([...memorySymbols, ...memorySymbols]);
    firstCard = null;
    secondCard = null;
    memoryLocked = false;
    memoryMoves = 0;
    memoryMatches = 0;

    if (memoryBoard) {
      memoryBoard.replaceChildren();

      memoryDeck.forEach((symbol, index) => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "memory-card";
        card.textContent = "?";
        card.dataset.symbol = symbol;
        card.dataset.index = String(index);
        card.setAttribute("aria-label", `Hidden card ${index + 1}`);

        card.addEventListener("click", () => flipMemoryCard(card));

        memoryBoard.appendChild(card);
      });
    }

    updateMemoryStatus();
  }

  function flipMemoryCard(card) {
    if (
      memoryLocked ||
      card.disabled ||
      card.classList.contains("is-revealed") ||
      card.classList.contains("is-matched")
    ) {
      return;
    }

    card.textContent = card.dataset.symbol;
    card.classList.add("is-revealed");
    card.setAttribute("aria-label", `Card: ${card.dataset.symbol}`);

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    memoryMoves += 1;

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
      firstCard.classList.remove("is-revealed");
      secondCard.classList.remove("is-revealed");

      firstCard.classList.add("is-matched");
      secondCard.classList.add("is-matched");

      firstCard.disabled = true;
      secondCard.disabled = true;

      memoryMatches += 1;
      firstCard = null;
      secondCard = null;

      updateMemoryStatus();

      if (memoryMatches === memorySymbols.length) {
        try {
          const key = "wazir-aura-memory-best";
          const previous = Number(localStorage.getItem(key));

          if (!previous || memoryMoves < previous) {
            localStorage.setItem(key, String(memoryMoves));
          }
        } catch (error) {
          // Saving the best score is optional.
        }
      }

      return;
    }

    memoryLocked = true;
    updateMemoryStatus();

    memoryTimer = window.setTimeout(() => {
      [firstCard, secondCard].forEach((item) => {
        if (!item) return;

        item.textContent = "?";
        item.classList.remove("is-revealed");
        item.setAttribute(
          "aria-label",
          `Hidden card ${Number(item.dataset.index) + 1}`
        );
      });

      firstCard = null;
      secondCard = null;
      memoryLocked = false;
      memoryTimer = null;
    }, 850);
  }

  if (memoryReset) {
    memoryReset.addEventListener("click", resetMemoryGame);
  }

  resetMemoryGame();

  // ---------- Smooth in-page navigation ----------
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
        history.replaceState(null, "", href);
      }
    });
  });

  // ---------- Final initialization ----------
  document.body.classList.add("js-ready");
  revealVisibleElements();

  console.log("Wazir Aura frontend initialized successfully.");
});
