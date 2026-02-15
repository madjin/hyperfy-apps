# SimonSays_Screen.hyp

## Metadata
- **Author**: cru
- **Channel**: #💻│developers
- **Date**: 2025-03-27
- **Size**: 25,408,387 bytes

## Discord Context
> simple idea for a minigame I'm testing. Very work in progress 
"Simon Says" - it's not technically Simon Says, but a similar vibe. 

The screen displays a color, and players must jump to the correct block in time. In the final game, if they fail to do this, they would fall into a pit and die. 

The game would increase in difficulty by getting quicker, reducing the # of functioning colors in the arena, or shrinking the cube sizes. There's a whole bunch of variables that could be added. 

Eventually when there's one player remaining, the game would end. 

Next steps would be to add audio feedback, physics, and integrate with an HP system, like the one <@357905702926286858> created. There are also some issues with the way the colors are sent over to the playing area. It just grabs it from the local console I think 

This idea is inspired by a project <@783416470205497394>  is working on where various colored cubes are instanced.

## Blueprint
- **Name**: SimonSays_Screen
- **Version**: 20
- **Model**: `asset://1df5f24ed8be9ca3722ebe84e6b5ac08947b2951e514abc19601704cf32fb064.glb`
- **Script**: `asset://a76124ec64cb3e7649d53a147c437b2548166652e872718eb4a652f6001ccec1.js`

## Props
- `volume`: float = `0.5`
- `title`: str = `SIMONSAYS`
- `track1Name`: str = `A town with an Ocean View`
- `track2Name`: str = `A walk through the Forest`
- `track3Name`: str = `Wheat fields at night`
- `track4Name`: str = `...`
- `track5Name`: str = `...`
- `defaultVolume`: int = `1`
- `isSpatial`: bool = `True`
- `jukeboxColor`: str = `#ff9d00`
- `track1`: audio → `asset://f27e4aa9bcd9f9a31624f9737ce7e561ebd4af3aa0fa52eecc2dc0773e7cb0b4.mp3`
- `track2`: audio → `asset://c408c69fc0db902e79865689cf0e7c20cd671b67556c438dccbfce817a395494.mp3`
- `track3`: audio → `asset://97cec7881b4a2df79242b9bce8eecbf235529f5352ba18f984bd080841886ead.mp3`
- `track4`: audio → `asset://e2016f5fcd3cb229f39088887d9422f9c7992f93d98279426a572c103c0965e2.mp3`
- `track5`: NoneType = `None`

## Assets
- `[model]` 1df5f24ed8be9ca3722ebe84e6b5ac08947b2951e514abc19601704cf32fb064.glb (4,157,496 bytes)
- `[script]` a76124ec64cb3e7649d53a147c437b2548166652e872718eb4a652f6001ccec1.js (8,607 bytes)
- `[audio]` f27e4aa9bcd9f9a31624f9737ce7e561ebd4af3aa0fa52eecc2dc0773e7cb0b4.mp3 (5,382,492 bytes)
- `[audio]` c408c69fc0db902e79865689cf0e7c20cd671b67556c438dccbfce817a395494.mp3 (5,495,682 bytes)
- `[audio]` 97cec7881b4a2df79242b9bce8eecbf235529f5352ba18f984bd080841886ead.mp3 (4,678,783 bytes)
- `[audio]` e2016f5fcd3cb229f39088887d9422f9c7992f93d98279426a572c103c0965e2.mp3 (5,683,223 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.on()`, `app.send()`
**Events Listened**: `update`
**Events Emitted**: `color-alert`, `color-update`, `reset`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
alert, alerting, alignItems, always, avoid, background, backgroundColor, before, begins, besides, bgColorOptions, bgIndex, bgOption, bgRandom, black, blank, blankDuration, bold, borderRadius, center

## Script Source
```javascript
// SIMON SAYS UI (Updated with Initial RESET)
// - Background remains black until a mode change.
// - Two text modes: "text-random" (text rendered in its random color)
//   and "text-normal" (text is white while the random color is only in the name).
// - In "background" mode no text is shown; only the background changes.
// - When a new color is first displayed, it immediately logs and sends:
//       ALERT = COLOR IS "COLORNAME"
// - When the show period ends and the screen goes blank, it logs and sends:
//       COLOR = COLORNAME
// - At the start of each new cycle, it outputs "RESET".
// - Additionally, a "RESET" message is sent once right before the script begins.
// - Colors are limited to six: RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE.

// --- Helper: Custom pseudo‑random generator (a simple LCG) ---
let seed = 1;
function pseudoRandom() {
	seed = (seed * 9301 + 49297) % 233280;
	return seed / 233280;
}

// --- Predefined Colors (6 each) ---
const textColorOptions = [
	{ name: "RED", color: "#FF0000" },
	{ name: "ORANGE", color: "#FF7F00" },
	{ name: "YELLOW", color: "#FFFF00" },
	{ name: "GREEN", color: "#00FF00" },
	{ name: "BLUE", color: "#0000FF" },
	{ name: "PURPLE", color: "#800080" }
];

const bgColorOptions = [
	{ name: "RED", backgroundColor: "#FF3333" },
	{ name: "ORANGE", backgroundColor: "#FF9933" },
	{ name: "YELLOW", backgroundColor: "#FFFF33" },
	{ name: "GREEN", backgroundColor: "#33FF33" },
	{ name: "BLUE", backgroundColor: "#3333FF" },
	{ name: "PURPLE", backgroundColor: "#9933FF" }
];

// --- Countdown texts for Intro ---
const countdown = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "BEGIN"];

