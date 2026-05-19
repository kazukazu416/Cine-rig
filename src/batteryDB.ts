// ── Battery types ─────────────────────────────────────────────────────────────

export type BatteryType = "V-mount" | "Gold-mount" | "NP-F" | "BP-U";

export interface Battery {
  id: string;
  manufacturer: string;
  model: string;
  type: BatteryType;
  capacity: number;    // Wh
  voltage: number;     // V（nominal）
  maxLoad?: number;    // A（max continuous discharge current）
  airSafe: boolean;    // true = capacity ≤ 160Wh（IATA limit without special approval）
  dtap: boolean;       // D-Tap (P-Tap) 出力あり
  notes?: string;
}

// ── IDX V-mount ──────────────────────────────────────────────────────────────

export const BATTERY_DB: Record<string, Battery> = {

  // ── IDX DUO-CP series ────────────────────────────────────────────────────

  idx_duo_c98: {
    id:           "idx_duo_c98",
    manufacturer: "IDX",
    model:        "DUO-C98",
    type:         "V-mount",
    capacity:     96,
    voltage:      14.4,
    airSafe:      true,   // 96 Wh ≤ 160 Wh
    dtap:         true,
    notes:        "DUO-CP series. 96Wh / 14.4V. D-Tap出力あり。Source: idx.co.jp/products/batteries/duo-cp-series/",
  },

  idx_duo_c150: {
    id:           "idx_duo_c150",
    manufacturer: "IDX",
    model:        "DUO-C150",
    type:         "V-mount",
    capacity:     143,
    voltage:      14.4,
    airSafe:      true,   // 143 Wh ≤ 160 Wh
    dtap:         true,
    notes:        "DUO-CP series. 143Wh / 14.4V. D-Tap出力あり。Source: idx.co.jp/products/batteries/duo-cp-series/",
  },

  idx_duo_c198p: {
    id:           "idx_duo_c198p",
    manufacturer: "IDX",
    model:        "DUO-C198P",
    type:         "V-mount",
    capacity:     193,
    voltage:      14.4,
    airSafe:      false,  // 193 Wh > 160 Wh → 航空会社個別承認が必要
    dtap:         true,
    notes:        "DUO-CP series. 193Wh / 14.4V. 160Wh超のため航空機内持ち込みは航空会社承認要。D-Tap出力あり。Source: idx.co.jp/products/batteries/duo-cp-series/",
  },

  // ── IDX ImicroPD series ──────────────────────────────────────────────────

  idx_imicro_50p: {
    id:           "idx_imicro_50p",
    manufacturer: "IDX",
    model:        "IMICRO-50P",
    type:         "V-mount",
    capacity:     47,
    voltage:      14.4,
    airSafe:      true,   // 47 Wh ≤ 160 Wh
    dtap:         false,
    notes:        "ImicroPD series. 47Wh / 14.4V. USB-C PD出力あり、D-Tapなし。Source: idx.co.jp/products/batteries/imicropd-series/",
  },

  idx_imicro_98p: {
    id:           "idx_imicro_98p",
    manufacturer: "IDX",
    model:        "IMICRO-98P",
    type:         "V-mount",
    capacity:     97,
    voltage:      14.4,
    airSafe:      true,   // 97 Wh ≤ 160 Wh
    dtap:         false,
    notes:        "ImicroPD series. 97Wh / 14.4V. USB-C PD出力あり、D-Tapなし。Source: idx.co.jp/products/batteries/imicropd-series/",
  },

  idx_imicro_150p: {
    id:           "idx_imicro_150p",
    manufacturer: "IDX",
    model:        "IMICRO-150P",
    type:         "V-mount",
    capacity:     145,
    voltage:      14.4,
    airSafe:      true,   // 145 Wh ≤ 160 Wh
    dtap:         false,
    notes:        "ImicroPD series. 145Wh / 14.4V. USB-C PD出力あり、D-Tapなし。Source: idx.co.jp/products/batteries/imicropd-series/",
  },

};

// ── Exports ───────────────────────────────────────────────────────────────────

export const BATTERY_IDS = Object.keys(BATTERY_DB);

export const BATTERY_GROUPS: { manufacturer: string; ids: string[] }[] = [
  {
    manufacturer: "IDX",
    ids: [
      "idx_duo_c98",
      "idx_duo_c150",
      "idx_duo_c198p",
      "idx_imicro_50p",
      "idx_imicro_98p",
      "idx_imicro_150p",
    ],
  },
];
