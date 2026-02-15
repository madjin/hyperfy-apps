# SimonSaysBoard.hyp

## Metadata
- **Author**: cru
- **Channel**: #💻│developers
- **Date**: 2025-03-27
- **Size**: 12,597 bytes

## Discord Context
> simple idea for a minigame I'm testing. Very work in progress 
"Simon Says" - it's not technically Simon Says, but a similar vibe. 

The screen displays a color, and players must jump to the correct block in time. In the final game, if they fail to do this, they would fall into a pit and die. 

The game would increase in difficulty by getting quicker, reducing the # of functioning colors in the arena, or shrinking the cube sizes. There's a whole bunch of variables that could be added. 

Eventually when there's one player remaining, the game would end. 

Next steps would be to add audio feedback, physics, and integrate with an HP system, like the one <@357905702926286858> created. There are also some issues with the way the colors are sent over to the playing area. It just grabs it from the local console I think 

This idea is inspired by a project <@783416470205497394>  is working on where various colored cubes are instanced.

## Blueprint
- **Name**: SimonSaysBoard
- **Version**: 25
- **Model**: `asset://8f1c28f80279ddbb9822de6a1a9e34a2784b2667e0272cc9459742e99dd54457.glb`
- **Script**: `asset://212600e56cbd71c4207175be87e7b05af6aee070e2414922fba6aadfcfdf73b2.js`

## Props
- `title`: str = `Simon Says Board`

## Assets
- `[model]` 8f1c28f80279ddbb9822de6a1a9e34a2784b2667e0272cc9459742e99dd54457.glb (9,704 bytes)
- `[script]` 212600e56cbd71c4207175be87e7b05af6aee070e2414922fba6aadfcfdf73b2.js (2,199 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`, `app.on()`
**Events Listened**: `color-update`, `reset`

## Keywords (for Discord search)
active, apply, aren, args, array, both, caps, capture, client, color, colorStr, configure, console, cube, cubeColors, cubes, data, detected, event, events

## Script Source
```javascript
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

```

---
*Extracted from SimonSaysBoard.hyp. Attachment ID: 1354675175039176744*