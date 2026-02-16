#!/usr/bin/env python3
"""Generate preview images for apps missing previews using OpenRouter image generation.

Uses Google Gemini 3 Pro Image via OpenRouter to generate stylized 16:9 preview
images based on each app's description and tags.

Outputs:
  catalog/generated_previews/{app_id}.png

Inputs:
  catalog/explorer-data.json                 (app list, filter has_preview=false)
  catalog/apps/*/card.json                  (richer description + tags for prompts)
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import random
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
CATALOG_ROOT = REPO_ROOT / "catalog"
EXPLORER_DATA = CATALOG_ROOT / "explorer" / "data" / "explorer-data.json"
GENERATED_DIR = CATALOG_ROOT / "generated_previews"

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_DEFAULT = "google/gemini-3-pro-image-preview"


# Map tags to visual scene descriptions
TAG_SCENE_MAP: dict[str, str] = {
    "particles": "glowing particle effects, embers and light trails floating in the air",
    "vehicle": "a vehicle in motion on stylized terrain with speed trails",
    "combat": "an action scene with projectiles, energy blasts, and dramatic lighting",
    "environment": "an atmospheric landscape with dramatic sky and terrain features",
    "npc": "animated characters or creatures interacting in a virtual scene",
    "ui": "floating holographic interface panels glowing in 3D space",
    "audio": "speakers emitting visible sound waves, a music visualizer aesthetic",
    "media-player": "a floating screen or media display in a virtual environment",
    "animation": "a character performing a dynamic action or emote",
    "physics": "objects in dynamic motion — bouncing, colliding, with motion trails",
    "teleport": "a glowing swirling portal effect with energy rings",
    "building": "a construction scene with placement grids and building blocks",
    "camera": "a cinematic camera view with depth of field and lens effects",
    "3d-model": "a detailed 3D model displayed on a showcase pedestal with rim lighting",
    "interaction": "a player reaching toward a glowing interactive object",
    "multiplayer": "multiple player avatars interacting together in a shared space",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> dict[str, Any] | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def build_scene_hint(tags: list[str], description: str) -> str:
    """Build a tailored scene description from tags."""
    hints = []
    for tag in tags:
        if tag in TAG_SCENE_MAP:
            hints.append(TAG_SCENE_MAP[tag])

    if hints:
        return ". ".join(hints[:3])

    # Fallback: derive from description keywords
    desc_lower = description.lower()
    if any(w in desc_lower for w in ("fire", "flame", "ember", "smoke")):
        return TAG_SCENE_MAP["particles"]
    if any(w in desc_lower for w in ("car", "drive", "vehicle", "fly")):
        return TAG_SCENE_MAP["vehicle"]
    if any(w in desc_lower for w in ("fight", "weapon", "shoot", "combat")):
        return TAG_SCENE_MAP["combat"]

    return "a stylized virtual world environment with interesting geometry and lighting"


def build_prompt(name: str, description: str, tags: list[str]) -> str:
    """Build the image generation prompt for an app."""
    scene_hint = build_scene_hint(tags, description)
    tags_str = ", ".join(tags) if tags else "virtual world"

    return (
        f'Generate a stylized preview image for a virtual world app called "{name}".\n'
        f"\n"
        f"Description: {description}\n"
        f"Tags: {tags_str}\n"
        f"\n"
        f"IMAGE SPECIFICATIONS:\n"
        f"- Aspect ratio: 16:9 widescreen\n"
        f"- Style: Stylized 3D render, dark moody atmosphere with vibrant accent lighting\n"
        f"- Scene: A virtual world environment showing the app in action\n"
        f"- Perspective: Third-person isometric or slightly elevated camera angle\n"
        f"- No text, no UI overlays, no watermarks\n"
        f"\n"
        f"Show the core concept visually: {scene_hint}\n"
        f"\n"
        f"CRITICAL: This is a preview card for an app catalog. "
        f"Make it visually striking and immediately convey what the app does."
    )


def call_openrouter_image(
    prompt: str,
    api_key: str,
    model: str,
    max_retries: int,
) -> tuple[bytes, str]:
    """Call OpenRouter with an image generation prompt. Returns (image_bytes, ext)."""
    site_url = os.environ.get("OPENROUTER_SITE_URL", "")
    site_name = os.environ.get("OPENROUTER_SITE_NAME", "hyperfy-apps")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if site_url:
        headers["HTTP-Referer"] = site_url
    if site_name:
        headers["X-Title"] = site_name

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt},
        ],
        "modalities": ["text", "image"],
    }

    body = json.dumps(payload).encode("utf-8")

    for attempt in range(max_retries + 1):
        req = urllib.request.Request(
            OPENROUTER_URL, data=body, headers=headers, method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                response = json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in {429, 500, 502, 503, 504} and attempt < max_retries:
                sleep_s = min(30, (2 ** attempt) + random.random())
                time.sleep(sleep_s)
                continue
            detail = ""
            try:
                detail = e.read().decode("utf-8", errors="ignore")[:1000]
            except Exception:
                pass
            raise RuntimeError(f"OpenRouter HTTP {e.code}: {detail}")
        except Exception as e:
            if attempt < max_retries:
                sleep_s = min(30, (2 ** attempt) + random.random())
                time.sleep(sleep_s)
                continue
            raise RuntimeError(f"OpenRouter request failed: {e}")

        # Extract image from response
        choices = response.get("choices", [])
        if not choices:
            raise RuntimeError(f"No choices in response: {json.dumps(response)[:500]}")

        message = choices[0].get("message", {})

        def _extract_data_url(url: str) -> tuple[bytes, str]:
            """Extract bytes and mime type from a data: URL."""
            # data:image/jpeg;base64,... or data:image/png;base64,...
            header, b64 = url.split(",", 1) if "," in url else ("", "")
            ext = "jpg" if "jpeg" in header else "png"
            return base64.b64decode(b64), ext

        # OpenRouter returns images in a top-level "images" field on the message
        images = message.get("images", [])
        if images:
            for img in images:
                if isinstance(img, dict) and img.get("type") == "image_url":
                    url = img.get("image_url", {}).get("url", "")
                    if url.startswith("data:"):
                        img_bytes, ext = _extract_data_url(url)
                        return img_bytes, ext

        # Fallback: check content as list of parts
        content = message.get("content", "")
        if isinstance(content, list):
            for part in content:
                if isinstance(part, dict):
                    if part.get("type") == "image_url":
                        url = part.get("image_url", {}).get("url", "")
                        if url.startswith("data:"):
                            img_bytes, ext = _extract_data_url(url)
                            return img_bytes, ext
                    if "inline_data" in part:
                        b64 = part["inline_data"].get("data", "")
                        mime = part["inline_data"].get("mime_type", "")
                        ext = "jpg" if "jpeg" in mime else "png"
                        return base64.b64decode(b64), ext

        raise RuntimeError(
            f"Could not extract image from response: {json.dumps(response)[:500]}"
        )

    raise RuntimeError("Exhausted retries for image generation")  # pragma: no cover


def process_one(
    app: dict[str, Any],
    model: str,
    api_key: str,
    max_retries: int,
    force: bool,
    dry_run: bool,
) -> dict[str, Any]:
    """Generate a preview image for one app."""
    app_id = app["id"]

    # Check for any existing preview (jpg or png)
    existing = list(GENERATED_DIR.glob(f"{app_id}.*"))
    if existing and not force:
        return {"app_id": app_id, "status": "skipped_existing"}

    # Load card.json for richer context
    card_path = CATALOG_ROOT / "apps" / app_id / "card.json"
    card = read_json(card_path)

    name = (card or {}).get("name") or app.get("name", app_id)
    description = (card or {}).get("description") or app.get("description", "")
    tags = (card or {}).get("tags") or app.get("tags", [])

    prompt = build_prompt(name, description, tags)

    if dry_run:
        return {
            "app_id": app_id,
            "status": "dry_run",
            "prompt": prompt,
        }

    img_bytes, ext = call_openrouter_image(prompt, api_key, model, max_retries)

    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    output_path = GENERATED_DIR / f"{app_id}.{ext}"
    output_path.write_bytes(img_bytes)

    size_kb = len(img_bytes) / 1024
    return {
        "app_id": app_id,
        "status": "ok",
        "path": str(output_path),
        "size_kb": round(size_kb, 1),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate preview images for apps missing previews"
    )
    parser.add_argument("--model", default=MODEL_DEFAULT)
    parser.add_argument("--limit", type=int, help="Only process first N apps")
    parser.add_argument(
        "--app-id",
        action="append",
        dest="app_ids",
        help="Only process specific app_id (repeatable)",
    )
    parser.add_argument(
        "--force", action="store_true", help="Regenerate existing previews"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Print prompts without generating"
    )
    parser.add_argument("--max-retries", type=int, default=3)
    parser.add_argument("--concurrency", type=int, default=3)

    args = parser.parse_args()

    if not EXPLORER_DATA.exists():
        print(f"Error: missing {EXPLORER_DATA}")
        print("Run: uv run python scripts/catalog/build_explorer_data.py")
        return 1

    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not args.dry_run and not api_key:
        print("Error: OPENROUTER_API_KEY is required")
        return 1

    explorer = json.loads(EXPLORER_DATA.read_text(encoding="utf-8"))
    all_apps = explorer.get("apps", [])

    # Filter to specific app IDs if given
    if args.app_ids:
        wanted = set(args.app_ids)
        apps = [a for a in all_apps if a["id"] in wanted]
    else:
        # Default: only apps missing previews
        apps = [a for a in all_apps if not a.get("has_preview")]

    if args.limit:
        apps = apps[: args.limit]

    print(f"Apps to generate previews for: {len(apps)}")
    print(f"Model: {args.model}")
    print(f"Dry run: {args.dry_run}")
    print(f"Output dir: {GENERATED_DIR}")

    if not apps:
        print("Nothing to do.")
        return 0

    started = time.time()
    results: list[dict[str, Any]] = []

    with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as ex:
        futures = {
            ex.submit(
                process_one,
                app,
                args.model,
                api_key,
                args.max_retries,
                args.force,
                args.dry_run,
            ): app
            for app in apps
        }

        for fut in as_completed(futures):
            app = futures[fut]
            try:
                res = fut.result()
                results.append(res)
                status = res["status"]
                extra = ""
                if status == "ok":
                    extra = f" ({res.get('size_kb', 0)} KB)"
                elif status == "dry_run":
                    extra = f"\n    Prompt: {res['prompt'][:120]}..."
                print(f"  {res['app_id']}: {status}{extra}")
            except Exception as e:
                err = {"app_id": app.get("id"), "status": "failed", "error": str(e)}
                results.append(err)
                print(f"  {app.get('id')}: FAILED - {e}")

    duration = round(time.time() - started, 2)
    counts = {
        "ok": sum(1 for r in results if r.get("status") == "ok"),
        "skipped_existing": sum(
            1 for r in results if r.get("status") == "skipped_existing"
        ),
        "dry_run": sum(1 for r in results if r.get("status") == "dry_run"),
        "failed": sum(1 for r in results if r.get("status") == "failed"),
    }

    print(f"\nDone in {duration}s")
    print(f"  Generated: {counts['ok']}")
    print(f"  Skipped (existing): {counts['skipped_existing']}")
    print(f"  Dry run: {counts['dry_run']}")
    print(f"  Failed: {counts['failed']}")

    if counts["failed"]:
        print("\nFailed apps:")
        for r in results:
            if r.get("status") == "failed":
                print(f"  {r['app_id']}: {r.get('error', 'unknown')}")

    return 0 if counts["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
