import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Equipment } from "./types";
import { portLabel } from "./equipmentDB";

const TYPE_COLOR: Record<string, string> = {
  camera:      "#30d158",
  monitor:     "#8e8e93",
  wireless_tx: "#ff9f0a",
  wireless_rx: "#ff9f0a",
  recorder:    "#bf5af2",
  converter:   "#0ea5e9",
  multiviewer: "#22c55e",
};

const TYPE_LABEL: Record<string, string> = {
  camera:      "Camera",
  monitor:     "Monitor",
  wireless_tx: "Wireless TX",
  wireless_rx: "Wireless RX",
  recorder:    "Recorder",
  converter:   "Converter",
  multiviewer: "Multiviewer",
};

const PORT_COLOR: Record<string, string> = {
  SDI:      "#3b82f6",
  HDMI:     "#f59e0b",
  WIRELESS: "#9B59B6",
};

const NODE_W     = 190;
const HEADER_H   = 44;
const PORT_ROW_H = 23;
const V_PAD      = 6;

function handleTopPct(rowIdx: number, nodeH: number): string {
  const y = HEADER_H + V_PAD + rowIdx * PORT_ROW_H + PORT_ROW_H / 2;
  return `${(y / nodeH) * 100}%`;
}

function portDisplayLabel(ports: Equipment["ports"], idx: number): string {
  return portLabel(ports, idx).replace(/^WIRELESS\s+(IN|OUT)/, "RF $1");
}

interface Props {
  data: {
    equipment: Equipment;
    subtitle?: string;
    wsColor?: string;
    connectedPortIds?: string[];
  };
  selected?: boolean;
  dragging?: boolean;
}

export function EquipmentNode({ data, selected = false, dragging = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const { equipment, subtitle, wsColor, connectedPortIds = [] } = data;
  const color     = wsColor ?? (TYPE_COLOR[equipment.type] ?? "#8e8e93");
  const typeLabel = subtitle ?? TYPE_LABEL[equipment.type];
  const connectedSet = new Set(connectedPortIds);

  const allIndexed  = equipment.ports.map((port, idx) => ({ port, idx }));
  const inputPorts  = allIndexed.filter(({ port }) => port.direction === "in");
  const outputPorts = allIndexed.filter(({ port }) => port.direction === "out");
  const maxRows = Math.max(inputPorts.length, outputPorts.length, 1);
  const nodeH   = HEADER_H + V_PAD + maxRows * PORT_ROW_H + V_PAD;

  const isWireless = equipment.type === "wireless_tx" || equipment.type === "wireless_rx";

  const border = selected
    ? "1.5px solid #005BA6"
    : (isWireless && wsColor)
      ? `1.5px solid ${wsColor}`
      : "1px solid rgba(0,0,0,0.10)";

  const boxShadow = dragging
    ? "0 14px 36px rgba(0,0,0,0.18), 0 4px 14px rgba(0,0,0,0.10)"
    : selected
      ? "0 0 0 2px #005BA620, 0 4px 12px rgba(0,0,0,0.08)"
      : hovered
        ? "0 4px 14px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)"
        : "none";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: NODE_W,
        height: nodeH,
        background: "#FFFFFF",
        border,
        borderRadius: 6,
        color: "#1d1d1f",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
        overflow: "visible",
        boxShadow,
        transform: selected ? "scale(1.02)" : "scale(1)",
        transformOrigin: "center center",
        cursor: dragging ? "grabbing" : "default",
        transition: "box-shadow 0.15s ease-out, border-color 0.15s ease-out, transform 0.15s ease-out",
      }}
    >
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
          const inpConn = inp ? connectedSet.has(inp.port.id) : false;
          const outConn = out ? connectedSet.has(out.port.id) : false;
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
                color: inp
                  ? (inpConn ? (PORT_COLOR[inp.port.type] ?? "#6e6e73") : "#b0b0b8")
                  : "transparent",
                userSelect: "none",
                display: "flex", alignItems: "center", gap: 3,
              }}>
                {inp && inpConn && <span style={{ fontSize: 7 }}>●</span>}
                {inp ? portDisplayLabel(equipment.ports, inp.idx) : ""}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 500, letterSpacing: 0.3,
                color: out
                  ? (outConn ? (PORT_COLOR[out.port.type] ?? "#6e6e73") : "#b0b0b8")
                  : "transparent",
                userSelect: "none",
                display: "flex", alignItems: "center", gap: 3,
              }}>
                {out ? portDisplayLabel(equipment.ports, out.idx) : ""}
                {out && outConn && <span style={{ fontSize: 7 }}>●</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input handles */}
      {inputPorts.map(({ port }, rowIdx) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          style={{
            top: handleTopPct(rowIdx, nodeH),
            width: 12, height: 12,
            background: PORT_COLOR[port.type] ?? "#8e8e93",
            border: connectedSet.has(port.id) ? "2px solid #30d158" : "2px solid #FFFFFF",
            borderRadius: "50%",
          }}
        />
      ))}

      {/* Output handles */}
      {outputPorts.map(({ port }, rowIdx) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Right}
          style={{
            top: handleTopPct(rowIdx, nodeH),
            width: 12, height: 12,
            background: PORT_COLOR[port.type] ?? "#8e8e93",
            border: connectedSet.has(port.id) ? "2px solid #30d158" : "2px solid #FFFFFF",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
}
