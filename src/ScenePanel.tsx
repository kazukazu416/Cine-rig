import React, { useState } from "react";
import type {
  Scene, CameraInstance, WirelessSetInstance, MonitorInstance, SceneMonitorRole,
} from "./types";
import { SCENE_ROLE_LABELS } from "./types";
import {
  DB, MONITOR_MODELS,
  type CameraModelId, type EquipmentModelId, type WirelessModelId,
} from "./equipmentDB";

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

// Card with top accent bar (matches EquipmentNode style)
function Card({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <div style={{
      margin: "5px 8px",
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      overflow: "hidden",
    }}>
      {/* Top accent bar — 3px, matches node style */}
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

// ── Camera card ───────────────────────────────────────────────────────────────

function CameraCard({ cam, onChange, onRemove }: {
  cam: CameraInstance;
  onChange: (c: CameraInstance) => void;
  onRemove: () => void;
}) {
  return (
    <Card accentColor="#30d158">
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
      <div style={{ padding: "7px 10px" }}>
        <Sel value={cam.model} onChange={v => onChange({ ...cam, model: v })}>
          {CAMERA_IDS.map(id => (
            <option key={id} value={id}>{DB[id]?.name ?? id}</option>
          ))}
        </Sel>
      </div>
    </Card>
  );
}

// ── Monitor card ──────────────────────────────────────────────────────────────

function MonitorCard({ mon, cameras, onChange, onRemove }: {
  mon: MonitorInstance;
  cameras: CameraInstance[];
  onChange: (m: MonitorInstance) => void;
  onRemove: () => void;
}) {
  const dot = ROLE_DOT[mon.role] ?? C.textLight;
  return (
    <Card accentColor={dot}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 8px 5px 10px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: dot, flex: 1, letterSpacing: 0.3 }}>
          {SCENE_ROLE_LABELS[mon.role]}
        </span>
        <XBtn onClick={onRemove} />
      </div>
      <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        <Sel value={mon.model} onChange={v => onChange({ ...mon, model: v })}>
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
      </div>
    </Card>
  );
}

// ── Wireless set card ─────────────────────────────────────────────────────────

