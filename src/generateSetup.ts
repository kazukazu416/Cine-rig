import type { Equipment, Setup, Scene } from "./types";
import { instantiate, type EquipmentModelId } from "./equipmentDB";

export function generateFromScene(scene: Scene): Setup {
  const equipments: Equipment[] = [];

  for (const cam of scene.cameras) {
    equipments.push(instantiate(cam.model as EquipmentModelId, cam.id));
  }

  for (const ws of scene.wirelessSets) {
    const txModel = (ws.txModel ?? "wireless_tx") as EquipmentModelId;
    equipments.push(instantiate(txModel, ws.id + "_tx"));
    for (const rx of ws.rxUnits) {
      equipments.push(instantiate(rx.model as EquipmentModelId, rx.id));
    }
  }

  for (const mon of scene.monitors) {
    equipments.push(instantiate(mon.model as EquipmentModelId, mon.id));
  }

  for (const rec of scene.recorders) {
    equipments.push(instantiate(rec.model as EquipmentModelId, rec.id));
  }

  for (const conv of scene.converters ?? []) {
    equipments.push(instantiate(conv.model as EquipmentModelId, conv.id));
  }

  for (const mv of scene.multiviewers ?? []) {
    equipments.push(instantiate(mv.model as EquipmentModelId, mv.id));
  }

  return { equipments, connections: [] };
}
