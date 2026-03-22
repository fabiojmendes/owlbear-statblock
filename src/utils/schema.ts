import { z } from "zod";

const ACSchema = z.preprocess(
  (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map((item) => {
        // If already normalized
        if (
          typeof item === "object" &&
          "value" in item &&
          typeof item.value === "number"
        ) {
          return item;
        }
        if (typeof item === "number") return { value: item, details: "" };
        if (typeof item === "object") {
          let details = "";
          if (item.from) details += ` (${item.from.join(", ")})`;
          if (item.condition) details += ` ${item.condition}`;
          return { value: item.ac || 0, details: details.trim() };
        }
        return { value: 0, details: "" };
      });
    }
    return [{ value: Number(val), details: "" }];
  },
  z.array(z.object({ value: z.number(), details: z.string() })),
);

const SpeedSchema = z.preprocess(
  (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val; // If already normalized

    const speeds: { type: string; value: number; condition: string }[] = [];
    if (val.walk) {
      if (typeof val.walk === "number") {
        speeds.push({ type: "walk", value: val.walk, condition: "" });
      } else if (typeof val.walk === "object" && val.walk !== null) {
        speeds.push({
          type: "walk",
          value: val.walk.number || 0,
          condition: val.walk.condition || "",
        });
      }
    }
    for (const [key, v] of Object.entries(val)) {
      if (key === "walk" || key === "canHover") continue;
      if (typeof v === "number") {
        speeds.push({ type: key, value: v, condition: "" });
      } else if (typeof v === "object" && v !== null) {
        speeds.push({
          type: key,
          value: (v as any).number || 0,
          condition: (v as any).condition || "",
        });
      }
    }
    return speeds;
  },
  z.array(
    z.object({ type: z.string(), value: z.number(), condition: z.string() }),
  ),
);

const CRSchema = z.preprocess((val: any) => {
  if (typeof val === "string") return val; // If already normalized
  if (typeof val === "object" && val !== null) return val.cr || "0";
  return String(val || "0");
}, z.string());

const TypeSchema = z.preprocess(
  (val: any) => {
    if (typeof val === "string") return { type: val, tags: [] };
    if (typeof val === "object" && val !== null) {
      // Already normalized check (it technically overlaps with unnormalized but ensures we don't break)
      let resolvedType = val.type || "";
      if (typeof val.type === "object" && val.type.choose) {
        resolvedType = val.type.choose.join(" or ");
      }
      const tags = (val.tags || []).map((t: any) =>
        typeof t === "string" ? t : t.tag,
      );
      return { type: resolvedType, tags };
    }
    return { type: "", tags: [] };
  },
  z.object({ type: z.string(), tags: z.array(z.string()) }),
);

const AlignmentSchema = z.preprocess((val: any) => {
  if (!val || !Array.isArray(val)) return [];
  return val.flatMap((item) => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null && item.alignment) {
      return item.alignment;
    }
    return [];
  });
}, z.array(z.string()));

// Helper to normalize arrays of strings that might contain complex objects with notes
const normalizeResistances = z.preprocess((val: any) => {
  if (!val || !Array.isArray(val)) return undefined;
  const result: string[] = [];
  for (const item of val) {
    if (typeof item === "string") {
      result.push(item);
    } else if (typeof item === "object" && item !== null) {
      // These objects typically have the key as the property name (resist, immune, conditionImmune)
      // and an array of strings, plus an optional 'note'. We flatten this into strings for simple display.
      const keys = ["resist", "immune", "conditionImmune", "vulnerable"];
      for (const key of keys) {
        if (Array.isArray(item[key])) {
          const baseStr = item[key].join(", ");
          if (item.note) {
            result.push(`${baseStr} ${item.note}`);
          } else {
            result.push(baseStr);
          }
        }
      }
    }
  }
  return result.length > 0 ? result : undefined;
}, z.array(z.string()).optional());

