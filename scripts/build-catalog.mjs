// scripts/build-catalog.mjs
// Construit /catalog/*.json depuis Open ICEcat.
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import * as icecat from "./adapters/icecat.mjs";

async function ensureDir(p){ await mkdir(p, {recursive:true}); }

async function main(){
  const outDir = resolve("./catalog");
  await ensureDir(outDir);

  console.log("Téléchargement depuis Open ICEcat...");
  const datasets = {
    cpus: await icecat.fetchCpus(),
    motherboards: await icecat.fetchMotherboards(),
    memoryKits: await icecat.fetchMemoryKits(),
    gpus: await icecat.fetchGpus(),
    psus: await icecat.fetchPsus(),
    cases: await icecat.fetchCases(),
    coolers: await icecat.fetchCoolers(),
    storage: await icecat.fetchStorage(),
  };

  for(const [name, arr] of Object.entries(datasets)){
    // Dédup simple par (brand+model)
    const seen = new Set();
    const clean = [];
    for(const it of arr){
      const key = (it.brand||"")+"|"+(it.model||"");
      if(seen.has(key)) continue;
      seen.add(key);
      clean.push(it);
    }
    clean.sort((a,b)=> String(a.brand+a.model).localeCompare(String(b.brand+b.model)));
    await writeFile(`${outDir}/${name}.json`, JSON.stringify(clean, null, 2), "utf-8");
    console.log(`→ ${name}.json (${clean.length} items)`);
  }
  console.log("OK");
}

main().catch(e=>{ console.error(e); process.exit(1); });
