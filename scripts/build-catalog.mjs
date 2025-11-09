// Génère EXACTEMENT les fichiers utilisés par index.html
import { mkdir, writeFile } from "node:fs/promises";
import * as p from "./adapters/pcpp_norm.mjs";

async function ensure(d){ await mkdir(d,{recursive:true}); }

async function writeJSON(path, data){
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

async function main(){
  await ensure("./catalog");
  console.log("Téléchargement + normalisation PCPP…");

  const datasets = {
    cpus: await p.fetchCpus(),
    motherboards: await p.fetchMotherboards(),
    memoryKits: await p.fetchMemoryKits(),
    gpus: await p.fetchGpus(),
    psus: await p.fetchPsus(),
    cases: await p.fetchCases(),
    coolers: await p.fetchCoolers(),
    storage: await p.fetchStorage()
  };

  for (const [name, data] of Object.entries(datasets)){
    await writeJSON(`catalog/${name}.json`, data);
    console.log(`${name}.json → ${data.length} items`);
  }
  console.log("OK");
}
main().catch(e=>{ console.error(e); process.exit(1); });
