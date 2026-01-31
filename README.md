# Hyperfy Apps Archive

Archive of Hyperfy virtual world apps preserved in human-readable format for reference and preservation.

## Structure

```
hyperfy-apps/
├── v1/              # 40 V1 React-based apps (legacy platform)
├── v2/
│   ├── apps/        # 158 V2 apps (extracted, human-readable)
│   └── assets/      # Shared assets (models, textures, audio)
├── v2-hyp/          # 174 original .hyp binary files
├── extract-hyp.mjs  # Extraction tool
└── package.json
```

## V1 Apps (Legacy)

40 React-based apps from the legacy Hyperfy SDK (2023-2026). Each directory contains `app.json`, `index.js`, and assets.

**Notable:** `fixtures/` folder has 24 core V1 entity types (sky, fog, audio, image, text, spawn, portal, etc.)

## V2 Apps (Current)

158 modern JavaScript apps using the Hyperfy Script SDK, collected from the Hyperfy Discord community.

### By Category

| Category | Apps |
|----------|------|
| **Core/World** | $scene, spawn, position, Avatar Station, HyperPortal (3 variants) |
| **Media** | BasicMp3Player, VideoPlayer, Video with player UI, Video Channel Changer, 360 Video Viewer, 360Player_Mono, Curved Video Viewer, Boombox, JUKEBOX_UI, Screen (2 variants) |
| **Vehicles** | car, car1, dash, Rover (3 variants) |
| **NPCs/AI** | NPC, NPC_Prisoner, Companion v8, Mato Pets, Mato Pet v2, Wolf Maro, GroupieV1 |
| **Creatures** | Butterfly Swarm (v1-v6 + Hyperfly editions), Bats v1, Eagles v1, Jumping Frog, Raptor_random_loc |
| **Particles/Effects** | Fire, Smoke, Fog, Rain (3 versions), Snow, Tornado, Fireflies, Glow Dust, Explosion Sprites, CONFETTT PPOT, SpeedTrail, eel_add_particles1 |
| **Environment** | Water Plane, Water Fountain, DAY-NIGHT-WEATHER, Alien_Planet, Forest, MoonJump, Solar Panel |
| **Plants** | Amanita, bending_leaf_V1, generate monstera V1, Grass (v1, v3), SplinePineV1 |
| **Combat/PvP** | Machine Gun v8, PVPblasterLATEST, PvE Sword, PvP Core (with spawns), Rocket Launcher V3, Health, Loot (3 variants), Mob - Skelly, Healing Aura, MINI-Nuke |
| **Camera** | Camera Trigger, Camera Manager (2 variants), Camera Laser, Free Camera, Raycaster, cam raycast action bar |
| **Movement** | Launchpad, Teleport Command, Teleport Trigger Box, Super Run, Wall Hang |
| **Interaction** | Networked Grabbable, TOKEN GATE, PAY TO ENTER DOOR, dice, Book - Flip, SimonSays (2 variants) |
| **UI** | Text (link option), Framed Image v1.0, uiImage from File, PlayerTag-UInew, Notifications, Game Timer, QuestItemUI, show chart |
| **Building** | Grid Floor (2 variants), Builder Drone (2 variants), Cube 1, Prism, testcube, hexagonal_test |
| **Utilities** | place, TriggerZone, HyperBeacon, Locationator, Emotes (4 variants), Seat v2, SITING POSITION |
| **Physics** | Physics - Contacts & Tags, Physics - Raycast Tags, Physics - Triggers & Tags, anybox |
| **Worlds** | SmolWrld, ROOMERS4, test_level, TEIL2 |

### Full App List

<details>
<summary>All 158 V2 Apps (click to expand)</summary>

