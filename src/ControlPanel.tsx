import { type ReactNode } from "react";
import type { CameraInput, CameraModel, MonitorInput, MonitorModelId, MonitorRole } from "./types";
import { ROLE_LABELS } from "./types";
import { DB, MONITOR_MODELS, type CameraModelId } from "./equipmentDB";

const CAMERA_MODELS: CameraModel[] = [
  "FX6", "FX3", "FX9",
  "BURANO", "VENICE2", "A7SIII", "A7IV",
  "ALEXA_MINI_LF", "V_RAPTOR",
  "C70", "C300_MKIII",
  "URSA_MINI_PRO_12K",
];
const ROLES: MonitorRole[] = ["focus", "onboard", "director", "client", "custom"];

// DaVinci Resolve Fusion palette
const C = {
  panelBg:    "#1c1c1c",
  sectionBg:  "#1a1a1a",
  cardBg:     "#242424",
  subCardBg:  "#1e1e1e",
  border:     "#383838",
  borderFaint:"#2c2c2c",
  text:       "#c8c8c8",
  textDim:    "#686868",
  accent:     "#4d8fd1",
  btnBg:      "#2e2e2e",
  btnBorder:  "#444",
  danger:     "#c04040",
  toggleOn:   "#4d8fd1",
  toggleOff:  "#2e2e2e",
} as const;

