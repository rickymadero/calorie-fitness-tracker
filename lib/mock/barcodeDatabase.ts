import type { FoodItem } from "@/lib/types";
import { FOODS } from "@/lib/mock/data";

export type BarcodeProduct = FoodItem & {
  barcode: string;
  aliases?: string[];
  verified?: boolean;
  source?: string;
};

function food(
  barcode: string,
  id: string,
  extras?: Partial<BarcodeProduct>,
): BarcodeProduct {
  const base = FOODS.find((f) => f.id === id);
  if (!base) {
    throw new Error(`Missing food id ${id} for barcode ${barcode}`);
  }
  return {
    ...base,
    barcode,
    verified: true,
    source: base.brand ? `${base.brand} label` : "Product database",
    ...extras,
  };
}

/** Demo UPC / EAN catalog for Pro barcode scanning. */
export const BARCODE_CATALOG: BarcodeProduct[] = [
  food("0049000006346", "f3", {
    name: "Banana",
    aliases: ["fresh banana"],
    source: "Produce PLU lookup",
  }),
  food("0030000012345", "f2", {
    barcode: "0030000012345",
    aliases: ["fage yogurt", "greek yogurt"],
  }),
  food("0030000056789", "f4", {
    aliases: ["quaker oats", "oatmeal"],
  }),
  food("0028400312313", "ff50", {
    aliases: ["doritos", "nacho cheese chips"],
  }),
  {
    id: "bc1",
    barcode: "0049000055102",
    name: "Coca-Cola Classic",
    brand: "Coca-Cola",
    calories: 140,
    protein: 0,
    carbs: 39,
    fat: 0,
    serving: "12 fl oz can",
    category: "drink",
    verified: true,
    source: "Coca-Cola nutrition label",
    aliases: ["coke", "soda"],
  },
  {
    id: "bc2",
    barcode: "0028400043218",
    name: "Lay's Classic Potato Chips",
    brand: "Lay's",
    calories: 160,
    protein: 2,
    carbs: 15,
    fat: 10,
    serving: "1 oz (28g)",
    category: "snack",
    verified: true,
    source: "Frito-Lay label",
  },
  {
    id: "bc3",
    barcode: "0028400375216",
    name: "Cheetos Crunchy",
    brand: "Cheetos",
    calories: 160,
    protein: 2,
    carbs: 15,
    fat: 10,
    serving: "1 oz bag",
    category: "snack",
    verified: true,
  },
  {
    id: "bc4",
    barcode: "0016000490385",
    name: "Nature Valley Crunchy Oats 'n Honey",
    brand: "Nature Valley",
    calories: 190,
    protein: 3,
    carbs: 29,
    fat: 7,
    serving: "2 bars (42g)",
    category: "snack",
    verified: true,
  },
  {
    id: "bc5",
    barcode: "0038000217604",
    name: "Kellogg's Frosted Flakes",
    brand: "Kellogg's",
    calories: 130,
    protein: 2,
    carbs: 33,
    fat: 0,
    serving: "1 cup (37g)",
    category: "grocery",
    verified: true,
  },
  {
    id: "bc6",
    barcode: "0021000065516",
    name: "Kraft Macaroni & Cheese Dinner",
    brand: "Kraft",
    calories: 370,
    protein: 9,
    carbs: 48,
    fat: 16,
    serving: "1 prepared cup",
    category: "grocery",
    verified: true,
    aliases: ["kraft mac", "mac and cheese"],
  },
  {
    id: "bc7",
    barcode: "0036800412340",
    name: "Clif Bar Chocolate Chip",
    brand: "Clif Bar",
    calories: 250,
    protein: 9,
    carbs: 44,
    fat: 5,
    serving: "1 bar (68g)",
    category: "snack",
    verified: true,
  },
  {
    id: "bc8",
    barcode: "0072410110019",
    name: "Premier Protein Shake Chocolate",
    brand: "Premier Protein",
    calories: 160,
    protein: 30,
    carbs: 5,
    fat: 3,
    serving: "11 fl oz shake",
    category: "drink",
    verified: true,
    aliases: ["protein shake"],
  },
  {
    id: "bc9",
    barcode: "0042225003451",
    name: "Halo Top Vanilla Bean",
    brand: "Halo Top",
    calories: 280,
    protein: 20,
    carbs: 36,
    fat: 8,
    serving: "1 pint",
    category: "snack",
    verified: true,
  },
  {
    id: "bc10",
    barcode: "0072252543006",
    name: "Quest Bar Cookies & Cream",
    brand: "Quest",
    calories: 190,
    protein: 21,
    carbs: 22,
    fat: 8,
    serving: "1 bar (60g)",
    category: "snack",
    verified: true,
  },
  {
    id: "bc11",
    barcode: "0036000112456",
    name: "Fairlife Core Power Chocolate",
    brand: "Fairlife",
    calories: 170,
    protein: 26,
    carbs: 8,
    fat: 4.5,
    serving: "14 fl oz",
    category: "drink",
    verified: true,
  },
  {
    id: "bc12",
    barcode: "0011110868200",
    name: "Store Brand Whole Milk",
    brand: "Generic",
    calories: 150,
    protein: 8,
    carbs: 12,
    fat: 8,
    serving: "1 cup (240ml)",
    category: "grocery",
    verified: true,
  },
  {
    id: "bc13",
    barcode: "0041271023456",
    name: "Eggs (Large Grade A)",
    brand: "Generic",
    calories: 70,
    protein: 6,
    carbs: 0.5,
    fat: 5,
    serving: "1 large egg",
    category: "grocery",
    verified: true,
  },
  {
    id: "bc14",
    barcode: "0025000056781",
    name: "Gatorade Thirst Quencher Blue",
    brand: "Gatorade",
    calories: 140,
    protein: 0,
    carbs: 34,
    fat: 0,
    serving: "20 fl oz bottle",
    category: "drink",
    verified: true,
  },
  {
    id: "bc15",
    barcode: "0034000521459",
    name: "Reese's Peanut Butter Cups",
    brand: "Reese's",
    calories: 210,
    protein: 5,
    carbs: 24,
    fat: 13,
    serving: "2 cups (42g)",
    category: "snack",
    verified: true,
  },
  // Map popular restaurant packs / freezer items from existing FOODS
  food("0072180632780", "ff35", {
    aliases: ["digiorno", "frozen pizza"],
  }),
  food("0072180645123", "ff32", {
    aliases: ["hot pocket pepperoni"],
  }),
  food("0070790901234", "ff34", {
    aliases: ["cup noodles", "ramen"],
  }),
  food("0052100011110", "f8", {
    aliases: ["whey protein", "protein powder"],
  }),
  food("0085210004455", "ff1", {
    name: "Pepperoni Pizza Slice (takeout box)",
    brand: "Domino's",
    aliases: ["pizza slice"],
    source: "Restaurant estimate",
  }),
];

