# NPC_10.hyp

## Metadata
- **Author**: peezy
- **Channel**: #💻│developers
- **Date**: 2025-03-25
- **Size**: 7,737,574 bytes

## Blueprint
- **Name**: NPC
- **Version**: 31
- **Model**: `asset://468eaa14d7fdc09b16c775d88253c74c2caa82c4866fb29e23d36779556288c1.vrm`
- **Script**: `asset://ab6c97c63b780cc45c79b6f8de8b1aa0f7b5fa0db489c0fc94d484455751be06.js`

## Props
- `emote`: emote → `asset://43aa6ecfccf3a111926b31a1865bc5875d22c9c54c7d3ad501aeb829082e7a08.glb`
- `avatar`: avatar → `asset://268b12ee20dda8564f18e929924f60c164270e122884466908b1ce44d61d92e8.vrm`
- `walk`: emote → `asset://fb2ffd4513c0ef0fd3018b0454004908e4f6ca913309c0e76bc7f118fd217c83.glb`
- `idle`: emote → `asset://c56b4f79ae304b31ee0f81ebd66b8f5a906ff508d739bf9deeafe7b68484efbe.glb`
- `talk`: emote → `asset://07b3242f54f8d99b830605de5dfa0d7a1e8ba34ab3949c0cb2a9cf9f6a8ca4a3.glb`
- `run`: emote → `asset://3e5fc4f1109d342f59583561e21f843235801174052ec403fc32e47683941123.glb`
- `refDistance`: int = `5`
- `maxDistance`: int = `15`
- `rolloffFactor`: int = `5`
- `distanceModel`: str = `inverse`
- `fireAudio`: audio → `asset://9024142f4ec60c732c9bd0af95ea6ad6076d56d6206f86b838ad6f7f7b3ff5d4.mp3`
- `playbackRate`: int = `1`
- `pauseDuration`: int = `2`
- `raptorAudio`: audio → `asset://9024142f4ec60c732c9bd0af95ea6ad6076d56d6206f86b838ad6f7f7b3ff5d4.mp3`
- `detectionRange`: int = `15`
- `fovAngle`: int = `120`
- `chasePlayer`: bool = `True`
- `followDistance`: int = `3`
- `memoryDuration`: int = `5`

