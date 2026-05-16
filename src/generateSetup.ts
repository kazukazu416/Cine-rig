import { Equipment, Connection, Setup, SetupInput } from "./types";

const FX6: Equipment = {
  id: "fx6",
  name: "Sony FX6",
  type: "camera",
  ports: [
    { id: "fx6_sdi_out",  type: "SDI",  direction: "out" },
    { id: "fx6_hdmi_out", type: "HDMI", direction: "out" },
  ],
};

const WIRELESS_TX: Equipment = {
  id: "wireless_tx",
  name: "Wireless TX",
  type: "wireless_tx",
  ports: [{ id: "wtx_sdi_in", type: "SDI", direction: "in" }],
};

const WIRELESS_RX: Equipment = {
  id: "wireless_rx",
  name: "Wireless RX",
  type: "wireless_rx",
  ports: [{ id: "wrx_sdi_out", type: "SDI", direction: "out" }],
};

function makeMonitor(n: number): Equipment {
  return {
    id: `monitor_${n}`,
    name: `Monitor ${n}`,
    type: "monitor",
    ports: [
      { id: `mon${n}_sdi_in`,  type: "SDI",  direction: "in" },
      { id: `mon${n}_hdmi_in`, type: "HDMI", direction: "in" },
    ],
  };
}

export function generateSetup(input: SetupInput): Setup {
  const equipments: Equipment[] = [FX6];
  const connections: Connection[] = [];

  const monitors = Array.from({ length: input.monitors }, (_, i) => makeMonitor(i + 1));
  equipments.push(...monitors);

  if (input.wireless) {
    equipments.push(WIRELESS_TX, WIRELESS_RX);

    // FX6 SDI → wireless TX → (air) → wireless RX → monitor 1
    connections.push({
      from: { equipmentId: "fx6",         portId: "fx6_sdi_out" },
      to:   { equipmentId: "wireless_tx", portId: "wtx_sdi_in" },
      cableType: "SDI",
    });
    if (monitors.length >= 1) {
      connections.push({
        from: { equipmentId: "wireless_rx", portId: "wrx_sdi_out" },
        to:   { equipmentId: "monitor_1",   portId: "mon1_sdi_in" },
        cableType: "SDI",
      });
    }

    // FX6 HDMI → monitor 2 (director / client monitor)
    if (monitors.length >= 2) {
      connections.push({
        from: { equipmentId: "fx6",       portId: "fx6_hdmi_out" },
        to:   { equipmentId: "monitor_2", portId: "mon2_hdmi_in" },
        cableType: "HDMI",
      });
    }
  } else {
    // No wireless: HDMI → monitor 1, SDI → monitor 2
    if (monitors.length >= 1) {
      connections.push({
        from: { equipmentId: "fx6",       portId: "fx6_hdmi_out" },
        to:   { equipmentId: "monitor_1", portId: "mon1_hdmi_in" },
        cableType: "HDMI",
      });
    }
    if (monitors.length >= 2) {
      connections.push({
        from: { equipmentId: "fx6",       portId: "fx6_sdi_out" },
        to:   { equipmentId: "monitor_2", portId: "mon2_sdi_in" },
        cableType: "SDI",
      });
    }
  }

  return { equipments, connections };
}
