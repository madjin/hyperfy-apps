# Data Structures

JSON schemas and data formats used in the archive.

## World Object (V1)

```json
{
  "id": "world-915",
  "title": "World Name",
  "slug": "optional-slug",
  "ownerId": "internal_id",
  "entities": "[...]"  // JSON string - parse separately
}
```

**Note:** `entities` field is double-encoded JSON (string within JSON)

## Entity Object (V1)

```json
{
  "uid": "ZhkPypJkL6a9xqSzZI818",
  "id": "hyperfy-model",
  "version": 9,
  "position": [0, 5, 0],
  "rotation": [0, 0, 0, "YXZ"],
  "state": {
    "$fields": {
      "src": {"name": "model.glb", "url": "https://data.hyperfy.xyz/..."},
      "collision": true,
      "scale": 1
    }
  }
}
```

## Manifest Entry (JSONL)

```json
{
  "url": "https://data.hyperfy.xyz/uploads/hash.glb",
  "hash": "abc123...",
  "ext": "glb",
  "refs": [{"world": "world-915", "entity": "uid123", "path": "src.url"}]
}
```

## Owner Map Entry

```json
{
  "wallet": "0x...",
  "world_ids": ["world-1", "world-2"],
  "asset_urls": ["https://..."]
}
```

## Conversion Stats (_stats.json)

Written by converter to each world folder for subprocess integration:

```json
{
  "world_id": "world-1004",
  "title": "My Gallery",
  "slug": "awesome-gallery",
  "folder": "awesome-gallery",
  "status": "success",
  "imported_entities": 23,
  "imported_blueprints": 12,
  "copied_assets": 67,
  "missing_assets": 5,
  "entity_errors": 0,
  "has_grid": false,
  "has_custom_sky": true,
  "entity_types": {
    "hyperfy-model": 12,
    "hyperfy-image": 8,
    "hyperfy-text": 2,
    "hyperfy-seat": 1
  },
  "unhandled_types": {
    "audio-reactive": 2,
    "particles": 1
  },
  "failure_log": []
}
```

## V2 Blueprint (in db.sqlite)

```json
{
  "id": "VEjLDxRNVF",
  "version": 0,
  "name": "Place: Tower1",
  "model": "asset://ee6b51046a...glb",
  "script": "asset://f091d3223d...js",
  "props": {"name": "Tower1"},
  "preload": false,
  "public": false,
  "locked": false,
  "unique": false,
  "scene": false,
  "disabled": false
}
```

## .hyp File Format

Binary format bundling blueprint + assets:

```
[4 bytes: header size (uint32 LE)]
[JSON header blob]
[asset 1 data]
[asset 2 data]
...
```

### Header Structure

```json
{
  "blueprint": {
    "id": "unique-id",
    "version": 3,
    "name": "App Name",
    "model": "asset://hash.glb",
    "script": "asset://hash.js",
    "sky": "asset://hash.png",
    "hdr": "asset://hash.hdr",
    "props": {}
  },
  "assets": [
    {"type": "model", "url": "asset://hash.glb", "size": 1234, "mime": "model/gltf-binary"},
    {"type": "script", "url": "asset://hash.js", "size": 567, "mime": "application/javascript"}
  ]
}
```

## Data Files Location

| File | Description |
|------|-------------|
| `23-01-2026.json` | Master world snapshot (1,982 worlds) |
| `manifests/hyperfy.jsonl` | Hyperfy-hosted asset manifest (18,503 URLs) |
| `manifests/external.jsonl` | External asset manifest (3,647 URLs) |
| `owner_map.json` | World to wallet owner mapping |
| `worlds/*.json` | Individual world files (split) |
| `hyperfy/worlds/*/` | Converted V2 worlds |

## Key Relationships

- Token ID = World ID (e.g., token 915 = world-915)
- 36 named worlds (aurora, forest, etc.) are system/unowned
- Assets use content hashes - deduplicated automatically
- ~37% of assets use URL-based fallback naming (`url_{hash[:16]}.ext`)
