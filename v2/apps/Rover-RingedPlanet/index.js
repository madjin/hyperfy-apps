export default function main(world, app, fetch, props, setTimeout) {
app.scale.x = .210
app.scale.y = .210
app.scale.z = .210

// Random number generator with seed
let seed = Date.now();
function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
}

app.position.set(-10,100,-20)

// Get configuration values from app config
const appConfig = app.config || {};
const MOVEMENT_SPEED = appConfig.speed || 0.01;
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
    ringedPlanet: {
        name: 'Profitability',
        max: 100,
        regenRate: 0, // No auto regen
        depleteRate: 35 / ((appConfig.ringedDepletionTime || 1) * 60), // Deplete to 0 in configured minutes
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
        key: 'ringedDepletionTime',
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
        ringedPlanet: STATS_CONFIG.ringedPlanet.max
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

function generateRandomPosition() {
    return {
        x: bounds.x.min + random() * (bounds.x.max - bounds.x.min),
        y: bounds.y.min + random() * (bounds.y.max - bounds.y.min),
        z: bounds.z.min + random() * (bounds.z.max - bounds.z.min)
    };
}

function findNearestItem() {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const [id, object] of objectState.perceivedObjects) {
        if (object.type === 'health' || object.type === 'ringedPlanet') {
            const distance = getDistance(app.position, object.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = object;
            }
        }
    }
    
    return nearest;
}

// Perception System
function setupPerception() {
    function pongHandler([entityId, objectInfo]) {
        if (entityId !== app.instanceId) return;
        
        // Calculate angle to object relative to collectron's facing direction
        const dx = objectInfo.position.x - app.position.x;
        const dz = objectInfo.position.z - app.position.z;
        const angleToObject = Math.atan2(dx, dz);
        
        // Get collectron's current facing angle
        const facingAngle = app.rotation.y;
        
        // Calculate relative angle
        let relativeAngle = angleToObject - facingAngle;
        while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
        while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
        
        // Check if object is within perception angle
        const halfAngle = PERCEPTION_ANGLE / 2;
        if (Math.abs(relativeAngle) <= halfAngle || PERCEPTION_ANGLE >= Math.PI * 2) {
            objectState.perceivedObjects.set(objectInfo.entityId, {
                ...objectInfo,
                position: objectInfo.position || app.position,
                lastSeen: Date.now()
            });
            
            if (Object.values(RESOURCE_TYPES).includes(objectInfo.type) || 
                objectInfo.type === 'health' || 
                objectInfo.type === 'ringedPlanet') {
                objectState.knownLocations.set(objectInfo.entityId, {
                    type: objectInfo.type,
                    position: objectInfo.position,
                    lastSeen: Date.now()
                });
            }
            
            updateStatusText(`Detected: ${objectInfo.name} (${objectInfo.type})`);
        }
    }
    
    world.on('pong', pongHandler);
    return () => world.off('pong', pongHandler);
}

function triggerPerception() {
    if (!objectState.isPerceiving && 
        Date.now() - objectState.lastPerceptionTime > PERCEPTION_COOLDOWN * 10) {
        objectState.isPerceiving = true;
        objectState.perceptionTimer = 0;
        app.emit('ping', [app.position, PERCEIVE_RADIUS, app.instanceId]);
        updateStatusText('Scanning environment...');
    }
}

// Initialize systems
const cleanupPerception = setupPerception();
let targetPosition = generateRandomPosition();

