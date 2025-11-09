import { mkdir, writeFile } from "node:fs/promises";
import * as tpu from "./adapters/tpu.mjs";
import * as pcpp from "./adapters/pcpp.mjs";

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function main() {
  await ensureDir("./catalog");

  console.log("Téléchargement CPU/GPU (TechPowerUp)...");
  const cpus = await tpu.fetchCPUs();
  const gpus = await tpu.fetchGPUs();

  console.log("Téléchargement PCPP (cartes mères, RAM, PSU, boîtiers, stockage)...");
  const motherboards = await pcpp.fetchMotherboards();
  const memoryKits = await pcpp.fetchMemoryKits();
  const psus = await pcpp.fetchPSUs();
  const cases = await pcpp.fetchCases();
  const storage = await pcpp.fetchStorage();

  const datasets = {
    cpus, gpus, motherboards, memoryKits, psus, cases, storage
  };

  for (const [name, data] of Object.entries(datasets)) {
    await writeFile(`catalog/${name}.json`, JSON.stringify(data, null, 2));
    console.log(`${name}.json → OK (${data.length} items)`);
  }

  console.log("Catalogue généré avec succès.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
