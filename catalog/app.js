import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";

const html = htm.bind(React.createElement);

const EXPLORER_DATA = "./explorer-data.json";
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

  const downloadHref = app.download_path || null;
  const dateStr = formatDate(app.created_at);
  const previewSrc = app.preview_url || null;

  return html`
    <div className="modal-overlay" onClick=${(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">${app.name.replace(/_/g, " ")}</h2>
          <button className="modal-close-btn" onClick=${onClose}>Close</button>
        </div>

        ${previewSrc ? html`
          <div className="modal-preview">
            ${app.preview_type === "video"
              ? html`<video className="modal-preview-media" src=${previewSrc} muted loop autoplay playsinline />`
              : html`<img className="modal-preview-media" src=${previewSrc} alt=${app.name} />`}
          </div>
        ` : null}

        <div className="modal-info">
          ${app.description ? html`<p className="modal-desc">${app.description}</p>` : null}
          <div className="modal-info-meta">
            ${app.author ? html`<span className="modal-info-author">${app.author}</span>` : null}
            ${dateStr ? html`<span className="modal-info-date">${dateStr}</span>` : null}
          </div>
          ${app.tags?.length > 0 ? html`
            <div className="modal-info-tags">
              ${app.tags.map((tag) => html`<span key=${tag} className="modal-info-tag">${tag}</span>`)}
            </div>
          ` : null}
          ${downloadHref
            ? html`<div className="modal-info-actions">
                <a className="modal-download-btn" href=${downloadHref} download=${app.hyp_filename}>Download .hyp</a>
              </div>`
            : null}
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
            <button className=${`modal-copy-btn ${copied ? "copied" : ""}`} onClick=${onCopy}>
              ${copied ? "Copied!" : "Copy"}
            </button>
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

function AppCard({ app, onTagClick, onSourceClick, onAuthorClick }) {
  const previewSrc = app.preview_url || null;
  const downloadHref = app.download_path || null;
  const dateStr = formatDate(app.created_at);

  const hypUrl = useMemo(() => {
    if (!app.download_path) return null;
    try {
      return new URL(app.download_path, window.location.href).href;
    } catch { return null; }
  }, [app.download_path]);

  const onDragStart = useCallback((e) => {
    if (!hypUrl) return;
    e.dataTransfer.setData("text/uri-list", hypUrl);
    e.dataTransfer.setData("text/plain", hypUrl);
    const filename = app.hyp_filename || app.download_path?.split("/").pop() || "app.hyp";
    e.dataTransfer.setData("DownloadURL", `application/octet-stream:${filename}:${hypUrl}`);
    e.dataTransfer.effectAllowed = "copy";
  }, [hypUrl, app.hyp_filename, app.download_path]);

  return html`
    <article className="card">
      <div className="preview-wrap" draggable=${!!hypUrl} onDragStart=${onDragStart}>
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
        ${hypUrl ? html`
          <div className="drag-indicator">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
        ` : null}
      </div>

      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">${app.name.replace(/_/g, " ")}</h3>
        </div>

        <div className="card-meta">
          <span className="card-author" onClick=${(e) => { e.stopPropagation(); onAuthorClick(app.author); }}>${app.author}</span>
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

        <div className="card-actions">
          ${downloadHref
            ? html`<a className="card-btn primary" href=${downloadHref} download=${app.hyp_filename}>Download .hyp</a>`
            : html`<span className="card-btn" style=${{ opacity: 0.4, cursor: "default" }}>No .hyp</span>`}
          ${app.has_source
            ? html`<button className="card-btn" onClick=${(e) => { e.stopPropagation(); onSourceClick(app); }}>More info</button>`
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
      <div className="sidebar-footer">
        <a className="sidebar-footer-link" href="https://github.com/madjin/hyperfy-apps/issues" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>
          Report Issues
        </a>
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
  const [filterMode, setFilterMode] = useState("all"); // all, preview
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

  const onAuthorClick = useCallback((author) => {
    setQuery(author);
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
          <h1 className="title"><a href="https://hyperfy.xyz/" target="_blank" rel="noopener noreferrer" style=${{background: 'linear-gradient(90deg, #a78bfa, #06b6d4, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none'}}>Hyperfy</a> App Explorer <span style=${{fontSize: '0.4em', fontWeight: 400, color: 'rgba(255,255,255,0.45)', marginLeft: '0.5em'}}>made by <a href="https://github.com/madjin" target="_blank" rel="noopener noreferrer" style=${{color: 'rgba(255,255,255,0.55)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)'}}>jin</a></span></h1>
          <p className="subtitle">Browse ${data.counts.total} community apps with AI-generated descriptions, tags, and downloadable .hyp files.</p>
          <div className="stats">
            <div className="stat">
              <span className="stat-value">${data.counts.total}</span>
              <span className="stat-label">apps</span>
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
            <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
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
                  (app) => html`<${AppCard} key=${app.id} app=${app} onTagClick=${onTagToggle} onSourceClick=${setSourceApp} onAuthorClick=${onAuthorClick} />`
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
