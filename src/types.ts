export interface Port {
  id: string;
  type: "HDMI" | "SDI";
  direction: "in" | "out";
}

export interface Equipment {
  id: string;
  name: string;
  type: "camera" | "monitor" | "wireless_tx" | "wireless_rx";
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

export type CameraModel = "FX6" | "FX3" | "FX9";

export type CableType = "SDI" | "HDMI" | "BNC" | "その他";
export const CABLE_TYPES: CableType[] = ["SDI", "HDMI", "BNC", "その他"];
export const CABLE_COLORS: Record<string, string> = {
  SDI:   "#3b82f6",
  HDMI:  "#f59e0b",
  BNC:   "#a855f7",
  その他: "#6b7280",
};

export type MonitorModelId =
  | "smallhd_cine7"
  | "atomos_shogun7"
  | "atomos_sumo19"
  | "fsi_dm240w"
  | "smallhd_702b";

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
