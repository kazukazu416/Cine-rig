import { useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { CABLE_COLORS } from "./types";

export function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, selected, markerEnd, style,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);

  const cableType  = (data?.cableType as string)  ?? "SDI";
  const isInvalid  = (data?.isInvalid  as boolean) ?? false;
  const locked     = (data?.locked     as boolean) ?? false;
  const isWireless = cableType === "WIRELESS";
  const color      = CABLE_COLORS[cableType] ?? "#888";

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const strokeWidth = isWireless
    ? 2
    : selected
      ? 4
      : hovered
        ? 3
        : 2.5;

  const gFilter = selected
    ? `drop-shadow(0 0 4px ${color}80)`
    : (hovered && !isWireless)
      ? "brightness(1.18)"
      : "none";

  return (
    <>
      {/* Hover-detection wrapper — fires onMouseEnter/Leave for the whole edge area */}
      <g
        onMouseEnter={isWireless ? undefined : () => setHovered(true)}
        onMouseLeave={isWireless ? undefined : () => setHovered(false)}
        style={{
          filter: gFilter,
          transition: "filter 0.15s ease-out",
        }}
      >
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={isWireless ? undefined : markerEnd}
          interactionWidth={isWireless ? 0 : 30}
          style={{
            ...style,
            stroke: color,
            strokeWidth,
            transition: "stroke-width 0.15s ease-out",
          }}
        />
      </g>

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "none",
            userSelect: "none",
          }}
          className="nopan"
        >
          <div style={{
            background: color,
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 3,
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 4,
            boxShadow: selected ? `0 0 0 2px ${color}55` : "none",
            fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
            transition: "box-shadow 0.15s ease-out",
          }}>
            {locked && <span style={{ fontSize: 9, lineHeight: 1 }}>🔒</span>}
            {cableType}
            {isInvalid && (
              <span title="不正な接続: 同じ方向のポート同士です" style={{ cursor: "help" }}>⚠</span>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