## Assets
- `[avatar]` 468eaa14d7fdc09b16c775d88253c74c2caa82c4866fb29e23d36779556288c1.vrm (4,817,240 bytes)
- `[script]` ab6c97c63b780cc45c79b6f8de8b1aa0f7b5fa0db489c0fc94d484455751be06.js (6,627 bytes)
- `[emote]` 43aa6ecfccf3a111926b31a1865bc5875d22c9c54c7d3ad501aeb829082e7a08.glb (58,476 bytes)
- `[avatar]` 268b12ee20dda8564f18e929924f60c164270e122884466908b1ce44d61d92e8.vrm (2,324,724 bytes)
- `[emote]` fb2ffd4513c0ef0fd3018b0454004908e4f6ca913309c0e76bc7f118fd217c83.glb (123,908 bytes)
- `[emote]` c56b4f79ae304b31ee0f81ebd66b8f5a906ff508d739bf9deeafe7b68484efbe.glb (88,600 bytes)
- `[emote]` 07b3242f54f8d99b830605de5dfa0d7a1e8ba34ab3949c0cb2a9cf9f6a8ca4a3.glb (169,528 bytes)
- `[emote]` 3e5fc4f1109d342f59583561e21f843235801174052ec403fc32e47683941123.glb (92,192 bytes)
- `[audio]` 9024142f4ec60c732c9bd0af95ea6ad6076d56d6206f86b838ad6f7f7b3ff5d4.mp3 (26,582 bytes)
- `[audio]` 9024142f4ec60c732c9bd0af95ea6ad6076d56d6206f86b838ad6f7f7b3ff5d4.mp3 (26,582 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.createLayerMask()`, `world.emit()`, `world.on()`
**Events Listened**: `button_attack`, `npc:requestBoneTransform`, `play_attack_animation`
**Events Emitted**: `npc:attack`, `registerHolder`
**Nodes Created**: `collider`, `rigidbody`

## Keywords (for Discord search)
actual, after, anim, animButton, animUrl, animation, animations, appId, applyQuaternion, array, attack, attackAnim, attackAnimations, attackName, attackTimer, attacking, attacks, avatar, based, body

## Script Source
```javascript
app.configure([
  {
    key: "walk",
    type: "file",
    kind: "emote",
    label: "Walk",
  },
  {
    key: "run",
    type: "file",
    kind: "emote",
    label: "Run",
  },
  {
    key: "idle",
    type: "file",
    kind: "emote",
    label: "Idle",
  },
  {
    key: "animButton",
    label: "attack",
    type: "button",
    onClick: () => {
      app.send("button_attack");
    },
  },
]);


console.log(`app: ${app.instanceId} INIT`);
const avatar = app.get("avatar");

const body = app.create('rigidbody', { type: 'kinematic', tag: 'mob:1' })
// const overlapLayerMask = world.createLayerMask('environment')
const collider = app.create('collider',
  {
    type: 'box', 
    size: [0.3, 1.6, 0.3], 
    trigger: true,
    layer: 'environment'
  })
body.onTriggerEnter = (foo) => {
  console.log(foo)
}
body.add(collider)
app.add(body)

// Constants for hit detection
const HIT_DISTANCE = 1.2; // Distance in front of NPC for hit detection
const HIT_HEIGHT_OFFSET = 1.0; // Height offset for hit detection (target player torso)

// Vector and math utilities for hit calculation
const forward = new Vector3(0, 0, -1);
const npcPosition = new Vector3();
const npcDirection = new Vector3();
const hitPosition = new Vector3();
const npcQuaternion = new Quaternion();
const hitPositionArray = [];

if (world.isServer) {
  // Store attack animations with their individual cooldowns
  const attackAnimations = [];
  let defaultCooldown = 2.5; // Default cooldown in seconds
  let canAttack = true; // Track if NPC can attack

  // Listen for attack animations from the sword
  world.on(`npc:${app.instanceId}:receiveAttackAnimations`, (data) => {
    console.log(`NPC ${app.instanceId} received attack animations:`, data);
    if (data.attacks && data.attacks.length > 0) {
      attackAnimations.length = 0; // Clear existing animations
      data.attacks.forEach((anim) => attackAnimations.push(anim));

      // Store default cooldown value if provided
      if (data.defaultCooldown) {
        defaultCooldown = data.defaultCooldown;
      }

      console.log(
        `Received ${attackAnimations.length} animations with cooldowns:`,
        attackAnimations
          .map((a) => `${a.name || "Attack"}: ${a.cooldown}s`)
          .join(", ")
      );
    }
  });

  // Calculate hit position based on NPC position and orientation
  function calculateHitPosition() {
    // Get NPC's current position and rotation
    npcPosition.copy(app.position);
    npcQuaternion.copy(app.quaternion);

    // Calculate forward direction based on NPC's orientation
    npcDirection.copy(forward).applyQuaternion(npcQuaternion);

    // Scale to hit distance
    npcDirection.multiplyScalar(HIT_DISTANCE);

    // Calculate hit position (NPC position + direction + height offset)
    hitPosition.copy(npcPosition).add(npcDirection);
    hitPosition.y += HIT_HEIGHT_OFFSET;

    // Convert to array for transmission
    return hitPosition.toArray(hitPositionArray);
  }

  // Handle attack button press
  app.on("button_attack", () => {
    if (attackAnimations.length > 0 && canAttack) {
      // Select a random attack animation
      const randomIndex = Math.floor(Math.random() * attackAnimations.length);
      const attackAnim = attackAnimations[randomIndex];

      // Get cooldown for this specific animation
      const cooldown = attackAnim.cooldown || defaultCooldown;

      // Start cooldown
      canAttack = false;
      setTimeout(() => {
        canAttack = true;
      }, cooldown * 1000);

      // Calculate hit position
      const hitPos = calculateHitPosition();

      // Send animation to clients
      app.send("play_attack_animation", {
        animUrl: attackAnim.url,
        cooldown: cooldown,
        name: attackAnim.name,
        index: randomIndex,
      });

      // Log attack
      console.log(
        `NPC ${app.instanceId} triggered ${attackAnim.name || "attack"
        } animation with ${cooldown}s cooldown`
      );

      // Initial hit detection - some attacks might need multiple hit detections
      world.emit('npc:attack', {
        npcId: app.instanceId,
        pos: hitPos,
        attackName: attackAnim.name || "attack"
      });

      // For longer attacks, we might want multiple hit detections during the animation
      // Timed to match the animation's actual swing moments
      if (cooldown > 2.0) {
        // Add a second hit detection point midway through animation
        setTimeout(() => {
          // Recalculate hit position (NPC might have moved)
          const midHitPos = calculateHitPosition();

          world.emit('npc:attack', {
            npcId: app.instanceId,
            pos: midHitPos,
            attackName: `${attackAnim.name || "attack"} (follow-through)`
          });
        }, 300); // Timing based on animation keyframes
      }
    } else if (!canAttack) {
      console.log(`NPC ${app.instanceId} can't attack yet - on cooldown`);
    } else {
      console.log(`NPC ${app.instanceId} has no attack animations`);
    }
  });

  // Register this NPC as a holder for weapons
  app.emit("registerHolder", app.instanceId);
}

if (world.isClient) {

  let isAttacking = false;
  let attackTimer = null;

  // Set the default idle animation
  if (props.idle?.url) {
    avatar.emote = props.idle.url;
  }

  // Handle bone transform requests from the sword
  world.on("npc:requestBoneTransform", (appId) => {
    if (appId !== app.instanceId) return;

    const matrix = avatar.getBoneTransform("rightIndexProximal");
    app.emit(`npc:${app.instanceId}:boneTransform`, matrix);
  });

  // Play attack animation when requested by server
  app.on("play_attack_animation", (data) => {
    if (data.animUrl && !isAttacking) {
      // Mark as attacking to prevent animation interruptions
      isAttacking = true;

      // Clear any existing timer
      if (attackTimer) {
        clearTimeout(attackTimer);
      }

      // Play the attack animation
      avatar.emote = data.animUrl;
      console.log(
        `NPC ${app.instanceId} playing ${data.name || "attack"} animation (${data.cooldown
        }s cooldown)`
      );

      // Set a timer to return to idle after the attack animation
      const duration = data.cooldown || 2.5; // Use animation-specific cooldown
      attackTimer = setTimeout(() => {
        // Return to idle animation
        if (props.idle?.url) {
          avatar.emote = props.idle.url;
          console.log(`NPC ${app.instanceId} returning to idle animation`);
        }
        isAttacking = false;
        attackTimer = null;
      }, duration * 1000); // Convert seconds to milliseconds
    }
  });
}
```

---
*Extracted from NPC_10.hyp. Attachment ID: 1354082560736628877*