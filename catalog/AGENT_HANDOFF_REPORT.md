# Hyperfy Apps Catalog - Agent Handoff Report (Updated)

Generated: 2026-02-15 (UTC)
Repo: `/home/jin/repo/hyperfy-apps`
Branch: `explorer`
HEAD: `cc7602a`

## Purpose

This file is the operational handoff for an agent to finish the current migration/build state, create clean commits, and open a PR with clear scope.

## Current Truth Snapshot

1. Branch sync
- `origin/explorer...HEAD`: `0 0` (no ahead/behind divergence)

2. High-impact recent commits (already on branch)
- `cc7602a` Move explorer to `catalog/` root for cleaner URL
- `f52f57d` Generate AI preview images for missing previews
- `16b85e2` Add source code modal and re-run AI summaries with kimi-k2.5
- `7f71215` Add app explorer with AI summaries, build pipeline, and dark UI

3. Live artifact state
- `catalog/manifests/apps-manifest.json`
  - `generated_at`: `2026-02-15T07:17:42+00:00`
  - counts: `apps=179`, `with_preview=115`, `missing_preview=64`
- `catalog/data/explorer-data.json`
  - `generated_at`: `2026-02-15T07:17:42+00:00`
  - counts: `total=179`, `with_preview=168`
- `catalog/manifests/ai-summary-report.json`
  - `generated_at`: `2026-02-14T22:08:13+00:00`
  - model: `moonshotai/kimi-k2.5`
  - counts: `ok=5`, `skipped_existing=0`, `failed=0`

4. Current working tree risk profile
- Total changed entries: `782`
- Status mix:
  - `D`: `349`
  - `??`: `219`
  - `M`: `214`
- This is a rename/migration-heavy state with old+new slug variants coexisting in places.

## What Changed Since Previous Handoff

The old report (2026-02-11) is partially stale. Key updates:
- Explorer files are now rooted at `catalog/`:
  - `catalog/index.html`, `catalog/app.js`, `catalog/styles.css`
- Summarizer default model is now `moonshotai/kimi-k2.5`.
- Manifest links now use `v2/apps/<slug>` conventions.
- Additional generated layer exists:
  - `catalog/data/explorer-data.json`
  - `catalog/apps/*/card.json`

## Current Pipeline (Source of Truth)

1. Catalog build
- Script: `scripts/catalog/build_catalog.py`
- npm: `npm run catalog:build`

2. Context bundle
- Script: `scripts/research/prepare_context_bundle.py`
- npm: `npm run catalog:context`

3. AI summaries
- Script: `scripts/research/summarize_hyp_files_openrouter.py`
- npm: `npm run catalog:summarize`

4. Explorer data build
- Script: `scripts/catalog/build_explorer_data.py`
- npm: `npm run explorer:build`

5. End-to-end local build (without media optimization)
- npm: `npm run build:all`

## Commit + PR Execution Plan (Decision Complete)

Goal: avoid one giant mixed commit. Keep logic changes separate from mass-generated output and path migrations.

1. Commit A - script/tooling logic only
- Stage only:
  - `scripts/catalog/*.py`
  - `scripts/research/*.py`
  - `scripts/hyp_tool.py`
  - `package.json` (if script wiring changed)
  - `filename-mappings.csv` (if logic dependency)
- Verify:
  - `npm run catalog:dry-run`
  - `npm run explorer:build`

2. Commit B - path/slug migration (structural)
- Stage only structural app path transitions:
  - `v2/apps/**` renames/adds/removals
  - `catalog/apps/**` directory name normalization where applicable
- Important: ensure there is one canonical path per app-id; remove duplicate underscore/hyphen parallel variants.

3. Commit C - regenerated data artifacts
- Stage generated outputs after one clean rebuild:
  - `catalog/manifests/**`
  - `catalog/data/explorer-data.json`
  - `catalog/issues/missing-media-checklist.md`
  - `catalog/apps/**/{manifest.json,ai-summary.json,card.json}`
  - `catalog/generated_previews/**` (if intentionally tracked)

4. Commit D - docs/handoff
- Stage only docs:
  - `catalog/AGENT_HANDOFF_REPORT.md`
  - any README updates related to new flow/paths

## Mandatory Validation Before PR

1. Build checks
- `npm run catalog:build`
- `npm run explorer:build`

2. Data consistency checks
- App counts align:
  - `catalog/manifests/apps-manifest.json` apps == `catalog/data/explorer-data.json` total
- Spot-check at least 10 random apps:
  - `manifest.json` exists
  - `ai-summary.json` exists (or intentional gap is documented)
  - `card.json` exists
  - preview/download/source fields resolve

3. Churn check
- Re-run `npm run explorer:build` once and confirm no unexpected second-pass diff.

## PR Template Guidance

Use this structure in the PR body:

1. What changed
- Explorer root layout under `catalog/`
- Slug/path normalization (`v2/apps/<slug>`)
- Summarization/model pipeline updates
- Regenerated manifests/cards/explorer data

2. Why
- Make ingestion deterministic
- Remove path inconsistencies and duplicate app identifiers
- Improve agent-facing metadata quality

3. Risks
- Rename-heavy diff can hide accidental deletions
- Duplicate app-id variants (underscore/hyphen) if not fully normalized
- Generated artifacts can obscure logic changes

4. Validation performed
- List exact commands run and quick result summary

## Notes for Agent Triage

1. Do not trust old path forms by default.
- Prefer current canonical slugized paths.

2. Treat `catalog/data/explorer-data.json` as explorer-facing contract.
- `catalog/apps/*/card.json` is secondary per-app agent payload.

3. Keep commits small and reviewable.
- If needed, split Commit B (migration) into smaller topical commits by directory prefix.

## File references for this handoff
- `catalog/AGENT_HANDOFF_REPORT.md`
- `catalog/manifests/apps-manifest.json`
- `catalog/manifests/ai-summary-report.json`
- `catalog/data/explorer-data.json`
- `scripts/catalog/build_catalog.py`
- `scripts/catalog/build_explorer_data.py`
- `scripts/research/summarize_hyp_files_openrouter.py`
