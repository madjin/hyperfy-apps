# Entity Implementation Details

Technical notes for each V1→V2 entity converter.

## v14: Place Converter

- **V1 Fields**: `name` (place identifier)
- **V2 API**: `world.on('place:Name', playerId)` + `player.teleport(position, yaw)`
- **Purpose**: Named teleport destinations that other scripts can target
- **Usage**: Other scripts call `world.emit('place:PlaceName', playerId)` to teleport a player
- **Marker**: Blue ring/beacon visible in build mode only (client-side)
- **Model**: Uses invisible 1cm cube as anchor point
- **Reference**: `scripts/entity_scripts/place.js`, `v2_apps/place/`

## v13: Camera Converter

- **V1 Fields**: `label` (display name), `number` (camera slot 1-9), position/rotation from entity
- **V2 API**: `app.control()` with `control.camera.write = true` to take camera control
- **Action**: Creates action button labeled "Camera N: Label" or "Camera: Label"
- **Exit**: Click again or press X to release camera control
- **Transform**: Entity position/rotation stored as camera target on client init
- **Reference**: Based on `research/hyp_summaries/Camera_Trigger.md` pattern
- **Known Issue**: Exit bug tracked in issue #10

## v13: Launchpad Converter

- **V1 Fields**: `force` (launch strength), `type` (scifi/custom), `hitbox` [x, y, z]
- **V2 API**: `player.push(new Vector3(0, force, 0))` for upward launch
- **Model**: Uses V1 launchpad.glb from v1_apps/hyperfy-launchpad/assets/
- **Trigger**: Client-side prim trigger zone detects player entry
- **Reference**: Based on `research/hyp_summaries/MoonJump.md` pattern

## v12: NPC Converter

- **V1 Fields**: `vrm` (avatar model), `emote` (idle animation), `name`, `greeting`, `messages` (1-4), `message1-4Prompt/Response`
- **V2 Model**: VRM file used directly as model (Hyperfy auto-detects .vrm → loads as avatar)
- **Script**: Uses `app.get('avatar')` to get avatar node from VRM model
- **Greeting**: Action trigger that logs to console (chat API needs more work)
- **Limitation**: Dialog system (messages 1-4) not implemented
- **Reference**: Based on `research/hyp_summaries/NPC_Prisoner.md` pattern

## v12: Car Converter

- **V1 Fields**: `prefab` (drift/offroad/gokart), `src` (custom model), physics params, seat positions
- **V2 Source**: Based on `car1-v2.hyp` by ash
- **V2 Conversion**: Uses Blender script to combine V1 visuals with V2 physics template
- **Sitting Animation**: Uses emote from sit.hyp template for driver
- **Required Nodes**: Body (rigidbody), BodyMesh (visual), Collider, Springs, Tires
- **Controls**: WASD to drive, X to exit
- **Physics**: Raycast suspension, anti-roll, grip simulation via `fixedUpdate`
- **Blender Script**: `scripts/blender/convert_car_v1_to_v2.py`

## v12: Stream Converter

- **V1 Fields**: `streamUrl`, `height`, `volume`, `active`, `audioDistance`, `audioRolloff`
- **V2 API**: `app.create('video')` with HLS stream support
- **Mapping**: `streamUrl` → `video.src`, `height` → `video.height`, `volume` → `video.volume`
- **Auto-play**: Uses `onLoad` callback to start playback when loaded
- **Note**: `audioDistance` and `audioRolloff` not supported in V2

## v12: Screen Converter

- **V1 Fields**: `height`, `audioVolume`, `audioSpatial`, `frameWidth`, `frameDepth`, `frameColor`
- **V2 API**: `app.create('video', {screenId, linked: true})` + `player.screenshare(screenId)`
- **Frame**: V2 creates frame via prim box; V1 frame styling not mapped
- **Action**: Creates "Share Screen" action button at screen center
- **Note**: Permission restriction not implemented (V1 had label/admin options)

## v12: Grabbable Converter

- **V1 Fields**: `model`, `collision`, `guide`, `label`, position/rotation offsets
- **V2 API**: `app.create('action')` for pickup, `app.control()` for drop, `getBoneTransform()` for hand attachment
- **Networking**: Server-client sync via `app.state`, `app.send()`, `app.on()`
- **Drop key**: X key releases held object
- **Hand attachment**: Uses `rightIndexProximal` bone transform
- **Note**: Hand offsets (left/right position/rotation) not mapped; V2 uses automatic bone attachment

