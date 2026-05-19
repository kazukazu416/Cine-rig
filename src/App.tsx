import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
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
import { ProjectPanel, saveProject } from "./ProjectPanel";
import { InfoPanel } from "./InfoPanel";
import type { Scene, Project } from "./types";
import { CABLE_COLORS, CABLE_TYPES } from "./types";

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
  const [showProjectPanel, setShowProjectPanel] = useState(false);

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

  // ── Project handlers ──────────────────────────────────────────────────────

  const handleLoadProject = useCallback((p: Project) => {
    setScene(p.scene);
    setProjectMeta({ id: p.id, name: p.name, author: p.author, notes: p.notes ?? "", date: p.date });
    positionsRef.current = {};
    savePositions({});
    setShowProjectPanel(false);
  }, []);

  const handleNewProject = useCallback(() => {
    setScene(INITIAL_SCENE);
    setProjectMeta(newProjectMeta());
    positionsRef.current = {};
    savePositions({});
    setShowProjectPanel(false);
  }, []);

  const handleSaveProject = useCallback(() => {
    const p: Project = { ...projectMeta, date: new Date().toISOString(), scene };
    saveProject(p);
    setProjectMeta(prev => ({ ...prev, date: p.date }));
  }, [projectMeta, scene]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const selectedEdge = selectedEdgeId
    ? rfEdges.find(e => e.id === selectedEdgeId) ?? null
    : null;

  const font = "-apple-system, 'SF Pro Display', Inter, sans-serif";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", fontFamily: font }}>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div style={{
        height: 36,
        flexShrink: 0,
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        zIndex: 50,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.4 }}>
          CineRig
        </span>

        <div style={{ width: 1, height: 16, background: "rgba(0,0,0,0.10)", flexShrink: 0 }} />

        <button
          onClick={() => setShowProjectPanel(v => !v)}
          style={{
            background: showProjectPanel ? "#E6F0FA" : "transparent",
            border: `1px solid ${showProjectPanel ? "#005BA6" : "rgba(0,0,0,0.10)"}`,
            color: showProjectPanel ? "#005BA6" : "#1d1d1f",
            borderRadius: 5,
            padding: "3px 10px",
            fontSize: 11, fontWeight: 600,
            cursor: "pointer",
            maxWidth: 160,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
          title="案件管理"
        >
          {projectMeta.name}
        </button>

        <span style={{ fontSize: 11, color: "#86868b" }}>
          {scene.cameras.length} cam · {scene.monitors.length} mon · {scene.wirelessSets.length} wireless
        </span>

        <div style={{ flex: 1 }} />

        <TopBarBtn onClick={handleSaveProject} title="現在の案件を保存">
          保存
        </TopBarBtn>

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
        <div style={{ flex: 1, position: "relative", background: "#FAFAFA", overflow: "hidden" }}>
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

      {/* Project Panel (floating) */}
      {showProjectPanel && (
        <ProjectPanel
          meta={projectMeta}
          scene={scene}
          onChangeMeta={setProjectMeta}
          onLoad={handleLoadProject}
          onNew={handleNewProject}
          onClose={() => setShowProjectPanel(false)}
        />
      )}
    </div>
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
