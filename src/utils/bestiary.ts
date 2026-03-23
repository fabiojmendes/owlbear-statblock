const DATA_DIR = "/data";

export async function fetchBestiary(): Promise<Map<string, any>> {
  try {
    const response = await fetch(`${DATA_DIR}/bestiary.json`);
    if (!response.ok) {
      console.warn("Failed to fetch bestiary");
      return new Map();
    }
    const results = await response.json();
    const monsterData = new Map<string, any>(
      results.map((m: any) => [m.name.toLowerCase(), m]),
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
