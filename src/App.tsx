import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  type Node, type Edge, type Connection, type NodeChange, type EdgeChange,
  type OnReconnect,
} from "@xyflow/react";
import { generateFromScene } from "./generateSetup";
import { sceneToFlow } from "./setupToFlow";
import { EquipmentNode } from "./EquipmentNode";
import { CustomEdge } from "./CustomEdge";
import { ScenePanel } from "./ScenePanel";
import { EquipmentLibrary } from "./EquipmentLibrary";
import { EdgePanel } from "./EdgePanel";
import { WarningModal } from "./WarningModal";
import { Toast, type ToastItem } from "./Toast";
import type { Scene } from "./types";
import { CABLE_COLORS, CABLE_TYPES } from "./types";

const nodeTypes = { equipment: EquipmentNode };
const edgeTypes = { custom: CustomEdge };

const LS_KEY = "cinerig_positions";

function loadPositions(): Record<string, { x: number; y: number }> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"); }
  catch { return {}; }
}

function savePositions(pos: Record<string, { x: number; y: number }>) {
  localStorage.setItem(LS_KEY, JSON.stringify(pos));
}

const LEGEND = CABLE_TYPES.map(t => ({ label: t, color: CABLE_COLORS[t] ?? "#888" }));

const INITIAL_SCENE: Scene = {
  cameras: [{ id: "cam1", model: "fx6", label: "Main" }],
  wirelessSets: [{
    id: "ws1", txModel: "wireless_tx", rxModel: "wireless_rx",
    sourceId: "cam1", destinationIds: ["mon2"],
  }],
  monitors: [
    { id: "mon1", model: "smallhd_cine7",  role: "onboard",  cameraId: "cam1" },
    { id: "mon2", model: "atomos_shogun7", role: "director", cameraId: "cam1" },
  ],
  recorders: [],
};

