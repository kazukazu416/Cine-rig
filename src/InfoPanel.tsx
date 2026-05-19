import React, { useState, useMemo } from "react";
import type { Edge, Node } from "@xyflow/react";
import type { Scene } from "./types";
import { SCENE_ROLE_LABELS, CABLE_COLORS } from "./types";
import { DB, outputPortOptions, inputPortOptions } from "./equipmentDB";
import type { EquipmentModelId } from "./equipmentDB";

interface Props {
  edges: Edge[];
  scene: Scene;
  nodes?: Node[];
}

type Tab = "cable" | "monitor" | "check";

const font = "-apple-system, 'SF Pro Display', Inter, sans-serif";

// Gather all rx units from scene
function getRxUnits(scene: Scene) {
  return scene.wirelessSets.flatMap(ws => ws.rxUnits.map(rx => ({ rx, ws })));
}

function validate(scene: Scene, edges: Edge[]) {
  const errors: { key: string; msg: string }[] = [];
  const warnings: { key: string; msg: string }[] = [];

  // ── Cameras: warn if no output port is connected ──────────────────────────
  for (const cam of scene.cameras) {
    const camName = DB[cam.model as EquipmentModelId]?.name ?? cam.model;
    const nodeId = `${cam.id}_${cam.model}`;
    const outPorts = outputPortOptions(cam.model as EquipmentModelId);
    const hasOut = outPorts.some(p =>
      edges.some(e => e.sourceHandle === `${nodeId}_p${p.idx}`)
    );
    if (!hasOut) {
      warnings.push({ key: cam.id, msg: `${camName}: 出力が未接続` });
    }
  }

  // ── Monitors: error if no non-WIRELESS input edge and no scene connection ──
  for (const mon of scene.monitors) {
    const monPrefix = `${mon.id}_${mon.model}_p`;
    const hasEdge = edges.some(
      e => e.targetHandle?.startsWith(monPrefix) && e.data?.cableType !== "WIRELESS"
    );
    if (!mon.sourceId && !hasEdge) {
      const name = DB[mon.model as EquipmentModelId]?.name ?? mon.model;
      errors.push({
        key: mon.id,
        msg: `${name}（${SCENE_ROLE_LABELS[mon.role]}）が未接続です`,
      });
    }
  }

  // ── Wireless TX: warn if no non-WIRELESS input edge ───────────────────────
  for (const ws of scene.wirelessSets) {
    const txModel  = (ws.txModel ?? "wireless_tx") as EquipmentModelId;
    const txNodeId = `${ws.id}_tx_${ws.txModel ?? "wireless_tx"}`;
    const txName   = DB[txModel]?.name ?? String(txModel);
    const txInPorts = inputPortOptions(txModel);
    const hasEdgeIn = txInPorts.some(p =>
      edges.some(e => e.targetHandle === `${txNodeId}_p${p.idx}`)
    );
    if (!hasEdgeIn) {
      warnings.push({ key: `${ws.id}_tx`, msg: `${txName}: 入力未接続 (SDI/HDMI IN)` });
    }
  }

  // ── Wireless RX: RF IN must have WIRELESS edge; at least one output needed ─
  for (const { rx, ws } of getRxUnits(scene)) {
    const rxNodeId = `${rx.id}_${rx.model}`;
    const rxName = DB[rx.model as EquipmentModelId]?.name ?? rx.model;
    const wsIdx = scene.wirelessSets.indexOf(ws);
    const label = scene.wirelessSets.length > 1 ? `WS${wsIdx + 1} ` : "";
    const hasRfIn = edges.some(
      e => e.target === rxNodeId && (e.data?.cableType as string) === "WIRELESS"
    );
    const rxOutPorts = outputPortOptions(rx.model as EquipmentModelId);
    const hasOutput =
      scene.monitors.some(m => m.sourceId === rx.id) ||
      rxOutPorts.some(p => edges.some(e => e.sourceHandle === `${rxNodeId}_p${p.idx}`));
    if (!hasRfIn) {
      warnings.push({ key: `${rx.id}_rfin`, msg: `${label}${rxName}: RF IN 未接続` });
    }
    if (!hasOutput) {
      warnings.push({ key: rx.id, msg: `${label}${rxName}: 出力未接続` });
    }
  }

  console.log("[CineRig validate]", {
    edges: edges.map(e => ({ id: e.id, src: e.sourceHandle, tgt: e.targetHandle, type: e.data?.cableType })),
    errors,
    warnings,
  });

  return { errors, warnings };
}

