import { type DBSchema, openDB } from "idb";

export interface Pack {
  id: string;
  name: string;
  importedAt: number;
  monsterCount: number;
}

export interface MonsterRecord {
  id: string;
  packId: string;
  name: string;
  [key: string]: any;
}

interface BestiaryDB extends DBSchema {
  packs: {
    key: string;
    value: Pack;
  };
  monsters: {
    key: string;
    value: MonsterRecord;
    indexes: { "by-packId": string };
  };
}

const DB_NAME = "bestiary-db";
const DB_VERSION = 1;

export async function initDB() {
  return openDB<BestiaryDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("packs")) {
        db.createObjectStore("packs", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("monsters")) {
        const monsterStore = db.createObjectStore("monsters", {
          keyPath: "id",
        });
        monsterStore.createIndex("by-packId", "packId");
      }
    },
  });
}

export async function addPack(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text);

  let monstersArray = [];
  if (Array.isArray(data)) {
    monstersArray = data;
  } else if (data.monster && Array.isArray(data.monster)) {
    monstersArray = data.monster;
  } else {
    throw new Error("Invalid monster file format");
  }

  const db = await initDB();
  const tx = db.transaction(["packs", "monsters"], "readwrite");

  const packId = crypto.randomUUID();
  const pack: Pack = {
    id: packId,
    name: file.name,
    importedAt: Date.now(),
    monsterCount: monstersArray.length,
  };

  await tx.objectStore("packs").put(pack);

  const monsterStore = tx.objectStore("monsters");
  for (const monster of monstersArray) {
    if (monster.name) {
      await monsterStore.put({
        ...monster,
        id: monster.name.toLowerCase(),
        packId,
      });
    }
  }

  await tx.done;
}

export async function getPackMonsters(packId: string): Promise<string[]> {
  const db = await initDB();
  const index = db.transaction("monsters").store.index("by-packId");
  const monsters = await index.getAll(packId);
  return monsters.map((m) => m.name).sort();
}

export async function removePack(packId: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(["packs", "monsters"], "readwrite");

  await tx.objectStore("packs").delete(packId);

  const monsterStore = tx.objectStore("monsters");
  const index = monsterStore.index("by-packId");
  let cursor = await index.openCursor(packId);

  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  await tx.done;
}

export async function getPacks(): Promise<Pack[]> {
  const db = await initDB();
  return db.getAll("packs");
}

export async function getCustomMonster(name: string): Promise<any | undefined> {
  const db = await initDB();
  return db.get("monsters", name.toLowerCase());
}
