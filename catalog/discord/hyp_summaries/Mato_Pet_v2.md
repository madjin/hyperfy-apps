# Mato_Pet_v2.hyp

## Metadata
- **Author**: ~/MayD524/Hyperfy
- **Channel**: #🎨│showcase
- **Date**: 2025-03-01
- **Size**: 1,467,617 bytes

## Discord Context
> Updated hyper pets to use modules >:) https://github.com/Bitmato-Studio/MatoPet

## Blueprint
- **Name**: Mato Pet v2
- **Version**: 155
- **Model**: `asset://9b84a453037c504aa80c4d4208547ec6afc56a3074952227b795f3aadb42187d.vrm`
- **Script**: `asset://62ce052c7e524633068fce934470da00cc660de3a41e1765ad33198daf67121c.js`

## Props
- `avoidance_distance`: str = `4`
- `follow_speed`: str = `2.2`
- `rotation_speed`: str = `2.2`
- `emote_idle`: emote → `asset://c56b4f79ae304b31ee0f81ebd66b8f5a906ff508d739bf9deeafe7b68484efbe.glb`
- `emote_walking`: emote → `asset://462774a80a7a9111459f0041578bf02818ed2748ad7a05a65cd16d68f800e887.glb`
- `emote_sitting`: emote → `asset://036b786f142de68cefe0da2fa27725b92d71f7298035acd49944175c49507ede.glb`
- `target`: str = ``

## Assets
- `[avatar]` 9b84a453037c504aa80c4d4208547ec6afc56a3074952227b795f3aadb42187d.vrm (1,102,956 bytes)
- `[script]` 62ce052c7e524633068fce934470da00cc660de3a41e1765ad33198daf67121c.js (23,103 bytes)
- `[emote]` c56b4f79ae304b31ee0f81ebd66b8f5a906ff508d739bf9deeafe7b68484efbe.glb (88,600 bytes)
- `[emote]` 462774a80a7a9111459f0041578bf02818ed2748ad7a05a65cd16d68f800e887.glb (63,268 bytes)
- `[emote]` 036b786f142de68cefe0da2fa27725b92d71f7298035acd49944175c49507ede.glb (188,032 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`, `app.remove()`, `app.send()`, `app.set()`
**World Methods**: `world.getPlayer()`, `world.raycast()`
**Events Listened**: `fixedUpdate`, `objectMove`, `takeOwnership`, `update`, `updateState`
**Nodes Created**: `action`

## Keywords (for Discord search)
action, actions, addEventListener, added, adopt, adoption, adoptionRequest, advanced, after, afterUpdateClient, afterUpdateServer, already, angleOffset, appScope, apply, applyAxisAngle, assign, atTarget, avatar, avoidance

## Script Source
```javascript
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
     

// ... truncated ...
```

---
*Extracted from Mato_Pet_v2.hyp. Attachment ID: 1345214513989025873*