import { state } from "../state.js";
import { updateInputWidth } from "./input.js";
import { executeCommand } from "./commands.js";

export function navigateHistory(direction, input, suggestion) {
  const historyLength = state.commandHistory.length;

  if (direction === "up" && state.historyIndex < historyLength - 1) {
    state.historyIndex++;
    input.value = state.commandHistory[historyLength - 1 - state.historyIndex];
  } else if (direction === "down") {
    handleDownNavigation(input);
  }

  suggestion.textContent = "";
  updateInputWidth(input);
}

function handleDownNavigation(input) {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    input.value =
      state.commandHistory[
        state.commandHistory.length - 1 - state.historyIndex
      ];
  } else if (state.historyIndex === 0) {
    state.historyIndex = -1;
    input.value = "";
  }
}

export function setupQuickNavigation() {
  document.querySelectorAll(".quick-nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.getAttribute("data-command");
      executeCommandFromButton(command);
    });
  });
}

function executeCommandFromButton(commandText) {
  const input = document.getElementById("terminal-input");
  const terminal = document.getElementById("terminal");
  const inputLine = document.querySelector(".input-line");

  appendCommandToTerminal(terminal, inputLine, commandText);
  const output = createOutputElement(terminal, inputLine);
  terminal.scrollTop = terminal.scrollHeight;

  executeAndDisplay(commandText, output, input);
}

function appendCommandToTerminal(terminal, inputLine, command) {
  const commandLine = document.createElement("div");
  commandLine.innerHTML = `<span class="prompt">Blood@portfolio:~$ </span><span class="command">${command}</span>`;
  terminal.insertBefore(commandLine, inputLine);
}

function createOutputElement(terminal, inputLine) {
  const output = document.createElement("div");
  output.className = "output";
  terminal.insertBefore(output, inputLine);
  return output;
}

function executeAndDisplay(command, output, input) {
  const result = executeCommand(command, false);
  if (result) {
    const span = document.createElement("span");
    output.appendChild(span);
    typeText(span, result, 10, () => input.focus());
  } else {
    input.focus();
  }
}

function typeText(element, text, speed = 15, callback = null) {
  element.innerHTML = "";
  let index = 0;
  const terminal = document.getElementById("terminal");

  const escapeHtml = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeText = escapeHtml(text);

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const effectiveSpeed = prefersReducedMotion ? 0 : speed;

  function type() {
    if (index < safeText.length) {
      const char = safeText[index];
      element.innerHTML += char === "\n" ? "<br>" : char;
      index++;
      terminal.scrollTop = terminal.scrollHeight;
      if (effectiveSpeed === 0) {
        element.innerHTML = safeText.replace(/\n/g, "<br>");
        index = safeText.length;
        type();
        return;
      }
      setTimeout(type, effectiveSpeed);
    } else if (callback) {
      callback();
    }
  }

  type();
}