interface Props {
  inputs: CameraInput[];
  onAdd: () => void;
  onChange: (id: string, field: keyof CameraInput, value: unknown) => void;
  onRemove: (id: string) => void;
  onAddMonitor: (cameraId: string) => void;
  onChangeMonitor: (cameraId: string, monitorId: string, changes: Partial<MonitorInput>) => void;
  onRemoveMonitor: (cameraId: string, monitorId: string) => void;
  onResetLayout: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 24 }}>
      <span style={{ color: C.textDim, fontSize: 10, width: 52, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

function Select({
  value, onChange, style, children,
}: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        flex: 1,
        background: "#252525",
        border: `1px solid ${C.border}`,
        color: C.text,
        padding: "3px 5px",
        borderRadius: 3,
        fontSize: 11,
        cursor: "pointer",
        outline: "none",
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </select>
  );
}

function IconBtn({
  label, onClick, danger, title,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  title?: string;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "transparent",
        border: "none",
        color: hovered ? (danger ? C.danger : C.text) : C.textDim,
        cursor: "pointer",
        fontSize: 14,
        lineHeight: 1,
        padding: "2px 4px",
        borderRadius: 2,
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

function MonitorCard({
  monitor, index, cameraId, onChangeMonitor, onRemoveMonitor,
}: {
  monitor: MonitorInput;
  index: number;
  cameraId: string;
  onChangeMonitor: (changes: Partial<MonitorInput>) => void;
  onRemoveMonitor: () => void;
}) {
  const monSpec = DB[monitor.model]?.spec;
  return (
    <div style={{
      background: C.subCardBg,
      border: `1px solid ${C.borderFaint}`,
      borderRadius: 3,
      padding: "7px 8px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      {/* Monitor header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: C.textDim, fontSize: 10, fontWeight: 700 }}>
          MON {index + 1}
        </span>
        <IconBtn label="×" onClick={onRemoveMonitor} danger title="このモニターを削除" />
      </div>

      {/* Model */}
      <Select
        value={monitor.model}
        onChange={v => onChangeMonitor({ model: v as MonitorModelId })}
      >
        {MONITOR_MODELS.map(m => (
          <option key={m} value={m}>{DB[m].name}</option>
        ))}
      </Select>

      {/* Spec hint */}
      {monSpec && (
        <div style={{ fontSize: 9, color: C.textDim, marginTop: -2 }}>{monSpec}</div>
      )}

      {/* Role */}
      <Select
        value={monitor.role}
        onChange={v => onChangeMonitor({
          role: v as MonitorRole,
          customRole: v !== "custom" ? undefined : monitor.customRole,
        })}
      >
        {ROLES.map(r => (
          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
        ))}
      </Select>

      {/* Custom role text input */}
      {monitor.role === "custom" && (
        <input
          type="text"
          placeholder="役割を入力…"
          value={monitor.customRole ?? ""}
          onChange={e => onChangeMonitor({ customRole: e.target.value })}
          style={{
            background: "#252525",
            border: `1px solid ${C.border}`,
            color: C.text,
            padding: "3px 6px",
            borderRadius: 3,
            fontSize: 11,
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

// React needs to be in scope for useState inside IconBtn
import React from "react";

function CameraCard({
  input, index, onChange, onRemove,
  onAddMonitor, onChangeMonitor, onRemoveMonitor,
}: {
  input: CameraInput;
  index: number;
  onChange: (field: keyof CameraInput, value: unknown) => void;
  onRemove: () => void;
  onAddMonitor: () => void;
  onChangeMonitor: (monId: string, changes: Partial<MonitorInput>) => void;
  onRemoveMonitor: (monId: string) => void;
}) {
  return (
    <div style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      borderRadius: 4,
      overflow: "hidden",
    }}>
      {/* Camera header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px",
        borderBottom: `1px solid ${C.borderFaint}`,
        background: "#202020",
      }}>
        <span style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
          CAM {index + 1}
        </span>
        <IconBtn label="×" onClick={onRemove} danger title="このカメラを削除" />
      </div>

      {/* Camera body */}
      <div style={{ padding: "9px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Model */}
        <Row label="機種">
          <Select
            value={input.model}
            onChange={v => onChange("model", v as CameraModel)}
          >
            {CAMERA_MODELS.map(m => (
                <option key={m} value={m}>
                  {DB[m.toLowerCase() as CameraModelId]?.name ?? m}
                </option>
              ))}
          </Select>
        </Row>

        {/* Wireless toggle */}
        <Row label="Wireless">
          <button
            onClick={() => onChange("wireless", !input.wireless)}
            style={{
              background: input.wireless ? C.toggleOn : C.toggleOff,
              border: `1px solid ${input.wireless ? C.toggleOn : C.btnBorder}`,
              color: input.wireless ? "#fff" : C.textDim,
              borderRadius: 3,
              padding: "3px 12px",
              fontSize: 11, fontWeight: 700,
              cursor: "pointer",
              minWidth: 44,
            }}
          >
            {input.wireless ? "ON" : "OFF"}
          </button>
          {input.wireless && (
            <span style={{ color: C.textDim, fontSize: 10 }}>TX / RX</span>
          )}
        </Row>

        {/* ── Monitors section ────────────────── */}
        <div style={{
          borderTop: `1px solid ${C.borderFaint}`,
          marginTop: 2,
          paddingTop: 8,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 6,
          }}>
            <span style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
              MONITORS
              <span style={{ color: C.accent, marginLeft: 5 }}>{input.monitors.length}</span>
            </span>
            <button
              onClick={onAddMonitor}
              disabled={input.monitors.length >= 5}
              style={{
                background: C.btnBg,
                border: `1px solid ${C.btnBorder}`,
                color: input.monitors.length >= 5 ? C.textDim : C.text,
                borderRadius: 2,
                padding: "2px 7px",
                fontSize: 10,
                cursor: input.monitors.length >= 5 ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 3,
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>＋</span>追加
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {input.monitors.length === 0 && (
              <p style={{ color: C.textDim, fontSize: 10, textAlign: "center", padding: "6px 0" }}>
                モニターなし
              </p>
            )}
            {input.monitors.map((mon, i) => (
              <MonitorCard
                key={mon.id}
                monitor={mon}
                index={i}
                cameraId={input.id}
                onChangeMonitor={changes => onChangeMonitor(mon.id, changes)}
                onRemoveMonitor={() => onRemoveMonitor(mon.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ControlPanel({
  inputs, onAdd, onChange, onRemove,
  onAddMonitor, onChangeMonitor, onRemoveMonitor,
  onResetLayout,
}: Props) {
  const totalMonitors = inputs.reduce((s, i) => s + i.monitors.length, 0);
  const totalWireless = inputs.filter(i => i.wireless).length;

  return (
    <div style={{
      width: 268,
      flexShrink: 0,
      background: C.panelBg,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "9px 12px 8px",
        borderBottom: `1px solid ${C.borderFaint}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
        background: C.sectionBg,
      }}>
        <span style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>
          CAMERAS
        </span>
        <button
          onClick={onAdd}
          style={{
            background: C.btnBg,
            border: `1px solid ${C.btnBorder}`,
            color: C.text,
            borderRadius: 3,
            padding: "3px 8px",
            fontSize: 11,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 3,
          }}
        >
          <span style={{ fontSize: 13, lineHeight: 1 }}>＋</span>
          カメラ追加
        </button>
      </div>

      {/* Camera list */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "10px 9px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        {inputs.length === 0 && (
          <p style={{ color: C.textDim, fontSize: 11, textAlign: "center", marginTop: 24, lineHeight: 1.8 }}>
            「＋ カメラ追加」で<br />カメラを追加してください
          </p>
        )}
        {inputs.map((input, i) => (
          <CameraCard
            key={input.id}
            input={input}
            index={i}
            onChange={(field, value) => onChange(input.id, field, value)}
            onRemove={() => onRemove(input.id)}
            onAddMonitor={() => onAddMonitor(input.id)}
            onChangeMonitor={(monId, changes) => onChangeMonitor(input.id, monId, changes)}
            onRemoveMonitor={monId => onRemoveMonitor(input.id, monId)}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${C.borderFaint}`,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}>
        {inputs.length > 0 && (
          <div style={{ padding: "6px 12px 4px", color: C.textDim, fontSize: 10, letterSpacing: 0.3 }}>
            {inputs.length} cam · {totalMonitors} monitors · {totalWireless} wireless
          </div>
        )}
        <button
          onClick={onResetLayout}
          title="ノード位置を自動レイアウトに戻す"
          style={{
            background: "transparent",
            border: "none",
            borderTop: `1px solid ${C.borderFaint}`,
            color: C.textDim,
            cursor: "pointer",
            fontSize: 10,
            padding: "8px 12px",
            textAlign: "left",
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.textDim)}
        >
          <span style={{ fontSize: 13 }}>⟳</span>
          自動レイアウトに戻す
        </button>
      </div>
    </div>
  );
}
