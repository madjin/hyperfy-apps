#!/usr/bin/env python3
"""Summarize Hyperfy apps using OpenRouter into lean JSON sidecars.

Outputs one file per app:
  catalog/apps/<app-id>/ai-summary.json

Inputs:
  - catalog/manifests/apps-manifest.json
  - catalog/apps/*/manifest.json
  - catalog/discord/hyp_index.raw.json
  - catalog/discord/hyp_summaries/*.md
  - catalog/context/snippets/*.snippet.txt
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
CATALOG_ROOT = REPO_ROOT / "catalog"
GLOBAL_MANIFEST = CATALOG_ROOT / "manifests" / "apps-manifest.json"
HYP_INDEX_RAW = CATALOG_ROOT / "discord" / "hyp_index.raw.json"
SNIPPETS_DIR = CATALOG_ROOT / "context" / "snippets"
REPORT_PATH = CATALOG_ROOT / "manifests" / "ai-summary-report.json"
FAILURE_DUMP_DIR = CATALOG_ROOT / "manifests" / "ai-summary-failures"

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_DEFAULT = "moonshotai/kimi-k2.5"

ALLOWED_COMPLEXITY = {"low", "medium", "high"}
ALLOWED_PROFILE = {"light", "medium", "heavy"}
ALLOWED_NETWORKING = {"none", "local", "shared_state", "events"}
ALLOWED_INTERACTION = {"action", "trigger", "ui", "passive", "networked"}

TAG_CANONICAL: dict[str, str] = {
    "particle": "particles",
    "particle effect": "particles",
    "particle effects": "particles",
    "particle system": "particles",
    "3d model": "3d-model",
    "3d models": "3d-model",
    "3d-models": "3d-model",
    "model": "3d-model",
    "glb": "3d-model",
    "spatial audio": "audio",
    "sound": "audio",
    "music": "audio",
    "audio playback": "audio",
    "npc ai": "npc",
    "ai npc": "npc",
    "ai": "npc",
    "vehicle control": "vehicle",
    "vehicles": "vehicle",
    "driving": "vehicle",
    "helicopter": "vehicle",
    "car": "vehicle",
    "pvp": "combat",
    "weapon": "combat",
    "weapons": "combat",
    "gun": "combat",
    "shooting": "combat",
    "camera control": "camera",
    "camera system": "camera",
    "camera controls": "camera",
    "ui controls": "ui",
    "user interface": "ui",
    "gui": "ui",
    "hud": "ui",
    "notification": "ui",
    "notifications": "ui",
    "environment design": "environment",
    "world design": "environment",
    "scene": "environment",
    "sky": "environment",
    "weather": "environment",
    "terrain": "environment",
    "landscape": "environment",
    "animated": "animation",
    "animations": "animation",
    "animate": "animation",
    "emote": "animation",
    "emotes": "animation",
    "interactive": "interaction",
    "interactivity": "interaction",
    "click": "interaction",
    "action": "interaction",
    "trigger": "interaction",
    "building tool": "building",
    "builder": "building",
    "placement": "building",
    "spawn": "building",
    "teleportation": "teleport",
    "portal": "teleport",
    "portals": "teleport",
    "media playback": "media-player",
    "video player": "media-player",
    "video": "media-player",
    "image viewer": "media-player",
    "physics simulation": "physics",
    "rigidbody": "physics",
    "collision": "physics",
    "raycast": "physics",
    "networking": "multiplayer",
    "networked state": "multiplayer",
    "multiplayer sync": "multiplayer",
    "networked": "multiplayer",
    "pet": "npc",
    "pets": "npc",
    "creature": "npc",
    "butterfly": "particles",
    "butterflies": "particles",
    "swarm": "particles",
    "fire": "particles",
    "smoke": "particles",
    "confetti": "particles",
    "explosion": "particles",
    "glow": "particles",
    "dust": "particles",
    "grass": "environment",
    "tree": "environment",
    "trees": "environment",
    "forest": "environment",
    "neon": "environment",
    "lighting": "environment",
    "light": "environment",
    "loot": "combat",
    "health": "combat",
    "damage": "combat",
}

TAG_SUGGESTED = (
    "Use broad reusable tags like: particles, audio, vehicle, npc, combat, camera, "
    "physics, ui, environment, animation, interaction, building, teleport, media-player, "
    "multiplayer, 3d-model. Prefer these canonical tags over app-specific terms. Max 6 tags."
)


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def extract_json_object(text: str) -> dict[str, Any] | None:
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, flags=re.S)
    if fenced:
        try:
            return json.loads(fenced.group(1))
        except Exception:
            return None

    first = text.find("{")
    last = text.rfind("}")
    if first >= 0 and last > first:
        try:
            return json.loads(text[first:last + 1])
        except Exception:
            return None

    return None


def clip(s: str, n: int) -> str:
    s = (s or "").strip()
    return s if len(s) <= n else s[:n]


def build_structured_json_schema() -> dict[str, Any]:
    """OpenRouter structured output schema (json_schema mode)."""
    return {
        "name": "hyperfy_app_summary",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "app_id": {"type": "string"},
                "description": {"type": "string"},
                "feature_tags": {"type": "array", "items": {"type": "string"}},
                "interaction_modes": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["action", "trigger", "ui", "passive", "networked"],
                    },
                },
                "asset_profile": {"type": "string", "enum": ["light", "medium", "heavy"]},
                "script_complexity": {"type": "string", "enum": ["low", "medium", "high"]},
                "networking_profile": {
                    "type": "string",
                    "enum": ["none", "local", "shared_state", "events"],
                },
            },
            "required": [
                "app_id",
                "description",
                "feature_tags",
                "interaction_modes",
                "asset_profile",
                "script_complexity",
                "networking_profile",
            ],
            "additionalProperties": False,
        },
    }


def load_context_snippets(max_chars_per_file: int = 3000, max_files: int = 8) -> str:
    if not SNIPPETS_DIR.exists():
        return ""

    parts = []
    files = sorted(SNIPPETS_DIR.glob("*.snippet.txt"))[:max_files]
    for p in files:
        text = p.read_text(encoding="utf-8", errors="ignore")
        parts.append(f"### {p.name}\n{text[:max_chars_per_file]}")
    return "\n\n".join(parts)


def find_hyp_index_entry(hyp_index_entries: list[dict[str, Any]], manifest: dict[str, Any]) -> dict[str, Any] | None:
    src = manifest.get("source", {})
    target_attachment = src.get("discord_attachment_id")
    target_message = src.get("discord_message_id")

    for e in hyp_index_entries:
        if target_attachment and e.get("attachment_id") == target_attachment:
            return e
    for e in hyp_index_entries:
        if target_message and e.get("message_id") == target_message:
            return e
    return None


def read_optional(path: Path | None, max_chars: int = 6000) -> str:
    if not path or not path.exists():
        return ""
    return path.read_text(encoding="utf-8", errors="ignore")[:max_chars]


def normalize_tag(tag: str) -> str:
    """Normalize a tag to its canonical form."""
    t = tag.strip().lower()
    return TAG_CANONICAL.get(t, t)


def validate_summary(data: dict[str, Any], app_id: str, model: str) -> dict[str, Any]:
    # Merge one_liner + primary_use_case into description if old schema
    desc = data.get("description", "")
    if not desc:
        one_liner = data.get("one_liner", "")
        primary = data.get("primary_use_case", "")
        if one_liner and primary and one_liner != primary:
            desc = f"{one_liner} {primary}"
        else:
            desc = one_liner or primary

    # Normalize and deduplicate tags
    raw_tags = [clip(str(x), 40) for x in (data.get("feature_tags") or [])[:8]]
    seen: set[str] = set()
    normalized_tags: list[str] = []
    for tag in raw_tags:
        canonical = normalize_tag(tag)
        if canonical and canonical not in seen:
            seen.add(canonical)
            normalized_tags.append(canonical)
    normalized_tags = normalized_tags[:6]

    out = {
        "app_id": app_id,
        "model": model,
        "generated_at": now_iso(),
        "description": clip(str(desc), 300),
        "feature_tags": normalized_tags,
        "interaction_modes": [x for x in (data.get("interaction_modes") or []) if x in ALLOWED_INTERACTION][:5],
        "asset_profile": data.get("asset_profile") if data.get("asset_profile") in ALLOWED_PROFILE else "medium",
        "script_complexity": data.get("script_complexity") if data.get("script_complexity") in ALLOWED_COMPLEXITY else "medium",
        "networking_profile": data.get("networking_profile") if data.get("networking_profile") in ALLOWED_NETWORKING else "none",
    }

    # hard minima to prevent blank noisy output
    if not out["description"]:
        out["description"] = "A Hyperfy app."
    if not out["feature_tags"]:
        out["feature_tags"] = ["unclassified"]

    return out


def call_openrouter(payload: dict[str, Any], api_key: str, max_retries: int) -> dict[str, Any]:
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

    body = json.dumps(payload).encode("utf-8")

    for attempt in range(max_retries + 1):
        req = urllib.request.Request(OPENROUTER_URL, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                return json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in {429, 500, 502, 503, 504} and attempt < max_retries:
                sleep_s = min(20, (2 ** attempt) + random.random())
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
                sleep_s = min(20, (2 ** attempt) + random.random())
                time.sleep(sleep_s)
                continue
            raise RuntimeError(f"OpenRouter request failed: {e}")

    raise RuntimeError("OpenRouter request exhausted retries")


def build_prompt_payload(
    app_manifest: dict[str, Any],
    hyp_entry: dict[str, Any] | None,
    hyp_summary_md: str,
    app_files_context: dict[str, Any],
    context_snippets: str,
    model: str,
    use_json_schema: bool = True,
) -> dict[str, Any]:
    app_facts = {
        "app_id": app_manifest.get("app_id"),
        "app_name": app_manifest.get("app_name"),
        "app_slug": app_manifest.get("app_slug"),
        "author": app_manifest.get("author", {}),
        "source": app_manifest.get("source", {}),
        "description": app_manifest.get("description", {}),
        "preview": app_manifest.get("preview", {}),
        "status": app_manifest.get("status", {}),
        "media": app_manifest.get("media", [])[:10],
    }

    discord_ctx = {
        "message_content_raw": (hyp_entry or {}).get("message_content_raw", ""),
        "context_messages": (hyp_entry or {}).get("context_messages", [])[:6],
        "flags": (hyp_entry or {}).get("flags", []),
    }

    schema = {
        "app_id": "string",
        "description": "string <=300 chars - a concise summary of what this app does and its primary use case",
        "feature_tags": "string[] max 6",
        "interaction_modes": "enum[] subset of [action,trigger,ui,passive,networked]",
        "asset_profile": "enum: light|medium|heavy",
        "script_complexity": "enum: low|medium|high",
        "networking_profile": "enum: none|local|shared_state|events",
    }

    system = (
        "You are a Hyperfy app archivist assistant. Return ONLY valid JSON object with the exact requested schema. "
        "Be concise, remove noise, avoid speculative claims. "
        "Do not include markdown fences or extra keys."
    )

    user = (
        "Summarize this Hyperfy app into a lean manifest-enrichment JSON.\n\n"
        "APP_FACTS:\n"
        f"{json.dumps(app_facts, indent=2)}\n\n"
        "APP_FILES_CONTEXT:\n"
        f"{json.dumps(app_files_context, indent=2)}\n\n"
        "DISCORD_CONTEXT:\n"
        f"{json.dumps(discord_ctx, indent=2)}\n\n"
        "STATIC_ANALYSIS_SUMMARY_MD (truncated):\n"
        f"{hyp_summary_md[:8000]}\n\n"
        "HYPERFY_DOC_SNIPPETS (curated):\n"
        f"{context_snippets[:12000]}\n\n"
        "OUTPUT_SCHEMA:\n"
        f"{json.dumps(schema, indent=2)}\n\n"
        "Rules:\n"
        "- Keep arrays short and non-duplicative.\n"
        "- Use enums exactly as specified.\n"
        f"- {TAG_SUGGESTED}\n"
        "- Return JSON only."
    )

    payload = {
        "model": model,
        "temperature": 0.1,
        "max_tokens": 1200,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    if use_json_schema:
        payload["response_format"] = {
            "type": "json_schema",
            "json_schema": build_structured_json_schema(),
        }
    else:
        payload["response_format"] = {"type": "json_object"}
    return payload


def build_repair_payload(model: str, bad_content: str, use_json_schema: bool = True) -> dict[str, Any]:
    system = (
        "You convert text into strict valid JSON. "
        "Return ONLY one JSON object and nothing else."
    )
    user = (
        "The previous model output was not valid JSON for the required schema. "
        "Fix it and return valid JSON only.\n\n"
        "BAD_OUTPUT:\n"
        f"{bad_content[:12000]}"
    )
    payload = {
        "model": model,
        "temperature": 0.0,
        "max_tokens": 1200,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    if use_json_schema:
        payload["response_format"] = {
            "type": "json_schema",
            "json_schema": build_structured_json_schema(),
        }
    else:
        payload["response_format"] = {"type": "json_object"}
    return payload


def process_one(
    app_row: dict[str, Any],
    model: str,
    api_key: str,
    max_retries: int,
    force: bool,
    dry_run: bool,
    hyp_index_entries: list[dict[str, Any]],
    context_snippets: str,
    use_json_schema: bool,
) -> dict[str, Any]:
    app_manifest_path = REPO_ROOT / app_row["manifest_path"]
    app_dir = app_manifest_path.parent
    ai_summary_path = app_dir / "ai-summary.json"

    if ai_summary_path.exists() and not force:
        return {"app_id": app_row["app_id"], "status": "skipped_existing", "path": str(ai_summary_path)}

    app_manifest = read_json(app_manifest_path)
    app_files_context: dict[str, Any] = {"v2_json": {}, "index_js_excerpt": "", "other_js_files": []}

    v2_dir_rel = app_manifest.get("links", {}).get("v2_app_dir")
    if v2_dir_rel:
        v2_dir = REPO_ROOT / v2_dir_rel
        if v2_dir.exists():
            json_files = sorted(v2_dir.glob("*.json"))
            if json_files:
                try:
                    app_files_context["v2_json"] = read_json(json_files[0])
                except Exception:
                    app_files_context["v2_json"] = {}

            index_js = v2_dir / "index.js"
            if index_js.exists():
                app_files_context["index_js_excerpt"] = index_js.read_text(
                    encoding="utf-8", errors="ignore"
                )[:9000]

            app_files_context["other_js_files"] = [
                p.name for p in sorted(v2_dir.glob("*.js")) if p.name != "index.js"
            ][:10]

    hyp_entry = find_hyp_index_entry(hyp_index_entries, app_manifest)
    hyp_summary_path = None
    if app_manifest.get("links", {}).get("hyp_summary_path"):
        hyp_summary_path = REPO_ROOT / app_manifest["links"]["hyp_summary_path"]
    hyp_summary_md = read_optional(hyp_summary_path, max_chars=9000)

    if dry_run:
        return {
            "app_id": app_row["app_id"],
            "status": "dry_run",
            "path": str(ai_summary_path),
            "has_hyp_entry": bool(hyp_entry),
            "has_hyp_summary": bool(hyp_summary_md),
        }

    payload = build_prompt_payload(
        app_manifest,
        hyp_entry,
        hyp_summary_md,
        app_files_context,
        context_snippets,
        model,
        use_json_schema=use_json_schema,
    )
    response = call_openrouter(payload, api_key=api_key, max_retries=max_retries)

    content = (
        response.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    parsed = extract_json_object(content)
    if not parsed:
        # One repair attempt: ask model to convert its bad output into strict JSON.
        repair_payload = build_repair_payload(
            model=model,
            bad_content=content,
            use_json_schema=use_json_schema,
        )
        repair_response = call_openrouter(repair_payload, api_key=api_key, max_retries=max_retries)
        repair_content = (
            repair_response.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        parsed = extract_json_object(repair_content)
        if not parsed:
            FAILURE_DUMP_DIR.mkdir(parents=True, exist_ok=True)
            dump_path = FAILURE_DUMP_DIR / f"{app_row['app_id']}.txt"
            dump_path.write_text(
                "PRIMARY_OUTPUT:\n"
                + content
                + "\n\nREPAIR_OUTPUT:\n"
                + repair_content,
                encoding="utf-8",
            )
            raise RuntimeError(f"Model output is not valid JSON (dumped: {dump_path})")

    summary = validate_summary(parsed, app_id=app_row["app_id"], model=model)

    app_dir.mkdir(parents=True, exist_ok=True)
    ai_summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    return {
        "app_id": app_row["app_id"],
        "status": "ok",
        "path": str(ai_summary_path),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Summarize Hyperfy apps with OpenRouter")
    parser.add_argument("--model", default=MODEL_DEFAULT)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--app-id", action="append", dest="app_ids", help="Only process specific app_id (repeatable)")
    parser.add_argument("--force", action="store_true", help="Regenerate existing ai-summary.json")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--fail-fast", action="store_true")
    parser.add_argument("--max-retries", type=int, default=3)
    parser.add_argument("--concurrency", type=int, default=3)
    parser.add_argument(
        "--no-json-schema",
        action="store_true",
        help="Disable structured outputs json_schema and fall back to json_object mode",
    )

    args = parser.parse_args()

    if not GLOBAL_MANIFEST.exists():
        print(f"Error: missing {GLOBAL_MANIFEST}")
        return 1

    if not HYP_INDEX_RAW.exists():
        print(f"Error: missing {HYP_INDEX_RAW}")
        return 1

    if not SNIPPETS_DIR.exists():
        print(f"Error: missing context snippets at {SNIPPETS_DIR}")
        print("Run: python scripts/research/prepare_context_bundle.py")
        return 1

    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not args.dry_run and not api_key:
        print("Error: OPENROUTER_API_KEY is required")
        return 1

    global_manifest = read_json(GLOBAL_MANIFEST)
    app_rows = list(global_manifest.get("apps", []))

    if args.app_ids:
        wanted = set(args.app_ids)
        app_rows = [a for a in app_rows if a.get("app_id") in wanted]

    if args.limit:
        app_rows = app_rows[: args.limit]

    hyp_index_entries = json.loads(HYP_INDEX_RAW.read_text(encoding="utf-8"))
    context_snippets = load_context_snippets()

    print(f"Apps to summarize: {len(app_rows)}")
    print(f"Model: {args.model}")
    print(f"Dry run: {args.dry_run}")

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
                hyp_index_entries,
                context_snippets,
                not args.no_json_schema,
            ): app
            for app in app_rows
        }

        for fut in as_completed(futures):
            app = futures[fut]
            try:
                res = fut.result()
                results.append(res)
                print(f"  {res['app_id']}: {res['status']}")
            except Exception as e:
                err = {"app_id": app.get("app_id"), "status": "failed", "error": str(e)}
                results.append(err)
                print(f"  {app.get('app_id')}: failed ({e})")
                if args.fail_fast:
                    break

    duration = round(time.time() - started, 2)
    counts = {
        "ok": sum(1 for r in results if r.get("status") == "ok"),
        "skipped_existing": sum(1 for r in results if r.get("status") == "skipped_existing"),
        "dry_run": sum(1 for r in results if r.get("status") == "dry_run"),
        "failed": sum(1 for r in results if r.get("status") == "failed"),
    }

    report = {
        "generated_at": now_iso(),
        "model": args.model,
        "dry_run": args.dry_run,
        "duration_seconds": duration,
        "counts": counts,
        "results": results,
    }
    try:
        REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
        REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    except PermissionError:
        if args.dry_run:
            print(f"Warning: could not write report in dry-run: {REPORT_PATH}")
        else:
            raise

    print("Done")
    print(f"  ok: {counts['ok']}")
    print(f"  skipped_existing: {counts['skipped_existing']}")
    print(f"  dry_run: {counts['dry_run']}")
    print(f"  failed: {counts['failed']}")
    print(f"  report: {REPORT_PATH}")

    return 0 if counts["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
