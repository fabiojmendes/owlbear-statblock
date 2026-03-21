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
    const config = modConfig as any;
    if (config?.mode) {
      switch (config.mode) {
        case "appendArr":
          if (Array.isArray(base[prop])) {
            if (Array.isArray(config.items)) {
              base[prop].push(...config.items);
            } else {
              base[prop].push(config.items);
            }
          } else {
            // If it doesn't exist or isn't an array, just set it
            base[prop] = Array.isArray(config.items)
              ? [...config.items]
              : [config.items];
          }
          break;
        case "replaceArr":
          base[prop] = Array.isArray(config.items)
            ? [...config.items]
            : [config.items];
          break;
        case "removeArr":
          if (Array.isArray(base[prop])) {
            const itemsToRemove = Array.isArray(config.items)
              ? config.items
              : [config.items];
            base[prop] = base[prop].filter((item: any) => {
              // Basic matching. Usually removed by name.
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
          if (typeof base[prop] === "number") {
            base[prop] += Number(config.scalar) || 0;
          }
          break;
        case "scalarMult":
          if (typeof base[prop] === "number") {
            base[prop] *= Number(config.scalar) || 1;
          }
          break;
        default:
          console.warn(`Unsupported _mod mode: ${config.mode}`);
      }
    }
  }
}
