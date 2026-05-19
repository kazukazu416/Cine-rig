import { generateFromScene } from "./generateSetup";
import type { Scene } from "./types";

const scene: Scene = {
  cameras: [{ id: "cam1", model: "fx6", label: "Main Camera" }],
  wirelessSets: [{
    id: "ws1",
    txModel: "wireless_tx",
    rxUnits: [{ id: "ws1_rx1", model: "wireless_rx" }],
    sourceId: "cam1",
    destinationIds: ["mon3", "mon4"],
  }],
  monitors: [
    { id: "mon1", model: "smallhd_cine7",  role: "onboard",  cameraId: "cam1" },
    { id: "mon2", model: "smallhd_ultra7", role: "focus",    cameraId: "cam1" },
    { id: "mon3", model: "atomos_shogun7", role: "director", cameraId: "cam1" },
    { id: "mon4", model: "smallhd_702b",   role: "client",   cameraId: "cam1" },
  ],
  recorders: [],
};

const result = generateFromScene(scene);
console.log(JSON.stringify(result, null, 2));
