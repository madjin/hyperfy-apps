# Hyperfy Apps Archive

Archive of Hyperfy virtual world apps preserved in human-readable format for reference and preservation.

## Structure

```
hyperfy-apps/
├── v1/              # 40 V1 React-based apps (legacy platform, sunset 2023-2026)
├── v2/              # 14 V2 Script SDK apps (current platform, extracted format)
│   ├── apps/        # App definitions (.json + index.js per app)
│   └── assets/      # Shared assets (models, textures, scripts, etc.)
├── v2-hyp/          # Original .hyp binary files
├── extract-hyp.mjs  # Extraction tool
└── package.json
```

## V1 Apps (Legacy)

React-based apps using legacy Hyperfy SDK. Each directory contains `app.json`, `index.js`, and assets.

**Notable:** `fixtures/` folder has 24 core V1 entity types (sky, fog, audio, image, text, etc.)

## V2 Apps (Current)

Modern JavaScript apps using Hyperfy Script SDK, stored in extracted format for git-friendly browsing.

| App | Description |
|-----|-------------|
| $scene | Scene/world environment settings |
| Avatar Station | VRM avatar selection |
| BasicMp3Player | MP3 audio player |
| Discord3 | Discord integration |
| Emote Command | Player emotes |
| Grid Floor (variants) | Grid floors |
| HyperPortal | Portal system |
| Platforms | Platform mechanics |
| SITING POSITION | Seat functionality |
| Text (link option) | 3D text with links |
| TriggerZone | Invisible triggers |
| VideoPlayer | Video playback |
| Water Plane | Water shader |

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

Archived from Hyperfy V1/V2 world exports and SDK examples (January 2026).

## Reference

- **Hyperfy Docs**: https://github.com/hyperfy-xyz/hyperfy/tree/main/docs
- **Script SDK**: https://github.com/hyperfy-xyz/hyperfy/blob/main/docs/scripting/README.md
- **World Projects**: https://github.com/hyperfy-xyz/hyperfy/blob/main/docs/World-projects.md

---

*Part of the Hyperfy Digital Preservation Project*