export default function App() {
  const [scene, setScene] = useState<Scene>(INITIAL_SCENE);
  const [rfNodes, setRfNodes, onNodesChange0] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange0] = useEdgesState<Edge>([]);

  const [edgeMode, setEdgeMode] = useState<"auto" | "manual">("auto");
  const edgeModeRef = useRef<"auto" | "manual">("auto");
  edgeModeRef.current = edgeMode;

  const positionsRef = useRef<Record<string, { x: number; y: number }>>(loadPositions());

  const [pendingScene, setPendingScene] = useState<Scene | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

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

  // ── Sync scene → ReactFlow state ─────────────────────────────────────────

  useEffect(() => {
    const { nodes: autoNodes, edges: autoEdges } = buildAutoLayout(scene);
    const autoIds = new Set(autoNodes.map(n => n.id));

    if (edgeModeRef.current !== "manual") {
      setRfNodes(autoNodes);
      setRfEdges(autoEdges);
    } else {
      setRfNodes(prev => {
        const surviving = prev.filter(n => autoIds.has(n.id));
        const survivingIds = new Set(surviving.map(n => n.id));
        const added = autoNodes.filter(n => !survivingIds.has(n.id));
        return [...surviving, ...added];
      });
      setRfEdges(prev => prev.filter(e => autoIds.has(e.source) && autoIds.has(e.target)));
    }
  }, [scene, buildAutoLayout, setRfNodes, setRfEdges]);

  // ── Manual-edit guard ─────────────────────────────────────────────────────

  const hasManualEdits =
    edgeMode === "manual" || Object.keys(positionsRef.current).length > 0;

  const applySceneChange = useCallback((newScene: Scene) => {
    if (hasManualEdits) {
      setPendingScene(newScene);
    } else {
      setScene(newScene);
    }
  }, [hasManualEdits]);

  // ── Node changes: persist drag positions ─────────────────────────────────

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
    if (changes.some(c => c.type === "remove") && edgeModeRef.current === "auto") {
      setEdgeMode("manual");
    }
  }, [onEdgesChange0]);

  // ── Connect (drag between handles) ───────────────────────────────────────

  const handleConnect = useCallback((connection: Connection) => {
    setEdgeMode("manual");

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
      data: { cableType: "SDI", isInvalid },
      style: { stroke: CABLE_COLORS["SDI"], strokeWidth: 2.5 },
    }, eds));
  }, [rfNodes, addToast, setRfEdges]);

  // ── Reconnect (drag existing edge endpoint) ───────────────────────────────

  const handleReconnect: OnReconnect<Edge> = useCallback((oldEdge, newConnection) => {
    setEdgeMode("manual");
    setRfEdges(eds => addEdge({
      ...newConnection,
      id: oldEdge.id,
      type: "custom",
      animated: true,
      reconnectable: true,
      data: oldEdge.data,
      style: oldEdge.style,
    }, eds.filter(e => e.id !== oldEdge.id)));
  }, [setRfEdges]);

  // ── Edge selection ────────────────────────────────────────────────────────

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  const handlePaneClick = useCallback(() => setSelectedEdgeId(null), []);
  const handleNodeClick = useCallback(() => setSelectedEdgeId(null), []);

  const handleChangeEdgeType = useCallback((type: string) => {
    if (!selectedEdgeId) return;
    const color = CABLE_COLORS[type] ?? "#888";
    setRfEdges(eds => eds.map(e =>
      e.id === selectedEdgeId
        ? { ...e, data: { ...e.data, cableType: type }, style: { ...e.style, stroke: color } }
        : e
    ));
  }, [selectedEdgeId, setRfEdges]);

  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setRfEdges(eds => eds.filter(e => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    setEdgeMode("manual");
  }, [selectedEdgeId, setRfEdges]);

  // ── Reset layout ──────────────────────────────────────────────────────────

  const handleResetLayout = useCallback(() => {
    positionsRef.current = {};
    savePositions({});
    setEdgeMode("auto");
    edgeModeRef.current = "auto";
    const { nodes, edges } = buildAutoLayout(scene);
    setRfNodes(nodes);
    setRfEdges(edges);
    setPendingScene(null);
  }, [scene, buildAutoLayout, setRfNodes, setRfEdges]);

  // ── Warning modal ─────────────────────────────────────────────────────────

  const handleRegenerateAll = useCallback(() => {
    if (!pendingScene) return;
    positionsRef.current = {};
    savePositions({});
    setEdgeMode("auto");
    setScene(pendingScene);
    setPendingScene(null);
  }, [pendingScene]);

  const handleKeepManual = useCallback(() => {
    if (!pendingScene) return;
    setScene(pendingScene);
    setPendingScene(null);
  }, [pendingScene]);

  const handleCancelModal = useCallback(() => setPendingScene(null), []);

  const selectedEdge = selectedEdgeId
    ? rfEdges.find(e => e.id === selectedEdgeId) ?? null
    : null;

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
      background: "#F5F5F7",
    }}>
      {/* Left: Equipment Library */}
      <EquipmentLibrary />

      {/* Centre: Canvas */}
      <div style={{ flex: 1, position: "relative", background: "#FAFAFA" }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onReconnect={handleReconnect}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          onNodeClick={handleNodeClick}
          deleteKeyCode="Delete"
          reconnectRadius={20}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          style={{ background: "#FAFAFA" }}
        >
          <Background color="rgba(0,0,0,0.05)" gap={20} />
          <Controls style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          zIndex: 10,
        }}>
          <span style={{ color: "#86868b", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Cable
          </span>
          {LEGEND.map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: "#1d1d1f", fontSize: 11 }}>
              <div style={{ width: 20, height: 2.5, background: color, borderRadius: 2 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Scene Panel */}
      <ScenePanel
        scene={scene}
        onChange={applySceneChange}
        onResetLayout={handleResetLayout}
      />

      {pendingScene !== null && (
        <WarningModal
          onRegenerate={handleRegenerateAll}
          onKeep={handleKeepManual}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
}
