#!/usr/bin/env python3
"""Summarize Hyperfy apps using OpenRouter into lean JSON sidecars.

Outputs one file per app:
  catalog/apps/<app-id>/ai-summary.json

Inputs:
  - catalog/manifests/apps-manifest.json
  - catalog/apps/*/manifest.json
  - catalog/discord/hyp_index.raw.json
  - catalog/discord/hyp_summaries/*.md
  - catalog/context/snippets/*.snippet.txt (conditionally)
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
MODEL_DEFAULT = "anthropic/claude-opus-4.6"

ALLOWED_COMPLEXITY = {"low", "medium", "high"}
ALLOWED_PROFILE = {"light", "medium", "heavy"}
ALLOWED_NETWORKING = {"none", "local", "shared_state", "events"}
ALLOWED_INTERACTION = {"action", "trigger", "ui", "passive", "networked"}

ALLOWED_TAGS = {
    "particles", "audio", "vehicle", "npc", "combat", "camera",
    "physics", "ui", "environment", "animation", "interaction",
    "building", "teleport", "media-player", "multiplayer", "3d-model",
}

TAG_SUGGESTED = (
    "feature_tags must be from the schema enum: particles, audio, vehicle, npc, combat, "
    "camera, physics, ui, environment, animation, interaction, building, teleport, "
    "media-player, multiplayer, 3d-model. Max 6 tags."
)

FORBIDDEN_PHRASES = [
    "does something useful", "application functionality", "provides features",
    "production environment", "configuration management", "rest api",
    "high-performance application", "placeholder", "no bad output",
    "example application", "valid json", "classifies the user utterance",
    "student management", "data processing with support",
]


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
    """OpenRouter structured output schema (json_schema mode).

    Only asks the LLM for: app_id, description, feature_tags, asset_profile, script_complexity.
    networking_profile and interaction_modes are derived deterministically from static analysis.
    """
    return {
        "name": "hyperfy_app_summary",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "app_id": {"type": "string"},
                "description": {"type": "string"},
                "feature_tags": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": [
                            "particles", "audio", "vehicle", "npc", "combat", "camera",
                            "physics", "ui", "environment", "animation", "interaction",
                            "building", "teleport", "media-player", "multiplayer", "3d-model",
                        ],
                    },
                },
                "asset_profile": {"type": "string", "enum": ["light", "medium", "heavy"]},
                "script_complexity": {"type": "string", "enum": ["low", "medium", "high"]},
            },
            "required": [
                "app_id",
                "description",
                "feature_tags",
                "asset_profile",
                "script_complexity",
            ],
            "additionalProperties": False,
        },
    }


def select_relevant_snippets(hyp_summary_md: str) -> str:
    """Only include doc snippets relevant to the app's detected features."""
    if not SNIPPETS_DIR.exists():
        return ""

    md_lower = hyp_summary_md.lower()
    parts = []

    # Always include the short scripting readme
    readme = SNIPPETS_DIR / "docs__scripting__readme.snippet.txt"
    if readme.exists():
        parts.append(readme.read_text(encoding="utf-8", errors="ignore")[:2000])

    # Networking docs only if networking signals present
    if any(kw in md_lower for kw in ["app.send", "app.emit", "world.on", "world.emit", "events listened", "events emitted"]):
        net = SNIPPETS_DIR / "docs__scripting__networking.snippet.txt"
        if net.exists():
            parts.append(net.read_text(encoding="utf-8", errors="ignore")[:2000])

    # Entity/node details only if complex node usage
    if any(kw in md_lower for kw in ["collider", "rigidbody", "particles", "audio", "uitext"]):
        ent = SNIPPETS_DIR / "refs__references__entity-details.snippet.txt"
        if ent.exists():
            parts.append(ent.read_text(encoding="utf-8", errors="ignore")[:3000])

    return "\n\n".join(parts) if parts else ""


