// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
	config: {},
	commandHistory: [],
	historyIndex: -1,
	currentTheme: 0,
	gallery: {
		projects: [],
		currentProject: null,
		currentImageIndex: 0,
		isAnimating: false,
	},
};

// ============================================
// INITIALIZATION
// ============================================
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

	document.addEventListener("click", () => {
		document.getElementById("terminal-input")?.focus();
	});
}

// ============================================
// TERMINAL - INITIALIZATION & INPUT
// ============================================
function initializeTerminal() {
	const asciiArtElement = document.getElementById("ascii-art");
	const infoElement = document.querySelector(".info");
	const helpElement = document.querySelector(".command-help");

	infoElement.textContent = state.config.welcomeMessage;
	helpElement.textContent = "Use the buttons above or type 'help' for commands";
	typeAsciiArt(asciiArtElement, state.config.asciiArt, 40);
}

function setupTerminalInput() {
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

function updateInputWidth(input) {
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

	const matches = Object.keys(commands).filter((cmd) => cmd.startsWith(value));
	suggestion.textContent = matches.length > 0 ? matches[0].substring(value.length) : "";
}

function handleKeyboardInput(e, input, suggestion, terminal) {
	setTimeout(() => updateInputWidth(input), 0);

	switch (e.key) {
		case "Enter":
			handleEnterKey(input, suggestion, terminal);
			break;
		case "ArrowUp":
			e.preventDefault();
			navigateHistory("up", input, suggestion);
			break;
		case "ArrowDown":
			e.preventDefault();
			navigateHistory("down", input, suggestion);
			break;
		case "Tab":
		case "ArrowRight":
			if (suggestion.textContent) {
				e.preventDefault();
				input.value += suggestion.textContent;
				suggestion.textContent = "";
				input.dispatchEvent(new Event("input"));
			}
			break;
	}
}

function handleEnterKey(input, suggestion, terminal) {
	const command = input.value;
	const inputLine = document.querySelector(".input-line");

	const commandLine = document.createElement("div");
	commandLine.innerHTML = `<span class="prompt">Blood@portfolio:~$</span><span class="command">${command}</span>`;

	const output = document.createElement("div");
	output.className = "output";

	terminal.insertBefore(commandLine, inputLine);
	terminal.insertBefore(output, inputLine);

	input.value = "";
	suggestion.textContent = "";
	updateInputWidth(input);
	terminal.scrollTop = terminal.scrollHeight;

	const result = executeCommand(command, false);
	if (result) {
		const span = document.createElement("span");
		output.appendChild(span);
		typeText(span, result, 10, () => input.focus());
	} else {
		input.focus();
	}
}

function navigateHistory(direction, input, suggestion) {
	const historyLength = state.commandHistory.length;

	if (direction === "up" && state.historyIndex < historyLength - 1) {
		state.historyIndex++;
		input.value = state.commandHistory[historyLength - 1 - state.historyIndex];
	} else if (direction === "down") {
		if (state.historyIndex > 0) {
			state.historyIndex--;
			input.value = state.commandHistory[historyLength - 1 - state.historyIndex];
		} else if (state.historyIndex === 0) {
			state.historyIndex = -1;
			input.value = "";
		}
	}

	suggestion.textContent = "";
	updateInputWidth(input);
}

// ============================================
// TERMINAL - QUICK NAVIGATION
// ============================================
function setupQuickNavigation() {
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

	const commandLine = document.createElement("div");
	commandLine.innerHTML = `<span class="prompt">Blood@portfolio:~$</span><span class="command">${commandText}</span>`;

	const output = document.createElement("div");
	output.className = "output";

	terminal.insertBefore(commandLine, inputLine);
	terminal.insertBefore(output, inputLine);
	terminal.scrollTop = terminal.scrollHeight;

	const result = executeCommand(commandText, false);
	if (result) {
		const span = document.createElement("span");
		output.appendChild(span);
		typeText(span, result, 10, () => input.focus());
	} else {
		input.focus();
	}
}

// ============================================
// TERMINAL - COMMANDS
// ============================================
const commands = {
	help: () => `Available Commands:

about      - Learn about me
projects   - Open the projects gallery
skills     - View my technical skills
contact    - Get my contact information
history    - Show command history
clear      - Clear the terminal

System Commands:
ls         - List directory contents
pwd        - Print working directory
whoami     - Display current user
date       - Show current date and time
uname      - System information
echo       - Display a line of text
tree       - Display directory tree
color      - Change terminal color theme
fortune    - Display a random quote`,

	about: () => {
		const { personal } = state.config;
		return `About Me

Name: ${personal.name}
Role: ${personal.role}
Location: ${personal.location}

${personal.description}

Interests: ${personal.interests}`;
	},

	skills: () => {
		let output = `Technical Skills\n`;
		output += `${"─".repeat(50)}\n\n`;

		state.config.skills.forEach((skill, index) => {
			const indicators = {
				expert: "▰▰▰▰",
				advanced: "▰▰▰▱",
				intermediate: "▰▰▱▱",
				beginner: "▰▱▱▱",
			};

			const indicator = indicators[skill.level.toLowerCase()] || "▱▱▱▱";

			output += `  ${skill.name}\n`;
			output += `  ${indicator} ${skill.level}\n`;

			if (index < state.config.skills.length - 1) {
				output += `\n`;
			}
		});

		return output;
	},

	contact: () => {
		const { personal } = state.config;
		return `Contact Information

Email: ${personal.email}
Discord: ${personal.discord.replace("https://", "")}
GitHub: ${personal.github.replace("https://", "")}

Feel free to reach out for collaborations or opportunities!`;
	},

	history: () => {
		if (state.commandHistory.length === 0) {
			return "No commands in history";
		}
		return `Command History:\n\n${state.commandHistory.map((cmd, i) => `${i + 1}: ${cmd}`).join("\n")}`;
	},

	projects: () => {
		openGallery();
		return "Opening projects gallery...";
	},

	clear: () => {
		setTimeout(clearTerminal, 100);
		return "";
	},

	ls: () => `total 5
drwxr-xr-x  2 blood blood 4096 Oct  1 18:45 projects/
-rw-r--r--  1 blood blood 2973 Oct  1 22:56 config.json
-rw-r--r--  1 blood blood 4221 Oct  1 07:12 index.html
-rw-r--r--  1 blood blood 10286 Oct  1 15:43 style.css
-rw-r--r--  1 blood blood  26196 Oct  1 18:46 script.js`,

	pwd: () => `/internet/github/kiriliodas/terminal-portfolio`,

	whoami: () => `blood (Blood_Streams) (Owner)`,

	date: () => new Date().toString(),

	uname: () => `Linux terminal portfolio 5.15.0-blood #1 SMP ${new Date().toDateString()} x86_64 GNU/Linux`,

	echo: (args) => args.join(" ") || "",

	tree: () => `Terminal-Portfolio/
├── images/
│   ├── White-Cartoony/
│   │   ├── Image_1.png
│   │   ├── Image_2.png
│   │   ├── Image_3.png
│   │   ├── Image_4.png
│   │   ├── Image_5.png
│   │   ├── Image_6.png
│   │   ├── Image_7.png
│   │   ├── Image_8.png
│   │   └── Image_9.png
│   └── videos/
│       ├── high_size.mp4
│       ├── huge_size.mp4
│       ├── low_size.mp4
│       └── mid_size.mp4
├── config.json
├── index.html
├── script.js
└── style.css

3 directories, 17 files`,

	fortune: () => {
		if (!state.config.quotes || state.config.quotes.length === 0) {
			return "No quotes available in config.json";
		}
		return state.config.quotes[Math.floor(Math.random() * state.config.quotes.length)];
	},

	color: () => {
		const colors = ["default", "matrix", "dracula", "monokai", "nord"];
		const nextIndex = (state.currentTheme + 1) % colors.length;
		state.currentTheme = nextIndex;

		applyColorTheme(colors[nextIndex]);
		return `Color theme changed to: ${colors[nextIndex]}\nType 'color' again to cycle through themes`;
	},
};

function executeCommand(commandText, returnHtml = true) {
	const parts = commandText.trim().split(" ");
	const command = parts[0].toLowerCase();
	const args = parts.slice(1);

	if (commandText.trim()) {
		state.commandHistory.push(commandText.trim());
		state.historyIndex = -1;
	}

	if (commands[command]) {
		const result = commands[command](args);
		return returnHtml ? `<div class="section">${result.replace(/\n/g, "<br>")}</div>` : result;
	}

	if (command === "") return "";

	// Easter eggs
	const easterEggs = {
		sudo: `[sudo] password for blood: \nSorry, user blood is not in the sudoers file. This incident will be reported.`,
		exit: `logout\nConnection to portfolio closed.\n\nTo exit, simply close this tab.`,
		quit: `logout\nConnection to portfolio closed.\n\nTo exit, simply close this tab.`,
		nano: `nano: command not found\nHint: Use 'cat' to view files instead.`,
		vim: `vim: command not found\nHint: Use 'cat' to view files instead.`,
		vi: `vi: command not found\nHint: Use 'cat' to view files instead.`,
		ping: `PING blood.portfolio (127.0.0.1) 56(84) bytes of data.\n64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.042 ms\n64 bytes from localhost (127.0.0.1): icmp_seq=2 ttl=64 time=0.039 ms\n64 bytes from localhost (127.0.0.1): icmp_seq=3 ttl=64 time=0.041 ms\n^C\n--- blood.portfolio ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2048ms`,
	};

	if (easterEggs[command]) return easterEggs[command];

	if (command === "rm" && args.includes("-rf")) {
		return `rm: cannot remove '/': Permission denied\n[!] Error: Cannot delete portfolio. This is a feature, not a bug.`;
	}

	return `bash: ${command}: command not found\nType 'help' to see available commands`;
}

function clearTerminal() {
	const terminal = document.getElementById("terminal");
	terminal.innerHTML = `
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

	typeAsciiArt(document.getElementById("ascii-art"), state.config.asciiArt, 30);
	setupTerminalInput();
	document.getElementById("terminal-input")?.focus();
}

// ============================================
// COLOR THEME SYSTEM
// ============================================
function applyColorTheme(theme) {
	const themes = {
		default: { bg: "#0d1117", termBg: "#161b22", border: "#30363d" },
		matrix: { bg: "#000000", termBg: "#0a0e0a", border: "#00ff00" },
		dracula: { bg: "#1e1e2e", termBg: "#282a36", border: "#44475a" },
		monokai: { bg: "#1e1e1e", termBg: "#272822", border: "#3e3d32" },
		nord: { bg: "#2e3440", termBg: "#3b4252", border: "#4c566a" },
	};

	const colors = themes[theme] || themes.default;
	document.body.style.background = colors.bg;
	document.querySelector(".terminal").style.background = colors.termBg;
	document.querySelector(".terminal").style.borderColor = colors.border;
}

// ============================================
// ANIMATION UTILITIES
// ============================================
function typeAsciiArt(element, lines, speed = 20) {
	element.textContent = "";
	const maxLength = Math.max(...lines.map((line) => line.length));
	let currentColumn = 0;
	const displayLines = lines.map(() => "");

	function typeColumn() {
		if (currentColumn < maxLength) {
			for (let i = 0; i < lines.length; i++) {
				displayLines[i] += currentColumn < lines[i].length ? lines[i][currentColumn] : " ";
			}
			element.textContent = displayLines.join("\n");
			currentColumn++;
			setTimeout(typeColumn, speed);
		}
	}

	typeColumn();
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

// ============================================
// GALLERY - INITIALIZATION
// ============================================
function initializeGallery() {
	state.gallery.projects = [
		{
			name: "White Style Cartoony",
			folder: "White-Cartoony",
			images: [
				"Image_1.png",
				"Image_2.png",
				"Image_3.png",
				"Image_4.png",
				"Image_5.png",
				"Image_6.png",
				"Image_7.png",
				"Image_8.png",
				"Image_9.png",
			],
		},
		{
			name: "Videos Test",
			folder: "videos",
			images: ["low_size.mp4", "mid_size.mp4", "high_size.mp4", "huge_size.mp4"],
		},
	];

	populateProjectList();
}

function setupGalleryControls() {
	document.getElementById("gallery-close")?.addEventListener("click", closeGallery);
	document.getElementById("prev-btn")?.addEventListener("click", showPreviousImage);
	document.getElementById("next-btn")?.addEventListener("click", showNextImage);
	setupGalleryKeyboardControls();
}

function setupGalleryKeyboardControls() {
	document.addEventListener("keydown", (e) => {
		const galleryContainer = document.getElementById("gallery-container");
		if (!galleryContainer || galleryContainer.style.display !== "block") return;

		if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"].includes(e.key)) {
			e.preventDefault();
		}

		const actions = {
			ArrowLeft: showPreviousImage,
			ArrowRight: showNextImage,
			ArrowUp: selectPreviousProject,
			ArrowDown: selectNextProject,
			Escape: closeGallery,
		};

		actions[e.key]?.();
	});
}

function populateProjectList() {
	const projectList = document.getElementById("project-list");
	if (!projectList) return;

	projectList.innerHTML = "";
	state.gallery.projects.forEach((project) => {
		const projectItem = document.createElement("div");
		projectItem.className = "project-item";
		projectItem.textContent = project.name;
		projectItem.addEventListener("click", () => selectProject(project));
		projectList.appendChild(projectItem);
	});
}

// ============================================
// GALLERY - CONTROLS
// ============================================
function openGallery() {
	const container = document.getElementById("gallery-container");
	if (!container) return;

	container.style.display = "block";
	container.style.opacity = "0";

	setTimeout(() => {
		container.classList.add("opening");
		container.style.opacity = "1";
	}, 10);

	setTimeout(() => {
		if (state.gallery.projects.length > 0 && !state.gallery.currentProject) {
			selectProject(state.gallery.projects[0]);
		}
	}, 100);
}

function closeGallery() {
	const container = document.getElementById("gallery-container");
	if (!container) return;

	container.style.opacity = "0";
	container.classList.remove("opening");

	setTimeout(() => {
		container.style.display = "none";
		state.gallery.currentProject = null;
		state.gallery.currentImageIndex = 0;
	}, 300);
}

function selectProject(project) {
	state.gallery.currentProject = project;
	state.gallery.currentImageIndex = 0;

	document.querySelectorAll(".project-item").forEach((item) => {
		item.classList.toggle("active", item.textContent === project.name);
	});

	showCurrentImage();
}

function selectNextProject() {
	const { currentProject, isAnimating } = state.gallery;
	if (isAnimating || !currentProject) return;

	const currentIndex = state.gallery.projects.findIndex((p) => p.name === currentProject.name);
	if (currentIndex < state.gallery.projects.length - 1) {
		selectProject(state.gallery.projects[currentIndex + 1]);
	}
}

function selectPreviousProject() {
	const { currentProject, isAnimating } = state.gallery;
	if (isAnimating || !currentProject) return;

	const currentIndex = state.gallery.projects.findIndex((p) => p.name === currentProject.name);
	if (currentIndex > 0) {
		selectProject(state.gallery.projects[currentIndex - 1]);
	}
}

// ============================================
// GALLERY - IMAGE/VIDEO DISPLAY
// ============================================
function showCurrentImage(direction = null) {
	const { currentProject, currentImageIndex } = state.gallery;
	if (!currentProject || !currentProject.images) return;

	const container = document.getElementById("image-container");
	const counter = document.getElementById("image-counter");
	if (!container || !counter) return;

	if (currentProject.images.length === 0) {
		container.innerHTML = '<div style="color: #8b949e; text-align: center;">No images available</div>';
		counter.textContent = "0/0";
		state.gallery.isAnimating = false;
		return;
	}

	const currentFile = currentProject.images[currentImageIndex];
	const isVideo = isVideoFile(currentFile);

	if (!direction) {
		container.innerHTML = "";
		isVideo
			? displayVideo(container, currentFile, currentProject)
			: displayImage(container, currentFile, currentProject);
		state.gallery.isAnimating = false;
	} else {
		const oldImage = container.querySelector(".gallery-image");

		if (oldImage) {
			oldImage.classList.remove("active");
			oldImage.classList.add(direction === "next" ? "slide-out-left" : "slide-out-right");

			const tempContainer = document.createElement("div");
			isVideo
				? displayVideo(tempContainer, currentFile, currentProject)
				: displayImage(tempContainer, currentFile, currentProject);

			const newImage = tempContainer.querySelector(".gallery-image");
			if (newImage) {
				newImage.classList.remove("active");
				newImage.classList.add(direction === "next" ? "slide-in-right" : "slide-in-left");
				container.appendChild(newImage);
				newImage.offsetHeight;

				setTimeout(() => {
					newImage.classList.remove("slide-in-left", "slide-in-right");
					newImage.classList.add("active");
				}, 10);

				setTimeout(() => {
					oldImage?.remove();
					state.gallery.isAnimating = false;
				}, 450);
			} else {
				state.gallery.isAnimating = false;
			}
		} else {
			container.innerHTML = "";
			isVideo
				? displayVideo(container, currentFile, currentProject)
				: displayImage(container, currentFile, currentProject);
			state.gallery.isAnimating = false;
		}
	}

	counter.textContent = `${currentImageIndex + 1}/${currentProject.images.length}`;
}

function displayImage(container, filename, project) {
	const img = document.createElement("img");
	img.className = "gallery-image active";
	img.src = filename.startsWith("http") ? filename : `images/${project.folder}/${filename}`;
	img.alt = `${project.name} - Image ${state.gallery.currentImageIndex + 1}`;
	img.onerror = () => (img.src = "https://via.placeholder.com/400x300/161b22/58a6ff?text=Image+not+found");
	container.appendChild(img);
}

function displayVideo(container, filename, project) {
	const video = document.createElement("video");
	video.className = "gallery-image active";
	video.controls = true;
	video.src = filename.startsWith("http") ? filename : `images/${project.folder}/${filename}`;
	video.alt = `${project.name} - Video ${state.gallery.currentImageIndex + 1}`;
	video.onerror = () =>
		(container.innerHTML =
			'<div style="color: #f85149; text-align: center; padding: 20px;">Video could not be loaded</div>');
	container.appendChild(video);
}

function isVideoFile(filename) {
	return [".mp4", ".webm", ".ogg", ".mov"].some((ext) => filename.toLowerCase().endsWith(ext));
}

function showNextImage() {
	const { currentProject, currentImageIndex, isAnimating } = state.gallery;
	if (isAnimating || !currentProject?.images || currentImageIndex >= currentProject.images.length - 1) return;

	state.gallery.isAnimating = true;
	state.gallery.currentImageIndex++;
	showCurrentImage("next");
}

function showPreviousImage() {
	const { currentProject, currentImageIndex, isAnimating } = state.gallery;
	if (isAnimating || !currentProject?.images || currentImageIndex <= 0) return;

	state.gallery.isAnimating = true;
	state.gallery.currentImageIndex--;
	showCurrentImage("prev");
}

// ============================================
// START APPLICATION
// ============================================
loadConfig();
