# PAY_TO_ENTER_DOOR.hyp

## Metadata
- **Author**: peezy
- **Channel**: #🎨│showcase
- **Date**: 2025-03-11
- **Size**: 409,819 bytes

## Discord Context
> REQUIRES SOLANA MOD <@783416470205497394>

## Blueprint
- **Name**: PAY TO ENTER DOOR
- **Version**: 117
- **Model**: `asset://bf904376424ddeed6eb779bc05ca04cb0a9669699f3e618febe07c5c11bbfb27.glb`
- **Script**: `asset://7d333c1be1e00f2e07b5255828c30c2056534d400067652c6fa4201f1ac0285e.js`

## Props
- `type`: str = `1`
- `direction`: str = `1`
- `slideDistance`: str = `1`
- `network`: str = `devnet`
- `tokenMintDevnet`: str = `EkxY8gCiyxTfLnZpUvQs6UMSHYykfrUXQj4iQE1X2e41`
- `tokenMintMainnet`: str = `8vBMibwpn8wpfYKbQ9xqzodymg3LjmYec2tSNGRy23K8`
- `price`: int = `5`

## Assets
- `[model]` bf904376424ddeed6eb779bc05ca04cb0a9669699f3e618febe07c5c11bbfb27.glb (394,684 bytes)
- `[script]` 7d333c1be1e00f2e07b5255828c30c2056534d400067652c6fa4201f1ac0285e.js (14,235 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.get()`, `app.off()`, `app.on()`, `app.send()`, `app.sendTo()`, `app.solana()`
**World Methods**: `world.getPlayer()`, `world.getTime()`, `world.on()`
**Events Listened**: `client:connect`, `client:deposit`, `leave`, `server:wallet`, `solana`, `update`
**Events Emitted**: `token:deposit:error`, `token:deposit:start`, `token:deposit:success`
**Nodes Created**: `action`, `ui`, `uitext`

## Keywords (for Discord search)
action, alignItems, amount, angle, animation, animationDuration, args, auto, backgroundColor, balance, balanceResult, billboard, button, call, center, clamp, clicked, client, closing, color

## Script Source
```javascript
// #region door.js
// doors in hyperfy

let isOpen = false
let isMoving = false
let animationDuration = 1.0 // Duration in seconds

// const config = app.config

// Animation configurations
const DOOR_TYPES = {
  SLIDING: 'sliding',
  SALOON: 'saloon'
}

// Add timer constants at the top with other configurations
const DOOR_OPEN_TIME = 3.0  // Time in seconds door stays open

const DOOR_DIRECTIONS = {
  INWARD: 'inward',
  OUTWARD: 'outward'
}

const doorConfig = {
  type: DOOR_TYPES.SLIDING,
  direction: DOOR_DIRECTIONS.OUTWARD, // Change to INWARD for inward-opening doors
  slideDistance: 1.8,
  speed: 2,
  rotationSpeed: Math.PI,
  maxRotation: Math.PI / 4
}

let currentPosition = 0
let targetPosition = 0

// Get door components
const doorFrame = app.get('Frame')
const doorR = app.get('LeftDoor')
const doorL = app.get('RightDoor')

// Add timer variable with other state variables
let openTimer = 0


// Door config ui
app.configure(() => {
  return [
    {
      key: 'solana',
      type: 'section',
      label: 'Solana Settings',
    },
    {
      key: 'price',
      type: 'number',
      label: 'Price to Open'
    },
    {
      key: 'network',
      type: 'switch',
      label: 'Network',
      options: [
        { label: 'mainnet', value: 'mainnet' },
        { label: 'devnet', value: 'devnet' },
      ],
      defaultValue: 'devnet'
    },
    {
      key: 'tokenMintMainnet',
      type: 'text',
      label: 'Mainnet Token Mint',
      defaultValue: '8vBMibwpn8wpfYKbQ9xqzodymg3LjmYec2tSNGRy23K8',
      placeholder: '8vBMibwpn8wpfYKbQ9xqzodymg3LjmYec2tSNGRy23K8'
    },
    {
      key: 'tokenMintDevnet',
      type: 'text',
      label: 'Devnet Token Mint',
      defaultValue: 'EkxY8gCiyxTfLnZpUvQs6UMSHYykfrUXQj4iQE1X2e41',
      placeholder: 'EkxY8gCiyxTfLnZpUvQs6UMSHYykfrUXQj4iQE1X2e41'
    },
    {
      key: 'door',
      type: 'section',
      label: 'Door Settings',
    },
    {
      key: 'type',
      type: 'switch',
      label: 'Door Type',
      options: [
        { label: 'Sliding', value: '1' },
        { label: 'Swinging', value: '2' },
      ],
      defaultValue: '1'
    },
    {
      key: 'slideDistance',
      type: 'textarea',
      label: 'Slide Distance',
      defaultValue: '1.8',
      placeholder: '1.8'
    },
    {
      key: 'maxRotation',
      type: 'textarea',
      label: 'Swing Angle',
      defaultValue: '45',
      placeholder: '45'
    },
    {
      key: 'direction',
      type: 'switch',
      label: 'Direction',
      options: [
        { label: 'Inward', value: '1' },
        { label: 'Outward', value: '2' },
      ],
      defaultValue: '2'
    }
  ]
})

// Update animation state
app.on('update', dt => {
  // Handle auto-closing timer when door is open
  if (isOpen && !isMoving) {
    openTimer += dt
    if (openTimer >= DOOR_OPEN_TIME) {
      isOpen = false
      targetPosition = 0
      isMoving = true
      openTimer = 0
    }
  }

  if (!isMoving) return

  const movement = doorConfig.speed * dt

  // Get current door type and direction from config
  const isDoorSliding = app.config.type !== '2'
  const directionMultiplier = app.config.direction === '1' ? -1 : 1

  // Get slide distance from config and clamp it
  const slideDistance = Math.min(Math.max(parseFloat(app.config.slideDistance) || 1.8, 0.5), 2.0)
  // Get rotation angle and clamp it (convert to radians)
  const maxRotation = Math.min(Math.max(parseFloat(app.config.maxRotation) || 45, 0), 90) * (Math.PI / 180)

  console.log('Current config type:', app.config.type)
  console.log('Is sliding?', isDoorSliding)

  if (isDoorSliding) {
    // Sliding door animation
    if (isOpen) {
      currentPosition = Math.min(currentPosition + movement, 1)
    } else {
      currentPosition = Math.max(currentPosition - movement, 0)
    }

    // Reset any rotation on the pivot
    doorL.rotation.y = 0
    doorR.rotation.y = 0

    // Move the doors directly
    const offset = slideDistance * currentPosition
    doorL.position.x = -offset
    doorR.position.x = offset

  } else {
    // Reset door positions when in swing mode
    doorL.position.x = 0
    doorR.position.x = 0

    // Saloon door animation
    if (isOpen) {
      currentPosition = Math.min(currentPosition + movement, 1)
    } else {
      currentPosition = Math.max(currentPosition - movement, 0)
    }

    // Rotate the pivot points
    const rotation = maxRotation * currentPosition * directionMultiplier
    doorL.rotation.y = rotation
    doorR.rotation.y = -rotation
  }

  // Check if animation is complete
  if (Math.abs(currentPosition - targetPosition) < 0.001) {
    isMoving = false
    currentPosition = targetPosition
  }
})

// #endregion

const DEBUG = true;
const log = (...args) => DEBUG && console.log(...args);

const TOKEN_AMOUNT = app.config.price ?? 5;

// const TOKEN = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" //USDC
let TOKEN;
function init() {
  log(app.config)
  const { network, tokenMintDevnet, tokenMintMainnet } = app.config
  const tokenMint = network === 'mainnet' ? tokenMintMainnet : tokenMintDevnet
  TOKEN = tokenMint
}
init()


let mode;
const setMode = (fn) => {
  log('Setting mode:', fn.name);
  mode?.();
  mode = fn();
};

if (world.isClient) {
  log('Client initialized');

  // #region ui
  const ui = app.create("ui");
  ui.width = 75;
  ui.height = 75;
  ui.backgroundColor = "rgba(0, 0, 0, 0.7)";
  ui.position.set(1, 1.2, 0.5);
  ui.billboard = "full";
  ui.justifyContent = "center";
  ui.alignItems = "center";
  ui.padding = 10;
  ui.gap = 5;

  const label = app.create("uitext", {
    padding: 4,
    textAlign: "center",
    value: `pay TOKEN to open`,
    color: "white",
    fontSize: 14,
  });
  ui.add(label);




  // #endregion

  // Event handlers
  const player = world.getPlayer();

  let token
  let playerTokenData = {}
  let serverTokenData = {}

  function refreshUI() {

    label.value = `pay ${TOKEN_AMOUNT} ${token?.symbol} to enter`
  }

  // Balance update function
  async function updateClientBalance() {
    log('Updating client balance');
    const solana = app.solana()
    if (!solana?.connection || !player.solana) {
      log('No Solana connection for client balance');
      return;
    }

    try {
      // Get the token object first using the new API
      token = await solana.programs.token(TOKEN);

      // Then call balance on the token object
      const balanceResult = await token.balance(player.solana);
      playerTokenData.balance = balanceResult

      log('Client balance fetched:', balanceResult);
      refreshUI()
    } catch (error) {
      console.error("Failed to fetch client balance:", error);
    }
  }


  // Create interact action
  const action = app.create('action')
  action.label = 'Open'
  action.position.set(0, 1.5, 0)
  action.distance = 3


  function openDoor() {
    if (isMoving) return
    isOpen = !isOpen
    targetPosition = isOpen ? 1 : 0
    isMoving = true
    openTimer = 0  // Reset timer when door is manually triggered
  }

  // #region modes
  function defaultMode() {
    log('Entering default mode');
    doorFrame.add(action)
    refreshUI()
    return () => {
      log('Cleaning up default mode');
      // Cleanup
      doorFrame.remove(action)
    };
  }

  function loadingMode() {
    log('Entering loading mode');
    const action = "Depositing"

    let dots = "";
    const updateHandler = (delta) => {
      const time = world.getTime();
      if (time % 0.5 < 0.1) {
        dots = dots.length >= 3 ? "" : dots + ".";
      }
    };

    app.on("update", updateHandler);

    return () => {
      log('Cleaning up loading mode');
      app.off("update", updateHandler);
    };

// ... truncated ...
```

---
*Extracted from PAY_TO_ENTER_DOOR.hyp. Attachment ID: 1349126913909588099*