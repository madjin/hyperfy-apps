# Research Tools

Finding V2 patterns and reference implementations before porting new entity types.

## Research Priority Order

1. **Plan A**: Search daily summaries (394 days of md/json in ai-news repo)
2. **Plan B**: Check .hyp file index (extracted from Discord sqlite)
3. **Plan C**: Search raw Discord logs (sqlite with full message context)

## Step 1: Search Daily Summaries (Plan A)

AI-generated daily summaries of Hyperfy Discord activity:

```bash
# Quick grep search
grep -ri "keyword" /home/jin/repo/ai-news/gh-pages-deploy/hyperfy/md/

# Or use unified search tool
uv run python scripts/research/search_research.py "seat script"
```

## Step 2: Check HYP File Index (Plan B)

Searchable index of .hyp files shared on Discord:

```bash
# Extract/update index (run periodically)
uv run python scripts/research/extract_hyp_index.py

# Search by filename, author, or content
uv run python scripts/research/search_research.py --hyp "particle"
uv run python scripts/research/search_research.py --hyp "ashxn"
```

## Step 3: Search Raw Discord (Plan C)

Full-text search of Discord message history:

```bash
uv run python scripts/research/search_research.py --raw "collision"
uv run python scripts/research/search_research.py --raw "rigidbody"
```

## Step 4: Download Reference .hyp Files

Download .hyp files for analysis (requires DISCORD_TOKEN):

```bash
# Download pending files
DISCORD_TOKEN=xxx uv run python scripts/research/download_hyp_files.py --limit 10

# Force re-download
DISCORD_TOKEN=xxx uv run python scripts/research/download_hyp_files.py --force
```

## Step 5: Generate Summaries (Static Analysis)

Unbundle .hyp files and extract blueprints, scripts, and API patterns:

```bash
# Generate summaries for all downloaded .hyp files
uv run python scripts/research/summarize_hyp_files.py

# Force regenerate all
uv run python scripts/research/summarize_hyp_files.py --force
```

Each summary includes:
- Blueprint metadata (name, version, props)
- Full JavaScript source code
- Extracted V2 API patterns (`app.create()`, `world.on()`, etc.)
- Keywords for Discord search (Plan C)

## Step 6: Search Summaries for V2 Patterns

Find reference implementations for specific V2 APIs:

```bash
# Find apps using rigidbody
grep -l "app.create('rigidbody')" research/hyp_summaries/*.md

# Find apps with player events
grep -l "world.on('player" research/hyp_summaries/*.md

# Find spatial audio examples
grep -l "spatial: true" research/hyp_summaries/*.md

# Find teleport examples
grep -l "player.teleport" research/hyp_summaries/*.md

# Find camera control examples
grep -l "control.camera" research/hyp_summaries/*.md
```

## Research Resources

| Resource | Location | Format |
|----------|----------|--------|
| V2 Docs | `hyperfy/docs/scripting/` | Markdown |
| Daily Summaries | `/home/jin/repo/ai-news/gh-pages-deploy/hyperfy/md/` | 394 md files |
| HYP Index | `research/hyp_index.json` | JSON |
| HYP Files | `research/hyp_files/` | .hyp binaries (gitignored) |
| HYP Summaries | `research/hyp_summaries/` | Markdown (gitignored) |
| Raw Discord | `/home/jin/repo/ai-news/gh-pages-deploy/data/hyperfy-discord.sqlite` | SQLite |

## Research Scripts

| Script | Purpose | Requirements |
|--------|---------|--------------|
| `scripts/research/extract_hyp_index.py` | Build .hyp index from Discord | None (stdlib) |
| `scripts/research/search_research.py` | Unified search tool | None (stdlib) |
| `scripts/research/download_hyp_files.py` | Download .hyp files | DISCORD_TOKEN |
| `scripts/research/summarize_hyp_files.py` | Static analysis summaries | None (stdlib) |

## V2 API Patterns to Look For

When researching how to implement a feature, search for these patterns:

### Player Interactions
- `world.on('player-enter', ...)` - Player enters world
- `world.on('player-leave', ...)` - Player leaves world
- `player.teleport(position, yaw)` - Move player
- `player.push(vector)` - Apply force
- `player.applyEffect({emote})` - Play animation

### Object Creation
- `app.create('prim', {...})` - Create primitive shapes
- `app.create('rigidbody')` - Physics body
- `app.create('collider')` - Collision shape
- `app.create('action', {...})` - Clickable action
- `app.create('anchor')` - Attachment point
- `app.create('video', {...})` - Video display
- `app.create('audio', {...})` - Sound source

### State & Networking
- `app.state` - Shared state object
- `app.send(event, data)` - Send to clients
- `app.on(event, handler)` - Receive events
- `world.isServer` / `world.isClient` - Environment check

### Controls
- `app.control()` - Take control input
- `control.camera.write = true` - Take camera
- `control.keyboard.getKey('w')` - Check key state

## Example: Research for New Entity

When adding support for a new V1 entity type:

1. Check what V1 fields exist:
   ```bash
   grep -A 20 '"hyperfy-newtype"' v1_apps/fixtures/hyperfy-newtype/app.json
   ```

2. Search for V2 equivalents:
   ```bash
   grep -ri "newtype\|relevant-feature" research/hyp_summaries/
   ```

3. Look at similar implementations:
   ```bash
   cat research/hyp_summaries/SimilarApp.md
   ```

4. Check V2 docs:
   ```bash
   grep -ri "feature" hyperfy/docs/scripting/
   ```