// --- Phase Configurations ---
// Each phase (besides intro and done) is defined by cycles with "show" and "blank" durations,
// plus a displayType: "text-random", "text-normal", or "background".
// (The container background remains black for text modes.)
const phases = [
	{ phase: "intro", steps: countdown.length, showDuration: 1 },
	// Phase 1: text-random mode.
	{ phase: "phase1", cycles: 3, showDuration: 2, blankDuration: 5, displayType: "text-random" },
	// Phase 2: text-normal mode.
	{ phase: "phase2", cycles: 1, showDuration: 1.5, blankDuration: 2, displayType: "text-normal" },
	// Phase 3: text-random mode.
	{ phase: "phase3", cycles: 10, showDuration: 1, blankDuration: 1, displayType: "text-random" },
	// Phase 4: text-normal mode.
	{ phase: "phase4", cycles: 10, showDuration: 0.5, blankDuration: 1, displayType: "text-normal" },
	// Phase 5: background mode: no text; only background changes.
	{ phase: "phase5", cycles: 10, showDuration: 0.5, blankDuration: 1, displayType: "background" },
	{ phase: "done", showText: "DONE", duration: 5 }
];

// --- Create the UI Container and Text Element ---
app.configure([
	{
		key: 'title',
		type: 'text',
		label: 'UI Title',
		initial: 'Simon Says UI'
	}
]);

// The container always starts with a black background for readability.
const ui = app.create('ui', {
	lit: true,
	doubleside: false,
	width: 250,
	height: 100,
	backgroundColor: "black",
	borderRadius: 10,
	padding: 10,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center'
});
ui.position.set(0, 3, 0.2);
app.add(ui);

// The centered text element used for the countdown and for displaying the color name.
const flashingText = app.create('uitext', {
	value: countdown[0], // starts with "10"
	color: "#FFFFFF",    // white during the countdown
	fontSize: 24,
	fontWeight: 'bold'
});
ui.add(flashingText);

// --- Send an initial RESET message before the sequence begins ---
console.log("RESET");
if (world.isClient) {
	app.send("reset", { message: "RESET" });
} else if (world.isServer) {
	app.emit("reset", { message: "RESET" });
}

// --- State Management Variables ---
let currentPhaseIndex = 0;
let phaseTimer = 0;
let currentCycle = 0;
let inShowState = true; // true: "show" period; false: "blank" period.
let currentCountdownIndex = 0;
let lastTextIndex = 0;  // to avoid immediate repeats for text color

// Global variable to hold the current chosen color (for alerting)
let currentColor = "";

