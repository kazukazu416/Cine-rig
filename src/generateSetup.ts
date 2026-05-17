import type { Equipment, Port, Connection, Setup, CameraInput, Scene, MonitorInstance, RecorderInstance } from "./types";
import { instantiate, instantiateMonitor, type EquipmentModelId } from "./equipmentDB";

const LOOP_LIMIT = 4;

// Tracks a signal path through loop-through chains
class SignalPath {
  private hops = 0;
  constructor(public src: Equipment, public out: Port) {}

  get sigType(): "SDI" | "HDMI" { return this.out.type as "SDI" | "HDMI"; }
  get available(): boolean { return this.hops < LOOP_LIMIT; }
  exhaust(): void { this.hops = LOOP_LIMIT; }

  connect(dest: Equipment, connections: Connection[]): boolean {
    if (!this.available) return false;
    const destIn =
      dest.ports.find(p => p.type === this.sigType && p.direction === "in") ??
      dest.ports.find(p => p.direction === "in");
    if (!destIn) return false;
    connections.push({
      from: { equipmentId: this.src.id, portId: this.out.id },
      to:   { equipmentId: dest.id,     portId: destIn.id },
      cableType: this.sigType,
    });
    this.hops++;
    const loopOut = dest.ports.find(p => p.type === this.sigType && p.direction === "out");
    if (loopOut) {
      this.src = dest;
      this.out = loopOut;
    } else {
      this.hops = LOOP_LIMIT; // no loop-out, chain ends
    }
    return true;
  }
}

// Build initial signal paths from camera's output ports (SDI first, then HDMI)
function cameraSignalPaths(camera: Equipment): SignalPath[] {
  const sdiOuts = camera.ports.filter(p => p.type === "SDI"  && p.direction === "out");
  const hdmiOuts = camera.ports.filter(p => p.type === "HDMI" && p.direction === "out");
  return [...sdiOuts, ...hdmiOuts].map(p => new SignalPath(camera, p));
}

// Pick the best available path for a given signal type preference
function pickPath(paths: SignalPath[], prefer: "SDI" | "HDMI"): SignalPath | undefined {
  return (
    paths.find(p => p.available && p.sigType === prefer) ??
    paths.find(p => p.available)
  );
}

