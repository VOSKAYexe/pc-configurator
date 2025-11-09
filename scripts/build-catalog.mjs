// scripts/build-catalog.mjs
import { mkdir, writeFile } from "node:fs/promises";
import * as p from "./adapters/pcpp_norm.mjs";

async function ensure(dir) { await mkdir(dir, { recursive: true }); }
async function writeJSON(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

async function main() {
  await ensure("./catalog");
  console.log("Téléchargement et génération…");

  const datasets = {
    cpus:         await p.fetchCpus(),
    motherboards: await p.fetchMotherboards(),
    memoryKits:   await p.fetchMemoryKits(),
    gpus:         await p.fetchGpus(),
    psus:         await p.fetchPsus(),
    cases:        await p.fetchCases(),
    coolers:      await p.fetchCoolers(),
    storage:      await p.fetchStorage()
  };

  for (const [name, data] of Object.entries(datasets)) {
    await writeJSON(`catalog/${name}.json`, data);
    console.log(`${name}.json -> ${data.length} items`);
  }
  console.log("OK");
}

main().catch(err => { console.error(err); process.exit(1); });
