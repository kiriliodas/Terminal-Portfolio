let config = {},
  commandHistory = [],
  historyIndex = -1,
  galleryProjects = [],
  currentProject = null,
  currentImageIndex = 0;

async function loadConfig() {
  try {
    config = await (await fetch("config.json")).json();
    initializeTerminal();
  } catch (e) {
    console.error("Error loading config:", e);
  }
}

function initializeTerminal() {
  let e = document.getElementById("ascii-art");
  document.querySelector(".info").textContent = config.welcomeMessage;
  document.querySelector(".command-help").textContent =
    "Use the buttons above or type 'help' for commands";
  typeAsciiArt(e, config.asciiArt, 40);
  initGallery();
  setupTerminal();
  setupQuickNav();
}

function typeAsciiArt(e, t, n = 20) {
  e.innerHTML = "";
  let r = Math.max(...t.map((e) => e.length)),
    o = 0,
    l = t.map(() => "");
  !(function a() {
    if (o < r) {
      for (let i = 0; i < t.length; i++)
        o < t[i].length ? (l[i] += t[i][o]) : (l[i] += " ");
      e.innerHTML = l.join("\n");
      o++;
      setTimeout(a, n);
    }
  })();
}

function typeText(e, t, n = 15, r = null) {
  e.innerHTML = "";
  let o = 0,
    l = document.getElementById("terminal");
  !(function a() {
    o < t.length
      ? ((e.innerHTML += "\n" === t[o] ? "<br>" : t[o]),
        o++,
        (l.scrollTop = l.scrollHeight),
        setTimeout(a, n))
      : r && r();
  })();
}

function setupQuickNav() {
  document.querySelectorAll(".quick-nav-btn").forEach((e) => {
    e.addEventListener("click", () => {
      executeCommandFromButton(e.getAttribute("data-command"));
    });
  });
}

function executeCommandFromButton(e) {
  let t = document.getElementById("terminal-input"),
    n = document.getElementById("terminal"),
    r = document.createElement("div");
  r.innerHTML = `<span class="prompt">Blood@portfolio:~$</span><span class="command">${e}</span>`;
  let o = document.createElement("div");
  o.className = "output";
  let l = document.querySelector(".input-line");
  n.insertBefore(r, l);
  n.insertBefore(o, l);
  n.scrollTop = n.scrollHeight;
  let a = executeCommand(e, !1);
  if (a) {
    let i = document.createElement("span");
    o.appendChild(i);
    typeText(i, a.replace(/<br>/g, "\n").replace(/<[^>]+>/g, ""), 10, () => {
      t.focus();
    });
  } else t.focus();
}

