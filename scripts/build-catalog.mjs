// scripts/build-catalog.mjs
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchAllFromSheets } from "./adapters/sheets.mjs";

async function ensureDir(p){ await mkdir(p, {recursive:true}); }

async function main(){
  const outDir = resolve("./catalog");
  await ensureDir(outDir);

  const data = await fetchAllFromSheets(); // <- vient de Google Sheets

  for (const [name, arr] of Object.entries(data)) {
    // tri léger pour stabilité des diffs
    arr.sort((a,b)=> String(a.brand+a.model).localeCompare(String(b.brand+b.model)));
    await writeFile(`${outDir}/${name}.json`, JSON.stringify(arr, null, 2), "utf-8");
    console.log("écrit:", `${name}.json`, arr.length, "items");
  }
  console.log("OK");
}

main().catch(e=>{ console.error(e); process.exit(1); });
