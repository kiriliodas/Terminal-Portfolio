export const state = {
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

export function updateGalleryState(updates) {
	Object.assign(state.gallery, updates);
}

export function addToHistory(command) {
	state.commandHistory.push(command);
	state.historyIndex = -1;
}

export function setCurrentTheme(index) {
	state.currentTheme = index;
}
