import { z } from "zod";

export const ACSchema = z.preprocess(
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

export const SpeedSchema = z.preprocess(
  (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val; // If already normalized

    const speeds: { type: string; value: number; condition: string }[] = [];
    if (val.walk) speeds.push({ type: "walk", value: val.walk, condition: "" });
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

export const CRSchema = z.preprocess((val: any) => {
  if (typeof val === "string") return val; // If already normalized
  if (typeof val === "object" && val !== null) return val.cr || "0";
  return String(val || "0");
}, z.string());

export const TypeSchema = z.preprocess(
  (val: any) => {
    if (typeof val === "string") return { type: val, tags: [] };
    if (typeof val === "object" && val !== null) {
      // Already normalized check (it technically overlaps with unnormalized but ensures we don't break)
      return { type: val.type || "", tags: val.tags || [] };
    }
    return { type: "", tags: [] };
  },
  z.object({ type: z.string(), tags: z.array(z.string()) }),
);

export const MonsterSchema = z
  .object({
    name: z.string(),
    ac: ACSchema.optional(),
    speed: SpeedSchema.optional(),
    cr: CRSchema.optional(),
    type: TypeSchema.optional(),
    // Ensure we keep the rest intact so other components that rely on them don't break
  })
  .passthrough();
