# Mato_Pets.hyp

## Metadata
- **Author**: ~/MayD524/Hyperfy
- **Channel**: #🎨│showcase
- **Date**: 2025-02-25
- **Size**: 1,457,721 bytes

## Discord Context
> Well I did say tuesday didn't I? Not fully where I wanted it but a nice little demo, much more to come soon

## Blueprint
- **Name**: Mato Pets
- **Version**: 2
- **Model**: `asset://9b84a453037c504aa80c4d4208547ec6afc56a3074952227b795f3aadb42187d.vrm`
- **Script**: `asset://1b8303e9f74da883779031c49d6ec12bcda8d5f4664766e461d102e1b0a98879.js`

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
- `[script]` 1b8303e9f74da883779031c49d6ec12bcda8d5f4664766e461d102e1b0a98879.js (13,216 bytes)
- `[emote]` c56b4f79ae304b31ee0f81ebd66b8f5a906ff508d739bf9deeafe7b68484efbe.glb (88,600 bytes)
- `[emote]` 462774a80a7a9111459f0041578bf02818ed2748ad7a05a65cd16d68f800e887.glb (63,268 bytes)
- `[emote]` 036b786f142de68cefe0da2fa27725b92d71f7298035acd49944175c49507ede.glb (188,032 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`, `app.remove()`, `app.send()`
**World Methods**: `world.getPlayer()`, `world.on()`, `world.raycast()`
**Events Listened**: `fixedUpdate`, `leave`, `move`, `requestAdoption`, `requestSurrender`, `setPlayer`, `state`, `take`, `update`
**Nodes Created**: `action`

## Keywords (for Discord search)
action, actual, adopt, already, angleOffset, applyAxisAngle, applyQuaternion, atTarget, avatar, avoidance, avoidanceVector, blendedQuat, broadcast, broadcasting, broadcasts, cannot, cast, centerRayClear, client, clone

## Script Source
```javascript
// -------------------------------------------------------------------
// Title: Mato Pets
// Author: MayD524
// Github: https://github.com/MayD524
// Date: 2/23/2025
// Description: Networked pets for hyperfy v2
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------
app.configure([
{
  key: 'target',
  label: 'Player Follow Target',
  type: 'text'
},
{
  key: 'avoidance_distance',
  label: 'Avoidance Distance',
  type: 'text',
  initial: '4'
},
{
  key: 'follow_speed',
  label: 'Follow Speed',
  type: 'text',
  initial: '2.2'
},
{
  key: 'rotation_speed',
  label: 'Rotation Speed',
  type: 'text',
  initial: '2.2'
},
{
  type: 'file',
  key: 'emote_idle',
  label: 'Idle Emote',
  kind: 'emote'
},
{
  type: 'file',
  key: 'emote_walking',
  label: 'Walking emote',
  kind: 'emote',
},
{
  type: 'file',
  key: 'emote_sitting',
  label: 'Sitting emote',
  kind: 'emote'
}]);



// -------------------------------------------------------------------
// CONSTANTS & GLOBALS
// -------------------------------------------------------------------
const NUM_RAYS = 5; // Number of rays to cast
const FOV_ANGLE = Math.PI / 4; // 45-degree FOV
const BASE_DIRECTION = new Vector3(0, 0, -1); // Default forward direction
const SEND_RATE = 1 / 8;
const FOLLOW_SPEED = Number.parseFloat(props.follow_speed);
const AVOIDANCE_DISTANCE = Number.parseFloat(props.avoidance_distance);
const ROTATION_SPEED = Number.parseFloat(props.rotation_speed); // Used to slerp toward the target
const STOP_THRESHOLD = 3;
const MAX_PLAYER_DISTANCE = 100.0;

const STUCK_CHECK_INTERVAL = 2.0;
const STUCK_THRESHOLD = 0.2;
const STUCK_LIMIT = 3;
let lastCheckTime = 0;
let lastPosition = new Vector3();
let stuckCounter = 0;

const _direction = new Vector3();
const _forward = new Vector3();
const _velocity = new Vector3();
const avatar = app.get('avatar');

const idle_emote = props.emote_idle?.url;
const walk_emote = props.emote_walking?.url;
const sit_emote = props.emote_sitting?.url;

let ownerId = null;
let atTarget = true;
let action = null;
let worldUI = null;

// -------------------------------------------------------------------
// HELPER: moveTowardsPos
// -------------------------------------------------------------------
function moveTowardsPos(currentPos, currentQuat, targetPos)
{
  // Calculate horizontal direction: targetPos - currentPos
  _direction.copy(targetPos).sub(currentPos);
  _direction.y = 0; // ignore vertical

  const distance = _direction.length();

  // If within avoidance distance, no movement
  if (distance < AVOIDANCE_DISTANCE)
  {
    return _velocity.set(0, 0, 0);
  }

  // Find forward direction from currentQuat
  _forward.set(0, 0, 1).applyQuaternion(currentQuat).normalize();

  // Always move forward at FOLLOW_SPEED:
  _velocity.copy(_forward).multiplyScalar(-FOLLOW_SPEED);

  return _velocity;
}

// -------------------------------------------------------------------
// CLIENT-SIDE LOGIC
// -------------------------------------------------------------------
if (world.isClient)
{

  const local_player = world.getPlayer();
  let player = null;
  let player_id = null;

  // Wait for server state
  if (app.state.ready)
  {
    init(app.state);
  }
  app.on('state', init);


  function init(state)
  {
    // Apply initial data from server
    app.position.fromArray(state.p);
    app.quaternion.fromArray(state.q);

    props = state.props;

    player_id = state.player_id;
    player = state.player;

    if (action)
    {
      app.remove(action);
      action = null;
    }

    // If the server didn't store the actual player object, do a lookup:
    if (!player && player_id === local_player.id)
    {
      player = world.getPlayer();
    }

    // If *this* client is the target, request ownership
    if (player && player.id === local_player.id)
    {
      app.send('take', player.networkId);
    }

    // Setup interpolation for non-owners
    const npos = new LerpVector3(app.position, SEND_RATE);
    const nqua = new LerpQuaternion(app.quaternion, SEND_RATE);

    app.on('move', (e) =>
    {
      if (ownerId === world.networkId) return;
      npos.pushArray(e.p);
      nqua.pushArray(e.q);
      avatar.setEmote(e.e);
    });

    if (!ownerId)
    {
      avatar.setEmote(sit_emote);
    }

    if (!props.target)
    {
      action = app.create('action',
      {
        label: 'Adopt',
        distance: 2,
        onTrigger: () =>
        {
          app.send('requestAdoption', local_player.id);
        }
      });
      app.add(action);
    }

    app.on('take', (newOwnerId) =>
    {
      if (!ownerId)
      {
        avatar.setEmote(sit_emote);
      }
      if (ownerId === newOwnerId) return;

      ownerId = newOwnerId;
      npos.snap();
      nqua.snap();
    });

    // For broadcasting movement updates
    let lastSent = 0;

    app.on('fixedUpdate', (delta) =>
    {
      if (app.sleeping)
      {
        avatar.setEmote(idle_emote);
        return;
      }
      let current_emote = null;

      if (ownerId === world.networkId)
      {
        if (player)
        {
          const vel = moveTowardsPos(app.position, app.quaternion, player.position);

          _direction.copy(player.position).sub(app.position);
          _direction.y = 0; // Ignore vertical movement for rotation

          const distanceToTarget = _direction.length();
          atTarget = false;

          if (distanceToTarget <= STOP_THRESHOLD)
          {
            current_emote = idle_emote;
            avatar.setEmote(idle_emote);
            _direction.set(0, 0, 0);
            atTarget = true;
          }
          else if (distanceToTarget >= MAX_PLAYER_DISTANCE)
          {
            console.log("Player too far teleporting")
            app.position.copy(player.position);
          }

          const rayStart = new Vector3().copy(app.position);
          rayStart.y = Math.max(rayStart.y, 1.0);

          const centerRayClear = !world.raycast(rayStart, _direction, AVOIDANCE_DISTANCE, null);

          if (centerRayClear)
          {
            if (distanceToTarget > STOP_THRESHOLD)
            {
              const moveVector = new Vector3().copy(_direction).multiplyScalar(FOLLOW_SPEED);
              app.position.lerp(app.position.clone().add(moveVector.multiplyScalar(delta)), 0.1);

              if (_direction.lengthSq() > 0.0001)
              {
                _direction.normalize();
                const movementQuat = new Quaternion().setFromUnitVectors(BASE_DIRECTION, _direction);
                app.quaternion.slerp(movementQuat, 0.08);
              }
            }
          }
          else
          {
            let avoidanceVector = new Vector3();
            let hitDetected = false;
            let closestHitDistance = Infinity;
            let obstacleNormal = new Vector3();

            for (let i = 0; i < NUM_RAYS; i++)
            {
              const angleOffset = (i / (NUM_RAYS - 1) - 0.5) * FOV_ANGLE;
              const rayDirection = new Vector3().copy(_direction);
              rayDirection.applyAxisAngle(new Vector3(0, 1, 0), angleOffset);
              rayDirection.normalize();

              const hit = world.raycast(rayStart, rayDirection, AVOIDANCE_DISTANCE, null);

              if (hit)
              {
                if (hit.player && hit.player.id === props.target)
                {
                  continue;
                }

                if (hit.distance < closestHitDistance)
                {
                  closestHitDistance = hit.distance;
                  obstacleNormal.copy(hit.normal);
                }

                avoidanceVector.add(rayDirection);
                hitDetected = true;
              }
            }

            if (hitDetected)
            {
              avoidanceVector.normalize();
              let sidestepDirection = new Vector3();


// ... truncated ...
```

---
*Extracted from Mato_Pets.hyp. Attachment ID: 1343812585140785233*