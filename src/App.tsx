import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge, useReactFlow,
  type Node, type Edge, type Connection, type NodeChange, type EdgeChange,
  type OnReconnect, type IsValidConnection,
} from "@xyflow/react";
import { generateFromScene } from "./generateSetup";
import { sceneToFlow } from "./setupToFlow";
import { EquipmentNode } from "./EquipmentNode";
import { CustomEdge } from "./CustomEdge";
import { ScenePanel } from "./ScenePanel";
import { EquipmentLibrary } from "./EquipmentLibrary";
import { EdgePanel } from "./EdgePanel";
import { Toast, type ToastItem } from "./Toast";
import { ProjectLibrary, NewProjectModal, saveProject } from "./ProjectPanel";
import { InfoPanel } from "./InfoPanel";
import { Modal } from "./Modal";
import type { Scene, Project, SceneMonitorRole } from "./types";
import { CABLE_COLORS, CABLE_TYPES, SCENE_ROLE_LABELS } from "./types";
import { DB, type EquipmentModelId } from "./equipmentDB";

const nodeTypes = { equipment: EquipmentNode };
const edgeTypes = { custom: CustomEdge };

function resolveEntityId(nodeId: string, scene: Scene): string | null {
  for (const cam of scene.cameras)
    if (nodeId === `${cam.id}_${cam.model}`) return cam.id;
  for (const mon of scene.monitors)
    if (nodeId === `${mon.id}_${mon.model}`) return mon.id;
  for (const ws of scene.wirelessSets) {
    if (nodeId === `${ws.id}_tx_${ws.txModel ?? "wireless_tx"}`) return ws.id;
    for (const rx of ws.rxUnits)
      if (nodeId === `${rx.id}_${rx.model}`) return ws.id;
  }
  for (const conv of scene.converters ?? [])
    if (nodeId === `${conv.id}_${conv.model}`) return conv.id;
  for (const mv of scene.multiviewers ?? [])
    if (nodeId === `${mv.id}_${mv.model}`) return mv.id;
  return null;
}

const LS_KEY = "cinerig_positions";

function loadPositions(): Record<string, { x: number; y: number }> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"); }
  catch { return {}; }
}

function savePositions(pos: Record<string, { x: number; y: number }>) {
  localStorage.setItem(LS_KEY, JSON.stringify(pos));
}

const LEGEND = [
  ...CABLE_TYPES.map(t => ({ label: t, color: CABLE_COLORS[t] ?? "#888" })),
  { label: "WIRELESS", color: CABLE_COLORS["WIRELESS"] },
];

const INITIAL_SCENE: Scene = {
  cameras: [{ id: "cam1", model: "fx6", label: "Main" }],
  wirelessSets: [{
    id: "ws1", txModel: "wireless_tx",
    rxUnits: [{ id: "ws1_rx", model: "wireless_rx" }],
    sourceId: "cam1",
  }],
  monitors: [
    // fx6: ports[0]=SDI OUT, ports[1]=HDMI OUT
    // smallhd_cine7: ports[0]=SDI IN 1, ports[1]=SDI IN 2, ports[2]=HDMI IN, ...
    { id: "mon1", model: "smallhd_cine7",  role: "onboard",  cameraId: "cam1", sourceId: "cam1",   sourcePortIdx: 0, targetPortIdx: 0, cableType: "SDI" },
    // wireless_rx: ports[0]=WIRELESS IN, ports[1]=SDI OUT
    // atomos_shogun7: ports[0]=SDI IN, ports[1]=HDMI IN, ...
    { id: "mon2", model: "atomos_shogun7", role: "director", cameraId: "cam1", sourceId: "ws1_rx", sourcePortIdx: 1, targetPortIdx: 0, cableType: "SDI" },
  ],
  recorders: [],
  converters: [],
  multiviewers: [],
};

function newProjectMeta() {
  return { id: `p${Date.now()}`, name: "新規案件", author: "", notes: "", date: "" };
}