const normalizeSaves = z.preprocess(
  (val: number | string) => Number(val),
  z.number(),
);

export const MonsterSchema = z
  .object({
    name: z.string(),
    ac: ACSchema,
    speed: SpeedSchema,
    cr: CRSchema,
    type: TypeSchema,
    size: z.array(z.string()),
    alignment: AlignmentSchema,
    hp: z.object({
      average: z.number(),
      formula: z.string(),
    }),
    str: z.number(),
    dex: z.number(),
    con: z.number(),
    int: z.number(),
    wis: z.number(),
    cha: z.number(),
    passive: z.number(),
    externalLink: z.string().optional(),
    alignmentPrefix: z.string().optional(),
    save: z.record(z.string(), normalizeSaves).optional(),
    skill: z.record(z.string(), z.string()).optional(),
    vulnerable: normalizeResistances,
    resist: normalizeResistances,
    immune: normalizeResistances,
    conditionImmune: normalizeResistances,
    senses: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    trait: z.array(z.any()).optional(),
    action: z.array(z.any()).optional(),
    bonus: z.array(z.any()).optional(),
    reaction: z.array(z.any()).optional(),
    legendary: z.array(z.any()).optional(),
    spellcasting: z.array(z.any()).optional(),
    legendaryActions: z.number().optional(),
    legendaryActionsLair: z.number().optional(),
    initiative: z.any().optional(),
  })
  .transform((monster) => {
    // 1. Calculate PB
    let numericCr = 0;
    if (monster.cr.includes("/")) {
      const [num, den] = monster.cr.split("/").map(Number);
      numericCr = num / den;
    } else {
      numericCr = Number(monster.cr) || 0;
    }
    const pb = Math.floor((Math.max(1, numericCr) - 1) / 4) + 2;

    // 2. Calculate Initiative & Passive Initiative
    const dexMod = Math.floor((monster.dex - 10) / 2);
    let initBonus = dexMod;
    let advDisMod = 0;

    if (typeof monster.initiative === "number") {
      initBonus = monster.initiative;
    } else if (
      typeof monster.initiative === "object" &&
      monster.initiative !== null
    ) {
      if (typeof monster.initiative.initiative === "number") {
        initBonus = monster.initiative.initiative;
      } else {
        const profBonus =
          monster.initiative.proficiency && numericCr < 100
            ? monster.initiative.proficiency * pb
            : 0;
        initBonus = dexMod + profBonus;
      }
      if (monster.initiative.advantageMode === "adv") advDisMod = 5;
      else if (monster.initiative.advantageMode === "dis") advDisMod = -5;
    }
    const passiveInit = 10 + initBonus + advDisMod;

    // 3. Format Size
    const sizeMap: Record<string, string> = {
      T: "Tiny",
      S: "Small",
      M: "Medium",
      L: "Large",
      H: "Huge",
      G: "Gargantuan",
    };
    const formattedSize = monster.size.map((s) => sizeMap[s] || s).join(" or ");

    // 4. Format Alignment
    const alignmentMap: Record<string, string> = {
      L: "lawful",
      C: "chaotic",
      N: "neutral",
      G: "good",
      E: "evil",
      A: "any alignment",
      U: "unaligned",
    };
    let formattedAlignment = "";
    if (
      monster.alignment.length === 1 &&
      (monster.alignment[0] === "A" || monster.alignment[0] === "U")
    ) {
      formattedAlignment = alignmentMap[monster.alignment[0]];
    } else {
      formattedAlignment = monster.alignment
        .map((a) => alignmentMap[a] || a)
        .join(" ");
    }

    return {
      ...monster,
      pb,
      initBonus,
      passiveInit,
      formattedSize,
      formattedAlignment,
    };
  });

export type Monster = z.infer<typeof MonsterSchema>;
export type AC = z.infer<typeof ACSchema>;
export type Speed = z.infer<typeof SpeedSchema>;
