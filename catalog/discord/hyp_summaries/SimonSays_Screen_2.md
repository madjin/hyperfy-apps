# SimonSays_Screen_2.hyp

## Metadata
- **Author**: cru
- **Channel**: #🐞│issues
- **Date**: 2025-03-29
- **Size**: 25,415,350 bytes

## Discord Context
> Big 3D UI elements cause lag spikes. The bigger the screen, the greater the lag. tested in 0.9.0 hyperfy v2. Not sure if this is already fixed on dev. 

Can repro with the provided hyp.

## Blueprint
- **Name**: SimonSays_Screen
- **Version**: 87
- **Model**: `asset://1df5f24ed8be9ca3722ebe84e6b5ac08947b2951e514abc19601704cf32fb064.glb`
- **Script**: `asset://cebf0e83b87a6b6eb0cb140303d1ee94631efb7f52b186fb3ad6b741a667876d.js`

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
- `colorChannel`: str = `SimonColor`
- `resetChannel`: str = `SimonReset`
- `signalStrength`: int = `1`
- `threshold`: float = `0.5`
- `debug`: str = `on`
- `uiScale`: float = `1.8`
- `uiHeight`: float = `18.7`

## Assets
- `[model]` 1df5f24ed8be9ca3722ebe84e6b5ac08947b2951e514abc19601704cf32fb064.glb (4,157,496 bytes)
- `[script]` cebf0e83b87a6b6eb0cb140303d1ee94631efb7f52b186fb3ad6b741a667876d.js (15,435 bytes)
- `[audio]` f27e4aa9bcd9f9a31624f9737ce7e561ebd4af3aa0fa52eecc2dc0773e7cb0b4.mp3 (5,382,492 bytes)
- `[audio]` c408c69fc0db902e79865689cf0e7c20cd671b67556c438dccbfce817a395494.mp3 (5,495,682 bytes)
- `[audio]` 97cec7881b4a2df79242b9bce8eecbf235529f5352ba18f984bd080841886ead.mp3 (4,678,783 bytes)
- `[audio]` e2016f5fcd3cb229f39088887d9422f9c7992f93d98279426a572c103c0965e2.mp3 (5,683,223 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.on()`, `app.send()`
**Events Listened**: `boardSignal`, `gameStateUpdate`, `resetRequest`, `restartRequest`, `showColorRequest`, `update`
**Nodes Created**: `action`, `ui`, `uitext`

## Keywords (for Discord search)
action, active, actual, alignItems, assign, avoid, background, backgroundColor, baseFontSize, baseHeight, baseWidth, based, before, begins, bgColorOptions, bgIndex, bgOption, bgRandom, black, blank

## Script Source
```javascript
// NETWORKED SIMON SAYS UI
// Game logic runs on server, UI updates on clients
// Now with scalable UI size

app.configure([
  {
    key: 'title',
    type: 'text',
    label: 'UI Title',
    initial: 'Simon Says UI'
  },
  {
    key: 'colorChannel',
    type: 'text',
    label: 'Color Output Channel',
    initial: 'SimonColor'
  },
  {
    key: 'resetChannel',
    type: 'text',
    label: 'Reset Output Channel',
    initial: 'SimonReset'
  },
  {
    key: 'signalStrength',
    type: 'number',
    label: 'Signal Amplitude',
    initial: 1,
    min: 0,
    max: 10,
    step: 0.1
  },
  {
    key: 'uiScale',
    type: 'range',
    label: 'UI Size Scale',
    initial: 1,
    min: 0.5,
    max: 30,
    step: 0.1
  },
  {
    key: 'uiHeight',
    type: 'range',
    label: 'UI Height Position',
    initial: 3,
    min: 1,
    max: 30,
    step: 0.1
  }
]);

// --- Get configuration ---
const colorChannel = props.colorChannel || 'SimonColor';
const resetChannel = props.resetChannel || 'SimonReset';
const signalStrength = props.signalStrength || 1;
const uiScale = props.uiScale || 1;
const uiHeight = props.uiHeight || 3;

// --- Helper: Custom pseudo‑random generator (a simple LCG) ---
let seed = 1;
function pseudoRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// --- Predefined Colors (6 each) ---
const textColorOptions = [
  { name: "RED", color: "#FF0000", signalValue: 1 },
  { name: "ORANGE", color: "#FF7F00", signalValue: 2 },
  { name: "YELLOW", color: "#FFFF00", signalValue: 3 },
  { name: "GREEN", color: "#00FF00", signalValue: 4 },
  { name: "BLUE", color: "#0000FF", signalValue: 5 },
  { name: "PURPLE", color: "#800080", signalValue: 6 }
];

const bgColorOptions = [
  { name: "RED", backgroundColor: "#FF3333", signalValue: 1 },
  { name: "ORANGE", backgroundColor: "#FF9933", signalValue: 2 },
  { name: "YELLOW", backgroundColor: "#FFFF33", signalValue: 3 },
  { name: "GREEN", backgroundColor: "#33FF33", signalValue: 4 },
  { name: "BLUE", backgroundColor: "#3333FF", signalValue: 5 },
  { name: "PURPLE", backgroundColor: "#9933FF", signalValue: 6 }
];

// --- Countdown texts for Intro ---
const countdown = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "BEGIN"];