## v11: Particles Converter

- **V1 color format**: `#rrggbbaa` (8-char with alpha) → V2: `#rrggbb` (6-char)
- **V1 shape mapping**: `CONE` → `['cone', radius, 1, angleRadians]`, `SPHERE` → `['sphere', radius]`
- **Skip condition**: Particles with `autoPlay: false` are skipped (no point importing static emitters)
- **Texture support**: Copies particle texture asset if `textureSrc.url` exists

## v11: Platform Converter

- **Animation**: Uses lerp-based animation (simpler than V2's physics triggers)
- **Easing**: Maps V1 easing names (`qInOut` → `easeInOut`, etc.)
- **Position**: End offset calculated as `ePos - sPos` relative to entity position
- **Collision**: Platform models are preloaded for collision detection

## v11: Emote Converter

- **Trigger**: Action-based (click) instead of V2's command-based
- **Asset**: Copies emote GLB file to world assets
- **Label**: Uses V1 `label` or `hint` field for action button text

## v10: Image Fixes

- **Pivot adjustment**: V1 used center pivot, V2 uses bottom-center. Position offset by `-height/2`
- **Framed images**: Uses framed-image.hyp when V1 has frameWidth/frameDepth/frameColor
- **Frame positioning**: Compensates for auto-lift by subtracting frameThickness from Y

## v10: Seat Fixes

- **Model orientation**: sit.hyp model rotated -90° to face forward
- **Model position**: sit.hyp model moved to Y=0 (was at Y≈0.46)
- **Anchor offset**: sit.hyp script has anchor.position.y = -0.35 for correct sitting height
- **Script source**: Uses sit.hyp script directly instead of generating custom script

## v6: Portal Converter

- **V1 URLs**: Relative URLs like "/m3" converted to "https://hyperfy.io/m3"
- **Actions**: Click or enter trigger based on V1 `action` field
- **Image**: Portal image displayed if V1 has `image` field
- **New tab**: Respects V1 `newTab` setting

## v6: Zone Converter

- **Size**: Invisible trigger prim with configurable size (sizeX, sizeY, sizeZ)
- **Actions**: Execute URL actions on enter/leave via `world.open()`
- **Marker**: Edit-mode-only visual box marker for positioning
- **URL conversion**: Relative V1 URLs converted to hyperfy.io absolute URLs

## v6: Light Converter

- **V2 limitation**: No Light node exposed to scripts
- **Conversion**: Emissive prims (visual markers, not real lighting)
- **Appearance**: Always visible glowing spheres with high emissiveIntensity
- **Area lights**: Converted to point lights for marker placement
- **Real lighting**: Needs research (see GitHub issue #1)

## Model Collision in V2

- V1 `hyperfy-model` has `collision: bool|str` field (False, True, "trimesh", "none", "auto")
- V2 collision is **script-based** (not baked into GLB):
  - Model.hyp includes a script that creates rigidbody/colliders at runtime
  - Script uses `app.traverse()` to find meshes and create colliders
  - Collision is toggled via `props.collision: true`

```javascript
// V2 Collision Script (from Model.hyp)
if (props.collision) {
  const body = app.create('rigidbody')
  app.traverse(node => {
    if (node.name === 'mesh') {
      const collider = app.create('collider')
      collider.type = 'geometry'
      collider.geometry = node.geometry
      body.add(collider)
    }
  })
  world.add(body)
}
```

## V1 to V2 Environment Mapping

| V1 Entity | V1 Field | V2 $scene Prop |
|-----------|----------|----------------|
| hyperfy-sky | bgFile.url | sky |
| hyperfy-sky | hdrFile.url | hdr |
| hyperfy-sun | direction | horizontalRotation |
| hyperfy-sun | time | (converted to elevation) |
| hyperfy-sun | intensity | intensity |
| hyperfy-sun | color | sunColor |
| hyperfy-fog | color | fogColor |
| hyperfy-fog | near | fogNear |
| hyperfy-fog | far | fogFar |

## V2 Available Nodes

From hyperfy/docs/scripting/nodes/types/:
- Action, Anchor, Audio, Avatar, Collider, Controller
- Group, Image, LOD, mesh/*, Particles, Prim
- RigidBody, SkinnedMesh, UI, UIImage, UIText, UIView, Video
- Webview (dev branch only - PR #147)
