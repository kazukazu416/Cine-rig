import React, { useState } from "react";
import { BATTERY_DB, BATTERY_GROUPS } from "./batteryDB";

const font = "-apple-system, 'SF Pro Display', Inter, sans-serif";

export interface BatteryBreakdownItem {
  label: string;
  watts: number | null;
}

export interface BatterySelection {
  batteryId: string;
  count: number;
}

export const DEFAULT_BATTERY: BatterySelection = { batteryId: "idx_duo_c198p", count: 1 };

function runtimeColor(hours: number): string {
  if (hours < 2) return "#E24B4A";
  if (hours < 4) return "#EF9F27";
  return "#639922";
}

export function calcRuntime(batteryId: string, count: number, totalWatts: number): number {
  const b = BATTERY_DB[batteryId];
  if (!b || totalWatts <= 0) return 0;
  return (b.capacity * count * 0.8) / totalWatts;
}

interface Props {
  breakdown: BatteryBreakdownItem[];
  batteryId: string;
  count: number;
  onChange: (batteryId: string, count: number) => void;
}

export function BatterySection({ breakdown, batteryId, count, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const hasUnknown = breakdown.some(b => b.watts === null || b.watts === undefined);
  const totalWatts = hasUnknown
    ? null
    : breakdown.reduce((s, b) => s + (b.watts ?? 0), 0);

  const battery = BATTERY_DB[batteryId];
  const hours = battery && totalWatts !== null && totalWatts > 0
    ? calcRuntime(batteryId, count, totalWatts)
    : null;
  const hoursColor = hours !== null ? runtimeColor(hours) : "#86868b";

  return (
    <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", marginTop: 2 }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "5px 0",
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: font,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6e6e73", letterSpacing: 0.5 }}>
          🔋 バッテリー
        </span>
        <span style={{ fontSize: 9, color: "#86868b" }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Collapsible body – max-height transition for 200ms ease-out */}
      <div style={{
        overflow: "hidden",
        maxHeight: open ? "260px" : "0",
        transition: "max-height 200ms ease-out",
      }}>
        <div style={{ paddingBottom: 8, display: "flex", flexDirection: "column", gap: 5 }}>

          {/* Total watts */}
          <div style={{ fontSize: 11, fontWeight: 600, color: "#1d1d1f" }}>
            {totalWatts !== null ? `合計消費電力: ${totalWatts}W` : "合計消費電力: 不明"}
          </div>

          {/* Breakdown */}
          {breakdown.length > 0 && (
            <div style={{ fontSize: 10, color: "#6e6e73" }}>
              ({breakdown.map((b, i) => (
                <span key={i}>
                  {b.label}: {b.watts !== null ? `${b.watts}W` : "?W"}
                  {i < breakdown.length - 1 ? " + " : ""}
                </span>
              ))})
            </div>
          )}

          {/* Battery selector + count */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <select
              value={batteryId}
              onChange={e => onChange(e.target.value, count)}
              style={{
                flex: 1, background: "#FAFAFA", border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 5, padding: "3px 5px", fontSize: 11, color: "#1d1d1f",
                outline: "none", cursor: "pointer", fontFamily: font,
              }}
            >
              {BATTERY_GROUPS.map(g => (
                <optgroup key={g.manufacturer} label={g.manufacturer}>
                  {g.ids.map(id => {
                    const b = BATTERY_DB[id];
                    return (
                      <option key={id} value={id}>
                        {b.model} ({b.capacity}Wh{b.dtap ? " D-Tap" : ""})
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
            <span style={{ fontSize: 10, color: "#86868b", flexShrink: 0 }}>×</span>
            <input
              type="number" min={1} max={10} value={count}
              onChange={e => onChange(batteryId, Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              style={{
                width: 30, background: "#FAFAFA", border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 5, padding: "3px 4px", fontSize: 11, textAlign: "center",
                outline: "none", fontFamily: font,
              }}
            />
            <span style={{ fontSize: 10, color: "#86868b", flexShrink: 0 }}>本</span>
          </div>

          {/* Runtime */}
          {hours !== null ? (
            <div style={{ fontSize: 11, fontWeight: 600, color: hoursColor }}>
              稼働時間: 約 {hours.toFixed(1)} 時間
            </div>
          ) : totalWatts === null ? (
            <div style={{ fontSize: 10, color: "#86868b" }}>
              ※ 消費電力不明の機材があるため計算できません
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
