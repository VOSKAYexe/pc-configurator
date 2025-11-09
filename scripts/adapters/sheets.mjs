// scripts/adapters/sheets.mjs
const URLS = {
  cpus:          "https://docs.google.com/spreadsheets/d/1YBcIm6-0P2VzFKgmmQHU5DOsm6gUvYnn_WEe4PLroWE/edit?gid=51688721#gid=51688721",
  motherboards:  "https://docs.google.com/spreadsheets/d/1YBcIm6-0P2VzFKgmmQHU5DOsm6gUvYnn_WEe4PLroWE/edit?gid=2125691697#gid=2125691697",
  memoryKits:    "https://docs.google.com/spreadsheets/d/1YBcIm6-0P2VzFKgmmQHU5DOsm6gUvYnn_WEe4PLroWE/edit?gid=573719448#gid=573719448",
  gpus:          "https://docs.google.com/spreadsheets/d/1YBcIm6-0P2VzFKgmmQHU5DOsm6gUvYnn_WEe4PLroWE/edit?gid=789762267#gid=789762267",
  psus:          "https://docs.google.com/spreadsheets/d/1YBcIm6-0P2VzFKgmmQHU5DOsm6gUvYnn_WEe4PLroWE/edit?gid=637925770#gid=637925770",
  cases:         "https://docs.google.com/spreadsheets/d/1YBcIm6-0P2VzFKgmmQHU5DOsm6gUvYnn_WEe4PLroWE/edit?gid=1713154244#gid=1713154244",
  coolers:       "https://docs.google.com/spreadsheets/d/1YBcIm6-0P2VzFKgmmQHU5DOsm6gUvYnn_WEe4PLroWE/edit?gid=170107886#gid=170107886",
  storage:       "https://docs.google.com/spreadsheets/d/1YBcIm6-0P2VzFKgmmQHU5DOsm6gUvYnn_WEe4PLroWE/edit?gid=912906865#gid=912906865",
};

async function fetchCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch CSV failed ${url}`);
  return await res.text();
}
function parseCsv(text) {
  // Parser simple (valeurs sans virgules). Suffisant pour un MVP.
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const cells = line.split(","); // éviter les virgules dans les valeurs
    const obj = {};
    headers.forEach((h, i) => obj[h] = (cells[i] ?? "").trim());
    return obj;
  });
}
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : undefined; }
function bool(x) { return String(x).trim() === "1" || /^true$/i.test(String(x)); }

export async function fetchAllFromSheets() {
  // 1) Télécharger chaque CSV
  const [cpus, motherboards, memoryKits, gpus, psus, cases, coolers, storage] =
    await Promise.all(Object.values(URLS).map(u => fetchCsv(u).then(parseCsv)));

  // 2) Normaliser les colonnes (cast nombres/booleans)
  const norm = {
    cpus: cpus.map(r => ({
      id: `cpu-${(r.brand||"").toLowerCase()}-${(r.model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
      brand: r.brand, model: r.model, socket: r.socket,
      tdp: num(r.tdp) ?? 65, igpu: bool(r.igpu), pcie: r.pcie
    })),
    motherboards: motherboards.map(r => ({
      id: `mb-${(r.brand||"").toLowerCase()}-${(r.model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
      brand: r.brand, model: r.model, socket: r.socket, chipset: r.chipset,
      formFactor: r.formFactor, memoryType: r.memoryType,
      memorySlots: num(r.memorySlots) ?? 2, maxMemoryMhz: num(r.maxMemoryMhz),
      m2Slots: num(r.m2Slots) ?? 0, sataPorts: num(r.sataPorts) ?? 0,
      pciex16Slots: num(r.pciex16Slots) ?? 1, pciex1Slots: num(r.pciex1Slots) ?? 0,
      fanMounts: num(r.fanMounts), fanSizes: r.fanSizes, radiators: r.radiators
    })),
    memoryKits: memoryKits.map(r => ({
      id: `ram-${(r.brand||"").toLowerCase()}-${(r.model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
      brand: r.brand, model: r.model, type: r.type,
      modules: num(r.modules) ?? 2, capacityPer: num(r.capacityPer) ?? 8,
      speedMhz: num(r.speedMhz), ecc: bool(r.ecc)
    })),
    gpus: gpus.map(r => ({
      id: `gpu-${(r.brand||"").toLowerCase()}-${(r.model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
      brand: r.brand, model: r.model, pcie: r.pcie,
      tdp: num(r.tdp), lengthMm: num(r.lengthMm), slotWidth: num(r.slotWidth),
      powerConnectors: r.powerConnectors
    })),
    psus: psus.map(r => ({
      id: `psu-${(r.brand||"").toLowerCase()}-${(r.model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
      brand: r.brand, model: r.model, wattage: num(r.wattage),
      efficiency: r.efficiency, eps8: num(r.eps8), pcie8: num(r.pcie8), hppwr: num(r.hppwr)
    })),
    cases: cases.map(r => ({
      id: `case-${(r.brand||"").toLowerCase()}-${(r.model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
      brand: r.brand, model: r.model, supports: r.supports,
      gpuMaxLen: num(r.gpuMaxLen), coolerMaxH: num(r.coolerMaxH),
      fanMounts: num(r.fanMounts), fanSizes: r.fanSizes, radiators: r.radiators
    })),
    coolers: coolers.map(r => ({
      id: `cool-${(r.brand||"").toLowerCase()}-${(r.model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
      brand: r.brand, model: r.model, type: r.type,
      tdpRating: num(r.tdpRating), socketSupport: r.socketSupport,
      heightMm: num(r.heightMm), radiatorSize: r.radiatorSize
    })),
    storage: storage.map(r => ({
      id: `sto-${(r.brand||"").toLowerCase()}-${(r.model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
      brand: r.brand, model: r.model, type: r.type, iface: r.iface, sizeGb: num(r.sizeGb)
    })),
  };
  return norm;
}
