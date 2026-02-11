# BasicMp3Player.hyp

## Metadata
- **Author**: Valiant
- **Channel**: #🎨│showcase
- **Date**: 2026-01-09
- **Size**: 9,900 bytes

## Discord Context
> ultra basic mp3 player. upload or url for loading mp3 files. uses basic hyperfy glb cube so no jazz...visually.

## Blueprint
- **Name**: BasicMp3Player
- **Version**: 1
- **Model**: `asset://97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb`
- **Script**: `asset://a276e39910c30508250f5ba2429bb4943169413137f1e9b24e440f2359b920fc.js`

## Props
- `collision`: bool = `True`
- `url`: str = ``
- `loop`: bool = `True`
- `volume`: int = `1`
- `spatial`: bool = `True`
- `distance`: int = `10`
- `rolloff`: int = `3`
- `global`: bool = `True`
- `autoPlayUploaded`: bool = `True`

## Assets
- `[model]` 97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb (3,380 bytes)
- `[script]` a276e39910c30508250f5ba2429bb4943169413137f1e9b24e440f2359b920fc.js (2,640 bytes)
- `[texture]` 39ad1b405cbf41a90825dadf0b554f3c3baba634636bb94a1057dd8ec0784c86.png (2,777 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`
**World Methods**: `world.chat()`
**Nodes Created**: `audio`

## Keywords (for Discord search)
allowed, audio, author, auto, autoPlayUploaded, before, bigStep, boolean, browsers, chat, check, children, click, clickable, client, configure, create, cursor, default, exists

## Script Source
```javascript
/**
 * Minimal clickable MP3 player (client-side)
 *
 * @author Valiant
 * @license MIT
 * Copyright (c) 2026 Valiant
 *
 * - Either upload a file (plays by default), or paste a URL
 * - Click the first mesh in the GLB to play/pause
 */

app.configure([
  { key: 'file', type: 'file', kind: 'audio', label: 'Audio File (upload)' },
  { key: 'url', type: 'text', label: 'Audio URL (mp3)', placeholder: 'https://.../file.mp3' },

  { key: 'volume', type: 'number', label: 'Volume', dp: 2, step: 0.1, bigStep: 1, initial: 1 },
  { key: 'loop', type: 'toggle', label: 'Loop', initial: true },
  { key: 'global', type: 'toggle', label: 'Global (non-spatial)', initial: true },

  { key: 'autoPlayUploaded', type: 'toggle', label: 'Auto-play uploaded file', initial: true },
]);

function findFirstMesh(root) {
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    if (n && n.name === 'mesh') return n;
    if (n && n.children) for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]);
  }
  return null;
}

function getSrc() {
  // Prefer uploaded file if present; else URL text
  const fileUrl = props.file?.url ? String(props.file.url).trim() : '';
  if (fileUrl) return fileUrl;

  const url = props.url ? String(props.url).trim() : '';
  return url;
}

let sound;
let playing = false;

if (world.isClient) {
  const target = findFirstMesh(app);
  if (target) target.cursor = 'pointer';

  const src = getSrc();

  sound = app.create('audio', {
    src,
    volume: props.volume ?? 1,
    loop: !!props.loop,
    spatial: props.global ? false : true,
    group: 'music',
  });
  app.add(sound);

  // Attempt auto-play if an uploaded file exists.
  // Note: browsers may still require a user gesture before audio is allowed.
  const hasUploaded = !!props.file?.url;
  if (hasUploaded && props.autoPlayUploaded) {
    const p = sound.play?.();
    if (p && p.catch) p.catch(() => {});
    playing = true;
  }

  if (target) {
    target.onPointerDown = () => {
      if (typeof app.isMoving === 'boolean' && app.isMoving) return;

      const srcNow = getSrc();
      if (!srcNow) {
        world.chat({ text: 'mp3: set URL or upload a file in props.' }, false);
        return;
      }

      if (sound.src !== srcNow) {
        sound.src = srcNow;
        playing = false;
      }

      if (!playing) {
        const p = sound.play?.();
        if (p && p.catch) p.catch(() => {});
        playing = true;
      } else {
        sound.pause?.();
        playing = false;
      }
    };
  } else {
    world.chat({ text: 'mp3: no mesh found to click (check your GLB has a mesh).' }, false);
  }
}

```

---
*Extracted from BasicMp3Player.hyp. Attachment ID: 1459296313333121024*