const themes = {
	default: { bg: "#0d1117", termBg: "#161b22", border: "#30363d" },
	matrix: { bg: "#000000", termBg: "#0a0e0a", border: "#00ff00" },
	dracula: { bg: "#1e1e2e", termBg: "#282a36", border: "#44475a" },
	monokai: { bg: "#1e1e1e", termBg: "#272822", border: "#3e3d32" },
	nord: { bg: "#2e3440", termBg: "#3b4252", border: "#4c566a" },
};

export function applyColorTheme(themeName) {
	const colors = themes[themeName] || themes.default;

	updateBodyBackground(colors.bg);
	updateTerminalStyles(colors.termBg, colors.border);
}

function updateBodyBackground(color) {
	document.body.style.background = color;
}

function updateTerminalStyles(bgColor, borderColor) {
	const terminal = document.querySelector(".terminal");
	if (terminal) {
		terminal.style.background = bgColor;
		terminal.style.borderColor = borderColor;
	}
}
