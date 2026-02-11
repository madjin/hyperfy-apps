# TOKEN_GATE.hyp

## Metadata
- **Author**: peezy
- **Channel**: #🎨│showcase
- **Date**: 2025-03-11
- **Size**: 410,768 bytes

## Discord Context
> REQUIRES SOLANA MOD <@783416470205497394>

## Blueprint
- **Name**: TOKEN GATE
- **Version**: 70
- **Model**: `asset://bf904376424ddeed6eb779bc05ca04cb0a9669699f3e618febe07c5c11bbfb27.glb`
- **Script**: `asset://7b95344c78f01d9ccaa621710fc98d633b88fa63a185d0be702d3cf5c28828b1.js`

## Props
- `type`: str = `1`
- `direction`: str = `1`
- `slideDistance`: str = `1`
- `network`: str = `devnet`
- `tokenMintDevnet`: str = `EkxY8gCiyxTfLnZpUvQs6UMSHYykfrUXQj4iQE1X2e41`
- `tokenMintMainnet`: str = `8vBMibwpn8wpfYKbQ9xqzodymg3LjmYec2tSNGRy23K8`
- `minimumAmount`: int = `10000`

## Assets
- `[model]` bf904376424ddeed6eb779bc05ca04cb0a9669699f3e618febe07c5c11bbfb27.glb (394,684 bytes)
- `[script]` 7b95344c78f01d9ccaa621710fc98d633b88fa63a185d0be702d3cf5c28828b1.js (15,180 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.get()`, `app.off()`, `app.on()`, `app.send()`, `app.sendTo()`, `app.solana()`
**World Methods**: `world.getPlayer()`, `world.getTime()`, `world.on()`
**Events Listened**: `client:connect`, `client:deposit`, `leave`, `server:wallet`, `solana`, `update`
**Events Emitted**: `token:deposit:error`, `token:deposit:start`, `token:deposit:success`
**Nodes Created**: `action`, `ui`, `uitext`

## Keywords (for Discord search)
action, alignItems, amount, angle, animation, animationDuration, args, auto, backgroundColor, balance, balanceResult, billboard, button, call, center, clamp, clicked, client, clientBalanceText, closing

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
      key: 'minimumAmount',
      type: 'number',
      label: 'Gated amount'
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

  // console.log('Current config type:', app.config.type)
  // console.log('Is sliding?', isDoorSliding)

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

const DEFAULT_AMOUNT = 5;
const MINIMUM_TOKEN_BALANCE = app.config.minimumAmount ?? 10000

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

  const doorSign = app.create("ui")
  doorSign.width = 125
  doorSign.height = 25
  doorSign.backgroundColor = "rgba(0, 0, 0, 0.7)";
  doorSign.position.set(0, 2.2, 0.25);
  // doorSign.billboard = "full";
  doorSign.justifyContent = "center";
  doorSign.alignItems = "center";
  doorSign.padding = 10;
  doorSign.gap = 5;

  const signLabel = app.create("uitext", {
    padding: 4,
    textAlign: "center",
    value: `HYPER REQUIRED MINIMUM_AMOUNT`,
    color: "white",
    fontSize: 10,
  });
  doorSign.add(signLabel);

  app.add(doorSign)





  const ui = app.create("ui");
  ui.width = 100;
  ui.height = 40;
  ui.backgroundColor = "rgba(0, 0, 0, 0.7)";
  ui.position.set(1, 1.2, 0.5);
  ui.billboard = "full";
  ui.justifyContent = "center";
  ui.alignItems = "center";
  ui.padding = 2;
  ui.gap = 5;

  const clientBalanceText = app.create("uitext", {
    padding: 2,
    textAlign: "center",
    value: "Your Balance: Loading...",
    color: "white",
    fontSize: 12,
  });

  ui.add(clientBalanceText)
  app.add(ui);


  // #endregion

  // return;

  // Event handlers
  const player = world.getPlayer();

  let token
  let playerTokenData = {}
  let serverTokenData = {}

  function refreshUI() {
    console.log({ playerTokenData, serverTokenData })
    clientBalanceText.value = `Your Balance: ${playerTokenData?.balance?.balance} ${token?.symbol}`

    signLabel.value = `${token?.symbol} REQUIRED: ${MINIMUM_TOKEN_BALANCE}`
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
  

// ... truncated ...
```

---
*Extracted from TOKEN_GATE.hyp. Attachment ID: 1349126913485963344*