export default function App() {
  const [scene, setScene] = useState<Scene>(INITIAL_SCENE);
  const [rfNodes, setRfNodes, onNodesChange0] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange0] = useEdgesState<Edge>([]);

  const positionsRef = useRef<Record<string, { x: number; y: number }>>(loadPositions());

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeEntityId, setSelectedNodeEntityId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [projectMeta, setProjectMeta] = useState(newProjectMeta);
  const [showLibrary,    setShowLibrary]    = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingName,    setEditingName]    = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedScene, setLastSavedScene] = useState<Scene>(INITIAL_SCENE);

  const [isDragOver, setIsDragOver] = useState(false);
  const [dropMonitorPending, setDropMonitorPending] = useState<{ modelId: string; pos: { x: number; y: number } } | null>(null);
  const [dropMonitorRole, setDropMonitorRole] = useState<SceneMonitorRole>("director");

  const { screenToFlowPosition } = useReactFlow();

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: "warning" | "info" = "warning") => {
    const id = `t${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const buildAutoLayout = useCallback((sc: Scene) => {
    const setup = generateFromScene(sc);
    const { nodes, edges } = sceneToFlow(setup, sc);
    const pos = positionsRef.current;
    return {
      nodes: nodes.map(n => ({ ...n, position: pos[n.id] ?? n.position })),
      edges,
    };
  }, []);

  // ── Sync scene → ReactFlow ────────────────────────────────────────────────
  // Scene changes always auto-update. Locked edges survive; unlocked are replaced.

  useEffect(() => {
    const { nodes: autoNodes, edges: autoEdges } = buildAutoLayout(scene);
    const autoIds = new Set(autoNodes.map(n => n.id));

    // Node update: fresh data from scene, preserve existing positions (handles live drag)
    setRfNodes(prev => {
      const prevById = new Map(prev.map(n => [n.id, n]));
      return autoNodes.map(n => {
        const p = prevById.get(n.id);
        return p ? { ...n, position: p.position } : n;
      });
    });

    // Edge update: keep locked edges, replace everything else with auto
    setRfEdges(prev => {
      const lockedEdges = prev.filter(e =>
        (e.data?.locked as boolean) &&
        autoIds.has(e.source) &&
        autoIds.has(e.target)
      );
      const lockedSigs = new Set(
        lockedEdges.map(e => `${e.source}|${e.sourceHandle}|${e.target}|${e.targetHandle}`)
      );
      const freshAuto = autoEdges.filter(
        e => !lockedSigs.has(`${e.source}|${e.sourceHandle}|${e.target}|${e.targetHandle}`)
      );
      return [...freshAuto, ...lockedEdges];
    });
  }, [scene, buildAutoLayout, setRfNodes, setRfEdges]);

  // ── Node changes ──────────────────────────────────────────────────────────

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange0(changes);
    const pos = { ...positionsRef.current };
    let dirty = false;
    for (const c of changes) {
      if (c.type === "position" && c.dragging === false && c.position) {
        pos[c.id] = c.position;
        dirty = true;
      }
    }
    if (dirty) {
      positionsRef.current = pos;
      savePositions(pos);
    }
  }, [onNodesChange0]);

  // ── Edge changes ──────────────────────────────────────────────────────────

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange0(changes);
    const removed = new Set(changes.filter(c => c.type === "remove").map(c => c.id));
    if (removed.size > 0) {
      setSelectedEdgeId(prev => removed.has(prev ?? "") ? null : prev);
    }
  }, [onEdgesChange0]);

  // ── Connect ───────────────────────────────────────────────────────────────

  const isValidConnection: IsValidConnection = useCallback((connection) => {
    const usedHandles = new Set(
      rfEdges.flatMap(e => [e.sourceHandle, e.targetHandle].filter(Boolean) as string[])
    );
    if (connection.sourceHandle && usedHandles.has(connection.sourceHandle)) return false;
    if (connection.targetHandle && usedHandles.has(connection.targetHandle)) return false;
    return true;
  }, [rfEdges]);

  const handleConnect = useCallback((connection: Connection) => {
    type PortEntry = { id: string; direction: string };
    const nodeMap = Object.fromEntries(rfNodes.map(n => [n.id, n]));
    const srcPorts =
      (nodeMap[connection.source ?? ""]?.data?.equipment as { ports: PortEntry[] })?.ports ?? [];
    const tgtPorts =
      (nodeMap[connection.target ?? ""]?.data?.equipment as { ports: PortEntry[] })?.ports ?? [];
    const srcPort = srcPorts.find(p => p.id === connection.sourceHandle);
    const tgtPort = tgtPorts.find(p => p.id === connection.targetHandle);
    const isInvalid = !!(srcPort && tgtPort && srcPort.direction === tgtPort.direction);

    if (isInvalid) {
      addToast("⚠ 同じ方向のポート同士の接続です（in↔in または out↔out）");
    }

    setRfEdges(eds => addEdge({
      ...connection,
      type: "custom",
      animated: true,
      reconnectable: true,
      data: { cableType: "SDI", isInvalid, locked: true },
      style: { stroke: CABLE_COLORS["SDI"], strokeWidth: 2.5 },
    }, eds));
  }, [rfNodes, addToast, setRfEdges]);

  // ── Reconnect ─────────────────────────────────────────────────────────────

  const handleReconnect: OnReconnect<Edge> = useCallback((oldEdge, newConnection) => {
    setRfEdges(eds => addEdge({
      ...newConnection,
      id: oldEdge.id,
      type: "custom",
      animated: true,
      reconnectable: true,
      data: { ...oldEdge.data, locked: true },
      style: oldEdge.style,
    }, eds.filter(e => e.id !== oldEdge.id)));
  }, [setRfEdges]);

  // ── Edge selection ────────────────────────────────────────────────────────

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    if ((edge.data?.cableType as string) === "WIRELESS") return;
    setSelectedEdgeId(edge.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedEdgeId(null);
    setSelectedNodeEntityId(null);
  }, []);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedEdgeId(null);
    setSelectedNodeEntityId(resolveEntityId(node.id, scene));
  }, [scene]);

  const handleChangeEdgeType = useCallback((type: string) => {
    if (!selectedEdgeId) return;
    const color = CABLE_COLORS[type] ?? "#888";
    setRfEdges(eds => eds.map(e =>
      e.id === selectedEdgeId
        ? { ...e, data: { ...e.data, cableType: type, locked: true }, style: { ...e.style, stroke: color } }
        : e
    ));
  }, [selectedEdgeId, setRfEdges]);

  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setRfEdges(eds => eds.filter(e => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }, [selectedEdgeId, setRfEdges]);

  const handleToggleLock = useCallback(() => {
    if (!selectedEdgeId) return;
    setRfEdges(eds => eds.map(e =>
      e.id === selectedEdgeId
        ? { ...e, data: { ...e.data, locked: !(e.data?.locked as boolean) } }
        : e
    ));
  }, [selectedEdgeId, setRfEdges]);

  // ── Reset layout ──────────────────────────────────────────────────────────

  const handleResetLayout = useCallback(() => {
    positionsRef.current = {};
    savePositions({});
    const { nodes: autoNodes, edges: autoEdges } = buildAutoLayout(scene);
    const autoIds = new Set(autoNodes.map(n => n.id));
    setRfNodes(autoNodes);
    setRfEdges(prev => {
      const lockedEdges = prev.filter(e =>
        (e.data?.locked as boolean) &&
        autoIds.has(e.source) &&
        autoIds.has(e.target)
      );
      const lockedSigs = new Set(
        lockedEdges.map(e => `${e.source}|${e.sourceHandle}|${e.target}|${e.targetHandle}`)
      );
      const freshAuto = autoEdges.filter(
        e => !lockedSigs.has(`${e.source}|${e.sourceHandle}|${e.target}|${e.targetHandle}`)
      );
      return [...freshAuto, ...lockedEdges];
    });
  }, [scene, buildAutoLayout, setRfNodes, setRfEdges]);

  // ── Save status ───────────────────────────────────────────────────────────

  // Mark unsaved whenever scene changes relative to last save
  useEffect(() => {
    if (JSON.stringify(scene) !== JSON.stringify(lastSavedScene)) {
      setSaveStatus("unsaved");
    }
  }, [scene, lastSavedScene]);

  const doSave = useCallback(() => {
    setSaveStatus("saving");
    const p = { ...projectMeta, date: new Date().toISOString(), scene };
    saveProject(p);
    setProjectMeta(prev => ({ ...prev, date: p.date }));
    setLastSavedScene(scene);
    setSaveStatus("saved");
  }, [projectMeta, scene]);

  // Auto-save every 30 seconds when unsaved
  useEffect(() => {
    if (saveStatus !== "unsaved") return;
    const id = setTimeout(doSave, 30_000);
    return () => clearTimeout(id);
  }, [saveStatus, doSave]);

  // ── Drag & drop from library ──────────────────────────────────────────────

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Element | null)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const raw = event.dataTransfer.getData("application/cinerig-equipment");
    if (!raw) return;

    const { category, modelId } = JSON.parse(raw) as { category: string; modelId: string };
    const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const ts = String(Date.now());

    if (category === "camera") {
      const id = `cam${ts}`;
      positionsRef.current[`${id}_${modelId}`] = pos;
      savePositions(positionsRef.current);
      setScene(prev => ({ ...prev, cameras: [...prev.cameras, { id, model: modelId }] }));
    } else if (category === "monitor") {
      setDropMonitorPending({ modelId, pos });
      setDropMonitorRole("director");
    } else if (category === "wireless") {
      const wsId = `ws${ts}`;
      const isTx = modelId.includes("_tx");
      const txModel = isTx ? modelId : "wireless_tx";
      const rxModel = isTx ? "wireless_rx" : modelId;
      positionsRef.current[`${wsId}_tx_${txModel}`] = pos;
      savePositions(positionsRef.current);
      setScene(prev => ({
        ...prev,
        wirelessSets: [...prev.wirelessSets, {
          id: wsId, txModel,
          rxUnits: [{ id: `${wsId}_rx1`, model: rxModel }],
          sourceId: prev.cameras[0]?.id ?? "",
        }],
      }));
    } else if (category === "converter") {
      const id = `conv${ts}`;
      positionsRef.current[`${id}_${modelId}`] = pos;
      savePositions(positionsRef.current);
      setScene(prev => ({ ...prev, converters: [...(prev.converters ?? []), { id, model: modelId }] }));
    } else if (category === "multiviewer") {
      const id = `mv${ts}`;
      positionsRef.current[`${id}_${modelId}`] = pos;
      savePositions(positionsRef.current);
      setScene(prev => ({ ...prev, multiviewers: [...(prev.multiviewers ?? []), { id, model: modelId }] }));
    }
  }, [screenToFlowPosition]);

  const confirmDropMonitor = useCallback(() => {
    if (!dropMonitorPending) return;
    const { modelId, pos } = dropMonitorPending;
    const id = `mon${Date.now()}`;
    positionsRef.current[`${id}_${modelId}`] = pos;
    savePositions(positionsRef.current);
    setScene(prev => ({
      ...prev,
      monitors: [...prev.monitors, { id, model: modelId, role: dropMonitorRole }],
    }));
    setDropMonitorPending(null);
  }, [dropMonitorPending, dropMonitorRole]);

  // ── Project handlers ──────────────────────────────────────────────────────

  const handleLoadProject = useCallback((p: Project) => {
    setScene(p.scene);
    setProjectMeta({ id: p.id, name: p.name, author: p.author, notes: p.notes ?? "", date: p.date });
    setLastSavedScene(p.scene);
    setSaveStatus("saved");
    positionsRef.current = {};
    savePositions({});
    setShowLibrary(false);
  }, []);

  const handleNewProject = useCallback((name: string, author: string, notes: string) => {
    const meta = { ...newProjectMeta(), name, author, notes };
    setScene(INITIAL_SCENE);
    setProjectMeta(meta);
    setLastSavedScene(INITIAL_SCENE);
    setSaveStatus("unsaved");
    positionsRef.current = {};
    savePositions({});
    setShowNewProject(false);
    setShowLibrary(false);
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────

  const selectedEdge = selectedEdgeId
    ? rfEdges.find(e => e.id === selectedEdgeId) ?? null
    : null;

  const font = "-apple-system, 'SF Pro Display', Inter, sans-serif";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", fontFamily: font }}>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div style={{
        height: 38,
        flexShrink: 0,
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 10,
        zIndex: 50,
      }}>
        {/* App name */}
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.4, flexShrink: 0 }}>
          CineRig
        </span>

        <div style={{ width: 1, height: 16, background: "rgba(0,0,0,0.10)", flexShrink: 0 }} />

        {/* Project name (inline editable) */}
        {editingName ? (
          <input
            autoFocus
            value={projectMeta.name}
            onChange={e => setProjectMeta(p => ({ ...p, name: e.target.value }))}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingName(false); }}
            style={{
              background: "#F5F5F7",
              border: "1.5px solid #005BA6",
              borderRadius: 5,
              padding: "3px 8px",
              fontSize: 12, fontWeight: 600, color: "#1d1d1f",
              outline: "none",
              width: 180,
              fontFamily: "inherit",
            }}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="クリックして案件名を編集"
            style={{
              background: "transparent",
              border: "1px solid transparent",
              borderRadius: 5,
              padding: "3px 8px",
              fontSize: 12, fontWeight: 600, color: "#1d1d1f",
              cursor: "text",
              maxWidth: 200,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontFamily: "inherit",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#F5F5F7";
              e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            {projectMeta.name}
          </button>
        )}

        {/* Icon buttons: 📁 💾 ＋ */}
        <HeaderIconBtn onClick={() => setShowLibrary(true)} title="案件一覧を開く">📁</HeaderIconBtn>
        <HeaderIconBtn onClick={doSave} title="保存" accent={saveStatus === "unsaved"}>💾</HeaderIconBtn>
        <HeaderIconBtn onClick={() => setShowNewProject(true)} title="新規作成">＋</HeaderIconBtn>

        {/* Save status */}
        <span style={{
          fontSize: 10, flexShrink: 0,
          color: saveStatus === "unsaved" ? "#f59e0b"
               : saveStatus === "saving"  ? "#86868b"
               : "#30d158",
          fontWeight: 500,
          transition: "color 0.3s",
        }}>
          {saveStatus === "unsaved" ? "● 未保存"
         : saveStatus === "saving"  ? "保存中..."
         : "✓ 保存済み"}
        </span>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 11, color: "#86868b", flexShrink: 0 }}>
          {scene.cameras.length} cam · {scene.monitors.length} mon · {scene.wirelessSets.length} wireless
        </span>

        <TopBarBtn onClick={handleResetLayout} title="配線図を自動レイアウトに戻す">
          ⟳ リセット
        </TopBarBtn>
      </div>

      {/* ── Main area ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left: Library */}
        <EquipmentLibrary />

        {/* Centre: Canvas + Info Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{ flex: 1, position: "relative", background: "#FAFAFA", overflow: "hidden" }}
        >
          {isDragOver && (
            <div style={{
              position: "absolute", inset: 0,
              border: "2px dashed #005BA6",
              background: "rgba(0,91,166,0.04)",
              pointerEvents: "none",
              zIndex: 100,
            }} />
          )}
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            isValidConnection={isValidConnection}
            onReconnect={handleReconnect}
            onEdgeClick={handleEdgeClick}
            onPaneClick={handlePaneClick}
            onNodeClick={handleNodeClick}
            deleteKeyCode="Delete"
            reconnectRadius={20}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            proOptions={{ hideAttribution: true }}
            style={{ background: "#FAFAFA" }}
          >
            <Background
              color="rgba(0,0,0,0.06)"
              gap={24}
              size={1}
            />
            <Controls style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8,
              overflow: "hidden",
            }} />
            <MiniMap
              nodeColor={n => {
                const t = (n.data?.equipment as { type?: string } | undefined)?.type;
                const m: Record<string, string> = {
                  camera: "#30d158", monitor: "#8e8e93",
                  wireless_tx: "#ff9f0a", wireless_rx: "#ff9f0a",
                  recorder: "#bf5af2",
                  converter: "#0ea5e9", multiviewer: "#22c55e",
                };
                return m[t ?? ""] ?? "#8e8e93";
              }}
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 8,
              }}
            />
          </ReactFlow>

          {selectedEdge && (
            <EdgePanel
              edge={selectedEdge}
              onChangeType={handleChangeEdgeType}
              onDelete={handleDeleteEdge}
              onToggleLock={handleToggleLock}
            />
          )}

          <Toast toasts={toasts} onDismiss={dismissToast} />

          {/* Cable legend */}
          <div style={{
            position: "absolute", bottom: 16, right: 16,
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex", flexDirection: "column", gap: 5,
            pointerEvents: "none",
            zIndex: 10,
          }}>
            <span style={{
              color: "#86868b", fontSize: 9, fontWeight: 700,
              letterSpacing: 1.5, textTransform: "uppercase",
            }}>
              Cable
            </span>
            {LEGEND.map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: "#1d1d1f", fontSize: 11 }}>
                <div style={{ width: 18, height: 2.5, background: color, borderRadius: 2 }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom info panel */}
        <InfoPanel edges={rfEdges} scene={scene} nodes={rfNodes} />
        </div>

        {/* Right: Scene Panel */}
        <ScenePanel
          scene={scene}
          onChange={setScene}
          onResetLayout={handleResetLayout}
          highlightedEntityId={selectedNodeEntityId}
          edges={rfEdges}
        />
      </div>

      {/* Monitor role modal (drag & drop) */}
      {dropMonitorPending && (
        <Modal
          title="モニターの役割を選択"
          onClose={() => setDropMonitorPending(null)}
          onConfirm={confirmDropMonitor}
          confirmLabel="追加"
          width={320}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#1d1d1f", fontWeight: 600 }}>
              {DB[dropMonitorPending.modelId as EquipmentModelId]?.name ?? dropMonitorPending.modelId}
            </div>
            <select
              value={dropMonitorRole}
              onChange={e => setDropMonitorRole(e.target.value as SceneMonitorRole)}
              style={{
                background: "#FAFAFA", border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 5, padding: "6px 8px", fontSize: 12, color: "#1d1d1f",
                outline: "none", cursor: "pointer", width: "100%",
                fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
              }}
            >
              {(Object.entries(SCENE_ROLE_LABELS) as [SceneMonitorRole, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}

      {/* Project Library modal */}
      {showLibrary && (
        <ProjectLibrary
          onLoad={handleLoadProject}
          onClose={() => setShowLibrary(false)}
          onNew={() => { setShowLibrary(false); setShowNewProject(true); }}
        />
      )}

      {/* New project modal */}
      {showNewProject && (
        <NewProjectModal
          hasUnsaved={saveStatus === "unsaved"}
          onConfirm={handleNewProject}
          onClose={() => setShowNewProject(false)}
        />
      )}
    </div>
  );
}

function HeaderIconBtn({ onClick, title, accent, children }: {
  onClick: () => void;
  title?: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? (accent ? "#E6F0FA" : "#F5F5F7") : "transparent",
        border: `1px solid ${accent ? "#005BA6" : hov ? "rgba(0,0,0,0.10)" : "transparent"}`,
        color: accent ? "#005BA6" : "#6e6e73",
        borderRadius: 6,
        padding: "3px 7px",
        fontSize: 13, lineHeight: 1,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        fontFamily: "inherit",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function TopBarBtn({ onClick, title, children }: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        background: hov ? "#F5F5F7" : "transparent",
        border: "1px solid rgba(0,0,0,0.10)",
        color: hov ? "#1d1d1f" : "#6e6e73",
        borderRadius: 5,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 500,
        cursor: "pointer",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "background 0.15s ease-out, color 0.15s ease-out, transform 0.1s ease-out",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
