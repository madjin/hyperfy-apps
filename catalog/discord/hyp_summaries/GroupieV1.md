# GroupieV1.hyp

## Metadata
- **Author**: b34k3r
- **Channel**: #💻│developers
- **Date**: 2025-10-12
- **Size**: 417,896 bytes

## Discord Context
> I think these are <@688215116457443346>'s

## Blueprint
- **Name**: GroupieV1
- **Version**: 10
- **Model**: `asset://2d5bdbf200c12669c9e48e6d90fce53acee4f15cd441ef9155fa2c02c9a8e910.vrm`
- **Script**: `asset://00296f4074b92087d54429d85903e923e87e70370cd8edd40084c90ffab4aacf.js`

## Props
- `armorValue`: int = `25`
- `moveSpeed`: int = `3`
- `perceptionRadius`: int = `50`
- `baseHealth`: int = `80`
- `baseLoot`: int = `80`
- `healthRegenRate`: int = `3`
- `lootRegenRate`: int = `3`
- `healthDepleteRate`: int = `3`
- `lootDepleteRate`: int = `3`
- `speed`: int = `3`
- `healthDepletionTime`: int = `2`
- `lootDepletionTime`: int = `1`
- `rotationSpeed`: int = `10`
- `perceptionAngle`: int = `360`
- `perceptionRate`: int = `5`
- `pauseDuration`: int = `2`
- `patrolRadius`: int = `50`
- `emote0`: emote → `asset://c5eba5c9c158b4a5e814c0aecabb9b106abd8e5baf9f0ba56b2b6aeffa6d4c46.glb`
- `idleAnim`: emote → `asset://930040910cff7d172218a6251cb091f5be62c42b0b4c3cf9f051a1793101ce6f.glb`
- `walkAnim`: emote → `asset://9cbc70d5f65276687e2b9cd595419b80a9de48cc88820f54189fb4f4b867874a.glb`

## Assets
- `[avatar]` 2d5bdbf200c12669c9e48e6d90fce53acee4f15cd441ef9155fa2c02c9a8e910.vrm (97,304 bytes)
- `[script]` 00296f4074b92087d54429d85903e923e87e70370cd8edd40084c90ffab4aacf.js (24,415 bytes)
- `[emote]` c5eba5c9c158b4a5e814c0aecabb9b106abd8e5baf9f0ba56b2b6aeffa6d4c46.glb (61,416 bytes)
- `[emote]` 930040910cff7d172218a6251cb091f5be62c42b0b4c3cf9f051a1793101ce6f.glb (67,272 bytes)
- `[emote]` 9cbc70d5f65276687e2b9cd595419b80a9de48cc88820f54189fb4f4b867874a.glb (165,692 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.get()`, `app.on()`
**World Methods**: `world.chat()`, `world.emit()`, `world.getPlayer()`, `world.getTimestamp()`, `world.off()`, `world.on()`
**Events Listened**: `chat`, `destroy`, `item-cleanup`, `item-detected`, `pong`, `proximity-check`, `update`
**Events Emitted**: `ping`, `proximity-check`, `resource-transfer`
**Nodes Created**: `ui`, `uitext`, `uiview`

## Keywords (for Discord search)
accept, after, amount, angle, angleDiff, angleToObject, animUrl, animation, animationTimer, appConfig, area, atan2, auto, avatar, background, backgroundColor, baseStats, based, behavior, behind

## Script Source
```javascript
// Random number generator with seed
let seed = Date.now();
function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
}

// Get configuration values from app config
const appConfig = app.config || {};
const MOVEMENT_SPEED = appConfig.speed || 0.8;
const ROTATION_SPEED = appConfig.rotationSpeed || 0.5;
const PERCEIVE_RADIUS = appConfig.perceptionRadius || 10;
const PERCEPTION_ANGLE = (appConfig.perceptionAngle || 360) * (Math.PI / 180);
const PERCEPTION_COOLDOWN = appConfig.perceptionRate || 5;
const PAUSE_DURATION = appConfig.pauseDuration || 5;
const PATROL_RADIUS = appConfig.patrolRadius || 10;

