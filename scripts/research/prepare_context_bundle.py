#!/usr/bin/env python3
"""Prepare a local context bundle for AI summarization in hyperfy-apps.

Copies curated Hyperfy docs and hyperfy-archiver references into:
  catalog/context/

Also creates compact snippet files used by the OpenRouter summarizer.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
CONTEXT_ROOT = REPO_ROOT / "catalog" / "context"
SNIPPETS_DIR = CONTEXT_ROOT / "snippets"

SOURCE_FILES = [
    Path("/home/jin/.codex/skills/hyperfy-archiver/references/research-tools.md"),
    Path("/home/jin/.codex/skills/hyperfy-archiver/references/data-structures.md"),
    Path("/home/jin/.codex/skills/hyperfy-archiver/references/entity-details.md"),
    Path("/home/jin/repo/hyperfy/docs/scripting/README.md"),
    Path("/home/jin/repo/hyperfy/docs/scripting/app/App.md"),
    Path("/home/jin/repo/hyperfy/docs/scripting/world/World.md"),
    Path("/home/jin/repo/hyperfy/docs/scripting/Networking.md"),
    Path("/home/jin/repo/hyperfy/docs/supported-files/hyp-format.md"),
]


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sanitize_slug(value: str) -> str:
    out = value.lower()
    for ch in [" ", "/", "\\", ":", "(", ")", "[", "]", "{", "}", "&", ",", "."]:
        out = out.replace(ch, "-")
    while "--" in out:
        out = out.replace("--", "-")
    return out.strip("-")


def compact_text_for_snippet(text: str, max_chars: int = 7000) -> str:
    lines = []
    for ln in text.splitlines():
        if ln.strip().startswith("```"):
            continue
        lines.append(ln.rstrip())
    joined = "\n".join(lines).strip()
    return joined[:max_chars]


def main() -> int:
    CONTEXT_ROOT.mkdir(parents=True, exist_ok=True)
    SNIPPETS_DIR.mkdir(parents=True, exist_ok=True)

    copied = []
    missing = []

    source_dir = CONTEXT_ROOT / "source"
    source_dir.mkdir(parents=True, exist_ok=True)

    for src in SOURCE_FILES:
        if not src.exists():
            missing.append(str(src))
            continue

        bucket = "docs" if "/hyperfy/docs/" in str(src) else "refs"
        out_name = f"{bucket}__{src.parent.name}__{src.name}"
        dst = source_dir / out_name
        text = src.read_text(encoding="utf-8", errors="ignore")
        dst.write_text(text, encoding="utf-8")

        snippet_name = sanitize_slug(dst.stem) + ".snippet.txt"
        snippet_path = SNIPPETS_DIR / snippet_name
        snippet_path.write_text(compact_text_for_snippet(text), encoding="utf-8")

        copied.append(
            {
                "source": str(src),
                "copied_path": str(dst.relative_to(REPO_ROOT)),
                "snippet_path": str(snippet_path.relative_to(REPO_ROOT)),
                "chars": len(text),
            }
        )

    readme = CONTEXT_ROOT / "README.md"
    readme.write_text(
        "\n".join(
            [
                "# Catalog Context Bundle",
                "",
                "Curated context for OpenRouter app summarization.",
                "",
                "- `source/`: copied full source docs/references",
                "- `snippets/`: compact prompt-ready snippets",
                "",
                f"Generated: {now_iso()}",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    index = {
        "generated_at": now_iso(),
        "copied_count": len(copied),
        "missing_count": len(missing),
        "files": copied,
        "missing": missing,
    }
    (CONTEXT_ROOT / "context-index.json").write_text(json.dumps(index, indent=2), encoding="utf-8")

    print(f"Context bundle ready: {CONTEXT_ROOT}")
    print(f"  copied: {len(copied)}")
    print(f"  missing: {len(missing)}")
    if missing:
        for item in missing:
            print(f"    - {item}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
