import React, { useState, useRef, useEffect } from "react";
import type { Edge } from "@xyflow/react";
import type {
  Scene, CameraInstance, WirelessSetInstance, WirelessRxUnit, MonitorInstance, SceneMonitorRole,
  ConverterInstance, MultiviewerInstance,
} from "./types";
import { SCENE_ROLE_LABELS, CABLE_COLORS } from "./types";
import {
  DB, MONITOR_MODELS, CONVERTER_MODELS, MULTIVIEWER_MODELS, outputPortOptions, inputPortOptions,
  type CameraModelId, type EquipmentModelId, type WirelessModelId,
} from "./equipmentDB";
import { Modal } from "./Modal";

const C = {
  bg:          "#FFFFFF",
  pageBg:      "#FAFAFA",
  sectionBg:   "#F5F5F7",
  border:      "rgba(0,0,0,0.08)",
  borderFaint: "rgba(0,0,0,0.05)",
  text:        "#1d1d1f",
  textDim:     "#6e6e73",
  textLight:   "#86868b",
  accent:      "#005BA6",
  accentHov:   "#0070C9",
  accentBg:    "#E6F0FA",
  hoverBg:     "#F0F0F2",
  danger:      "#d72b3f",
} as const;

const CAMERA_IDS: CameraModelId[] = [
  "fx6", "fx3", "fx9",
  "burano", "venice2", "a7siii", "a7iv",
  "alexa_mini_lf", "v_raptor",
  "c70", "c300_mkiii", "ursa_mini_pro_12k",
];

const WIRELESS_TX_IDS: WirelessModelId[] = [
  "wireless_tx",
  "teradek_bolt6_lt750_tx",  "teradek_bolt6_lt1500_tx",
  "teradek_bolt6_xt1500_tx", "teradek_bolt6_xt3000_tx",
  "teradek_bolt500xt_tx",
  "hollyland_pyroh_tx",
  "accsoon_cineview_se_tx",
];

const WIRELESS_RX_IDS: WirelessModelId[] = [
  "wireless_rx",
  "teradek_bolt6_lt750_rx",  "teradek_bolt6_lt1500_rx",
  "teradek_bolt6_xt1500_rx", "teradek_bolt6_xt3000_rx",
  "teradek_bolt500xt_rx",
  "hollyland_pyroh_rx",
  "accsoon_cineview_se_rx",
];

const SCENE_ROLES: SceneMonitorRole[] = [
  "onboard", "focus", "frontline", "director", "client", "other",
];

const ROLE_DOT: Record<SceneMonitorRole, string> = {
  onboard: "#30d158", focus: "#005BA6", frontline: "#0070C9",
  director: "#ff9f0a", client: "#ff3b30", other: "#8e8e93",
};

let _uid = 100;
const uid = () => String(_uid++);

// ── Handle ID helpers ─────────────────────────────────────────────────────────
// Must match instantiate(): `${uid}_${modelId}_p${i}`

function camHandle(cam: CameraInstance, portIdx: number): string {
  return `${cam.id}_${cam.model}_p${portIdx}`;
}
function rxHandle(rx: WirelessRxUnit, portIdx: number): string {
  return `${rx.id}_${rx.model}_p${portIdx}`;
}
function monHandle(mon: MonitorInstance, portIdx: number): string {
  return `${mon.id}_${mon.model}_p${portIdx}`;
}
function convHandle(conv: ConverterInstance, portIdx: number): string {
  return `${conv.id}_${conv.model}_p${portIdx}`;
}
function mvHandle(mv: MultiviewerInstance, portIdx: number): string {
  return `${mv.id}_${mv.model}_p${portIdx}`;
}

// ── Connection info for MonitorCard display ───────────────────────────────────

type ConnectionInfo = {
  sourceName: string;
  sourcePortLabel: string;
  targetPortLabel: string;
  cableType?: string;
} | null;

// Resolve source handle → { name, portLabel } by matching handle prefix against scene entities.
function resolveHandleSource(
  sourceHandle: string,
  scene: Scene,
): { name: string; portLabel: string } | null {
  for (const cam of scene.cameras) {
    const prefix = `${cam.id}_${cam.model}_p`;
    if (sourceHandle.startsWith(prefix)) {
      const idx = parseInt(sourceHandle.slice(prefix.length), 10);
      const portLabel = outputPortOptions(cam.model as EquipmentModelId).find(p => p.idx === idx)?.label ?? "";
      return { name: DB[cam.model as EquipmentModelId]?.name ?? cam.model, portLabel };
    }
  }
  for (const ws of scene.wirelessSets) {
    for (const rx of ws.rxUnits) {
      const prefix = `${rx.id}_${rx.model}_p`;
      if (sourceHandle.startsWith(prefix)) {
        const idx = parseInt(sourceHandle.slice(prefix.length), 10);
        const portLabel = outputPortOptions(rx.model as EquipmentModelId).find(p => p.idx === idx)?.label ?? "";
        return { name: DB[rx.model as EquipmentModelId]?.name ?? rx.model, portLabel };
      }
    }
  }
  for (const srcMon of scene.monitors) {
    const prefix = `${srcMon.id}_${srcMon.model}_p`;
    if (sourceHandle.startsWith(prefix)) {
      const idx = parseInt(sourceHandle.slice(prefix.length), 10);
      const portLabel = outputPortOptions(srcMon.model as EquipmentModelId).find(p => p.idx === idx)?.label ?? "";
      return { name: DB[srcMon.model as EquipmentModelId]?.name ?? srcMon.model, portLabel };
    }
  }
  for (const conv of scene.converters ?? []) {
    const prefix = `${conv.id}_${conv.model}_p`;
    if (sourceHandle.startsWith(prefix)) {
      const idx = parseInt(sourceHandle.slice(prefix.length), 10);
      const portLabel = outputPortOptions(conv.model as EquipmentModelId).find(p => p.idx === idx)?.label ?? "";
      return { name: DB[conv.model as EquipmentModelId]?.name ?? conv.model, portLabel };
    }
  }
  for (const mv of scene.multiviewers ?? []) {
    const prefix = `${mv.id}_${mv.model}_p`;
    if (sourceHandle.startsWith(prefix)) {
      const idx = parseInt(sourceHandle.slice(prefix.length), 10);
      const portLabel = outputPortOptions(mv.model as EquipmentModelId).find(p => p.idx === idx)?.label ?? "";
      return { name: DB[mv.model as EquipmentModelId]?.name ?? mv.model, portLabel };
    }
  }
  return null;
}

function getMonitorConnectionInfo(mon: MonitorInstance, scene: Scene, edges: Edge[]): ConnectionInfo {
  // Scene-based connection (ScenePanel dropdown)
  if (mon.sourceId) {
    let sourceName = "不明";
    let sourcePortLabel = "";

    const resolveOutPort = (modelId: EquipmentModelId): string => {
      if (mon.sourcePortIdx === undefined) return "";
      return outputPortOptions(modelId).find(p => p.idx === mon.sourcePortIdx)?.label ?? "";
    };

    const cam = scene.cameras.find(c => c.id === mon.sourceId);
    if (cam) {
      sourceName = DB[cam.model as EquipmentModelId]?.name ?? cam.model;
      sourcePortLabel = resolveOutPort(cam.model as EquipmentModelId);
    } else {
      const rx = scene.wirelessSets.flatMap(ws => ws.rxUnits).find(r => r.id === mon.sourceId);
      if (rx) {
        sourceName = DB[rx.model as EquipmentModelId]?.name ?? rx.model;
        sourcePortLabel = resolveOutPort(rx.model as EquipmentModelId);
      } else {
        const srcMon = scene.monitors.find(m => m.id === mon.sourceId);
        if (srcMon) {
          sourceName = DB[srcMon.model as EquipmentModelId]?.name ?? srcMon.model;
          sourcePortLabel = resolveOutPort(srcMon.model as EquipmentModelId);
        } else {
          const srcConv = scene.converters?.find(c => c.id === mon.sourceId);
          if (srcConv) {
            sourceName = DB[srcConv.model as EquipmentModelId]?.name ?? srcConv.model;
            sourcePortLabel = resolveOutPort(srcConv.model as EquipmentModelId);
          } else {
            const srcMv = scene.multiviewers?.find(m => m.id === mon.sourceId);
            if (srcMv) {
              sourceName = DB[srcMv.model as EquipmentModelId]?.name ?? srcMv.model;
              sourcePortLabel = resolveOutPort(srcMv.model as EquipmentModelId);
            }
          }
        }
      }
    }

    const targetPortLabel = mon.targetPortIdx !== undefined
      ? inputPortOptions(mon.model as EquipmentModelId).find(p => p.idx === mon.targetPortIdx)?.label ?? ""
      : "";

    return { sourceName, sourcePortLabel, targetPortLabel, cableType: mon.cableType };
  }

  // Edge-based connection (manual canvas drag)
  const monPrefix = `${mon.id}_${mon.model}_p`;
  const edge = edges.find(
    e => e.targetHandle?.startsWith(monPrefix) && e.data?.cableType !== "WIRELESS"
  );
  if (!edge?.sourceHandle || !edge.targetHandle) return null;

  const sourceInfo = resolveHandleSource(edge.sourceHandle, scene);
  if (!sourceInfo) return null;

  const targetIdx = parseInt(edge.targetHandle.slice(monPrefix.length), 10);
  const targetPortLabel = !isNaN(targetIdx)
    ? inputPortOptions(mon.model as EquipmentModelId).find(p => p.idx === targetIdx)?.label ?? ""
    : "";

  return {
    sourceName: sourceInfo.name,
    sourcePortLabel: sourceInfo.portLabel,
    targetPortLabel,
    cableType: edge.data?.cableType as string | undefined,
  };
}

// ── Monitor availability (edge-based) ────────────────────────────────────────