export function generateFromScene(scene: Scene): Setup {
  const equipments: Equipment[] = [];
  const connections: Connection[] = [];

  for (const camInst of scene.cameras) {
    const cameraId = camInst.id;
    const camera = instantiate(camInst.model as EquipmentModelId, cameraId);
    equipments.push(camera);

    const paths = cameraSignalPaths(camera);

    // Monitors belonging to this camera, sorted by role priority
    const ROLE_PRIORITY: Record<string, number> = {
      onboard: 0, focus: 1, frontline: 2, director: 3, client: 4, other: 5,
    };
    const camMonitors = scene.monitors
      .filter(m => m.cameraId === cameraId || scene.monitors.every(m2 => !m2.cameraId))
      .sort((a, b) => (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99));

    // Which monitor IDs are wireless destinations?
    const wirelessDestIds = new Set<string>(
      scene.wirelessSets
        .filter(ws => ws.sourceId === cameraId)
        .flatMap(ws => ws.destinationIds)
    );

    // Track which monitors have been connected
    const connected = new Set<string>();

    // --- Step 1: Onboard monitors (must be wired directly, SDI preferred) ---
    for (const mon of camMonitors.filter(m => m.role === "onboard")) {
      const monEq = instantiate(mon.model as EquipmentModelId, mon.id);
      equipments.push(monEq);
      const path = pickPath(paths, "SDI");
      if (path) path.connect(monEq, connections);
      connected.add(mon.id);
    }

    // --- Step 2: Wireless sets sourced from this camera ---
    for (const ws of scene.wirelessSets.filter(ws => ws.sourceId === cameraId)) {
      const txModel = (ws.txModel ?? "wireless_tx") as EquipmentModelId;
      const rxModel = (ws.rxModel ?? "wireless_rx") as EquipmentModelId;
      const tx = instantiate(txModel, ws.id + "_tx");
      const rx = instantiate(rxModel, ws.id + "_rx");
      equipments.push(tx, rx);

      // Camera/source signal → TX in
      const path = pickPath(paths, "SDI");
      if (path) {
        const txIn = tx.ports.find(p => p.type === path.sigType && p.direction === "in")
          ?? tx.ports.find(p => p.direction === "in");
        if (txIn) {
          connections.push({
            from: { equipmentId: path.src.id, portId: path.out.id },
            to:   { equipmentId: tx.id,        portId: txIn.id },
            cableType: path.sigType,
          });
          // advance path's hop count and loop pointer
          path.exhaust(); // camera out consumed by TX, treat as exhausted
          const txLoopOut = tx.ports.find(p => p.type === path.sigType && p.direction === "out");
          if (txLoopOut) {
            // TX has a loop-out: create a new path from TX loop-out
            paths.push(new SignalPath(tx, txLoopOut));
          }
        }
      }

      // RX out → destination monitors via loop-through chain
      const rxOut = rx.ports.find(p => p.direction === "out");
      if (rxOut) {
        const rxPath = new SignalPath(rx, rxOut);
        for (const destId of ws.destinationIds) {
          const destMon = scene.monitors.find(m => m.id === destId);
          if (!destMon || connected.has(destId)) continue;
          const destEq = instantiate(destMon.model as EquipmentModelId, destMon.id);
          equipments.push(destEq);
          rxPath.connect(destEq, connections);
          connected.add(destId);
        }
      }
    }

    // --- Step 3: Remaining wired monitors (non-wireless, non-onboard) ---
    const wiredMonitors = camMonitors.filter(
      m => m.role !== "onboard" && !wirelessDestIds.has(m.id) && !connected.has(m.id)
    );
    for (const mon of wiredMonitors) {
      const monEq = instantiate(mon.model as EquipmentModelId, mon.id);
      equipments.push(monEq);
      const path = pickPath(paths, "SDI");
      if (path) path.connect(monEq, connections);
      connected.add(mon.id);
    }

    // --- Step 5: Recorders ---
    for (const rec of scene.recorders) {
      const recEq = instantiate(rec.model as EquipmentModelId, rec.id);
      equipments.push(recEq);
      // Prefer remaining SDI path (camera SDI OUT2 if available), else any
      const path = pickPath(paths, "SDI");
      if (path) path.connect(recEq, connections);
    }
  }

  // Wireless sets sourced from a monitor (multi-hop)
  for (const ws of scene.wirelessSets.filter(ws =>
    !scene.cameras.some(c => c.id === ws.sourceId)
  )) {
    const srcMonEq = equipments.find(e => e.id === ws.sourceId);
    if (!srcMonEq) continue;
    const srcOut = srcMonEq.ports.find(p => p.direction === "out");
    if (!srcOut) continue;
    const tx = instantiate((ws.txModel ?? "wireless_tx") as EquipmentModelId, ws.id + "_tx");
    const rx = instantiate((ws.rxModel ?? "wireless_rx") as EquipmentModelId, ws.id + "_rx");
    equipments.push(tx, rx);
    const txIn = tx.ports.find(p => p.direction === "in");
    if (txIn) {
      connections.push({
        from: { equipmentId: srcMonEq.id, portId: srcOut.id },
        to:   { equipmentId: tx.id,        portId: txIn.id },
        cableType: srcOut.type,
      });
    }
    const rxOut = rx.ports.find(p => p.direction === "out");
    if (rxOut) {
      const rxPath = new SignalPath(rx, rxOut);
      for (const destId of ws.destinationIds) {
        const destMon = scene.monitors.find(m => m.id === destId);
        if (!destMon) continue;
        const destEq = equipments.find(e => e.id === destId);
        if (destEq) rxPath.connect(destEq, connections);
      }
    }
  }

  return { equipments, connections };
}

// Legacy adapter — keeps App.tsx working without changes
export function generateSetup(inputs: CameraInput[]): Setup {
  const scene: Scene = {
    cameras: inputs.map(inp => ({ id: inp.id, model: inp.model.toLowerCase() })),
    wirelessSets: inputs
      .filter(inp => inp.wireless)
      .map(inp => ({
        id: `ws_${inp.id}`,
        sourceId: inp.id,
        destinationIds: inp.monitors.slice(0, 1).map(m => m.id),
      })),
    monitors: inputs.flatMap(inp =>
      inp.monitors.map(m => ({
        id: m.id,
        model: m.model,
        role: m.role === "onboard" ? "onboard" as const
            : m.role === "focus"   ? "focus"   as const
            : m.role === "director"? "director" as const
            : m.role === "client"  ? "client"   as const
            : "other" as const,
        cameraId: inp.id,
      }))
    ),
    recorders: [],
  };
  return generateFromScene(scene);
}