// Movement and behavior constants
const PING_RADIUS = 5;
const MAX_STOP_DURATION = 15;
const SEARCH_DELAY = 2;
const SEARCH_DURATION = 2;
const PERCEIVE_TIME = 0.5;

// Add after the existing constants
const MIN_FOLLOW_DISTANCE = 2.0; // Minimum distance to maintain from players (in meters)

// Define movement boundaries based on patrol radius
const bounds = {
    x: { min: -PATROL_RADIUS, max: PATROL_RADIUS },
    y: { min: 0, max: 0 },
    z: { min: -PATROL_RADIUS, max: PATROL_RADIUS }
};

// Station Configuration
const STATION_CONFIG = {
    type: 'collectron',
    baseStats: {
        processTime: 3000,
        moveRange: 3,
        capacity: 20,
        xpPerItem: 15
    },
    levelBonuses: {
        processTimeReduction: 0.1,
        capacityIncrease: 5,
        speedIncrease: 0.005
    }
};

// Stats Configuration
const STATS_CONFIG = {
    health: {
        name: 'Health',
        max: 100,
        regenRate: 0, // No auto regen
        depleteRate: 100 / ((appConfig.healthDepletionTime || 5) * 60), // Deplete to 0 in configured minutes
        color: '#f54242'
    },
    loot: {
        name: 'Loot',
        max: 100,
        regenRate: 0, // No auto regen
        depleteRate: 100 / ((appConfig.lootDepletionTime || 1) * 60), // Deplete to 0 in configured minutes
        color: '#4287f5'
    }
};

// Model Configuration
app.configure(() => [
    {
        key: 'model',
        type: 'file',
        label: 'Model',
        description: 'Upload a GLB model for the collectron',
        accept: '.glb'
    },
    {
        key: 'speed',
        type: 'number',
        label: 'Movement Speed',
        description: 'Speed at which the collectron moves',
        default: 0.8,
        min: 0.1,
        max: 5
    },
    {
        key: 'rotationSpeed',
        type: 'number',
        label: 'Rotation Speed',
        description: 'How quickly the collectron turns',
        default: 0.5,
        min: 0.1,
        max: 10
    },
    {
        key: 'perceptionRadius',
        type: 'number',
        label: 'Perception Radius',
        description: 'How far the collectron can detect items',
        default: 10,
        min: 1,
        max: 50
    },
    {
        key: 'perceptionAngle',
        type: 'number',
        label: 'Perception Angle',
        description: 'Field of view angle in degrees (360 for full circle)',
        default: 360,
        min: 45,
        max: 360
    },
    {
        key: 'perceptionRate',
        type: 'number',
        label: 'Perception Rate',
        description: 'How often the collectron scans for items (seconds)',
        default: 5,
        min: 1,
        max: 30
    },
    {
        key: 'pauseDuration',
        type: 'number',
        label: 'Pause Duration',
        description: 'How long to pause when reaching a destination (seconds)',
        default: 5,
        min: 1,
        max: 30
    },
    {
        key: 'patrolRadius',
        type: 'number',
        label: 'Patrol Radius',
        description: 'How far from start position the collectron will patrol',
        default: 10,
        min: 5,
        max: 100
    },
    {
        key: 'healthDepletionTime',
        type: 'number',
        label: 'Health Depletion Time (minutes)',
        description: 'Time in minutes for health to deplete to 0',
        default: 5,
        min: 1,
        max: 60
    },
    {
        key: 'lootDepletionTime',
        type: 'number',
        label: 'Loot Depletion Time (minutes)',
        description: 'Time in minutes for loot to deplete to 0',
        default: 1,
        min: 0.5,
        max: 30
    },
    {
        key: 'idleAnim',
        type: 'file',
        kind: 'emote',
        label: 'Idle Animation',
        description: 'Animation to play when standing still'
    },
    {
        key: 'walkAnim',
        type: 'file',
        kind: 'emote',
        label: 'Walk Animation',
        description: 'Animation to play when moving'
    },
    {
        key: 'searchAnim',
        type: 'file',
        kind: 'emote',
        label: 'Search Animation',
        description: 'Animation to play when searching'
    }
]);

