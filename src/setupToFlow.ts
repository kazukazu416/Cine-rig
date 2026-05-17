import type { Node, Edge } from "@xyflow/react";
import type { Setup, CameraInput } from "./types";
import { getRoleLabel, CABLE_COLORS } from "./types";

const TYPE_X: Record<string, number> = {
  camera:      50,
  wireless_tx: 320,
  wireless_rx: 590,
  monitor:     860,
};

const MONITOR_SPACING = 180; // increased to accommodate taller nodes
const RIG_GAP = 90;

function buildSubtitleMap(inputs: CameraInput[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const cam of inputs) {
    const uid = `rig_${cam.id}`;
    cam.monitors.forEach((mon, i) => {
      map[`${uid}_monitor_${i + 1}`] = getRoleLabel(mon.role, mon.customRole);
    });
  }
  return map;
}

export function setupToFlow(
  setup: Setup,
  inputs: CameraInput[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const subtitleMap = buildSubtitleMap(inputs);

  let rigStartY = 0;

  for (const input of inputs) {
    const prefix = `rig_${input.id}_`;
    const rigEqs = setup.equipments.filter(e => e.id.startsWith(prefix));
    const monitors = rigEqs.filter(e => e.type === "monitor");
    const numMons = Math.max(monitors.length, 1);
    const rigH = numMons * MONITOR_SPACING;
    const centerY = rigStartY + ((numMons - 1) * MONITOR_SPACING) / 2;

    for (const eq of rigEqs) {
      const y = eq.type === "monitor"
        ? rigStartY + monitors.indexOf(eq) * MONITOR_SPACING
        : centerY;

      nodes.push({
        id: eq.id,
        type: "equipment",
        position: { x: TYPE_X[eq.type] ?? 0, y },
        data: { equipment: eq, subtitle: subtitleMap[eq.id] },
      });
    }

    rigStartY += rigH + RIG_GAP;
  }

  setup.connections.forEach((conn, i) => {
    const color = CABLE_COLORS[conn.cableType] ?? "#888";
    edges.push({
      id: `e${i}`,
      source: conn.from.equipmentId,
      sourceHandle: conn.from.portId,
      target: conn.to.equipmentId,
      targetHandle: conn.to.portId,
      type: "custom",
      animated: true,
      reconnectable: true,
      data: { cableType: conn.cableType, isInvalid: false },
      style: { stroke: color, strokeWidth: 2.5 },
    });
  });

  return { nodes, edges };
}
