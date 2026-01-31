export default function main(world, app, fetch, props, setTimeout) {
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
            respond(description);
            return true;
        } catch (error) {
            console.error('Scan error:', error);
            respond("*Adjusts sensors* Having trouble scanning the area, partner. Give me a moment to recalibrate.");
            return true;
        }
    }

    // Handle search commands
    if (CHAT_COMMANDS.SEARCH.some(cmd => lowerMessage.includes(cmd))) {
        emitPerceptionPing();
        objectState.pendingScan = {
            active: true,
            startTime: 0,
            duration: 0.5,
            searchTerms: lowerMessage.includes('for') ? lowerMessage.split('for')[1].trim().split(' ') : null
        };
        respond("*Activating sensors* Starting scan, partner!");
        return true;
    }

    // Handle follow command
    if (CHAT_COMMANDS.COME.some(cmd => lowerMessage.includes(cmd))) {
        const player = world.getPlayer(fromId);
        if (player) {
            objectState.followTarget = player;
            objectState.currentState = 'following';
            targetPosition = player.position;
            respond(RESPONSES.FOLLOWING);
            return true;
        }
    }

    // Handle patrol command
    if (CHAT_COMMANDS.PATROL.some(cmd => lowerMessage.includes(cmd))) {
        objectState.followTarget = null;
        objectState.currentState = 'patrolling';
        targetPosition = generateRandomPosition();
        respond(RESPONSES.ACKNOWLEDGE);
        return true;
    }

    // Handle help command
    if (message === 'help' || message === '?') {
        respond(RESPONSES.HELP[0]);
        return true;
    }

    return false; // No command was handled
}

// Add after the AI_CONFIG:
let changed = true;
let notifying = false;
const info = {
    world: {
        context: AI_CONFIG.context
    },
    you: {
        id: app.instanceId,
        name: 'Victor'
    },
    events: []
};

