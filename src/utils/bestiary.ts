const DATA_DIR = "/data/";
const INDEX_FILE = "index.json";

export async function fetchBestiary(): Promise<Map<string, object>> {
  try {
    const indexResponse = await fetch(`${DATA_DIR}${INDEX_FILE}`);
    if (!indexResponse.ok) {
      throw new Error(`Failed to load index from ${DATA_DIR}${INDEX_FILE}`);
    }
    const indexData: string[] = await indexResponse.json();

    const fetchPromises = indexData.map(async (fileName) => {
      try {
        const response = await fetch(`${DATA_DIR}${fileName}`);
        if (!response.ok) {
          console.warn(`Failed to fetch ${fileName}`);
          return [];
        }
        const data = await response.json();
        return data.monster || [];
      } catch (error) {
        console.error(`Error loading ${fileName}:`, error);
        return [];
      }
    });

    const results = (await Promise.all(fetchPromises)).flat();
    const monsterData = results.reduce((accumulator, value) => {
      accumulator.set(value.name.toLowerCase(), value);
      return accumulator;
    }, new Map());

    console.log(
      "Bestiary loaded:",
      monsterData.size,
      "monsters from",
      indexData.length,
      "files",
    );
    return monsterData;
  } catch (error) {
    console.error("Failed to fetch bestiary:", error);
  }
  return new Map();
}
