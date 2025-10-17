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
      const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const delay = prefersReducedMotion ? 0 : speed;
      if (delay === 0) {
        // Jump to final state when reduced motion is requested
        while (currentColumn < maxLength) {
          updateDisplayLines(lines, displayLines, currentColumn);
          currentColumn++;
        }
        element.textContent = displayLines.join("\n");
        return;
      }
      setTimeout(typeColumn, delay);
    }
  }

  typeColumn();
}

function updateDisplayLines(sourceLines, displayLines, columnIndex) {
  for (let i = 0; i < sourceLines.length; i++) {
    displayLines[i] +=
      columnIndex < sourceLines[i].length ? sourceLines[i][columnIndex] : " ";
  }
}
