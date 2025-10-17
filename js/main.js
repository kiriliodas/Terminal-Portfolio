import { state } from "./state.js";
import { initializeTerminal } from "./terminal/display.js";
import { setupTerminalInput } from "./terminal/input.js";
import { initializeGallery, setupGalleryControls } from "./gallery/controls.js";
import { setupQuickNavigation } from "./terminal/history.js";

async function loadConfig() {
  try {
    const [configResponse, quotesResponse] = await Promise.all([
      fetch("config/config.json"),
      fetch("config/quotes.json"),
    ]);

    if (!configResponse.ok)
      throw new Error(`config.json ${configResponse.status}`);
    if (!quotesResponse.ok)
      throw new Error(`quotes.json ${quotesResponse.status}`);

    state.config = await configResponse.json();
    const quotesData = await quotesResponse.json();
    state.config.quotes = quotesData.quotes;

    initializeApp();
  } catch (error) {
    console.error("Error loading config:", error);
    const terminal = document.getElementById("terminal");
    if (terminal) {
      const output = document.createElement("div");
      output.className = "output";
      output.textContent =
        "Failed to load configuration. Please refresh the page.";
      terminal.prepend(output);
    }
  }
}

function initializeApp() {
  initializeTerminal();
  initializeGallery();
  setupEventListeners();
}

function setupEventListeners() {
  setupTerminalInput();
  setupQuickNavigation();
  setupGalleryControls();
  setupFocusHandler();
}

function setupFocusHandler() {
  document.addEventListener("click", (e) => {
    const gallery = document.getElementById("gallery-container");
    const isGalleryVisible = gallery && gallery.style.display === "block";
    if (isGalleryVisible) return; // don't steal focus when gallery is open

    const terminalEl = document.querySelector(".terminal");
    if (terminalEl && terminalEl.contains(e.target)) {
      document.getElementById("terminal-input")?.focus();
    }
  });
}

loadConfig();
