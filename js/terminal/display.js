import { state } from "../state.js";
import { typeAsciiArt } from "../utils/animations.js";
import { setupTerminalInput } from "./input.js";

export function initializeTerminal() {
	const asciiArtElement = document.getElementById("ascii-art");
	const infoElement = document.querySelector(".info");
	const helpElement = document.querySelector(".command-help");

	setWelcomeMessages(infoElement, helpElement);
	typeAsciiArt(asciiArtElement, state.config.asciiArt, 40);
}

function setWelcomeMessages(infoElement, helpElement) {
	infoElement.textContent = state.config.welcomeMessage;
	helpElement.textContent = "Use the buttons above or type 'help' for commands";
}

export function clearTerminal() {
	const terminal = document.getElementById("terminal");
	terminal.innerHTML = buildTerminalHTML();

	const asciiElement = document.getElementById("ascii-art");
	typeAsciiArt(asciiElement, state.config.asciiArt, 30);

	setupTerminalInput();
	focusInput();
}

function buildTerminalHTML() {
	return `
    <div class="output">
      <div class="ascii-art" id="ascii-art"></div>
    </div>
    <div class="output">
      <span class="info">${state.config.welcomeMessage}</span>
    </div>
    <div class="output">
      <span class="command-help">Use the buttons above or type 'help' for commands</span>
    </div>
    <br>
    <div class="input-line">
      <span class="prompt">Blood@portfolio:~$</span>
      <input type="text" class="terminal-input" id="terminal-input" autocomplete="off">
      <span class="suggestion-overlay" id="suggestion-overlay"></span>
    </div>
  `;
}

function focusInput() {
	document.getElementById("terminal-input")?.focus();
}