function initGallery() {
  try {
    galleryProjects = [
      {
        name: "Anime Project",
        folder: "anime",
        images: [
          "image-13.jpg",
          "image-14.jpg",
          "image-23.jpg",
          "image-34.jpg",
        ],
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
    document
      .getElementById("gallery-close")
      .addEventListener("click", closeGallery);
    document
      .getElementById("prev-btn")
      .addEventListener("click", showPreviousImage);
    document
      .getElementById("next-btn")
      .addEventListener("click", showNextImage);
    populateProjectList();
  } catch (e) {
    console.error("Erreur lors de l'initialisation de la galerie:", e);
  }
}

function isVideoFile(filename) {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
  return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

function openGallery() {
  let e = document.getElementById("gallery-container");
  e.style.display = "block";
  e.style.opacity = "0";
  setTimeout(() => {
    e.classList.add("opening");
    e.style.opacity = "1";
  }, 10);
  setTimeout(() => {
    galleryProjects.length > 0 &&
      !currentProject &&
      selectProject(galleryProjects[0]);
  }, 100);
}

function closeGallery() {
  let e = document.getElementById("gallery-container");
  e.style.opacity = "0";
  e.classList.remove("opening");
  setTimeout(() => {
    e.style.display = "none";
    currentProject = null;
    currentImageIndex = 0;
  }, 300);
}

function populateProjectList() {
  let e = document.getElementById("project-list");
  e.innerHTML = "";
  galleryProjects.forEach((t) => {
    let n = document.createElement("div");
    n.className = "project-item";
    n.textContent = t.name;
    n.addEventListener("click", () => selectProject(t));
    e.appendChild(n);
  });
}

function selectProject(e) {
  currentProject = e;
  currentImageIndex = 0;
  document.querySelectorAll(".project-item").forEach((t) => {
    t.textContent === e.name
      ? t.classList.add("active")
      : t.classList.remove("active");
  });
  showCurrentImage();
}

function showCurrentImage() {
  if (!currentProject || !currentProject.images) return;

  let container = document.getElementById("image-container");
  let counter = document.getElementById("image-counter");

  container.innerHTML = "";

  if (currentProject.images.length > 0) {
    const currentFile = currentProject.images[currentImageIndex];
    const isVideo = isVideoFile(currentFile);

    if (isVideo) {
      let video = document.createElement("video");
      video.className = "gallery-image";
      video.controls = true;
      video.autoplay = false;
      video.loop = false;

      if (currentFile.startsWith("http")) {
        video.src = currentFile;
      } else {
        video.src = `images/${currentProject.folder}/${currentFile}`;
      }

      video.alt = `${currentProject.name} - Video ${currentImageIndex + 1}`;

      video.onerror = () => {
        container.innerHTML =
          '<div style="color: #f85149; text-align: center; padding: 20px;">Video could not be loaded</div>';
      };

      container.appendChild(video);
    } else {
      let img = document.createElement("img");
      img.className = "gallery-image";

      if (currentFile.startsWith("http")) {
        img.src = currentFile;
      } else {
        img.src = `images/${currentProject.folder}/${currentFile}`;
      }

      img.alt = `${currentProject.name} - Image ${currentImageIndex + 1}`;

      img.onerror = () => {
        img.src =
          "https://via.placeholder.com/400x300/161b22/58a6ff?text=Image+not+found";
      };

      container.appendChild(img);
    }

    counter.textContent = `${currentImageIndex + 1}/${
      currentProject.images.length
    }`;
  } else {
    container.innerHTML =
      '<div style="color: #8b949e; text-align: center;">No images available</div>';
    counter.textContent = "0/0";
  }
}

function showNextImage() {
  currentProject &&
    currentProject.images &&
    currentImageIndex < currentProject.images.length - 1 &&
    (currentImageIndex++, showCurrentImage());
}

function showPreviousImage() {
  currentProject &&
    currentProject.images &&
    currentImageIndex > 0 &&
    (currentImageIndex--, showCurrentImage());
}

const commands = {
  help: () => `Available Commands:

about      - Learn about me
projects   - Open the projects gallery
skills     - View my technical skills
contact    - Get my contact information
history    - Show command history
clear      - Clear the terminal`,
  about() {
    let { personal: e } = config;
    return `About Me

Name: ${e.name}
Role: ${e.role}
Location: ${e.location}

${e.description}

Interests: ${e.interests}`;
  },
  skills: () => {
    let output = `Technical Skills\n`;
    output += `${"─".repeat(50)}\n\n`;

    config.skills.forEach((skill, index) => {
      let indicator = "";

      switch (skill.level.toLowerCase()) {
        case "expert":
          indicator = "▰▰▰▰";
          break;
        case "advanced":
          indicator = "▰▰▰▱";
          break;
        case "intermediate":
          indicator = "▰▰▱▱";
          break;
        case "beginner":
          indicator = "▰▱▱▱";
          break;
      }

      output += `  ${skill.name}\n`;
      output += `  ${indicator} ${skill.level}\n`;

      if (index < config.skills.length - 1) {
        output += `\n`;
      }
    });

    return output;
  },
  contact() {
    let { personal: e } = config;
    return `Contact Information

Email: ${e.email}
Discord: ${e.discord.replace("https://", "")}
GitHub: ${e.github.replace("https://", "")}

Feel free to reach out for collaborations or opportunities!`;
  },
  history: () =>
    0 === commandHistory.length
      ? "No commands in history"
      : `Command History:

${commandHistory.map((e, t) => `${t + 1}: ${e}`).join("\n")}`,
  projects: () => (openGallery(), "Opening projects gallery..."),
  clear: () => (
    setTimeout(() => {
      document.getElementById("terminal").innerHTML = `
                <div class="output">
                    <div class="ascii-art" id="ascii-art"></div>
                </div>
                <div class="output">
                    <span class="info">${config.welcomeMessage}</span>
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
      typeAsciiArt(document.getElementById("ascii-art"), config.asciiArt, 30);
      setupTerminal();
      let e = document.getElementById("terminal-input");
      e && e.focus();
    }, 100),
    ""
  ),
};

function executeCommand(e, t = !0) {
  let n = e.trim().toLowerCase();
  if ((commandHistory.push(n), (historyIndex = -1), commands[n])) {
    let r = commands[n]();
    return t ? `<div class="section">${r.replace(/\n/g, "<br>")}</div>` : r;
  }
  return "" === n
    ? ""
    : `Command not found: ${n}
Type 'help' to see available commands`;
}

function setupTerminal() {
  let terminal = document.getElementById("terminal"),
    input = document.getElementById("terminal-input"),
    suggestion = document.getElementById("suggestion-overlay");

  if (!suggestion) {
    suggestion = document.createElement("span");
    suggestion.id = "suggestion-overlay";
    suggestion.className = "suggestion-overlay";
    let inputLine = document.querySelector(".input-line");
  }

  function updateInputWidth() {
    let tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.whiteSpace = "pre";
    tempSpan.style.font = window.getComputedStyle(input).font;
    tempSpan.textContent = input.value || " ";
    document.body.appendChild(tempSpan);

    input.style.width = tempSpan.offsetWidth + 2 + "px";
    document.body.removeChild(tempSpan);
  }

  input.addEventListener("input", () => {
    updateInputWidth();

    let value = input.value.toLowerCase();
    if (!value) {
      suggestion.textContent = "";
      return;
    }

    let matches = Object.keys(commands).filter((cmd) => cmd.startsWith(value));
    if (matches.length > 0) {
      suggestion.textContent = matches[0].substring(value.length);
    } else {
      suggestion.textContent = "";
    }
  });

  updateInputWidth();

  input.addEventListener("keydown", (e) => {
    setTimeout(updateInputWidth, 0);

    if (e.key === "Enter") {
      let command = input.value;
      let commandLine = document.createElement("div");
      commandLine.innerHTML = `<span class="prompt">Blood@portfolio:~$</span><span class="command">${command}</span>`;
      let output = document.createElement("div");
      output.className = "output";
      let inputLine = document.querySelector(".input-line");
      terminal.insertBefore(commandLine, inputLine);
      terminal.insertBefore(output, inputLine);
      input.value = "";
      suggestion.textContent = "";
      terminal.scrollTop = terminal.scrollHeight;
      updateInputWidth();

      let result = executeCommand(command, !1);
      if (result) {
        let span = document.createElement("span");
        output.appendChild(span);
        typeText(span, result, 10, () => {
          input.focus();
        });
      } else input.focus();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[commandHistory.length - 1 - historyIndex];
        suggestion.textContent = "";
        updateInputWidth();
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[commandHistory.length - 1 - historyIndex];
        suggestion.textContent = "";
      } else if (historyIndex === 0) {
        historyIndex = -1;
        input.value = "";
        suggestion.textContent = "";
      }
      updateInputWidth();
    }

    if ((e.key === "Tab" || e.key === "ArrowRight") && suggestion.textContent) {
      e.preventDefault();
      input.value += suggestion.textContent;
      suggestion.textContent = "";
      input.dispatchEvent(new Event("input"));
    }
  });

  document.addEventListener("click", () => input.focus());
}

loadConfig();
