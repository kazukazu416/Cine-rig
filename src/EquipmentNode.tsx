import { Handle, Position } from "@xyflow/react";
import type { Equipment } from "./types";

const TYPE_COLOR: Record<string, string> = {
  camera:      "#30d158",
  monitor:     "#8e8e93",
  wireless_tx: "#ff9f0a",
  wireless_rx: "#ff9f0a",
  recorder:    "#bf5af2",
};

const TYPE_LABEL: Record<string, string> = {
  camera:      "Camera",
  monitor:     "Monitor",
  wireless_tx: "Wireless TX",
  wireless_rx: "Wireless RX",
  recorder:    "Recorder",
};

const PORT_COLOR: Record<string, string> = {
  SDI:  "#3b82f6",
  HDMI: "#f59e0b",
};

// Compact dimensions — Design.md: 6px radius, no shadow, high density
const NODE_W     = 190;
const HEADER_H   = 44;
const PORT_ROW_H = 23;
const V_PAD      = 6;

function handleTopPct(rowIdx: number, nodeH: number): string {
  const y = HEADER_H + V_PAD + rowIdx * PORT_ROW_H + PORT_ROW_H / 2;
  return `${(y / nodeH) * 100}%`;
}

interface Props {
  data: { equipment: Equipment; subtitle?: string };
}

export function EquipmentNode({ data }: Props) {
  const { equipment, subtitle } = data;
  const color     = TYPE_COLOR[equipment.type] ?? "#8e8e93";
  const typeLabel = subtitle ?? TYPE_LABEL[equipment.type];

  const inputPorts  = equipment.ports.filter(p => p.direction === "in");
  const outputPorts = equipment.ports.filter(p => p.direction === "out");
  const maxRows = Math.max(inputPorts.length, outputPorts.length, 1);
  const nodeH   = HEADER_H + V_PAD + maxRows * PORT_ROW_H + V_PAD;

  return (
    <div style={{
      position: "relative",
      width: NODE_W,
      height: nodeH,
      background: "#FFFFFF",
      border: "1px solid rgba(0,0,0,0.10)",
      borderRadius: 6,
      color: "#1d1d1f",
      fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
      overflow: "visible",
    }}>
      {/* Category accent bar — top only, 3px */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 3,
        background: color,
        borderRadius: "5px 5px 0 0",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: HEADER_H,
        padding: "11px 11px 0",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          fontWeight: 600,
          fontSize: 12,
          lineHeight: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "#1d1d1f",
          letterSpacing: -0.1,
        }}>
          {equipment.name}
        </div>
        <div style={{
          fontSize: 9,
          color,
          marginTop: 2,
          fontWeight: 600,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}>
          {typeLabel}
        </div>
      </div>

      {/* Port rows */}
      <div style={{ position: "absolute", top: HEADER_H + V_PAD, left: 0, right: 0 }}>
        {Array.from({ length: maxRows }).map((_, i) => {
          const inp = inputPorts[i];
          const out = outputPorts[i];
          return (
            <div key={i} style={{
              height: PORT_ROW_H,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
            }}>
              <span style={{
                fontSize: 9, fontWeight: 500, letterSpacing: 0.3,
                color: inp ? (PORT_COLOR[inp.type] ?? "#6e6e73") : "transparent",
                userSelect: "none",
              }}>
                {inp ? `${inp.type} IN` : ""}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 500, letterSpacing: 0.3,
                color: out ? (PORT_COLOR[out.type] ?? "#6e6e73") : "transparent",
                userSelect: "none",
              }}>
                {out ? `${out.type} OUT` : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input handles */}
      {inputPorts.map((port, i) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          style={{
            top: handleTopPct(i, nodeH),
            width: 9, height: 9,
            background: PORT_COLOR[port.type] ?? "#8e8e93",
            border: "2px solid #FFFFFF",
            borderRadius: "50%",
          }}
        />
      ))}

      {/* Output handles */}
      {outputPorts.map((port, i) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Right}
          style={{
            top: handleTopPct(i, nodeH),
            width: 9, height: 9,
            background: PORT_COLOR[port.type] ?? "#8e8e93",
            border: "2px solid #FFFFFF",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
}
