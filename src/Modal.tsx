import React from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ title, onClose, onConfirm, confirmLabel = "追加", children, width = 420 }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.22)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 3000,
        backdropFilter: "blur(2px)",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 10,
        padding: "20px 20px 16px",
        width,
        maxWidth: "92vw",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f", flex: 1, letterSpacing: -0.2 }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#86868b", lineHeight: 1, padding: "0 2px" }}
          >×</button>
        </div>

        {/* Content */}
        <div style={{ marginBottom: onConfirm ? 16 : 0 }}>
          {children}
        </div>

        {/* Footer */}
        {onConfirm && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid rgba(0,0,0,0.10)",
                borderRadius: 6, padding: "6px 16px",
                fontSize: 12, fontWeight: 500, cursor: "pointer", color: "#6e6e73",
              }}
            >キャンセル</button>
            <button
              onClick={onConfirm}
              style={{
                background: "#005BA6",
                border: "none",
                borderRadius: 6, padding: "6px 16px",
                fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#FFFFFF",
              }}
            >{confirmLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}
