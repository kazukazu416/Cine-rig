import type { Node, Edge } from "@xyflow/react";
import { Position } from "@xyflow/react";
import type { Setup, Scene, SceneMonitorRole, Equipment } from "./types";
import { SCENE_ROLE_LABELS, CABLE_COLORS } from "./types";

// Signal-flow column layout: camera → onboard → TX → RX → focus/director → client → recorder → converter/multiviewer
const COL_X: Record<string, number> = {
  camera:      60,
  onboard_mon: 300,
  wireless_tx: 560,
  wireless_rx: 820,
  main_mon:    1080,
  client_mon:  1340,
  recorder:    1600,
  converter:   1860,
  multiviewer: 2060,
};
const V_SPACING = 200;

const WS_PALETTE = [
  "#ff9f0a", "#0ea5e9", "#a855f7", "#22c55e", "#ef4444", "#ec4899",
];

function monColKey(role: SceneMonitorRole): string {
  if (role === "onboard") return "onboard_mon";
  if (role === "client")  return "client_mon";
  return "main_mon";
}

// Build handle ID from equipment ID and port template index.
// Matches the formula in instantiate(): `${uid}_${modelId}_p${i}`
function handleId(equipmentId: string, portIdx: number): string {
  return `${equipmentId}_p${portIdx}`;
}

