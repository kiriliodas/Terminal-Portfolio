import { state, updateGalleryState } from "../state.js";
import { selectProject } from "./controls.js";

export function selectNextProject() {
	const { currentProject, isAnimating } = state.gallery;
	if (isAnimating || !currentProject) return;

	const currentIndex = findProjectIndex(currentProject.name);
	if (currentIndex < state.gallery.projects.length - 1) {
		selectProject(state.gallery.projects[currentIndex + 1]);
	}
}

export function selectPreviousProject() {
	const { currentProject, isAnimating } = state.gallery;
	if (isAnimating || !currentProject) return;

	const currentIndex = findProjectIndex(currentProject.name);
	if (currentIndex > 0) {
		selectProject(state.gallery.projects[currentIndex - 1]);
	}
}

function findProjectIndex(projectName) {
	return state.gallery.projects.findIndex((p) => p.name === projectName);
}
