import type { Edge } from "@xyflow/react";
import { CABLE_TYPES, CABLE_COLORS } from "./types";

interface Props {
  edge: Edge;
  onChangeType: (type: string) => void;
  onDelete: () => void;
}

export function EdgePanel({ edge, onChangeType, onDelete }: Props) {
  const current = (edge.data?.cableType as string) ?? "SDI";

  return (
    <div style={{
      position: "absolute",
      top: 12,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: 8,
      padding: "8px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      zIndex: 100,
      boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
      pointerEvents: "all",
      whiteSpace: "nowrap",
    }}>
      <span style={{ color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
        CABLE
      </span>

      <div style={{ display: "flex", gap: 4 }}>
        {CABLE_TYPES.map(type => {
          const active = type === current;
          const color = CABLE_COLORS[type] ?? "#888";
          return (
            <button
              key={type}
              onClick={() => onChangeType(type)}
              style={{
                background: active ? color : "#0f172a",
                border: `1px solid ${color}`,
                color: active ? "#fff" : color,
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.4,
                transition: "background 0.1s",
              }}
            >
              {type}
            </button>
          );
        })}
      </div>

      <div style={{ width: 1, height: 18, background: "#334155" }} />

      <button
        onClick={onDelete}
        style={{
          background: "transparent",
          border: "none",
          color: "#ef4444",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          padding: "2px 4px",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        ✕ 削除
      </button>
    </div>
  );
}
