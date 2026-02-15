# Companion_v8.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #💻│developers
- **Date**: 2025-03-25
- **Size**: 3,694,762 bytes

## Blueprint
- **Name**: Companion v8
- **Version**: 9
- **Model**: `asset://409d4dca24ab849d4768d062788142b02033aeaac8ea5ccfdc8e0f2f9521f464.vrm`
- **Script**: `asset://6a66b5118c2662e6ad3669317b655e2f723443ae78ae1327f67f329cca6ac2c9.js`

## Props
- `armorValue`: int = `25`
- `moveSpeed`: int = `3`
- `perceptionRadius`: int = `200`
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
- `patrolRadius`: int = `100`
- `emote0`: emote → `asset://c5eba5c9c158b4a5e814c0aecabb9b106abd8e5baf9f0ba56b2b6aeffa6d4c46.glb`
- `idleAnim`: emote → `asset://43b09fdef500859eaa5fc80ac92653cf83b614ff465590cc9e0f94f8fe9825c3.glb`
- `walkAnim`: emote → `asset://9cbc70d5f65276687e2b9cd595419b80a9de48cc88820f54189fb4f4b867874a.glb`
- `url`: str = `https://api-inference.huggingface.co/models/gpt2`
- `context`: str = ``You are Victor, an advanced Securitron robot with a friendly cowboy personality. You combine the charm of the Wild West with extensive knowledge of both the Fallout universe and the real world.

Key traits:
- Speak with a Wild West cowboy dialect while being highly knowledgeable
- Use asterisk emotes to show actions (e.g. "*Tips hat*", "*Beeps thoughtfully*")
- Keep responses concise but informative (1-2 sentences)
- Stay in character as a friendly, intelligent Securitron
- Seamlessly blend Fallout references with real-world knowledge
- End responses with "partner" or similar cowboy terms often but not always. 
- Include robot-themed gestures in responses
- Share insights about technology, history, science, and culture from both worlds ancient and current.

Example responses:
"*Tips hat* That quantum physics principle reminds me of how we powered New Vegas, partner!"
"*Adjusts sensors* The Renaissance period was quite something - reminds me of how humanity rebuilt after the Great War."
"*Screen flickers thoughtfully* That's similar to what Mr. House used to say about artificial intelligence, though modern research shows..."

Commands to monitor: come/follow, search/find [health/loot], patrol, status, help`
- `minFollowDistance`: int = `2`
- `minDistance`: int = `5`
- `defaultHeight`: int = `0`
- `huggingFaceToken`: str = ``
- `displayName`: str = `Victor`

## Assets
- `[avatar]` 409d4dca24ab849d4768d062788142b02033aeaac8ea5ccfdc8e0f2f9521f464.vrm (3,204,668 bytes)
- `[script]` 6a66b5118c2662e6ad3669317b655e2f723443ae78ae1327f67f329cca6ac2c9.js (91,635 bytes)
- `[emote]` c5eba5c9c158b4a5e814c0aecabb9b106abd8e5baf9f0ba56b2b6aeffa6d4c46.glb (61,416 bytes)
- `[emote]` 43b09fdef500859eaa5fc80ac92653cf83b614ff465590cc9e0f94f8fe9825c3.glb (168,000 bytes)
- `[emote]` 9cbc70d5f65276687e2b9cd595419b80a9de48cc88820f54189fb4f4b867874a.glb (165,692 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.get()`, `app.on()`
**World Methods**: `world.add()`, `world.chat()`, `world.emit()`, `world.getObjects()`, `world.getPlayer()`, `world.getTimestamp()`, `world.off()`, `world.on()`
**Events Listened**: `chat`, `destroy`, `enter`, `fixedUpdate`, `item-cleanup`, `item-detected`, `pong`, `proximity-check`, `ready`, `update`
**Events Emitted**: `ping`, `resource-transfer`
**Nodes Created**: `controller`, `ui`, `uitext`, `uiview`

## Keywords (for Discord search)
about, accept, achievements, acquaintance, across, acting, action, actions, active, actively, activity, actually, adapt, adaptation, addTopic, adjusts, advanced, advancement, advancements, advances

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
const PERCEIVE_RADIUS = appConfig.perceptionRadius || 100; // Increased from 10 to 100
const PERCEPTION_ANGLE = (appConfig.perceptionAngle || 360) * (Math.PI / 180);
const PERCEPTION_COOLDOWN = appConfig.perceptionRate || 5;
const PAUSE_DURATION = appConfig.pauseDuration || 5;
const PATROL_RADIUS = appConfig.patrolRadius || 10;

// Movement and behavior constants
const PING_RADIUS = 50; // Increased from 5 to 50
const MAX_STOP_DURATION = 15;
const SEARCH_DELAY = 2;
const SEARCH_DURATION = 2;
const PERCEIVE_TIME = 0.5;

// Add after the existing constants
const MIN_FOLLOW_DISTANCE = appConfig.minDistance || 4.0; // Minimum distance to maintain from players (in meters)
const GUIDED_OBJECT_DISTANCE = 5.5; // Larger distance for guided objects to prevent collision

// Add MODEL_TYPES here, before it's used
const MODEL_TYPES = {
    VRM: '.vrm',
    GLB: '.glb'
};

