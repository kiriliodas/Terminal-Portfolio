// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
  config: {},
  commandHistory: [],
  historyIndex: -1,
  gallery: {
    projects: [],
    currentProject: null,
    currentImageIndex: 0,
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

// ============================================
// TERMINAL - INITIALIZATION
// ============================================
function initializeTerminal() {
  const asciiArtElement = document.getElementById("ascii-art");
  const infoElement = document.querySelector(".info");
  const helpElement = document.querySelector(".command-help");

  infoElement.textContent = state.config.welcomeMessage;
  helpElement.textContent = "Use the buttons above or type 'help' for commands";

  typeAsciiArt(asciiArtElement, state.config.asciiArt, 40);
}

function setupEventListeners() {
  setupTerminalInput();
  setupQuickNavigation();
  setupGalleryControls();

  // Auto-focus on terminal input when clicking anywhere
  document.addEventListener("click", () => {
    document.getElementById("terminal-input")?.focus();
  });
}

// ============================================
// TERMINAL - INPUT HANDLING
// ============================================
function setupTerminalInput() {
  const input = document.getElementById("terminal-input");
  const suggestion = document.getElementById("suggestion-overlay");
  const terminal = document.getElementById("terminal");

  if (!input || !suggestion) return;

  // Handle input changes
  input.addEventListener("input", () => {
    updateInputWidth(input);
    updateSuggestion(input, suggestion);
  });

  // Handle keyboard events
  input.addEventListener("keydown", (e) => {
    handleKeyboardInput(e, input, suggestion, terminal);
  });

  // Initial width
  updateInputWidth(input);
}

function updateInputWidth(input) {
  const tempSpan = document.createElement("span");
  tempSpan.style.cssText =
    "visibility:hidden;position:absolute;white-space:pre;";
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
  suggestion.textContent =
    matches.length > 0 ? matches[0].substring(value.length) : "";
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

  // Display command
  const commandLine = document.createElement("div");
  commandLine.innerHTML = `<span class="prompt">Blood@portfolio:~$</span><span class="command">${command}</span>`;

  // Create output container
  const output = document.createElement("div");
  output.className = "output";

  // Insert before input line
  terminal.insertBefore(commandLine, inputLine);
  terminal.insertBefore(output, inputLine);

  // Clear input
  input.value = "";
  suggestion.textContent = "";
  updateInputWidth(input);
  terminal.scrollTop = terminal.scrollHeight;

  // Execute command
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
      input.value =
        state.commandHistory[historyLength - 1 - state.historyIndex];
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

  // Display command
  const commandLine = document.createElement("div");
  commandLine.innerHTML = `<span class="prompt">Blood@portfolio:~$</span><span class="command">${commandText}</span>`;

  // Create output container
  const output = document.createElement("div");
  output.className = "output";

  // Insert before input line
  terminal.insertBefore(commandLine, inputLine);
  terminal.insertBefore(output, inputLine);
  terminal.scrollTop = terminal.scrollHeight;

  // Execute command
  const result = executeCommand(commandText, false);
  if (result) {
    const span = document.createElement("span");
    output.appendChild(span);
    typeText(
      span,
      result.replace(/<br>/g, "\n").replace(/<[^>]+>/g, ""),
      10,
      () => input.focus()
    );
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
clear      - Clear the terminal`,

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
    return `Command History:\n\n${state.commandHistory
      .map((cmd, i) => `${i + 1}: ${cmd}`)
      .join("\n")}`;
  },

  projects: () => {
    openGallery();
    return "Opening projects gallery...";
  },

  clear: () => {
    setTimeout(() => {
      clearTerminal();
    }, 100);
    return "";
  },
};

function executeCommand(commandText, returnHtml = true) {
  const command = commandText.trim().toLowerCase();

  // Add to history
  if (command) {
    state.commandHistory.push(command);
    state.historyIndex = -1;
  }

  // Execute command
  if (commands[command]) {
    const result = commands[command]();
    return returnHtml
      ? `<div class="section">${result.replace(/\n/g, "<br>")}</div>`
      : result;
  }

  if (command === "") return "";

  return `Command not found: ${command}\nType 'help' to see available commands`;
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
// ANIMATION UTILITIES
// ============================================
function typeAsciiArt(element, lines, speed = 20) {
  element.innerHTML = "";

  const maxLength = Math.max(...lines.map((line) => line.length));
  let currentColumn = 0;
  const displayLines = lines.map(() => "");

  function typeColumn() {
    if (currentColumn < maxLength) {
      for (let i = 0; i < lines.length; i++) {
        displayLines[i] +=
          currentColumn < lines[i].length ? lines[i][currentColumn] : " ";
      }
      element.innerHTML = displayLines.join("\n");
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
      name: "Anime Project",
      folder: "anime",
      images: ["image-13.jpg", "image-14.jpg", "image-23.jpg", "image-34.jpg"],
    },
    {
      name: "Cartoony Project",
      folder: "cartoony",
      images: ["image-90.jpg", "image-92.jpg", "image-95.jpg"],
    },
    {
      name: "Videos Test",
      folder: "videos",
      images: [
        "low_size.mp4",
        "mid_size.mp4",
        "high_size.mp4",
        "huge_size.mp4",
      ],
    },
  ];

  populateProjectList();
}

function setupGalleryControls() {
  document
    .getElementById("gallery-close")
    ?.addEventListener("click", closeGallery);
  document
    .getElementById("prev-btn")
    ?.addEventListener("click", showPreviousImage);
  document.getElementById("next-btn")?.addEventListener("click", showNextImage);
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

  // Update active state
  document.querySelectorAll(".project-item").forEach((item) => {
    if (item.textContent === project.name) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  showCurrentImage();
}

// ============================================
// GALLERY - IMAGE/VIDEO DISPLAY
// ============================================
function showCurrentImage() {
  const { currentProject, currentImageIndex } = state.gallery;
  if (!currentProject || !currentProject.images) return;

  const container = document.getElementById("image-container");
  const counter = document.getElementById("image-counter");
  if (!container || !counter) return;

  container.innerHTML = "";

  if (currentProject.images.length === 0) {
    container.innerHTML =
      '<div style="color: #8b949e; text-align: center;">No images available</div>';
    counter.textContent = "0/0";
    return;
  }

  const currentFile = currentProject.images[currentImageIndex];
  const isVideo = isVideoFile(currentFile);

  if (isVideo) {
    displayVideo(container, currentFile, currentProject);
  } else {
    displayImage(container, currentFile, currentProject);
  }

  counter.textContent = `${currentImageIndex + 1}/${
    currentProject.images.length
  }`;
}

function displayImage(container, filename, project) {
  const img = document.createElement("img");
  img.className = "gallery-image";
  img.src = filename.startsWith("http")
    ? filename
    : `images/${project.folder}/${filename}`;
  img.alt = `${project.name} - Image ${state.gallery.currentImageIndex + 1}`;

  img.onerror = () => {
    img.src =
      "https://via.placeholder.com/400x300/161b22/58a6ff?text=Image+not+found";
  };

  container.appendChild(img);
}

function displayVideo(container, filename, project) {
  const video = document.createElement("video");
  video.className = "gallery-image";
  video.controls = true;
  video.autoplay = false;
  video.loop = false;
  video.src = filename.startsWith("http")
    ? filename
    : `images/${project.folder}/${filename}`;
  video.alt = `${project.name} - Video ${state.gallery.currentImageIndex + 1}`;

  video.onerror = () => {
    container.innerHTML =
      '<div style="color: #f85149; text-align: center; padding: 20px;">Video could not be loaded</div>';
  };

  container.appendChild(video);
}

function isVideoFile(filename) {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
  return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

function showNextImage() {
  const { currentProject, currentImageIndex } = state.gallery;
  if (
    currentProject &&
    currentProject.images &&
    currentImageIndex < currentProject.images.length - 1
  ) {
    state.gallery.currentImageIndex++;
    showCurrentImage();
  }
}

function showPreviousImage() {
  const { currentProject, currentImageIndex } = state.gallery;
  if (currentProject && currentProject.images && currentImageIndex > 0) {
    state.gallery.currentImageIndex--;
    showCurrentImage();
  }
}

// ============================================
// START APPLICATION
// ============================================
loadConfig();
