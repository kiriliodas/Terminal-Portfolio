import { executeCommand } from "./commands.js";
import { navigateHistory } from "./history.js";

export function setupTerminalInput() {
	const input = document.getElementById("terminal-input");
	const suggestion = document.getElementById("suggestion-overlay");
	const terminal = document.getElementById("terminal");

	if (!input || !suggestion) return;

	input.addEventListener("input", () => {
		updateInputWidth(input);
		updateSuggestion(input, suggestion);
	});

	input.addEventListener("keydown", (e) => {
		handleKeyboardInput(e, input, suggestion, terminal);
	});

	updateInputWidth(input);
}

export function updateInputWidth(input) {
	const tempSpan = document.createElement("span");
	tempSpan.style.cssText = "visibility:hidden;position:absolute;white-space:pre;";
	tempSpan.style.font = window.getComputedStyle(input).font;
	tempSpan.textContent = input.value || " ";

	document.body.appendChild(tempSpan);
	input.style.width = `${tempSpan.offsetWidth + 2}px`;
	document.body.removeChild(tempSpan);
}

function updateSuggestion(input, suggestion) {
	const value = input.value.toLowerCase();
	if (!value) {
		suggestion.textContent = "";
		return;
	}

	const matches = getAvailableCommands().filter((cmd) => cmd.startsWith(value));
	suggestion.textContent = matches.length > 0 ? matches[0].substring(value.length) : "";
}

function getAvailableCommands() {
	return [
		"help",
		"about",
		"skills",
		"contact",
		"history",
		"projects",
		"clear",
		"ls",
		"pwd",
		"whoami",
		"date",
		"uname",
		"echo",
		"tree",
		"color",
		"fortune",
	];
}

function handleKeyboardInput(e, input, suggestion, terminal) {
	if (isGalleryOpen() && shouldIgnoreKey(e.key)) return;

	setTimeout(() => updateInputWidth(input), 0);

	const keyHandlers = {
		Enter: () => handleEnterKey(input, suggestion, terminal),
		ArrowUp: () => {
			e.preventDefault();
			navigateHistory("up", input, suggestion);
		},
		ArrowDown: () => {
			e.preventDefault();
			navigateHistory("down", input, suggestion);
		},
		Tab: () => handleTabKey(e, input, suggestion),
		ArrowRight: () => handleTabKey(e, input, suggestion),
	};

	keyHandlers[e.key]?.();
}

function isGalleryOpen() {
	const gallery = document.getElementById("gallery-container");
	return gallery && gallery.style.display === "block";
}

function shouldIgnoreKey(key) {
	return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape"].includes(key);
}

function handleEnterKey(input, suggestion, terminal) {
	const command = input.value;
	const inputLine = document.querySelector(".input-line");

	appendCommandLine(terminal, inputLine, command);
	const output = createOutputElement(terminal, inputLine);

	input.value = "";
	suggestion.textContent = "";
	updateInputWidth(input);
	terminal.scrollTop = terminal.scrollHeight;

	processCommand(command, output, input);
}

function appendCommandLine(terminal, inputLine, command) {
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

function processCommand(command, output, input) {
	const result = executeCommand(command, false);
	if (result) {
		const span = document.createElement("span");
		output.appendChild(span);
		typeText(span, result, 10, () => input.focus());
	} else {
		input.focus();
	}
}

function handleTabKey(e, input, suggestion) {
	if (suggestion.textContent) {
		e.preventDefault();
		input.value += suggestion.textContent;
		suggestion.textContent = "";
		input.dispatchEvent(new Event("input"));
	}
}

function typeText(element, text, speed = 15, callback = null) {
	element.innerHTML = "";
	let index = 0;
	const terminal = document.getElementById("terminal");

	function type() {
		if (index < text.length) {
			element.innerHTML += text[index] === "\n" ? "<br>" : text[index];
			index++;
			terminal.scrollTop = terminal.scrollHeight;
			setTimeout(type, speed);
		} else if (callback) {
			callback();
		}
	}

	type();
}
