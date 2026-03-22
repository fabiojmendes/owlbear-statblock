export async function resolveMonster(
  monster: any,
  getMonsterByName: (name: string) => Promise<any | undefined>,
): Promise<any> {
  if (!monster || typeof monster !== "object" || !monster._copy) {
    return monster;
  }

  const copyMeta = monster._copy;
  const baseName = copyMeta.name;
  const baseMonster = await getMonsterByName(baseName);

  if (!baseMonster) {
    console.warn(`Base monster '${baseName}' not found for copy resolution.`);
    return monster;
  }

  // Handle source matching (e.g. MM falls back to XMM)
  if (copyMeta.source && baseMonster.source) {
    const requiredSource = copyMeta.source;
    const actualSource = baseMonster.source;

    if (
      requiredSource !== actualSource &&
      actualSource !== `X${requiredSource}`
    ) {
      // Strict match failed and it's not the X-prefixed version.
      console.warn(
        `Source mismatch for '${baseName}'. Expected ${requiredSource}, found ${actualSource}`,
      );
      // Continuing anyway because we don't have multi-source keyed maps yet.
    }
  }

  // Deep clone to avoid mutating the original reference
  let resolvedBase = JSON.parse(JSON.stringify(baseMonster));

  // Recursively resolve if the base monster also has a _copy
  resolvedBase = await resolveMonster(resolvedBase, getMonsterByName);

  // Apply _mod modifications
  if (copyMeta._mod) {
    applyMods(resolvedBase, copyMeta._mod);
  }

  // Merge the referring monster's properties OVER the base monster's properties
  // The referring monster's top-level properties always take precedence, except for _copy which we can omit.
  const finalMonster = { ...resolvedBase };

  for (const [key, value] of Object.entries(monster)) {
    if (key === "_copy") continue; // We've already processed this
    finalMonster[key] = value;
  }

  return finalMonster;
}

function applyMods(base: any, mods: any) {
  if (!mods || typeof mods !== "object") return;

  for (const [prop, modConfig] of Object.entries(mods)) {
    const targets = prop === "*" ? Object.keys(base) : [prop];
    const configs = Array.isArray(modConfig) ? modConfig : [modConfig];

    for (const target of targets) {
      for (const config of configs) {
        if (config?.mode) {
          switch (config.mode) {
            case "appendArr":
              if (Array.isArray(base[target])) {
                if (Array.isArray(config.items)) {
                  base[target].push(...config.items);
                } else {
                  base[target].push(config.items);
                }
              } else {
                base[target] = Array.isArray(config.items)
                  ? [...config.items]
                  : [config.items];
              }
              break;
            case "replaceArr":
              base[target] = Array.isArray(config.items)
                ? [...config.items]
                : [config.items];
              break;
            case "removeArr":
              if (Array.isArray(base[target])) {
                const itemsToRemove = Array.isArray(config.items)
                  ? config.items
                  : [config.items];
                base[target] = base[target].filter((item: any) => {
                  const nameToMatch =
                    typeof item === "object" && item.name ? item.name : item;
                  return !itemsToRemove.some((toRemove: any) => {
                    const removeName =
                      typeof toRemove === "object" && toRemove.name
                        ? toRemove.name
                        : toRemove;
                    return nameToMatch === removeName;
                  });
                });
              }
              break;
            case "scalarAdd":
              if (typeof base[target] === "number") {
                base[target] += Number(config.scalar) || 0;
              }
              break;
            case "scalarMult":
              if (typeof base[target] === "number") {
                base[target] *= Number(config.scalar) || 1;
              }
              break;
            case "replaceTxt":
              if (config.replace !== undefined && config.with !== undefined) {
                base[target] = recursiveReplace(
                  base[target],
                  config.replace,
                  config.with,
                  config.flags,
                );
              }
              break;
            default:
              console.warn(`Unsupported _mod mode: ${config.mode}`);
          }
        }
      }
    }
  }
}

function recursiveReplace(
  obj: any,
  replace: string,
  withStr: string,
  flags?: string,
): any {
  if (typeof obj === "string") {
    // Escape regex special characters if we want literal match,
    // but regex patterns are often expected.
    try {
      const regex = new RegExp(replace, flags || "g");
      return obj.replace(regex, withStr);
    } catch (e) {
      console.warn(`Invalid regex in replaceTxt: ${replace}`, e);
      return obj;
    }
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => recursiveReplace(item, replace, withStr, flags));
  }
  if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = recursiveReplace(value, replace, withStr, flags);
    }
    return newObj;
  }
  return obj;
}
