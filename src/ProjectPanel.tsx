import React, { useState, useMemo } from "react";
import type { Project, Scene } from "./types";

const LS_KEY = "cinerig_projects";

export function loadAllProjects(): Project[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
  catch { return []; }
}

export function saveProject(project: Project): void {
  const all = loadAllProjects();
  const idx = all.findIndex(p => p.id === project.id);
  if (idx >= 0) all[idx] = project;
  else all.push(project);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

export function deleteProject(id: string): void {
  const all = loadAllProjects().filter(p => p.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

const font = "-apple-system, 'SF Pro Display', Inter, sans-serif";

const C = {
  bg:        "#FFFFFF",
  pageBg:    "#FAFAFA",
  sectionBg: "#F5F5F7",
  hoverBg:   "#F0F0F2",
  border:    "rgba(0,0,0,0.08)",
  borderMid: "rgba(0,0,0,0.12)",
  text:      "#1d1d1f",
  textDim:   "#6e6e73",
  textLight: "#86868b",
  accent:    "#005BA6",
  accentHov: "#0070C9",
  accentBg:  "#E6F0FA",
  danger:    "#d72b3f",
} as const;

// ── Scene thumbnail ────────────────────────────────────────────────────────────

function SceneThumbnail({ scene }: { scene: Scene }) {
  const cams  = scene.cameras.length;
  const mons  = scene.monitors.length;
  const ws    = scene.wirelessSets.length;
  const convs = (scene.converters  ?? []).length;
  const mvs   = (scene.multiviewers ?? []).length;

  const Box = ({ color, n }: { color: string; n: number }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
      {Array.from({ length: Math.min(n, 3) }).map((_, i) => (
        <div key={i} style={{ width: 18, height: 9, background: color, borderRadius: 2, opacity: 0.82 }} />
      ))}
      {n > 3 && <div style={{ fontSize: 7, color: C.textLight, fontFamily: font }}>+{n - 3}</div>}
      {n === 0 && <div style={{ width: 18, height: 9, background: "#e5e5ea", borderRadius: 2 }} />}
    </div>
  );

  const Arrow = () => (
    <div style={{ color: "#c7c7cc", fontSize: 9, lineHeight: 1, flexShrink: 0 }}>›</div>
  );

  return (
    <div style={{
      width: "100%", height: 52,
      background: C.sectionBg,
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      padding: "0 8px",
      boxSizing: "border-box",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <Box color="#30d158" n={cams} />
      {ws > 0 && <><Arrow /><Box color="#ff9f0a" n={ws} /></>}
      {convs > 0 && <><Arrow /><Box color="#0ea5e9" n={convs} /></>}
      {mvs > 0 && <><Arrow /><Box color="#22c55e" n={mvs} /></>}
      {mons > 0 && <><Arrow /><Box color="#8e8e93" n={mons} /></>}
    </div>
  );
}

// ── Scene summary text ─────────────────────────────────────────────────────────

function sceneSummary(scene: Scene): string {
  const parts: string[] = [];
  if (scene.cameras.length)           parts.push(`カメラ×${scene.cameras.length}`);
  if (scene.monitors.length)          parts.push(`モニター×${scene.monitors.length}`);
  if (scene.wirelessSets.length)      parts.push(`ワイヤレス×${scene.wirelessSets.length}`);
  if ((scene.converters ?? []).length)   parts.push(`コンバーター×${scene.converters!.length}`);
  if ((scene.multiviewers ?? []).length) parts.push(`MV×${scene.multiviewers!.length}`);
  return parts.join(" · ") || "機材なし";
}

// ── Project card ───────────────────────────────────────────────────────────────

function ProjectCard({ project, onLoad, onDelete }: {
  project: Project;
  onLoad: (p: Project) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const [hov, setHov] = useState(false);
  const [delHov, setDelHov] = useState(false);

  const dateStr = project.date
    ? new Date(project.date).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
    : "—";

  return (
    <div
      onClick={() => onLoad(project)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bg,
        border: `1.5px solid ${hov ? C.accent : C.border}`,
        borderRadius: 10,
        padding: "12px 12px 10px",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: hov ? `0 2px 12px rgba(0,91,166,0.10)` : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "border-color 0.15s ease-out, box-shadow 0.15s ease-out",
        userSelect: "none",
      }}
    >
      {/* Thumbnail */}
      <SceneThumbnail scene={project.scene} />

      {/* Name */}
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.3, wordBreak: "break-all" }}>
        {project.name || "無題"}
      </div>

      {/* Author + date */}
      <div style={{ fontSize: 10, color: C.textLight, display: "flex", gap: 6, alignItems: "center" }}>
        {project.author && (
          <span style={{ fontWeight: 500, color: C.textDim }}>{project.author}</span>
        )}
        <span>{dateStr}</span>
      </div>

      {/* Notes */}
      {project.notes && (
        <div style={{
          fontSize: 10, color: C.textDim,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          lineHeight: 1.4,
        }}>
          {project.notes}
        </div>
      )}

      {/* Summary */}
      <div style={{
        fontSize: 9, color: C.textLight, fontWeight: 500,
        background: C.sectionBg, borderRadius: 5, padding: "3px 6px",
        lineHeight: 1.5,
      }}>
        {sceneSummary(project.scene)}
      </div>

      {/* Delete button */}
      <button
        onClick={e => onDelete(project.id, e)}
        onMouseEnter={() => setDelHov(true)}
        onMouseLeave={() => setDelHov(false)}
        style={{
          position: "absolute", top: 7, right: 7,
          background: delHov ? "#FFF0F0" : "transparent",
          border: `1px solid ${delHov ? "#fecaca" : "transparent"}`,
          borderRadius: 5,
          color: delHov ? C.danger : C.textLight,
          fontSize: 12, lineHeight: 1,
          padding: "2px 5px",
          cursor: "pointer",
          transition: "all 0.15s ease-out",
        }}
        title="削除"
      >×</button>
    </div>
  );
}

// ── Project Library (main modal) ───────────────────────────────────────────────

interface LibraryProps {
  onLoad: (p: Project) => void;
  onClose: () => void;
  onNew: () => void;
}

export function ProjectLibrary({ onLoad, onClose, onNew }: LibraryProps) {
  const [projects, setProjects] = useState<Project[]>(() =>
    [...loadAllProjects()].reverse()
  );
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      (p.notes ?? "").toLowerCase().includes(q)
    );
  }, [projects, query]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(4px)",
        fontFamily: font,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.bg,
        borderRadius: 14,
        width: "min(860px, 92vw)",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        border: `1px solid ${C.border}`,
      }}>
        {/* Header */}
        <div style={{
          background: C.sectionBg,
          borderBottom: `1px solid ${C.border}`,
          padding: "13px 18px 11px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: -0.3, flex: 1 }}>
            案件ライブラリ
          </span>

          {/* Search */}
          <input
            type="text"
            placeholder="検索..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              background: C.bg,
              border: `1px solid ${searchFocused ? C.accent : C.border}`,
              borderRadius: 6,
              padding: "5px 10px",
              fontSize: 11,
              color: C.text,
              outline: "none",
              width: 180,
              transition: "border-color 0.2s",
              fontFamily: font,
            }}
          />

          {/* New button */}
          <button
            onClick={onNew}
            style={{
              background: C.accent,
              border: "none",
              borderRadius: 6,
              color: "#FFFFFF",
              fontSize: 11, fontWeight: 600,
              padding: "6px 14px",
              cursor: "pointer",
              fontFamily: font,
            }}
          >＋ 新規作成</button>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              cursor: "pointer", color: C.textLight, fontSize: 16, lineHeight: 1,
              padding: "0 2px",
            }}
          >×</button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
          {filtered.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: 200, gap: 8,
            }}>
              <div style={{ fontSize: 32, opacity: 0.2 }}>📁</div>
              <div style={{ fontSize: 13, color: C.textLight }}>
                {query ? "検索結果がありません" : "案件がありません"}
              </div>
              {!query && (
                <button
                  onClick={onNew}
                  style={{
                    marginTop: 4,
                    background: C.accentBg, border: `1px solid ${C.accent}`,
                    borderRadius: 6, color: C.accent,
                    fontSize: 11, fontWeight: 600, padding: "6px 16px", cursor: "pointer", fontFamily: font,
                  }}
                >最初の案件を作成</button>
              )}
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 12,
            }}>
              {filtered.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onLoad={p => { onLoad(p); onClose(); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer count */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "8px 18px",
          display: "flex", alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: C.textLight }}>
            {filtered.length} 件{query ? "（絞り込み中）" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── New Project Modal ──────────────────────────────────────────────────────────

interface NewProjectProps {
  hasUnsaved: boolean;
  onConfirm: (name: string, author: string, notes: string) => void;
  onClose: () => void;
}

export function NewProjectModal({ hasUnsaved, onConfirm, onClose }: NewProjectProps) {
  const [name,   setName]   = useState("新規案件");
  const [author, setAuthor] = useState("");
  const [notes,  setNotes]  = useState("");
  const [step,   setStep]   = useState<"confirm" | "form">(hasUnsaved ? "confirm" : "form");

  const fieldStyle: React.CSSProperties = {
    width: "100%", background: C.pageBg,
    border: `1px solid ${C.border}`,
    borderRadius: 6, padding: "7px 10px",
    fontSize: 12, color: C.text, outline: "none",
    boxSizing: "border-box", fontFamily: font,
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2500,
        backdropFilter: "blur(4px)",
        fontFamily: font,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.bg,
        borderRadius: 12,
        width: 380, maxWidth: "92vw",
        boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
        border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: C.sectionBg,
          borderBottom: `1px solid ${C.border}`,
          padding: "12px 16px 10px",
          display: "flex", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1, letterSpacing: -0.2 }}>
            {step === "confirm" ? "未保存の変更があります" : "新規案件を作成"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, fontSize: 16, lineHeight: 1 }}>×</button>
        </div>

        {step === "confirm" ? (
          <div style={{ padding: "16px" }}>
            <p style={{ fontSize: 12, color: C.textDim, margin: "0 0 16px", lineHeight: 1.6 }}>
              現在の案件に未保存の変更があります。<br />続けると変更が失われます。
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ ...btnBase, background: "transparent", border: `1px solid ${C.border}`, color: C.textDim }}>
                キャンセル
              </button>
              <button onClick={() => setStep("form")} style={{ ...btnBase, background: C.danger, color: "#fff", border: "none" }}>
                破棄して続ける
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "16px" }}>
            <div style={{ marginBottom: 10 }}>
              <FieldLabel>案件名</FieldLabel>
              <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="案件名" autoFocus />
            </div>
            <div style={{ marginBottom: 10 }}>
              <FieldLabel>担当者</FieldLabel>
              <input style={fieldStyle} value={author} onChange={e => setAuthor(e.target.value)} placeholder="担当者名（任意）" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>メモ（任意）</FieldLabel>
              <textarea
                style={{ ...fieldStyle, resize: "vertical", minHeight: 56 }}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="メモ"
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ ...btnBase, background: "transparent", border: `1px solid ${C.border}`, color: C.textDim }}>
                キャンセル
              </button>
              <button
                onClick={() => onConfirm(name.trim() || "新規案件", author.trim(), notes.trim())}
                style={{ ...btnBase, background: C.accent, color: "#fff", border: "none" }}
              >
                作成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: 0.5, marginBottom: 4, textTransform: "uppercase" as const }}>
      {children}
    </div>
  );
}

const btnBase: React.CSSProperties = {
  borderRadius: 6, padding: "6px 16px",
  fontSize: 12, fontWeight: 600, cursor: "pointer",
  fontFamily: font,
};
