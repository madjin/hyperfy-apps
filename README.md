# Hyperfy Apps Archive

A collection of Hyperfy virtual world apps from both V1 (React SDK) and V2 (Script SDK) platforms, preserved for reference and potential reuse.

## Overview

Hyperfy apps are interactive objects, tools, and experiences that can be placed in virtual worlds. This repository contains apps from two major platform versions:

- **V1**: React-based apps using the legacy Hyperfy SDK (2021-2023)
- **V2**: Script-based apps using `.hyp` format with the modern Hyperfy SDK (2023-2026)

## Repository Structure

```
hyperfy-apps/
├── v1/          # 40 V1 React apps (app.json + index.js)
├── v2/          # 15 V2 .hyp blueprint files
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

## V2 Apps (.hyp Format)

**Count:** 15 apps
**Format:** Binary `.hyp` files containing blueprint + assets

V2 apps use the modern Hyperfy `.hyp` binary format, which bundles a blueprint definition with embedded assets. See [.hyp format documentation](https://docs.hyperfy.xyz/docs/hyp-format/) for technical details.

### .hyp File Format

```
[4 bytes: header size (uint32 LE)]
[JSON header with blueprint + asset manifest]
[asset 1 binary data]
[asset 2 binary data]
...
```

**Header structure:**
```json
{
  "blueprint": {
    "id": "unique-id",
    "version": 3,
    "name": "App Name",
    "model": "asset://hash.glb",
    "script": "asset://hash.js",
    "props": { /* configurable properties */ }
  },
  "assets": [
    {"type": "model", "url": "asset://hash.glb", "size": 1234, "mime": "model/gltf-binary"},
    {"type": "script", "url": "asset://hash.js", "size": 567, "mime": "application/javascript"}
  ]
}
```

### V2 Apps in This Archive

| App | Description |
|-----|-------------|
| Avatar Station - fixed.hyp | VRM avatar selection station |
| BasicMp3Player.hyp | Audio player for MP3 files |
| Discord3.hyp | Discord integration |
| Emotes.hyp | Player emote system |
| Grid*.hyp (4 variants) | Grid floor options |
| HyperPortal - fixed.hyp | Portal/teleport system |
| Platforms.hyp | Platform mechanics |
| sit.hyp | Sitting/seat functionality |
| Text.hyp | 3D text display |
| TriggerZone.hyp | Invisible trigger areas |
| VideoPlayer.hyp | Video playback |
| WaterPlane.hyp | Water surface shader |

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

V2 `.hyp` files can be used directly in modern Hyperfy worlds:

**To inspect a .hyp file:**
```python
import struct, json

with open('v2/Text.hyp', 'rb') as f:
    header_size = struct.unpack('<I', f.read(4))[0]
    header = json.loads(f.read(header_size))
    print(json.dumps(header, indent=2))
```

**To use in Hyperfy v7+:**
1. Copy `.hyp` file to your world's app collection
2. Place app in world via editor
3. Configure properties as needed

## Reference Documentation

- **Hyperfy Main Docs**: https://docs.hyperfy.xyz/
- **Quick Start Guide**: https://docs.hyperfy.xyz/docs/quick-start/
- **.hyp Format Spec**: https://docs.hyperfy.xyz/docs/hyp-format/
- **GitHub Docs**: https://github.com/hyperfy-xyz/hyperfy/tree/main/docs

## Source

These apps were archived from:
- **V1 Apps**: Extracted from Hyperfy V1 world archives (2026-01-23 snapshot)
- **V2 Apps**: Collected from various Hyperfy V2 world exports and community sources

Original source repositories:
- Hyperfy Archive Project: `/home/jin/repo/hyperfy-archive/sunset/`
- V1 apps: `sunset/v1_apps/`
- V2 apps: `sunset/v2_apps/`, `sunset/hyperfy/src/world/collections/default/`

## Notes

- **macOS Artifacts Removed**: `__MACOSX/` folders and `.DS_Store` files have been cleaned from this repository
- **Asset Links**: Some V1 apps reference external assets via URLs that may no longer be accessible
- **Incomplete Coverage**: This is not an exhaustive collection of all Hyperfy apps ever created
- **No Warranty**: Apps are preserved as-is for archival purposes

## Contributing

To add apps to this collection:

1. **V1 Apps**: Place in `v1/{app-id}/` with `app.json` + `index.js`
2. **V2 Apps**: Place `.hyp` files in `v2/`
3. Update this README if adding significant new categories

## License

Apps may have varying licenses. Check individual app directories for license information. This collection is maintained for preservation and educational purposes.

---

*Part of the Hyperfy Digital Preservation Project*
