#!/usr/bin/env python3
"""Build catalog artifacts in hyperfy-apps from sunset research outputs.

Pipeline:
1. Copy source research artifacts into catalog/discord
2. Optimize media into catalog/discord/hyp_media with size gating
3. Generate per-app manifests in catalog/apps/<app-id>/manifest.json
4. Generate global manifest index in catalog/manifests/apps-manifest.json
5. Generate missing-media GitHub issue checklist markdown
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import shutil
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MAX_BYTES_DEFAULT = 50 * 1024 * 1024
IMG_EXTS = {".png", ".jpg", ".jpeg"}
VID_EXTS = {".mp4", ".mov"}


@dataclass
class OptimizeResult:
    status: str
    optimized_rel: str | None
    reason: str
    original_size: int
    optimized_size: int | None


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sanitize_slug(value: str) -> str:
    value = (value or "app").strip()
    value = value.lower()
    value = re.sub(r"[^a-z0-9._-]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "app"


def strip_md(text: str) -> str:
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", text)
    text = re.sub(r"[*_>#-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def load_summary_excerpt(path: Path, max_len: int = 320) -> str:
    if not path.exists():
        return ""
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

    for line in content.splitlines():
        candidate = strip_md(line)
        if not candidate:
            continue
        if candidate.lower().startswith("extracted from"):
            continue
        if candidate.lower().startswith("metadata"):
            continue
        return candidate[:max_len]
    return ""


def load_filename_mappings(csv_path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not csv_path.exists():
        return out
    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            old_name = (row.get("old_name") or "").strip().strip('"')
            new_name = (row.get("new_name") or "").strip().strip('"')
            if old_name and new_name:
                out[old_name.lower()] = new_name
    return out


def detect_v2_json(v2_dir: Path) -> Path | None:
    if not v2_dir.exists():
        return None
    jsons = sorted(p for p in v2_dir.glob("*.json") if p.is_file())
    return jsons[0] if jsons else None


def resolve_v2_slug(app_name: str, filename_stem: str, v2_slugs: set[str], mappings: dict[str, str]) -> str | None:
    candidates = {
        sanitize_slug(app_name),
        sanitize_slug(filename_stem),
    }

    # check filename mappings
    app_key = app_name.replace("_", " ").strip().lower()
    file_key = filename_stem.replace("_", " ").strip().lower()
    mapped = mappings.get(app_key) or mappings.get(file_key)
    if mapped:
        candidates.add(sanitize_slug(mapped))

    # exact match (v2 dirs are now all slugified)
    for c in candidates:
        if c and c in v2_slugs:
            return c

    # fallback: strip all non-alphanumeric and compare
    for c in candidates:
        c2 = re.sub(r"[^a-z0-9]", "", c)
        if not c2:
            continue
        for slug in v2_slugs:
            if re.sub(r"[^a-z0-9]", "", slug) == c2:
                return slug

    return None


def copy_artifacts(source_research: Path, catalog_discord: Path, dry_run: bool = False):
    src_index = source_research / "hyp_index.json"
    src_summaries = source_research / "hyp_summaries"
    src_media = source_research / "hyp_media"
    src_report = source_research / "hyp_media_report.md"

    dst_index = catalog_discord / "hyp_index.raw.json"
    dst_summaries = catalog_discord / "hyp_summaries"
    dst_media_raw = catalog_discord / "hyp_media_raw"
    dst_report = catalog_discord / "hyp_media_report.md"

    if dry_run:
        return {
            "index": src_index,
            "summaries": src_summaries,
            "media_raw": src_media,
            "report": src_report,
        }

    catalog_discord.mkdir(parents=True, exist_ok=True)

    shutil.copy2(src_index, dst_index)

    if dst_summaries.exists():
        shutil.rmtree(dst_summaries)
    shutil.copytree(src_summaries, dst_summaries)

    if dst_media_raw.exists():
        shutil.rmtree(dst_media_raw)
    shutil.copytree(src_media, dst_media_raw)

    shutil.copy2(src_report, dst_report)

    return {
        "index": dst_index,
        "summaries": dst_summaries,
        "media_raw": dst_media_raw,
        "report": dst_report,
    }


def run_cmd(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, text=False)


def optimize_file(src: Path, dst: Path) -> bool:
    ext = src.suffix.lower()
    dst.parent.mkdir(parents=True, exist_ok=True)

    if ext in VID_EXTS:
        cmd = [
            "ffmpeg", "-y", "-i", str(src),
            "-vf", "scale='min(1920,iw)':-2:force_original_aspect_ratio=decrease",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",
            str(dst),
        ]
        result = run_cmd(cmd)
        return result.returncode == 0

    if ext == ".png":
        cmd = ["pngquant", "--quality=65-85", "--output", str(dst), "--force", "--", str(src)]
        result = run_cmd(cmd)
        return result.returncode == 0

    if ext in {".jpg", ".jpeg"}:
        shutil.copy2(src, dst)
        result = run_cmd(["jpegoptim", "--max=85", "--strip-all", str(dst)])
        return result.returncode == 0

    shutil.copy2(src, dst)
    return True


def optimize_media_tree(
    media_raw: Path,
    media_out: Path,
    max_bytes: int,
    dry_run: bool = False,
    resume: bool = True,
):
    mapping: dict[str, OptimizeResult] = {}
    rows: list[dict[str, Any]] = []

    if not media_raw.exists():
        return mapping, rows

    if not dry_run:
        if media_out.exists() and not resume:
            shutil.rmtree(media_out)
        media_out.mkdir(parents=True, exist_ok=True)

    for src in sorted(p for p in media_raw.rglob("*") if p.is_file()):
        rel = src.relative_to(media_raw).as_posix()
        dst = media_out / rel
        original_size = src.stat().st_size

        if dry_run:
            mapping[rel] = OptimizeResult(
                status="dry_run",
                optimized_rel=rel,
                reason="dry-run",
                original_size=original_size,
                optimized_size=original_size,
            )
            rows.append({
                "relative_path": rel,
                "status": "dry_run",
                "reason": "dry-run",
                "original_size": original_size,
                "optimized_size": original_size,
            })
            continue

        if resume and dst.exists():
            optimized_size = dst.stat().st_size
            if optimized_size <= max_bytes:
                mapping[rel] = OptimizeResult(
                    status="kept",
                    optimized_rel=rel,
                    reason="reused_existing",
                    original_size=original_size,
                    optimized_size=optimized_size,
                )
                rows.append({
                    "relative_path": rel,
                    "status": "kept",
                    "reason": "reused_existing",
                    "original_size": original_size,
                    "optimized_size": optimized_size,
                })
                continue
            dst.unlink(missing_ok=True)

        ok = optimize_file(src, dst)
        if not ok:
            if dst.exists():
                dst.unlink(missing_ok=True)
            mapping[rel] = OptimizeResult(
                status="failed",
                optimized_rel=None,
                reason="optimizer_failed",
                original_size=original_size,
                optimized_size=None,
            )
            rows.append({
                "relative_path": rel,
                "status": "failed",
                "reason": "optimizer_failed",
                "original_size": original_size,
                "optimized_size": "",
            })
            continue

        optimized_size = dst.stat().st_size
        if optimized_size > max_bytes:
            dst.unlink(missing_ok=True)
            mapping[rel] = OptimizeResult(
                status="excluded",
                optimized_rel=None,
                reason=f"optimized_above_limit_{max_bytes}",
                original_size=original_size,
                optimized_size=optimized_size,
            )
            rows.append({
                "relative_path": rel,
                "status": "excluded",
                "reason": f"optimized_above_limit_{max_bytes}",
                "original_size": original_size,
                "optimized_size": optimized_size,
            })
            continue

        mapping[rel] = OptimizeResult(
            status="kept",
            optimized_rel=rel,
            reason="ok",
            original_size=original_size,
            optimized_size=optimized_size,
        )
        rows.append({
            "relative_path": rel,
            "status": "kept",
            "reason": "ok",
            "original_size": original_size,
            "optimized_size": optimized_size,
        })

    return mapping, rows


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def pick_primary_candidate(candidates: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not candidates:
        return None

    def rank(c: dict[str, Any]):
        reason = c.get("selection_reason")
        rel = abs(int(c.get("relative_index", 999) or 999))
        reason_rank = {
            "same_message": 0,
            "same_author_nearby": 1,
            "any_author_fallback": 2,
        }.get(reason, 3)
        return (reason_rank, rel)

    return sorted(candidates, key=rank)[0]


def build_catalog_manifests(
    repo_root: Path,
    hyp_index_path: Path,
    summaries_dir: Path,
    media_map: dict[str, OptimizeResult],
    max_bytes: int,
    merge_ai_summaries: bool = True,
    dry_run: bool = False,
):
    entries = json.loads(hyp_index_path.read_text(encoding="utf-8"))
    v2_root = repo_root / "v2"
    v2_slugs = {p.name for p in v2_root.iterdir() if p.is_dir()} if v2_root.exists() else set()
    mappings = load_filename_mappings(repo_root / "tmp" / "filename-mappings.csv")

    apps_out_root = repo_root / "catalog" / "apps"
    manifests_out = repo_root / "catalog" / "manifests" / "apps-manifest.json"
    issue_out = repo_root / "catalog" / "issues" / "missing-media-checklist.md"

    if not dry_run:
        apps_out_root.mkdir(parents=True, exist_ok=True)

    compact_apps = []
    missing_preview = []

    for e in entries:
        app_name = e.get("app_name") or Path(e.get("filename", "app.hyp")).stem
        filename_stem = Path(e.get("filename", "app.hyp")).stem
        v2_slug = resolve_v2_slug(app_name, filename_stem, v2_slugs, mappings)

        preferred_slug = v2_slug or sanitize_slug(app_name)
        message_id = e.get("message_id") or e.get("attachment_id") or "unknown"
        app_id = f"{preferred_slug}-{message_id}"

        v2_dir = repo_root / "v2" / v2_slug if v2_slug else None
        v2_json = detect_v2_json(v2_dir) if v2_dir else None
        v2_json_data: dict[str, Any] = {}
        if v2_json and v2_json.exists():
            try:
                v2_json_data = json.loads(v2_json.read_text(encoding="utf-8"))
            except Exception:
                v2_json_data = {}

        summary_rel = (e.get("summary_path") or "").replace("research/hyp_summaries/", "")
        summary_path = summaries_dir / summary_rel if summary_rel else None
        summary_excerpt = load_summary_excerpt(summary_path) if summary_path else ""

        author_name = (e.get("user_name") or "").strip() or (v2_json_data.get("author") or "").strip()
        author_conf = "high" if e.get("user_name") else ("medium" if v2_json_data.get("author") else "low")
        author_evidence = "discord" if e.get("user_name") else ("v2_json" if v2_json_data.get("author") else "unresolved")

        raw_msg = (e.get("message_content_raw") or "").strip()
        desc = raw_msg or summary_excerpt or (v2_json_data.get("desc") or "")
        desc_source = "discord_message" if raw_msg else ("summary_excerpt" if summary_excerpt else ("v2_json_desc" if v2_json_data.get("desc") else "empty"))

        mapped_media = []
        for c in e.get("media_candidates", []):
            local_path = c.get("local_path") or ""
            # Source local_path looks like research/hyp_media/<rel>
            rel_media = ""
            marker = "research/hyp_media/"
            if marker in local_path:
                rel_media = local_path.split(marker, 1)[1]
            elif local_path.startswith("catalog/discord/hyp_media/"):
                rel_media = local_path.split("catalog/discord/hyp_media/", 1)[1]
            if not rel_media:
                continue

            opt = media_map.get(rel_media)
            excluded_large = False
            out_rel = None
            if opt and opt.status == "kept" and opt.optimized_rel:
                out_rel = f"catalog/discord/hyp_media/{opt.optimized_rel}"
            elif opt and opt.status == "excluded":
                excluded_large = True

            mapped_media.append({
                "catalog_path": out_rel,
                "original_filename": c.get("filename"),
                "content_type": c.get("content_type"),
                "relative_index": c.get("relative_index"),
                "same_author": c.get("same_author"),
                "selection_reason": c.get("selection_reason"),
                "size_bytes": opt.optimized_size if opt and opt.optimized_size is not None else opt.original_size if opt else None,
                "optimized": bool(opt and opt.status == "kept"),
                "excluded_large": excluded_large,
                "download_status": c.get("download_status"),
                "attachment_id": c.get("attachment_id"),
            })

        usable_media = [m for m in mapped_media if m.get("catalog_path")]
        primary = pick_primary_candidate(usable_media)

        flags = set(e.get("flags", []))
        needs_media_review = primary is None
        if needs_media_review:
            missing_preview.append(e)

        needs_author_review = not bool(author_name)

        manifest = {
            "app_id": app_id,
            "app_slug": preferred_slug,
            "app_name": app_name,
            "source": {
                "hyp_filename": e.get("filename"),
                "discord_attachment_id": e.get("attachment_id"),
                "discord_message_id": e.get("message_id"),
                "discord_channel": e.get("channel_name"),
                "discord_channel_category": e.get("channel_category"),
                "discord_timestamp": e.get("timestamp"),
                "discord_url": e.get("url"),
            },
            "author": {
                "display_name": author_name,
                "discord_user_id": e.get("user_id"),
                "confidence": author_conf,
                "evidence": author_evidence,
            },
            "description": {
                "short": desc,
                "raw_message_content": raw_msg,
                "summary_excerpt": summary_excerpt,
                "source_priority_used": desc_source,
            },
            "links": {
                "v2_app_dir": f"v2/{v2_slug}" if v2_slug else None,
                "v2_json_path": str(v2_json.relative_to(repo_root)) if v2_json else None,
                "hyp_summary_path": f"catalog/discord/hyp_summaries/{summary_rel}" if summary_rel else None,
            },
            "preview": {
                "primary_media_path": primary.get("catalog_path") if primary else None,
                "media_type": (Path(primary.get("catalog_path", "")).suffix.lower() if primary else None),
                "selection_reason": primary.get("selection_reason") if primary else None,
                "is_fallback_any_author": bool(primary and primary.get("selection_reason") == "any_author_fallback"),
            },
            "media": mapped_media,
            "status": {
                "has_preview": primary is not None,
                "needs_media_review": needs_media_review,
                "needs_author_review": needs_author_review,
                "flags": sorted(flags),
                "notes": "",
            },
            "generated_at": now_iso(),
            "max_commit_size_bytes": max_bytes,
        }

        ai_summary = None
        ai_summary_path = apps_out_root / app_id / "ai-summary.json"
        if merge_ai_summaries and ai_summary_path.exists():
            try:
                ai_summary = json.loads(ai_summary_path.read_text(encoding="utf-8"))
                manifest["ai"] = ai_summary
            except Exception:
                ai_summary = None

        compact_apps.append({
            "app_id": app_id,
            "app_slug": preferred_slug,
            "app_name": app_name,
            "author": author_name,
            "has_preview": primary is not None,
            "primary_preview": primary.get("catalog_path") if primary else None,
            "manifest_path": f"catalog/apps/{app_id}/manifest.json",
            "v2_app_dir": f"v2/{v2_slug}" if v2_slug else None,
            "has_ai_summary": bool(ai_summary),
            "ai_summary_path": f"catalog/apps/{app_id}/ai-summary.json" if ai_summary else None,
            "flags": sorted(flags),
        })

        if not dry_run:
            app_dir = apps_out_root / app_id
            app_dir.mkdir(parents=True, exist_ok=True)
            (app_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    compact_apps.sort(key=lambda x: x["app_name"].lower())

    global_manifest = {
        "version": 1,
        "generated_at": now_iso(),
        "counts": {
            "apps": len(compact_apps),
            "with_preview": sum(1 for a in compact_apps if a["has_preview"]),
            "missing_preview": sum(1 for a in compact_apps if not a["has_preview"]),
        },
        "apps": compact_apps,
    }

    if not dry_run:
        manifests_out.parent.mkdir(parents=True, exist_ok=True)
        manifests_out.write_text(json.dumps(global_manifest, indent=2), encoding="utf-8")

    # Issue checklist
    lines = [
        "# Missing preview media for Hyperfy app explorer ingestion",
        "",
        f"Generated: {now_iso()}",
        "",
        "## Summary",
        f"- Total apps: {len(compact_apps)}",
        f"- Missing preview: {sum(1 for a in compact_apps if not a['has_preview'])}",
        "",
        "## Checklist",
        "",
    ]

    missing_compact = [a for a in compact_apps if not a["has_preview"]]
    for a in missing_compact:
        # lookup source details for readability
        entry = next((e for e in entries if sanitize_slug(e.get("app_name", "")) == sanitize_slug(a["app_name"]) and (e.get("message_id") or e.get("attachment_id") or "unknown") in a["app_id"]), None)
        author = (entry or {}).get("user_name") or a.get("author") or "unknown"
        ts = (entry or {}).get("timestamp") or "unknown"
        msg_id = (entry or {}).get("message_id") or "unknown"
        lines.append(f"- [ ] {a['app_name']} ({author}) - {ts} - message `{msg_id}`")

    issue_body = "\n".join(lines) + "\n"
    if not dry_run:
        issue_out.parent.mkdir(parents=True, exist_ok=True)
        issue_out.write_text(issue_body, encoding="utf-8")

    return {
        "global_manifest": global_manifest,
        "missing_count": len(missing_compact),
        "issue_path": issue_out,
    }


def main():
    parser = argparse.ArgumentParser(description="Build hyperfy-apps catalog from sunset research")
    parser.add_argument("--source-research", type=Path, default=Path("/home/jin/repo/hyperfy-archive/sunset/research"))
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--max-bytes", type=int, default=MAX_BYTES_DEFAULT)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-optimize", action="store_true")
    parser.add_argument("--no-resume-optimize", action="store_true")
    parser.add_argument("--no-merge-ai-summaries", action="store_true")
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    catalog_root = repo_root / "catalog"
    catalog_discord = catalog_root / "discord"

    copied = copy_artifacts(args.source_research.resolve(), catalog_discord, dry_run=args.dry_run)

    media_map: dict[str, OptimizeResult]
    optimize_rows: list[dict[str, Any]]

    if args.skip_optimize:
        media_map, optimize_rows = {}, []
    else:
        media_out = catalog_discord / "hyp_media"
        media_map, optimize_rows = optimize_media_tree(
            copied["media_raw"],
            media_out,
            max_bytes=args.max_bytes,
            dry_run=args.dry_run,
            resume=not args.no_resume_optimize,
        )

    if not args.dry_run and not args.skip_optimize:
        opt_csv = catalog_discord / "hyp_media_optimization.csv"
        exc_csv = catalog_discord / "hyp_media_excluded.csv"
        write_csv(
            opt_csv,
            optimize_rows,
            ["relative_path", "status", "reason", "original_size", "optimized_size"],
        )
        write_csv(
            exc_csv,
            [r for r in optimize_rows if r.get("status") == "excluded"],
            ["relative_path", "status", "reason", "original_size", "optimized_size"],
        )

    result = build_catalog_manifests(
        repo_root=repo_root,
        hyp_index_path=copied["index"],
        summaries_dir=copied["summaries"],
        media_map=media_map,
        max_bytes=args.max_bytes,
        merge_ai_summaries=not args.no_merge_ai_summaries,
        dry_run=args.dry_run,
    )

    print("Catalog build complete")
    print(f"  Repo root: {repo_root}")
    print(f"  Dry run: {args.dry_run}")
    print(f"  Missing preview count: {result['missing_count']}")
    if not args.dry_run:
        print(f"  Global manifest: {repo_root / 'catalog/manifests/apps-manifest.json'}")
        print(f"  Issue checklist: {result['issue_path']}")


if __name__ == "__main__":
    main()
