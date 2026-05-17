import type { Equipment, Port, MonitorModelId } from "./types";

export type EquipmentModelId =
  | "fx6" | "fx3" | "fx9"
  | "wireless_tx" | "wireless_rx"
  | MonitorModelId;

export interface EquipmentTemplate {
  name: string;
  type: Equipment["type"];
  spec?: string;                       // display hint for UI (size, port summary)
  ports: Array<Omit<Port, "id">>;
}

export const DB: Record<EquipmentModelId, EquipmentTemplate> = {
  // ── Cameras ──────────────────────────────────────────────────────────────
  fx6: {
    name: "Sony FX6",
    type: "camera",
    spec: "Full-frame / SDI + HDMI out",
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },
  fx3: {
    name: "Sony FX3",
    type: "camera",
    spec: "Full-frame / HDMI out only",
    ports: [
      { type: "HDMI", direction: "out" }, // FX3 has no SDI
    ],
  },
  fx9: {
    name: "Sony FX9",
    type: "camera",
    spec: "Full-frame / 2×SDI + HDMI out",
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" }, // dual SDI (RAW + SDI)
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Wireless ──────────────────────────────────────────────────────────────
  wireless_tx: {
    name: "Wireless TX",
    type: "wireless_tx",
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" }, // accepts either (Teradek/Hollyland)
    ],
  },
  wireless_rx: {
    name: "Wireless RX",
    type: "wireless_rx",
    ports: [
      { type: "SDI", direction: "out" },
    ],
  },

  // ── Monitors ─────────────────────────────────────────────────────────────
  smallhd_cine7: {
    name: "SmallHD Cine 7",
    type: "monitor",
    spec: '7" 1920×1200 / SDI+HDMI in · SDI loop out',
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" }, // 3G-SDI loop-through
    ],
  },
  atomos_shogun7: {
    name: "Atomos Shogun 7",
    type: "monitor",
    spec: '7" HDR / 12G-SDI+HDMI in·out · recorder',
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" }, // 12G-SDI clean feed / loop
      { type: "HDMI", direction: "out" },
    ],
  },
  atomos_sumo19: {
    name: "Atomos Sumo 19",
    type: "monitor",
    spec: '19" HDR / 4×SDI+HDMI in · SDI+HDMI out',
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" }, // SDI loop-through
      { type: "HDMI", direction: "out" },
    ],
  },
  fsi_dm240w: {
    name: "FSI DM240W",
    type: "monitor",
    spec: '24" reference / SDI+HDMI in · SDI loop out',
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" }, // SDI loop-through
    ],
  },
  smallhd_702b: {
    name: "SmallHD 702 Bright",
    type: "monitor",
    spec: '7" 1000 nit / SDI+HDMI in · HDMI out',
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "HDMI", direction: "out" }, // HDMI clean feed
    ],
  },
};

export const MONITOR_MODELS: MonitorModelId[] = [
  "smallhd_cine7",
  "atomos_shogun7",
  "atomos_sumo19",
  "fsi_dm240w",
  "smallhd_702b",
];

export function instantiate(modelId: EquipmentModelId, uid: string): Equipment {
  const tmpl = DB[modelId];
  return {
    id: `${uid}_${modelId}`,
    name: tmpl.name,
    type: tmpl.type,
    ports: tmpl.ports.map((p, i) => ({ id: `${uid}_${modelId}_p${i}`, ...p })),
  };
}

export function instantiateMonitor(n: number, uid: string, modelId: MonitorModelId): Equipment {
  const tmpl = DB[modelId];
  return {
    id: `${uid}_monitor_${n}`,
    name: tmpl.name,
    type: "monitor",
    ports: tmpl.ports.map((p, i) => ({ id: `${uid}_monitor_${n}_p${i}`, ...p })),
  };
}
