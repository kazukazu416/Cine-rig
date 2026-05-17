import type { Node, Edge } from "@xyflow/react";
import type { Setup, CameraInput, Scene } from "./types";
import { getRoleLabel, CABLE_COLORS, SCENE_ROLE_LABELS } from "./types";

// ── Legacy layout (CameraInput-based) ────────────────────────────────────────

const TYPE_X: Record<string, number> = {
  camera:      50,
  wireless_tx: 320,
  wireless_rx: 590,
  monitor:     860,
};

const MONITOR_SPACING = 180;
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

// ── Scene-based layout ────────────────────────────────────────────────────────

const SCENE_COL_X: Record<string, number> = {
  camera:      60,
  wireless_tx: 360,
  wireless_rx: 660,
  monitor:     960,
  recorder:    1260,
};

const V_SPACING = 210;

export function sceneToFlow(
  setup: Setup,
  scene: Scene,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Subtitle: monitor equipment id → role label
  const subtitleMap: Record<string, string> = {};
  for (const mon of scene.monitors) {
    subtitleMap[`${mon.id}_${mon.model}`] = SCENE_ROLE_LABELS[mon.role] ?? mon.role;
  }

  // Y position for each monitor (in scene order)
  const monitorY: Record<string, number> = {};
  scene.monitors.forEach((mon, i) => {
    monitorY[`${mon.id}_${mon.model}`] = i * V_SPACING;
  });

  // Camera Y = vertical centre of its assigned monitors
  const cameraY: Record<string, number> = {};
  scene.cameras.forEach((cam, ci) => {
    const assigned = scene.monitors.filter(m => m.cameraId === cam.id);
    const ys = assigned.map(m => monitorY[`${m.id}_${m.model}`] ?? 0);
    cameraY[`${cam.id}_${cam.model}`] = ys.length
      ? ys.reduce((a, b) => a + b, 0) / ys.length
      : ci * V_SPACING;
  });

  // Wireless TX/RX Y = vertical centre of destination monitors
  const wirelessY: Record<string, number> = {};
  for (const ws of scene.wirelessSets) {
    const dests = ws.destinationIds.map(id => {
      const m = scene.monitors.find(m => m.id === id);
      return m ? (monitorY[`${m.id}_${m.model}`] ?? 0) : 0;
    });
    const cy = dests.length
      ? dests.reduce((a, b) => a + b, 0) / dests.length
      : (cameraY[`${ws.sourceId}_${scene.cameras.find(c => c.id === ws.sourceId)?.model ?? ""}`] ?? 0);
    wirelessY[`${ws.id}_tx_${ws.txModel ?? "wireless_tx"}`] = cy;
    wirelessY[`${ws.id}_rx_${ws.rxModel ?? "wireless_rx"}`] = cy;
  }

  for (const eq of setup.equipments) {
    let y = 0;
    if      (eq.type === "camera")      y = cameraY[eq.id]   ?? 0;
    else if (eq.type === "wireless_tx") y = wirelessY[eq.id] ?? 0;
    else if (eq.type === "wireless_rx") y = wirelessY[eq.id] ?? 0;
    else if (eq.type === "monitor")     y = monitorY[eq.id]  ?? 0;

    nodes.push({
      id: eq.id,
      type: "equipment",
      position: { x: SCENE_COL_X[eq.type] ?? 60, y },
      data: { equipment: eq, subtitle: subtitleMap[eq.id] },
    });
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