// --- Phase Configurations ---
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

// --- Create the UI Container and Text Element (client-side only) ---
let ui, flashingText;
if (world.isClient) {
  // Calculate the scaled dimensions
  const baseWidth = 250;
  const baseHeight = 100;
  const baseFontSize = 24;
  
  // Create the UI with scaled dimensions
  ui = app.create('ui', {
    lit: true,
    doubleside: false,
    width: baseWidth * uiScale,
    height: baseHeight * uiScale,
    backgroundColor: "black",
    borderRadius: 10 * uiScale,
    padding: 10 * uiScale,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  });
  ui.position.set(0, uiHeight, 0.2);
  app.add(ui);

  // The centered text element with scaled font
  flashingText = app.create('uitext', {
    value: countdown[0], // starts with "10"
    color: "#FFFFFF",    // white during the countdown
    fontSize: baseFontSize * uiScale,
    fontWeight: 'bold'
  });
  ui.add(flashingText);
  
  // Create a scale indicator
  const scaleInfo = app.create('ui', {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 150,
    height: 40,
    borderRadius: 5,
    padding: 5
  });
  
  const scaleText = app.create('uitext', {
    value: `Scale: ${uiScale.toFixed(1)}x`,
    color: '#FFFFFF',
    fontSize: 14
  });
  
  scaleInfo.add(scaleText);
  scaleInfo.position.set(0, uiHeight + (baseHeight * uiScale / 2) + 30, 0.2);
  app.add(scaleInfo);
}

// --- State Management Variables ---
// These variables will be managed on the server and synced to clients
const gameState = {
  currentPhaseIndex: 0,
  phaseTimer: 0,
  currentCycle: 0,
  inShowState: true, // true: "show" period; false: "blank" period.
  currentCountdownIndex: 0,
  lastTextIndex: 0,  // to avoid immediate repeats for text color
  currentColor: "",
  currentSignalValue: 0,
  displayText: countdown[0],
  textColor: "#FFFFFF",
  backgroundColor: "black"
};

// --- Initialize the game state on the server ---
if (world.isServer) {
  // Send an initial RESET signal before the sequence begins
  app.send('gameStateUpdate', gameState);
  
  // Also reset all game boards
  app.send('boardSignal', { channel: resetChannel, value: signalStrength });
}

// --- Client listens for state updates from server ---
if (world.isClient) {
  app.on('gameStateUpdate', (state) => {
    // Update local game state
    Object.assign(gameState, state);
    
    // Update UI based on the received state
    flashingText.value = gameState.displayText;
    flashingText.color = gameState.textColor;
    ui.backgroundColor = gameState.backgroundColor;
    
    // Emit signals to the local game board based on server state
    if (gameState.currentSignalValue > 0) {
      app.emit(colorChannel, gameState.currentSignalValue * signalStrength);
    } else {
      app.emit(resetChannel, signalStrength);
    }
  });
  
  // Client listens for board signal instructions from server
  app.on('boardSignal', (data) => {
    app.emit(data.channel, data.value);
  });
}

// --- Function to Display a New Color for the Current Cycle (server-side) ---
function showColorForPhase() {
  if (!world.isServer) return;
  
  let currentPhase = phases[gameState.currentPhaseIndex];
  
  // For text modes, choose a random text color ensuring no immediate repeat
  let newTextIndex = Math.floor(pseudoRandom() * textColorOptions.length);
  while (newTextIndex === gameState.lastTextIndex) {
    newTextIndex = Math.floor(pseudoRandom() * textColorOptions.length);
  }
  gameState.lastTextIndex = newTextIndex;
  let textOption = textColorOptions[newTextIndex];
  
  // Update the gameState based on the current display type
  if (currentPhase.displayType === "text-random") {
    gameState.currentColor = textOption.name;
    gameState.currentSignalValue = 0; // Don't send color signal yet
    gameState.displayText = textOption.name;
    gameState.textColor = textOption.color;
    gameState.backgroundColor = "black";
  } else if (currentPhase.displayType === "text-normal") {
    gameState.currentColor = textOption.name;
    gameState.currentSignalValue = 0; // Don't send color signal yet
    gameState.displayText = textOption.name;
    gameState.textColor = "#FFFFFF";
    gameState.backgroundColor = "black";
  } else if (currentPhase.displayType === "background") {
    // In background mode, hide the text and change the background
    gameState.displayText = "";
    let bgRandom = pseudoRandom();
    let bgIndex = Math.floor(bgRandom * bgColorOptions.length);
    let bgOption = bgColorOptions[bgIndex];
    gameState.currentColor = bgOption.name;
    gameState.currentSignalValue = 0; // Don't send color signal yet
    gameState.backgroundColor = bgOption.backgroundColor;
  }
  
  // First sen

// ... truncated ...
```

---
*Extracted from SimonSays_Screen_2.hyp. Attachment ID: 1355352717073190964*