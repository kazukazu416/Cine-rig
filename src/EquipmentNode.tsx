import { Handle, Position } from "@xyflow/react";
import type { Equipment } from "./types";

const TYPE_COLOR: Record<string, string> = {
  camera:      "#22c55e",
  monitor:     "#94a3b8",
  wireless_tx: "#f97316",
  wireless_rx: "#f97316",
};

const TYPE_LABEL: Record<string, string> = {
  camera:      "Camera",
  monitor:     "Monitor",
  wireless_tx: "Wireless TX",
  wireless_rx: "Wireless RX",
};

interface Props {
  data: { equipment: Equipment };
}

export function EquipmentNode({ data }: Props) {
  const { equipment } = data;
  const color = TYPE_COLOR[equipment.type] ?? "#888";

  return (
    <div style={{
      background: "#1e293b",
      border: `2px solid ${color}`,
      borderRadius: 8,
      padding: "10px 18px",
      minWidth: 160,
      color: "#f1f5f9",
    }}>
      <Handle type="target" position={Position.Left}  style={{ background: color, border: "none" }} />
      <div style={{ fontWeight: 700, fontSize: 14 }}>{equipment.name}</div>
      <div style={{ fontSize: 11, color, marginTop: 3 }}>{TYPE_LABEL[equipment.type]}</div>
      <Handle type="source" position={Position.Right} style={{ background: color, border: "none" }} />
    </div>
  );
}