function isMonitorAvailable(
  mon: MonitorInstance,
  sourceHandle: string,
  usedHandles: Set<string>,
  edges: Edge[],
): boolean {
  const inputPorts = inputPortOptions(mon.model as EquipmentModelId);
  const monHandles = inputPorts.map(p => monHandle(mon, p.idx));
  // Already connected via this source port → allow modifying
  if (edges.some(e => e.sourceHandle === sourceHandle && monHandles.includes(e.targetHandle ?? ""))) {
    return true;
  }
  // Available if at least one input port is free
  return monHandles.some(h => !usedHandles.has(h));
}

// ── Primitives ────────────────────────────────────────────────────────────────

function Sel({ value, onChange, children, style }: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: C.pageBg,
        border: `1px solid ${C.border}`,
        borderRadius: 5,
        padding: "4px 5px",
        fontSize: 11,
        color: C.text,
        outline: "none",
        cursor: "pointer",
        flex: 1,
        minWidth: 0,
        transition: "border-color 0.2s ease-out",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

function XBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#FFF0F0" : "transparent",
        border: "none",
        color: hov ? C.danger : C.textLight,
        cursor: "pointer",
        fontSize: 13, lineHeight: 1,
        padding: "2px 5px",
        borderRadius: 4,
        flexShrink: 0,
        transition: "background 0.2s ease-out, color 0.2s ease-out",
      }}
    >×</button>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.accent : C.accentBg,
        border: `1px solid ${C.accent}`,
        color: hov ? "#FFFFFF" : C.accent,
        borderRadius: 5, padding: "2px 10px",
        fontSize: 10, fontWeight: 600, cursor: "pointer",
        letterSpacing: 0.2, flexShrink: 0,
        transition: "background 0.2s ease-out, color 0.2s ease-out",
      }}
    >
      ＋ {label}
    </button>
  );
}

function SecHdr({ label, count, onAdd, addLabel }: {
  label: string; count?: number; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "7px 12px 6px",
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      background: C.sectionBg,
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.2 }}>
        {label}
        {count !== undefined && (
          <span style={{ color: C.accent, marginLeft: 5, fontWeight: 600 }}>{count}</span>
        )}
      </span>
      {onAdd && <AddBtn onClick={onAdd} label={addLabel ?? "追加"} />}
    </div>
  );
}

function Card({ children, accentColor, entityId, highlighted }: {
  children: React.ReactNode;
  accentColor: string;
  entityId?: string;
  highlighted?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      data-entity-id={entityId}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        margin: "5px 8px",
        background: hov ? C.hoverBg : C.bg,
        border: highlighted
          ? `1.5px solid ${C.accent}`
          : `1px solid ${hov ? "rgba(0,0,0,0.13)" : C.border}`,
        borderRadius: 6,
        overflow: "hidden",
        transition: "background 0.15s ease-out, border-color 0.15s ease-out",
        boxShadow: highlighted ? `0 0 0 2px ${C.accentBg}` : "none",
      }}
    >
      <div style={{ height: 3, background: accentColor }} />
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, color: C.textLight, fontWeight: 700, letterSpacing: 0.5, marginBottom: 3 }}>
      {children}
    </div>
  );
}

function CableBadge({ type }: { type?: string }) {
  if (!type) return null;
  const color = CABLE_COLORS[type] ?? "#888";
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, color,
      padding: "2px 5px",
      background: `${color}1A`,
      borderRadius: 4,
      flexShrink: 0,
      border: `1px solid ${color}50`,
      whiteSpace: "nowrap",
    }}>
      {type}
    </span>
  );
}

// ── Camera card ───────────────────────────────────────────────────────────────

