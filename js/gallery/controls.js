import { state, updateGalleryState } from "../state.js";
import { showCurrentImage } from "./display.js";
import { selectNextProject, selectPreviousProject } from "./navigation.js";

export function initializeGallery() {
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

export function setupGalleryControls() {
	document.getElementById("gallery-close")?.addEventListener("click", closeGallery);
	document.getElementById("prev-btn")?.addEventListener("click", showPreviousImage);
	document.getElementById("next-btn")?.addEventListener("click", showNextImage);
	setupGalleryKeyboardControls();
}

function setupGalleryKeyboardControls() {
	document.addEventListener("keydown", (e) => {
		if (!isGalleryOpen()) return;

		if (isNavigationKey(e.key)) {
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

function isGalleryOpen() {
	const gallery = document.getElementById("gallery-container");
	return gallery && gallery.style.display === "block";
}

function isNavigationKey(key) {
	return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"].includes(key);
}

function populateProjectList() {
	const projectList = document.getElementById("project-list");
	if (!projectList) return;

	projectList.innerHTML = "";
	state.gallery.projects.forEach((project) => {
		const projectItem = createProjectItem(project);
		projectList.appendChild(projectItem);
	});
}

function createProjectItem(project) {
	const projectItem = document.createElement("div");
	projectItem.className = "project-item";
	projectItem.textContent = project.name;
	projectItem.addEventListener("click", () => selectProject(project));
	return projectItem;
}

export function openGallery() {
	const container = document.getElementById("gallery-container");
	if (!container) return;

	container.style.display = "block";
	container.style.opacity = "0";

	setTimeout(() => animateGalleryOpen(container), 10);
	setTimeout(() => selectDefaultProject(), 100);
}

function animateGalleryOpen(container) {
	container.classList.add("opening");
	container.style.opacity = "1";
}

function selectDefaultProject() {
	if (state.gallery.projects.length > 0 && !state.gallery.currentProject) {
		selectProject(state.gallery.projects[0]);
	}
}

export function closeGallery() {
	const container = document.getElementById("gallery-container");
	if (!container) return;

	container.style.opacity = "0";
	container.classList.remove("opening");

	setTimeout(() => resetGallery(container), 300);
}

function resetGallery(container) {
	container.style.display = "none";
	updateGalleryState({
		currentProject: null,
		currentImageIndex: 0,
	});
}

export function selectProject(project) {
	updateGalleryState({
		currentProject: project,
		currentImageIndex: 0,
	});

	updateActiveProject(project.name);
	showCurrentImage();
}

function updateActiveProject(projectName) {
	document.querySelectorAll(".project-item").forEach((item) => {
		item.classList.toggle("active", item.textContent === projectName);
	});
}

function showPreviousImage() {
	const { currentProject, currentImageIndex, isAnimating } = state.gallery;
	if (isAnimating || !currentProject?.images || currentImageIndex <= 0) return;

	updateGalleryState({ isAnimating: true, currentImageIndex: currentImageIndex - 1 });
	showCurrentImage("prev");
}

function showNextImage() {
	const { currentProject, currentImageIndex, isAnimating } = state.gallery;
	if (isAnimating || !currentProject?.images || currentImageIndex >= currentProject.images.length - 1) return;

	updateGalleryState({ isAnimating: true, currentImageIndex: currentImageIndex + 1 });
	showCurrentImage("next");
}
