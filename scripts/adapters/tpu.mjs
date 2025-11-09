import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { request } from "node:https";

// Télécharge un JSON depuis TechPowerUp
function download(url) {
  return new Promise((resolve, reject) => {
    request(url, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject).end();
  });
}

// CPU TechPowerUp
export async function fetchCPUs() {
  const api = "https://www.techpowerup.com/cpu-specs/json";
  const raw = await download(api);

  return raw.map(x => ({
    id: `cpu-${x.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`,
    brand: x.brand || "",
    model: x.name || "",
    socket: x.socket || "",
    cores: x.cores || null,
    threads: x.threads || null,
    baseClock: x.base_clock || null,
    boostClock: x.boost_clock || null,
    tdp: x.tdp || null,
  }));
}

// GPU TechPowerUp
export async function fetchGPUs() {
  const api = "https://www.techpowerup.com/gpu-specs/json";
  const raw = await download(api);

  return raw.map(x => ({
    id: `gpu-${x.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`,
    brand: x.vendor || "",
    model: x.name || "",
    memory: x.memory_size || null,
    baseClock: x.clock || null,
    boostClock: x.boost_clock || null,
    tdp: x.tdp || null,
    length: x.length || null,
    slotWidth: x.slot_width || null
  }));
}
