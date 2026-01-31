export default function main(world, app, fetch, props, setTimeout) {
// Configure the app with a title.
app.configure([
	{
		key: 'title',
		type: 'text',
		label: 'UI Title',
		initial: 'Simon Says Board'
	}
]);

// Define an array of cube names (all in all caps).
const cubeColors = ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "PURPLE"];

// Function to update cubes: hide all except the one matching the selected color.
function updateCubesForColor(selectedColor) {
	selectedColor = selectedColor.toUpperCase();
	cubeColors.forEach(color => {
		const cube = app.get(color);
		if (cube) {
			cube.active = (color === selectedColor);
		} else {
			console.log("Cube not found: " + color);
		}
	});
}

// Function to reset cubes: show all cubes.
function updateCubesReset() {
	cubeColors.forEach(color => {
		const cube = app.get(color);
		if (cube) {
			cube.active = true;
		} else {
			console.log("Cube not found: " + color);
		}
	});
}

// Listen for "color-update" events from the UI (works on both client and server).
app.on('color-update', (data) => {
	if (data && data.color) {
		console.log("Detected color via event: " + data.color.toUpperCase());
		updateCubesForColor(data.color);
	} else {
		console.log("color-update event received without valid color data.");
	}
});

// Listen for "reset" events from the UI.
app.on('reset', (data) => {
	// When a RESET is detected, show all cubes.
	console.log("RESET detected via event.");
	updateCubesReset();
});

// Fallback: Override console.log to capture messages if events aren't processed.
// This will parse local console messages such as "COLOR = GREEN" or "RESET".
const originalConsoleLog = console.log;
console.log = function(...args) {
	originalConsoleLog.apply(console, args);
	const msg = args.join(" ");
	if (msg.startsWith("COLOR =")) {
		// Example: "COLOR = GREEN"
		const parts = msg.split("COLOR =");
		if (parts.length > 1) {
			const colorStr = parts[1].trim();
			updateCubesForColor(colorStr);
			originalConsoleLog("Detected color via console parsing: " + colorStr.toUpperCase());
		}
	} else if (msg.startsWith("RESET")) {
		updateCubesReset();
		originalConsoleLog("Detected RESET via console parsing.");
	}
};

}
