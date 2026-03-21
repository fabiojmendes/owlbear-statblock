import * as fs from "node:fs";
import * as path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { resolveMonster } from "../src/utils/copy";
import { MonsterSchema } from "../src/utils/schema";

describe("Bestiary JSON Integration Test", () => {
  const allMonsters: Map<string, any> = new Map();
  let rawMonsters: any[] = [];

  beforeAll(() => {
    const dataDir = path.join(__dirname, "../public/data");
    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");

      try {
        const data = JSON.parse(fileContent);
        const fileMonsters = data.monster || [];
        rawMonsters = rawMonsters.concat(fileMonsters);
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e);
      }
    }

    // Create the lookup map (similar to how IDB + bestiary works)
    for (const monster of rawMonsters) {
      if (monster?.name) {
        // Prefer specific source resolution if needed, but for now we key by name.toLowerCase()
        allMonsters.set(monster.name.toLowerCase(), monster);
      }
    }
  });

  it("should successfully parse and validate all monsters", async () => {
    // Mock the getMonsterByName function that the runtime uses
    const mockGetMonsterByName = async (name: string) => {
      return allMonsters.get(name.toLowerCase());
    };

    let passedCount = 0;
    const errors: any[] = [];

    for (const rawMonster of rawMonsters) {
      try {
        // Apply the same preprocessing step as the runtime
        const resolved = await resolveMonster(rawMonster, mockGetMonsterByName);

        // Validate against the Zod schema
        MonsterSchema.parse(resolved);
        passedCount++;
      } catch (e) {
        errors.push({ name: rawMonster.name, error: e });
      }
    }

    // Output failing monsters for debugging
    if (errors.length > 0) {
      console.error(
        `Failed to validate ${errors.length} out of ${rawMonsters.length} monsters.`,
      );
      console.error(
        errors
          .slice(0, 5)
          .map((e) => `Name: ${e.name}, Error: ${e.error.message || e.error}`),
      );
    }

    expect(errors.length).toBe(0);
    expect(passedCount).toBe(rawMonsters.length);
  });
});
