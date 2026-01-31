export default function main(world, app, fetch, props, setTimeout) {
props;
(function () {
  'use strict';

  // WorldObject.js
  class WorldObject {
    constructor() {
      return new Proxy({}, {
        get(target, prop, receiver) {
          // Coercion: if used as a primitive, return app.
          if (prop === Symbol.toPrimitive || prop === 'valueOf' || prop === 'toString') {
            return () => app;
          }
          // If app has an own property for this key, return it.
          if (prop in app) {
            return app[prop];
          }
          // Otherwise, fallback to app.get('<prop>')
          return app.get(prop);
        },
        set(target, prop, value, receiver) {
          // If app already has a property, assign directly.
          if (prop in app) {
            app[prop] = value;
            return true;
          }
          // Otherwise, if app has a setter function, use it.
          if (typeof app.set === 'function') {
            app.set(prop, value);
            return true;
          }
          return false;
        },
        ownKeys(target) {
          return Reflect.ownKeys(app);
        },
        getOwnPropertyDescriptor(target, prop) {
          let descriptor = Object.getOwnPropertyDescriptor(app, prop);
          if (descriptor) {
            return descriptor;
          }
          return {
            configurable: true,
            enumerable: true,
            value: app.get(prop)
          };
        }
      });
    }
  }

  const SEND_RATE = 1 / 8;

  class GameObject {
    constructor(sendRate = SEND_RATE, lerpConfig = {}, runSendState=true) {
      this.sendRate = sendRate;
      this.root = new WorldObject();

      
      this.lastSent = 0;
      this.ownerId = null;
      this.worldId = app.instanceId;
      
      // State stored as a Map for advanced state handling.
      this.state = new Map();
      
      // For custom event callbacks.
      this.customEvents = new Map();
      
      // Store registered event listeners for cleanup.
      this._registeredCallbacks = [];
      
      // Extensibility hooks (can be overridden in subclasses)
      this.beforeUpdateClient = () => {};
      this.afterUpdateClient = () => {};
      this.beforeUpdateServer = () => {};
      this.afterUpdateServer = () => {};
      this.onOwnershipChanged = (oldOwner, newOwner) => {};

      // Allow custom lerp objects or easing via lerpConfig.
      this.lerpConfig = lerpConfig;
      this.setupLerps();
      this.setupEvents();

      if (world.isServer) {
        this.setupBaseState();

        if (runSendState) {
          this.sendState();
        }
      }
    }

    setupBaseState() {
      this.setState('position', this.root.position.toArray());
      this.setState('quaternion', this.root.quaternion.toArray());
      this.setState('velocity', [0,0,0]);
      this.setState('props', props);

      this.setState('ready', true);
    }

    setupEvents() {
      // Register event listeners and store them for later cleanup.
      const objMoveListener = (e) => this.handleEvent('objectMove', e);
      app.on('objectMove', objMoveListener);
      this._registeredCallbacks.push({ target: app, event: 'objectMove', handler: objMoveListener });
      
      const takeOwnershipListener = (id) => this.handleEvent('takeOwnership', id);
      app.on('takeOwnership', takeOwnershipListener);
      this._registeredCallbacks.push({ target: app, event: 'takeOwnership', handler: takeOwnershipListener });

      const updateListener = (delta) => this.handleEvent('update', delta);
      app.on('update', updateListener);
      this._registeredCallbacks.push({ target: world, event: 'update', handler: updateListener });

      const fixedUpdateListener = (delta) => this.handleEvent('fixedUpdate', delta);
      app.on('fixedUpdate', fixedUpdateListener);
      this._registeredCallbacks.push({ target: world, event: 'fixedUpdate', handler: fixedUpdateListener });

      if (world.isClient) {
        const updateStateListener = (s) => this.updateState(s);
        app.on('updateState', updateStateListener);
        this._registeredCallbacks.push({ target: app, event: 'updateState', handler: updateStateListener });
      }
    }

    setupLerps() {
      // Use custom interpolators if provided in lerpConfig; otherwise, default.
      this.npos = this.lerpConfig.lerpVector || new LerpVector3(app.position, this.sendRate);
      this.nqua = this.lerpConfig.lerpQuaternion || new LerpQuaternion(app.quaternion, this.sendRate);
    }

    handleEvent(type, data) {
      try {
        // Run before-update hooks on update events.
        if (type === 'fixedUpdate') {
          if (world.isServer) {
            this.beforeUpdateServer(data);
          } else {
            this.beforeUpdateClient(data);
          }
        }

        // Determine the proper handler based on server/client.
        const handlerName = `${type}${world.isServer ? 'Server' : 'Client'}`;
        if (typeof this[handlerName] === 'function') {
          this[handlerName](data);
        }

        this.callCustomEvent(type, data);
        
        // Run after-update hooks on update events.
        if (type === 'fixedUpdate') {
          if (world.isServer) {
            this.afterUpdateServer(data);
          } else {
            this.afterUpdateClient(data);
          }
        }
      } catch (error) {
        console.error(`Error handling event ${type}:`, error);
      }
    }

    callCustomEvent(type, data) {
      if (this.customEvents.has(type)) {
          const callbacks = this.customEvents.get(type);
          for (let cb of callbacks) {
            try {
              cb(data);
            } catch (err) {
              console.error(`Error in custom event callback for ${type}:`, err);
            }
          }
        }
    }

    // Custom event emitter apply
    addEventListener(event, callback, appScope=true) {
      const isRegisteredCallback = this._registeredCallbacks.some(cb =>
        Object.values(cb).some(value =>
          typeof value === 'string' && value.includes(event)
        )
      );

      if (!isRegisteredCallback) {
        let owner = appScope ? app : world;
        owner.on(event, callback);
        return;
      }

      if (!this.customEvents.has(event)) {
        this.customEvents.set(event, []);
      }
      this.customEvents.get(event).push(callback);
    }

    removeEventListener(event, callback) {
      if (this.customEvents.has(event)) {
        const arr = this.customEvents.get(event);
        const idx = arr.indexOf(callback);
        if (idx !== -1) {
          arr.splice(idx, 1);
        }
      }
    }

    // Ownership management with an ownership-changed hook.
    takeOwnershipServer(newOwnerId) {
      const oldOwner = this.ownerId;
      this.ownerId = newOwnerId;
      app.send('takeOwnership', newOwnerId);
      this.onOwnershipChanged(oldOwner, newOwnerId);
    }

    takeOwnershipClient(newOwnerId) {
      if (this.ownerId !== newOwnerId) {
        const oldOwner = this.ownerId;
        this.ownerId = newOwnerId;
        this.npos.snap();
        this.nqua.snap();
        this.onOwnershipChanged(oldOwner, newOwnerId);
      }
    }

    // Object movement handling: update state and apply new transforms.
    objectMoveServer(event) {
      try {
        if (event.position) {
          this.root.position.fromArray(event.position);
        }
        if (event.quaternion) {
          this.root.quaternion.fromArray(event.quaternion);
        }
        app.send('objectMove', event);
      } catch (err) {
        console.error('Error in objectMoveServer:', err);
      }
    }

    objectMoveClient(event) {
      try {
        if (this.ownerId !== world.networkId) {
          this.npos.pushArray(event.position);
          this.nqua.pushArray(event.quaternion);
        }
      } catch (err) {
        console.error('Error in objectMoveClient:', err);
      }
    }

    // Fixed update events (server)
    fixedUpdateServer(delta) {
      if (this.ownerId) {
        return;
      }
      this.lastSent += delta;
      if (this.lastSent > this.sendRate) {
        this.lastSent = 0;
        this.beforeUpdateServer(delta);
        this.updateServer(delta);
        this.afterUpdateServer(delta);
      }
    }

    // Fixed update events (client) – can be overridden if needed.
    fixedUpdateClient(delta) {
      // Default empty implementation.
    }

    // Regular update events for client interpolation.
    updateClient(delta) {
      this.beforeUpdateClient(delta);
      if (this.ownerId !== world.networkId) {
        this.npos.update(delta);
        this.nqua.update(delta);
      }
      this.afterUpdateClient(delta);
    } 

    // On the server, updateServer sends the current state.
    updateServer() {

      if (this.sendRate <= 0.0 || this.lastSent < this.sendRate) { return; }

      this.setState('position', this.root.position.toArray());
      this.setState('quaternion', this.root.quaternion.toArray());
    
      app.send('objectMove', {
        position: this.state.get('position'),
        quaternion: this.state.get('quaternion'),
        state: this.state
      });
      this.lastSent = 0;
    }

    // Advanced state synchronization: update only changed properties.
    updateStateDelta(deltaState) {
      for (const key in deltaState) {
        if (deltaState.hasOwnProperty(key)) {
          this.state.set(key, deltaState[key]);
          app.state[key] = deltaState[key];
        }
      }
    }

    // State management (full state update)
    setState(key, value, send=false) {
      this.state.set(key, value);
      app.state[key] = value;
      if (send)
        this.sendState();
    }

    sendState(onlyServer = true) {
      if (!world.isServer && onlyServer) { return; } // only the server can update the state
      app.send('updateState', this.state);
    }

    updateState(state) {
      this.state = state;
      app.state = state;
      this.callCustomEvent('updateState', state);
    }

    // Public API: claim ownership if matching local network ID.
    take(newId) {
      if (newId !== world.networkId) {
        return;
      }
      const oldOwner = this.ownerId;
      this.ownerId = world.networkId;
      app.send('takeOwnership', this.ownerId);
      this.onOwnershipChanged(oldOwner, this.ownerId);
    }

    // Robust ownership transition.
    transitionOwnership(newOwnerId) {
      const oldOwner = this.ownerId;
      if (oldOwner === newOwnerId) {
        return; // No change.
      }
      if (world.isServer) {
        this.takeOwnershipServer(newOwnerId);
      } else {
        this.takeOwnershipClient(newOwnerId);
      }
    }

    // Cleanup: remove all event listeners and clear custom events.
    destroy() {
      for (const { target, event, handler } of this._registeredCallbacks) {
        if (typeof target.off === 'function') {
          target.off(event, handler);
        }
      }
      this._registeredCallbacks = [];
      this.customEvents.clear();
      // Additional cleanup can be added here.
    }
  }

  // FollowPet.js

  // -------------------------------------------------------------------
  // CONSTANTS & GLOBALS (for follow logic)
  // -------------------------------------------------------------------
  const NUM_RAYS = 5;                   // Number of rays for collision avoidance
  const FOV_ANGLE = Math.PI / 4;          // 45° field of view for raycasting
  const BASE_DIRECTION = new Vector3(0, 0, -1); // Default forward direction

  const STOP_THRESHOLD = 3;
  const MAX_PLAYER_DISTANCE = 100.0;
  const STUCK_CHECK_INTERVAL = 2.0;
  const STUCK_THRESHOLD = 0.2;
  const STUCK_LIMIT = 3;

  // -------------------------------------------------------------------
  // FollowPet Class Definition
  // -------------------------------------------------------------------
  class FollowPet extends GameObject {
    constructor(sendRate = SEND_RATE, lerpConfig = {}) {
      // No root passed; GameObject creates its own root (a WorldObject) downstream.
      super(sendRate, lerpConfig, false);

      // Read configuration values from props.
      this.followSpeed = Number.parseFloat(props.follow_speed) || 2.2;
      this.avoidanceDistance = Number.parseFloat(props.avoidance_distance) || 4;
      this.rotationSpeed = Number.parseFloat(props.rotation_speed) || 2.2;

      this.idleEmote = props.emote_idle?.url;
      this.walkEmote = props.emote_walking?.url;
      this.sitEmote = props.emote_sitting?.url;
      this.targetId = props.target; // (if used)

      // Variables for interaction UI and adoption actions.
      this.action = null;
      this.worldUI = null;

      // Stuck detection.
      this.lastCheckTime = 0;
      this.stuckCounter = 0;
      this.lastPosition = new Vector3().copy(this.root.position);

      // Temporary vectors for calculations.
      this._direction = new Vector3();
      this._forward = new Vector3();
      this._velocity = new Vector3();


      if (world.isServer) {
        this.setPetState();

        this.addEventListener('fixedUpdate', (delta) => this.fixedUpdateServer(delta));
        this.addEventListener('requestAdoption', (playerId) => this.adoptionRequest(playerId));
        this.addEventListener('leave', (e) => this.playerLeftLobby(e));
        this.addEventListener('setPlayer', (player) => this.setPlayer(player));
      } else {
        if (app.state.ready) {
          this.initState(app.state);
        }

        this.addEventListener('updateState', (state) => this.initState(state));
        this.addEventListener('fixedUpdate', (delta) => this.updatePetClient(delta));
      }

      this.sendState();
    }

    // --- Interaction UI ---
    interactWithPet() { }

    playerLeftLobby(e) {
      if (e.player.networkId === this.ownerId) {
        ownerId = null;
        this.take(null);
      }
    }

    setPlayer(player) {
      this.setState('player', player, true);
    }

    adoptionRequest(playerId) {
      if (!world.isServer) { return; } // cannot execute as client
      let current_id = this.state.get('player_id');

      if (current_id) { return; } // can't adopt already owned

      props.target = playerId;
      this.setState('props', props);
      this.setState('player_id', playerId);
      this.setState('player', null);

      this.sendState();
    }

    setPetState() {
      this.setState('player_id', this.targetId ? this.targetId : null);
      this.setState('player', null);
    }

    initState(state) {
      // Use full property names from state.
      this.root.position.fromArray(state.get("position"));
      this.root.quaternion.fromArray(state.get("quaternion"));
      // Update global props if needed.
      props = state.get("props");

      const local_player = world.getPlayer();
      let player = state.get("player");
      let player_id = state.get("player_id");

      if (this.action) {
        app.remove(this.action);
        this.action = null;
      }
      // If no player object is provided, try to look it up.
      if (!player && player_id === local_player.id) {
        player = world.getPlayer();
      }
      // If the local player is the target, claim ownership and add an "Interact" action.
      if (player && player.id === local_player.id) {
        this.take(player.networkId);
        this.action = app.create('action', {
          label: 'Interact',
          distance: 2,
          onTrigger: () => { this.interactWithPet(); }
        });
        app.add(this.action);
      }
      // If no target is defined, add an "Adopt" action.
      if (!props.target) {
        this.root.avatar.setEmote(this.sitEmote);
        this.action = app.create('action', {
          label: 'Adopt',
          distance: 2,
          onTrigger: () => {
            app.send('requestAdoption', local_player.id);
          }
        });
        app.add(this.action);
      }
      // Note: The GameObject base already listens for "updateState" events.
    }

    // --- Client-side Update ---
    updatePetClient(delta) {
      // If no one owns the pet, have it sit and let GameObject handle interpolation.
      if (!this.ownerId) {
        if (this.root.avatar && typeof this.root.avatar.setEmote === 'function') {
          this.root.avatar.setEmote(this.sitEmote);
        }
        super.updateClient(delta);
        return;
      }

      // If the local client owns the pet, run follow logic.
      if (this.ownerId === world.networkId) {
        if (app.sleeping) {
          if (this.root.avatar && typeof this.root.avatar.setEmote === 'function') {
            this.root.avatar.setEmote(this.idleEmote);
          }
          return;
        }
        const player = world.getPlayer();
        if (!player) return;

        const currentPos = this.root.position;
        const targetPos = player.position;

        // Calculate horizontal direction toward the target.
        this._direction.copy(targetPos).sub(currentPos);
        this._direction.y = 0;
        let distanceToTarget = this._direction.length();
        let atTarget = false;

        if (distanceToTarget <= STOP_THRESHOLD) {
          atTarget = true;
          if (this.root.avatar && typeof this.root.avatar.setEmote === 'function') {
            this.root.avatar.setEmote(this.idleEmote);
          }
          this._direction.set(0, 0, 0);
        } else if (distanceToTarget >= MAX_PLAYER_DISTANCE) {
          console.log("Player too far; teleporting pet.");
          this.root.position.copy(targetPos);
          return;
        }

        // Collision avoidance via raycasting.
        const rayStart = new Vector3().copy(currentPos);
        rayStart.y = Math.max(rayStart.y, 1.0);
        const centerRayClear = !world.raycast(rayStart, this._direction, this.avoidanceDistance, null);

        if (centerRayClear) {
          if (!atTarget) {
            const moveVector = new Vector3().copy(this._direction).multiplyScalar(this.followSpeed);
            this.root.position.lerp(currentPos.clone().add(moveVector.multiplyScalar(delta)), 0.1);
            if (this._direction.lengthSq() > 0.0001) {
              this._direction.normalize();
              const movementQuat = new Quaternion().setFromUnitVectors(BASE_DIRECTION, this._direction);
              this.root.quaternion.slerp(movementQuat, 0.08);
            }
          }
        } else {
          // Multi-ray avoidance.
          let avoidanceVector = new Vector3();
          let hitDetected = false;
          let closestHitDistance = Infinity;
          let obstacleNormal = new Vector3();

          for (let i = 0; i < NUM_RAYS; i++) {
            const angleOffset = (i / (NUM_RAYS - 1) - 0.5) * FOV_ANGLE;
            const rayDirection = new Vector3().copy(this._direction);
            rayDirection.applyAxisAngle(new Vector3(0, 1, 0), angleOffset);
            rayDirection.normalize();

            const hit = world.raycast(rayStart, rayDirection, this.avoidanceDistance, null);
            if (hit) {
              // Skip if the hit belongs to the target.
              if (hit.player && hit.player.id === props.target) continue;
              if (hit.distance < closestHitDistance) {
                closestHitDistance = hit.distance;
                obstacleNormal.copy(hit.normal);
              }
              avoidanceVector.add(rayDirection);
              hitDetected = true;
            }
          }

          if (hitDetected) {
            avoidanceVector.normalize();
            let sidestepDirection = new Vector3();
            sidestepDirection.crossVectors(this._direction, new Vector3(0, 1, 0));
            if (sidestepDirection.dot(obstacleNormal) < 0) {
              sidestepDirection.negate();
            }
            let sidestepClear = !world.raycast(rayStart, sidestepDirection, this.avoidanceDistance, null);
            if (!sidestepClear) {
              sidestepDirection.negate();
              sidestepClear = !world.raycast(rayStart, sidestepDirection, this.avoidanceDistance, null);
            }
            if (sidestepClear) {
              avoidanceVector.copy(sidestepDirection);
            } else {
              avoidanceVector.set(0, 0, 0);
            }
          } else {
            avoidanceVector.copy(this._direction);
          }

          if (avoidanceVector.lengthSq() > 0.0001) {
            const moveVector = new Vector3().copy(avoidanceVector).multiplyScalar(this.followSpeed);
            this.root.position.lerp(currentPos.clone().add(moveVector.multiplyScalar(delta)), 0.1);
            avoidanceVector.normalize();
            this._direction.normalize();
            const movementQuat = new Quaternion().setFromUnitVectors(BASE_DIRECTION, avoidanceVector);
            const targetQuat = new Quaternion().setFromUnitVectors(BASE_DIRECTION, this._direction);
            const blendedQuat = new Quaternion();
            blendedQuat.slerpQuaternions(movementQuat, targetQuat, 0.3);
            this.root.quaternion.slerp(blendedQuat, 0.08);
            if (this.root.avatar && typeof this.root.avatar.setEmote === 'function') {
              this.root.avatar.setEmote(this.walkEmote);
            }
          }
        }

        // Stuck detection: if the pet hasn't moved enough over a period, teleport it to the player.
        this.lastCheckTime += delta;
        if (this.lastCheckTime >= STUCK_CHECK_INTERVAL && !atTarget) {
          this.lastCheckTime = 0;
          const movementDistance = this.lastPosition.distanceTo(currentPos);
          console.log("Movement distance:", movementDistance);
          if (movementDistance < STUCK_THRESHOLD) {
            this.stuckCounter++;
            if (this.stuckCounter >= STUCK_LIMIT) {
              console.log("[STUCK] Teleporting pet to player.");
              this.root.position.copy(targetPos);
              this.stuckCounter = 0;
            }
          } else {
            this.stuckCounter = 0;
          }
          this.lastPosition.copy(currentPos);
        }

        // Update state using setState so that the updateState event is used.
        this.setState('position', currentPos.toArray());
        this.setState('quaternion', this.root.quaternion.toArray());

        // Let the GameObject base handle further event processing.
        super.updateClient(delta);
      } else {
        super.updateClient(delta);
      }
    }

    // --- Server-side Update ---
    updatePetServer(delta) {
      if (!this.ownerId) {
        this.lastSent += delta;
        if (lastSend < this.sendRate) ;
      }
    }
  }

  app.configure([
    { key: 'target', label: 'Player Follow Target', type: 'text' },
    { key: 'avoidance_distance', label: 'Avoidance Distance', type: 'text', initial: '4' },
    { key: 'follow_speed', label: 'Follow Speed', type: 'text', initial: '2.2' },
    { key: 'rotation_speed', label: 'Rotation Speed', type: 'text', initial: '2.2' },
    { type: 'file', key: 'emote_idle', label: 'Idle Emote', kind: 'emote' },
    { type: 'file', key: 'emote_walking', label: 'Walking Emote', kind: 'emote' },
    { type: 'file', key: 'emote_sitting', label: 'Sitting Emote', kind: 'emote' }
  ]);


  new FollowPet(SEND_RATE);

})();

}
