# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CineRig** is a cinema equipment connection planner. Given a camera body, number of monitors, and wireless settings, it generates a JSON graph of equipment and cable connections, then visualizes it with React Flow.

Refer to `docs/CineRig/Requirements.md` as the source of truth for scope decisions.

## Planned Architecture

```
Input → generateSetup() → Connection Graph → Cable Generator → React Flow UI
```

- **`generateSetup()`** — core function that takes user inputs and resolves which equipment is needed
- **Connection Graph** — data structure describing equipment nodes and cable edges
- **Cable Generator** — derives `cableType` for each connection from port type pairs
- **React Flow UI** — renders the connection graph visually

## Data Models (TypeScript targets)

```ts
interface Equipment {
  id: string;
  name: string;
  type: "camera" | "monitor" | "wireless_tx" | "wireless_rx";
  ports: Port[];
}

interface Port {
  id: string;
  type: "HDMI" | "SDI" /* extend as needed */;
  direction: "in" | "out";
}

interface Connection {
  from: { equipmentId: string; portId: string };
  to:   { equipmentId: string; portId: string };
  cableType: string;
}

interface Setup {
  equipments: Equipment[];
  connections: Connection[];
}
```

## MVP Acceptance Criterion

`generateSetup({ camera: "FX6", monitors: 2, wireless: true })` must return a valid `Setup` JSON with the correct equipment list and connections.

## Documentation

Design decisions and architecture notes live in `docs/CineRig/` (Obsidian vault). Update these files when making architectural changes.
- `Requirements.md` — scope and data model
- `Architecture.md` — pipeline flow
- `Tasks.md` — active task list
