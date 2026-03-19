import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BESTIARY_PATH = path.join(__dirname, "../public/data/bestiary.json");

async function scrapeDndBeyond() {
  const dictionary = {};

  for (let page = 1; page <= 17; page++) {
    console.log(`Fetching page ${page}...`);
    const url = `https://www.dndbeyond.com/monsters?filter-source=148&page=${page}`;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!response.ok) {
        console.error(
          `Failed to fetch page ${page}: ${response.status} ${response.statusText}`,
        );
        continue;
      }
      const html = await response.text();

      const blockRegex = /<div class="row monster-name">([\s\S]*?)<\/div>/g;
      const linkRegex = /<a class="link" href="([^"]+)"[^>]*>([^<]+)<\/a>/;

      let blockMatch;
      while ((blockMatch = blockRegex.exec(html)) !== null) {
        const blockHtml = blockMatch[1];
        const linkMatch = linkRegex.exec(blockHtml);
        if (linkMatch) {
          const href = linkMatch[1];
          const name = linkMatch[2].trim();
          dictionary[name.toLowerCase()] = `https://www.dndbeyond.com${href}`;
        }
      }

      // Be nice to the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (e) {
      console.error(`Error fetching page ${page}:`, e);
    }
  }

  console.log(
    `Scraped ${Object.keys(dictionary).length} monsters from D&D Beyond.`,
  );

  console.log("Updating bestiary.json...");
  const bestiaryRaw = fs.readFileSync(BESTIARY_PATH, "utf8");
  const bestiary = JSON.parse(bestiaryRaw);

  let updateCount = 0;
  if (Array.isArray(bestiary.monster)) {
    for (const monster of bestiary.monster) {
      const lowerName = monster.name.toLowerCase();
      if (dictionary[lowerName]) {
        monster.externalLink = dictionary[lowerName];
        updateCount++;
      }
    }
  }

  fs.writeFileSync(BESTIARY_PATH, JSON.stringify(bestiary, null, 2), "utf8");
  console.log(
    `Updated ${updateCount} monsters in bestiary.json with external links.`,
  );
}

scrapeDndBeyond();
