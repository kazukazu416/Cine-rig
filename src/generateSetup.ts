import type { Equipment, Connection, Setup, CameraInput } from "./types";
import { instantiate, instantiateMonitor, type EquipmentModelId } from "./equipmentDB";

export function generateSetup(inputs: CameraInput[]): Setup {
  const equipments: Equipment[] = [];
  const connections: Connection[] = [];
  for (const input of inputs) {
    const rig = buildRig(input);
    equipments.push(...rig.equipments);
    connections.push(...rig.connections);
  }
  return { equipments, connections };
}

function buildRig(input: CameraInput): Setup {
  const uid = `rig_${input.id}`;
  const equipments: Equipment[] = [];
  const connections: Connection[] = [];

  const camera = instantiate(input.model.toLowerCase() as EquipmentModelId, uid);
  equipments.push(camera);

  const monitors = input.monitors.map((mon, i) =>
    instantiateMonitor(i + 1, uid, mon.model)
  );
  equipments.push(...monitors);

  // Camera output ports, SDI-first priority
  const availableOuts = [
    ...camera.ports.filter(p => p.type === "SDI"  && p.direction === "out"),
    ...camera.ports.filter(p => p.type === "HDMI" && p.direction === "out"),
  ];

  if (input.wireless) {
    const tx = instantiate("wireless_tx", uid);
    const rx = instantiate("wireless_rx", uid);
    equipments.push(tx, rx);

    // First camera out → TX (match port type: SDI→SDI-in, HDMI→HDMI-in)
    const camOut = availableOuts.shift();
    if (camOut) {
      const txIn = tx.ports.find(p => p.type === camOut.type && p.direction === "in");
      if (txIn) {
        connections.push({
          from: { equipmentId: camera.id, portId: camOut.id },
          to:   { equipmentId: tx.id,     portId: txIn.id },
          cableType: camOut.type,
        });
      }
    }

    // RX → monitor[0]
    const rxOut = rx.ports.find(p => p.direction === "out");
    if (rxOut && monitors[0]) {
      const monIn = monitors[0].ports.find(p => p.type === rxOut.type && p.direction === "in");
      if (monIn) {
        connections.push({
          from: { equipmentId: rx.id,          portId: rxOut.id },
          to:   { equipmentId: monitors[0].id,  portId: monIn.id },
          cableType: rxOut.type,
        });
      }
    }

    // Remaining camera outs → monitors[1..n]
    for (let i = 1; i < monitors.length; i++) {
      const out = availableOuts.shift();
      if (!out) break;
      const monIn = monitors[i].ports.find(p => p.type === out.type && p.direction === "in");
      if (monIn) {
        connections.push({
          from: { equipmentId: camera.id,       portId: out.id },
          to:   { equipmentId: monitors[i].id,  portId: monIn.id },
          cableType: out.type,
        });
      }
    }
  } else {
    // Direct: camera outs → monitors in order
    for (let i = 0; i < monitors.length; i++) {
      const out = availableOuts.shift();
      if (!out) break;
      const monIn = monitors[i].ports.find(p => p.type === out.type && p.direction === "in");
      if (monIn) {
        connections.push({
          from: { equipmentId: camera.id,       portId: out.id },
          to:   { equipmentId: monitors[i].id,  portId: monIn.id },
          cableType: out.type,
        });
      }
    }
  }

  return { equipments, connections };
}
