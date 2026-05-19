import React, { useState } from "react";
import type { Project, Scene } from "./types";
import { Modal } from "./Modal";

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

interface ProjectMeta {
  id: string;
  name: string;
  author: string;
  notes: string;
  date: string;
}

interface Props {
  meta: ProjectMeta;
  scene: Scene;
  onChangeMeta: (m: ProjectMeta) => void;
  onLoad: (p: Project) => void;
  onNew: () => void;
  onClose: () => void;
}

const C = {
  border: "rgba(0,0,0,0.08)",
  text: "#1d1d1f",
  textDim: "#6e6e73",
  textLight: "#86868b",
  sectionBg: "#F5F5F7",
  accent: "#005BA6",
  accentBg: "#E6F0FA",
  pageBg: "#FAFAFA",
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: 0.5, marginBottom: 4, textTransform: "uppercase" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: C.pageBg,
  border: `1px solid ${C.border}`,
  borderRadius: 5,
  padding: "5px 8px",
  fontSize: 11,
  color: C.text,
  outline: "none",
  boxSizing: "border-box",
};

export function ProjectPanel({ meta, scene, onChangeMeta, onLoad, onNew, onClose }: Props) {
  const [showLoad, setShowLoad] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const handleSave = () => {
    const p: Project = { ...meta, date: new Date().toISOString(), scene };
    saveProject(p);
    onChangeMeta({ ...meta, date: p.date });
    // Brief feedback
    alert(`「${meta.name}」を保存しました`);
  };

  const openLoad = () => {
    setProjects(loadAllProjects());
    setShowLoad(true);
  };

  const handleLoad = (p: Project) => {
    onLoad(p);
    setShowLoad(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const font = "-apple-system, 'SF Pro Display', Inter, sans-serif";

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 1500 }}
        onClick={onClose}
      />
      {/* Panel */}
      <div style={{
        position: "fixed",
        top: 44,
        left: 16,
        width: 320,
        background: "#FFFFFF",
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        zIndex: 1600,
        fontFamily: font,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: C.sectionBg,
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 14px 8px",
          display: "flex", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, flex: 1 }}>
            PROJECT
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, fontSize: 14 }}>×</button>
        </div>

        {/* Form */}
        <div style={{ padding: "14px 14px 10px" }}>
          <Field label="案件名">
            <input
              style={inputStyle}
              value={meta.name}
              onChange={e => onChangeMeta({ ...meta, name: e.target.value })}
              placeholder="案件名を入力"
            />
          </Field>
          <Field label="担当者">
            <input
              style={inputStyle}
              value={meta.author}
              onChange={e => onChangeMeta({ ...meta, author: e.target.value })}
              placeholder="担当者名"
            />
          </Field>
          <Field label="メモ（任意）">
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 50 }}
              value={meta.notes}
              onChange={e => onChangeMeta({ ...meta, notes: e.target.value })}
              placeholder="メモ"
            />
          </Field>
          {meta.date && (
            <div style={{ fontSize: 9, color: C.textLight, marginBottom: 8 }}>
              保存日時: {new Date(meta.date).toLocaleString("ja-JP")}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "10px 14px",
          display: "flex", gap: 6,
        }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, background: C.accent, border: "none", borderRadius: 6,
              color: "#fff", fontSize: 11, fontWeight: 600, padding: "6px 0", cursor: "pointer",
            }}
          >保存</button>
          <button
            onClick={openLoad}
            style={{
              flex: 1, background: C.accentBg, border: `1px solid ${C.accent}`, borderRadius: 6,
              color: C.accent, fontSize: 11, fontWeight: 600, padding: "6px 0", cursor: "pointer",
            }}
          >読み込み</button>
          <button
            onClick={onNew}
            style={{
              flex: 1, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.textDim, fontSize: 11, fontWeight: 500, padding: "6px 0", cursor: "pointer",
            }}
          >新規作成</button>
        </div>
      </div>

      {/* Load modal */}
      {showLoad && (
        <Modal title="案件を読み込む" onClose={() => setShowLoad(false)} width={440}>
          {projects.length === 0 ? (
            <p style={{ color: C.textLight, fontSize: 12, textAlign: "center", padding: "20px 0" }}>
              保存済みの案件はありません
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
              {[...projects].reverse().map(p => (
                <div
                  key={p.id}
                  onClick={() => handleLoad(p)}
                  style={{
                    background: C.pageBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 7,
                    padding: "9px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F0F0F2")}
                  onMouseLeave={e => (e.currentTarget.style.background = C.pageBg)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>
                      {p.author && `${p.author} · `}
                      {new Date(p.date).toLocaleDateString("ja-JP")}
                    </div>
                    {p.notes && <div style={{ fontSize: 10, color: C.textDim, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.notes}</div>}
                  </div>
                  <button
                    onClick={e => handleDelete(p.id, e)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, fontSize: 13, padding: "2px 4px", flexShrink: 0 }}
                    title="削除"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