export function normalizeBarcode(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function lookupBarcode(code: string): BarcodeProduct | null {
  const normalized = normalizeBarcode(code);
  if (!normalized) return null;
  return (
    BARCODE_CATALOG.find(
      (item) =>
        normalizeBarcode(item.barcode) === normalized ||
        normalizeBarcode(item.barcode).endsWith(normalized) ||
        normalized.endsWith(normalizeBarcode(item.barcode)),
    ) ?? null
  );
}

export function searchBarcodeCatalog(query: string): BarcodeProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return BARCODE_CATALOG.slice(0, 8);
  return BARCODE_CATALOG.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q) ||
      item.aliases?.some((a) => a.includes(q)) ||
      item.barcode.includes(q),
  ).slice(0, 12);
}

export const DEMO_BARCODES = BARCODE_CATALOG.slice(0, 6).map((item) => ({
  code: item.barcode,
  label: `${item.brand ? item.brand + " · " : ""}${item.name}`,
}));

export type ScanHistoryEntry = {
  id: string;
  barcode: string;
  foodId: string;
  name: string;
  brand?: string;
  calories: number;
  scannedAt: string;
};

const HISTORY_KEY = "evolve.scanHistory";

export function loadScanHistory(): ScanHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ScanHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function pushScanHistory(product: BarcodeProduct): ScanHistoryEntry[] {
  const entry: ScanHistoryEntry = {
    id: crypto.randomUUID(),
    barcode: product.barcode,
    foodId: product.id,
    name: product.name,
    brand: product.brand,
    calories: product.calories,
    scannedAt: new Date().toISOString(),
  };
  const next = [entry, ...loadScanHistory().filter((h) => h.barcode !== product.barcode)].slice(
    0,
    12,
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function scaleFood(
  food: FoodItem,
  servings: number,
): FoodItem {
  const factor = Math.max(0.01, servings);
  const round1 = (n: number) => Math.round(n * factor * 10) / 10;
  return {
    ...food,
    calories: Math.round(food.calories * factor),
    protein: round1(food.protein),
    carbs: round1(food.carbs),
    fat: round1(food.fat),
    fiber: food.fiber != null ? round1(food.fiber) : undefined,
    sodium: food.sodium != null ? Math.round(food.sodium * factor) : undefined,
    serving:
      Math.abs(factor - 1) < 0.001
        ? food.serving
        : `${Number(factor.toFixed(2))} × ${food.serving}`,
  };
}
