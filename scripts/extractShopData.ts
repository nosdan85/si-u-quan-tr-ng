import fs from "fs";
import path from "path";

type AnyObj = Record<string, any>;

function extractShopDataExpr(content: string): string | null {
  // Match: const SHOP_DATA = ...;
  // Works even if ... spans multiple lines
  const re = /const\s+SHOP_DATA\s*=\s*([\s\S]*?);\s*(?:\r?\n|$)/m;
  const m = content.match(re);
  return m ? m[1].trim() : null;
}

function evalJsExpr(expr: string) {
  // Your file is trusted (your own local ok), so this is acceptable for your case.
  const fn = new Function(`"use strict"; return (${expr});`);
  return fn();
}

function countProducts(data: any) {
  let games = 0;
  let total = 0;

  if (!data || typeof data !== "object") return { games: 0, total: 0 };

  // data: { "Blox Fruits": { "Bundles":[...], "Best Seller":[...], ... }, "Other Game": {...} }
  const gameKeys = Object.keys(data);
  games = gameKeys.length;

  for (const game of gameKeys) {
    const gameObj = data[game];
    if (!gameObj || typeof gameObj !== "object") continue;

    // gameObj: { "Bundles":[...], "Permanent Fruits":[...], ... }
    for (const group of Object.keys(gameObj)) {
      const arr = gameObj[group];
      if (Array.isArray(arr)) total += arr.length;
    }
  }

  return { games, total };
}

function main() {
  const root = process.cwd();
  const okPath = path.join(root, "ok");
  const outPath = path.join(root, "data", "shop-data.json");

  if (!fs.existsSync(okPath)) {
    console.error(`❌ Cannot find file: ${okPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(okPath, "utf8");
  const expr = extractShopDataExpr(content);

  if (!expr) {
    console.error("❌ Could not find `const SHOP_DATA = ...;` in file ok");
    process.exit(1);
  }

  let shopData: any;
  try {
    shopData = evalJsExpr(expr);
  } catch (e: any) {
    console.error("❌ Failed to parse SHOP_DATA. Error:", e?.message ?? e);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(shopData, null, 2), "utf8");

  const { games, total } = countProducts(shopData);

  console.log("✅ Successfully extracted SHOP_DATA!");
  console.log(`📁 Saved to: ${outPath}`);
  console.log(`🎮 Games: ${games}`);
  console.log(`📦 Total Products: ${total}`);
}

main();
