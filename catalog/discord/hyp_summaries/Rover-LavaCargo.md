# Rover-LavaCargo.hyp

## Metadata
- **Author**: maximus
- **Channel**: #🎨│showcase
- **Date**: 2025-02-12
- **Size**: 791,779 bytes

## Discord Context
> Remixed Metamike's Rover+Loot apps and hacked them to mock up a space trading sim.

Will keep iterating over concept over the next months grabbing what I can from folks to hobble together a trading sim <:pepestonks:999875339390029894> 

Used assets from poly pizza, void runners with music by Dvir Silver from Pixabay.

## Blueprint
- **Name**: Rover-LavaCargo
- **Version**: 71
- **Model**: `asset://3db935ce5f17527ed56ab005b5fa14789c63ad81d68d51a8cbc864967f639883.glb`
- **Script**: `asset://0216e66d4c83e7d9385681cd6d93e35eafd4a13a486e42006f0321e077f49f1a.js`

## Props
- `armorValue`: int = `25`
- `moveSpeed`: int = `3`
- `perceptionRadius`: int = `100`
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
- `perceptionRate`: int = `10`
- `pauseDuration`: int = `2`
- `patrolRadius`: int = `100`

## Assets
- `[model]` 3db935ce5f17527ed56ab005b5fa14789c63ad81d68d51a8cbc864967f639883.glb (773,748 bytes)
- `[script]` 0216e66d4c83e7d9385681cd6d93e35eafd4a13a486e42006f0321e077f49f1a.js (17,041 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.on()`
**World Methods**: `world.emit()`, `world.off()`, `world.on()`
**Events Listened**: `destroy`, `item-cleanup`, `item-detected`, `pong`, `proximity-check`, `update`
**Events Emitted**: `ping`, `proximity-check`, `resource-transfer`
**Nodes Created**: `ui`, `uitext`, `uiview`

## Keywords (for Discord search)
accept, after, amount, angle, angleDiff, angleToObject, appConfig, area, atan2, auto, backgroundColor, baseStats, based, behavior, billboard, boundaries, bounds, capacity, capacityIncrease, cargo

## Script Source
```javascript
app.scale.x = .410
app.scale.y = .410
app.scale.z = .410

// Random number generator with seed
let seed = Date.now();
function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
}

app.position.set(-10,100,-20)

// Get configuration values from app config
const appConfig = app.config || {};
const MOVEMENT_SPEED = appConfig.speed || 0.001;
const ROTATION_SPEED = appConfig.rotationSpeed || 0.5;
const PERCEIVE_RADIUS = appConfig.perceptionRadius || 100;
const PERCEPTION_ANGLE = (appConfig.perceptionAngle || 360) * (Math.PI / 180);
const PERCEPTION_COOLDOWN = appConfig.perceptionRate || 3;
const PAUSE_DURATION = appConfig.pauseDuration || 5;
const PATROL_RADIUS = appConfig.patrolRadius || 10;

// Movement and behavior constants
const PING_RADIUS = 5;
const MAX_STOP_DURATION = 15;
const SEARCH_DELAY = 2;
const SEARCH_DURATION = 2;
const PERCEIVE_TIME = 2;

// Define movement boundaries based on patrol radius
const bounds = {
    x: { min: -PATROL_RADIUS, max: PATROL_RADIUS },
    y: { min: 5, max: 10 },
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
        name: 'Ship Stability',
        max: 100,
        regenRate: 0, // No auto regen
        depleteRate: 5 / ((appConfig.healthDepletionTime || 5) * 60), // Deplete to 0 in configured minutes
        color: '#f54242'
    },
    cargo: {
        name: 'Profitability',
        max: 100,
        regenRate: 0, // No auto regen
        depleteRate: 10 / ((appConfig.cargoDepletionTime || 1) * 60), // Deplete to 0 in configured minutes
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
        default: 0.001,
        min: 0.001,
        max: .05
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
        max: 100
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
        label: 'Ship Stability Depletion Time (minutes)',
        description: 'Time in minutes for health to deplete to 0',
        default: 5,
        min: 1,
        max: 60
    },
    {
        key: 'cargoDepletionTime',
        type: 'number',
        label: 'Cargo Profitability Depletion Time (minutes)',
        description: 'Time in minutes for cargo to deplete to 0',
        default: 1,
        min: 0.5,
        max: 30
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

// State Management
const objectState = {
    type: STATION_CONFIG.type,
    status: 'patrolling',
    stats: {
        health: STATS_CONFIG.health.max,
        cargo: STATS_CONFIG.cargo.max
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
    startPosition: { x: 0, z: 0, y:10 },
    lastWanderAngle: 0
};

// Helper vectors for rotation
const UP = { x: 0, y: 1, z: 0 };
const direction = { x: 0, y: 0, z: 0 };
const targetRotation = { x: 0, y: 0, z: 0 };

// UI Setup
const mainUI = app.create('ui');
mainUI.backgroundColor = 'transparent';
mainUI.width = 300;
mainUI.height = 200;
mainUI.flexDirection = 'column';
mainUI.position.y = 10;
mainUI.billboard = 'y';
mainUI.rotation.y = Math.PI;
app.add(mainUI);

// Status container
const statusContainer = app.create('uiview');
statusContainer.width = 300;
statusContainer.height = 60;
statusContainer.backgroundColor = '#202020';
statusContainer.flexDirection = 'column';
statusContainer.padding = 5;
statusContainer.margin = 2;
mainUI.add(statusContainer);

const statusText = app.create('uitext', {
    padding: 2,
    color: '#FFFFFF',
    value: 'Collectron Status'
});
statusContainer.add(statusText);

const targetText = app.create('uitext', {
    padding: 2,
    color: '#FFFFFF',
    value: 'No target'
});
statusContainer.add(targetText);

// Create UI elements for each stat
const statBars = {};
Object.keys(STATS_CONFIG).forEach((stat, index) => {
    const container = app.create('uiview');
    container.width = 300;
    container.height = 40;
    container.backgroundColor = '#202020';
    container.flexDirection = 'column';
    container.padding = 5;
    container.margin = 2;
    mainUI.add(container);

    const label = app.create('uitext', {
        padding: 2,
        color: '#FFFFFF',
        value: STATS_CONFIG[stat].name
    });
    container.add(label);

    const bar = app.create('uiview');
    bar.width = 290;
    bar.height = 20;
    bar.backgroundColor = STATS_CONFIG[stat].color;
    container.add(bar);

    statBars[stat] = {
        container,
        label,
        bar
    };
});

// Update the display of a stat bar
function updateStatDisplay(stat) {
    const value = objectState.stats[stat];
    const maxValue = STATS_CONFIG[stat].max;
    if (statBars[stat]) {
        statBars[stat].bar.width = (value / maxValue) * 290;
        statBars[stat].label.value = `${STATS_CONFIG[stat].name}: ${Math.round(value)}%`;
    }
}

// Update status text function
function updateStatusText(message) {
    statusText.value = message;
}

// Update target text function
function updateTargetText(message) {
    targetText.value = message;
}

// Helper functions
function getDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function generateRandomPosition()

// ... truncated ...
```

---
*Extracted from Rover-LavaCargo.hyp. Attachment ID: 1339121964136136726*