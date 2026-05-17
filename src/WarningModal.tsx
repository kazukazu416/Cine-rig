import React, { useState } from "react";

interface Props {
  onRegenerate: () => void;
  onKeep: () => void;
  onCancel: () => void;
}

function ModalBtn({ onClick, variant, children }: {
  onClick: () => void;
  variant: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);

  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: hov ? "#0070C9" : "#005BA6",
      color: "#FFFFFF",
      border: "none",
    },
    secondary: {
      background: hov ? "#dbeafe" : "#EFF5FF",
      color: "#005BA6",
      border: "1px solid rgba(0,91,166,0.20)",
    },
    ghost: {
      background: hov ? "#F5F5F7" : "transparent",
      color: hov ? "#1d1d1f" : "#6e6e73",
      border: "1px solid rgba(0,0,0,0.10)",
    },
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...styles[variant],
        borderRadius: 7,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        lineHeight: 1.5,
        transition: "background 0.2s ease-out, color 0.2s ease-out",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
      }}
    >
      {children}
    </button>
  );
}

export function WarningModal({ onRegenerate, onKeep, onCancel }: Props) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.28)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(2px)",
    }}>
      <div style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 12,
        padding: "24px 24px 20px",
        maxWidth: 400,
        width: "90%",
        boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", marginBottom: 8 }}>
          手動編集があります
        </div>
        <p style={{ color: "#6e6e73", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
          設定を変更すると手動編集（配線・ノード位置）が
          失われる可能性があります。
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ModalBtn onClick={onRegenerate} variant="primary">
            自動で再生成
            <span style={{ display: "block", fontSize: 11, opacity: 0.75, marginTop: 1, fontWeight: 400 }}>
              手動編集をすべて破棄して再生成する
            </span>
          </ModalBtn>
          <ModalBtn onClick={onKeep} variant="secondary">
            手動編集を維持
            <span style={{ display: "block", fontSize: 11, opacity: 0.75, marginTop: 1, fontWeight: 400 }}>
              既存の編集を保持し、追加分のみ自動生成する
            </span>
          </ModalBtn>
          <ModalBtn onClick={onCancel} variant="ghost">
            キャンセル
          </ModalBtn>
        </div>
      </div>
    </div>
  );
}