- $scene
- 360 Video Viewer
- 360Player_Mono
- AlleySign
- Amanita
- anybox
- ArrayVectorProps
- Avatar Station
- BasicMp3Player
- Bats v1
- bending_leaf_V1
- Book - Flip
- Boombox
- broke-rom
- Builder Drone
- Builder Drone X501
- Butterfly Swarm V1-V6 (+ Hyperfly editions)
- Camera Laser
- Camera Manager
- Camera Manager Test
- Camera Trigger
- cam raycast action bar
- car
- car1
- Companion v8
- CONFETTT PPOT
- Cube 1
- Curved Video Viewer
- dash
- DAY-NIGHT-WEATHER
- dice
- Discord3
- Eagles v1
- eel_add_particles1
- Emote Command
- Emote_Rom
- Emotes
- Explosion Sprites
- Fire
- Fog
- Forest
- FOTV
- Framed Image v1.0
- Free Camera
- Game Timer
- generate monstera V1
- Glow Dust
- Grass_V1
- Grass_V3
- Grid Floor (v1, v2)
- GroupieV1
- Healing Aura
- Health
- hexagonal_test
- hover-cursor-test
- HP-eliza-2-1-app_1
- HyperBeacon
- HyperPortal (+ Set variants)
- JUKEBOX_UI
- Jumping Frog
- Launchpad
- Locationator
- Loot (+ Planet variants)
- m2-2-4-beacon-dev
- Machine Gun v8
- Mato Pets / Mato Pet v2
- MINI-Nuke / MINI-NukePORTAL
- Mob - Skelly
- Model
- monkey_head
- MoonJump
- NEON_1 / NEON_2
- Networked Grabbable
- Notifications
- NPC / NPC_Prisoner
- PAY TO ENTER DOOR
- Physics - Contacts & Tags
- Physics - Raycast Tags
- Physics - Triggers & Tags
- PingScriptFORcompanion
- place
- Platforms
- PlayerTag-UInew
- Player Transforms
- position
- Prism
- PvE Sword
- PVPblasterLATEST
- PvP Core (with spawns)
- QuestItemBasic / QuestItemUI
- Rain / RainV3 / RainV4
- Raptor_random_loc
- Raycaster
- Rocket(Global+Coll)
- Rocket Launcher V3
- rom2
- ROOMERS4
- Rover (+ variants)
- saori-2-5-trump-agent
- Screen / Screen UI link section
- Seat v2
- show chart
- SimonSaysBoard / SimonSays_Screen
- SITING POSITION
- Smoke
- SmolWrld
- Solar Panel
- spawn
- SpeedTrail v0.1
- SPICEX Portal
- SplinePineV1
- SS3
- Super Run
- TEIL2
- Teleport Command
- Teleport Trigger Box
- testcube
- test_level
- Text (link option)
- TOKEN GATE
- Tornado
- TriggerZone
- uiImage from File
- Vanguard
- Video Channel Changer
- VideoPlayer
- Video with player UI
- Wall Hang
- Water Fountain
- Water Plane
- Weapon Animation Override
- Weightpaint_ScreenUI_test1
- who there
- Wolf Maro

</details>

## Usage

**Browse apps:**
```bash
# View V1 app structure
cat v1/hyperfy-alert/app.json

# View V2 app script
cat "v2/apps/Fire/index.js"

# View V2 app config
cat "v2/apps/Fire/Fire.json"
```

**Extract new .hyp files:**
```bash
npm install
node extract-hyp.mjs v2-hyp/NewApp.hyp --project v2
# Or extract all:
node extract-hyp.mjs v2-hyp --project v2
```

**Import to Hyperfy world:**
```bash
# Copy .hyp file to your world's apps folder
cp v2-hyp/Fire.hyp ~/hyperfy/worlds/myworld/apps/
```

## .hyp Format

Binary format bundling blueprint + assets:
```
[4 bytes: header size (uint32 LE)]
[JSON header: blueprint + asset manifest]
[asset data concatenated]
```

See: [.hyp format spec](https://github.com/hyperfy-xyz/hyperfy/blob/main/docs/hyp-format.md)

## Sources

- **V1 Apps**: Extracted from Hyperfy V1 world exports (2023-2026)
- **V2 Apps**: Collected from Hyperfy Discord `#share-your-apps` channel (January 2026)

## References

- [Hyperfy Docs](https://github.com/hyperfy-xyz/hyperfy/tree/main/docs)
- [Script SDK Reference](https://github.com/hyperfy-xyz/hyperfy/blob/main/docs/scripting/README.md)
- [World Projects Guide](https://github.com/hyperfy-xyz/hyperfy/blob/main/docs/World-projects.md)
---

*Part of the Hyperfy Digital Preservation Project*
