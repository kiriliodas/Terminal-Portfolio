import { state, updateGalleryState } from "../state.js";

export function showCurrentImage(direction = null) {
  const { currentProject, currentImageIndex } = state.gallery;
  if (!currentProject || !currentProject.images) return;

  const container = document.getElementById("image-container");
  const counter = document.getElementById("image-counter");
  if (!container || !counter) return;

  if (currentProject.images.length === 0) {
    displayEmptyMessage(container, counter);
    return;
  }

  const currentFile = currentProject.images[currentImageIndex];

  if (!direction) {
    displayInitialImage(container, currentFile, currentProject);
  } else {
    animateImageTransition(container, currentFile, currentProject, direction);
  }

  updateCounter(counter, currentImageIndex, currentProject.images.length);
}

function displayEmptyMessage(container, counter) {
  container.innerHTML =
    '<div style="color: #8b949e; text-align: center;">No images available</div>';
  counter.textContent = "0/0";
  updateGalleryState({ isAnimating: false });
}

function displayInitialImage(container, currentFile, project) {
  container.innerHTML = "";

  if (isVideoFile(currentFile)) {
    displayVideo(container, currentFile, project);
  } else {
    displayImage(container, currentFile, project);
  }

  updateGalleryState({ isAnimating: false });
}

function animateImageTransition(container, currentFile, project, direction) {
  const oldImage = container.querySelector(".gallery-image");

  if (oldImage) {
    slideOutOldImage(oldImage, direction);

    const newImage = createNewMedia(currentFile, project);
    slideInNewImage(container, newImage, direction);

    setTimeout(() => {
      oldImage?.remove();
      updateGalleryState({ isAnimating: false });
    }, 450);
  } else {
    displayInitialImage(container, currentFile, project);
  }
}

function slideOutOldImage(image, direction) {
  image.classList.remove("active");
  image.classList.add(
    direction === "next" ? "slide-out-left" : "slide-out-right"
  );
}

function createNewMedia(filename, project) {
  const tempContainer = document.createElement("div");

  if (isVideoFile(filename)) {
    displayVideo(tempContainer, filename, project);
  } else {
    displayImage(tempContainer, filename, project);
  }

  return tempContainer.querySelector(".gallery-image");
}

function slideInNewImage(container, newImage, direction) {
  if (!newImage) return;

  newImage.classList.remove("active");
  newImage.classList.add(
    direction === "next" ? "slide-in-right" : "slide-in-left"
  );
  container.appendChild(newImage);
  newImage.offsetHeight;

  setTimeout(() => {
    newImage.classList.remove("slide-in-left", "slide-in-right");
    newImage.classList.add("active");
  }, 10);
}

function displayImage(container, filename, project) {
  const img = document.createElement("img");
  img.className = "gallery-image active";
  img.src = getMediaUrl(filename, project.folder);
  img.alt = `${project.name} - Image ${state.gallery.currentImageIndex + 1}`;
  img.loading = "lazy";
  img.onerror = () =>
    (img.src =
      "https://via.placeholder.com/400x300/161b22/58a6ff?text=Image+not+found");
  container.appendChild(img);
}

function displayVideo(container, filename, project) {
  const video = document.createElement("video");
  video.className = "gallery-image active";
  video.controls = true;
  video.src = getMediaUrl(filename, project.folder);
  video.alt = `${project.name} - Video ${state.gallery.currentImageIndex + 1}`;
  video.preload = "metadata";
  video.onerror = () => {
    container.innerHTML =
      '<div style="color: #f85149; text-align: center; padding: 20px;">Video could not be loaded</div>';
  };
  container.appendChild(video);
}

function getMediaUrl(filename, folder) {
  return filename.startsWith("http")
    ? filename
    : `images/${folder}/${filename}`;
}

export function isVideoFile(filename) {
  return [".mp4", ".webm", ".ogg", ".mov"].some((ext) =>
    filename.toLowerCase().endsWith(ext)
  );
}

function updateCounter(counter, current, total) {
  counter.textContent = `${current + 1}/${total}`;
}