function CameraCard({ cam, allMonitors, onChange, onRemove, onSetOutput, highlighted, usedHandles, edges }: {
  cam: CameraInstance;
  allMonitors: MonitorInstance[];
  onChange: (c: CameraInstance) => void;
  onRemove: () => void;
  onSetOutput: (portIdx: number, portType: string, monId: string | undefined, monPortIdx?: number) => void;
  highlighted?: boolean;
  usedHandles: Set<string>;
  edges: Edge[];
}) {
  const outputs = outputPortOptions(cam.model as EquipmentModelId);

  return (
    <Card accentColor="#30d158" entityId={cam.id} highlighted={highlighted}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 8px 5px 10px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.text, flex: 1 }}>
          {DB[cam.model as CameraModelId]?.name ?? cam.model}
        </span>
        <XBtn onClick={onRemove} />
      </div>
      <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        <Sel value={cam.model} onChange={v => onChange({ ...cam, model: v })}>
          {CAMERA_IDS.map(id => (
            <option key={id} value={id}>{DB[id]?.name ?? id}</option>
          ))}
        </Sel>

        {outputs.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.borderFaint}`, paddingTop: 5 }}>
            <FieldLabel>接続先</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {outputs.map(port => {
                const srcHandle = camHandle(cam, port.idx);
                const connectedMon = allMonitors.find(
                  m => m.sourceId === cam.id && m.sourcePortIdx === port.idx
                );
                // Monitors with no incoming edge, or already connected to this port
                const availableMonitors = allMonitors.filter(m =>
                  isMonitorAvailable(m, srcHandle, usedHandles, edges)
                );
                // Input ports on the connected monitor that are free (or already this connection)
                const targetInputPorts = connectedMon
                  ? inputPortOptions(connectedMon.model as EquipmentModelId).filter(p => {
                      const h = monHandle(connectedMon, p.idx);
                      return !usedHandles.has(h) || p.idx === connectedMon.targetPortIdx;
                    })
                  : [];

                return (
                  <div key={port.idx}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{
                        fontSize: 9, color: C.textLight, flexShrink: 0,
                        width: 50, textAlign: "right",
                      }}>
                        {port.label}
                      </span>
                      <Sel
                        value={connectedMon?.id ?? ""}
                        onChange={v => {
                          if (!v) { onSetOutput(port.idx, port.type, undefined); return; }
                          const newMon = allMonitors.find(m => m.id === v);
                          // Prefer type-matching free input port, fall back to any free
                          const freePorts = newMon
                            ? inputPortOptions(newMon.model as EquipmentModelId).filter(p =>
                                !usedHandles.has(monHandle(newMon, p.idx))
                              )
                            : [];
                          const firstFreeIn = freePorts.find(p => p.type === port.type) ?? freePorts[0];
                          onSetOutput(port.idx, port.type, v, firstFreeIn?.idx);
                        }}
                      >
                        <option value="">未接続</option>
                        {availableMonitors.map(m => (
                          <option key={m.id} value={m.id}>
                            {DB[m.model as EquipmentModelId]?.name ?? m.model}（{SCENE_ROLE_LABELS[m.role]}）
                          </option>
                        ))}
                      </Sel>
                      <CableBadge type={port.type} />
                    </div>
                    {connectedMon && targetInputPorts.length > 1 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, paddingLeft: 8 }}>
                        <span style={{ fontSize: 9, color: C.textLight, flexShrink: 0 }}>入力</span>
                        <Sel
                          value={String(connectedMon.targetPortIdx ?? targetInputPorts[0]?.idx ?? "")}
                          onChange={v => onSetOutput(port.idx, port.type, connectedMon.id, Number(v))}
                        >
                          {targetInputPorts.map(p => (
                            <option key={p.idx} value={String(p.idx)}>{p.label}</option>
                          ))}
                        </Sel>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Monitor card ──────────────────────────────────────────────────────────────

function MonitorCard({
  mon, cameras, onChange, onRemove, highlighted, connectionInfo,
  allRxUnits, allMonitors, allWirelessSets, allConverters, onConnect, onConnectOut, onDisconnectDest, usedHandles,
}: {
  mon: MonitorInstance;
  cameras: CameraInstance[];
  onChange: (m: MonitorInstance) => void;
  onRemove: () => void;
  highlighted?: boolean;
  connectionInfo: ConnectionInfo;
  allRxUnits: WirelessRxUnit[];
  allMonitors: MonitorInstance[];
  allWirelessSets: WirelessSetInstance[];
  allConverters: ConverterInstance[];
  onConnect: (sourceId: string, sourcePortIdx: number, cableType: string, targetPortIdx: number) => void;
  onConnectOut: (destType: "monitor" | "tx", destId: string, srcPortIdx: number, cableType: string, destInPortIdx?: number) => void;
  onDisconnectDest: (destType: "monitor" | "tx", destId: string) => void;
  usedHandles: Set<string>;
}) {
  const [selSrcId, setSelSrcId] = useState("");
  const [selOutPortIdx, setSelOutPortIdx] = useState<number | undefined>(undefined);
  const [selInPortIdx, setSelInPortIdx] = useState<number | undefined>(undefined);
  const [selCableType, setSelCableType] = useState("SDI");
  // 接続先フォーム state
  const [dstId, setDstId] = useState("");
  const [dstOutIdx, setDstOutIdx] = useState<number | undefined>(undefined);
  const [dstInIdx, setDstInIdx] = useState<number | undefined>(undefined);

  const dot = ROLE_DOT[mon.role] ?? C.textLight;
  const isConnected = !!connectionInfo;

  type ConnSrc = { id: string; model: string; label: string };
  const srcCameras: ConnSrc[] = cameras.map(c => ({
    id: c.id, model: c.model,
    label: DB[c.model as EquipmentModelId]?.name ?? c.model,
  }));
  const srcRxUnits: ConnSrc[] = allRxUnits.map(rx => ({
    id: rx.id, model: rx.model,
    label: DB[rx.model as EquipmentModelId]?.name ?? rx.model,
  }));
  const srcMonitors: ConnSrc[] = allMonitors.filter(m => m.id !== mon.id).map(m => ({
    id: m.id, model: m.model,
    label: DB[m.model as EquipmentModelId]?.name ?? m.model,
  }));
  const srcConverters: ConnSrc[] = allConverters.map(c => ({
    id: c.id, model: c.model,
    label: DB[c.model as EquipmentModelId]?.name ?? c.model,
  }));
  const hasFreeOut = (s: ConnSrc) =>
    outputPortOptions(s.model as EquipmentModelId).some(
      p => !usedHandles.has(`${s.id}_${s.model}_p${p.idx}`)
    );
  const availCams  = srcCameras.filter(hasFreeOut);
  const availRxs   = srcRxUnits.filter(hasFreeOut);
  const availMons  = srcMonitors.filter(hasFreeOut);
  const availConvs = srcConverters.filter(hasFreeOut);

  const selSrc = [...availCams, ...availRxs, ...availMons, ...availConvs].find(s => s.id === selSrcId);
  const freeOutPorts = selSrc
    ? outputPortOptions(selSrc.model as EquipmentModelId).filter(
        p => !usedHandles.has(`${selSrc.id}_${selSrc.model}_p${p.idx}`)
      )
    : [];
  const freeInPorts = inputPortOptions(mon.model as EquipmentModelId).filter(
    p => !usedHandles.has(monHandle(mon, p.idx))
  );
  const activeOut = freeOutPorts.find(p => p.idx === selOutPortIdx) ?? freeOutPorts[0];
  const activeIn  = freeInPorts.find(p => p.idx === selInPortIdx)
    ?? freeInPorts.find(p => p.type === activeOut?.type)
    ?? freeInPorts[0];
  const canConnect = !!selSrc && !!activeOut && !!activeIn;

  // ── 接続先 derived values ────────────────────────────────────────────────────
  const monOutPorts = outputPortOptions(mon.model as EquipmentModelId);
  const freeMonOutPorts = monOutPorts.filter(p => !usedHandles.has(monHandle(mon, p.idx)));
  const existingDestMonitors = allMonitors.filter(m => m.sourceId === mon.id);
  const existingDestTxSets = allWirelessSets.filter(ws => ws.sourceId === mon.id);
  const parseDstId = (v: string): { type: "monitor" | "tx"; id: string } | null => {
    if (v.startsWith("mon:")) return { type: "monitor", id: v.slice(4) };
    if (v.startsWith("tx:"))  return { type: "tx",      id: v.slice(3) };
    return null;
  };
  const parsedDst     = parseDstId(dstId);
  const dstDestMon    = parsedDst?.type === "monitor" ? allMonitors.find(m => m.id === parsedDst.id) : undefined;
  const dstFreeInPorts = dstDestMon
    ? inputPortOptions(dstDestMon.model as EquipmentModelId).filter(p => !usedHandles.has(monHandle(dstDestMon, p.idx)))
    : [];
  const activeDstOutPort = freeMonOutPorts.find(p => p.idx === dstOutIdx) ?? freeMonOutPorts[0];
  const activeDstInPort  = dstFreeInPorts.find(p => p.idx === dstInIdx)
    ?? dstFreeInPorts.find(p => p.type === activeDstOutPort?.type)
    ?? dstFreeInPorts[0];
  const canDstConnect = !!parsedDst && !!activeDstOutPort &&
    (parsedDst.type === "tx" || !!activeDstInPort);
  const availDestMonitors = allMonitors.filter(m =>
    m.id !== mon.id &&
    m.sourceId !== mon.id &&
    inputPortOptions(m.model as EquipmentModelId).some(p => !usedHandles.has(monHandle(m, p.idx)))
  );
  const availDestTxSets = allWirelessSets.filter(ws => ws.sourceId !== mon.id);

  return (
    <Card accentColor={dot} entityId={mon.id} highlighted={highlighted}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 8px 5px 10px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: dot, flex: 1, letterSpacing: 0.3 }}>
          {SCENE_ROLE_LABELS[mon.role]}
        </span>
        <div
          title={isConnected ? "接続済み" : "未接続"}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: isConnected ? "#30d158" : "#ff3b30",
            flexShrink: 0,
          }}
        />
        <XBtn onClick={onRemove} />
      </div>
      <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        <Sel
          value={mon.model}
          onChange={v => onChange({ ...mon, model: v, targetPortIdx: undefined })}
        >
          {MONITOR_MODELS.map(id => (
            <option key={id} value={id}>{DB[id]?.name ?? id}</option>
          ))}
        </Sel>

        <div style={{ display: "flex", gap: 5 }}>
          <Sel
            value={mon.role}
            onChange={v => onChange({ ...mon, role: v as SceneMonitorRole })}
            style={{ flex: "0 0 auto" }}
          >
            {SCENE_ROLES.map(r => (
              <option key={r} value={r}>{SCENE_ROLE_LABELS[r]}</option>
            ))}
          </Sel>
          {cameras.length > 1 && (
            <Sel
              value={mon.cameraId ?? ""}
              onChange={v => onChange({ ...mon, cameraId: v || undefined })}
            >
              <option value="">未割当</option>
              {cameras.map(c => (
                <option key={c.id} value={c.id}>
                  {DB[c.model as CameraModelId]?.name ?? c.model}
                </option>
              ))}
            </Sel>
          )}
        </div>

        {/* Connection status / connect form */}
        <div style={{ borderTop: `1px solid ${C.borderFaint}`, paddingTop: 5 }}>
          {connectionInfo ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <FieldLabel>接続元</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, color: C.textLight, flexShrink: 0 }}>←</span>
                <span style={{ fontSize: 10, color: C.text, fontWeight: 600 }}>
                  {connectionInfo.sourceName}
                </span>
                {connectionInfo.sourcePortLabel && (
                  <span style={{ fontSize: 9, color: C.textDim }}>
                    / {connectionInfo.sourcePortLabel}
                  </span>
                )}
                {connectionInfo.targetPortLabel && (
                  <>
                    <span style={{ fontSize: 9, color: C.textLight }}>→</span>
                    <span style={{ fontSize: 9, color: C.textDim }}>{connectionInfo.targetPortLabel}</span>
                  </>
                )}
              </div>
              {connectionInfo.cableType && <CableBadge type={connectionInfo.cableType} />}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <FieldLabel>接続元を設定</FieldLabel>
              <Sel
                value={selSrcId}
                onChange={v => {
                  setSelSrcId(v);
                  setSelOutPortIdx(undefined);
                  setSelInPortIdx(undefined);
                  const src = [...availCams, ...availRxs, ...availMons, ...availConvs].find(s => s.id === v);
                  const firstFree = src
                    ? outputPortOptions(src.model as EquipmentModelId).find(
                        p => !usedHandles.has(`${src.id}_${src.model}_p${p.idx}`)
                      )
                    : undefined;
                  setSelCableType(firstFree?.type ?? "SDI");
                }}
              >
                <option value="">— 接続元を選択 —</option>
                {availCams.length > 0 && (
                  <optgroup label="カメラ">
                    {availCams.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </optgroup>
                )}
                {availRxs.length > 0 && (
                  <optgroup label="ワイヤレス RX">
                    {availRxs.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </optgroup>
                )}
                {availMons.length > 0 && (
                  <optgroup label="モニター">
                    {availMons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </optgroup>
                )}
                {availConvs.length > 0 && (
                  <optgroup label="コンバーター">
                    {availConvs.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </optgroup>
                )}
              </Sel>
              {selSrc && freeOutPorts.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>出力</span>
                  <Sel
                    value={String(activeOut?.idx ?? "")}
                    onChange={v => {
                      const idx = Number(v);
                      setSelOutPortIdx(idx);
                      const p = freeOutPorts.find(pp => pp.idx === idx);
                      if (p) setSelCableType(p.type);
                    }}
                  >
                    {freeOutPorts.map(p => (
                      <option key={p.idx} value={String(p.idx)}>{p.label}</option>
                    ))}
                  </Sel>
                </div>
              )}
              {selSrc && freeInPorts.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>入力</span>
                  <Sel
                    value={String(activeIn?.idx ?? "")}
                    onChange={v => setSelInPortIdx(Number(v))}
                  >
                    {freeInPorts.map(p => (
                      <option key={p.idx} value={String(p.idx)}>{p.label}</option>
                    ))}
                  </Sel>
                </div>
              )}
              {selSrc && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>種類</span>
                  <Sel value={selCableType} onChange={v => setSelCableType(v)}>
                    <option value="SDI">SDI</option>
                    <option value="HDMI">HDMI</option>
                  </Sel>
                </div>
              )}
              {canConnect && (
                <button
                  onClick={() => {
                    onConnect(selSrc!.id, activeOut!.idx, selCableType, activeIn!.idx);
                    setSelSrcId("");
                    setSelOutPortIdx(undefined);
                    setSelInPortIdx(undefined);
                    setSelCableType("SDI");
                  }}
                  style={{
                    marginTop: 2,
                    background: C.accent,
                    border: "none",
                    borderRadius: 5,
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 10px",
                    cursor: "pointer",
                    width: "100%",
                    fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
                  }}
                >
                  接続する
                </button>
              )}
            </div>
          )}
        </div>

        {/* 接続先セクション - OUTポートを持つモニターのみ表示 */}
        {monOutPorts.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.borderFaint}`, paddingTop: 5, marginTop: 3 }}>
            <FieldLabel>接続先</FieldLabel>

            {/* 既存の接続先（モニター） */}
            {existingDestMonitors.map(destMon => {
              const srcLbl = outputPortOptions(mon.model as EquipmentModelId)
                .find(p => p.idx === destMon.sourcePortIdx)?.label ?? "";
              const dstLbl = inputPortOptions(destMon.model as EquipmentModelId)
                .find(p => p.idx === destMon.targetPortIdx)?.label ?? "";
              return (
                <div key={destMon.id} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 0", marginBottom: 2,
                }}>
                  <span style={{ fontSize: 9, color: C.textLight, flexShrink: 0 }}>→</span>
                  <span style={{
                    fontSize: 10, color: C.text, flex: 1, minWidth: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {DB[destMon.model as EquipmentModelId]?.name ?? destMon.model}
                  </span>
                  {(srcLbl || dstLbl) && (
                    <span style={{ fontSize: 9, color: C.textDim, flexShrink: 0 }}>
                      {srcLbl}{srcLbl && dstLbl ? "→" : ""}{dstLbl}
                    </span>
                  )}
                  {destMon.cableType && <CableBadge type={destMon.cableType} />}
                  <button
                    onClick={() => onDisconnectDest("monitor", destMon.id)}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      color: C.textLight, fontSize: 12, padding: "0 2px", flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >×</button>
                </div>
              );
            })}

            {/* 既存の接続先（TX） */}
            {existingDestTxSets.map(ws => (
              <div key={ws.id} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "3px 0", marginBottom: 2,
              }}>
                <span style={{ fontSize: 9, color: C.textLight, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 10, color: C.text, flex: 1 }}>
                  {DB[(ws.txModel ?? "wireless_tx") as EquipmentModelId]?.name ?? ws.txModel}
                  <span style={{ fontSize: 9, color: C.textDim }}> (TX)</span>
                </span>
                <button
                  onClick={() => onDisconnectDest("tx", ws.id)}
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: C.textLight, fontSize: 12, padding: "0 2px", flexShrink: 0,
                    lineHeight: 1,
                  }}
                >×</button>
              </div>
            ))}

            {/* 接続先追加フォーム */}
            {freeMonOutPorts.length > 0 && (availDestMonitors.length > 0 || availDestTxSets.length > 0) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
                {freeMonOutPorts.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>出力</span>
                    <Sel
                      value={String(activeDstOutPort?.idx ?? "")}
                      onChange={v => setDstOutIdx(Number(v))}
                    >
                      {freeMonOutPorts.map(p => (
                        <option key={p.idx} value={String(p.idx)}>{p.label}</option>
                      ))}
                    </Sel>
                  </div>
                )}
                <Sel value={dstId} onChange={v => { setDstId(v); setDstInIdx(undefined); }}>
                  <option value="">— 接続先を選択 —</option>
                  {availDestMonitors.length > 0 && (
                    <optgroup label="モニター">
                      {availDestMonitors.map(m => (
                        <option key={m.id} value={`mon:${m.id}`}>
                          {DB[m.model as EquipmentModelId]?.name ?? m.model}（{SCENE_ROLE_LABELS[m.role]}）
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {availDestTxSets.length > 0 && (
                    <optgroup label="ワイヤレス TX">
                      {availDestTxSets.map(ws => (
                        <option key={ws.id} value={`tx:${ws.id}`}>
                          {DB[(ws.txModel ?? "wireless_tx") as EquipmentModelId]?.name ?? ws.txModel}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </Sel>
                {dstDestMon && dstFreeInPorts.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>入力</span>
                    <Sel
                      value={String(activeDstInPort?.idx ?? "")}
                      onChange={v => setDstInIdx(Number(v))}
                    >
                      {dstFreeInPorts.map(p => (
                        <option key={p.idx} value={String(p.idx)}>{p.label}</option>
                      ))}
                    </Sel>
                  </div>
                )}
                {canDstConnect && (
                  <button
                    onClick={() => {
                      if (!parsedDst || !activeDstOutPort) return;
                      onConnectOut(
                        parsedDst.type,
                        parsedDst.id,
                        activeDstOutPort.idx,
                        activeDstOutPort.type,
                        parsedDst.type === "monitor" ? activeDstInPort?.idx : undefined,
                      );
                      setDstId("");
                      setDstOutIdx(undefined);
                      setDstInIdx(undefined);
                    }}
                    style={{
                      marginTop: 2, background: C.accent, border: "none",
                      borderRadius: 5, color: "#FFFFFF", fontSize: 11,
                      fontWeight: 600, padding: "5px 10px", cursor: "pointer",
                      width: "100%",
                      fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
                    }}
                  >
                    接続する
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Wireless set card ─────────────────────────────────────────────────────────

function WirelessCard({
  ws, cameras, monitors, onChange, onRemove, onSetRxMonitor, onRemoveRxUnit, highlighted, usedHandles, edges,
}: {
  ws: WirelessSetInstance;
  cameras: CameraInstance[];
  monitors: MonitorInstance[];
  onChange: (w: WirelessSetInstance) => void;
  onRemove: () => void;
  onSetRxMonitor: (
    rxId: string,
    monitorId: string | undefined,
    cableType: string,
    rxPortIdx?: number,
    monPortIdx?: number,
  ) => void;
  onRemoveRxUnit: (rxId: string) => void;
  highlighted?: boolean;
  usedHandles: Set<string>;
  edges: Edge[];
}) {
  const addRx = () => {
    const newRx: WirelessRxUnit = { id: `rx${uid()}`, model: "wireless_rx" };
    onChange({ ...ws, rxUnits: [...ws.rxUnits, newRx] });
  };

  const updateRxModel = (idx: number, model: string) => {
    const next = ws.rxUnits.map((rx, i) => i === idx ? { ...rx, model } : rx);
    onChange({ ...ws, rxUnits: next });
  };

  const removeRx = (idx: number) => {
    const rx = ws.rxUnits[idx];
    onRemoveRxUnit(rx.id);
    onChange({ ...ws, rxUnits: ws.rxUnits.filter((_, i) => i !== idx) });
  };

  return (
    <Card accentColor="#ff9f0a" entityId={ws.id} highlighted={highlighted}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 8px 5px 10px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#ff9f0a", flex: 1, letterSpacing: 0.5 }}>
          WIRELESS SET
        </span>
        <XBtn onClick={onRemove} />
      </div>
      <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 7 }}>

        {/* TX */}
        <div>
          <FieldLabel>TX</FieldLabel>
          <Sel
            value={ws.txModel ?? "wireless_tx"}
            onChange={v => onChange({ ...ws, txModel: v as WirelessModelId })}
          >
            {WIRELESS_TX_IDS.map(id => (
              <option key={id} value={id}>{DB[id]?.name ?? id}</option>
            ))}
          </Sel>
        </div>

        {/* RX units */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <FieldLabel>RX</FieldLabel>
            <AddBtn onClick={addRx} label="RX追加" />
          </div>
          {ws.rxUnits.length === 0 && (
            <p style={{ fontSize: 10, color: C.textLight, margin: "4px 0" }}>RXがありません</p>
          )}
          {ws.rxUnits.map((rx, idx) => {
            const connectedMon = monitors.find(m => m.sourceId === rx.id);
            const rxOutPorts = outputPortOptions(rx.model as EquipmentModelId);

            // Available RX output ports: not used, or already this connection's port
            const availableRxPorts = rxOutPorts.filter(p => {
              const h = rxHandle(rx, p.idx);
              return !usedHandles.has(h) || p.idx === connectedMon?.sourcePortIdx;
            });
            const firstRxPort = availableRxPorts[0];

            // Monitors available for this RX's output
            const rxSrcHandle = firstRxPort ? rxHandle(rx, firstRxPort.idx) : "";
            const availableMonitors = monitors.filter(m =>
              isMonitorAvailable(m, rxSrcHandle, usedHandles, edges)
            );

            // Available input ports on connected monitor
            const targetInputPorts = connectedMon
              ? inputPortOptions(connectedMon.model as EquipmentModelId).filter(p => {
                  const h = monHandle(connectedMon, p.idx);
                  return !usedHandles.has(h) || p.idx === connectedMon.targetPortIdx;
                })
              : [];

            return (
              <div key={rx.id} style={{
                background: C.pageBg,
                border: `1px solid ${C.borderFaint}`,
                borderRadius: 5,
                padding: "6px 8px",
                marginBottom: 5,
              }}>
                <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 5 }}>
                  <Sel value={rx.model} onChange={v => updateRxModel(idx, v)}>
                    {WIRELESS_RX_IDS.map(id => (
                      <option key={id} value={id}>{DB[id]?.name ?? id}</option>
                    ))}
                  </Sel>
                  <XBtn onClick={() => removeRx(idx)} />
                </div>

                {/* RX output port selector (only if multiple available) */}
                {availableRxPorts.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                    <span style={{ fontSize: 9, color: C.textLight, flexShrink: 0 }}>出力</span>
                    <Sel
                      value={String(connectedMon?.sourcePortIdx ?? availableRxPorts[0]?.idx ?? "")}
                      onChange={v => {
                        if (!connectedMon) return;
                        const port = rxOutPorts.find(p => p.idx === Number(v));
                        onSetRxMonitor(rx.id, connectedMon.id, port?.type ?? "SDI", Number(v), connectedMon.targetPortIdx);
                      }}
                    >
                      {availableRxPorts.map(p => (
                        <option key={p.idx} value={String(p.idx)}>{p.label}</option>
                      ))}
                    </Sel>
                  </div>
                )}

                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: C.textLight, flexShrink: 0 }}>→</span>
                  <Sel
                    value={connectedMon?.id ?? ""}
                    onChange={v => {
                      const newMon = monitors.find(m => m.id === v);
                      const chosenRxPort = availableRxPorts[0];
                      const freePorts = newMon
                        ? inputPortOptions(newMon.model as EquipmentModelId).filter(p =>
                            !usedHandles.has(monHandle(newMon, p.idx))
                          )
                        : [];
                      const firstFreeIn = freePorts.find(p => p.type === (chosenRxPort?.type ?? "SDI")) ?? freePorts[0];
                      onSetRxMonitor(
                        rx.id,
                        v || undefined,
                        chosenRxPort?.type ?? "SDI",
                        chosenRxPort?.idx,
                        firstFreeIn?.idx,
                      );
                    }}
                  >
                    <option value="">接続先未設定</option>
                    {availableMonitors.map(m => (
                      <option key={m.id} value={m.id}>
                        {DB[m.model as EquipmentModelId]?.name ?? m.model}（{SCENE_ROLE_LABELS[m.role]}）
                      </option>
                    ))}
                  </Sel>
                </div>

                {connectedMon && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: C.textLight, flexShrink: 0 }}>入力</span>
                    {targetInputPorts.length > 1 ? (
                      <Sel
                        value={String(connectedMon.targetPortIdx ?? targetInputPorts[0]?.idx ?? "")}
                        onChange={v => {
                          onSetRxMonitor(
                            rx.id,
                            connectedMon.id,
                            connectedMon.cableType ?? "SDI",
                            connectedMon.sourcePortIdx,
                            Number(v),
                          );
                        }}
                      >
                        {targetInputPorts.map(p => (
                          <option key={p.idx} value={String(p.idx)}>{p.label}</option>
                        ))}
                      </Sel>
                    ) : (
                      <span style={{ fontSize: 10, color: C.text, flex: 1 }}>
                        {targetInputPorts[0]?.label ?? connectedMon.targetPortIdx !== undefined
                          ? inputPortOptions(connectedMon.model as EquipmentModelId)
                              .find(p => p.idx === connectedMon.targetPortIdx)?.label ?? "—"
                          : "—"}
                      </span>
                    )}
                    <CableBadge type={connectedMon.cableType} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Source camera */}
        {/* Source: camera or monitor loop-through */}
        <div>
          {(() => {
            const srcMon = monitors.find(m => m.id === ws.sourceId);
            if (srcMon) {
              return (
                <>
                  <FieldLabel>送信元</FieldLabel>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 11, color: C.text, flex: 1 }}>
                      {DB[srcMon.model as EquipmentModelId]?.name ?? srcMon.model}
                      <span style={{ fontSize: 10, color: C.textDim }}>（モニター）</span>
                    </span>
                    <button
                      onClick={() => onChange({ ...ws, sourceId: "" })}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: C.textLight, fontSize: 12, padding: "0 2px", lineHeight: 1,
                      }}
                    >×</button>
                  </div>
                </>
              );
            }
            return (
              <>
                <FieldLabel>送信元カメラ</FieldLabel>
                <Sel value={ws.sourceId} onChange={v => onChange({ ...ws, sourceId: v })}>
                  {cameras.map(c => (
                    <option key={c.id} value={c.id}>
                      {DB[c.model as CameraModelId]?.name ?? c.model}
                    </option>
                  ))}
                </Sel>
              </>
            );
          })()}
        </div>
      </div>
    </Card>
  );
}

// ── Shared source/dest card helper ───────────────────────────────────────────

function DeviceCard({
  nodeId, nodeModel, nodeType, accentColor, typeLabel,
  cameras, allRxUnits, allMonitors, allConverters, allWirelessSets,
  highlighted, usedHandles, isConnected, modelSelector,
  sourceId, sourcePortIdx, targetPortIdx, cableType,
  onClearSource,
  onConnectSource,
  onConnectOut, onDisconnectDest,
}: {
  nodeId: string;
  nodeModel: string;
  nodeType: string;
  accentColor: string;
  typeLabel: string;
  cameras: CameraInstance[];
  allRxUnits: WirelessRxUnit[];
  allMonitors: MonitorInstance[];
  allConverters: ConverterInstance[];
  allWirelessSets: WirelessSetInstance[];
  highlighted?: boolean;
  usedHandles: Set<string>;
  isConnected: boolean;
  modelSelector: React.ReactNode;
  sourceId?: string;
  sourcePortIdx?: number;
  targetPortIdx?: number;
  cableType?: string;
  onClearSource: () => void;
  onConnectSource: (srcId: string, srcPortIdx: number, cable: string, tgtPortIdx: number) => void;
  onConnectOut: (destType: "monitor" | "tx", destId: string, srcPortIdx: number, cable: string, destInPortIdx?: number) => void;
  onDisconnectDest: (destType: "monitor" | "tx", destId: string) => void;
}) {
  const [selSrcId, setSelSrcId] = useState("");
  const [selOutPortIdx, setSelOutPortIdx] = useState<number | undefined>(undefined);
  const [selInPortIdx, setSelInPortIdx] = useState<number | undefined>(undefined);
  const [selCableType, setSelCableType] = useState("SDI");
  const [dstId, setDstId] = useState("");
  const [dstOutIdx, setDstOutIdx] = useState<number | undefined>(undefined);
  const [dstInIdx, setDstInIdx] = useState<number | undefined>(undefined);

  type ConnSrc = { id: string; model: string; label: string };
  const hasFreeOut = (s: ConnSrc) =>
    outputPortOptions(s.model as EquipmentModelId).some(p => !usedHandles.has(`${s.id}_${s.model}_p${p.idx}`));

  const availCams: ConnSrc[]  = cameras.map(c => ({ id: c.id, model: c.model, label: DB[c.model as EquipmentModelId]?.name ?? c.model })).filter(hasFreeOut);
  const availRxs: ConnSrc[]   = allRxUnits.map(r => ({ id: r.id, model: r.model, label: DB[r.model as EquipmentModelId]?.name ?? r.model })).filter(hasFreeOut);
  const availMons: ConnSrc[]  = allMonitors.map(m => ({ id: m.id, model: m.model, label: DB[m.model as EquipmentModelId]?.name ?? m.model })).filter(hasFreeOut);
  const availConvs: ConnSrc[] = allConverters.filter(c => c.id !== nodeId).map(c => ({ id: c.id, model: c.model, label: DB[c.model as EquipmentModelId]?.name ?? c.model })).filter(hasFreeOut);
  const allSrcs = [...availCams, ...availRxs, ...availMons, ...availConvs];

  const selSrc = allSrcs.find(s => s.id === selSrcId);
  const freeOutPorts = selSrc ? outputPortOptions(selSrc.model as EquipmentModelId).filter(p => !usedHandles.has(`${selSrc.id}_${selSrc.model}_p${p.idx}`)) : [];
  const freeInPorts  = inputPortOptions(nodeModel as EquipmentModelId).filter(p => !usedHandles.has(`${nodeId}_${nodeModel}_p${p.idx}`));
  const activeOut = freeOutPorts.find(p => p.idx === selOutPortIdx) ?? freeOutPorts[0];
  const activeIn  = freeInPorts.find(p => p.idx === selInPortIdx) ?? freeInPorts.find(p => p.type === activeOut?.type) ?? freeInPorts[0];
  const canConnect = !!selSrc && !!activeOut && !!activeIn;

  // 接続先 derivations
  const outPorts     = outputPortOptions(nodeModel as EquipmentModelId);
  const freeOutPorts2 = outPorts.filter(p => !usedHandles.has(`${nodeId}_${nodeModel}_p${p.idx}`));
  const existingDestMons = allMonitors.filter(m => m.sourceId === nodeId);
  const existingDestTxs  = allWirelessSets.filter(ws => ws.sourceId === nodeId);
  const parseDstId = (v: string): { type: "monitor" | "tx"; id: string } | null => {
    if (v.startsWith("mon:")) return { type: "monitor", id: v.slice(4) };
    if (v.startsWith("tx:"))  return { type: "tx",      id: v.slice(3) };
    return null;
  };
  const parsedDst     = parseDstId(dstId);
  const dstDestMon    = parsedDst?.type === "monitor" ? allMonitors.find(m => m.id === parsedDst.id) : undefined;
  const dstFreeInPorts = dstDestMon ? inputPortOptions(dstDestMon.model as EquipmentModelId).filter(p => !usedHandles.has(monHandle(dstDestMon, p.idx))) : [];
  const activeDstOut  = freeOutPorts2.find(p => p.idx === dstOutIdx) ?? freeOutPorts2[0];
  const activeDstIn   = dstFreeInPorts.find(p => p.idx === dstInIdx) ?? dstFreeInPorts.find(p => p.type === activeDstOut?.type) ?? dstFreeInPorts[0];
  const canDstConn    = !!parsedDst && !!activeDstOut && (parsedDst.type === "tx" || !!activeDstIn);
  const availDestMons = allMonitors.filter(m => m.sourceId !== nodeId && inputPortOptions(m.model as EquipmentModelId).some(p => !usedHandles.has(monHandle(m, p.idx))));
  const availDestTxs  = allWirelessSets.filter(ws => ws.sourceId !== nodeId);

  // Resolve source name for display
  const resolvedSrcName = sourceId
    ? (cameras.find(c => c.id === sourceId)
        ? DB[cameras.find(c => c.id === sourceId)!.model as EquipmentModelId]?.name
        : allRxUnits.find(r => r.id === sourceId)
          ? DB[allRxUnits.find(r => r.id === sourceId)!.model as EquipmentModelId]?.name
          : allMonitors.find(m => m.id === sourceId)
            ? DB[allMonitors.find(m => m.id === sourceId)!.model as EquipmentModelId]?.name
            : allConverters.find(c => c.id === sourceId)
              ? DB[allConverters.find(c => c.id === sourceId)!.model as EquipmentModelId]?.name
              : sourceId) ?? sourceId
    : undefined;

  return (
    <div style={{ margin: "5px 8px", background: C.bg, border: highlighted ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden", boxShadow: highlighted ? `0 0 0 2px ${C.accentBg}` : "none" }}>
      <div style={{ height: 3, background: accentColor }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px 5px 10px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: accentColor, flex: 1, letterSpacing: 0.5 }}>
          {typeLabel}
        </span>
        <div title={isConnected ? "入力接続済み" : "入力未接続"} style={{ width: 6, height: 6, borderRadius: "50%", background: isConnected ? "#30d158" : "#ff3b30", flexShrink: 0 }} />
      </div>
      <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        {modelSelector}

        {/* 接続元 */}
        <div style={{ borderTop: `1px solid ${C.borderFaint}`, paddingTop: 5 }}>
          {sourceId ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <FieldLabel>接続元</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 9, color: C.textLight }}>←</span>
                <span style={{ fontSize: 10, color: C.text, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {resolvedSrcName}
                </span>
                {cableType && <CableBadge type={cableType} />}
                <button onClick={onClearSource} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textLight, fontSize: 12, padding: "0 2px", lineHeight: 1 }}>×</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <FieldLabel>接続元を設定</FieldLabel>
              <Sel value={selSrcId} onChange={v => {
                setSelSrcId(v);
                setSelOutPortIdx(undefined);
                setSelInPortIdx(undefined);
                const src = allSrcs.find(s => s.id === v);
                const firstFree = src ? outputPortOptions(src.model as EquipmentModelId).find(p => !usedHandles.has(`${src.id}_${src.model}_p${p.idx}`)) : undefined;
                setSelCableType(firstFree?.type ?? "SDI");
              }}>
                <option value="">— 接続元を選択 —</option>
                {availCams.length > 0 && <optgroup label="カメラ">{availCams.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup>}
                {availRxs.length > 0  && <optgroup label="ワイヤレス RX">{availRxs.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup>}
                {availMons.length > 0 && <optgroup label="モニター">{availMons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup>}
                {availConvs.length > 0 && <optgroup label="コンバーター">{availConvs.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup>}
              </Sel>
              {selSrc && freeOutPorts.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>出力</span>
                  <Sel value={String(activeOut?.idx ?? "")} onChange={v => { const idx = Number(v); setSelOutPortIdx(idx); const p = freeOutPorts.find(pp => pp.idx === idx); if (p) setSelCableType(p.type); }}>
                    {freeOutPorts.map(p => <option key={p.idx} value={String(p.idx)}>{p.label}</option>)}
                  </Sel>
                </div>
              )}
              {selSrc && freeInPorts.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>入力</span>
                  <Sel value={String(activeIn?.idx ?? "")} onChange={v => setSelInPortIdx(Number(v))}>
                    {freeInPorts.map(p => <option key={p.idx} value={String(p.idx)}>{p.label}</option>)}
                  </Sel>
                </div>
              )}
              {canConnect && (
                <button onClick={() => { onConnectSource(selSrc!.id, activeOut!.idx, selCableType, activeIn!.idx); setSelSrcId(""); setSelOutPortIdx(undefined); setSelInPortIdx(undefined); setSelCableType("SDI"); }}
                  style={{ marginTop: 2, background: C.accent, border: "none", borderRadius: 5, color: "#FFFFFF", fontSize: 11, fontWeight: 600, padding: "5px 10px", cursor: "pointer", width: "100%", fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif" }}>
                  接続する
                </button>
              )}
            </div>
          )}
        </div>

        {/* 接続先 */}
        {outPorts.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.borderFaint}`, paddingTop: 5, marginTop: 3 }}>
            <FieldLabel>接続先</FieldLabel>
            {existingDestMons.map(destMon => {
              const srcLbl = outPorts.find(p => p.idx === destMon.sourcePortIdx)?.label ?? "";
              const dstLbl = inputPortOptions(destMon.model as EquipmentModelId).find(p => p.idx === destMon.targetPortIdx)?.label ?? "";
              return (
                <div key={destMon.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 0", marginBottom: 2 }}>
                  <span style={{ fontSize: 9, color: C.textLight }}>→</span>
                  <span style={{ fontSize: 10, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {DB[destMon.model as EquipmentModelId]?.name ?? destMon.model}
                  </span>
                  {(srcLbl || dstLbl) && <span style={{ fontSize: 9, color: C.textDim, flexShrink: 0 }}>{srcLbl}{srcLbl && dstLbl ? "→" : ""}{dstLbl}</span>}
                  {destMon.cableType && <CableBadge type={destMon.cableType} />}
                  <button onClick={() => onDisconnectDest("monitor", destMon.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textLight, fontSize: 12, padding: "0 2px", lineHeight: 1 }}>×</button>
                </div>
              );
            })}
            {existingDestTxs.map(ws => (
              <div key={ws.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 0", marginBottom: 2 }}>
                <span style={{ fontSize: 9, color: C.textLight }}>→</span>
                <span style={{ fontSize: 10, color: C.text, flex: 1 }}>
                  {DB[(ws.txModel ?? "wireless_tx") as EquipmentModelId]?.name ?? ws.txModel}
                  <span style={{ fontSize: 9, color: C.textDim }}> (TX)</span>
                </span>
                <button onClick={() => onDisconnectDest("tx", ws.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textLight, fontSize: 12, padding: "0 2px", lineHeight: 1 }}>×</button>
              </div>
            ))}
            {freeOutPorts2.length > 0 && (availDestMons.length > 0 || availDestTxs.length > 0) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
                {freeOutPorts2.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>出力</span>
                    <Sel value={String(activeDstOut?.idx ?? "")} onChange={v => setDstOutIdx(Number(v))}>
                      {freeOutPorts2.map(p => <option key={p.idx} value={String(p.idx)}>{p.label}</option>)}
                    </Sel>
                  </div>
                )}
                <Sel value={dstId} onChange={v => { setDstId(v); setDstInIdx(undefined); }}>
                  <option value="">— 接続先を選択 —</option>
                  {availDestMons.length > 0 && <optgroup label="モニター">{availDestMons.map(m => <option key={m.id} value={`mon:${m.id}`}>{DB[m.model as EquipmentModelId]?.name ?? m.model}（{SCENE_ROLE_LABELS[m.role]}）</option>)}</optgroup>}
                  {availDestTxs.length > 0 && <optgroup label="ワイヤレス TX">{availDestTxs.map(ws => <option key={ws.id} value={`tx:${ws.id}`}>{DB[(ws.txModel ?? "wireless_tx") as EquipmentModelId]?.name ?? ws.txModel}</option>)}</optgroup>}
                </Sel>
                {dstDestMon && dstFreeInPorts.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 9, color: C.textLight, width: 30, flexShrink: 0 }}>入力</span>
                    <Sel value={String(activeDstIn?.idx ?? "")} onChange={v => setDstInIdx(Number(v))}>
                      {dstFreeInPorts.map(p => <option key={p.idx} value={String(p.idx)}>{p.label}</option>)}
                    </Sel>
                  </div>
                )}
                {canDstConn && (
                  <button onClick={() => {
                    if (!parsedDst || !activeDstOut) return;
                    onConnectOut(parsedDst.type, parsedDst.id, activeDstOut.idx, activeDstOut.type, parsedDst.type === "monitor" ? activeDstIn?.idx : undefined);
                    setDstId(""); setDstOutIdx(undefined); setDstInIdx(undefined);
                  }}
                    style={{ marginTop: 2, background: C.accent, border: "none", borderRadius: 5, color: "#FFFFFF", fontSize: 11, fontWeight: 600, padding: "5px 10px", cursor: "pointer", width: "100%", fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif" }}>
                    接続する
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConverterCard({
  conv, cameras, allRxUnits, allMonitors, allConverters, allWirelessSets,
  onChange, onRemove, highlighted, usedHandles,
  onConnectOut, onDisconnectDest,
}: {
  conv: ConverterInstance;
  cameras: CameraInstance[];
  allRxUnits: WirelessRxUnit[];
  allMonitors: MonitorInstance[];
  allConverters: ConverterInstance[];
  allWirelessSets: WirelessSetInstance[];
  onChange: (c: ConverterInstance) => void;
  onRemove: () => void;
  highlighted?: boolean;
  usedHandles: Set<string>;
  onConnectOut: (destType: "monitor" | "tx", destId: string, srcPortIdx: number, cableType: string, destInPortIdx?: number) => void;
  onDisconnectDest: (destType: "monitor" | "tx", destId: string) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onRemove} style={{ position: "absolute", top: 11, right: 8, zIndex: 1, background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "2px 5px" }}>×</button>
      <DeviceCard
        nodeId={conv.id} nodeModel={conv.model} nodeType="converter"
        accentColor="#0ea5e9" typeLabel="CONVERTER"
        cameras={cameras} allRxUnits={allRxUnits} allMonitors={allMonitors}
        allConverters={allConverters} allWirelessSets={allWirelessSets}
        highlighted={highlighted} usedHandles={usedHandles}
        isConnected={!!conv.sourceId}
        modelSelector={
          <Sel value={conv.model} onChange={v => onChange({ ...conv, model: v, targetPortIdx: undefined })}>
            {CONVERTER_MODELS.map(id => <option key={id} value={id}>{DB[id]?.name ?? id}</option>)}
          </Sel>
        }
        sourceId={conv.sourceId} sourcePortIdx={conv.sourcePortIdx}
        targetPortIdx={conv.targetPortIdx} cableType={conv.cableType}
        onClearSource={() => onChange({ ...conv, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined })}
        onConnectSource={(srcId, srcPortIdx, cable, tgtPortIdx) =>
          onChange({ ...conv, sourceId: srcId, sourcePortIdx: srcPortIdx, cableType: cable, targetPortIdx: tgtPortIdx })
        }
        onConnectOut={onConnectOut}
        onDisconnectDest={onDisconnectDest}
      />
    </div>
  );
}

function MultiviewerCard({
  mv, cameras, allRxUnits, allMonitors, allConverters, allWirelessSets,
  onChange, onRemove, highlighted, usedHandles,
  onConnectOut, onDisconnectDest,
}: {
  mv: MultiviewerInstance;
  cameras: CameraInstance[];
  allRxUnits: WirelessRxUnit[];
  allMonitors: MonitorInstance[];
  allConverters: ConverterInstance[];
  allWirelessSets: WirelessSetInstance[];
  onChange: (m: MultiviewerInstance) => void;
  onRemove: () => void;
  highlighted?: boolean;
  usedHandles: Set<string>;
  onConnectOut: (destType: "monitor" | "tx", destId: string, srcPortIdx: number, cableType: string, destInPortIdx?: number) => void;
  onDisconnectDest: (destType: "monitor" | "tx", destId: string) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onRemove} style={{ position: "absolute", top: 11, right: 8, zIndex: 1, background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "2px 5px" }}>×</button>
      <DeviceCard
        nodeId={mv.id} nodeModel={mv.model} nodeType="multiviewer"
        accentColor="#22c55e" typeLabel="MULTIVIEWER"
        cameras={cameras} allRxUnits={allRxUnits} allMonitors={allMonitors}
        allConverters={allConverters} allWirelessSets={allWirelessSets}
        highlighted={highlighted} usedHandles={usedHandles}
        isConnected={!!mv.sourceId}
        modelSelector={
          <Sel value={mv.model} onChange={v => onChange({ ...mv, model: v, targetPortIdx: undefined })}>
            {MULTIVIEWER_MODELS.map(id => <option key={id} value={id}>{DB[id]?.name ?? id}</option>)}
          </Sel>
        }
        sourceId={mv.sourceId} sourcePortIdx={mv.sourcePortIdx}
        targetPortIdx={mv.targetPortIdx} cableType={mv.cableType}
        onClearSource={() => onChange({ ...mv, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined })}
        onConnectSource={(srcId, srcPortIdx, cable, tgtPortIdx) =>
          onChange({ ...mv, sourceId: srcId, sourcePortIdx: srcPortIdx, cableType: cable, targetPortIdx: tgtPortIdx })
        }
        onConnectOut={onConnectOut}
        onDisconnectDest={onDisconnectDest}
      />
    </div>
  );
}

// ── ScenePanel ────────────────────────────────────────────────────────────────

interface Props {
  scene: Scene;
  onChange: (scene: Scene) => void;
  onResetLayout: () => void;
  highlightedEntityId?: string | null;
  edges?: Edge[];
}

const ML: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, color: "#86868b",
  letterSpacing: 0.5, marginBottom: 4, textTransform: "uppercase",
};

export function ScenePanel({ scene, onChange, onResetLayout, highlightedEntityId, edges = [] }: Props) {
  const upd = (partial: Partial<Scene>) => onChange({ ...scene, ...partial });
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  const [addCamOpen,  setAddCamOpen]  = useState(false);
  const [addMonOpen,  setAddMonOpen]  = useState(false);
  const [addWsOpen,   setAddWsOpen]   = useState(false);
  const [addConvOpen, setAddConvOpen] = useState(false);
  const [addMvOpen,   setAddMvOpen]   = useState(false);

  const [newCamModel, setNewCamModel] = useState("fx6");
  const [newMonModel, setNewMonModel] = useState("smallhd_cine7");
  const [newMonRole,  setNewMonRole]  = useState<SceneMonitorRole>("director");
  const [newMonCamId, setNewMonCamId] = useState("");
  const [newWsTx,       setNewWsTx]       = useState("wireless_tx");
  const [newWsRxModels, setNewWsRxModels] = useState<string[]>(["wireless_rx"]);
  const [newWsSourceId, setNewWsSourceId] = useState("");
  const [newConvModel, setNewConvModel] = useState("bm_mini_conv_hdmi_sdi_6g");
  const [newMvModel,   setNewMvModel]   = useState("bm_multiview_4hd");

  // Build used-handle set from all current edges (including WIRELESS and locked)
  const usedHandles = new Set(
    edges.flatMap(e => [e.sourceHandle, e.targetHandle].filter(Boolean) as string[])
  );

  // Scroll highlighted card into view
  useEffect(() => {
    if (!highlightedEntityId || !scrollBodyRef.current) return;
    const card = scrollBodyRef.current.querySelector(
      `[data-entity-id="${highlightedEntityId}"]`
    ) as HTMLElement | null;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedEntityId]);

  // ── Camera handlers ────────────────────────────────────────────────────────
  const openAddCamera = () => { setNewCamModel("fx6"); setAddCamOpen(true); };
  const confirmAddCamera = () => {
    upd({ cameras: [...scene.cameras, { id: `cam${uid()}`, model: newCamModel }] });
    setAddCamOpen(false);
  };
  const removeCamera = (id: string) => upd({
    cameras: scene.cameras.filter(c => c.id !== id),
    monitors: scene.monitors.map(m =>
      m.sourceId === id
        ? { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined }
        : m.cameraId === id ? { ...m, cameraId: undefined }
        : m
    ),
    wirelessSets: scene.wirelessSets.filter(ws => ws.sourceId !== id),
  });

  // Camera output → monitor connection
  const handleSetCameraOutput = (
    camId: string,
    portIdx: number,
    portType: string,
    monId: string | undefined,
    monPortIdx?: number,
  ) => {
    upd({
      monitors: scene.monitors.map(m => {
        // Clear the old monitor on this port (if different from new target)
        if (m.sourceId === camId && m.sourcePortIdx === portIdx && m.id !== monId) {
          return { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined };
        }
        // Set the new connection
        if (monId && m.id === monId) {
          return { ...m, sourceId: camId, sourcePortIdx: portIdx, cableType: portType, targetPortIdx: monPortIdx };
        }
        return m;
      }),
    });
  };

  // ── Monitor handlers ───────────────────────────────────────────────────────
  const openAddMonitor = () => {
    setNewMonModel("smallhd_cine7");
    setNewMonRole("director");
    setNewMonCamId(scene.cameras[0]?.id ?? "");
    setAddMonOpen(true);
  };
  const confirmAddMonitor = () => {
    upd({
      monitors: [...scene.monitors, {
        id: `mon${uid()}`,
        model: newMonModel,
        role: newMonRole,
        cameraId: newMonCamId || undefined,
      }],
    });
    setAddMonOpen(false);
  };
  const removeMonitor = (id: string) => upd({
    monitors: scene.monitors
      .filter(m => m.id !== id)
      .map(m => m.sourceId === id
        ? { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined }
        : m
      ),
  });

  // ── Wireless handlers ──────────────────────────────────────────────────────
  const openAddWireless = () => {
    setNewWsTx("wireless_tx");
    setNewWsRxModels(["wireless_rx"]);
    setNewWsSourceId(scene.cameras[0]?.id ?? "");
    setAddWsOpen(true);
  };
  const confirmAddWireless = () => {
    const wsId = `ws${uid()}`;
    upd({
      wirelessSets: [...scene.wirelessSets, {
        id: wsId,
        txModel: newWsTx,
        rxUnits: newWsRxModels.map((m, i) => ({ id: `${wsId}_rx${i + 1}`, model: m })),
        sourceId: newWsSourceId,
        destinationIds: [],
      }],
    });
    setAddWsOpen(false);
  };

  const handleSetRxMonitor = (
    rxId: string,
    monId: string | undefined,
    cableType: string,
    rxPortIdx?: number,
    monPortIdx?: number,
  ) => {
    upd({
      monitors: scene.monitors.map(m => {
        if (m.sourceId === rxId && m.id !== monId) {
          return { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined };
        }
        if (monId && m.id === monId) {
          return { ...m, sourceId: rxId, cableType, sourcePortIdx: rxPortIdx, targetPortIdx: monPortIdx };
        }
        return m;
      }),
    });
  };

  const handleRemoveRxUnit = (rxId: string) => {
    upd({
      monitors: scene.monitors.map(m =>
        m.sourceId === rxId
          ? { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined }
          : m
      ),
    });
  };

  const removeWirelessSet = (wsId: string) => {
    const ws = scene.wirelessSets.find(w => w.id === wsId);
    if (!ws) return;
    const rxIds = new Set(ws.rxUnits.map(r => r.id));
    upd({
      wirelessSets: scene.wirelessSets.filter(w => w.id !== wsId),
      monitors: scene.monitors.map(m =>
        rxIds.has(m.sourceId ?? "")
          ? { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined }
          : m
      ),
    });
  };

  // ── Converter handlers ─────────────────────────────────────────────────────
  const openAddConverter = () => { setNewConvModel("bm_mini_conv_hdmi_sdi_6g"); setAddConvOpen(true); };
  const confirmAddConverter = () => {
    upd({ converters: [...(scene.converters ?? []), { id: `conv${uid()}`, model: newConvModel }] });
    setAddConvOpen(false);
  };
  const removeConverter = (id: string) => upd({
    converters: (scene.converters ?? []).filter(c => c.id !== id),
    monitors: scene.monitors.map(m =>
      m.sourceId === id ? { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined } : m
    ),
  });

  // ── Multiviewer handlers ───────────────────────────────────────────────────
  const openAddMultiviewer = () => { setNewMvModel("bm_multiview_4hd"); setAddMvOpen(true); };
  const confirmAddMultiviewer = () => {
    upd({ multiviewers: [...(scene.multiviewers ?? []), { id: `mv${uid()}`, model: newMvModel }] });
    setAddMvOpen(false);
  };
  const removeMultiviewer = (id: string) => upd({
    multiviewers: (scene.multiviewers ?? []).filter(m => m.id !== id),
    monitors: scene.monitors.map(m =>
      m.sourceId === id ? { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined } : m
    ),
  });

  // Shared handler: update downstream monitor's sourceId when a converter/multiviewer connects out
  const makeConnectOut = (srcId: string) =>
    (destType: "monitor" | "tx", destId: string, srcPortIdx: number, cableType: string, destInPortIdx?: number) => {
      if (destType === "monitor") {
        upd({ monitors: scene.monitors.map(m =>
          m.id === destId ? { ...m, sourceId: srcId, sourcePortIdx: srcPortIdx, cableType, targetPortIdx: destInPortIdx } : m
        )});
      } else {
        upd({ wirelessSets: scene.wirelessSets.map(ws =>
          ws.id === destId ? { ...ws, sourceId: srcId } : ws
        )});
      }
    };

  const makeDisconnectDest = (_srcId: string) =>
    (destType: "monitor" | "tx", destId: string) => {
      if (destType === "monitor") {
        upd({ monitors: scene.monitors.map(m =>
          m.id === destId ? { ...m, sourceId: undefined, cableType: undefined, sourcePortIdx: undefined, targetPortIdx: undefined } : m
        )});
      } else {
        upd({ wirelessSets: scene.wirelessSets.map(ws =>
          ws.id === destId ? { ...ws, sourceId: "" } : ws
        )});
      }
    };

  return (
    <div style={{
      width: 272,
      flexShrink: 0,
      background: C.bg,
      borderLeft: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "9px 12px 8px",
        borderBottom: `1px solid ${C.border}`,
        background: C.sectionBg,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 2 }}>
          SCENE
        </span>
      </div>

      {/* Scrollable body */}
      <div ref={scrollBodyRef} style={{ flex: 1, overflowY: "auto" }}>

        {/* CAMERAS */}
        <SecHdr label="CAMERAS" count={scene.cameras.length} onAdd={openAddCamera} addLabel="追加" />
        {scene.cameras.length === 0 && (
          <p style={{ color: C.textLight, fontSize: 10, textAlign: "center", padding: "12px 0" }}>
            カメラを追加してください
          </p>
        )}
        {scene.cameras.map(cam => (
          <CameraCard
            key={cam.id}
            cam={cam}
            allMonitors={scene.monitors}
            onChange={c => upd({ cameras: scene.cameras.map(x => x.id === cam.id ? c : x) })}
            onRemove={() => removeCamera(cam.id)}
            onSetOutput={(portIdx, portType, monId, monPortIdx) =>
              handleSetCameraOutput(cam.id, portIdx, portType, monId, monPortIdx)
            }
            highlighted={highlightedEntityId === cam.id}
            usedHandles={usedHandles}
            edges={edges}
          />
        ))}

        {/* MONITORS */}
        <SecHdr label="MONITORS" count={scene.monitors.length} onAdd={openAddMonitor} addLabel="追加" />
        {scene.monitors.length === 0 && (
          <p style={{ color: C.textLight, fontSize: 10, textAlign: "center", padding: "12px 0" }}>
            モニターを追加してください
          </p>
        )}
        {scene.monitors.map(mon => (
          <MonitorCard
            key={mon.id}
            mon={mon}
            cameras={scene.cameras}
            onChange={m => upd({ monitors: scene.monitors.map(x => x.id === mon.id ? m : x) })}
            onRemove={() => removeMonitor(mon.id)}
            highlighted={highlightedEntityId === mon.id}
            connectionInfo={getMonitorConnectionInfo(mon, scene, edges)}
            allRxUnits={scene.wirelessSets.flatMap(ws => ws.rxUnits)}
            allMonitors={scene.monitors}
            allWirelessSets={scene.wirelessSets}
            allConverters={scene.converters ?? []}
            onConnect={(srcId, srcPortIdx, cableType, tgtPortIdx) =>
              upd({
                monitors: scene.monitors.map(m =>
                  m.id === mon.id
                    ? { ...m, sourceId: srcId, sourcePortIdx: srcPortIdx, cableType, targetPortIdx: tgtPortIdx }
                    : m
                ),
              })
            }
            onConnectOut={makeConnectOut(mon.id)}
            onDisconnectDest={makeDisconnectDest(mon.id)}
            usedHandles={usedHandles}
          />
        ))}

        {/* WIRELESS */}
        <SecHdr label="WIRELESS" count={scene.wirelessSets.length} onAdd={openAddWireless} addLabel="追加" />
        {scene.wirelessSets.map(ws => (
          <WirelessCard
            key={ws.id}
            ws={ws}
            cameras={scene.cameras}
            monitors={scene.monitors}
            onChange={w => upd({ wirelessSets: scene.wirelessSets.map(x => x.id === ws.id ? w : x) })}
            onRemove={() => removeWirelessSet(ws.id)}
            onSetRxMonitor={handleSetRxMonitor}
            onRemoveRxUnit={handleRemoveRxUnit}
            highlighted={highlightedEntityId === ws.id}
            usedHandles={usedHandles}
            edges={edges}
          />
        ))}

        {/* CONVERTERS */}
        <SecHdr label="CONVERTERS" count={(scene.converters ?? []).length} onAdd={openAddConverter} addLabel="追加" />
        {(scene.converters ?? []).length === 0 && (
          <p style={{ color: C.textLight, fontSize: 10, textAlign: "center", padding: "12px 0" }}>
            コンバーターを追加してください
          </p>
        )}
        {(scene.converters ?? []).map(conv => (
          <ConverterCard
            key={conv.id}
            conv={conv}
            cameras={scene.cameras}
            allRxUnits={scene.wirelessSets.flatMap(ws => ws.rxUnits)}
            allMonitors={scene.monitors}
            allConverters={scene.converters ?? []}
            allWirelessSets={scene.wirelessSets}
            onChange={c => upd({ converters: (scene.converters ?? []).map(x => x.id === conv.id ? c : x) })}
            onRemove={() => removeConverter(conv.id)}
            highlighted={highlightedEntityId === conv.id}
            onConnectOut={makeConnectOut(conv.id)}
            onDisconnectDest={makeDisconnectDest(conv.id)}
            usedHandles={usedHandles}
          />
        ))}

        {/* MULTIVIEWERS */}
        <SecHdr label="MULTIVIEWERS" count={(scene.multiviewers ?? []).length} onAdd={openAddMultiviewer} addLabel="追加" />
        {(scene.multiviewers ?? []).length === 0 && (
          <p style={{ color: C.textLight, fontSize: 10, textAlign: "center", padding: "12px 0" }}>
            マルチビューワーを追加してください
          </p>
        )}
        {(scene.multiviewers ?? []).map(mv => (
          <MultiviewerCard
            key={mv.id}
            mv={mv}
            cameras={scene.cameras}
            allRxUnits={scene.wirelessSets.flatMap(ws => ws.rxUnits)}
            allMonitors={scene.monitors}
            allConverters={scene.converters ?? []}
            allWirelessSets={scene.wirelessSets}
            onChange={m => upd({ multiviewers: (scene.multiviewers ?? []).map(x => x.id === mv.id ? m : x) })}
            onRemove={() => removeMultiviewer(mv.id)}
            highlighted={highlightedEntityId === mv.id}
            onConnectOut={makeConnectOut(mv.id)}
            onDisconnectDest={makeDisconnectDest(mv.id)}
            usedHandles={usedHandles}
          />
        ))}

        {/* RECORDERS */}
        <SecHdr label="RECORDERS" />
        <p style={{ color: C.textLight, fontSize: 10, textAlign: "center", padding: "12px", lineHeight: 1.7 }}>
          レコーダー対応は今後追加予定
        </p>

        <div style={{ height: 8 }} />
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <ResetBtn onClick={onResetLayout} />
      </div>

      {/* ── Add Camera Modal ──────────────────────────────────────────────── */}
      {addCamOpen && (
        <Modal title="カメラを追加" onClose={() => setAddCamOpen(false)} onConfirm={confirmAddCamera}>
          <div>
            <div style={ML}>機種</div>
            <Sel value={newCamModel} onChange={setNewCamModel}>
              {CAMERA_IDS.map(id => (
                <option key={id} value={id}>{DB[id]?.name ?? id}</option>
              ))}
            </Sel>
          </div>
        </Modal>
      )}

      {/* ── Add Monitor Modal ─────────────────────────────────────────────── */}
      {addMonOpen && (
        <Modal title="モニターを追加" onClose={() => setAddMonOpen(false)} onConfirm={confirmAddMonitor}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={ML}>機種</div>
              <Sel value={newMonModel} onChange={setNewMonModel}>
                {MONITOR_MODELS.map(id => (
                  <option key={id} value={id}>{DB[id]?.name ?? id}</option>
                ))}
              </Sel>
            </div>
            <div>
              <div style={ML}>役割</div>
              <Sel value={newMonRole} onChange={v => setNewMonRole(v as SceneMonitorRole)}>
                {SCENE_ROLES.map(r => (
                  <option key={r} value={r}>{SCENE_ROLE_LABELS[r]}</option>
                ))}
              </Sel>
            </div>
            {scene.cameras.length > 0 && (
              <div>
                <div style={ML}>割当カメラ</div>
                <Sel value={newMonCamId} onChange={setNewMonCamId}>
                  <option value="">未割当</option>
                  {scene.cameras.map(c => (
                    <option key={c.id} value={c.id}>{DB[c.model as CameraModelId]?.name ?? c.model}</option>
                  ))}
                </Sel>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Add Converter Modal ──────────────────────────────────────────── */}
      {addConvOpen && (
        <Modal title="コンバーターを追加" onClose={() => setAddConvOpen(false)} onConfirm={confirmAddConverter}>
          <div>
            <div style={ML}>機種</div>
            <Sel value={newConvModel} onChange={setNewConvModel}>
              {CONVERTER_MODELS.map(id => (
                <option key={id} value={id}>{DB[id]?.name ?? id}</option>
              ))}
            </Sel>
          </div>
        </Modal>
      )}

      {/* ── Add Multiviewer Modal ─────────────────────────────────────────── */}
      {addMvOpen && (
        <Modal title="マルチビューワーを追加" onClose={() => setAddMvOpen(false)} onConfirm={confirmAddMultiviewer}>
          <div>
            <div style={ML}>機種</div>
            <Sel value={newMvModel} onChange={setNewMvModel}>
              {MULTIVIEWER_MODELS.map(id => (
                <option key={id} value={id}>{DB[id]?.name ?? id}</option>
              ))}
            </Sel>
          </div>
        </Modal>
      )}

      {/* ── Add Wireless Modal ────────────────────────────────────────────── */}
      {addWsOpen && (
        <Modal title="ワイヤレスセットを追加" onClose={() => setAddWsOpen(false)} onConfirm={confirmAddWireless}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={ML}>TX機種</div>
              <Sel value={newWsTx} onChange={setNewWsTx}>
                {WIRELESS_TX_IDS.map(id => (
                  <option key={id} value={id}>{DB[id]?.name ?? id}</option>
                ))}
              </Sel>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={ML}>RX機種</div>
                <AddBtn onClick={() => setNewWsRxModels(prev => [...prev, "wireless_rx"])} label="RX追加" />
              </div>
              {newWsRxModels.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 5, marginBottom: 4, alignItems: "center" }}>
                  <Sel value={m} onChange={v => setNewWsRxModels(prev => prev.map((x, j) => j === i ? v : x))}>
                    {WIRELESS_RX_IDS.map(id => (
                      <option key={id} value={id}>{DB[id]?.name ?? id}</option>
                    ))}
                  </Sel>
                  {newWsRxModels.length > 1 && (
                    <XBtn onClick={() => setNewWsRxModels(prev => prev.filter((_, j) => j !== i))} />
                  )}
                </div>
              ))}
            </div>
            {scene.cameras.length > 0 && (
              <div>
                <div style={ML}>送信元カメラ</div>
                <Sel value={newWsSourceId} onChange={setNewWsSourceId}>
                  {scene.cameras.map(c => (
                    <option key={c.id} value={c.id}>{DB[c.model as CameraModelId]?.name ?? c.model}</option>
                  ))}
                </Sel>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ResetBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.pageBg : "transparent",
        border: "none",
        color: hov ? C.text : C.textDim,
        cursor: "pointer",
        fontSize: 10, padding: "10px 12px",
        textAlign: "left", width: "100%",
        display: "flex", alignItems: "center", gap: 6,
        transition: "background 0.2s ease-out, color 0.2s ease-out",
      }}
    >
      <span style={{ fontSize: 12, display: "inline-block" }}>⟳</span>
      自動レイアウトに戻す
    </button>
  );
}
