import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  type Node, type Edge, type Connection, type NodeChange, type EdgeChange,
  type OnReconnect,
} from "@xyflow/react";
import { generateSetup } from "./generateSetup";
import { setupToFlow } from "./setupToFlow";
import { EquipmentNode } from "./EquipmentNode";
import { CustomEdge } from "./CustomEdge";
import { ControlPanel } from "./ControlPanel";
import { EdgePanel } from "./EdgePanel";
import { WarningModal } from "./WarningModal";
import { Toast, type ToastItem } from "./Toast";
import type { CameraInput, MonitorInput } from "./types";
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

let nextCamId = 2;
let nextMonId = 10;

export default function App() {
  const [inputs, setInputs] = useState<CameraInput[]>([
    {
      id: "1", model: "FX6", wireless: true,
      monitors: [
        { id: "m1", model: "smallhd_cine7",  role: "focus" },
        { id: "m2", model: "atomos_shogun7", role: "director" },
      ],
    },
  ]);

  const [rfNodes, setRfNodes, onNodesChange0] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange0] = useEdgesState<Edge>([]);

  const [edgeMode, setEdgeMode] = useState<"auto" | "manual">("auto");
  const edgeModeRef = useRef<"auto" | "manual">("auto");
  edgeModeRef.current = edgeMode;

  const positionsRef = useRef<Record<string, { x: number; y: number }>>(loadPositions());

  const [pendingInputs, setPendingInputs] = useState<CameraInput[] | null>(null);
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

  const buildAutoLayout = useCallback((ins: CameraInput[]) => {
    const setup = generateSetup(ins);
    const { nodes, edges } = setupToFlow(setup, ins);
    const pos = positionsRef.current;
    return {
      nodes: nodes.map(n => ({ ...n, position: pos[n.id] ?? n.position })),
      edges,
    };
  }, []);

  // ── Sync inputs → RF state ────────────────────────────────────────────────

  useEffect(() => {
    const { nodes: autoNodes, edges: autoEdges } = buildAutoLayout(inputs);
    const autoIds = new Set(autoNodes.map(n => n.id));

    if (edgeModeRef.current !== "manual") {
      setRfNodes(autoNodes);
      setRfEdges(autoEdges);
    } else {
      // Keep surviving nodes (with current RF positions), add new ones
      setRfNodes(prev => {
        const surviving = prev.filter(n => autoIds.has(n.id));
        const survivingIds = new Set(surviving.map(n => n.id));
        const added = autoNodes.filter(n => !survivingIds.has(n.id));
        return [...surviving, ...added];
      });
      // Remove edges whose endpoints no longer exist
      setRfEdges(prev => prev.filter(e => autoIds.has(e.source) && autoIds.has(e.target)));
    }
  }, [inputs, buildAutoLayout, setRfNodes, setRfEdges]);

  // ── hasManualEdits ────────────────────────────────────────────────────────

  const hasManualEdits =
    edgeMode === "manual" || Object.keys(positionsRef.current).length > 0;

  const applyInputChange = useCallback((newInputs: CameraInput[]) => {
    if (hasManualEdits) {
      setPendingInputs(newInputs);
    } else {
      setInputs(newInputs);
    }
  }, [hasManualEdits]);

  // ── Node changes: save positions on drag end ──────────────────────────────

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

  // ── Edge changes: detect deletions → manual mode ──────────────────────────

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange0(changes);
    if (changes.some(c => c.type === "remove") && edgeModeRef.current === "auto") {
      setEdgeMode("manual");
    }
  }, [onEdgesChange0]);

  // ── Connect: drag from handle to handle ──────────────────────────────────

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

  // ── Reconnect: drag edge endpoint to new port ─────────────────────────────

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
    const { nodes, edges } = buildAutoLayout(inputs);
    setRfNodes(nodes);
    setRfEdges(edges);
    setPendingInputs(null);
  }, [inputs, buildAutoLayout, setRfNodes, setRfEdges]);

  // ── Warning modal handlers ────────────────────────────────────────────────

  const handleRegenerateAll = useCallback(() => {
    if (!pendingInputs) return;
    positionsRef.current = {};
    savePositions({});
    setEdgeMode("auto");
    setInputs(pendingInputs);
    setPendingInputs(null);
  }, [pendingInputs]);

  const handleKeepManual = useCallback(() => {
    if (!pendingInputs) return;
    setInputs(pendingInputs);
    setPendingInputs(null);
  }, [pendingInputs]);

  const handleCancelModal = useCallback(() => setPendingInputs(null), []);

  // ── Camera handlers ───────────────────────────────────────────────────────

  const handleAddCam = useCallback(() => {
    const id = String(nextCamId++);
    applyInputChange([...inputs, { id, model: "FX6", wireless: false, monitors: [] }]);
  }, [inputs, applyInputChange]);

  const handleChangeCam = useCallback(
    (id: string, field: keyof CameraInput, value: unknown) => {
      applyInputChange(inputs.map(inp => inp.id === id ? { ...inp, [field]: value } : inp));
    },
    [inputs, applyInputChange]
  );

  const handleRemoveCam = useCallback((id: string) => {
    applyInputChange(inputs.filter(inp => inp.id !== id));
  }, [inputs, applyInputChange]);

  // ── Monitor handlers ──────────────────────────────────────────────────────

  const handleAddMonitor = useCallback((cameraId: string) => {
    const id = `m${nextMonId++}`;
    const newMon: MonitorInput = { id, model: "smallhd_cine7", role: "director" };
    applyInputChange(inputs.map(inp =>
      inp.id === cameraId ? { ...inp, monitors: [...inp.monitors, newMon] } : inp
    ));
  }, [inputs, applyInputChange]);

  const handleChangeMonitor = useCallback(
    (cameraId: string, monitorId: string, changes: Partial<MonitorInput>) => {
      applyInputChange(inputs.map(inp =>
        inp.id === cameraId
          ? { ...inp, monitors: inp.monitors.map(m => m.id === monitorId ? { ...m, ...changes } : m) }
          : inp
      ));
    },
    [inputs, applyInputChange]
  );

  const handleRemoveMonitor = useCallback((cameraId: string, monitorId: string) => {
    applyInputChange(inputs.map(inp =>
      inp.id === cameraId
        ? { ...inp, monitors: inp.monitors.filter(m => m.id !== monitorId) }
        : inp
    ));
  }, [inputs, applyInputChange]);

  const selectedEdge = selectedEdgeId
    ? rfEdges.find(e => e.id === selectedEdgeId) ?? null
    : null;

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0f172a" }}>
      <ControlPanel
        inputs={inputs}
        onAdd={handleAddCam}
        onChange={handleChangeCam}
        onRemove={handleRemoveCam}
        onAddMonitor={handleAddMonitor}
        onChangeMonitor={handleChangeMonitor}
        onRemoveMonitor={handleRemoveMonitor}
        onResetLayout={handleResetLayout}
      />

      <div style={{ flex: 1, position: "relative" }}>
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
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={20} />
          <Controls style={{ background: "#1e293b", border: "1px solid #334155" }} />
          <MiniMap
            nodeColor={() => "#334155"}
            style={{ background: "#1e293b", border: "1px solid #334155" }}
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
          background: "#1e293b", border: "1px solid #334155",
          borderRadius: 6, padding: "9px 13px",
          display: "flex", flexDirection: "column", gap: 6,
          pointerEvents: "none",
        }}>
          <span style={{ color: "#64748b", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Cable
          </span>
          {LEGEND.map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: "#c8c8c8", fontSize: 12 }}>
              <div style={{ width: 24, height: 2.5, background: color, borderRadius: 2 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {pendingInputs !== null && (
        <WarningModal
          onRegenerate={handleRegenerateAll}
          onKeep={handleKeepManual}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
}