export function InfoPanel({ edges, scene, nodes }: Props) {
  const [tab, setTab] = useState<Tab>("cable");

  const cableEntries = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const edge of edges) {
      const ct = edge.data?.cableType as string | undefined;
      if (!ct || ct === "WIRELESS") continue;
      counts[ct] = (counts[ct] ?? 0) + 1;
    }
    return Object.entries(counts).filter(([, n]) => n > 0);
  }, [edges]);

  const totalCables = cableEntries.reduce((sum, [, n]) => sum + n, 0);

  // Re-validates on every change to edges, scene, or nodes
  const { errors, warnings } = useMemo(
    () => validate(scene, edges),
    [scene, edges, nodes],  // eslint-disable-line react-hooks/exhaustive-deps
  );
  const issueCount = errors.length + warnings.length;

  const TABS: { id: Tab; label: string }[] = [
    { id: "cable",   label: `ケーブル${totalCables > 0 ? ` (${totalCables})` : ""}` },
    { id: "monitor", label: `モニター (${scene.monitors.length})` },
    { id: "check",   label: issueCount > 0 ? `チェック ⚠${issueCount}` : "チェック ✓" },
  ];

  return (
    <div style={{
      height: 180,
      flexShrink: 0,
      background: "#FFFFFF",
      borderTop: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      fontFamily: font,
      zIndex: 10,
    }}>
      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "0 16px",
        flexShrink: 0,
      }}>
        {TABS.map(t => {
          const isActive = tab === t.id;
          const isCheck = t.id === "check";
          const checkColor = errors.length > 0 ? "#d72b3f" : warnings.length > 0 ? "#f59e0b" : "#30d158";
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: isActive
                  ? `2px solid ${isCheck ? checkColor : "#005BA6"}`
                  : "2px solid transparent",
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: isActive
                  ? (isCheck ? checkColor : "#005BA6")
                  : "#86868b",
                cursor: "pointer",
                marginBottom: -1,
                fontFamily: font,
                transition: "color 0.15s ease-out",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: "0 20px",
        overflowX: "auto",
        overflowY: tab === "check" ? "auto" : "hidden",
        display: "flex",
        alignItems: tab === "check" ? "flex-start" : "center",
        gap: 14,
        paddingTop: tab === "check" ? 10 : 0,
        paddingBottom: tab === "check" ? 10 : 0,
      }}>
        {tab === "cable" && (
          cableEntries.length === 0 ? (
            <span style={{ fontSize: 13, color: "#86868b" }}>
              ケーブルなし
            </span>
          ) : (
            cableEntries.map(([type, count]) => (
              <div key={type} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: "#F5F5F7",
                borderRadius: 8,
                flexShrink: 0,
              }}>
                <div style={{
                  width: 24, height: 4,
                  background: CABLE_COLORS[type] ?? "#888",
                  borderRadius: 2,
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>
                  {type}
                </span>
                <span style={{ fontSize: 13, color: "#86868b" }}>
                  × {count}
                </span>
              </div>
            ))
          )
        )}

        {tab === "monitor" && (
          scene.monitors.length === 0 ? (
            <span style={{ fontSize: 13, color: "#86868b" }}>モニターなし</span>
          ) : (
            scene.monitors.map(mon => {
              const displayName = DB[mon.model as EquipmentModelId]?.name ?? mon.model;
              const roleLabel = SCENE_ROLE_LABELS[mon.role] ?? mon.role;
              // Same check as validate(): scene-based OR non-WIRELESS edge
              const monPrefix = `${mon.id}_${mon.model}_p`;
              const connEdge = edges.find(
                e => e.targetHandle?.startsWith(monPrefix) && e.data?.cableType !== "WIRELESS"
              );
              const isConnected = !!mon.sourceId || !!connEdge;
              const cableLabel = mon.cableType
                ?? (connEdge?.data?.cableType as string | undefined)
                ?? "—";
              return (
                <div key={mon.id} style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  minWidth: 130,
                  padding: "8px 14px",
                  background: "#F5F5F7",
                  borderRadius: 8,
                  flexShrink: 0,
                  borderLeft: `3px solid ${isConnected ? "#30d158" : "#ff3b30"}`,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", whiteSpace: "nowrap" }}>
                    {displayName}
                  </span>
                  <span style={{
                    fontSize: 11, color: "#86868b", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: 0.6,
                  }}>
                    {roleLabel}
                  </span>
                  <span style={{ fontSize: 11, color: isConnected ? "#30d158" : "#ff3b30" }}>
                    {isConnected ? cableLabel : "未接続"}
                  </span>
                </div>
              );
            })
          )
        )}

        {tab === "check" && (
          errors.length === 0 && warnings.length === 0 ? (
            <div style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#30d158",
              fontSize: 14,
              fontWeight: 600,
            }}>
              ✅ 接続チェックOK
            </div>
          ) : (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              {errors.map(e => (
                <div key={e.key} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 13, color: "#d72b3f",
                  background: "#FFF2F3",
                  borderRadius: 6,
                  padding: "6px 12px",
                  flexShrink: 0,
                }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>●</span>
                  {e.msg}
                </div>
              ))}
              {warnings.map(w => (
                <div key={w.key} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 13, color: "#92400e",
                  background: "#FFFBEB",
                  borderRadius: 6,
                  padding: "6px 12px",
                  flexShrink: 0,
                }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>▲</span>
                  {w.msg}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