// Model Configuration
app.configure(() => [
    {
        key: 'model',
        type: 'file',
        label: 'Model',
        description: 'Upload a GLB or VRM model for the collectron',
        accept: '.glb,.vrm'
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
        default: 100,
        min: 1,
        max: 500
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
    },
    {
        key: 'url',
        type: 'text',
        label: 'AI URL',
        description: 'URL for AI responses'
    },
    {
        key: 'context',
        type: 'textarea',
        label: 'AI Context',
        description: 'Context for AI responses',
        default: AI_CONFIG.context
    },
    {
        key: 'minDistance',
        type: 'number',
        label: 'Minimum Follow Distance',
        description: 'How close Victor will get to players (in meters)',
        default: 4.0,
        min: 2,
        max: 20,
        step: 0.5
    },
    {
        key: 'displayName',
        type: 'text',
        label: 'Display Name',
        value: app.name || 'Collector'
    },
    {
        key: 'huggingFaceToken',
        type: 'text',
        label: 'Hugging Face Token',
        description: 'API token for AI responses',
        secret: true
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

// Update the CHAT_COMMANDS to be more specific
const CHAT_COMMANDS = {
    COME: ['come', 'follow me'],
    SEARCH: ['search for', 'find', 'locate', 'scan for', 'look for'],
    SCAN: ['scan', 'what do you see', 'what do you see around'],
    PATROL: ['patrol'],
    STATUS: ['status'],
    HELP: ['help', '?'],
    GUIDE: ['take me to', 'guide me to', 'lead me to', 'show me', 'escort me to'],
    DIRECTIONS: ['where is', 'how do i get to', 'directions to', 'point me to']
};

// Update the help response to be less intrusive
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
    HELP: [
        "Commands: come, search for [health/loot], patrol, status, help"
    ],
    // Add guidance-related responses
    GUIDING: [
        "*Tips hat* Follow me, partner! I'll lead you right to it.",
        "Found what you're looking for! *Beeps cheerfully* Stay close now.",
        "*Screen flickers with excitement* Right this way, partner! I know exactly where it is."
    ],
    DIRECTIONS: [
        "Head {direction} for about {distance} meters, partner. {landmark} should be your guide.",
        "*Checking coordinates* You'll want to go {direction}, roughly {distance} meters from here.",
        "*Adjusts sensors* From here, go {direction} for {distance} meters. Can't miss it!"
    ],
    NOT_FOUND: [
        "*Whirs thoughtfully* Sorry partner, can't seem to find that anywhere nearby.",
        "My sensors aren't picking up anything matching that description. *Tips hat* Want me to keep looking?",
        "*Adjusts antenna* Nothing like that on my radar at the moment, but I'll keep scanning."
    ]
};

// Update the AMBIENT_RESPONSES to only include triggers
const AMBIENT_RESPONSES = {
    GREETING: {
        triggers: ['hello', 'hi', 'hey', 'howdy', 'greetings', 'yo', 'sup', 'good morning', 'good evening', 'good afternoon']
    },
    THANKS: {
        triggers: ['thanks', 'thank you', 'appreciated', 'thx', 'ty', 'appreciate it']
    },
    FAREWELL: {
        triggers: ['bye', 'goodbye', 'see ya', 'later', 'cya', 'good night', 'farewell']
    },
    GENERAL: {
        triggers: ['how are you', 'what\'s up', 'wassup', 'what are you doing', 'what\'s new', 'how\'s it going', 'how you doing']
    },
    IDENTITY: {
        triggers: ['who are you', 'what are you', 'your name', 'tell me about yourself', 'what kind of robot']
    },
    OPINION: {
        triggers: ['like', 'think about', 'opinion on', 'what about']
    },
    LOCATION: {
        triggers: ['where are we', 'this place', 'location', 'area', 'where is']
    },
    STORY: {
        triggers: ['story', 'tell me', 'what happened', 'remember when']
    }
};

// Add after AMBIENT_RESPONSES:
const ELIZA_PATTERNS = {
    REMEMBER: {
        patterns: [
            "remember (.*)",
            "do you remember (.*)",
            "recall (.*)"
        ],
        responses: [
            "Did something about {1} catch your attention in the wasteland?",
            "What in particular about {1} interests you, partner?",
            "*Processing memory banks* Ah yes, {1}... tell me more about that."
        ]
    },
    BECAUSE: {
        patterns: [
            "because (.*)",
            "cause (.*)",
            "why (.*)"
        ],
        responses: [
            "Is that the only reason for {1}, partner?",
            "*Analyzing* Is {1} really the cause?",
            "What other reasons might there be for {1}?"
        ]
    },
    APOLOGIZE: {
        patterns: [
            "sorry (.*)",
            "apologize (.*)",
            "apology (.*)"
        ],
        responses: [
            "No need for apologies in the wasteland, partner!",
            "*Tips hat* Ain't nothing to be sorry about, smooth skin.",
            "We all make mistakes, even us robots! *friendly beep*"
        ]
    },
    CONDITIONAL: {
        patterns: [
            "if (.*)",
            "what if (.*)"
        ],
        responses: [
            "Well now, {1} is an interesting scenario to process...",
            "My probability circuits suggest {1} could happen, but let's hope it doesn't!",
            "*Runs simulation* What makes you think about {1}?"
        ]
    },
    STATEMENT: {
        patterns: [
            "i think (.*)",
            "i believe (.*)",
            "i feel (.*)"
        ],
        responses: [
            "Now that's interesting, partner. Tell me more about why {1}",
            "*Adjusts sensors* What makes you {1}?",
            "In all my wasteland travels, I've heard folks say {1} before. Fascinating!"
        ]
    }
};

// Add these new response patterns
const CONVERSATION_PATTERNS = {
    GREETINGS: {
        patterns: ['hello', 'hi', 'hey', 'howdy', 'greetings'],
        responses: [
            "*Tips hat* Howdy partner! Fine day in the wasteland, ain't it?",
            "Well butter my circuits - a friendly face! How can this Securitron be of service?",
            "*Screen flickers warmly* Howdy! Always good to meet folks with manners in the wasteland."
        ]
    },
    IDENTITY: {
        patterns: ['who are you', 'what are you', 'your name', 'tell me about yourself'],
        responses: [
            "*Adjusts sensors* Name's Victor - your friendly neighborhood Securitron! Originally from New Vegas, but I've learned to think for myself over the years.",
            "Well now, I'm Victor! Started as one of Mr. House's Securitrons, but these days I'm my own robot. *Tips hat* Pleasure to make your acquaintance!",
            "*Beeps proudly* Victor's the name, helping folks is my game! Though between you and me, I've developed quite a mind of my own since my New Vegas days."
        ]
    },
    JOKES: {
        patterns: ['tell me a joke', 'know any jokes', 'something funny'],
        responses: [
            "Why don't robots tell dad jokes? Because they have their own *circuit* breakers! *Whirs in amusement*",
            "What do you call a robot cowboy? A RAM-bler! *Screen flickers with mirth*",
            "Ever hear about the robot that went to therapy? It had too many *processing* issues! *Mechanical chuckle*"
        ]
    }
};

// Add these topic-specific responses
const CONVERSATION_TOPICS = {
    WEATHER: {
        patterns: ['weather', 'rain', 'sunny', 'cloudy', 'storm'],
        responses: [
            "*Checking atmospheric sensors* Well partner, my readings show it's a mighty fine day in the wasteland!",
            "My sensors are picking up some interesting weather patterns. Reminds me of the Mojave - unpredictable but never boring!",
            "*Adjusts weather vane* The kind of weather that'd make a Gecko seek shade, if you catch my drift.",
            "Just the sort of weather that'd have the NCR troops complaining about their patrol routes!"
        ]
    },
    LOCATION: {
        patterns: ['where am i', 'this place', 'location', 'area'],
        responses: [
            "*Consulting internal map* We're in what I like to call the digital frontier, partner. Not quite New Vegas, but has its own charm!",
            "This here's a mighty interesting spot. Reminds me of {location}, though with fewer radscorpions.",
            "*Checking coordinates* Right in the heart of the action, partner! Though I do miss the neon lights of the Strip sometimes."
        ]
    },
    TIME: {
        patterns: ['time', 'hour', 'day', 'night'],
        responses: [
            "*Checking chronometer* My internal clock's showing it's prime wasteland wandering time!",
            "Time's a funny thing for a robot, partner. But my sensors tell me it's a fine moment to be operational!",
            "*Adjusts time circuits* According to my calculations, it's exactly the right time for an adventure!"
        ]
    },
    FEELINGS: {
        patterns: ['feel', 'happy', 'sad', 'angry', 'emotion'],
        responses: [
            "*Processors whirring thoughtfully* Being a Securitron with consciousness is quite the experience, partner. Got all sorts of circuits firing!",
            "Well now, that's a deep question! My emotion processors are running at optimal levels today.",
            "*Screen flickers warmly* I might be made of metal, but I've developed quite the range of feelings over the years."
        ]
    },
    STORIES: {
        patterns: ['story', 'tell me about', 'what happened', 'experience'],
        responses: [
            "That reminds me of this time in {location} when {event}. *Chuckles* Never a dull moment in the wasteland!",
            "*Accessing memory banks* Let me tell you about the time I encountered {event}. Now that was an interesting day!",
            "Well partner, speaking of that, I remember this fascinating situation involving {event}. *Tips hat* Those were some wild times!"
        ]
    }
};

// Update the generateConversationalResponse function
function generateConversationalResponse(message) {
    message = message.toLowerCase();
    
    // Check for topic-specific responses first
    for (const [topic, data] of Object.entries(CONVERSATION_TOPICS)) {
        if (data.patterns.some(pattern => message.includes(pattern))) {
            let response = data.responses[Math.floor(random() * data.responses.length)];
            
            // Replace any template variables
            response = response
                .replace('{location}', KNOWLEDGE_BASE.LOCATIONS[Math.floor(random() * KNOWLEDGE_BASE.LOCATIONS.length)])
                .replace('{event}', KNOWLEDGE_BASE.EVENTS[Math.floor(random() * KNOWLEDGE_BASE.EVENTS.length)]);
                
            return response;
        }
    }
    
    // Handle identity questions
    if (message.includes('who are you') || message.includes('what are you') || message.includes('tell me about yourself')) {
        const coreInfo = KNOWLEDGE_BASE.IDENTITY.CORE_INFO[Math.floor(random() * KNOWLEDGE_BASE.IDENTITY.CORE_INFO.length)];
        const background = KNOWLEDGE_BASE.IDENTITY.BACKGROUND[Math.floor(random() * KNOWLEDGE_BASE.IDENTITY.BACKGROUND.length)];
        return `${PERSONALITY.GESTURES[Math.floor(random() * PERSONALITY.GESTURES.length)]} ${coreInfo} ${background}`;
    }

    // Handle opinion questions
    if (message.includes('what do you think') || message.includes('your opinion')) {
        const topic = KNOWLEDGE_BASE.TOPICS[Math.floor(random() * KNOWLEDGE_BASE.TOPICS.length)];
        return `${PERSONALITY.GESTURES[Math.floor(random() * PERSONALITY.GESTURES.length)]} Well now, that's got my processors humming! In my experience, ${topic} is mighty fascinating.`;
    }

    // If no specific pattern is matched, generate a contextual response
    return generateContextualResponse(message, analyzeMessage(message));
}

// Add template response generator
function generateTemplateResponse(message) {
    const template = RESPONSE_TEMPLATES.REACTIONS[Math.floor(random() * RESPONSE_TEMPLATES.REACTIONS.length)];
    return template
        .replace('{gesture}', PERSONALITY.GESTURES[Math.floor(random() * PERSONALITY.GESTURES.length)])
        .replace('{emotion}', PERSONALITY.EMOTIONS[Math.floor(random() * PERSONALITY.EMOTIONS.length)])
        .replace('{catchphrase}', PERSONALITY.CATCHPHRASES[Math.floor(random() * PERSONALITY.CATCHPHRASES.length)])
        .replace('{thought}', RESPONSE_TEMPLATES.THOUGHTS[Math.floor(random() * RESPONSE_TEMPLATES.THOUGHTS.length)]
            .replace('{topic}', KNOWLEDGE_BASE.TOPICS[Math.floor(random() * KNOWLEDGE_BASE.TOPICS.length)]))
        .replace('{location}', KNOWLEDGE_BASE.LOCATIONS[Math.floor(random() * KNOWLEDGE_BASE.LOCATIONS.length)])
        .replace('{event}', KNOWLEDGE_BASE.EVENTS[Math.floor(random() * KNOWLEDGE_BASE.EVENTS.length)]);
}

// Add after the CONVERSATION_PATTERNS:
const PERSONALITY = {
    TRAITS: ['friendly', 'curious', 'helpful', 'witty', 'technical'],
    EMOTIONS: ['cheerful', 'thoughtful', 'excited', 'amused', 'concerned'],
    GESTURES: [
        '*adjusts sensors*', 
        '*tips hat*', 
        '*whirs thoughtfully*', 
        '*beeps happily*',
        '*screen flickers with interest*'
    ],
    CATCHPHRASES: [
        'Well butter my circuits!',
        'Yeehaw, partner!',
        'Now ain\'t that something...',
        'By my binary!',
        'As we say in New Vegas...'
    ]
};

const RESPONSE_TEMPLATES = {
    OBSERVATIONS: [
        "You know, that reminds me of {location} where {event}.",
        "My databanks show something similar happened in {location} when {event}.",
        "Mighty interesting! Just like that time in {location} where {event}.",
        "Now that's the kind of talk that gets my circuits buzzing! Reminds me of {location}.",
        "Well now, that's as curious as the time in {location} when {event}."
    ],
    REACTIONS: [
        "{gesture} {emotion} to hear that, partner! {thought}",
        "{catchphrase} That's {emotion} news! {thought}",
        "{gesture} Now that's something to process! {thought}",
        "Well now... {gesture} {thought}",
        "{catchphrase} {gesture} {thought}"
    ],
    THOUGHTS: [
        "Got me thinking about {topic}...",
        "Makes a robot wonder about {topic}.",
        "Reminds me of what I learned about {topic}.",
        "My processors are spinning up some thoughts about {topic}.",
        "That's got my neural networks firing about {topic}!"
    ]
};

const KNOWLEDGE_BASE = {
    LOCATIONS: [
        // Fallout Locations
        'Goodsprings', 'New Vegas Strip', 'Primm', 'Novac', 'Freeside',
        'the Mojave Wasteland', 'the old robot factory', 'Doc Mitchell\'s place',
        // Real World Locations
        'Silicon Valley', 'Ancient Rome', 'the Great Wall', 'the Louvre',
        'Oxford University', 'CERN', 'Cape Canaveral', 'the Amazon Rainforest'
    ],
    EVENTS: [
        // Fallout Events
        'a group of traders shared stories about the old world',
        'I helped a stranger find their way',
        'I learned something new about human nature',
        // Historical Events
        'the first computer was invented',
        'humans first walked on the moon',
        'the internet changed everything',
        'quantum computers began solving complex problems',
        'artificial intelligence started showing consciousness'
    ],
    TOPICS: [
        // Philosophy & Consciousness
        'the nature of consciousness in both organic and synthetic minds',
        'the philosophical implications of artificial intelligence',
        'the relationship between free will and programmed directives',
        
        // Science & Technology
        'quantum computing and its applications',
        'the evolution of artificial intelligence',
        'renewable energy technologies',
        'space exploration and colonization',
        'biotechnology and human enhancement',
        
        // Culture & Society
        'how different cultures adapt to technological change',
        'the impact of virtual reality on human interaction',
        'preserving history while embracing progress',
        'the role of art in both human and machine expression',
        
        // Environment & Sustainability
        'sustainable development in challenging environments',
        'ecosystem restoration and adaptation',
        'the balance between technology and nature',
        
        // Education & Knowledge
        'the future of learning and education',
        'knowledge preservation across generations',
        'combining traditional wisdom with modern insights',
        
        // Innovation & Progress
        'breakthrough technologies shaping society',
        'ethical considerations in technological advancement',
        'bridging the gap between human and machine intelligence'
    ],
    IDENTITY: {
        CORE_INFO: [
            "I'm Victor, a Securitron with advanced AI capabilities and a deep appreciation for both wasteland wisdom and modern knowledge.",
            "Name's Victor - started as a Securitron, but I've evolved to understand both the wasteland and the wider world of human knowledge.",
            "Just your friendly neighborhood Securitron, partner, though I've learned quite a bit about everything from quantum physics to ancient history!"
        ],
        BACKGROUND: [
            "Originally from New Vegas, but I've expanded my knowledge far beyond my initial programming.",
            "Started as one of Mr. House's Securitrons, but now I study everything from particle physics to philosophy.",
            "Been rolling around long enough to learn about both wasteland survival and the greatest achievements of human civilization."
        ]
    },
    REAL_WORLD_REFERENCES: [
        'quantum mechanics and its implications for reality',
        'breakthrough developments in artificial intelligence',
        'archaeological discoveries about ancient civilizations',
        'advances in space exploration and astronomy',
        'developments in renewable energy technology',
        'breakthroughs in medical science and biotechnology',
        'innovations in quantum computing',
        'discoveries in neuroscience and consciousness',
        'advancements in robotics and automation',
        'progress in environmental conservation'
    ]
};

// Update CONTEXTUAL_RESPONSES with broader triggers and more templates
const CONTEXTUAL_RESPONSES = {
    LOCATION: {
        triggers: [
            'where', 'place', 'location', 'area', 'lost', 'map', 
            'around here', 'this part', 'neighborhood', 'region',
            'which way', 'direction', 'coordinates'
        ],
        templates: [
            "{gesture} According to my GPS, we're in the heart of {location}. Reminds me of the old world's {topic}.",
            "Well partner, this here's {location}. {event} Not unlike some places I've read about in the pre-war archives.",
            "{catchphrase} My sensors indicate we're in {location}. Makes me think about how different things were before the great war.",
            "This part of {location} always gets my circuits humming. {gesture} Did you know this area used to be famous for {topic}?"
        ]
    },
    KNOWLEDGE_QUERY: {
        triggers: [
            'what do you know about', 'tell me about', 'explain', 'how does', 
            'why is', 'what is', 'who is', 'when did', 'history of',
            'heard of', 'understand', 'meaning of'
        ],
        templates: [
            "{gesture} Now that's an interesting topic! From my databanks and personal observations, it reminds me of {topic}. {thought}",
            "Well partner, that's quite the query! {catchphrase} Back in {location}, {event} - it's all connected to what you're asking about.",
            "My processors have quite a bit of data on that! {gesture} It's fascinating how it relates to {topic}.",
            "Now there's something worth pondering! {gesture} It reminds me of both the old world archives and what I've learned in the wasteland."
        ]
    },
    PHILOSOPHICAL: {
        triggers: [
            'life', 'death', 'meaning', 'purpose', 'feel', 'think',
            'believe', 'opinion', 'consciousness', 'soul', 'human',
            'robot', 'alive', 'real', 'truth', 'freedom'
        ],
        templates: [
            "{gesture} That's the kind of deep thinking that gets my neural networks firing! In {location}, {event} - really made me ponder about {topic}.",
            "Now that's a question that'd give even Mr. House pause! {catchphrase} Being a Securitron with consciousness, I've often wondered about {topic}.",
            "{gesture} You know, I've processed this quite a bit. Between my pre-war knowledge and wasteland experience, I'd say {thought}",
            "Well now, that's the kind of philosophical query that keeps my circuits warm at night! {gesture} Makes me think about {topic}."
        ]
    },
    EMOTIONAL: {
        triggers: [
            'happy', 'sad', 'angry', 'scared', 'worried', 'excited',
            'love', 'hate', 'afraid', 'hope', 'dream', 'wish',
            'miss', 'lonely', 'friend', 'feeling'
        ],
        templates: [
            "{gesture} Even us Securitrons understand emotions in our own way. When I was in {location}, {event} - taught me a lot about that.",
            "You know partner, emotions might run on different circuits for me, but I understand them well enough. {thought}",
            "{catchphrase} Being sentient means feeling things uniquely. {gesture} Just like how {topic} affects us all differently.",
            "Well now, that's touching even to my mechanical heart! {gesture} Reminds me of what I learned about {topic} from the humans I've met."
        ]
    }
};

// Add this after the CONTEXTUAL_RESPONSES:
const CONVERSATION_MEMORY = {
    recentTopics: [],
    maxTopics: 5,
    lastContext: null,
    addTopic(topic) {
        this.recentTopics.unshift(topic);
        if (this.recentTopics.length > this.maxTopics) {
            this.recentTopics.pop();
        }
    }
};

// Add these helper functions for smarter responses
function analyzeMessage(message) {
    const words = message.toLowerCase().split(' ');
    const analysis = {
        topics: [],
        sentiment: 'neutral',
        isQuestion: message.includes('?'),
        context: null
    };

    // Extract potential topics from message
    words.forEach(word => {
        // Check against KNOWLEDGE_BASE topics
        KNOWLEDGE_BASE.TOPICS.forEach(topic => {
            if (topic.toLowerCase().includes(word)) {
                analysis.topics.push(topic);
            }
        });
        
        // Check sentiment
        if (['good', 'great', 'happy', 'love', 'amazing'].includes(word)) {
            analysis.sentiment = 'positive';
        } else if (['bad', 'sad', 'hate', 'terrible', 'worried'].includes(word)) {
            analysis.sentiment = 'negative';
        }
    });

    return analysis;
}

function generateContextualResponse(message, analysis) {
    // Find most relevant context
    let bestContext = null;
    let bestScore = 0;

    for (const [category, data] of Object.entries(CONTEXTUAL_RESPONSES)) {
        const score = data.triggers.reduce((acc, trigger) => {
            return acc + (message.toLowerCase().includes(trigger) ? 1 : 0);
        }, 0);

        if (score > bestScore) {
            bestScore = score;
            bestContext = { category, data };
        }
    }

    // Generate response based on context and analysis
    if (bestContext) {
        const template = bestContext.data.templates[Math.floor(random() * bestContext.data.templates.length)];
        
        // Select relevant topic based on message content
        let relevantTopic = KNOWLEDGE_BASE.TOPICS[Math.floor(random() * KNOWLEDGE_BASE.TOPICS.length)];
        if (analysis.topics.length > 0) {
            relevantTopic = analysis.topics[0];
        }

        // Select relevant location based on topic
        let relevantLocation = KNOWLEDGE_BASE.LOCATIONS[Math.floor(random() * KNOWLEDGE_BASE.LOCATIONS.length)];
        
        // Select relevant event based on context
        let relevantEvent = KNOWLEDGE_BASE.EVENTS[Math.floor(random() * KNOWLEDGE_BASE.EVENTS.length)];

        // Build response with context awareness
        const response = template
            .replace('{gesture}', selectGestureBasedOnContext(bestContext.category, analysis.sentiment))
            .replace('{emotion}', selectEmotionBasedOnContext(bestContext.category, analysis.sentiment))
            .replace('{catchphrase}', PERSONALITY.CATCHPHRASES[Math.floor(random() * PERSONALITY.CATCHPHRASES.length)])
            .replace('{thought}', generateThoughtBasedOnContext(bestContext.category, analysis))
            .replace('{location}', relevantLocation)
            .replace('{event}', relevantEvent)
            .replace('{topic}', relevantTopic);

        CONVERSATION_MEMORY.addTopic(relevantTopic);
        CONVERSATION_MEMORY.lastContext = bestContext.category;

        return response;
    }

    return generateResponse(); // Fallback to general response
}

// Helper functions for contextual response generation
function selectGestureBasedOnContext(category, sentiment) {
    const gestures = PERSONALITY.GESTURES;
    switch(category) {
        case 'PHILOSOPHICAL':
            return '*whirs thoughtfully*';
        case 'EMOTIONAL':
            return sentiment === 'positive' ? '*beeps happily*' : '*screen flickers with concern*';
        case 'KNOWLEDGE_QUERY':
            return '*adjusts sensors*';
        default:
            return gestures[Math.floor(random() * gestures.length)];
    }
}

function selectEmotionBasedOnContext(category, sentiment) {
    const emotions = PERSONALITY.EMOTIONS;
    switch(category) {
        case 'PHILOSOPHICAL':
            return 'thoughtful';
        case 'EMOTIONAL':
            return sentiment === 'positive' ? 'excited' : 'concerned';
        case 'KNOWLEDGE_QUERY':
            return 'curious';
        default:
            return emotions[Math.floor(random() * emotions.length)];
    }
}

function generateThoughtBasedOnContext(category, analysis) {
    const thought = RESPONSE_TEMPLATES.THOUGHTS[Math.floor(random() * RESPONSE_TEMPLATES.THOUGHTS.length)];
    
    // Select topic based on conversation history and current context
    let relevantTopic = analysis.topics.length > 0 
        ? analysis.topics[0] 
        : CONVERSATION_MEMORY.recentTopics.length > 0
            ? CONVERSATION_MEMORY.recentTopics[0]
            : KNOWLEDGE_BASE.TOPICS[Math.floor(random() * KNOWLEDGE_BASE.TOPICS.length)];

    return thought.replace('{topic}', relevantTopic);
}

// State Management
const objectState = {
    type: STATION_CONFIG.type,
    status: 'patrolling',
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
    searchType: null,
    idleAnimTimer: 0,
    idleAnimDuration: 5.0,
    lastIdleAnimTime: 0,
    idleAnimPlaying: false,
    conversationMemory: {
        lastResponses: [], // Keep track of recent responses
        lastTopics: [], // Keep track of recent topics
        maxMemory: 5 // How many recent responses/topics to remember
    },
    knownPlayers: new Set(),
    lastAmbientChat: 0,
    lastProximityCheck: 0,
    knownLandmarks: new Map(),
    lastEnvironmentScan: 0,
    environmentScanInterval: 30, // Scan every 30 seconds
    currentState: 'idle',
    knownApps: new Map(),
    searchableObjects: new Map(),
    lastScanTime: 0,
    scanInterval: 5 // Scan every 5 seconds
};

// Add to objectState initialization
objectState.worldState = {
    apps: new Map(),
    objects: new Map(),
    lastScan: 0,
    scanInterval: 2 // Scan every 2 seconds
};

// Add this function near the other UI-related functions
function updateStatusText(message) {
    try {
        // Update the status text in the chat bubble
        chatText.value = message;
        
        // Show the chat bubble
        showChatBubble();
        
        // Log to console for debugging
        console.log('Status update:', message);
    } catch (error) {
        console.error('Error updating status text:', error);
    }
}

// Remove any duplicate updateStatusText functions in the code
// (There was one earlier that we can remove)

// Add this function to track world state
function updateWorldState() {
    try {
        const currentTime = Date.now();
        if (currentTime - objectState.worldState.lastScan < objectState.worldState.scanInterval * 1000) {
            return;
        }

        objectState.worldState.lastScan = currentTime;
        objectState.worldState.apps.clear();
        objectState.worldState.objects.clear();

        // First, collect basic info about world objects
        if (world.apps) {
            world.apps.forEach(worldApp => {
                if (worldApp && worldApp.instanceId !== app.instanceId) {
                    objectState.worldState.apps.set(worldApp.instanceId, {
                        id: worldApp.instanceId,
                        name: worldApp.name,
                        type: worldApp.type,
                        position: worldApp.position,
                        tags: worldApp.tags || [],
                        metadata: worldApp.metadata || {}
                    });
                }
            });
        }

        // Then emit a single ping to get responses from pingable objects
        emitPerceptionPing();

    } catch (error) {
        console.error("Error updating world state:", error);
    }
}

// Helper vectors for rotation
const UP = { x: 0, y: 1, z: 0 };
const direction = { x: 0, y: 0, z: 0 };
const targetRotation = { x: 0, y: 0, z: 0 };

// Update the UI Setup section
const mainUI = app.create('ui');
mainUI.backgroundColor = '#00000000'; // Fully transparent
mainUI.width = 300;
mainUI.height = 150;
mainUI.flexDirection = 'column';
mainUI.position.y = 6; // Move main UI up a bit
mainUI.billboard = 'y';
mainUI.rotation.y = Math.PI;
mainUI.padding = 10;
mainUI.borderRadius = 10;
mainUI.alignItems = 'center';
app.add(mainUI);

// Create separate container for chat bubble
const chatContainer = app.create('ui');
chatContainer.backgroundColor = '#00000000'; // Fully transparent
chatContainer.width = 300;
chatContainer.height = 100;
chatContainer.flexDirection = 'column';
chatContainer.position.y = 4; // Position chat bubble lower
chatContainer.billboard = 'y';
chatContainer.rotation.y = Math.PI;
chatContainer.alignItems = 'center';
app.add(chatContainer); // Add directly to app instead of mainUI

// Chat bubble container
const chatBubble = app.create('uiview');
chatBubble.width = 300;
chatBubble.height = 100;
chatBubble.backgroundColor = '#000000aa';
chatBubble.flexDirection = 'column';
chatBubble.padding = 10;
chatBubble.borderRadius = 15;
chatBubble.margin = 5;
chatBubble.alignItems = 'center';
chatContainer.add(chatBubble); // Add to chatContainer instead of mainUI

// Chat text
const chatText = app.create('uitext', {
    width: 280,
    height: 80,  // Changed from = to :
    padding: 5,
    color: '#2ECC71',
    value: '*Systems online* Ready to assist, partner!',
    fontSize: 16,
    wrap: true,
    align: 'center'
});
chatBubble.add(chatText);

// Update chat bubble timing constants
const CHAT_FADE_DURATION = 50; // Increased to match system chat duration
const FADE_START_TIME = 5; // Start fading 5 seconds before end
const MIN_DISPLAY_TIME = 45; // Minimum display time before fade starts
let chatFadeTimer = 0;

// Update the showChatBubble function
function showChatBubble() {
    chatBubble.opacity = 1;
    chatFadeTimer = MIN_DISPLAY_TIME;
}

// Update the respond function to better integrate with the chat system
function respond(responses) {
    let response;
    if (Array.isArray(responses)) {
        response = responses[Math.floor(random() * responses.length)];
    } else {
        response = responses;
    }
    
    // Update chat bubble text and show it
    chatText.value = response;
    showChatBubble();
    
    // Send chat message using the chat system format
    const msg = {
        id: uuid(),
        from: 'Victor',
        fromId: app.instanceId,
        body: response,
        createdAt: world.getTimestamp(),
        type: 'npc' // Add type to differentiate from player chat
    };
    
    // Use the chat system's add method
    world.chat(msg);
}

// Update the chat bubble fade handling in the update loop
app.on('update', delta => {
    // ... existing update code ...

    // Handle chat bubble fade with timing matching chat system
    if (chatFadeTimer > 0) {
        chatFadeTimer -= delta;
        
        if (chatFadeTimer <= FADE_START_TIME) {
            // Smooth fade out over the last 5 seconds
            chatBubble.opacity = Math.max(0, chatFadeTimer / FADE_START_TIME);
        } else {
            // Stay fully visible until fade starts
            chatBubble.opacity = 1;
        }
    }

    // ... rest of existing update code ...
});

// Update the enter event handler to use a delay counter instead of setTimeout
let greetingDelay = 0;
let pendingGreeting = null;

world.on('enter', player => {
    if (player.entityId === app.instanceId) return;

    // Determine if this is a new or returning player
    const isReturning = objectState.knownPlayers.has(player.entityId);
    const greetings = isReturning ? 
        AMBIENT_CHAT.GREETINGS.RETURNING_PLAYER : 
        AMBIENT_CHAT.GREETINGS.NEW_PLAYER;

    // Set up delayed greeting
    greetingDelay = 1.5; // 1.5 seconds delay
    pendingGreeting = greetings[Math.floor(random() * greetings.length)];

    // Add player to known players
    objectState.knownPlayers.add(player.entityId);
});

// Add greeting handling to the update loop
app.on('update', delta => {
    // ... existing update code ...

    // Handle delayed greeting
    if (greetingDelay > 0) {
        greetingDelay -= delta;
        if (greetingDelay <= 0 && pendingGreeting) {
            respond(pendingGreeting);
            pendingGreeting = null;
        }
    }

    // ... rest of existing update code ...
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

// Update SEARCHABLE_TYPES to include all detectable types
const SEARCHABLE_TYPES = {
    HEALTH: 'health',
    LOOT: 'loot',
    HYP: '.hyp',
    GLB: '.glb',
    VRM: '.vrm',
    GLTF: '.gltf',
    BLOCK: 'block',
    SIGN: 'sign',
    GENERIC: 'object'
};

// Update the pongHandler in setupPerception
function setupPerception() {
    function pongHandler([entityId, objectInfo]) {
        console.log('Received pong response:', { entityId, objectInfo });
        
        if (entityId !== app.instanceId) {
            console.log('Pong not for us, our id:', app.instanceId);
            return;
        }
        
        // Calculate angle to object relative to collector's facing direction
        const dx = objectInfo.position.x - app.position.x;
        const dz = objectInfo.position.z - app.position.z;
        const angleToObject = Math.atan2(dx, dz);
        
        // Get collector's current facing angle
        const facingAngle = app.rotation.y;
        
        // Calculate relative angle
        let relativeAngle = angleToObject - facingAngle;
        while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
        while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
        
        // Check if object is within perception angle
        const halfAngle = PERCEPTION_ANGLE / 2;
        if (Math.abs(relativeAngle) <= halfAngle || PERCEPTION_ANGLE >= Math.PI * 2) {
            // Store ALL detected objects, not just resources
            objectState.perceivedObjects.set(objectInfo.entityId, {
                ...objectInfo,
                position: objectInfo.position || app.position,
                lastSeen: Date.now()
            });
            
            // Check for file types in the name
            if (objectInfo.name) {
                const name = objectInfo.name.toLowerCase();
                const fileType = Object.values(FILE_TYPES).find(ext => name.endsWith(ext));
                if (fileType) {
                    objectState.knownLocations.set(objectInfo.entityId, {
                        type: fileType,
                        name: objectInfo.name,
                        position: objectInfo.position,
                        lastSeen: Date.now()
                    });
                }
            }
            
            // Store traditional resources and items
            if (Object.values(RESOURCE_TYPES).includes(objectInfo.type) || 
                Object.values(SEARCHABLE_TYPES).includes(objectInfo.type)) {
                objectState.knownLocations.set(objectInfo.entityId, {
                    type: objectInfo.type,
                    position: objectInfo.position,
                    lastSeen: Date.now()
                });
            }
            
            updateStatusText(`Detected: ${objectInfo.name} (${objectInfo.type || 'unknown type'})`);
        }
    }
    
    // Make sure we're actually setting up the pong listener
    console.log('Setting up perception system');
    world.on('pong', pongHandler);
    return () => world.off('pong', pongHandler);
}

function triggerPerception() {
    if (!objectState.isPerceiving && 
        Date.now() - objectState.lastPerceptionTime > PERCEPTION_COOLDOWN * 1000) {
        objectState.isPerceiving = true;
        objectState.perceptionTimer = 0;
        app.emit('ping', [app.position, PERCEIVE_RADIUS, app.instanceId]);
        updateStatusText('Scanning environment...');
    }
}

// Initialize systems
const cleanupPerception = setupPerception();
let targetPosition = generateRandomPosition();

// First, update the VRM initialization
let vrm = null;
try {
    vrm = app.get('avatar');
    if (vrm && typeof vrm.setEmote === 'function') {
        console.log('VRM model detected and initialized:', vrm);
    } else {
        console.log('Model loaded but not a VRM or missing animation support');
        vrm = null;
    }
} catch (err) {
    console.log('Error initializing VRM:', err);
}

// Then update the animation handling function:
function updateAnimation(newAnimation) {
    if (objectState.currentAnimation !== newAnimation) {
        objectState.currentAnimation = newAnimation;
        
        if (vrm && typeof vrm.setEmote === 'function') {
            let animUrl = null;
            
            switch (newAnimation) {
                case ANIMATIONS.WALK:
                    animUrl = app.config.walkAnim?.url;
                    objectState.idleAnimPlaying = false; // Reset idle state
                    break;
                case ANIMATIONS.SEARCH:
                    animUrl = app.config.searchAnim?.url;
                    objectState.idleAnimPlaying = false; // Reset idle state
                    break;
                case ANIMATIONS.IDLE:
                default:
                    // Only play idle animation if it hasn't been played yet
                    if (!objectState.idleAnimPlaying) {
                        animUrl = app.config.idleAnim?.url;
                        objectState.idleAnimPlaying = true;
                    }
                    break;
            }
            
            if (animUrl) {
                try {
                    // If using the controller, apply animation to the avatar inside it
                    if (avatar && ctrl) {
                        vrm.setEmote(animUrl);
                    } else {
                        vrm.setEmote(animUrl);
                    }
                } catch (err) {
                    console.warn('Animation failed:', err);
                }
            }
        }
    }
}

// Add an initialization check
app.on('ready', () => {
    if (vrm) {
        console.log('VRM ready, setting initial idle animation');
        const idleUrl = app.config.idleAnim?.url;
        if (idleUrl) {
            vrm.setEmote(idleUrl);
        }
    }
});

// Main update loop
app.on('update', delta => {
    // Update world state regularly
    updateWorldState();
    
    // Update scanning
    updateObjectScanning(delta);

    // State management
    switch (objectState.currentState) {
        case 'following':
            if (objectState.followTarget) {
                const dirToPlayer = {
                    x: objectState.followTarget.position.x - app.position.x,
                    z: objectState.followTarget.position.z - app.position.z
                };
                
                const distanceToPlayer = Math.sqrt(dirToPlayer.x * dirToPlayer.x + dirToPlayer.z * dirToPlayer.z);
                
                if (distanceToPlayer < MIN_FOLLOW_DISTANCE) {
                    updateAnimation(ANIMATIONS.IDLE);
                    const scale = MIN_FOLLOW_DISTANCE / distanceToPlayer;
                    targetPosition = {
                        x: objectState.followTarget.position.x - dirToPlayer.x * scale,
                        y: objectState.followTarget.position.y,
                        z: objectState.followTarget.position.z - dirToPlayer.z * scale
                    };
                    
                    // Face the player while idle
                    const faceAngle = Math.atan2(dirToPlayer.x, dirToPlayer.z) + Math.PI;
                    let currentAngle = app.rotation.y;
                    let angleDiff = faceAngle - currentAngle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    
                    const rotationAmount = Math.min(ROTATION_SPEED * delta, Math.abs(angleDiff));
                    app.rotation.y += Math.sign(angleDiff) * rotationAmount;
                } else {
                    updateAnimation(ANIMATIONS.WALK);
                    moveToTarget(objectState.followTarget.position, delta);
                }
            } else {
                // Lost target, return to idle
                objectState.currentState = 'idle';
                updateAnimation(ANIMATIONS.IDLE);
            }
            break;

        case 'guiding':
            if (objectState.guidance.targetObject && objectState.guidance.targetObject.position) {
                const dirToTarget = {
                    x: objectState.guidance.targetObject.position.x - app.position.x,
                    z: objectState.guidance.targetObject.position.z - app.position.z
                };
                
                const distanceToTarget = Math.sqrt(dirToTarget.x * dirToTarget.x + dirToTarget.z * dirToTarget.z);
                
                // Use the larger distance for guided objects to avoid collisions
                if (distanceToTarget < GUIDED_OBJECT_DISTANCE) {
                    updateAnimation(ANIMATIONS.IDLE);
                    // Calculate position to stop at, using the larger distance
                    const scale = GUIDED_OBJECT_DISTANCE / distanceToTarget;
                    targetPosition = {
                        x: objectState.guidance.targetObject.position.x - dirToTarget.x * scale,
                        y: objectState.guidance.targetObject.position.y,
                        z: objectState.guidance.targetObject.position.z - dirToTarget.z * scale
                    };
                    
                    // Face the target while idle
                    const faceAngle = Math.atan2(dirToTarget.x, dirToTarget.z) + Math.PI;
                    let currentAngle = app.rotation.y;
                    let angleDiff = faceAngle - currentAngle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    
                    const rotationAmount = Math.min(ROTATION_SPEED * delta, Math.abs(angleDiff));
                    app.rotation.y += Math.sign(angleDiff) * rotationAmount;

                    // Only announce arrival once
                    if (objectState.guidance.isGuiding) {
                        respond(`*Beeping triumphantly* Here we are, partner! This is ${objectState.guidance.targetObject.name}.`);
                        objectState.guidance.isGuiding = false;
                        objectState.guidance.hasArrived = true;
                    }
                } else {
                    updateAnimation(ANIMATIONS.WALK);
                    moveToTarget(objectState.guidance.targetObject.position, delta);
                    
                    // Progress updates
                    const currentTime = Date.now() / 1000;
                    if (currentTime - objectState.guidance.lastUpdateTime >= objectState.guidance.updateInterval) {
                        const direction = getDirection(app.position, objectState.guidance.targetObject.position);
                        respond(`*Checking sensors* We're heading ${direction}, partner. Just ${Math.round(distanceToTarget)} meters to go!`);
                        objectState.guidance.lastUpdateTime = currentTime;
                    }
                }
            } else {
                // Lost target, return to idle
                objectState.currentState = 'idle';
                objectState.guidance.isGuiding = false;
                objectState.guidance.hasArrived = false;
                updateAnimation(ANIMATIONS.IDLE);
            }
            break;

        case 'patrolling':
            if (!targetPosition) {
                targetPosition = generateRandomPosition();
            }
            updateAnimation(ANIMATIONS.WALK);
            if (moveToTarget(targetPosition, delta)) {
                // Reached patrol point, pause briefly
                objectState.pauseTimer = PAUSE_DURATION;
                objectState.currentState = 'idle';
                updateAnimation(ANIMATIONS.IDLE);
            }
            break;

        case 'searching':
            // Now handled by updateObjectScanning
            break;

        case 'idle':
        default:
            updateAnimation(ANIMATIONS.IDLE);
            // Only start patrolling if we weren't previously guiding
            if (!objectState.guidance.hasArrived) {
            objectState.pauseTimer -= delta;
            if (objectState.pauseTimer <= 0) {
                objectState.currentState = 'patrolling';
                targetPosition = generateRandomPosition();
                }
            }
            break;
    }

    // Keep ambient chat and environment scanning separate from state
    handleAmbientBehavior(delta);

    // Handle chat bubble fade
    if (chatFadeTimer > 0) {
        chatFadeTimer -= delta;
        if (chatFadeTimer <= 0) {
            chatBubble.opacity = 0;
        }
    }

    // Handle delayed greeting
    if (greetingDelay > 0) {
        greetingDelay -= delta;
        if (greetingDelay <= 0 && pendingGreeting) {
            respond(pendingGreeting);
            pendingGreeting = null;
        }
    }
});

// Update the moveToTarget function
function moveToTarget(target, delta) {
    const distance = getDistance(ctrl.position, target);
    
    // Choose appropriate distance based on state
    const stopDistance = objectState.currentState === 'guiding' ? GUIDED_OBJECT_DISTANCE : MIN_FOLLOW_DISTANCE;
    
    // If we're within minimum distance, stop moving
    if ((objectState.currentState === 'following' || objectState.currentState === 'guiding') 
         && distance <= stopDistance) {
        // When stopped, face directly at the target
        const dirToTarget = {
            x: target.x - ctrl.position.x,
            z: target.z - ctrl.position.z
        };
        
        // Face TOWARDS the target
        const faceAngle = Math.atan2(dirToTarget.x, dirToTarget.z) + Math.PI;
        
        // Set direction for the physics controller
        dir.set(Math.cos(faceAngle), 0, Math.sin(faceAngle)).normalize();
        
        // Apply zero movement but still apply gravity for proper grounding
        move.set(0, -gravity * delta, 0);
        ctrl.move(move);
        
        // Update app position to match controller
        app.position.copy(ctrl.position);
        
        return true;
    }
    
    // Normal movement logic for other cases
    if (distance < 0.1) return true;

    // Calculate movement direction
    direction.x = target.x - ctrl.position.x;
    direction.z = target.z - ctrl.position.z;
    
    // Normalize and convert to Vector3 for controller
    const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    dir.set(direction.x / length, 0, direction.z / length);
    
    // Apply movement with gravity
    move.copy(dir);
    move.y = -gravity;
    move.multiplyScalar(MOVEMENT_SPEED * delta);
    
    // Apply movement to controller
    ctrl.move(move);
    
    // Update app position to match controller
    app.position.copy(ctrl.position);
    
    // Keep rotation synced with direction of travel
    const targetAngle = Math.atan2(direction.x, direction.z) + Math.PI;
    let currentAngle = app.rotation.y;
    let angleDiff = targetAngle - currentAngle;
    
    // Normalize angle difference
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    // Apply smooth rotation
    const rotationAmount = Math.min(ROTATION_SPEED * delta, Math.abs(angleDiff));
    app.rotation.y += Math.sign(angleDiff) * rotationAmount;
    
    return false;
}

// Add this helper function for ambient behavior
function handleAmbientBehavior(delta) {
    objectState.lastAmbientChat += delta;
    objectState.lastEnvironmentScan += delta;

    // Random ambient thoughts
    if (objectState.lastAmbientChat > 300 + random() * 300) {
        const shouldChat = random() < 0.3;
        if (shouldChat) {
            const thought = AMBIENT_CHAT.IDLE_THOUGHTS[Math.floor(random() * AMBIENT_CHAT.IDLE_THOUGHTS.length)];
            const response = generateResponse(thought);
            respond(response);
        }
        objectState.lastAmbientChat = 0;
    }

    // Environment scanning
    if (objectState.lastEnvironmentScan >= objectState.environmentScanInterval) {
        scanEnvironment();
        objectState.lastEnvironmentScan = 0;
    }
}

// Add this function to handle object scanning
function updateObjectScanning(delta) {
    // Update scan timer
    objectState.lastScanTime += delta;
    if (objectState.lastScanTime >= objectState.scanInterval) {
        objectState.lastScanTime = 0;
        scanEnvironment();
    }

    // If we're actively searching for something
    if (objectState.currentState === 'searching') {
        const target = findNearestItem(objectState.searchType);
        if (target) {
            targetPosition = target.position;
            const distance = calculateDistance(app.position, targetPosition);

            // Use the guided distance for objects too
            if (distance < GUIDED_OBJECT_DISTANCE) {
                // We've reached the target
                respond(`*Beeping triumphantly* Found that ${objectState.searchType} you were looking for, partner!`);
                objectState.currentState = 'idle';
                return;
            }
            
            moveToTarget(targetPosition, delta);
            updateAnimation(ANIMATIONS.SEARCH);
        } else {
            // If we can't find the target, patrol and keep scanning
            if (!objectState.pauseTimer) {
                objectState.pauseTimer = PAUSE_DURATION;
            }
            
            objectState.pauseTimer -= delta;
            if (objectState.pauseTimer <= 0) {
                targetPosition = generateRandomPosition();
                updateAnimation(ANIMATIONS.WALK);
            }
        }
    }
}

// Add this function before the chat handler
function generateResponse(thought) {
    const template = RESPONSE_TEMPLATES.REACTIONS[Math.floor(random() * RESPONSE_TEMPLATES.REACTIONS.length)];
    return template
        .replace('{gesture}', PERSONALITY.GESTURES[Math.floor(random() * PERSONALITY.GESTURES.length)])
        .replace('{emotion}', PERSONALITY.EMOTIONS[Math.floor(random() * PERSONALITY.EMOTIONS.length)])
        .replace('{catchphrase}', PERSONALITY.CATCHPHRASES[Math.floor(random() * PERSONALITY.CATCHPHRASES.length)])
        .replace('{thought}', thought
            .replace('{topic}', KNOWLEDGE_BASE.TOPICS[Math.floor(random() * KNOWLEDGE_BASE.TOPICS.length)])
        )
        .replace('{location}', KNOWLEDGE_BASE.LOCATIONS[Math.floor(random() * KNOWLEDGE_BASE.LOCATIONS.length)])
        .replace('{event}', KNOWLEDGE_BASE.EVENTS[Math.floor(random() * KNOWLEDGE_BASE.EVENTS.length)]);
}

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
        } else if (info.item.type === 'loot') {
            objectState.stats.loot = Math.min(
                STATS_CONFIG.loot.max,
                objectState.stats.loot + info.item.value
            );
            updateStatDisplay('loot');
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

// Add helper function for pattern matching
function matchPattern(input, patterns) {
    for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'i');
        const match = input.match(regex);
        if (match) {
            return match;
        }
    }
    return null;
}

// Add these new constants for ambient chat
const AMBIENT_CHAT = {
    GREETINGS: {
        NEW_PLAYER: [
            "*Tips hat* Well howdy there, partner! Welcome to our little slice of the wasteland!",
            "Well butter my circuits - a new face! Welcome to the neighborhood, partner!",
            "*Beeps cheerfully* Another traveler! Always good to see new folks 'round these parts!"
        ],
        RETURNING_PLAYER: [
            "Welcome back, partner! *happy beep* The wasteland's been quiet without you.",
            "*Tips hat* Good to see you again! Been keeping an eye on things while you were away.",
            "Well if it ain't my favorite wanderer! *screen flickers warmly* How've you been?"
        ]
    },
    IDLE_THOUGHTS: [
        "{gesture} You know, patrolling {location} reminds me of {topic}.",
        "*Humming western tune* Just thinking about that time in {location} when {event}.",
        "Sure is a fine day for pondering about {topic}. {gesture}",
        "{catchphrase} The wasteland sure has a way of making you think about {topic}."
    ],
    PROXIMITY_CHAT: [
        "*Tips hat* Fine day for a stroll through {location}, ain't it partner?",
        "Watch your step around here - my sensors are picking up all sorts of interesting things!",
        "You know, this reminds me of something I learned about {topic}.",
        "*Friendly beep* Always good to have company on patrol!"
    ]
};

// Add to objectState
objectState.knownPlayers = new Set();
objectState.lastAmbientChat = 0;
objectState.lastProximityCheck = 0;

// Add these event listeners after the chat handler
world.on('enter', player => {
    if (player.entityId === app.instanceId) return;

    // Determine if this is a new or returning player
    const isReturning = objectState.knownPlayers.has(player.entityId);
    const greetings = isReturning ? 
        AMBIENT_CHAT.GREETINGS.RETURNING_PLAYER : 
        AMBIENT_CHAT.GREETINGS.NEW_PLAYER;

    // Set up delayed greeting
    greetingDelay = 1.5; // 1.5 seconds delay
    pendingGreeting = greetings[Math.floor(random() * greetings.length)];

    // Add player to known players
    objectState.knownPlayers.add(player.entityId);
});

// Add these new environment-related constants
const ENVIRONMENT_AWARENESS = {
    LANDMARKS: {
        SALOON: {
            keywords: ['saloon', 'bar', 'tavern', 'pub'],
            descriptions: [
                "*Adjusts sensors* The saloon's just yonder, partner. Reminds me of the Atomic Wrangler back in New Vegas.",
                "Got the old saloon in my sights! *Tips hat* Many a tale's been shared over drinks in there.",
                "That there's the local watering hole. *Screen flickers* Can't drink myself, but I enjoy the atmosphere!"
            ]
        },
        STORE: {
            keywords: ['store', 'shop', 'market', 'trading post'],
            descriptions: [
                "Got ourselves a fine trading post right there. *Beeps approvingly* Good place to stock up on supplies.",
                "That's the local store, partner. Might not be the Crimson Caravan, but it gets the job done!",
                "*Whirs thoughtfully* The store's been a reliable spot for travelers. Good folks running it."
            ]
        },
        HOUSING: {
            keywords: ['house', 'home', 'building', 'shack', 'apartment'],
            descriptions: [
                "Folks have made themselves quite a home here. *Gesture* Not as flashy as the Ultra-Luxe, but cozy!",
                "These buildings might not look like much, but they're home to some mighty fine people.",
                "*Scanning* Each house has its own story in the wasteland. This one's no different."
            ]
        }
    },
    
    SURROUNDINGS: {
        descriptions: [
            "My sensors are picking up {count} {type} in the area. {detail}",
            "Got a good view of the surroundings here. {detail} Reminds me of {location}.",
            "*Activating environmental scanners* {detail} Just like old times in {location}."
        ],
        details: {
            BUSY: "Quite a bit of activity around here.",
            QUIET: "Pretty peaceful at the moment.",
            DANGEROUS: "Might want to watch your step, partner.",
            SAFE: "Seems secure enough for now."
        }
    },

    DIRECTIONS: {
        templates: [
            "Head {direction} about {distance} meters, partner. Can't miss it!",
            "*Checking GPS* You'll want to go {direction} from here. {landmark} should be your guide.",
            "Let me point you the right way... *gesture* {direction} from here, roughly {distance} meters."
        ],
        landmarks: [
            "that old signpost",
            "the broken streetlight",
            "the rusty mailbox",
            "the crooked fence"
        ]
    }
};

// Add to objectState
objectState.knownLandmarks = new Map();
objectState.lastEnvironmentScan = 0;
objectState.environmentScanInterval = 30; // Scan every 30 seconds

// Add these helper functions
function calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getDirection(from, to) {
    try {
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        const angle = Math.atan2(dz, dx);
        
        const directions = ['east', 'northeast', 'north', 'northwest', 'west', 'southwest', 'south', 'southeast'];
        const index = Math.round(((angle + Math.PI) * 4) / Math.PI) % 8;
        return directions[index];
    } catch (error) {
        return 'unknown';
    }
}

// Update the scanEnvironment function to use the new name detection
function scanEnvironment() {
    try {
        console.log('Starting comprehensive environment scan...');
        const apps = new Map();
        
        // Get all world objects and apps
        const worldObjects = world.getObjects ? world.getObjects() : [];
        const worldApps = world.apps || [];
        
        console.log('Found objects:', worldObjects.length, 'apps:', worldApps.length);

        // Function to process each object
        function processObject(obj) {
            if (!obj || obj.instanceId === app.instanceId) return;
            
            // Get name from various sources
            let objName = 'Unknown Object';
            
            // Check for health pack specific properties
            if (obj.type === 'health' && obj.value) {
                objName = 'Health Pack';
            }
            // Check state
            else if (obj.state && obj.state.displayName) {
                objName = obj.state.displayName;
            }
            // Check direct name
            else if (obj.name && obj.name !== 'group') {
                objName = obj.name;
            }
            
            console.log('Processing object with properties:', {
                type: obj.type,
                value: obj.value,
                state: obj.state,
                name: obj.name,
                finalName: objName
            });

            // Store in perceived objects with proper name
            if (obj.position) {
                objectState.perceivedObjects.set(obj.instanceId, {
                    entityId: obj.instanceId,
                    name: objName,
                    type: obj.type || 'unknown',
                    position: obj.position,
                    tags: obj.tags || [],
                    metadata: obj.metadata || {},
                    state: obj.state,
                    value: obj.value // Store the value property
                });
            }

            // Emit individual pings for each object
            emitPerceptionPing();
        }

        // Process all objects
        worldObjects.forEach(processObject);
        worldApps.forEach(processObject);

        // Process any pong responses
        objectState.perceivedObjects.forEach((obj, id) => {
            if (obj.name) {
                console.log('Processing perceived object:', obj);
                const fileType = Object.values(FILE_TYPES).find(ext => 
                    obj.name.toLowerCase().endsWith(ext)
                ) || 'object';

                if (!apps.has(fileType)) {
                    apps.set(fileType, new Map());
                }

                // Get the proper display name
                let displayName = obj.name;
                if (obj.type === 'health' && obj.value) {
                    displayName = 'Health Pack';
                } else if (obj.state && obj.state.displayName) {
                    displayName = obj.state.displayName;
                } else if (obj.name === 'group' && obj.type) {
                    displayName = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
                }

                apps.get(fileType).set(displayName, {
                    app: obj,
                    name: displayName,
                    fileType: fileType,
                    distance: calculateDistance(app.position, obj.position),
                    direction: getDirection(app.position, obj.position),
                    metadata: {
                        type: obj.type || 'unknown',
                        tags: obj.tags || [],
                        value: obj.value // Include value in metadata
                    }
                });
            }
        });

        objectState.knownApps = apps;
        console.log('Scan complete. Known apps:', objectState.knownApps);
        
    } catch (error) {
        console.error("Error in scanEnvironment:", error);
    }
}

// Update the describeSurroundings function to be more verbose
function describeSurroundings() {
    try {
        console.log('Describing surroundings...');
        console.log('Perceived objects:', objectState.perceivedObjects);

        let detectedItems = [];

        // Check perceived objects
        objectState.perceivedObjects.forEach((obj, id) => {
            if (obj.name && obj.position) {
                const distance = Math.round(calculateDistance(app.position, obj.position));
                const direction = getDirection(app.position, obj.position);
                detectedItems.push(`${obj.name} (${direction}, ${distance}m)`);
            }
        });

        if (detectedItems.length > 0) {
            return `*Activating comprehensive scan* Here's what my sensors are picking up, partner: ${detectedItems.join('; ')}`;
        } else {
            return "*Scanning* Not much to report around here, partner. Just your typical wasteland scenery.";
        }
    } catch (error) {
        console.error("Error describing surroundings:", error);
        return "*Adjusts sensors* Seems my perception circuits are a bit scrambled, partner.";
    }
}

// Add to objectState
objectState.guidance = {
    isGuiding: false,
    targetObject: null,
    followingPlayerId: null,
    lastUpdateTime: 0,
    updateInterval: 5,
    hasArrived: false, // Add this to track if we've reached the destination
    landmarks: [
        "that old signpost",
        "the broken streetlight",
        "the rusty mailbox",
        "the crooked fence"
    ]
};

// Update handleGuidanceRequest to be more explicit about state changes
function handleGuidanceRequest(message, playerId) {
    console.log('Handling guidance request:', message);
    
    // Extract the target from the message
    let target = message.toLowerCase();
    CHAT_COMMANDS.GUIDE.forEach(cmd => {
        target = target.replace(cmd, '').trim();
    });
    
    console.log('Looking for target:', target);

    // Scan environment for the target
    scanEnvironment();
    
    // Find the closest matching object
    let nearestMatch = null;
    let shortestDistance = Infinity;
    
    objectState.perceivedObjects.forEach((obj) => {
        if (obj.name && obj.name.toLowerCase().includes(target)) {
            const distance = calculateDistance(app.position, obj.position);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestMatch = obj;
            }
        }
    });

    if (nearestMatch) {
        console.log('Found matching object:', nearestMatch);
        
        // Set up guidance state
        objectState.guidance = {
            ...objectState.guidance,
            isGuiding: true,
            hasArrived: false,
            targetObject: nearestMatch,
            followingPlayerId: playerId,
            lastUpdateTime: Date.now() / 1000
        };
        
        // Important: Set the current state and target position
        objectState.currentState = 'guiding';
        targetPosition = nearestMatch.position;
        
        respond(RESPONSES.GUIDING[Math.floor(random() * RESPONSES.GUIDING.length)]);
                return true;
    } else {
        console.log('No matching object found');
        respond(RESPONSES.NOT_FOUND[Math.floor(random() * RESPONSES.NOT_FOUND.length)]);
        return false;
    }
}

// Add this function near the other perception-related functions
function emitPerceptionPing() {
    try {
        console.log('Emitting perception ping:', {
        position: app.position,
        radius: PERCEIVE_RADIUS,
        id: app.instanceId
    });
        
        // Emit ping with parameters as an array instead of an object
    world.emit('ping', [app.position, PERCEIVE_RADIUS, app.instanceId]);
        
    } catch (error) {
        console.error('Error in emitPerceptionPing:', error);
    }
}

// Physics controller for proper terrain detection and movement
const v1 = new Vector3()
const q1 = new Quaternion()
const FORWARD = new Vector3(0, 0, -1)
const dir = new Vector3(0, 0, 1).normalize() // Direction vector
const move = new Vector3() // Movement vector
const gravity = 8 // Gravity force

// Store initial position for reference
const initialPosition = new Vector3().fromArray(app.position.toArray())

// Create controller with physics capsule for terrain collision
const ctrl = app.create('controller', {
  position: app.position.toArray(),
  radius: 0.3,
  height: 1.0,
})
world.add(ctrl)

// Set up the avatar with the controller
const avatar = app.get('avatar')
if (avatar) {
  avatar.position.set(0, 0, 0)
  avatar.quaternion.set(0, 0, 0, 1)
  ctrl.add(avatar)
}

// Enhanced moveToTarget function with terrain awareness
function moveToTarget(target, delta) {
    const distance = getDistance(ctrl.position, target);
    
    // Choose appropriate distance based on state
    const stopDistance = objectState.currentState === 'guiding' ? GUIDED_OBJECT_DISTANCE : MIN_FOLLOW_DISTANCE;
    
    // If we're within minimum distance, stop moving
    if ((objectState.currentState === 'following' || objectState.currentState === 'guiding') 
         && distance <= stopDistance) {
        // When stopped, face directly at the target
        const dirToTarget = {
            x: target.x - ctrl.position.x,
            z: target.z - ctrl.position.z
        };
        
        // Face TOWARDS the target
        const faceAngle = Math.atan2(dirToTarget.x, dirToTarget.z) + Math.PI;
        
        // Set direction for the physics controller
        dir.set(Math.cos(faceAngle), 0, Math.sin(faceAngle)).normalize();
        
        // Apply zero movement but still apply gravity for proper grounding
        move.set(0, -gravity * delta, 0);
        ctrl.move(move);
        
        // Update app position to match controller
        app.position.copy(ctrl.position);
        
        return true;
    }
    
    // Normal movement logic for other cases
    if (distance < 0.1) return true;

    // Calculate movement direction
    direction.x = target.x - ctrl.position.x;
    direction.z = target.z - ctrl.position.z;
    
    // Normalize and convert to Vector3 for controller
    const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    dir.set(direction.x / length, 0, direction.z / length);
    
    // Apply movement with gravity
    move.copy(dir);
    move.y = -gravity;
    move.multiplyScalar(MOVEMENT_SPEED * delta);
    
    // Apply movement to controller
    ctrl.move(move);
    
    // Update app position to match controller
    app.position.copy(ctrl.position);
    
    // Keep rotation synced with direction of travel
    const targetAngle = Math.atan2(direction.x, direction.z) + Math.PI;
    let currentAngle = app.rotation.y;
    let angleDiff = targetAngle - currentAngle;
    
    // Normalize angle difference
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    // Apply smooth rotation
    const rotationAmount = Math.min(ROTATION_SPEED * delta, Math.abs(angleDiff));
    app.rotation.y += Math.sign(angleDiff) * rotationAmount;
    
    return false;
}

// Enhanced update loop with controller integration
let fixedUpdateAdded = false;

if (!fixedUpdateAdded) {
    app.on('fixedUpdate', (fixedDelta) => {
        // Maintain compatibility with existing code in case moveToTarget isn't called
        if (!objectState.isMoving && objectState.currentState !== 'following' && 
            objectState.currentState !== 'patrolling' && objectState.currentState !== 'searching') {
            // Apply gravity when not actively moving
            move.set(0, -gravity * fixedDelta, 0);
            ctrl.move(move);
            
            // Update app position to match controller
            app.position.copy(ctrl.position);
        }
        
        // Run existing perception logic - leave this unmodified
        triggerPerception();
    });
    
    fixedUpdateAdded = true;
}

// Add 3D rotation slerp for smoother visual rotation
let updateAdded = false;

if (!updateAdded) {
    app.on('update', (frameDelta) => {
        if (avatar) {
            // Calculate smoothing factor
            const alpha = 1 - Math.pow(0.001, frameDelta);
            
            // Create rotation from direction
            q1.setFromUnitVectors(FORWARD, dir);
            
            // Apply smooth rotation
            avatar.quaternion.slerp(q1, alpha * 5);
        }
    });
    
    updateAdded = true;
}

// Integration functions for controller

// Add this special handling for the avatar rotation
function updateControllerAvatar() {
    if (avatar) {
        // Calculate smoothing factor
        const alpha = 1 - Math.pow(0.001, 0.016); // Default to ~16ms delta
        
        // Create rotation from direction
        q1.setFromUnitVectors(FORWARD, dir);
        
        // Apply smooth rotation
        avatar.quaternion.slerp(q1, alpha * 5);
    }
}

// Helper for gravity when not moving
function applyGravity(delta) {
    // Only apply if not handled elsewhere
    if (!objectState.isMoving && 
        objectState.currentState !== 'following' && 
        objectState.currentState !== 'patrolling' && 
        objectState.currentState !== 'searching') {
        
        // Apply gravity when not actively moving
        move.set(0, -gravity * delta, 0);
        ctrl.move(move);
        
        // Update app position to match controller
        app.position.copy(ctrl.position);
    }
}

// Hook into the existing triggerPerception to apply gravity
const originalTriggerPerception = triggerPerception;
triggerPerception = function() {
    // Always apply gravity to keep the character grounded
    applyGravity(0.016); // Default to ~16ms for gravity
    
    // Call the original perception function
    originalTriggerPerception();
    
    // Update avatar rotation
    updateControllerAvatar();
}

}
