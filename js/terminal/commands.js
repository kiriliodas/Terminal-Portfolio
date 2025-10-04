import { state, addToHistory } from "../state.js";
import { clearTerminal } from "./display.js";
import { openGallery } from "../gallery/controls.js";
import { applyColorTheme } from "../utils/themes.js";

const commands = {
	help: getHelpText,
	about: getAboutText,
	skills: getSkillsText,
	contact: getContactText,
	history: getHistoryText,
	projects: openProjectsGallery,
	clear: handleClear,
	ls: getLsOutput,
	pwd: getPwdOutput,
	whoami: getWhoamiOutput,
	date: getDateOutput,
	uname: getUnameOutput,
	echo: handleEcho,
	tree: getTreeOutput,
	fortune: getRandomQuote,
	color: cycleColorTheme,
};

export function executeCommand(commandText, returnHtml = true) {
	const parts = commandText.trim().split(" ");
	const command = parts[0].toLowerCase();
	const args = parts.slice(1);

	if (commandText.trim()) {
		addToHistory(commandText.trim());
	}

	if (commands[command]) {
		const result = commands[command](args);
		return returnHtml ? `<div class="section">${result.replace(/\n/g, "<br>")}</div>` : result;
	}

	if (command === "") return "";

	const easterEgg = getEasterEgg(command, args);
	if (easterEgg) return easterEgg;

	return `bash: ${command}: command not found\nType 'help' to see available commands`;
}

function getHelpText() {
	return `Available Commands:

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
fortune    - Display a random quote`;
}

function getAboutText() {
	const { personal } = state.config;
	return `About Me

Name: ${personal.name}
Role: ${personal.role}
Location: ${personal.location}

${personal.description}

Interests: ${personal.interests}`;
}

function getSkillsText() {
	let output = `Technical Skills\n`;
	output += `${"─".repeat(50)}\n\n`;

	const indicators = {
		expert: "▰▰▰▰",
		advanced: "▰▰▰▱",
		intermediate: "▰▰▱▱",
		beginner: "▰▱▱▱",
	};

	state.config.skills.forEach((skill, index) => {
		const indicator = indicators[skill.level.toLowerCase()] || "▱▱▱▱";
		output += `  ${skill.name}\n`;
		output += `  ${indicator} ${skill.level}\n`;
		if (index < state.config.skills.length - 1) {
			output += `\n`;
		}
	});

	return output;
}

function getContactText() {
	const { personal } = state.config;
	return `Contact Information

Email: ${personal.email}
Discord: ${personal.discord.replace("https://", "")}
GitHub: ${personal.github.replace("https://", "")}

Feel free to reach out for collaborations or opportunities!`;
}

function getHistoryText() {
	if (state.commandHistory.length === 0) {
		return "No commands in history";
	}
	return `Command History:\n\n${state.commandHistory.map((cmd, i) => `${i + 1}: ${cmd}`).join("\n")}`;
}

function openProjectsGallery() {
	openGallery();
	return "Opening projects gallery...";
}

function handleClear() {
	setTimeout(clearTerminal, 100);
	return "";
}

function getLsOutput() {
	return `total 8
-rw-r--r--  1 blood blood  10721 Oct  3 22:43 config.json
drwxr-xr-x  2 blood blood  12714 Oct  4 22:23 css/
drwxr-xr-x  2 blood blood 39591239 Oct  3 23:56 images/
-rw-r--r--  1 blood blood   3619 Oct  4 22:23 index.html
drwxr-xr-x  2 blood blood  27856 Oct  4 22:23 js/
drwxr-xr-x  2 blood blood   3130 Oct  4 22:39 python/`;
}

function getPwdOutput() {
	return `/internet/github/kiriliodas/terminal-portfolio`;
}

function getWhoamiOutput() {
	return `blood (Blood_Streams) (Owner)`;
}

function getDateOutput() {
	return new Date().toString();
}

function getUnameOutput() {
	return `Linux terminal portfolio 5.15.0-blood #1 SMP ${new Date().toDateString()} x86_64 GNU/Linux`;
}

function handleEcho(args) {
	return args.join(" ") || "";
}

function getTreeOutput() {
	return `Terminal-Portfolio/
├── css/
│   ├── animations.css
│   ├── base.css
│   ├── gallery.css
│   ├── navigation.css
│   └── terminal.css
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
├── js/
│   ├── gallery/
│   │   ├── controls.js
│   │   ├── display.js
│   │   └── navigation.js
│   ├── terminal/
│   │   ├── commands.js
│   │   ├── display.js
│   │   ├── history.js
│   │   └── input.js
│   ├── utils/
│   │   ├── animations.js
│   │   └── themes.js
│   ├── main.js
│   └── state.js
├── config.json
└── index.html

8 directories, 31 files`;
}

function getRandomQuote() {
	if (!state.config.quotes || state.config.quotes.length === 0) {
		return "No quotes available in config.json";
	}
	return state.config.quotes[Math.floor(Math.random() * state.config.quotes.length)];
}

function cycleColorTheme() {
	const colors = ["default", "matrix", "dracula", "monokai", "nord"];
	const nextIndex = (state.currentTheme + 1) % colors.length;
	state.currentTheme = nextIndex;

	applyColorTheme(colors[nextIndex]);
	return `Color theme changed to: ${colors[nextIndex]}\nType 'color' again to cycle through themes`;
}

function getEasterEgg(command, args) {
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

	return null;
}