// --- Function to Display a New Color for the Current Cycle ---
// This function chooses a new color, updates the UI, and logs/sends the initial ALERT.
function showColorForPhase() {
	let currentPhase = phases[currentPhaseIndex];
	// For text modes, choose a random text color ensuring no immediate repeat.
	let newTextIndex = Math.floor(pseudoRandom() * textColorOptions.length);
	while (newTextIndex === lastTextIndex) {
		newTextIndex = Math.floor(pseudoRandom() * textColorOptions.length);
	}
	lastTextIndex = newTextIndex;
	let textOption = textColorOptions[newTextIndex];
	
	if (currentPhase.displayType === "text-random") {
		currentColor = textOption.name;
		// Show the text with its own random color; background remains black.
		flashingText.value = textOption.name;
		flashingText.color = textOption.color;
		ui.backgroundColor = "black";
	} else if (currentPhase.displayType === "text-normal") {
		currentColor = textOption.name;
		// Show the text (random name) in white; background remains black.
		flashingText.value = textOption.name;
		flashingText.color = "#FFFFFF";
		ui.backgroundColor = "black";
	} else if (currentPhase.displayType === "background") {
		// In background mode, hide the text and change the background.
		flashingText.value = "";
		let bgRandom = pseudoRandom();
		let bgIndex = Math.floor(bgRandom * bgColorOptions.length);
		let bgOption = bgColorOptions[bgIndex];
		currentColor = bgOption.name;
		ui.backgroundColor = bgOption.backgroundColor;
	}
	// Immediately log and send the ALERT as soon as the color is displayed.
	console.log('ALERT = COLOR IS "' + currentColor + '"');
	if (world.isClient) {
		app.send("color-alert", { alert: 'COLOR IS "' + currentColor + '"' });
	} else if (world.isServer) {
		app.emit("color-alert", { alert: 'COLOR IS "' + currentColor + '"' });
	}
}

// --- Main Update Loop: State Machine ---
app.on('update', (dt) => {
	phaseTimer += dt;
	let currentPhase = phases[currentPhaseIndex];
	
	if (currentPhase.phase === "intro") {
		// --- Intro Countdown Phase ---
		if (phaseTimer >= currentPhase.showDuration) {
			phaseTimer -= currentPhase.showDuration;
			currentCountdownIndex++;
			if (currentCountdownIndex < countdown.length) {
				flashingText.value = countdown[currentCountdownIndex];
			} else {
				// Intro finished; move to Phase 1.
				currentPhaseIndex++;
				currentCycle = 0;
				inShowState = true;
				showColorForPhase();
			}
		}
	} else if (currentPhase.phase === "done") {
		// --- DONE Phase ---
		flashingText.value = currentPhase.showText;
		flashingText.color = "#FFFFFF";
		ui.backgroundColor = "black";
		if (phaseTimer >= currentPhase.duration) {
			phaseTimer -= currentPhase.duration;
			// Restart the sequence.
			currentPhaseIndex = 0;
			currentCountdownIndex = 0;
			flashingText.value = countdown[currentCountdownIndex];
		}
	} else {
		// --- Phases with cycles (Phase1 - Phase5) ---
		if (inShowState) {
			// "Show" state: the color is visible.
			if (phaseTimer >= currentPhase.showDuration) {
				// As the show period ends, log the COLOR message.
				console.log("COLOR = " + currentColor);
				if (world.isClient) {
					app.send("color-update", { color: currentColor });
				} else if (world.isServer) {
					app.emit("color-update", { color: currentColor });
				}
				
				phaseTimer -= currentPhase.showDuration;
				inShowState = false;
				// Clear the display for the blank interval.
				if (currentPhase.displayType === "background") {
					ui.backgroundColor = "black";
				} else {
					flashingText.value = "";
				}
			}
		} else {
			// "Blank" state.
			if (phaseTimer >= currentPhase.blankDuration) {
				phaseTimer -= currentPhase.blankDuration;
				c

// ... truncated ...
```

---
*Extracted from SimonSays_Screen.hyp. Attachment ID: 1354675175374717069*