// Main update loop
app.on('update', delta => {
    // Update stats depletion
    Object.keys(STATS_CONFIG).forEach(stat => {
        objectState.stats[stat] = Math.max(
            0,
            objectState.stats[stat] - (STATS_CONFIG[stat].depleteRate * delta)
        );
        updateStatDisplay(stat);
    });

    if (objectState.isPerceiving) {
        objectState.perceptionTimer += delta;
        if (objectState.perceptionTimer >= PERCEIVE_TIME) {
            objectState.isPerceiving = false;
            objectState.lastPerceptionTime = Date.now();
        }
    }

    if (objectState.isMoving) {
        if (random() < 0.1 * delta) {
            triggerPerception();
        }
        
        // Emit collectron type for nearby items
        world.emit('proximity-check', {
            instanceId: app.instanceId,
            position: app.position,
            type: 'collectron',
            metadata: { type: 'collectron' }
        });
        
        // Check for nearby items first
        const nearestItem = findNearestItem();
        if (nearestItem) {
            // Update target position to the item's position
            targetPosition = nearestItem.position;
            updateTargetText(`Moving to: ${nearestItem.name}`);
        } else {
            updateTargetText('Patrolling');
        }
        
        const distance = getDistance(app.position, targetPosition);
        if (distance < 0.1) {
            objectState.isMoving = false;
            objectState.pauseTimer = PAUSE_DURATION;
            objectState.isSearching = true;
            triggerPerception();
            updateStatusText('Searching area...');
        } else {
            const moveAmount = (MOVEMENT_SPEED * delta); //  - .045
            const ratio = Math.min(moveAmount / distance, 1);
            
            // Calculate movement direction
            direction.x = targetPosition.x - app.position.x;
            direction.z = targetPosition.z - app.position.z;
            
            // Move towards target
            app.position.x += direction.x * ratio;
            app.position.z += direction.z * ratio;
            app.position.y = 45;
            
            // Calculate target rotation (direction we want to face)
            const targetAngle = Math.atan2(direction.x, direction.z);
            
            // Get current rotation
            let currentAngle = app.rotation.y;
            
            // Calculate shortest rotation path
            let angleDiff = targetAngle - currentAngle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Smoothly rotate towards target angle
            const rotationAmount = Math.min(ROTATION_SPEED * delta, Math.abs(angleDiff));
            app.rotation.y += Math.sign(angleDiff) * rotationAmount;
            
            updateStatusText('Moving...');
        }
    } else {
        objectState.pauseTimer -= delta;
        updateStatusText('Paused');
        
        if (objectState.isSearching) {
            if (!objectState.isPerceiving) {
                triggerPerception();
            }
            
            if (objectState.pauseTimer <= 0) {
                objectState.isSearching = false;
                objectState.isMoving = true;
                targetPosition = generateRandomPosition();
                updateStatusText('Resuming patrol');
            }
        }
    }
});

// Handle item cleanup
world.on('item-cleanup', (itemId) => {
    objectState.perceivedObjects.delete(itemId);
    objectState.knownLocations.delete(itemId);
    
    // If we were targeting this item, generate a new target position
    const nearestItem = findNearestItem();
    if (!nearestItem) {
        objectState.isMoving = true;
        objectState.isSearching = false;
        targetPosition = generateRandomPosition();
        updateStatusText('Resuming patrol...');
    }
});

// Handle collected items
world.on('item-detected', (info) => {
    if (info.collectorId === app.instanceId) {
        // Clean up the collected item from our perception
        objectState.perceivedObjects.delete(info.itemId);
        objectState.knownLocations.delete(info.itemId);
        
        // Apply the item's effect
        if (info.item.type === 'health') {
            objectState.stats.health = Math.min(
                STATS_CONFIG.health.max,
                objectState.stats.health + info.item.value
            );
            updateStatDisplay('health');
        } else if (info.item.type === 'ringedPlanet') {
            objectState.stats.ringedPlanet = Math.min(
                STATS_CONFIG.ringedPlanet.max,
                objectState.stats.ringedPlanet + info.item.value
            );
            updateStatDisplay('Ringed Planet');
        }
        
        // Resume roaming after collection
        objectState.isMoving = true;
        objectState.isSearching = false;
        targetPosition = generateRandomPosition();
        updateStatusText('Resuming patrol...');
    }
});

// Resource transfer system
world.on('proximity-check', (info) => {
    if (info.instanceId !== app.instanceId) {
        const distance = getDistance(info.position, app.position);
        
        if (distance <= PING_RADIUS && objectState.inventory.length > 0) {
            if (info.type === RESOURCE_TYPES.REFINERY) {
                world.emit('resource-transfer', {
                    from: app.instanceId,
                    to: info.instanceId,
                    amount: 1,
                    type: 'item'
                });
                objectState.inventory.pop();
                updateStatusText('Transferring item to refinery...');
            }
        }
    }
});

// Cleanup on destroy
app.on('destroy', () => {
    cleanupPerception();
});

}
