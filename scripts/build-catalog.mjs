// scripts/build-catalog.mjs

import { mapCpu, mapGpu, mapMotherboard, mapMemory, mapPsu, mapCase, mapStorage } from "./adapters/pcpp_norm.mjs";

const BASE = "https://raw.githubusercontent.com/VOSKAYexe/pc-configurator/main/pcpp/";

async function fetchCSV(url) {
  const res = await fetch(url);
  return await res.text();
}

function parseCSV(text) {
  const lines = text.split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h,i)=> obj[h.trim()] = cols[i]?.trim());
    return obj;
  });
}

async function writeJSON(path, data) {
  await Bun.write(path, JSON.stringify(data, null, 2));
}

async function build() {
  console.log("Téléchargement et génération…");

  const files = {
    cpus:       { url: BASE + "cpus.csv",        map: mapCpu },
    gpus:       { url: BASE + "gpus.csv",        map: mapGpu },
    motherboards:{ url: BASE + "motherboards.csv", map: mapMotherboard },
    memory:     { url: BASE + "memory.csv",      map: mapMemory },
    psus:       { url: BASE + "psus.csv",        map: mapPsu },
    cases:      { url: BASE + "cases.csv",       map: mapCase },
    storage:    { url: BASE + "storage.csv",     map: mapStorage },
  };

  for (const [name, cfg] of Object.entries(files)) {
    const csv = await fetchCSV(cfg.url);
    const rows = parseCSV(csv);
    const mapped = rows.map(cfg.map);
    await writeJSON(`catalog/${name}.json`, mapped);
    console.log(`OK → catalog/${name}.json`);
  }

  console.log("✅ Catalogue généré !");
}

build();