// Resource Types
const RESOURCE_TYPES = {
    SCRAP: 'scrap',
    CONTAINER: 'container',
    REFINERY: 'refinery',
    WORKBENCH: 'workbench',
    STORAGE: 'storage'
};

// Animation states
const ANIMATIONS = {
    IDLE: 'idle',
    WALK: 'walk',
    SEARCH: 'search'
};

// After ANIMATIONS constant, add:
const CHAT_COMMANDS = {
    COME: ['come', 'come here', 'follow'],
    SEARCH: ['search', 'find', 'look for'],
    PATROL: ['patrol', 'resume patrol', 'continue patrol'],
    STATUS: ['status', 'how are you', 'report'],
    HELP: ['help', 'commands', '?']
};

const RESPONSES = {
    ACKNOWLEDGE: [
        "Howdy partner! Right on it!",
        "Your friendly neighborhood Collectron at your service!",
        "Well ain't that just dandy - I'm on my way!",
    ],
    SEARCHING: [
        "Scanning the wasteland for goodies!",
        "Time to hunt for treasures, partner!",
        "My sensors are picking up something interesting...",
    ],
    FOLLOWING: [
        "Following your lead, partner!",
        "Right behind you, smooth skin!",
        "Keeping you in my sights, boss!",
    ],
    STATUS: [
        "Running diagnostics... Health at {health}%, Loot capacity at {loot}%",
        "All systems nominal! Health: {health}%, Loot: {loot}%",
        "Status report: Health levels {health}%, Loot storage {loot}%",
    ],
    HELP: [
        "Available commands:\n- come/follow\n- search/find [health/loot]\n- patrol\n- status\n- help",
    ]
};

// State Management
const objectState = {
    type: STATION_CONFIG.type,
    status: 'patrolling',
    stats: {
        health: STATS_CONFIG.health.max,
        loot: STATS_CONFIG.loot.max
    },
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    inventory: [],
    maxInventory: STATION_CONFIG.baseStats.capacity,
    isMoving: true,
    pauseTimer: 0,
    rotationAngle: 0,
    searchTimer: 0,
    isSearching: false,
    isPerceiving: false,
    perceptionTimer: 0,
    lastPerceptionTime: Date.now(),
    perceivedObjects: new Map(),
    knownLocations: new Map(),
    textBuffer: [],
    scrollTimer: 0,
    currentText: '',
    wanderTimer: 0,
    startPosition: { x: 0, z: 0 },
    lastWanderAngle: 0,
    currentAnimation: ANIMATIONS.IDLE,
    animationTimer: 0,
    followTarget: null,
    searchType: null
};

// Helper vectors for rotation
const UP = { x: 0, y: 1, z: 0 };
const direction = { x: 0, y: 0, z: 0 };
const targetRotation = { x: 0, y: 0, z: 0 };

// UI Setup
const mainUI = app.create('ui');
mainUI.backgroundColor = 'transparent'; // Fully transparent main background
mainUI.width = 300;
mainUI.height = 200;
mainUI.flexDirection = 'column';
mainUI.position.y = 4;
mainUI.billboard = 'y';
mainUI.rotation.y = Math.PI;
app.add(mainUI);

// Status container
const statusContainer = app.create('uiview');
statusContainer.width = 300;
statusContainer.height = 60;
statusContainer.backgroundColor = 'transparent'; // Fully transparent container
statusContainer.

// ... truncated ...
```

---
*Extracted from GroupieV1.hyp. Attachment ID: 1426847074653311006*