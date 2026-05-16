import type { Node, Edge } from "@xyflow/react";
import type { Setup, Equipment } from "./types";

const CABLE_COLOR: Record<string, string> = {
  SDI:  "#3b82f6",
  HDMI: "#f59e0b",
};

// Signal flow: camera → wireless_tx → wireless_rx → monitor
const TYPE_X: Record<string, number> = {
  camera:      50,
  wireless_tx: 310,
  wireless_rx: 570,
  monitor:     830,
};

function positionFor(eq: Equipment, all: Equipment[]) {
  const x = TYPE_X[eq.type] ?? 0;
  const peers = all.filter((e) => e.type === eq.type);
  const idx = peers.findIndex((e) => e.id === eq.id);
  const totalH = peers.length * 170;
  const startY = (400 - totalH) / 2;
  return { x, y: startY + idx * 170 };
}

export function setupToFlow(setup: Setup): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = setup.equipments.map((eq) => ({
    id: eq.id,
    type: "equipment",
    position: positionFor(eq, setup.equipments),
    data: { equipment: eq },
  }));

  const edges: Edge[] = setup.connections.map((conn, i) => {
    const color = CABLE_COLOR[conn.cableType] ?? "#888";
    return {
      id: `e${i}`,
      source: conn.from.equipmentId,
      target: conn.to.equipmentId,
      label: conn.cableType,
      animated: true,
      style: { stroke: color, strokeWidth: 2.5 },
      labelStyle: { fill: "#fff", fontSize: 11, fontWeight: 700 },
      labelBgStyle: { fill: color, fillOpacity: 0.85 },
      labelBgPadding: [5, 7] as [number, number],
      labelBgBorderRadius: 4,
    };
  });

  return { nodes, edges };
}
