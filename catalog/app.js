import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";

const html = htm.bind(React.createElement);

const EXPLORER_DATA = "./data/explorer-data.json";
const MIN_TAG_COUNT = 3; // Only show tags used by this many apps in sidebar
const MISSING_PREVIEW_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%233a3a5a' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E`;

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// ---- VideoPreview: hover to play, muted ----

function VideoPreview({ src }) {
  const ref = useRef(null);

  const onEnter = useCallback(() => {
    const v = ref.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, []);

  const onLeave = useCallback(() => {
    const v = ref.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  return html`
    <video
      ref=${ref}
      className="preview-media"
      src=${src}
      muted
      loop
      preload="metadata"
      onMouseEnter=${onEnter}
      onMouseLeave=${onLeave}
    />
  `;
}

// ---- SourceModal: fetches card.json on demand, syntax highlights ----

function SourceModal({ app, onClose }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("script");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    const cardUrl = `./apps/${app.id}/card.json`;
    fetch(cardUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { setCard(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [app.id]);

  // Highlight code after render
  useEffect(() => {
    if (card && codeRef.current && window.Prism) {
      window.Prism.highlightAllUnder(codeRef.current);
    }
  }, [card, activeTab]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const getCurrentCode = useCallback(() => {
    if (!card) return "";
    if (activeTab === "script") return card.script_excerpt || "// No script found";
    if (activeTab === "blueprint") return JSON.stringify(card.props || {}, null, 2);
    return "";
  }, [card, activeTab]);

  const onCopy = useCallback(() => {
    const text = getCurrentCode();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [getCurrentCode]);

  const lang = activeTab === "script" ? "javascript" : "json";

  return html`
    <div className="modal-overlay" onClick=${(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">${app.name.replace(/_/g, " ")} — Source</h2>
          <div className="modal-header-actions">
            <button className=${`modal-copy-btn ${copied ? "copied" : ""}`} onClick=${onCopy}>
              ${copied ? "Copied!" : "Copy"}
            </button>
            <button className="modal-close-btn" onClick=${onClose}>Close</button>
          </div>
        </div>

        ${!loading && card ? html`
          <div className="modal-tabs">
            ${card.script_excerpt ? html`
              <button className=${`modal-tab ${activeTab === "script" ? "active" : ""}`}
                onClick=${() => setActiveTab("script")}>index.js</button>
            ` : null}
            ${card.props && Object.keys(card.props).length > 0 ? html`
              <button className=${`modal-tab ${activeTab === "blueprint" ? "active" : ""}`}
                onClick=${() => setActiveTab("blueprint")}>Props / Blueprint</button>
            ` : null}
          </div>
        ` : null}

        <div className="modal-body" ref=${codeRef}>
          ${loading ? html`<div className="modal-loading">Loading source...</div>` : null}
          ${error ? html`<div className="modal-error">Failed to load: ${error}</div>` : null}
          ${!loading && !error && card ? html`
            <pre className=${`language-${lang}`}><code className=${`language-${lang}`}>${getCurrentCode()}</code></pre>
          ` : null}
        </div>

        ${!loading && card ? html`
          <div className="modal-meta">
            ${card.asset_files?.length ? html`
              <span className="modal-meta-item"><strong>Assets:</strong> ${card.asset_files.join(", ")}</span>
            ` : null}
            <span className="modal-meta-item"><strong>Complexity:</strong> ${card.script_complexity}</span>
            <span className="modal-meta-item"><strong>Networking:</strong> ${card.networking}</span>
          </div>
        ` : null}
      </div>
    </div>
  `;
}

// ---- AppCard ----

function AppCard({ app, onTagClick, onSourceClick }) {
  const previewSrc = app.preview_url ? `../${app.preview_url}` : null;
  const downloadHref = app.download_path ? `../${app.download_path}` : null;
  const dateStr = formatDate(app.created_at);

  return html`
    <article className="card">
      <div className="preview-wrap">
        ${previewSrc
          ? app.preview_type === "video"
            ? html`
                <${VideoPreview} src=${previewSrc} />
                <span className="preview-badge video">VIDEO</span>
              `
            : html`<img className="preview-media" src=${previewSrc} alt=${app.name} loading="lazy" />`
          : html`
              <div className="preview-placeholder">
                <img src=${MISSING_PREVIEW_SVG} alt="" />
              </div>
            `}
      </div>

      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">${app.name.replace(/_/g, " ")}</h3>
        </div>

        <div className="card-meta">
          <span className="card-author">${app.author}</span>
          ${dateStr ? html`<span> · ${dateStr}</span>` : null}
        </div>

        ${app.description
          ? html`<p className="card-desc">${app.description}</p>`
          : null}

        ${app.tags.length > 0
          ? html`
              <div className="card-tags">
                ${app.tags.map(
                  (tag) => html`
                    <span
                      key=${tag}
                      className="card-tag"
                      onClick=${(e) => { e.stopPropagation(); onTagClick(tag); }}
                    >${tag}</span>
                  `
                )}
              </div>
            `
          : null}

        <div className="card-badges">
          ${app.script_complexity
            ? html`<span className=${`meta-badge complexity-${app.script_complexity}`}>${app.script_complexity} complexity</span>`
            : null}
          ${app.networking && app.networking !== "none"
            ? html`<span className="meta-badge">${app.networking}</span>`
            : null}
          ${app.asset_profile
            ? html`<span className="meta-badge">${app.asset_profile} assets</span>`
            : null}
        </div>

        <div className="card-actions">
          ${downloadHref
            ? html`<a className="card-btn primary" href=${downloadHref} download=${app.hyp_filename}>Download .hyp</a>`
            : html`<span className="card-btn" style=${{ opacity: 0.4, cursor: "default" }}>No .hyp</span>`}
          ${app.has_source
            ? html`<button className="card-btn" onClick=${(e) => { e.stopPropagation(); onSourceClick(app); }}>Source</button>`
            : null}
        </div>
      </div>
    </article>
  `;
}

// ---- TagSidebar ----

function TagSidebar({ tagIndex, activeTags, onTagToggle }) {
  const filteredTags = useMemo(() => {
    return Object.entries(tagIndex)
      .filter(([, apps]) => apps.length >= MIN_TAG_COUNT)
      .sort((a, b) => b[1].length - a[1].length);
  }, [tagIndex]);

  return html`
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Tags (${filteredTags.length})</h2>
      </div>
      <div className="tag-list">
        ${filteredTags.map(
          ([tag, apps]) => html`
            <div
              key=${tag}
              className=${`tag-item ${activeTags.has(tag) ? "active" : ""}`}
              onClick=${() => onTagToggle(tag)}
            >
              <span>${tag}</span>
              <span className="tag-count">${apps.length}</span>
            </div>
          `
        )}
      </div>
    </aside>
  `;
}

// ---- MobileTags ----

function MobileTags({ tagIndex, activeTags, onTagToggle }) {
  const filteredTags = useMemo(() => {
    return Object.entries(tagIndex)
      .filter(([, apps]) => apps.length >= MIN_TAG_COUNT)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 30);
  }, [tagIndex]);

  return html`
    <div className="mobile-tags">
      ${filteredTags.map(
        ([tag]) => html`
          <span
            key=${tag}
            className=${`mobile-tag ${activeTags.has(tag) ? "active" : ""}`}
            onClick=${() => onTagToggle(tag)}
          >${tag}</span>
        `
      )}
    </div>
  `;
}

// ---- Explorer (main) ----

function Explorer() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("name");
  const [filterMode, setFilterMode] = useState("all"); // all, preview, source
  const [activeTags, setActiveTags] = useState(new Set());
  const [sourceApp, setSourceApp] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(EXPLORER_DATA)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  const onTagToggle = useCallback((tag) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTags(new Set());
    setQuery("");
    setFilterMode("all");
  }, []);

  const filteredApps = useMemo(() => {
    if (!data?.apps) return [];
    const q = query.trim().toLowerCase();

    let out = data.apps.filter((app) => {
      // Text search
      if (q) {
        const hay = `${app.name} ${app.author} ${app.description} ${app.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Filter mode
      if (filterMode === "no-preview" && app.has_preview) return false;
      if (filterMode === "source" && !app.has_source) return false;

      // Tag filter (AND: app must have all active tags)
      if (activeTags.size > 0) {
        for (const tag of activeTags) {
          if (!app.tags.includes(tag)) return false;
        }
      }

      return true;
    });

    // Sort
    if (sortMode === "newest") {
      out.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    } else if (sortMode === "oldest") {
      out.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    } else if (sortMode === "author") {
      out.sort((a, b) => (a.author || "").localeCompare(b.author || "") || a.name.localeCompare(b.name));
    } else {
      out.sort((a, b) => a.name.localeCompare(b.name));
    }

    return out;
  }, [data, query, sortMode, filterMode, activeTags]);

  const hasActiveFilters = activeTags.size > 0 || filterMode !== "all" || query.trim();

  // ---- Loading / Error ----

  if (error) {
    return html`
      <div className="layout">
        <div className="main">
          <div className="empty">
            <div className="empty-text">Failed to load explorer data</div>
            <div className="empty-sub">${error}</div>
            <div className="empty-sub" style=${{ marginTop: "12px" }}>
              Run <code>uv run python scripts/catalog/build_explorer_data.py</code> then serve from repo root.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (!data) {
    return html`
      <div className="layout">
        <div className="main">
          <div className="loading">
            <div className="loading-spinner"></div>
            <div>Loading explorer data...</div>
          </div>
        </div>
      </div>
    `;
  }

  return html`
    <div className="layout">
      <${TagSidebar}
        tagIndex=${data.tag_index}
        activeTags=${activeTags}
        onTagToggle=${onTagToggle}
      />

      <div className="main">
        <header className="header">
          <h1 className="title">Hyperfy App Explorer</h1>
          <p className="subtitle">Browse ${data.counts.total} community apps with AI-generated descriptions, tags, and downloadable .hyp files.</p>
          <div className="stats">
            <div className="stat">
              <span className="stat-value">${data.counts.total}</span>
              <span className="stat-label">apps</span>
            </div>
            <div className="stat">
              <span className="stat-value">${data.counts.with_preview}</span>
              <span className="stat-label">with preview</span>
            </div>
            <div className="stat">
              <span className="stat-value">${Object.keys(data.tag_index).length}</span>
              <span className="stat-label">tags</span>
            </div>
            <div className="stat">
              <span className="stat-value">${filteredApps.length}</span>
              <span className="stat-label">showing</span>
            </div>
          </div>
        </header>

        <${MobileTags}
          tagIndex=${data.tag_index}
          activeTags=${activeTags}
          onTagToggle=${onTagToggle}
        />

        <div className="controls">
          <div className="search-wrap">
            <span className="search-icon">&#128269;</span>
            <input
              className="search"
              type="search"
              placeholder="Search apps, authors, tags..."
              value=${query}
              onInput=${(e) => setQuery(e.target.value)}
            />
          </div>

          <select className="select" value=${sortMode} onChange=${(e) => setSortMode(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="author">Sort: Author</option>
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>

          <button
            className=${`filter-btn ${filterMode === "no-preview" ? "active" : ""}`}
            onClick=${() => setFilterMode(filterMode === "no-preview" ? "all" : "no-preview")}
          >Missing Preview</button>

          <button
            className=${`filter-btn ${filterMode === "source" ? "active" : ""}`}
            onClick=${() => setFilterMode(filterMode === "source" ? "all" : "source")}
          >With Source</button>
        </div>

        ${hasActiveFilters
          ? html`
              <div className="active-filters">
                ${Array.from(activeTags).map(
                  (tag) => html`
                    <span key=${tag} className="active-filter-chip" onClick=${() => onTagToggle(tag)}>
                      ${tag} ✕
                    </span>
                  `
                )}
                ${hasActiveFilters
                  ? html`<span className="clear-filters" onClick=${clearFilters}>Clear all</span>`
                  : null}
              </div>
            `
          : null}

        ${filteredApps.length === 0
          ? html`
              <div className="empty">
                <div className="empty-icon">&#128270;</div>
                <div className="empty-text">No apps match your filters</div>
                <div className="empty-sub">Try adjusting your search or clearing tag filters.</div>
              </div>
            `
          : html`
              <section className="grid">
                ${filteredApps.map(
                  (app) => html`<${AppCard} key=${app.id} app=${app} onTagClick=${onTagToggle} onSourceClick=${setSourceApp} />`
                )}
              </section>
            `}
      </div>

      ${sourceApp
        ? html`<${SourceModal} app=${sourceApp} onClose=${() => setSourceApp(null)} />`
        : null}
    </div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${Explorer} />`);
