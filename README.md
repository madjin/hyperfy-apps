# Hyperfy Apps Archive

Archive of Hyperfy virtual world apps preserved in human-readable format for reference and preservation.

## Structure

```
hyperfy-apps/
├── v1/              # 40 V1 React-based apps (legacy platform)
├── v2/              # ~200 V2 apps (extracted, human-readable)
│   └── <slug>/      # Each app: blueprint JSON + index.js + assets/
├── v2-hyp/          # 174 original .hyp binary files
└── package.json
```

## V1 Apps (Legacy)

40 React-based apps from the legacy Hyperfy SDK (2023-2026). Each directory contains `app.json`, `index.js`, and assets.

**Notable:** Core V1 entity apps are now in the `v1/` root (sky, fog, audio, image, text, spawn, portal, etc.).

## V2 Apps (Current)

158 modern JavaScript apps using the Hyperfy Script SDK, collected from the Hyperfy Discord community.

### By Category

| Category | Apps |
|----------|------|
| **Core/World** | $scene, spawn, position, avatar-station, HyperPortal (3 variants) |
| **Media** | BasicMp3Player, VideoPlayer, video-with-player-ui, video-channel-changer, 360-video-viewer, 360Player_Mono, curved-video-viewer, Boombox, JUKEBOX_UI, Screen (2 variants) |
| **Vehicles** | car, car1, dash, Rover (3 variants) |
| **NPCs/AI** | NPC, NPC_Prisoner, companion-v8, mato-pets, mato-pet-v2, wolf-maro, GroupieV1 |
| **Creatures** | Butterfly Swarm (v1-v6 + Hyperfly editions), bats-v1, eagles-v1, jumping-frog, Raptor_random_loc |
| **Particles/Effects** | Fire, Smoke, Fog, Rain (3 versions), Snow, Tornado, Fireflies, glow-dust, explosion-sprites, confettt-ppot, SpeedTrail, eel_add_particles1 |
| **Environment** | water-plane, water-fountain, DAY-NIGHT-WEATHER, Alien_Planet, Forest, MoonJump, solar-panel |
| **Plants** | Amanita, bending_leaf_V1, generate-monstera-v1, Grass (v1, v3), SplinePineV1 |
| **Combat/PvP** | machine-gun-v8, PVPblasterLATEST, pve-sword, pvp-core-with-spawns, rocket-launcher-v3, Health, Loot (3 variants), mob-skelly, healing-aura, MINI-Nuke |
| **Camera** | camera-trigger, camera-manager (2 variants), camera-laser, free-camera, Raycaster, cam-raycast-action-bar |
| **Movement** | Launchpad, teleport-command, teleport-trigger-box, super-run, wall-hang |
| **Interaction** | networked-grabbable, token-gate, pay-to-enter-door, dice, book-flip, SimonSays (2 variants) |
| **UI** | text-link-option, framed-image-v1.0, uiimage-from-file, PlayerTag-UInew, Notifications, game-timer, QuestItemUI, show-chart |
| **Building** | grid-floor (2 variants), builder-drone (2 variants), cube-1, Prism, testcube, hexagonal_test |
| **Utilities** | place, TriggerZone, HyperBeacon, Locationator, Emotes (4 variants), Seat v2, siting-position |
| **Physics** | physics-contacts-tags, physics-raycast-tags, physics-triggers-tags, anybox |
| **Worlds** | SmolWrld, ROOMERS4, test_level, TEIL2 |

### Full App List

<details>
<summary>All 158 V2 Apps (click to expand)</summary>

- $scene
- 360-video-viewer
- 360Player_Mono
- AlleySign
- Amanita
- anybox
- ArrayVectorProps
- avatar-station
- BasicMp3Player
- bats-v1
- bending_leaf_V1
- book-flip
- Boombox
- broke-rom
- builder-drone
- builder-drone-x501
- butterfly-swarm-v1-V6 (+ Hyperfly editions)
- camera-laser
- camera-manager
- camera-manager-test
- camera-trigger
- cam-raycast-action-bar
- car
- car1
- companion-v8
- confettt-ppot
- cube-1
- curved-video-viewer
- dash
- DAY-NIGHT-WEATHER
- dice
- Discord3
- eagles-v1
- eel_add_particles1
- emote-command
- Emote_Rom
- Emotes
- explosion-sprites
- Fire
- Fog
- Forest
- FOTV
- framed-image-v1.0
- free-camera
- game-timer
- generate-monstera-v1
- glow-dust
- Grass_V1
- Grass_V3
- grid-floor (v1, v2)
- GroupieV1
- healing-aura
- Health
- hexagonal_test
- hover-cursor-test
- HP-eliza-2-1-app_1
- HyperBeacon
- HyperPortal (+ Set variants)
- JUKEBOX_UI
- jumping-frog
- Launchpad
- Locationator
- Loot (+ Planet variants)
- m2-2-4-beacon-dev
- machine-gun-v8
- mato-pets / mato-pet-v2
- MINI-Nuke / MINI-NukePORTAL
- mob-skelly
- Model
- monkey_head
- MoonJump
- NEON_1 / NEON_2
- networked-grabbable
- Notifications
- NPC / NPC_Prisoner
- pay-to-enter-door
- physics-contacts-tags
- physics-raycast-tags
- physics-triggers-tags
- PingScriptFORcompanion
- place
- Platforms
- PlayerTag-UInew
- player-transforms
- position
- Prism
- pve-sword
- PVPblasterLATEST
- pvp-core-with-spawns
- QuestItemBasic / QuestItemUI
- Rain / RainV3 / RainV4
- Raptor_random_loc
- Raycaster
- rocket-global-coll
- rocket-launcher-v3
- rom2
- ROOMERS4
- Rover (+ variants)
- saori-2-5-trump-agent
- Screen / screen-ui-link-section
- Seat v2
- show-chart
- SimonSaysBoard / SimonSays_Screen
- siting-position
- Smoke
- SmolWrld
- solar-panel
- spawn
- speedtrail-v0.1
- spicex-portal
- SplinePineV1
- SS3
- super-run
- TEIL2
- teleport-command
- teleport-trigger-box
- testcube
- test_level
- text-link-option
- token-gate
- Tornado
- TriggerZone
- uiimage-from-file
- Vanguard
- video-channel-changer
- VideoPlayer
- video-with-player-ui
- wall-hang
- water-fountain
- water-plane
- weapon-animation-override
- Weightpaint_ScreenUI_test1
- who-there
- wolf-maro

</details>

## Usage

**Browse apps:**
```bash
# View V1 app structure
cat v1/hyperfy-alert/app.json

# View V2 app script
cat "v2/fire/index.js"

# View V2 app config
cat "v2/fire/Fire.json"
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
