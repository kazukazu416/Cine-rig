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
  category: "camera" | "monitor" | "wireless_tx" | "wireless_rx" | "recorder" | "converter" | "multiviewer";
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
  | "burano" | "venice2" | "venice1" | "a7siii" | "a7iv"
  | "alexa_mini_lf" | "alexa_35" | "alexa_mini" | "amira" | "alexa_lf"
  | "v_raptor" | "v_raptor_xl"
  | "komodo_6k" | "komodo_x"
  | "c70" | "c300_mkiii" | "c300_mkii" | "c500_mkii" | "eos_r5c"
  | "ursa_mini_pro_12k" | "bmpcc_6k_g2" | "bmpcc_6k_pro" | "bm_cinema_6k";

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

export type ConverterModelId =
  | "bm_mini_conv_hdmi_sdi_6g"
  | "bm_mini_conv_sdi_hdmi_6g"
  | "bm_mini_conv_sdi_dist"
  | "bm_teranex_hdmi_sdi_12g"
  | "bm_teranex_sdi_hdmi_12g"
  | "decimator_md_hx"
  | "decimator_md_lx";

export type MultiviewerModelId =
  | "bm_multiview_4hd"
  | "bm_multiview_4"
  | "bm_multiview_16"
  | "decimator_dmon_4s"
  | "decimator_dmon_16s";

