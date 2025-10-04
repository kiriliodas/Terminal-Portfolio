import { state } from "./state.js";
import { initializeTerminal } from "./terminal/display.js";
import { setupTerminalInput } from "./terminal/input.js";
import { initializeGallery, setupGalleryControls } from "./gallery/controls.js";
import { setupQuickNavigation } from "./terminal/history.js";

async function loadConfig() {
	try {
		const response = await fetch("config.json");
		state.config = await response.json();
		initializeApp();
	} catch (error) {
		console.error("Error loading config:", error);
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
	document.addEventListener("click", () => {
		document.getElementById("terminal-input")?.focus();
	});
}

loadConfig();