function WirelessCard({ ws, cameras, monitors, onChange, onRemove }: {
  ws: WirelessSetInstance;
  cameras: CameraInstance[];
  monitors: MonitorInstance[];
  onChange: (w: WirelessSetInstance) => void;
  onRemove: () => void;
}) {
  return (
    <Card accentColor="#ff9f0a">
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
        {/* TX / RX */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
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
          <div>
            <FieldLabel>RX</FieldLabel>
            <Sel
              value={ws.rxModel ?? "wireless_rx"}
              onChange={v => onChange({ ...ws, rxModel: v as WirelessModelId })}
            >
              {WIRELESS_RX_IDS.map(id => (
                <option key={id} value={id}>{DB[id]?.name ?? id}</option>
              ))}
            </Sel>
          </div>
        </div>

        {/* Source camera */}
        <div>
          <FieldLabel>送信元カメラ</FieldLabel>
          <Sel value={ws.sourceId} onChange={v => onChange({ ...ws, sourceId: v })}>
            {cameras.map(c => (
              <option key={c.id} value={c.id}>
                {DB[c.model as CameraModelId]?.name ?? c.model}
              </option>
            ))}
          </Sel>
        </div>

        {/* Destination monitors */}
        {monitors.length > 0 && (
          <div>
            <FieldLabel>接続先モニター</FieldLabel>
            <div style={{
              background: C.pageBg,
              border: `1px solid ${C.border}`,
              borderRadius: 5,
              overflow: "hidden",
            }}>
              {monitors.map((mon, i) => {
                const checked = ws.destinationIds.includes(mon.id);
                const dot = ROLE_DOT[mon.role] ?? C.textLight;
                return (
                  <label key={mon.id} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "5px 8px",
                    cursor: "pointer",
                    borderBottom: i < monitors.length - 1 ? `1px solid ${C.borderFaint}` : "none",
                    background: checked ? "#EFF5FF" : "transparent",
                    transition: "background 0.15s ease-out",
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...ws.destinationIds, mon.id]
                          : ws.destinationIds.filter(id => id !== mon.id);
                        onChange({ ...ws, destinationIds: next });
                      }}
                      style={{ accentColor: C.accent, cursor: "pointer", flexShrink: 0 }}
                    />
                    {/* Role dot */}
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: C.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {DB[mon.model as EquipmentModelId]?.name ?? mon.model}
                    </span>
                    <span style={{ fontSize: 9, color: C.textLight, flexShrink: 0 }}>
                      {SCENE_ROLE_LABELS[mon.role]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── ScenePanel ────────────────────────────────────────────────────────────────

interface Props {
  scene: Scene;
  onChange: (scene: Scene) => void;
  onResetLayout: () => void;
}

export function ScenePanel({ scene, onChange, onResetLayout }: Props) {
  const upd = (partial: Partial<Scene>) => onChange({ ...scene, ...partial });

  const addCamera = () => upd({
    cameras: [...scene.cameras, { id: `cam${uid()}`, model: "fx6" }],
  });
  const removeCamera = (id: string) => upd({
    cameras: scene.cameras.filter(c => c.id !== id),
    monitors: scene.monitors.filter(m => m.cameraId !== id),
    wirelessSets: scene.wirelessSets.filter(ws => ws.sourceId !== id),
  });

  const addMonitor = () => upd({
    monitors: [...scene.monitors, {
      id: `mon${uid()}`,
      model: "smallhd_cine7",
      role: "director",
      cameraId: scene.cameras[0]?.id,
    }],
  });
  const removeMonitor = (id: string) => upd({
    monitors: scene.monitors.filter(m => m.id !== id),
    wirelessSets: scene.wirelessSets.map(ws => ({
      ...ws, destinationIds: ws.destinationIds.filter(d => d !== id),
    })),
  });

  const addWireless = () => upd({
    wirelessSets: [...scene.wirelessSets, {
      id: `ws${uid()}`,
      txModel: "wireless_tx",
      rxModel: "wireless_rx",
      sourceId: scene.cameras[0]?.id ?? "",
      destinationIds: [],
    }],
  });

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
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* CAMERAS */}
        <SecHdr label="CAMERAS" count={scene.cameras.length} onAdd={addCamera} addLabel="追加" />
        {scene.cameras.length === 0 && (
          <p style={{ color: C.textLight, fontSize: 10, textAlign: "center", padding: "12px 0" }}>
            カメラを追加してください
          </p>
        )}
        {scene.cameras.map(cam => (
          <CameraCard
            key={cam.id}
            cam={cam}
            onChange={c => upd({ cameras: scene.cameras.map(x => x.id === cam.id ? c : x) })}
            onRemove={() => removeCamera(cam.id)}
          />
        ))}

        {/* MONITORS */}
        <SecHdr label="MONITORS" count={scene.monitors.length} onAdd={addMonitor} addLabel="追加" />
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
          />
        ))}

        {/* WIRELESS */}
        <SecHdr label="WIRELESS" count={scene.wirelessSets.length} onAdd={addWireless} addLabel="追加" />
        {scene.wirelessSets.map(ws => (
          <WirelessCard
            key={ws.id}
            ws={ws}
            cameras={scene.cameras}
            monitors={scene.monitors}
            onChange={w => upd({ wirelessSets: scene.wirelessSets.map(x => x.id === ws.id ? w : x) })}
            onRemove={() => upd({ wirelessSets: scene.wirelessSets.filter(x => x.id !== ws.id) })}
          />
        ))}

        {/* RECORDERS */}
        <SecHdr label="RECORDERS" />
        <p style={{ color: C.textLight, fontSize: 10, textAlign: "center", padding: "12px", lineHeight: 1.7 }}>
          レコーダー対応は今後追加予定
        </p>

        {/* Bottom spacer */}
        <div style={{ height: 8 }} />
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <ResetBtn onClick={onResetLayout} />
      </div>
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