def derive_from_static_analysis(hyp_summary_md: str) -> dict[str, Any]:
    """Deterministically derive networking_profile and interaction_modes from static analysis."""
    md_lower = hyp_summary_md.lower()

    # Networking: look for app.send, app.emit, world.on, world.emit, or custom events
    networking_signals = ["app.send", "app.emit", "world.on", "world.emit"]
    has_networking = any(sig in md_lower for sig in networking_signals)

    # Check for custom events (not just "update" which is the game loop)
    events_match = re.search(r"\*\*events listened\*\*:?\s*(.+)", md_lower)
    events_str = events_match.group(1).strip() if events_match else ""
    has_custom_events = bool(events_str) and events_str != "`update`"

    emitted_match = re.search(r"\*\*events emitted\*\*:?\s*(.+)", md_lower)
    has_emitted = bool(emitted_match and emitted_match.group(1).strip())

    networking_profile = "events" if (has_networking or has_custom_events or has_emitted) else "none"

    # Interaction modes from Nodes Created
    nodes_match = re.search(r"\*\*nodes created\*\*:?\s*(.+)", md_lower)
    nodes = nodes_match.group(1) if nodes_match else ""

    modes: list[str] = []
    if "action" in nodes:
        modes.append("action")
    if any(x in nodes for x in ["collider", "trigger"]):
        modes.append("trigger")
    if any(x in nodes for x in ["ui", "uitext"]):
        modes.append("ui")
    if not modes:
        modes.append("passive")
    if networking_profile != "none":
        modes.append("networked")

    return {
        "networking_profile": networking_profile,
        "interaction_modes": modes,
    }


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


def check_description_quality(description: str) -> str | None:
    """Return a rejection reason, or None if OK."""
    desc_lower = description.lower()
    for phrase in FORBIDDEN_PHRASES:
        if phrase in desc_lower:
            return f"contains forbidden phrase: '{phrase}'"
    if len(description) < 80:
        return f"too short ({len(description)} chars, minimum 80)"
    return None


