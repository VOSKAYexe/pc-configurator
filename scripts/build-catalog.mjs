import { mkdir, writeFile } from "node:fs/promises";
import * as pcpp from "./adapters/pcpp.mjs";

async function ensure(p){ await mkdir(p,{recursive:true}); }

async function main(){
  await ensure("./catalog");

  const datasets = {
    cpu: await pcpp.fetchCPU(),
    gpu: await pcpp.fetchGPU(),
    motherboards: await pcpp.fetchMotherboards(),
    memory: await pcpp.fetchMemory(),
    psu: await pcpp.fetchPSU(),
    cases: await pcpp.fetchCases(),
    storage: await pcpp.fetchStorage()
  };

  for(const [name,data] of Object.entries(datasets)){
    await writeFile(`catalog/${name}.json`, JSON.stringify(data,null,2));
    console.log(name,"OK",data.length);
  }
}

main().catch(e=>{console.error(e);process.exit(1);});
