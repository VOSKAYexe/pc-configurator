// scripts/build-catalog.mjs
// Agrège des adapters et génère /catalog/*.json
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import * as adapter from "./adapters/example-static.mjs";

async function ensureDir(p){ await mkdir(p, {recursive:true}); }

async function main(){
  const outDir = resolve("./catalog");
  await ensureDir(outDir);

  const datasets = {
    cpus: await adapter.fetchCpus(),
    motherboards: await adapter.fetchMotherboards(),
    memoryKits: await adapter.fetchMemoryKits(),
    gpus: await adapter.fetchGpus(),
    psus: await adapter.fetchPsus(),
    cases: await adapter.fetchCases(),
    coolers: await adapter.fetchCoolers(),
    storage: await adapter.fetchStorage(),
  };

  // Tri léger pour stabilité
  for(const [name, arr] of Object.entries(datasets)){
    arr.sort((a,b)=> String(a.brand+a.model).localeCompare(String(b.brand+b.model)));
    await writeFile(`${outDir}/${name}.json`, JSON.stringify(arr, null, 2), "utf-8");
    console.log("écrit:", `${name}.json`, arr.length, "items");
  }
  console.log("OK");
}

main().catch(e=>{ console.error(e); process.exit(1); });