def validate_summary(data: dict[str, Any], app_id: str, model: str, hyp_summary_md: str = "") -> dict[str, Any]:
    desc = data.get("description", "")
    if not desc:
        one_liner = data.get("one_liner", "")
        primary = data.get("primary_use_case", "")
        if one_liner and primary and one_liner != primary:
            desc = f"{one_liner} {primary}"
        else:
            desc = one_liner or primary

    # Deduplicate tags, filter to allowed set
    raw_tags = [str(x).strip() for x in (data.get("feature_tags") or [])]
    normalized_tags = list(dict.fromkeys(t for t in raw_tags if t in ALLOWED_TAGS))[:6]

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

    # Override networking + interaction from static analysis if available
    if hyp_summary_md:
        derived = derive_from_static_analysis(hyp_summary_md)
        out["networking_profile"] = derived["networking_profile"]
        out["interaction_modes"] = derived["interaction_modes"]

    # hard minima to prevent blank noisy output
    if not out["description"]:
        out["description"] = "A Hyperfy app."
    if not out["feature_tags"]:
        out["feature_tags"] = ["3d-model"]

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
    model: str,
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
        "description": "string 140-300 chars - what this app does, with concrete verbs and nouns from the source",
        "feature_tags": "string[] max 6, from enum: [particles, audio, vehicle, npc, combat, camera, physics, ui, environment, animation, interaction, building, teleport, media-player, multiplayer, 3d-model]",
        "asset_profile": "enum: light|medium|heavy",
        "script_complexity": "enum: low|medium|high",
    }

    system = (
        "You are a Hyperfy Script SDK catalog summarizer.\n\n"
        "Return ONLY a single JSON object matching the provided schema (no markdown, no extra keys).\n\n"
        "Description requirements (must satisfy ALL):\n"
        "- 140-300 characters (aim ~200).\n"
        "- Must include 1-2 concrete verbs (e.g. spawns/plays/renders/syncs/teleports/triggers/animates/damages).\n"
        "- Must include 1-2 concrete nouns/entities from the inputs (e.g. rocket projectile, explosion, "
        "trigger zone, portal, audio, UI panel, collider, particles, camera).\n"
        "- Must reflect evidence from the inputs (code excerpt and/or static analysis). "
        "If evidence is thin, describe only what is visible.\n"
        '- Forbidden phrases: "does something useful", "application functionality", "enhances", '
        '"provides features", "various", "etc", "placeholder", "production environment", '
        '"configuration management", "REST API", "high-performance".\n\n'
        "Tags: feature_tags must come from the enum in the schema. Do not invent tags."
    )

    context_snippets = select_relevant_snippets(hyp_summary_md)

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
    )
    if context_snippets:
        user += (
            "HYPERFY_DOC_SNIPPETS (relevant only):\n"
            f"{context_snippets}\n\n"
        )
    user += (
        "OUTPUT_SCHEMA:\n"
        f"{json.dumps(schema, indent=2)}\n\n"
        "Rules:\n"
        "- Keep arrays short and non-duplicative.\n"
        "- Use enums exactly as specified.\n"
        f"- {TAG_SUGGESTED}\n"
        "- Examples:\n"
        '  BAD description: "This app does something useful."\n'
        '  GOOD description: "Rocket launcher weapon that fires physics projectiles, triggers explosion '
        'particles + audio, and applies AoE damage via networked events."\n'
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
    payload["response_format"] = {
        "type": "json_schema",
        "json_schema": build_structured_json_schema(),
    }
    return payload


def process_one(
    app_row: dict[str, Any],
    model: str,
    api_key: str,
    max_retries: int,
    force: bool,
    dry_run: bool,
    hyp_index_entries: list[dict[str, Any]],
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
        model,
    )

    # Simple retry loop: call LLM up to 3 times, parse JSON
    parsed = None
    last_content = ""
    for attempt in range(3):
        if attempt > 0:
            time.sleep(2)
        response = call_openrouter(payload, api_key=api_key, max_retries=max_retries)
        last_content = (
            response.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        parsed = extract_json_object(last_content)
        if parsed:
            break
    else:
        # All 3 attempts failed to produce parseable JSON
        FAILURE_DUMP_DIR.mkdir(parents=True, exist_ok=True)
        dump_path = FAILURE_DUMP_DIR / f"{app_row['app_id']}.txt"
        dump_path.write_text(
            f"LAST_OUTPUT (attempt 3):\n{last_content}",
            encoding="utf-8",
        )
        raise RuntimeError(f"Model output is not valid JSON after 3 attempts (dumped: {dump_path})")

    summary = validate_summary(parsed, app_id=app_row["app_id"], model=model, hyp_summary_md=hyp_summary_md)

    # Quality gate: reject generic/garbage descriptions, retry once
    rejection = check_description_quality(summary["description"])
    if rejection:
        print(f"    {app_row['app_id']}: quality gate: {rejection}, retrying...")
        time.sleep(2)
        response = call_openrouter(payload, api_key=api_key, max_retries=max_retries)
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        retry_parsed = extract_json_object(content)
        if retry_parsed:
            summary = validate_summary(retry_parsed, app_id=app_row["app_id"], model=model, hyp_summary_md=hyp_summary_md)
            rejection = check_description_quality(summary["description"])
        if rejection:
            print(f"    WARNING: {app_row['app_id']}: quality gate still failed after retry: {rejection}")

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

    args = parser.parse_args()

    if not GLOBAL_MANIFEST.exists():
        print(f"Error: missing {GLOBAL_MANIFEST}")
        return 1

    if not HYP_INDEX_RAW.exists():
        print(f"Error: missing {HYP_INDEX_RAW}")
        return 1

    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not api_key and not args.dry_run:
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