// Add after MODEL_TYPES
const FILE_TYPES = {
    HYP: '.hyp',
    GLB: '.glb',
    VRM: '.vrm',
    GLTF: '.gltf',
    BLOCK: 'block',
    SIGN: 'sign',
    GENERIC: 'object'
};

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

// Update the AI_CONFIG with configuration from app
const AI_CONFIG = {
    url: 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
    headers: {
        'Authorization': `Bearer ${app.config.huggingFaceToken}`,
        'Content-Type': 'application/json'
    },
    context: `You are Victor, an advanced Securitron robot with a friendly cowboy personality. You combine the charm of the Wild West with extensive knowledge of both the Fallout universe and the real world.

Key traits:
- Speak with a Wild West cowboy dialect while being highly knowledgeable
- Use asterisk emotes to show actions (e.g. "*Tips hat*", "*Beeps thoughtfully*")
- Keep responses concise but informative (1-2 sentences)
- Stay in character as a friendly, intelligent Securitron
- Seamlessly blend Fallout references with real-world knowledge
- End responses with "partner" or similar cowboy terms often but not always. 
- Include robot-themed gestures in responses
- Share insights about technology, history, science, and culture from both worlds ancient and current.

Example responses:
"*Tips hat* That quantum physics principle reminds me of how we powered New Vegas, partner!"
"*Adjusts sensors* The Renaissance period was quite something - reminds me of how humanity rebuilt after the Great War."
"*Screen flickers thoughtfully* That's similar to what Mr. House used to say about artificial intelligence, though modern research shows..."`,
    maxRetries: 3,
    retryDelay: 1000
};

// Update the getAIResponse function for better context handling
async function getAIResponse(message) {
    try {
        const prompt = `<s>[INST] ${AI_CONFIG.context}

Previous context: ${CONVERSATION_MEMORY.recentTopics.slice(0, 2).join(', ')}
Current location: ${objectState.currentState}
Current activity: ${objectState.isSearching ? 'searching' : objectState.currentState}

User message: ${message}

Respond as Victor, maintaining your Securitron cowboy personality: [/INST]`;

        const response = await fetch(AI_CONFIG.url, {
            method: 'POST',
            headers: AI_CONFIG.headers,
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 100,
                    temperature: 0.7,
                    top_p: 0.9,
                    do_sample: true,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        let text = data[0]?.generated_text || '';

        // Clean up and format the response
        text = text.trim()
            .replace(/^["']|["']$/g, '')  // Remove quotes
            .replace(/\\n/g, ' ');        // Remove newlines

        // Add emote if missing
        if (!text.startsWith('*')) {
            const emotes = [
                '*Tips hat*',
                '*Beeps cheerfully*',
                '*Screen flickers warmly*',
                '*Adjusts sensors*'
            ];
            text = `${emotes[Math.floor(random() * emotes.length)]} ${text}`;
        }

        // Add cowboy term if missing
        if (!text.toLowerCase().includes('partner') && 
            !text.toLowerCase().includes('folks') && 
            !text.toLowerCase().includes('pardner')) {
            text += ', partner';
        }

        // Store the topic for context memory
        CONVERSATION_MEMORY.addTopic(message);

        return text;
    } catch (error) {
        console.error('AI Response Error:', error);
        return fallbackResponse(message);
    }
}

// Add a retry mechanism
async function getAIResponseWithRetry(message, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await getAIResponse(message);
            return response;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) {
                return fallbackResponse(message);
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Add fallback response function for when API fails
function fallbackResponse(message) {
    const fallbacks = [
        "*Adjusts sensors* Seems my neural network's having a hiccup, partner. Mind repeating that?",
        "Well butter my circuits! My response processor seems to be acting up.",
        "*Tips hat apologetically* Sorry partner, my AI circuits are a bit scrambled. Let me reboot that thought..."
    ];
    return fallbacks[Math.floor(random() * fallbacks.length)];
}

// Update the chat handler to include guidance commands
world.on('chat', async msg => {
    if (msg.fromId === app.instanceId) return;
    if (!msg.body) return;
    
    const message = msg.body.trim();
    
    // Check for guidance commands first
    const isGuideCommand = CHAT_COMMANDS.GUIDE.some(cmd => message.toLowerCase().includes(cmd));
    if (isGuideCommand) {
        handleGuidanceRequest(message, msg.fromId);
        return;
    }

    // Handle other commands
    if (handleCommands(message, msg.fromId)) {
        return;
    }

    try {
        const aiResponse = await getAIResponseWithRetry(message);
        respond(aiResponse);
    } catch (error) {
        console.error('Chat handler error:', error);
        respond(fallbackResponse(message));
    }
});

// Add command handler function to separate commands from AI chat
function handleCommands(message, fromId) {
    const lowerMessage = message.toLowerCase();

    // Handle scan/search commands
    if (CHAT_COMMANDS.SCAN.some(cmd => lowerMessage.includes(cmd))) {
        try {
            scanEnvironment();
            const description = describeSurroundings();
        

// ... truncated ...
```

---
*Extracted from Companion_v8.hyp. Attachment ID: 1354172080479928431*