import React, { useState } from "react";
import { DB, MONITOR_MODELS, type CameraModelId, type EquipmentModelId } from "./equipmentDB";

const C = {
  bg:        "#FFFFFF",
  pageBg:    "#FAFAFA",
  border:    "rgba(0,0,0,0.08)",
  text:      "#1d1d1f",
  textDim:   "#6e6e73",
  textLight: "#86868b",
  sectionBg: "#F5F5F7",
  hoverBg:   "#F0F0F2",
  accent:    "#005BA6",
} as const;

const CAMERA_IDS: CameraModelId[] = [
  "fx6", "fx3", "fx9",
  "burano", "venice2", "a7siii", "a7iv",
  "alexa_mini_lf", "v_raptor",
  "c70", "c300_mkiii", "ursa_mini_pro_12k",
];

const WIRELESS_IDS: EquipmentModelId[] = [
  "wireless_tx", "wireless_rx",
  "teradek_bolt6_lt750_tx",  "teradek_bolt6_lt750_rx",
  "teradek_bolt6_lt1500_tx", "teradek_bolt6_lt1500_rx",
  "teradek_bolt6_xt1500_tx", "teradek_bolt6_xt1500_rx",
  "teradek_bolt6_xt3000_tx", "teradek_bolt6_xt3000_rx",
  "teradek_bolt500xt_tx",    "teradek_bolt500xt_rx",
  "hollyland_pyroh_tx",      "hollyland_pyroh_rx",
  "accsoon_cineview_se_tx",  "accsoon_cineview_se_rx",
];

const RECORDER_IDS: EquipmentModelId[] = [
  "atomos_shogun_connect", "bm_video_assist_7_12g",
];

// Category accent colors match TYPE_COLOR in EquipmentNode
const SECTION_META = [
  { label: "カメラ",     ids: CAMERA_IDS as EquipmentModelId[],              dot: "#30d158" },
  { label: "モニター",   ids: MONITOR_MODELS as EquipmentModelId[],           dot: "#8e8e93" },
  { label: "ワイヤレス", ids: WIRELESS_IDS,                                   dot: "#ff9f0a" },
  { label: "レコーダー", ids: RECORDER_IDS,                                   dot: "#bf5af2" },
];

function LibraryItem({ modelId }: { modelId: EquipmentModelId }) {
  const [hovered, setHovered] = useState(false);
  const tmpl = DB[modelId];
  if (!tmpl) return null;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "5px 10px",
        borderRadius: 5,
        background: hovered ? C.hoverBg : "transparent",
        cursor: "default",
        transition: "background 0.2s ease-out",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 500, color: C.text, lineHeight: 1.3 }}>
        {tmpl.name}
      </div>
      {tmpl.spec && (
        <div style={{ fontSize: 9, color: C.textLight, marginTop: 1, lineHeight: 1.4 }}>
          {tmpl.spec}
        </div>
      )}
    </div>
  );
}

function SectionToggle({ label, dot, count, isOpen, onToggle }: {
  label: string; dot: string; count: number; isOpen: boolean; onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        background: hovered ? C.hoverBg : C.sectionBg,
        border: "none",
        borderBottom: `1px solid ${C.border}`,
        padding: "6px 10px",
        display: "flex",
        alignItems: "center",
        gap: 7,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.2s ease-out",
      }}
    >
      {/* Category dot */}
      <div style={{
        width: 6, height: 6,
        borderRadius: "50%",
        background: dot,
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.5, flex: 1 }}>
        {label.toUpperCase()}
        <span style={{ color: C.textLight, fontWeight: 400, marginLeft: 5 }}>
          {count}
        </span>
      </span>
      <span style={{ fontSize: 9, color: C.textLight, transition: "transform 0.2s ease-out", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none" }}>
        ▸
      </span>
    </button>
  );
}

export function EquipmentLibrary() {
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["カメラ"]));
  const [searchFocused, setSearchFocused] = useState(false);

  const toggleSection = (label: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const q = query.toLowerCase().trim();

  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      background: C.bg,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px 9px",
        borderBottom: `1px solid ${C.border}`,
        background: C.sectionBg,
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: C.textDim,
          letterSpacing: 1.5, marginBottom: 7,
        }}>
          LIBRARY
        </div>
        <input
          type="text"
          placeholder="機材を検索..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: "100%",
            background: "#FFFFFF",
            border: `1px solid ${searchFocused ? C.accent : C.border}`,
            borderRadius: 6,
            padding: "5px 8px",
            fontSize: 11,
            color: C.text,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s ease-out",
          }}
        />
      </div>

      {/* Sections */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {SECTION_META.map(({ label, ids, dot }) => {
          const filtered = q
            ? ids.filter(id => {
                const tmpl = DB[id];
                return tmpl && (
                  tmpl.name.toLowerCase().includes(q) ||
                  (tmpl.spec ?? "").toLowerCase().includes(q)
                );
              })
            : ids;

          if (q && filtered.length === 0) return null;
          const isOpen = openSections.has(label) || q.length > 0;

          return (
            <div key={label}>
              <SectionToggle
                label={label}
                dot={dot}
                count={filtered.length}
                isOpen={isOpen}
                onToggle={() => toggleSection(label)}
              />
              {isOpen && (
                <div style={{ padding: "4px 2px", background: C.bg }}>
                  {filtered.map(id => <LibraryItem key={id} modelId={id} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
