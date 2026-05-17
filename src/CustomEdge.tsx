import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { CABLE_COLORS } from "./types";

export function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, selected, markerEnd, style,
}: EdgeProps) {
  const cableType = (data?.cableType as string) ?? "SDI";
  const isInvalid = (data?.isInvalid as boolean) ?? false;
  const color = CABLE_COLORS[cableType] ?? "#888";

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={20}
        style={{
          ...style,
          stroke: color,
          strokeWidth: selected ? 4 : 2.5,
          strokeDasharray: isInvalid ? "6 3" : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
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
            boxShadow: selected ? "0 0 0 2px rgba(255,255,255,0.3)" : "none",
          }}>
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
