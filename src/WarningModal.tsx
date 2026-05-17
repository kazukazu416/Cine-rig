interface Props {
  onRegenerate: () => void;
  onKeep: () => void;
  onCancel: () => void;
}

const btnBase: React.CSSProperties = {
  border: "none",
  borderRadius: 5,
  padding: "10px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
  lineHeight: 1.5,
};

import React from "react";

export function WarningModal({ onRegenerate, onKeep, onCancel }: Props) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 10,
        padding: "24px 28px",
        maxWidth: 420,
        width: "90%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>
          ⚠ 手動編集があります
        </div>
        <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.75, marginBottom: 22 }}>
          設定を変更すると手動編集（配線・ノード位置）が
          失われる可能性があります。
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={onRegenerate}
            style={{ ...btnBase, background: "#1e3a8a", color: "#93c5fd" }}
          >
            自動で再生成
            <span style={{ display: "block", fontSize: 11, opacity: 0.7, marginTop: 1 }}>
              手動編集をすべて破棄して再生成する
            </span>
          </button>
          <button
            onClick={onKeep}
            style={{ ...btnBase, background: "#134e4a", color: "#5eead4" }}
          >
            手動編集を維持
            <span style={{ display: "block", fontSize: 11, opacity: 0.7, marginTop: 1 }}>
              既存の編集を保持し、追加分のみ自動生成する
            </span>
          </button>
          <button
            onClick={onCancel}
            style={{
              ...btnBase,
              background: "transparent",
              border: "1px solid #334155",
              color: "#64748b",
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
