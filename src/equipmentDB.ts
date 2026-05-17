import type { Equipment, Port, MonitorModelId } from "./types";

// ── Rich spec types ───────────────────────────────────────────────────────

export interface SpecPort {
  type: "SDI" | "HDMI" | "USB-C" | "XLR" | "TRS" | "BNC" | "DC" | "WIRELESS";
  standard?: "3G" | "6G" | "12G" | "1.4" | "2.0" | "2.1" | null;
  count: number;
  cleanFeed?: boolean;
  loopThrough?: boolean;
}

export interface EquipmentSpec {
  manufacturer: string;
  model: string;
  category: "camera" | "monitor" | "wireless_tx" | "wireless_rx" | "recorder";
  size?: number | null;
  resolution?: string | null;
  brightness?: number | null;
  hdr?: boolean | null;
  recorder?: boolean;
  inputs: SpecPort[];
  outputs: SpecPort[];
  powerConsumption?: number | null;
  batteryMount?: "V-mount" | "Gold-mount" | "Sony NP-F" | "BP-U" | "internal" | null;
  notes?: string;
}

// ── Equipment template (drives auto-wiring and node display) ─────────────

export interface EquipmentTemplate {
  name: string;
  type: Equipment["type"];
  spec?: string;
  richSpec?: EquipmentSpec;
  ports: Array<Omit<Port, "id">>;
}

export type CameraModelId =
  | "fx6" | "fx3" | "fx9"
  | "burano" | "venice2" | "a7siii" | "a7iv"
  | "alexa_mini_lf"
  | "v_raptor"
  | "c70" | "c300_mkiii"
  | "ursa_mini_pro_12k";

export type RecorderModelId =
  | "atomos_shogun_connect"
  | "bm_video_assist_7_12g";

export type WirelessModelId =
  | "wireless_tx" | "wireless_rx"
  | "teradek_bolt6_lt750_tx"  | "teradek_bolt6_lt750_rx"
  | "teradek_bolt6_lt1500_tx" | "teradek_bolt6_lt1500_rx"
  | "teradek_bolt6_xt1500_tx" | "teradek_bolt6_xt1500_rx"
  | "teradek_bolt6_xt3000_tx" | "teradek_bolt6_xt3000_rx"
  | "teradek_bolt500xt_tx"    | "teradek_bolt500xt_rx"
  | "hollyland_pyroh_tx"      | "hollyland_pyroh_rx"
  | "accsoon_cineview_se_tx"  | "accsoon_cineview_se_rx";

export type EquipmentModelId =
  | CameraModelId
  | WirelessModelId
  | MonitorModelId
  | RecorderModelId;

// ── DB ────────────────────────────────────────────────────────────────────

