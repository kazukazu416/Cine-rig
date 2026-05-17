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
      background: "#FFFFFF",
      border: "1px solid rgba(0,0,0,0.12)",
      borderRadius: 8,
      padding: "7px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      zIndex: 100,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      pointerEvents: "all",
      whiteSpace: "nowrap",
      fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
    }}>
      <span style={{ color: "#86868b", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
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
                background: active ? color : "#F5F5F7",
                border: `1px solid ${active ? color : "rgba(0,0,0,0.10)"}`,
                color: active ? "#fff" : "#6e6e73",
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.4,
                transition: "background 0.15s",
              }}
            >
              {type}
            </button>
          );
        })}
      </div>

      <div style={{ width: 1, height: 18, background: "rgba(0,0,0,0.08)" }} />

      <button
        onClick={onDelete}
        style={{
          background: "transparent",
          border: "none",
          color: "#d72b3f",
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
