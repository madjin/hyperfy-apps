# Hyperfy Apps Archive

A collection of Hyperfy virtual world apps from both V1 (React SDK) and V2 (Script SDK) platforms, preserved for reference and potential reuse.

## Overview

Hyperfy apps are interactive objects, tools, and experiences that can be placed in virtual worlds. This repository contains apps from two major platform versions:

- **V1**: React-based apps using the legacy Hyperfy SDK (2021-2023)
- **V2**: Script-based apps in extracted, human-readable format (2023-2026)

## Repository Structure

```
hyperfy-apps/
├── v1/              # 40 V1 React apps (app.json + index.js)
├── v2/              # 14 V2 apps in extracted format (human-readable)
│   ├── apps/        # Individual app folders (app.json + index.js)
│   └── assets/      # Shared assets (models, textures, videos, etc.)
├── v2-hyp/          # Original V2 .hyp binary files (for reference)
├── extract-hyp.mjs  # Tool to extract .hyp files
├── package.json
└── README.md
```

## V1 Apps (React SDK)

**Count:** 40 apps
**Format:** Directory per app with `app.json`, `index.js`, and assets

V1 apps were built using React and the legacy Hyperfy SDK. Each app is a self-contained directory with:

```
hyperfy-alert/
├── app.json      # App metadata (id, name, description, category)
├── index.js      # React component using Hyperfy hooks
├── assets/       # Models, textures, sounds
└── src/          # Additional source files (optional)
```

### V1 App Structure

**app.json:**
```json
{
  "id": "hyperfy-alert",
  "name": "Alert",
  "description": "Display alerts to players",
  "image": "image.png",
  "category": "tool",
  "public": true
}
```

**index.js:**
- React component using Hyperfy hooks: `useFields`, `useSignal`, `useWorld`, etc.
- Declarative 3D scene with `<app>`, `<rigidbody>`, `<mesh>`, etc.
- Event handling with signals and world interactions

### Notable V1 Apps

| App | Category | Description |
|-----|----------|-------------|
| hyperfy-avatars | Avatar | VRM avatar system |
| hyperfy-camera | Tool | Camera controls and perspectives |
| hyperfy-combat-* | Game | Combat system (health, melee, modifiers) |
| hyperfy-emote | Social | Player emotes and animations |
| hyperfy-guestbook | Social | Visitor messages and signatures |
| hyperfy-keypad | Puzzle | Interactive keypad with codes |
| hyperfy-mirror | Utility | Reflection mirror |
| hyperfy-npc | Interactive | Non-player character system |
| hyperfy-particles | Visual | Particle effects |
| hyperfy-terrain | World | Procedural terrain generation |

**Special folders:**
- `fixtures/`: Core V1 entity types (audio, image, text, video, sky, fog, etc.) - 24 basic building blocks
- `emotes/`: Mixamo-based animation library

### V1 Platform Status

⚠️ **Legacy Platform** - Hyperfy V1 was sunset in 2026. These apps are preserved for:
- Historical reference
- Code examples and patterns
- Potential migration to V2
- Understanding V1 world archives

## V2 Apps (Extracted Format)

**Count:** 14 apps
**Format:** Extracted human-readable format (`app.json` + `index.js` + assets)

V2 apps use modern JavaScript with the Hyperfy Script SDK. This archive stores them in extracted format for easy browsing, editing, and version control.

### V2 App Structure

```
v2/
├── apps/
│   └── Text (link option)/
│       ├── Text (link option).json    # App metadata and props
│       └── index.js                   # App script (ES6 module)
└── assets/
    ├── Text (link option).glb         # 3D model
    └── Text (link option)__image.png  # Thumbnail
```

**Example app.json:**
```json
{
  "author": "Hyperfy",
  "desc": "Added link option",
  "model": "assets/Text (link option).glb",
  "image": {
    "url": "assets/Text (link option)__image.png"
  },
  "props": {
    "text": "Enter text...",
    "size": 24,
    "color": "white",
    "align": "center"
  },
  "scriptFormat": "module"
}
```

**Example index.js:**
```javascript
export default function main(world, app, fetch, props, setTimeout) {
  app.configure([
    {
      key: 'text',
      type: 'textarea',
      label: 'Text',
    },
    {
      key: 'size',
      type: 'number',
      label: 'Size',
      initial: 12,
    },
    // ... more prop configurations
  ])

  // App logic here
}
```

### V2 Apps in This Archive

| App | Description |
|-----|-------------|
| $scene | Scene/world environment settings |
| Avatar Station | VRM avatar selection station |
| BasicMp3Player | Audio player for MP3 files |
| Discord3 | Discord integration |
| Emote Command | Player emote system |
| Grid Floor (3 variants) | Grid floor options |
| HyperPortal | Portal/teleport system |
| Platforms | Platform mechanics |
| SITING POSITION | Sitting/seat functionality |
| Text (link option) | 3D text display with link support |
| TriggerZone | Invisible trigger areas |
| VideoPlayer | Video playback |
| Water Plane | Water surface shader |

### V2 Platform Status

✅ **Current Platform** - Hyperfy V2 (v7+) is the active platform as of 2026.

