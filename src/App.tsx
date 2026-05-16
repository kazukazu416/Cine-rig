import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { generateSetup } from "./generateSetup";
import { setupToFlow } from "./setupToFlow";
import { EquipmentNode } from "./EquipmentNode";

const nodeTypes = { equipment: EquipmentNode };

const setup = generateSetup({ camera: "FX6", monitors: 2, wireless: true });
const { nodes, edges } = setupToFlow(setup);

const LEGEND = [
  { label: "SDI",  color: "#3b82f6" },
  { label: "HDMI", color: "#f59e0b" },
];

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background color="#1e293b" gap={20} />
        <Controls />
        <MiniMap nodeColor={() => "#334155"} style={{ background: "#1e293b" }} />
      </ReactFlow>

      {/* Header */}
      <div style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        color: "#f1f5f9", fontWeight: 700, fontSize: 18, letterSpacing: 1,
        pointerEvents: "none",
      }}>
        CineRig — FX6 + Monitor×2 + Wireless
      </div>

      {/* Cable legend */}
      <div style={{
        position: "absolute", bottom: 16, right: 16,
        background: "#1e293b", border: "1px solid #334155",
        borderRadius: 8, padding: "10px 14px",
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        {LEGEND.map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: "#f1f5f9", fontSize: 13 }}>
            <div style={{ width: 28, height: 3, background: color, borderRadius: 2 }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
