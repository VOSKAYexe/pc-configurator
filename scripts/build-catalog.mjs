import { mkdir, writeFile } from "node:fs/promises";
import * as pcpp from "./adapters/pcpp.mjs";

async function ensureDir(p){ await mkdir(p,{recursive:true}); }

async function main(){
  await ensureDir("./catalog");

  console.log("Téléchargement PCPP...");

  const cpu = await pcpp.fetchCPU();
  const gpu = await pcpp.fetchGPU();
  const motherboards = await pcpp.fetchMotherboards();
  const memory = await pcpp.fetchMemory();
  const psu = await pcpp.fetchPSU();
  const cases = await pcpp.fetchCases();
  const storage = await pcpp.fetchStorage();

  const db = { cpu, gpu, motherboards, memory, psu, cases, storage };

  for(const [name,data] of Object.entries(db)){
    await writeFile(`catalog/${name}.json`, JSON.stringify(data,null,2));
    console.log(`${name}.json OK (${data.length})`);
  }

  console.log("Catalogue généré.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