export type EquipmentModelId =
  | CameraModelId
  | WirelessModelId
  | MonitorModelId
  | RecorderModelId
  | ConverterModelId
  | MultiviewerModelId;

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
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "SDI",  standard: "3G",  count: 1 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "BP-U",
      notes: "SDI 1: 12G/6G/3G supports up to QFHD/4K. SDI 2: 3G-SDI. Simultaneous SDI+HDMI output supported.",
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
    spec: "Full-frame / 2×12G-SDI out",
    richSpec: {
      manufacturer: "RED", model: "V-Raptor", category: "camera",
      size: null, resolution: "8K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "12G", count: 2 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "2x 12G-SDI BNC (SDI 1/2). 3×SDI は V-Raptor XL のみ。HDMI requires optional DSMC3 expander.",
    },
    ports: [
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

  // ── ARRI ─────────────────────────────────────────────────────────────────

  alexa_35: {
    name: "ARRI ALEXA 35",
    type: "camera",
    spec: "Super35 4K / 2×12G-SDI out",
    richSpec: {
      manufacturer: "ARRI", model: "ALEXA 35", category: "camera",
      size: null, resolution: "4.6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "12G", count: 2 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "2x BNC 12G-SDI. SDI 2 can be configured as return input. No HDMI.",
    },
    ports: [
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  alexa_mini: {
    name: "ARRI ALEXA Mini",
    type: "camera",
    spec: "Super35 / 2×SDI out (up to 6G)",
    richSpec: {
      manufacturer: "ARRI", model: "ALEXA Mini", category: "camera",
      size: null, resolution: "3.2K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "3G", count: 1 },
        { type: "SDI", standard: "6G", count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "SDI 1: up to 3G (HD 444). SDI 2: up to 6G (UHD 422). No HDMI.",
    },
    ports: [
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  amira: {
    name: "ARRI AMIRA",
    type: "camera",
    spec: "Super35 / 2×SDI out (up to 6G)",
    richSpec: {
      manufacturer: "ARRI", model: "AMIRA", category: "camera",
      size: null, resolution: "3.2K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "3G", count: 1 },
        { type: "SDI", standard: "6G", count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "SDI 1: up to 3G (HD 444). SDI 2: up to 6G (UHD 422). No HDMI.",
    },
    ports: [
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  alexa_lf: {
    name: "ARRI ALEXA LF",
    type: "camera",
    spec: "Large-format / 4×6G-SDI MON OUT",
    richSpec: {
      manufacturer: "ARRI", model: "ALEXA LF", category: "camera",
      size: null, resolution: "4.5K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "6G", count: 4 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "4x BNC MON OUT (6G-SDI). No HDMI. Predecessor to ALEXA Mini LF.",
    },
    ports: [
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  // ── Sony VENICE 1 ────────────────────────────────────────────────────────

  venice1: {
    name: "Sony VENICE",
    type: "camera",
    spec: "Full-frame 6K / 4×SDI + HDMI out",
    richSpec: {
      manufacturer: "Sony", model: "VENICE", category: "camera",
      size: null, resolution: "6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI",  standard: "12G", count: 2 },
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "SDI 1/2: 12G/6G/3G switchable. SDI 3/4: 3G monitoring. 1x HDMI A. Requires AXS-R7 for RAW.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── RED ──────────────────────────────────────────────────────────────────

  v_raptor_xl: {
    name: "RED V-Raptor XL",
    type: "camera",
    spec: "Full-frame 8K / 3×12G-SDI + 1×3G-SDI",
    richSpec: {
      manufacturer: "RED", model: "V-Raptor XL", category: "camera",
      size: null, resolution: "8K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "12G", count: 3 },
        { type: "SDI", standard: "3G",  count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "3x 12G-SDI rear BNC + 1x 3G-SDI front (for EVF). No HDMI on body.",
    },
    ports: [
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  komodo_6k: {
    name: "RED KOMODO 6K",
    type: "camera",
    spec: "Super35 6K / 1×12G-SDI out",
    richSpec: {
      manufacturer: "RED", model: "KOMODO 6K", category: "camera",
      size: null, resolution: "6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "12G", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "1x multi-standard 12G/6G/3G/1.5G-SDI BNC. No HDMI. USB-C for accessories.",
    },
    ports: [
      { type: "SDI", direction: "out" },
    ],
  },

  komodo_x: {
    name: "RED KOMODO-X 6K",
    type: "camera",
    spec: "Super35 6K / 1×12G-SDI out",
    richSpec: {
      manufacturer: "RED", model: "KOMODO-X 6K", category: "camera",
      size: null, resolution: "6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI", standard: "12G", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "1x multi-standard 12G/6G/3G/1.5G-SDI BNC. No HDMI. Enhanced cooling vs KOMODO.",
    },
    ports: [
      { type: "SDI", direction: "out" },
    ],
  },

  // ── Canon ────────────────────────────────────────────────────────────────

  c300_mkii: {
    name: "Canon EOS C300 Mark II",
    type: "camera",
    spec: "Super35 / 2×3G-SDI + HDMI out",
    richSpec: {
      manufacturer: "Canon", model: "EOS C300 Mark II", category: "camera",
      size: null, resolution: "4K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI",  standard: "3G", count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "2x BNC 3G-SDI (SDI OUT / MON.) + 1x HDMI. Dual 3G for 4K RAW output.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  c500_mkii: {
    name: "Canon EOS C500 Mark II",
    type: "camera",
    spec: "Full-frame / 2×12G-SDI + HDMI out",
    richSpec: {
      manufacturer: "Canon", model: "EOS C500 Mark II", category: "camera",
      size: null, resolution: "6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "SDI",  standard: "12G", count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "2x BNC 12G-SDI (SDI OUT + MON.) + 1x HDMI. Both SDI support 12G/6G/3G.",
    },
    ports: [
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  eos_r5c: {
    name: "Canon EOS R5 C",
    type: "camera",
    spec: "Full-frame 8K / HDMI out only",
    richSpec: {
      manufacturer: "Canon", model: "EOS R5 C", category: "camera",
      size: null, resolution: "8K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "Full-size HDMI A. 8K RAW output to external recorder. No SDI.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Blackmagic Pocket / Cinema ───────────────────────────────────────────

  bmpcc_6k_g2: {
    name: "Blackmagic BMPCC 6K G2",
    type: "camera",
    spec: "Super35 6K / HDMI out only",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "Pocket Cinema Camera 6K G2", category: "camera",
      size: null, resolution: "6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "Full-size HDMI 2.0. Up to 1080p60 monitoring output. No SDI.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  bmpcc_6k_pro: {
    name: "Blackmagic BMPCC 6K Pro",
    type: "camera",
    spec: "Super35 6K / HDMI out only",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "Pocket Cinema Camera 6K Pro", category: "camera",
      size: null, resolution: "6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "Full-size HDMI 2.0. ND filters built-in. Up to 1080p60 monitoring output. No SDI.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  bm_cinema_6k: {
    name: "Blackmagic Cinema Camera 6K",
    type: "camera",
    spec: "Full-frame 6K / HDMI out only",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "Cinema Camera 6K", category: "camera",
      size: null, resolution: "6K", brightness: null, hdr: null, recorder: false,
      inputs: [],
      outputs: [
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "internal",
      notes: "Full-size HDMI 2.0. Full-frame sensor with L-mount. Up to 1080p60 monitoring. No SDI.",
    },
    ports: [
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Wireless TX/RX – generic (used by auto-wiring) ──────────────────────

  wireless_tx: {
    name: "Wireless TX",
    type: "wireless_tx",
    ports: [
      { type: "SDI",      direction: "in" },
      { type: "HDMI",     direction: "in" },
      { type: "WIRELESS", direction: "out" },
    ],
  },

  wireless_rx: {
    name: "Wireless RX",
    type: "wireless_rx",
    ports: [
      { type: "WIRELESS", direction: "in" },
      { type: "SDI",      direction: "out" },
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
      { type: "SDI",      direction: "in" },
      { type: "HDMI",     direction: "in" },
      { type: "WIRELESS", direction: "out" },
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
      { type: "WIRELESS", direction: "in" },
      { type: "SDI",      direction: "out" },
      { type: "HDMI",     direction: "out" },
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
      { type: "SDI",      direction: "in" },
      { type: "HDMI",     direction: "in" },
      { type: "WIRELESS", direction: "out" },
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
      { type: "WIRELESS", direction: "in" },
      { type: "SDI",      direction: "out" },
      { type: "HDMI",     direction: "out" },
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
      { type: "SDI",      direction: "in" },
      { type: "HDMI",     direction: "in" },
      { type: "WIRELESS", direction: "out" },
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
      { type: "WIRELESS", direction: "in" },
      { type: "SDI",      direction: "out" },
      { type: "HDMI",     direction: "out" },
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
      { type: "SDI",      direction: "in" },
      { type: "HDMI",     direction: "in" },
      { type: "WIRELESS", direction: "out" },
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
      { type: "WIRELESS", direction: "in" },
      { type: "SDI",      direction: "out" },
      { type: "HDMI",     direction: "out" },
    ],
  },

  // ── Wireless – Teradek Bolt 500 XT ──────────────────────────────────────

  teradek_bolt500xt_tx: {
    name: "Teradek Bolt 500 XT TX",
    type: "wireless_tx",
    spec: "Bolt 500 XT / 3G-SDI+HDMI in · 500ft (no loop-out)",
    richSpec: {
      manufacturer: "Teradek", model: "Bolt 500 XT TX", category: "wireless_tx",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G", count: 1 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      outputs: [
        { type: "WIRELESS", count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "Older Bolt 500 XT generation. 500ft range.",
    },
    ports: [
      { type: "SDI",      direction: "in" },
      { type: "HDMI",     direction: "in" },
      { type: "WIRELESS", direction: "out" },
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
      { type: "WIRELESS", direction: "in" },
      { type: "SDI",      direction: "out" },
      { type: "SDI",      direction: "out" },
      { type: "HDMI",     direction: "out" },
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
        { type: "HDMI", standard: "1.4", count: 1 },
      ],
      outputs: [
        { type: "WIRELESS", count: 1 },
        { type: "HDMI", standard: "1.4", count: 1, loopThrough: true },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "HDMI 1.4b only (no SDI). 4K30 transmission. HDMI loop-through. 1300ft (400m).",
    },
    ports: [
      { type: "HDMI",     direction: "in" },
      { type: "HDMI",     direction: "out" },
      { type: "WIRELESS", direction: "out" },
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
      { type: "WIRELESS", direction: "in" },
      { type: "HDMI",     direction: "out" },
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
      { type: "SDI",      direction: "in" },
      { type: "HDMI",     direction: "in" },
      { type: "WIRELESS", direction: "out" },
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
      { type: "WIRELESS", direction: "in" },
      { type: "SDI",      direction: "out" },
      { type: "HDMI",     direction: "out" },
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
    spec: '7" / 2×3G-SDI+HDMI in · SDI loop out · HDMI out',
    richSpec: {
      manufacturer: "SmallHD", model: "Indie 7", category: "monitor",
      size: 7, resolution: "1920x1200", brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "SDI",  standard: "3G",  count: 2 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      powerConsumption: null, batteryMount: "Sony NP-F",
      notes: "SDI 2 = loop-through. HDMI out confirmed via Quick Start Guide port diagram (port K).",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
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
        { type: "SDI",  standard: "12G", count: 1 },
        { type: "SDI",  standard: "3G",  count: 3 },
        { type: "HDMI", standard: "2.0", count: 1 },
      ],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1, loopThrough: true },
        { type: "HDMI", standard: "2.0", count: 1, cleanFeed: true },
      ],
      powerConsumption: null, batteryMount: "V-mount",
      notes: "19\" HDR production monitor. SDI 1: 12G (4K single-link), SDI 2-4: 3G (Quad-link 4K / HD). Records to SSD.",
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

  // ── Blackmagic Design Converters ─────────────────────────────────────────

  bm_mini_conv_hdmi_sdi_6g: {
    name: "BM Mini Conv HDMI to SDI 6G",
    type: "converter",
    spec: "HDMI 2.0 in · 2×6G-SDI out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "Mini Converter HDMI to SDI 6G",
      category: "converter",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "HDMI", standard: "2.0", count: 1 }],
      outputs: [{ type: "SDI",  standard: "6G",  count: 2 }],
      powerConsumption: null, batteryMount: null,
      notes: "Converts HDMI to dual 6G-SDI. Supports SD/HD/Ultra HD up to 2160p30. W-CONM-27.",
    },
    ports: [
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  bm_mini_conv_sdi_hdmi_6g: {
    name: "BM Mini Conv SDI to HDMI 6G",
    type: "converter",
    spec: "6G-SDI in · HDMI out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "Mini Converter SDI to HDMI 6G",
      category: "converter",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "SDI",  standard: "6G",  count: 1 }],
      outputs: [{ type: "HDMI", standard: null,   count: 1 }],
      powerConsumption: null, batteryMount: null,
      notes: "Converts SD/HD/6G-SDI to HDMI. Secondary ALT SDI input for auto-failover. Source URL: blackmagicdesign.com/products/miniconverters/techspecs",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "out" },
    ],
  },

  bm_mini_conv_sdi_dist: {
    name: "BM Mini Conv SDI Distribution",
    type: "converter",
    spec: "3G-SDI in · 8×3G-SDI out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "Mini Converter SDI Distribution",
      category: "converter",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "SDI", standard: "3G", count: 1 }],
      outputs: [{ type: "SDI", standard: "3G", count: 8 }],
      powerConsumption: null, batteryMount: null,
      notes: "1 SD/HD/3G-SDI input distributed to 8 re-clocked outputs. SD/HD formats up to 1080p60. W-CONM-13.",
    },
    ports: [
      { type: "SDI", direction: "in" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
      { type: "SDI", direction: "out" },
    ],
  },

  bm_teranex_hdmi_sdi_12g: {
    name: "BM Teranex Mini HDMI to SDI 12G",
    type: "converter",
    spec: "HDMI 2.0 in · 2×12G-SDI out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "Teranex Mini HDMI to SDI 12G",
      category: "converter",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "HDMI", standard: "2.0", count: 1 }],
      outputs: [{ type: "SDI",  standard: "12G", count: 2 }],
      powerConsumption: null, batteryMount: null,
      notes: "Converts HDMI 2.0 (up to 2160p60) to dual 12G-SDI. Rack-mount, Ethernet control. Optional optical SFP. W-TERAMIN-02.",
    },
    ports: [
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  bm_teranex_sdi_hdmi_12g: {
    name: "BM Teranex Mini SDI to HDMI 12G",
    type: "converter",
    spec: "12G-SDI in · HDMI 2.0 out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "Teranex Mini SDI to HDMI 12G",
      category: "converter",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "SDI",  standard: "12G", count: 1 }],
      outputs: [{ type: "HDMI", standard: "2.0", count: 1 }],
      powerConsumption: null, batteryMount: null,
      notes: "Converts SD/HD/2K/4K 12G-SDI to HDMI 2.0 (up to 2160p60). Rack-mount, Ethernet control. Source URL: blackmagicdesign.com/products/teranexmini/techspecs",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Blackmagic Design Multiviewers ───────────────────────────────────────

  bm_multiview_4hd: {
    name: "BM MultiView 4 HD",
    type: "multiviewer",
    spec: "4×HD-SDI in · 1×HD-SDI + HDMI out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "MultiView 4 HD",
      category: "multiviewer",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "SDI", standard: "3G", count: 4 }],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "4×SD/HD-SDI to quad-split on 1 HDMI display. 1×HD-SDI multiview output. On-screen labels and audio meters. W-MVW-03. HDL-MULTIP3G/04HD.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  bm_multiview_4: {
    name: "BM MultiView 4",
    type: "multiviewer",
    spec: "4×6G-SDI in · 4×loop + 1×SDI + HDMI out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "MultiView 4",
      category: "multiviewer",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "SDI", standard: "6G", count: 4 }],
      outputs: [
        { type: "SDI",  standard: "6G",  count: 5 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "4×SD/HD/6G-SDI with 4 loop-through outputs + 1 HD/Ultra HD SDI program output + HDMI. W-MVW-02. HDL-MULTIP3G/04.",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  bm_multiview_16: {
    name: "BM MultiView 16",
    type: "multiviewer",
    spec: "16×6G-SDI in · 2×HD-SDI + 2×6G-SDI + HDMI out",
    richSpec: {
      manufacturer: "Blackmagic Design", model: "MultiView 16",
      category: "multiviewer",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "SDI", standard: "6G",  count: 16 }],
      outputs: [
        { type: "SDI",  standard: "6G",  count: 4 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "16×SD/HD/6G-SDI inputs. Multiview outputs: 2×HD-SDI + 2×6G-SDI + 1×HDMI. 2×2/3×3/4×4 grid or SOLO. Front-panel router controls.",
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
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

  // ── Decimator Design Converters ──────────────────────────────────────────

  decimator_md_hx: {
    name: "Decimator MD-HX",
    type: "converter",
    spec: "HDMI+SDI in · HDMI+4×SDI out / cross-convert",
    richSpec: {
      manufacturer: "Decimator Design", model: "MD-HX",
      category: "converter",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "HDMI", standard: null,  count: 1 },
        { type: "SDI",  standard: "3G",  count: 1 },
      ],
      outputs: [
        { type: "HDMI", standard: null,  count: 1 },
        { type: "SDI",  standard: "3G",  count: 4 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "Cross-converter with scaling and frame rate conversion. Outputs: 1×HDMI + 2×SDI loop-through + 2×SDI converted. Supports 3G Level A/B. Source URL: decimator.com/Products/MiniConverters/MD-HX/MD-HX.html",
    },
    ports: [
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  decimator_md_lx: {
    name: "Decimator MD-LX",
    type: "converter",
    spec: "HDMI+SDI in · HDMI+SDI out / bi-directional",
    richSpec: {
      manufacturer: "Decimator Design", model: "MD-LX",
      category: "converter",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs: [
        { type: "HDMI", standard: null,  count: 1 },
        { type: "SDI",  standard: "3G",  count: 1 },
      ],
      outputs: [
        { type: "HDMI", standard: null,  count: 1 },
        { type: "SDI",  standard: "3G",  count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "Bi-directional HDMI⇔SDI converter. Auto-routes single active input; simultaneous cross-conversion when both connected. Up to 1080p60. USB powered (under 2.5W). Source URL: decimator.com/Products/MiniConverters/MD-LX/MD-LX.html",
    },
    ports: [
      { type: "HDMI", direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  // ── Decimator Design Multiviewers ────────────────────────────────────────

  decimator_dmon_4s: {
    name: "Decimator DMON-4S",
    type: "multiviewer",
    spec: "4×3G-SDI in · 4×HDMI + SDI out",
    richSpec: {
      manufacturer: "Decimator Design", model: "DMON-4S",
      category: "multiviewer",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "SDI",  standard: "3G",  count: 4 }],
      outputs: [
        { type: "HDMI", standard: null,  count: 4 },
        { type: "SDI",  standard: "3G",  count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "Quad SDI→HDMI multiviewer. Each of 4 mini-HDMI outputs shows any input or quad-split. 1×SDI multiview output. Source URL: decimator.com/Products/MultiViewers/DMON-4S%20MultiViewer/DMON-4S.html",
    },
    ports: [
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "HDMI", direction: "out" },
      { type: "HDMI", direction: "out" },
      { type: "HDMI", direction: "out" },
      { type: "HDMI", direction: "out" },
      { type: "SDI",  direction: "out" },
    ],
  },

  decimator_dmon_16s: {
    name: "Decimator DMON-16S",
    type: "multiviewer",
    spec: "16×3G-SDI in · 1×SDI + HDMI out",
    richSpec: {
      manufacturer: "Decimator Design", model: "DMON-16S",
      category: "multiviewer",
      size: null, resolution: null, brightness: null, hdr: null, recorder: false,
      inputs:  [{ type: "SDI",  standard: "3G",  count: 16 }],
      outputs: [
        { type: "SDI",  standard: "3G",  count: 1 },
        { type: "HDMI", standard: null,  count: 1 },
      ],
      powerConsumption: null, batteryMount: null,
      notes: "16-channel SDI multiviewer. 1×3G-SDI + 1×HDMI output. Custom layout support. GPI tally. RS-422/485. Source URL: decimator.com/Products/MultiViewers/DMON-16S%20MultiViewer/DMON-16S.html",
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
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "in" },
      { type: "SDI",  direction: "out" },
      { type: "HDMI", direction: "out" },
    ],
  },

};

// ── Port utilities ────────────────────────────────────────────────────────────

/** Display label for port at template index.
 *  Multiple same-type/direction ports get a rank: "SDI IN 1", "SDI IN 2", etc.
 *  A single port of its kind has no number: "SDI IN", "HDMI OUT".
 */
export function portLabel(
  ports: ReadonlyArray<{ type: string; direction: string }>,
  idx: number,
): string {
  const port = ports[idx];
  if (!port) return `Port ${idx}`;
  const dir = port.direction === "in" ? "IN" : "OUT";
  let rank = 0, total = 0;
  for (let i = 0; i < ports.length; i++) {
    if (ports[i].type === port.type && ports[i].direction === port.direction) {
      total++;
      if (i <= idx) rank++;
    }
  }
  return total > 1 ? `${port.type} ${dir} ${rank}` : `${port.type} ${dir}`;
}

/** Non-WIRELESS input port options for a model (template indices). */
export function inputPortOptions(modelId: EquipmentModelId): { idx: number; label: string; type: string }[] {
  const tmpl = DB[modelId];
  if (!tmpl) return [];
  return tmpl.ports
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.direction === "in" && p.type !== "WIRELESS")
    .map(({ p, i }) => ({ idx: i, label: portLabel(tmpl.ports, i), type: p.type }));
}

/** Non-WIRELESS output port options for a model (template indices). */
export function outputPortOptions(modelId: EquipmentModelId): { idx: number; label: string; type: string }[] {
  const tmpl = DB[modelId];
  if (!tmpl) return [];
  return tmpl.ports
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.direction === "out" && p.type !== "WIRELESS")
    .map(({ p, i }) => ({ idx: i, label: portLabel(tmpl.ports, i), type: p.type }));
}

// ── Model lists ───────────────────────────────────────────────────────────

export const CONVERTER_MODELS: ConverterModelId[] = [
  "bm_mini_conv_hdmi_sdi_6g",
  "bm_mini_conv_sdi_hdmi_6g",
  "bm_mini_conv_sdi_dist",
  "bm_teranex_hdmi_sdi_12g",
  "bm_teranex_sdi_hdmi_12g",
  "decimator_md_hx",
  "decimator_md_lx",
];

export const MULTIVIEWER_MODELS: MultiviewerModelId[] = [
  "bm_multiview_4hd",
  "bm_multiview_4",
  "bm_multiview_16",
  "decimator_dmon_4s",
  "decimator_dmon_16s",
];

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