export const DB: Record<EquipmentModelId, EquipmentTemplate> = {

  // ── Cameras ─────────────────────────────────────────────────────────────

  fx6: {
    name: "Sony FX6",
    type: "camera",
    spec: "Full-frame / 12G-SDI + HDMI out",
    richSpec: {
      manufacturer: "Sony", model: "FX6", category: "camera",
      size: null, resolution: "4K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "BP-U",
      notes: "12G-SDI supports 4K RAW output.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  fx3: {
    name: "Sony FX3",
    type: "camera",
    spec: "Full-frame / HDMI 2.0 out only",
    richSpec: {
      manufacturer: "Sony", model: "FX3", category: "camera",
      size: null, resolution: "4K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "NP-FZ100 internal battery. No SDI output.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  fx9: {
    name: "Sony FX9",
    type: "camera",
    spec: "Full-frame / 2×SDI + HDMI out",
    richSpec: {
      manufacturer: "Sony", model: "FX9", category: "camera",
      size: null, resolution: "6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "BP-U",
      notes: "SDI 1 supports up to QFHD/4K. Simultaneous SDI+HDMI output supported.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  burano: {
    name: "Sony BURANO",
    type: "camera",
    spec: "Full-frame 8.6K / 2×SDI + HDMI out",
    richSpec: {
      manufacturer: "Sony", model: "BURANO", category: "camera",
      size: null, resolution: "8.6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "SDI",  standard: "3G",  count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "SDI OUT1: 12G/6G/3G/HD-SDI. SDI OUT2: 3G/HD-SDI. SDI added in firmware v2.0.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  venice2: {
    name: "Sony VENICE 2",
    type: "camera",
    spec: "Full-frame 8.6K / 4×SDI + HDMI out",
    richSpec: {
      manufacturer: "Sony", model: "VENICE 2", category: "camera",
      size: null, resolution: "8.6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI",  standard: "12G", count: 2 },
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "SDI 1/2: 12G (4K output). SDI 3/4: 3G (FHD). Total 4 BNC SDI + 1 HDMI A.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  a7siii: {
    name: "Sony α7S III",
    type: "camera",
    spec: "Full-frame / HDMI 2.0 out only",
    richSpec: {
      manufacturer: "Sony", model: "α7S III", category: "camera",
      size: null, resolution: "4K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "Full-size HDMI 2.0 A. 4K60p 16-bit RAW to external recorder. No SDI.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  a7iv: {
    name: "Sony α7 IV",
    type: "camera",
    spec: "Full-frame / HDMI 2.0 out only",
    richSpec: {
      manufacturer: "Sony", model: "α7 IV", category: "camera",
      size: null, resolution: "4K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "Full-size HDMI A. 4K 4:2:2 10-bit at up to 60fps. No SDI.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  alexa_mini_lf: {
    name: "ARRI ALEXA Mini LF",
    type: "camera",
    spec: "Full-frame / 2×SDI out (6G in UHD)",
    richSpec: {
      manufacturer: "ARRI", model: "ALEXA Mini LF", category: "camera",
      size: null, resolution: "4.5K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "3G", count: 2 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "2x BNC SDI: 1.5G/3G standard; 6G in UHD/4K recording modes. No HDMI.",
    },
    ports: [
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  v_raptor: {
    name: "RED V-Raptor",
    type: "camera",
    spec: "Full-frame / 3×12G-SDI out",
    richSpec: {
      manufacturer: "RED", model: "V-Raptor", category: "camera",
      size: null, resolution: "8K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "12G", count: 3 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "3x 12G-SDI BNC. HDMI要確認: requires optional DSMC3 expander module.",
    },
    ports: [
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  c70: {
    name: "Canon EOS C70",
    type: "camera",
    spec: "Super35 / HDMI 2.0 out only",
    richSpec: {
      manufacturer: "Canon", model: "EOS C70", category: "camera",
      size: null, resolution: "4K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "Full-size HDMI A. 4K DCI 4:2:2 10-bit. No SDI output.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  c300_mkiii: {
    name: "Canon EOS C300 Mark III",
    type: "camera",
    spec: "Super35 / 12G-SDI + HDMI out",
    richSpec: {
      manufacturer: "Canon", model: "EOS C300 Mark III", category: "camera",
      size: null, resolution: "4K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "1x 12G/6G/3G-SDI BNC + 1x HDMI.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  ursa_mini_pro_12k: {
    name: "Blackmagic URSA Mini Pro 12K",
    type: "camera",
    spec: "Super35 12K / 12G-SDI + 3G-SDI out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "URSA Mini Pro 12K", category: "camera",
      size: null, resolution: "12K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "12G", count: 1 },
        { type: "SDI", standard: "3G",  count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "1x 12G-SDI out + 1x 3G-SDI out BNC. No HDMI. Also has 12G-SDI reference input.",
    },
    ports: [
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  // ── Wireless TX/RX – generic (used by auto-wiring) ──────────────────────

  wireless_tx: {
    name: "Wireless TX",
    type: "wireless_tx",
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
    ],
  },

  wireless_rx: {
    name: "Wireless RX",
    type: "wireless_rx",
    ports: [
      { type: "SDI", direction: "out" },
    ],
  },

  // ── Wireless – Teradek Bolt 6 LT ────────────────────────────────────────

  teradek_bolt6_lt750_tx: {
    name: "Teradek Bolt 6 LT 750 TX",
    type: "wireless_tx",
    spec: "Bolt 6 LT / 3G-SDI+HDMI in · 750ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 6 LT 750 TX", category: "wireless_tx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [{ type: "WIRELESS", count: 1 }],
      powerConsumption: null, batteryMount: null,
      notes: "Max 1080p60 over SDI, 4K30 over HDMI. 750ft (230m) range.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
    ],
  },

  teradek_bolt6_lt750_rx: {
    name: "Teradek Bolt 6 LT 750 RX",
    type: "wireless_rx",
    spec: "Bolt 6 LT / 3G-SDI+HDMI out · 750ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 6 LT 750 RX", category: "wireless_rx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [{ type: "WIRELESS", count: 1 }],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: null, notes: "",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  teradek_bolt6_lt1500_tx: {
    name: "Teradek Bolt 6 LT 1500 TX",
    type: "wireless_tx",
    spec: "Bolt 6 LT / 3G-SDI+HDMI in · 1500ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 6 LT 1500 TX", category: "wireless_tx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [{ type: "WIRELESS", count: 1 }],
      powerConsumption: null, batteryMount: null,
      notes: "Same ports as LT 750. 1500ft (450m) range.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
    ],
  },

  teradek_bolt6_lt1500_rx: {
    name: "Teradek Bolt 6 LT 1500 RX",
    type: "wireless_rx",
    spec: "Bolt 6 LT / 3G-SDI+HDMI out · 1500ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 6 LT 1500 RX", category: "wireless_rx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [{ type: "WIRELESS", count: 1 }],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: null, notes: "",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Wireless – Teradek Bolt 6 XT ────────────────────────────────────────

  teradek_bolt6_xt1500_tx: {
    name: "Teradek Bolt 6 XT 1500 TX",
    type: "wireless_tx",
    spec: "Bolt 6 XT / 12G-SDI+HDMI in · 1500ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 6 XT 1500 TX", category: "wireless_tx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [{ type: "WIRELESS", count: 1 }],
      powerConsumption: null, batteryMount: null,
      notes: "12G-SDI supports 4K60. 3D LUT, FRC, anamorphic desqueeze. 1500ft range.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
    ],
  },

  teradek_bolt6_xt1500_rx: {
    name: "Teradek Bolt 6 XT 1500 RX",
    type: "wireless_rx",
    spec: "Bolt 6 XT / 12G-SDI+HDMI out · 1500ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 6 XT 1500 RX", category: "wireless_rx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [{ type: "WIRELESS", count: 1 }],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: null, notes: "",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  teradek_bolt6_xt3000_tx: {
    name: "Teradek Bolt 6 XT 3000 TX",
    type: "wireless_tx",
    spec: "Bolt 6 XT / 12G-SDI+HDMI in · 3000ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 6 XT 3000 TX", category: "wireless_tx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [{ type: "WIRELESS", count: 1 }],
      powerConsumption: null, batteryMount: null,
      notes: "Same ports as XT 1500. 3000ft (900m) range.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
    ],
  },

  teradek_bolt6_xt3000_rx: {
    name: "Teradek Bolt 6 XT 3000 RX",
    type: "wireless_rx",
    spec: "Bolt 6 XT / 12G-SDI+HDMI out · 3000ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 6 XT 3000 RX", category: "wireless_rx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [{ type: "WIRELESS", count: 1 }],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: null, notes: "",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Wireless – Teradek Bolt 500 XT ──────────────────────────────────────

  teradek_bolt500xt_tx: {
    name: "Teradek Bolt 500 XT TX",
    type: "wireless_tx",
    spec: "Bolt 500 XT / 3G-SDI+HDMI in+loop · 500ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 500 XT TX", category: "wireless_tx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 1 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "WIRELESS", count: 1 },
        { type: "SDI",  standard: "3G", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "Older Bolt 500 XT generation. TX has SDI loop-through output. 500ft range.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
    ],
  },

  teradek_bolt500xt_rx: {
    name: "Teradek Bolt 500 XT RX",
    type: "wireless_rx",
    spec: "Bolt 500 XT / 2×SDI+HDMI out · 500ft",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 500 XT RX", category: "wireless_rx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [{ type: "WIRELESS", count: 1 }],
      outputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "Dual 3G-SDI outputs on RX.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Wireless – Hollyland Pyro H ─────────────────────────────────────────

  hollyland_pyroh_tx: {
    name: "Hollyland Pyro H TX",
    type: "wireless_tx",
    spec: "Pyro H / HDMI in+loop · 1300ft",
    richSpec: {
      manufacturer: "Hollyland", model: "Pyro H TX", category: "wireless_tx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "HDMI", standard: null, count: 1 },
      ],
      outputs: [
        { type: "WIRELESS", count: 1 },
        { type: "HDMI", standard: null, count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "HDMI only (no SDI). 4K30 transmission. HDMI loop-through. 1300ft (400m).",
    },
    ports: [
      { type: "HDMI", direction: "in" },
      { type: "HDMI", direction: "out" },
    ],
  },

  hollyland_pyroh_rx: {
    name: "Hollyland Pyro H RX",
    type: "wireless_rx",
    spec: "Pyro H / HDMI out · 1300ft",
    richSpec: {
      manufacturer: "Hollyland", model: "Pyro H RX", category: "wireless_rx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [{ type: "WIRELESS", count: 1 }],
      outputs: [
        { type: "HDMI", standard: null, count: 1 },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "HDMI only output.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Wireless – Accsoon CineView SE ──────────────────────────────────────

  accsoon_cineview_se_tx: {
    name: "Accsoon CineView SE TX",
    type: "wireless_tx",
    spec: "CineView SE / SDI+HDMI in · 1200ft",
    richSpec: {
      manufacturer: "Accsoon", model: "CineView SE TX", category: "wireless_tx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 1 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [{ type: "WIRELESS", count: 1 }],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "Standard: 1080p60 SDI. 4K SE variant supports 4K30 over HDMI. 1200ft (350m).",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
    ],
  },

  accsoon_cineview_se_rx: {
    name: "Accsoon CineView SE RX",
    type: "wireless_rx",
    spec: "CineView SE / SDI+HDMI out · 1200ft",
    richSpec: {
      manufacturer: "Accsoon", model: "CineView SE RX", category: "wireless_rx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [{ type: "WIRELESS", count: 1 }],
      outputs: [
        { type: "SDI",  standard: "3G", count: 1 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "Cross-conversion: TX SDI→RX HDMI, TX HDMI→RX SDI.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Monitors – SmallHD ──────────────────────────────────────────────────

  smallhd_cine7: {
    name: "SmallHD Cine 7",
    type: "monitor",
    spec: '7" 2000nit / 2×3G-SDI+HDMI 2.0 in·out',
    richSpec: {
      manufacturer: "SmallHD", model: "Cine 7", category: "monitor",
      size: 7, resolution: "1920x1200", brightness: 2000, hdr: true, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "SDI 1 = input; SDI 2 = input + loop-through output. HDMI 2.0 loop. Optional V/Gold plates.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  smallhd_cine5: {
    name: "SmallHD Cine 5",
    type: "monitor",
    spec: '5" / 2×3G-SDI+HDMI 2.0 in·out',
    richSpec: {
      manufacturer: "SmallHD", model: "Cine 5", category: "monitor",
      size: 5, resolution: "1920x1080", brightness: null, hdr: true, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "Same port layout as Cine 7. SDI 2 = loop-through. Optional V/Gold mount plates.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  smallhd_ultra7: {
    name: "SmallHD Ultra 7",
    type: "monitor",
    spec: '7" 2300nit / 2×6G-SDI+HDMI 2.0 in·out',
    richSpec: {
      manufacturer: "SmallHD", model: "Ultra 7", category: "monitor",
      size: 7, resolution: "1920x1200", brightness: 2300, hdr: true, recorder: false,
      inputs: [
        { type: "SDI",  standard: "6G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "6G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "6G-SDI supports 4K up to 30fps. 2-pin power passthrough. Ethernet for camera control.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  smallhd_ultra5: {
    name: "SmallHD Ultra 5",
    type: "monitor",
    spec: '5" / 2×3G-SDI+HDMI 2.0 in·out',
    richSpec: {
      manufacturer: "SmallHD", model: "Ultra 5", category: "monitor",
      size: 5, resolution: "1920x1080", brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "Smart 5 series. 3G-SDI (not 6G). SDI 2 = loop-through.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  smallhd_ultra10: {
    name: "SmallHD Ultra 10",
    type: "monitor",
    spec: '10" 2000nit / 2×6G-SDI+HDMI 2.0 in·out',
    richSpec: {
      manufacturer: "SmallHD", model: "Ultra 10", category: "monitor",
      size: 10, resolution: "1920x1200", brightness: 2000, hdr: true, recorder: false,
      inputs: [
        { type: "SDI",  standard: "6G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "6G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "10\" portable production monitor. IP54. 6G-SDI 4K. Ethernet port. GPI interface.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  smallhd_indie7: {
    name: "SmallHD Indie 7",
    type: "monitor",
    spec: '7" / 2×3G-SDI+HDMI in · SDI loop out',
    richSpec: {
      manufacturer: "SmallHD", model: "Indie 7", category: "monitor",
      size: 7, resolution: "1920x1200", brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "SDI 2 = loop-through. 要確認: HDMI output presence (not confirmed in official docs).",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
    ],
  },

  smallhd_indie5: {
    name: "SmallHD Indie 5",
    type: "monitor",
    spec: '5" 1000nit / 2×3G-SDI+HDMI 2.0 in·out',
    richSpec: {
      manufacturer: "SmallHD", model: "Indie 5", category: "monitor",
      size: 5, resolution: "1920x1080", brightness: 1000, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "Smart 5 series. 1000nit. PageOS 5.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  smallhd_702touch: {
    name: "SmallHD 702 Touch",
    type: "monitor",
    spec: '7" 700nit / 2×3G-SDI+HDMI in·out',
    richSpec: {
      manufacturer: "SmallHD", model: "702 Touch", category: "monitor",
      size: 7, resolution: "1920x1080", brightness: 700, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G", count: 1 },
        { type: "HDMI", standard: null,  count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "700nit. SDI↔HDMI cross-conversion. Older model.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  smallhd_702b: {
    name: "SmallHD 702 Bright",
    type: "monitor",
    spec: '7" 1000nit / 2×SDI+HDMI in · SDI+HDMI out',
    richSpec: {
      manufacturer: "SmallHD", model: "702 Bright", category: "monitor",
      size: 7, resolution: "1920x1080", brightness: 1000, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G", count: 1 },
        { type: "HDMI", standard: null,  count: 1, cleanFeed: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "SDI 1 out is assignable; SDI 2 acts as pass-through. HDMI clean feed out.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Monitors – Atomos ───────────────────────────────────────────────────

  atomos_shogun7: {
    name: "Atomos Shogun 7",
    type: "monitor",
    spec: '7" HDR / 12G-SDI+HDMI 2.0 in·out · recorder',
    richSpec: {
      manufacturer: "Atomos", model: "Shogun 7", category: "monitor",
      size: 7, resolution: "1920x1080", brightness: null, hdr: true, recorder: true,
      inputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0",  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0",  count: 1, cleanFeed: true },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "12G-SDI 4K60. Records to SSD. HDR monitoring.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  atomos_shogun_ultra: {
    name: "Atomos Shogun Ultra",
    type: "monitor",
    spec: '7" 2000nit / 12G-SDI+HDMI 2.0 in·out · recorder',
    richSpec: {
      manufacturer: "Atomos", model: "Shogun Ultra", category: "monitor",
      size: 7, resolution: "1920x1080", brightness: 2000, hdr: true, recorder: true,
      inputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0",  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0",  count: 1, cleanFeed: true },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "AtomOS 11. RAW recording up to 8K30/6K60/4K120. Optional NDI TX upgrade.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  atomos_ninja_v: {
    name: "Atomos Ninja V",
    type: "recorder",
    spec: '5" 1000nit / HDMI 2.0a only · recorder',
    richSpec: {
      manufacturer: "Atomos", model: "Ninja V", category: "recorder",
      size: 5, resolution: "1920x1080", brightness: 1000, hdr: true, recorder: true,
      inputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "No built-in SDI. SDI via optional AtomX SDI module. Records ProRes/DNxHR.",
    },
    ports: [
      { type: "HDMI", direction: "in" },
      { type: "HDMI", direction: "out" },
    ],
  },

  atomos_ninja_vplus: {
    name: "Atomos Ninja V+",
    type: "recorder",
    spec: '5.2" 1000nit / HDMI 2.0a only · recorder',
    richSpec: {
      manufacturer: "Atomos", model: "Ninja V+", category: "recorder",
      size: 5.2, resolution: "1920x1080", brightness: 1000, hdr: true, recorder: true,
      inputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "No built-in SDI. SDI via optional AtomX SDI module. Supports RAW over HDMI.",
    },
    ports: [
      { type: "HDMI", direction: "in" },
      { type: "HDMI", direction: "out" },
    ],
  },

  atomos_ninja_ultra: {
    name: "Atomos Ninja Ultra",
    type: "recorder",
    spec: '5.2" 1000nit / HDMI only · recorder',
    richSpec: {
      manufacturer: "Atomos", model: "Ninja Ultra", category: "recorder",
      size: 5.2, resolution: "1920x1080", brightness: 1000, hdr: true, recorder: true,
      inputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "No built-in SDI. SDI via optional Atomos Connect module. Records ProRes RAW/ProRes/H.265.",
    },
    ports: [
      { type: "HDMI", direction: "in" },
      { type: "HDMI", direction: "out" },
    ],
  },

  atomos_sumo19: {
    name: "Atomos Sumo 19",
    type: "monitor",
    spec: '19" HDR / 4×SDI+HDMI in · SDI+HDMI out',
    richSpec: {
      manufacturer: "Atomos", model: "Sumo 19", category: "monitor",
      size: 19, resolution: "1920x1080", brightness: 1500, hdr: true, recorder: true,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 4 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1, cleanFeed: true },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "19\" HDR production monitor. Quad-3G-SDI for 4K input. Records to SSD.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Monitors – Sony ─────────────────────────────────────────────────────

  sony_pvm_a170: {
    name: "Sony PVM-A170",
    type: "monitor",
    spec: '17" OLED / 2×3G-SDI+HDMI in · 2×SDI loop',
    richSpec: {
      manufacturer: "Sony", model: "PVM-A170", category: "monitor",
      size: 17, resolution: "1920x1080", brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G", count: 2, loopThrough: true },
      ],
      powerConsumption: 75, batteryMount: null,
      notes: "TRIMASTER EL OLED. 2x BNC SDI loop-through. HDMI standard not published by Sony.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  sony_pvm_a250: {
    name: "Sony PVM-A250",
    type: "monitor",
    spec: '25" OLED / 2×3G-SDI+HDMI in · 2×SDI loop',
    richSpec: {
      manufacturer: "Sony", model: "PVM-A250", category: "monitor",
      size: 25, resolution: "1920x1080", brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G", count: 2, loopThrough: true },
      ],
      powerConsumption: 115, batteryMount: null,
      notes: "TRIMASTER EL OLED. 2x BNC SDI loop-through.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  sony_lmd_a170: {
    name: "Sony LMD-A170",
    type: "monitor",
    spec: '17" LCD HDR / 2×3G-SDI+HDMI in · 2×SDI loop',
    richSpec: {
      manufacturer: "Sony", model: "LMD-A170", category: "monitor",
      size: 17, resolution: "1920x1080", brightness: null, hdr: true, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G", count: 2, loopThrough: true },
      ],
      powerConsumption: 49, batteryMount: null,
      notes: "IPS LCD. HDR: HLG, ST2084, S-Log3. HDMI standard not specified in Sony docs.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  sony_lmd_a220: {
    name: "Sony LMD-A220",
    type: "monitor",
    spec: '22" LCD HDR / 2×3G-SDI+HDMI in · 2×SDI loop',
    richSpec: {
      manufacturer: "Sony", model: "LMD-A220", category: "monitor",
      size: 22, resolution: "1920x1080", brightness: null, hdr: true, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G", count: 2, loopThrough: true },
      ],
      powerConsumption: 47, batteryMount: null,
      notes: "IPS LCD. HDR: HLG, ST2084, S-Log3.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  sony_lmd_a240: {
    name: "Sony LMD-A240",
    type: "monitor",
    spec: '24" LCD HDR / 2×3G-SDI+HDMI in · 2×SDI loop',
    richSpec: {
      manufacturer: "Sony", model: "LMD-A240", category: "monitor",
      size: 24, resolution: "1920x1200", brightness: null, hdr: true, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G", count: 2, loopThrough: true },
      ],
      powerConsumption: 51, batteryMount: null,
      notes: "WUXGA (1920×1200). IPS LCD. HDR.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  sony_bvm_hx310: {
    name: "Sony BVM-HX310",
    type: "monitor",
    spec: '31" 4K 1000nit / 8×SDI+HDMI in · 8×SDI loop',
    richSpec: {
      manufacturer: "Sony", model: "BVM-HX310", category: "monitor",
      size: 31, resolution: "4096x2160", brightness: 1000, hdr: true, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 4 },
        { type: "SDI",  standard: "12G", count: 2 },
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "1.4", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 4, loopThrough: true },
        { type: "SDI",  standard: "12G", count: 2, loopThrough: true },
        { type: "SDI",  standard: "3G",  count: 2, loopThrough: true },
      ],
      powerConsumption: 450, batteryMount: null,
      notes: "TRIMASTER HX LCD. SDI G1: 4×3G BNC. SDI G2: 2×12G + 2×3G BNC. All loop-through.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  // ── Monitors – FSI ──────────────────────────────────────────────────────

  fsi_dm240w: {
    name: "FSI DM240W",
    type: "monitor",
    spec: '24" reference / SDI+HDMI in · SDI loop out',
    richSpec: {
      manufacturer: "FSI", model: "DM240W", category: "monitor",
      size: 24, resolution: "1920x1200", brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 1 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "FSI reference production monitor. SDI loop-through only.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
    ],
  },

  // ── Recorders ────────────────────────────────────────────────────────────

  atomos_shogun_connect: {
    name: "Atomos Shogun Connect",
    type: "recorder",
    spec: "12G-SDI+HDMI 2.0a in·out · recorder",
    richSpec: {
      manufacturer: "Atomos", model: "Shogun Connect", category: "recorder",
      size: null, resolution: null, brightness: null, hdr: null, recorder: true,
      inputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0",  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0",  count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "No integrated display. Records to SSD via USB-C. Ethernet/Wi-Fi streaming.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  bm_video_assist_7_12g: {
    name: 'Blackmagic Video Assist 7" 12G',
    type: "recorder",
    spec: '7" 2500nit / 12G-SDI+HDMI 2.0a in·out · recorder',
    richSpec: {
      manufacturer: "Blackmagic Design", model: 'Video Assist 7" 12G', category: "recorder",
      size: 7, resolution: "1920x1200", brightness: 2500, hdr: true, recorder: true,
      inputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0",  count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "HDMI", standard: "2.0",  count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "7\" 2500nit touchscreen. Records 4K ProRes/H.265. 12G-SDI and HDMI 2.0a in/out.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

};

// ── Model lists ───────────────────────────────────────────────────────────

export const MONITOR_MODELS: MonitorModelId[] = [
  // SmallHD
  "smallhd_cine7",   "smallhd_cine5",
  "smallhd_ultra7",  "smallhd_ultra5",  "smallhd_ultra10",
  "smallhd_indie7",  "smallhd_indie5",
  "smallhd_702touch","smallhd_702b",
  // Atomos
  "atomos_shogun7",  "atomos_shogun_ultra",
  "atomos_ninja_v",  "atomos_ninja_vplus", "atomos_ninja_ultra",
  "atomos_sumo19",
  // Sony
  "sony_pvm_a170",   "sony_pvm_a250",
  "sony_lmd_a170",   "sony_lmd_a220",   "sony_lmd_a240",
  "sony_bvm_hx310",
  // FSI
  "fsi_dm240w",
];

// ── Instantiators ─────────────────────────────────────────────────────────

export function instantiate(modelId: EquipmentModelId, uid: string): import("./types").Equipment {
  const tmpl = DB[modelId];
  return {
    id: `${uid}_${modelId}`,
    name: tmpl.name,
    type: tmpl.type,
    ports: tmpl.ports.map((p, i) => ({ id: `${uid}_${modelId}_p${i}`, ...p })),
  };
}

export function instantiateMonitor(n: number, uid: string, modelId: MonitorModelId): import("./types").Equipment {
  const tmpl = DB[modelId];
  return {
    id: `${uid}_monitor_${n}`,
    name: tmpl.name,
    type: "monitor",
    ports: tmpl.ports.map((p, i) => ({ id: `${uid}_monitor_${n}_p${i}`, ...p })),
  };
}
