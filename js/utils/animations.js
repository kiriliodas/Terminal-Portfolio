export function typeAsciiArt(element, lines, speed = 20) {
	element.textContent = "";
	const maxLength = Math.max(...lines.map((line) => line.length));
	let currentColumn = 0;
	const displayLines = lines.map(() => "");

	function typeColumn() {
		if (currentColumn < maxLength) {
			updateDisplayLines(lines, displayLines, currentColumn);
			element.textContent = displayLines.join("\n");
			currentColumn++;
			setTimeout(typeColumn, speed);
		}
	}

	typeColumn();
}

function updateDisplayLines(sourceLines, displayLines, columnIndex) {
	for (let i = 0; i < sourceLines.length; i++) {
		displayLines[i] += columnIndex < sourceLines[i].length ? sourceLines[i][columnIndex] : " ";
	}
}
