export default function main(world, app, fetch, props, setTimeout) {
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
console.log(app)

console.log(`app: ${app.instanceId} INIT`);

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
        `NPC ${app.instanceId} triggered ${
          attackAnim.name || "attack"
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
  const avatar = app.get("avatar");
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
        `NPC ${app.instanceId} playing ${data.name || "attack"} animation (${
          data.cooldown
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
}
