const DATA_DIR = "/data";

export async function fetchBestiary(): Promise<Map<string, object>> {
  try {
    const response = await fetch(`${DATA_DIR}/bestiary.json`);
    if (!response.ok) {
      console.warn("Failed to fetch bestiary");
      return new Map();
    }
    const results = await response.json();
    const monsterData = results?.monster?.reduce(
      (accumulator: any, value: any) => {
        accumulator.set(value.name.toLowerCase(), value);
        return accumulator;
      },
      new Map(),
    );

    console.log(
      "Bestiary loaded:",
      monsterData.size,
      "monsters from default bestiary",
    );
    return monsterData;
  } catch (error) {
    console.error("Failed to fetch bestiary:", error);
  }
  return new Map();
}