export function sceneToFlow(
  setup: Setup,
  scene: Scene,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const eqById = new Map(setup.equipments.map(e => [e.id, e]));

  const subtitleMap: Record<string, string> = {};
  for (const mon of scene.monitors) {
    subtitleMap[`${mon.id}_${mon.model}`] = SCENE_ROLE_LABELS[mon.role] ?? mon.role;
  }

  const yIdx: Record<string, number> = {};
  const addNode = (id: string, colKey: string, subtitle?: string, wsColor?: string) => {
    const eq = eqById.get(id);
    if (!eq) return;
    const y = (yIdx[colKey] ?? 0) * V_SPACING;
    yIdx[colKey] = (yIdx[colKey] ?? 0) + 1;
    nodes.push({
      id: eq.id,
      type: "equipment",
      position: { x: COL_X[colKey] ?? 60, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { equipment: eq, subtitle, ...(wsColor ? { wsColor } : {}), connectedPortIds: [] },
    });
  };

  // Col 1: Cameras
  for (const cam of scene.cameras)
    addNode(`${cam.id}_${cam.model}`, "camera");

  // Col 2: Onboard monitors
  for (const mon of scene.monitors) {
    if (mon.role === "onboard")
      addNode(`${mon.id}_${mon.model}`, "onboard_mon", subtitleMap[`${mon.id}_${mon.model}`]);
  }

  const multiWs = scene.wirelessSets.length > 1;

  // Col 3: Wireless TX
  for (const [wsIdx, ws] of scene.wirelessSets.entries()) {
    const wsColor = WS_PALETTE[wsIdx % WS_PALETTE.length];
    const txSub = multiWs ? `TX · ${wsIdx + 1}` : undefined;
    addNode(`${ws.id}_tx_${ws.txModel ?? "wireless_tx"}`, "wireless_tx", txSub, wsColor);
  }

  // Col 4: Wireless RX
  for (const [wsIdx, ws] of scene.wirelessSets.entries()) {
    const wsColor = WS_PALETTE[wsIdx % WS_PALETTE.length];
    const rxSub = multiWs ? `RX · ${wsIdx + 1}` : undefined;
    for (const rx of ws.rxUnits)
      addNode(`${rx.id}_${rx.model}`, "wireless_rx", rxSub, wsColor);
  }

  // Col 5: Focus / Director / Frontline / Other monitors
  for (const mon of scene.monitors) {
    if (mon.role !== "onboard" && mon.role !== "client")
      addNode(`${mon.id}_${mon.model}`, "main_mon", subtitleMap[`${mon.id}_${mon.model}`]);
  }

  // Col 6: Client monitors
  for (const mon of scene.monitors) {
    if (mon.role === "client")
      addNode(`${mon.id}_${mon.model}`, "client_mon", subtitleMap[`${mon.id}_${mon.model}`]);
  }

  // Recorders
  for (const rec of scene.recorders)
    addNode(`${rec.id}_${rec.model}`, "recorder");

  // Converters
  for (const conv of scene.converters ?? [])
    addNode(`${conv.id}_${conv.model}`, "converter");

  // Multiviewers
  for (const mv of scene.multiviewers ?? [])
    addNode(`${mv.id}_${mv.model}`, "multiviewer");

  // ── TX→RX wireless edges ────────────────────────────────────────────────────
  for (const ws of scene.wirelessSets) {
    const txId = `${ws.id}_tx_${ws.txModel ?? "wireless_tx"}`;
    const txEq = eqById.get(txId);
    const txHandle = txEq?.ports.find(p => p.type === "WIRELESS" && p.direction === "out")?.id;
    for (const rx of ws.rxUnits) {
      const rxId = `${rx.id}_${rx.model}`;
      const rxEq = eqById.get(rxId);
      const rxHandle = rxEq?.ports.find(p => p.type === "WIRELESS" && p.direction === "in")?.id;
      if (!txHandle || !rxHandle) continue;
      edges.push({
        id: `rf_${ws.id}_${rx.id}`,
        source: txId,
        target: rxId,
        sourceHandle: txHandle,
        targetHandle: rxHandle,
        type: "custom",
        selectable: false,
        deletable: false,
        data: { cableType: "WIRELESS", isInvalid: false, locked: false },
        style: { stroke: CABLE_COLORS["WIRELESS"], strokeWidth: 2 },
      });
    }
  }

  // ── Auto-wired edges from MonitorInstance.sourceId ──────────────────────────
  const camMap = new Map(scene.cameras.map(c => [c.id, c]));
  const rxMap = new Map<string, { rxId: string; rxModel: string }>();
  for (const ws of scene.wirelessSets) {
    for (const rx of ws.rxUnits) {
      rxMap.set(rx.id, { rxId: rx.id, rxModel: rx.model });
    }
  }
  const monMap  = new Map(scene.monitors.map(m => [m.id, m]));
  const convMap = new Map((scene.converters ?? []).map(c => [c.id, c]));
  const mvMap   = new Map((scene.multiviewers ?? []).map(m => [m.id, m]));

  // Resolve source node ID from any scene entity
  function resolveSourceNodeId(sourceId: string): string | undefined {
    const srcCam  = camMap.get(sourceId);
    if (srcCam)  return `${srcCam.id}_${srcCam.model}`;
    const rxEntry = rxMap.get(sourceId);
    if (rxEntry) return `${rxEntry.rxId}_${rxEntry.rxModel}`;
    const srcMon  = monMap.get(sourceId);
    if (srcMon)  return `${srcMon.id}_${srcMon.model}`;
    const srcConv = convMap.get(sourceId);
    if (srcConv) return `${srcConv.id}_${srcConv.model}`;
    const srcMv   = mvMap.get(sourceId);
    if (srcMv)   return `${srcMv.id}_${srcMv.model}`;
    return undefined;
  }

  // Generic auto-edge builder (used for monitors, converters, multiviewers)
  function buildAutoEdge(
    entityId: string,
    entityModel: string,
    sourceId: string | undefined,
    sourcePortIdx: number | undefined,
    targetPortIdx: number | undefined,
    cableType: string | undefined,
  ) {
    if (!sourceId || !cableType) return;
    const targetNodeId = `${entityId}_${entityModel}`;
    const targetEq = eqById.get(targetNodeId);
    if (!targetEq) return;

    let targetHandle: string | undefined;
    if (targetPortIdx !== undefined) {
      targetHandle = handleId(targetNodeId, targetPortIdx);
      if (!targetEq.ports.some(p => p.id === targetHandle)) targetHandle = undefined;
    }
    if (!targetHandle) {
      targetHandle =
        targetEq.ports.find(p => p.direction === "in" && p.type === cableType)?.id ??
        targetEq.ports.find(p => p.direction === "in" && p.type !== "WIRELESS")?.id;
    }
    if (!targetHandle) return;

    const sourceNodeId = resolveSourceNodeId(sourceId);
    if (!sourceNodeId) return;
    const sourceEq = eqById.get(sourceNodeId);
    if (!sourceEq) return;

    let sourceHandle: string | undefined;
    if (sourcePortIdx !== undefined) {
      sourceHandle = handleId(sourceNodeId, sourcePortIdx);
      if (!sourceEq.ports.some(p => p.id === sourceHandle)) sourceHandle = undefined;
    }
    if (!sourceHandle) {
      sourceHandle =
        sourceEq.ports.find(p => p.direction === "out" && p.type === cableType)?.id ??
        sourceEq.ports.find(p => p.direction === "out" && p.type !== "WIRELESS")?.id;
    }
    if (!sourceHandle) return;

    const color = CABLE_COLORS[cableType] ?? "#888";
    edges.push({
      id: `auto_${sourceId}_${entityId}`,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle,
      targetHandle,
      type: "custom",
      data: { cableType, isInvalid: false, locked: false },
      style: { stroke: color, strokeWidth: 2.5 },
    });
  }

  for (const mon of scene.monitors) {
    buildAutoEdge(mon.id, mon.model, mon.sourceId, mon.sourcePortIdx, mon.targetPortIdx, mon.cableType);
  }

  for (const conv of scene.converters ?? []) {
    buildAutoEdge(conv.id, conv.model, conv.sourceId, conv.sourcePortIdx, conv.targetPortIdx, conv.cableType);
  }

  for (const mv of scene.multiviewers ?? []) {
    buildAutoEdge(mv.id, mv.model, mv.sourceId, mv.sourcePortIdx, mv.targetPortIdx, mv.cableType);
  }

  // ── Source→TX cable edges (source = camera or monitor loop-through) ──────────
  const srcTxUsedHandles = new Set(edges.map(e => e.sourceHandle).filter(Boolean) as string[]);
  for (const ws of scene.wirelessSets) {
    if (!ws.sourceId) continue;
    const cam    = scene.cameras.find(c => c.id === ws.sourceId);
    const srcMon = !cam ? scene.monitors.find(m => m.id === ws.sourceId) : undefined;
    const src    = cam ?? srcMon;
    if (!src) continue;
    const srcNodeId = `${src.id}_${src.model}`;
    const txModel   = ws.txModel ?? "wireless_tx";
    const txNodeId  = `${ws.id}_tx_${txModel}`;
    const srcEq = eqById.get(srcNodeId);
    const txEq  = eqById.get(txNodeId);
    if (!srcEq || !txEq) continue;
    const txInPorts  = txEq.ports.filter(p => p.direction === "in" && p.type !== "WIRELESS");
    const srcOutPorts = srcEq.ports.filter(p => p.direction === "out" && p.type !== "WIRELESS");
    let cableType = "";
    let srcHandle = "";
    let tgtHandle = "";
    for (const pass of [0, 1]) {
      for (const pref of ["SDI", "HDMI"]) {
        const sp = srcOutPorts.find(p => p.type === pref && (pass === 1 || !srcTxUsedHandles.has(p.id)));
        const tp = txInPorts.find(p => p.type === pref);
        if (sp && tp) { srcHandle = sp.id; tgtHandle = tp.id; cableType = pref; break; }
      }
      if (cableType) break;
    }
    if (!cableType) continue;
    edges.push({
      id: `auto_src_tx_${ws.id}`,
      source: srcNodeId,
      target: txNodeId,
      sourceHandle: srcHandle,
      targetHandle: tgtHandle,
      type: "custom",
      data: { cableType, isInvalid: false, locked: false },
      style: { stroke: CABLE_COLORS[cableType] ?? "#888", strokeWidth: 2.5 },
    });
  }

  // ── Annotate nodes with which of their ports are connected ─────────────────
  const usedHandles = new Set(
    edges.flatMap(e => [e.sourceHandle, e.targetHandle].filter(Boolean) as string[])
  );

  const finalNodes = nodes.map(n => {
    const eq = n.data.equipment as Equipment;
    const connectedPortIds = eq.ports
      .filter(p => usedHandles.has(p.id))
      .map(p => p.id);
    return { ...n, data: { ...n.data, connectedPortIds } };
  });

  return { nodes: finalNodes, edges };
}

// Unused legacy export kept for type compatibility
export { sceneToFlow as setupToFlow };
