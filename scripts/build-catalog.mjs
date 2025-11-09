// scripts/build-catalog.mjs
// Build files with the EXACT names your index.html expects.

import { mkdir, writeFile } from "node:fs/promises";
import * as p from "./adapters/pcpp_norm.mjs";

async function ensure(d){ await mkdir(d,{recursive:true}); }

async function main(){
  await ensure("./catalog");
  console.log("Fetch + normalize (PCPP)…");

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

  for(const [name,data] of Object.entries(datasets)){
    await writeFile(`catalog/${name}.json`, JSON.stringify(data,null,2));
    console.log(`${name}.json → ${data.length}`);
  }
  console.log("Done.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
