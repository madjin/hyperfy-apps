#!/usr/bin/env python3
"""Build merged explorer data from catalog manifests and AI summaries.

Outputs:
  catalog/explorer-data.json                 - single file for web explorer
  catalog/apps/<app-id>/card.json           - per-app file for AI agents

Inputs:
  catalog/manifests/apps-manifest.json
  catalog/apps/*/manifest.json + ai-summary.json
  v2/*/  (blueprint JSON, index.js, asset files)
"""

from __future__ import annotations

import json
import os
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
CATALOG_ROOT = REPO_ROOT / "catalog"
GLOBAL_MANIFEST = CATALOG_ROOT / "manifests" / "apps-manifest.json"
EXPLORER_DATA_DIR = CATALOG_ROOT
GENERATED_PREVIEWS_DIR = CATALOG_ROOT / "generated_previews"
V2_APPS_DIR = REPO_ROOT / "v2"
V2_ASSETS_DIR = REPO_ROOT / "v2" / "assets"

def detect_github_raw_base() -> str:
    """Detect GitHub raw URL base from git remote, with fallback."""
    import subprocess
    try:
        result = subprocess.run(
            ["git", "-C", str(REPO_ROOT), "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=5,
        )
        url = result.stdout.strip()
        # Handle https://github.com/user/repo.git or git@github.com:user/repo.git
        if "github.com" in url:
            url = url.replace("git@github.com:", "https://github.com/")
            url = url.removesuffix(".git")
            # Extract user/repo from https://github.com/user/repo
            parts = url.split("github.com/")[-1]
            return f"https://raw.githubusercontent.com/{parts}/main"
    except Exception:
        pass
    return ""


GITHUB_RAW_BASE = detect_github_raw_base()

# Import ALLOWED_TAGS from summarize script for consistent tag filtering
import sys
sys.path.insert(0, str(REPO_ROOT / "scripts" / "research"))
from summarize_hyp_files_openrouter import ALLOWED_TAGS


def normalize_tags(tags: list[str]) -> list[str]:
    """Deduplicate tags, filtering to allowed set."""
    return list(dict.fromkeys(t.strip() for t in tags if t.strip() in ALLOWED_TAGS))[:6]


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> dict[str, Any] | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def media_type_from_path(path: str | None) -> str:
    if not path:
        return "none"
    p = path.lower()
    if p.endswith((".mp4", ".mov", ".webm")):
        return "video"
    return "image"


def extract_props(blueprint: dict[str, Any]) -> dict[str, Any]:
    """Extract user-meaningful props from v2 blueprint JSON."""
    raw_props = blueprint.get("props", {})
    if not raw_props or not isinstance(raw_props, dict):
        return {}

    clean: dict[str, Any] = {}
    for key, val in raw_props.items():
        # Skip internal timestamps and system fields
        if key in ("createdAt",):
            continue
        # For file references, just keep the type and url
        if isinstance(val, dict) and "type" in val:
            clean[key] = val
        else:
            clean[key] = val
    return clean


def find_v2_app_dir(v2_app_dir_rel: str | None) -> Path | None:
    """Resolve v2 app directory from manifest path like 'v2/<slug>'."""
    if not v2_app_dir_rel:
        return None

    direct = REPO_ROOT / v2_app_dir_rel
    if direct.exists():
        return direct

    return None


def get_asset_files(blueprint: dict[str, Any]) -> list[str]:
    """Extract referenced asset filenames from a v2 blueprint."""
    assets: set[str] = set()

    # Model reference
    model = blueprint.get("model", "")
    if model and isinstance(model, str) and model.startswith("assets/"):
        assets.add(model.replace("assets/", "", 1))

    # Image reference
    image = blueprint.get("image")
    if isinstance(image, dict):
        url = image.get("url", "")
        if url and isinstance(url, str) and url.startswith("assets/"):
            assets.add(url.replace("assets/", "", 1))
    elif isinstance(image, str) and image.startswith("assets/"):
        assets.add(image.replace("assets/", "", 1))

    # Props with asset references
    props = blueprint.get("props", {})
    if isinstance(props, dict):
        for val in props.values():
            if isinstance(val, dict):
                url = val.get("url", "")
                if url and isinstance(url, str) and url.startswith("assets/"):
                    assets.add(url.replace("assets/", "", 1))

    return sorted(assets)


def build_app_entry(
    app_row: dict[str, Any],
    manifest: dict[str, Any],
    ai_summary: dict[str, Any] | None,
    v2_dir: Path | None,
    blueprint: dict[str, Any] | None,
) -> dict[str, Any]:
    """Build a single app entry for explorer-data.json."""
    source = manifest.get("source", {})
    preview_path = manifest.get("preview", {}).get("primary_media_path") or app_row.get("primary_preview")

    # Fallback: check for AI-generated preview image
    if not preview_path:
        matches = list(GENERATED_PREVIEWS_DIR.glob(f"{app_row['app_id']}.*"))
        if matches:
            preview_path = str(matches[0].relative_to(REPO_ROOT))

    # Prefer AI description, fall back to one_liner+primary_use_case (old schema), then manifest
    description = ""
    if ai_summary:
        description = ai_summary.get("description", "")
        if not description:
            # Old schema fallback: merge one_liner + primary_use_case
            one_liner = ai_summary.get("one_liner", "")
            primary = ai_summary.get("primary_use_case", "")
            if one_liner and primary and one_liner != primary:
                description = f"{one_liner} {primary}"
            else:
                description = one_liner or primary
    if not description:
        description = manifest.get("description", {}).get("short", "")

    tags = normalize_tags((ai_summary or {}).get("feature_tags", []))
    interaction_modes = (ai_summary or {}).get("interaction_modes", [])
    asset_profile = (ai_summary or {}).get("asset_profile", "medium")
    script_complexity = (ai_summary or {}).get("script_complexity", "medium")
    networking = (ai_summary or {}).get("networking_profile", "none")

    # Make preview_path relative to catalog/ for Pages deployment
    catalog_preview = None
    if preview_path:
        if preview_path.startswith("catalog/"):
            catalog_preview = preview_path[len("catalog/"):]
        else:
            catalog_preview = preview_path

    # Download: use GitHub raw URL since v2-hyp/ is outside catalog/
    hyp_filename = source.get("hyp_filename")
    download_url = f"{GITHUB_RAW_BASE}/v2-hyp/{hyp_filename}" if hyp_filename else None

    return {
        "id": app_row["app_id"],
        "slug": app_row.get("app_slug", ""),
        "name": app_row.get("app_name", ""),
        "author": manifest.get("author", {}).get("display_name") or app_row.get("author", "Unknown"),
        "description": description,
        "preview_url": catalog_preview,
        "preview_type": media_type_from_path(preview_path),
        "hyp_filename": hyp_filename,
        "download_path": download_url,
        "created_at": source.get("discord_timestamp"),
        "tags": tags,
        "interaction_modes": interaction_modes,
        "asset_profile": asset_profile,
        "script_complexity": script_complexity,
        "networking": networking,
        "has_preview": bool(preview_path),
        "has_source": v2_dir is not None and v2_dir.exists(),
    }


def build_card_json(
    app_row: dict[str, Any],
    manifest: dict[str, Any],
    ai_summary: dict[str, Any] | None,
    v2_dir: Path | None,
    blueprint: dict[str, Any] | None,
) -> dict[str, Any]:
    """Build a self-contained card.json for AI agent consumption."""
    source = manifest.get("source", {})
    preview_path = manifest.get("preview", {}).get("primary_media_path") or app_row.get("primary_preview")

    # Fallback: check for AI-generated preview image
    if not preview_path:
        matches = list(GENERATED_PREVIEWS_DIR.glob(f"{app_row['app_id']}.*"))
        if matches:
            preview_path = str(matches[0].relative_to(REPO_ROOT))

    description = ""
    if ai_summary:
        description = ai_summary.get("description", "")
    if not description:
        description = manifest.get("description", {}).get("short", "")

    tags = normalize_tags((ai_summary or {}).get("feature_tags", []))
    interaction_modes = (ai_summary or {}).get("interaction_modes", [])
    asset_profile = (ai_summary or {}).get("asset_profile", "medium")
    script_complexity = (ai_summary or {}).get("script_complexity", "medium")
    networking = (ai_summary or {}).get("networking_profile", "none")

    # Extract source excerpts from v2
    props: dict[str, Any] = {}
    script_excerpt = ""
    asset_files: list[str] = []

    if blueprint:
        props = extract_props(blueprint)
        asset_files = get_asset_files(blueprint)

    if v2_dir and v2_dir.exists():
        index_js = v2_dir / "index.js"
        if index_js.exists():
            try:
                script_excerpt = index_js.read_text(encoding="utf-8", errors="ignore")[:2000]
            except Exception:
                pass

    # Make preview_path relative to catalog/ for Pages deployment
    catalog_preview = None
    if preview_path:
        if preview_path.startswith("catalog/"):
            catalog_preview = preview_path[len("catalog/"):]
        else:
            catalog_preview = preview_path

    hyp_filename = source.get("hyp_filename")
    download_url = f"{GITHUB_RAW_BASE}/v2-hyp/{hyp_filename}" if hyp_filename else None

    card: dict[str, Any] = {
        "name": app_row.get("app_name", ""),
        "author": manifest.get("author", {}).get("display_name") or app_row.get("author", "Unknown"),
        "description": description,
        "tags": tags,
        "interaction_modes": interaction_modes,
        "asset_profile": asset_profile,
        "script_complexity": script_complexity,
        "networking": networking,
        "preview_url": catalog_preview,
        "download_path": download_url,
        "created_at": source.get("discord_timestamp"),
    }

    if props:
        card["props"] = props
    if script_excerpt:
        card["script_excerpt"] = script_excerpt
    if asset_files:
        card["asset_files"] = asset_files

    return card


def main() -> int:
    if not GLOBAL_MANIFEST.exists():
        print(f"Error: missing {GLOBAL_MANIFEST}")
        return 1

    global_manifest = read_json(GLOBAL_MANIFEST)
    if not global_manifest:
        print("Error: could not parse apps-manifest.json")
        return 1

    app_rows = global_manifest.get("apps", [])
    print(f"Processing {len(app_rows)} apps...")

    explorer_apps: list[dict[str, Any]] = []
    tag_index: dict[str, list[str]] = defaultdict(list)
    with_preview = 0
    card_count = 0

    for app_row in app_rows:
        app_id = app_row["app_id"]
        manifest_path = REPO_ROOT / app_row["manifest_path"]
        app_dir = manifest_path.parent
        ai_summary_path = app_dir / "ai-summary.json"

        manifest = read_json(manifest_path)
        if not manifest:
            print(f"  Warning: could not read manifest for {app_id}")
            continue

        ai_summary = read_json(ai_summary_path)

        # Find v2 app directory
        v2_dir_rel = manifest.get("links", {}).get("v2_app_dir")
        v2_dir = find_v2_app_dir(v2_dir_rel)

        # Read blueprint JSON
        blueprint = None
        if v2_dir and v2_dir.exists():
            json_files = sorted(v2_dir.glob("*.json"))
            if json_files:
                blueprint = read_json(json_files[0])

        # Build explorer entry
        entry = build_app_entry(app_row, manifest, ai_summary, v2_dir, blueprint)
        explorer_apps.append(entry)

        if entry["has_preview"]:
            with_preview += 1

        # Build tag index
        for tag in entry["tags"]:
            tag_index[tag].append(app_id)

        # Build and write card.json
        card = build_card_json(app_row, manifest, ai_summary, v2_dir, blueprint)
        card_path = app_dir / "card.json"
        card_path.write_text(json.dumps(card, indent=2), encoding="utf-8")
        card_count += 1

    # Sort tag index by frequency (most used first)
    sorted_tag_index = dict(
        sorted(tag_index.items(), key=lambda x: len(x[1]), reverse=True)
    )

    # Build final explorer-data.json
    explorer_data = {
        "version": 2,
        "generated_at": now_iso(),
        "counts": {
            "total": len(explorer_apps),
            "with_preview": with_preview,
        },
        "tag_index": sorted_tag_index,
        "apps": explorer_apps,
    }

    EXPLORER_DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_path = EXPLORER_DATA_DIR / "explorer-data.json"
    output_path.write_text(json.dumps(explorer_data, indent=2), encoding="utf-8")

    # Stats
    data_size = output_path.stat().st_size
    tag_count = len(sorted_tag_index)
    print(f"Done!")
    print(f"  explorer-data.json: {data_size / 1024:.1f} KB ({len(explorer_apps)} apps, {tag_count} tags)")
    print(f"  card.json files: {card_count}")
    print(f"  Apps with preview: {with_preview}")
    print(f"  Output: {output_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
