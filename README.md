# Hyperfy Apps Archive

Archive of Hyperfy virtual world apps preserved in human-readable format for reference and preservation.

## Structure

```
hyperfy-apps/
├── v1/              # 40 V1 React-based apps (legacy platform, sunset 2023-2026)
├── v2/              # 158 V2 Script SDK apps (current platform, extracted format)
│   ├── apps/        # App definitions (.json + index.js per app)
│   └── assets/      # Shared assets (models, textures, scripts, etc.)
├── v2-hyp/          # 174 original .hyp binary files
├── extract-hyp.mjs  # Extraction tool
└── package.json
```

## V1 Apps (Legacy)

React-based apps using legacy Hyperfy SDK. Each directory contains `app.json`, `index.js`, and assets.

**Notable:** `fixtures/` folder has 24 core V1 entity types (sky, fog, audio, image, text, etc.)

## V2 Apps (Current)

158 modern JavaScript apps using Hyperfy Script SDK, extracted from .hyp files shared in the Hyperfy Discord.

### Categories

| Category | Apps |
|----------|------|
| **Core** | $scene, Avatar Station, spawn, HyperPortal, TriggerZone |
| **Media** | BasicMp3Player, VideoPlayer, 360 Video Viewer, Boombox, Jukebox |
| **Vehicles** | car, car1-v2, Rover, dash |
| **NPCs/Creatures** | Mato Pets, Companion, Butterfly Swarm (v1-v6), Bats |
| **Effects** | Fire, Smoke, Water Fountain, Rain (v1-v4), Fireflies, Snow |
| **Environment** | Water Plane, Day Night Weather, Alien Planet, MoonJump |
| **Interaction** | Networked Grabbable, TOKEN GATE, PAY TO ENTER DOOR, dice |
| **Combat** | Machine Gun, Health, Loot |
| **Camera** | Camera Trigger, Camera Manager, Free Camera, Raycaster |
| **UI** | Text, Grid Floor, Framed Image, uiImage from File |
| **Utilities** | Builder Drone, HyperBeacon, place |

## Usage

**Browse apps:**
```bash
# View V1 app
cat v1/hyperfy-alert/app.json

# View V2 app
cat v2/apps/Text\ \(link\ option\)/index.js
cat v2/apps/Text\ \(link\ option\)/Text\ \(link\ option\).json
```

**Extract .hyp files (if adding new V2 apps):**
```bash
npm install
node extract-hyp.mjs v2-hyp --project v2
```

## .hyp Format

Binary format bundling blueprint + assets:
```
[4 bytes: header size (uint32 LE)]
[JSON header: blueprint + asset manifest]
[asset data concatenated]
```

See: [.hyp format spec](https://github.com/hyperfy-xyz/hyperfy/blob/main/docs/hyp-format.md)

## Source

- **V1 Apps**: Extracted from Hyperfy V1 world exports (2023-2026)
- **V2 Apps**: Collected from Hyperfy Discord #share-your-apps channel (January 2026)

## Reference

- **Hyperfy Docs**: https://github.com/hyperfy-xyz/hyperfy/tree/main/docs
- **Script SDK**: https://github.com/hyperfy-xyz/hyperfy/blob/main/docs/scripting/README.md
- **World Projects**: https://github.com/hyperfy-xyz/hyperfy/blob/main/docs/World-projects.md

---

*Part of the Hyperfy Digital Preservation Project*