## Usage

### Working with V1 Apps

V1 apps require the legacy Hyperfy platform, which is no longer actively supported. To explore:

```bash
# View app metadata
cat v1/hyperfy-alert/app.json

# Read React component
cat v1/hyperfy-alert/index.js

# Explore assets
ls v1/hyperfy-alert/assets/
```

For migration to V2, you'll need to:
1. Rewrite React component as V2 script (JavaScript with Hyperfy script API)
2. Package assets and script into `.hyp` format
3. Test in Hyperfy v7+

### Working with V2 Apps

V2 apps are stored in extracted, human-readable format for easy browsing on GitHub:

**To browse apps:**
```bash
# View app metadata
cat v2/apps/Text\ \(link\ option\)/Text\ \(link\ option\).json

# Read app script
cat v2/apps/Text\ \(link\ option\)/index.js

# View shared assets
ls v2/assets/
```

**To use in Hyperfy v7+:**

Option 1: Package as .hyp (requires Hyperfy SDK build tools - not included here)

Option 2: Use original .hyp files:
```bash
# Original .hyp binaries are in v2-hyp/ for reference
ls v2-hyp/
```

**To re-extract .hyp files (if you add new ones):**

```bash
# Install dependencies (one-time)
npm install

# Extract all .hyp files from v2-hyp/ to v2/
node extract-hyp.mjs v2-hyp --project v2

# Or extract a specific file
node extract-hyp.mjs v2-hyp/NewApp.hyp --project v2
```

### Understanding .hyp Format

The original `.hyp` files (in `v2-hyp/`) use a binary format:

```
[4 bytes: header size (uint32 LE)]
[JSON header with blueprint + asset manifest]
[asset 1 binary data]
[asset 2 binary data]
...
```

This format bundles everything (metadata, script, models, textures) into a single portable file. The extracted format splits this into separate files for better readability and version control.

## Extraction Tool

This repo includes `extract-hyp.mjs`, which extracts `.hyp` files into editable components:

**Usage:**
```bash
node extract-hyp.mjs [input] [--project outputDir]

# Examples:
node extract-hyp.mjs v2-hyp                    # Extract all in v2-hyp/
node extract-hyp.mjs v2-hyp/Text.hyp           # Extract single file
node extract-hyp.mjs v2-hyp --project v2       # Extract to v2/
```

**What it does:**
- Reads binary `.hyp` file
- Extracts JSON header (blueprint metadata)
- Extracts embedded assets (models, textures, scripts)
- Writes `app.json` with metadata and props
- Writes `index.js` with app script
- Writes assets to shared `assets/` directory
- Ensures proper ES6 module wrapper signature

**Supported asset types:**
- 3D models: `.glb`, `.gltf`, `.vrm`
- Images: `.png`, `.jpg`, `.webp`, `.avif`, `.gif`, `.svg`, `.ktx2`
- Videos: `.mp4`, `.webm`
- Audio: `.mp3`, `.ogg`, `.wav`, `.aac`, `.m4a`
- Scripts: `.js`
- Fonts: `.ttf`, `.otf`, `.woff`, `.woff2`

## Reference Documentation

- **Hyperfy Main Docs**: https://docs.hyperfy.xyz/
- **Quick Start Guide**: https://docs.hyperfy.xyz/docs/quick-start/
- **.hyp Format Spec**: https://docs.hyperfy.xyz/docs/hyp-format/
- **GitHub Docs**: https://github.com/hyperfy-xyz/hyperfy/tree/main/docs

## Source

These apps were archived from:
- **V1 Apps**: Extracted from Hyperfy V1 world archives (2026-01-23 snapshot)
- **V2 Apps**: Collected from Hyperfy V2 world exports, SDK examples, and community sources

Original source repositories:
- Hyperfy Archive Project: `/home/jin/repo/hyperfy-archive/sunset/`
- V1 apps: `sunset/v1_apps/`
- V2 apps: `sunset/v2_apps/`, `sunset/hyperfy/src/world/collections/default/`

## Notes

- **macOS Artifacts Removed**: `__MACOSX/` folders and `.DS_Store` files have been cleaned from this repository
- **Extracted Format**: V2 apps are stored in extracted format (not binary .hyp) for better git diffs and human readability
- **Asset Deduplication**: Shared assets in `v2/assets/` are referenced by multiple apps
- **Incomplete Coverage**: This is not an exhaustive collection of all Hyperfy apps ever created
- **No Warranty**: Apps are preserved as-is for archival purposes

## Contributing

To add apps to this collection:

1. **V1 Apps**: Place in `v1/{app-id}/` with `app.json` + `index.js`
2. **V2 Apps**:
   - Add `.hyp` file to `v2-hyp/`
   - Run: `node extract-hyp.mjs v2-hyp/NewApp.hyp --project v2`
   - Commit both the .hyp (in `v2-hyp/`) and extracted format (in `v2/`)
3. Update this README if adding significant new categories

## License

Apps may have varying licenses. Check individual app directories for license information. This collection is maintained for preservation and educational purposes.

---

*Part of the Hyperfy Digital Preservation Project*
