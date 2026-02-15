export default function main(world, app, fetch, props, setTimeout) {
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
  
  // First send a RESET signal to all clients' game boards
  app.send('boardSignal', { channel: resetChannel, value: signalStrength });
  
  // Then update the game state on all clients
  app.send('gameStateUpdate', gameState);
}

// --- Main Update Loop: State Machine (server-side only) ---
app.on('update', (dt) => {
  if (!world.isServer) return; // Only run game logic on the server
  
  gameState.phaseTimer += dt;
  let currentPhase = phases[gameState.currentPhaseIndex];
  
  if (currentPhase.phase === "intro") {
    // --- Intro Countdown Phase ---
    if (gameState.phaseTimer >= currentPhase.showDuration) {
      gameState.phaseTimer -= currentPhase.showDuration;
      gameState.currentCountdownIndex++;
      if (gameState.currentCountdownIndex < countdown.length) {
        gameState.displayText = countdown[gameState.currentCountdownIndex];
        // Send updated state to all clients
        app.send('gameStateUpdate', gameState);
      } else {
        // Intro finished; move to Phase 1
        gameState.currentPhaseIndex++;
        gameState.currentCycle = 0;
        gameState.inShowState = true;
        showColorForPhase();
      }
    }
  } else if (currentPhase.phase === "done") {
    // --- DONE Phase ---
    // Ensure we send a reset signal when entering the DONE phase
    if (gameState.phaseTimer < 0.1) { // Only do this once at the start of the phase
      app.send('boardSignal', { channel: resetChannel, value: signalStrength });
      app.send('boardSignal', { channel: colorChannel, value: 0 }); // Turn off any active color signal
      
      gameState.displayText = currentPhase.showText;
      gameState.textColor = "#FFFFFF";
      gameState.backgroundColor = "black";
      gameState.currentSignalValue = 0;
      
      app.send('gameStateUpdate', gameState);
    }
    
    if (gameState.phaseTimer >= currentPhase.duration) {
      gameState.phaseTimer -= currentPhase.duration;
      // Restart the sequence
      gameState.currentPhaseIndex = 0;
      gameState.currentCountdownIndex = 0;
      gameState.displayText = countdown[gameState.currentCountdownIndex];
      
      app.send('gameStateUpdate', gameState);
    }
  } else {
    // --- Phases with cycles (Phase1 - Phase5) ---
    if (gameState.inShowState) {
      // "Show" state: the color name is visible, but the board is still in RESET state
      if (gameState.phaseTimer >= currentPhase.showDuration) {
        // As the show period ends, set the color signal value
        gameState.currentSignalValue = textColorOptions.find(c => c.name === gameState.currentColor)?.signalValue || 0;
        
        // Tell all clients to emit the actual color signal
        app.send('boardSignal', { 
          channel: colorChannel, 
          value: gameState.currentSignalValue * signalStrength 
        });
        
        gameState.phaseTimer -= currentPhase.showDuration;
        gameState.inShowState = false;
        
        // Clear the display for the blank interval
        if (currentPhase.displayType === "background") {
          gameState.backgroundColor = "black";
        } else {
          gameState.displayText = "";
        }
        
        app.send('gameStateUpdate', gameState);
      }
    } else {
      // "Blank" state - cube is visible
      if (gameState.phaseTimer >= currentPhase.blankDuration) {
        gameState.phaseTimer -= currentPhase.blankDuration;
        gameState.currentCycle++;
        
        if (gameState.currentCycle >= currentPhase.cycles) {
          // Move to the next phase
          gameState.currentPhaseIndex++;
          gameState.currentCycle = 0;
          
          // If moving to the DONE phase, make sure we reset everything
          if (phases[gameState.currentPhaseIndex].phase === "done") {
            app.send('boardSignal', { channel: resetChannel, value: signalStrength });
          }
        }
        
        // Turn off the color signal
        gameState.currentSignalValue = 0;
        app.send('boardSignal', { channel: colorChannel, value: 0 });
        
        gameState.inShowState = true;
        // If not transitioning into the "done" phase, show a new color
        if (phases[gameState.currentPhaseIndex].phase !== "done") {
          showColorForPhase();
        } else {
          app.send('gameStateUpdate', gameState);
        }
      }
    }
  }
});

// --- Create a start/restart button ---
if (world.isClient) {
  const startButton = app.create('action');
  startButton.label = 'Start/Restart Game';
  startButton.position.set(0, uiHeight - 1, 0.2);
  startButton.distance = 3;
  app.add(startButton);
  
  startButton.onTrigger = () => {
    // Send restart request to server
    app.send('restartRequest');
  };
}

// Server handles client requests
if (world.isServer) {
  app.on('restartRequest', () => {
    // Reset the game state
    gameState.currentPhaseIndex = 0;
    gameState.phaseTimer = 0;
    gameState.currentCycle = 0;
    gameState.inShowState = true;
    gameState.currentCountdownIndex = 0;
    gameState.displayText = countdown[0];
    gameState.textColor = "#FFFFFF";
    gameState.backgroundColor = "black";
    gameState.currentSignalValue = 0;
    
    // Reset the board
    app.send('boardSignal', { channel: resetChannel, value: signalStrength });
    
    // Update all clients
    app.send('gameStateUpdate', gameState);
  });
  
  app.on('resetRequest', () => {
    app.send('boardSignal', { channel: resetChannel, value: signalStrength });
  });
  
  app.on('showColorRequest', (colorName) => {
    const colorOption = textColorOptions.find(c => c.name.toUpperCase() === colorName.toUpperCase());
    if (colorOption) {
      app.send('boardSignal', { 
        channel: colorChannel, 
        value: colorOption.signalValue * signalStrength 
      });
    }
  });
}

// Export public API for external control
app.exports = {
  reset: function() {
    if (world.isServer) {
      app.send('boardSignal', { channel: resetChannel, value: signalStrength });
    } else if (world.isClient) {
      // Forward reset request to server
      app.send('resetRequest');
      // Also emit locally for immediate response
      app.emit(resetChannel, signalStrength);
    }
  },
  showColor: function(colorName) {
    const colorOption = textColorOptions.find(c => c.name.toUpperCase() === colorName.toUpperCase());
    if (colorOption) {
      if (world.isServer) {
        app.send('boardSignal', { 
          channel: colorChannel, 
          value: colorOption.signalValue * signalStrength 
        });
      } else if (world.isClient) {
        // Forward to server
        app.send('showColorRequest', colorName);
        // Also emit locally for immediate response
        app.emit(colorChannel, colorOption.signalValue * signalStrength);
      }
    }
  },
  restart: function() {
    if (world.isServer) {
      // Reset the game state directly
      gameState.currentPhaseIndex = 0;
      gameState.phaseTimer = 0;
      gameState.currentCountdownIndex = 0;
      app.send('gameStateUpdate', gameState);
      app.send('boardSignal', { channel: resetChannel, value: signalStrength });
    } else if (world.isClient) {
      // Forward restart request to server
      app.send('restartRequest');
    }
  }
};
}
