export interface Port {
  id: string;
  type: "HDMI" | "SDI";
  direction: "in" | "out";
}

export interface Equipment {
  id: string;
  name: string;
  type: "camera" | "monitor" | "wireless_tx" | "wireless_rx" | "recorder";
  ports: Port[];
}

export interface Connection {
  from: { equipmentId: string; portId: string };
  to: { equipmentId: string; portId: string };
  cableType: string;
}

export interface Setup {
  equipments: Equipment[];
  connections: Connection[];
}

export type CameraModel =
  | "FX6" | "FX3" | "FX9"
  | "BURANO" | "VENICE2" | "A7SIII" | "A7IV"
  | "ALEXA_MINI_LF"
  | "V_RAPTOR"
  | "C70" | "C300_MKIII"
  | "URSA_MINI_PRO_12K";

export type CableType = "SDI" | "HDMI" | "BNC" | "その他";
export const CABLE_TYPES: CableType[] = ["SDI", "HDMI", "BNC", "その他"];
export const CABLE_COLORS: Record<string, string> = {
  SDI:   "#3b82f6",
  HDMI:  "#f59e0b",
  BNC:   "#a855f7",
  その他: "#6b7280",
};

export type MonitorModelId =
  // SmallHD
  | "smallhd_cine7"   | "smallhd_cine5"
  | "smallhd_ultra7"  | "smallhd_ultra5" | "smallhd_ultra10"
  | "smallhd_indie7"  | "smallhd_indie5"
  | "smallhd_702touch"| "smallhd_702b"
  // Atomos
  | "atomos_shogun7"  | "atomos_shogun_ultra"
  | "atomos_ninja_v"  | "atomos_ninja_vplus" | "atomos_ninja_ultra"
  | "atomos_sumo19"
  // Sony
  | "sony_pvm_a170"   | "sony_pvm_a250"
  | "sony_lmd_a170"   | "sony_lmd_a220" | "sony_lmd_a240"
  | "sony_bvm_hx310"
  // FSI
  | "fsi_dm240w";

export type MonitorRole = "focus" | "onboard" | "director" | "client" | "custom";

export const ROLE_LABELS: Record<MonitorRole, string> = {
  focus:    "フォーカス用",
  onboard:  "オンボード用",
  director: "監督用",
  client:   "クライアント用",
  custom:   "その他",
};

export function getRoleLabel(role: MonitorRole, customRole?: string): string {
  if (role === "custom") return customRole?.trim() || "その他";
  return ROLE_LABELS[role];
}

export interface MonitorInput {
  id: string;
  model: MonitorModelId;
  role: MonitorRole;
  customRole?: string;
}

export interface CameraInput {
  id: string;
  model: CameraModel;
  monitors: MonitorInput[];
  wireless: boolean;
}

// Scene-based data model (Phase 1+)
export type SceneMonitorRole = "onboard" | "focus" | "frontline" | "director" | "client" | "other";

export interface CameraInstance {
  id: string;
  model: string;
  label?: string;
}

export interface WirelessSetInstance {
  id: string;
  txModel?: string;
  rxModel?: string;
  sourceId: string;
  destinationIds: string[];
}

export interface MonitorInstance {
  id: string;
  model: string;
  role: SceneMonitorRole;
  cameraId?: string;
  customLabel?: string;
}

export interface RecorderInstance {
  id: string;
  model: string;
  label?: string;
}

export interface Scene {
  cameras: CameraInstance[];
  wirelessSets: WirelessSetInstance[];
  monitors: MonitorInstance[];
  recorders: RecorderInstance[];
}
