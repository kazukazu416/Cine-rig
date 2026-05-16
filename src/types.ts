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

export interface SetupInput {
  camera: "FX6";
  monitors: number;
  wireless: boolean;
}
