// Adaptateur Open ICEcat tolérant (mode A: exports directs / mode B: index freeurls).
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { rm, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { request } from "node:https";

const USER = process.env.ICECAT_USER;
const PASS = process.env.ICECAT_PASS;
if (!USER || !PASS) { console.error("Missing ICECAT_USER/ICECAT_PASS"); process.exit(1); }

const TMP = resolve(".tmp_icecat");
await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });

// === MODE A — REMPLIS ICI AVEC TES CHEMINS EXACTS PRIS SUR OPEN ICECAT ===
// Exemple de forme: "/export/freeproducts/INT/Motherboards.tsv.gz"
// Laisse vide ("") si tu ne l'as pas, on passera en mode B pour la catégorie.
const ENDPOINTS = {
  cpus:        "", // <- mets ton chemin TSV.GZ si tu l'as
  gpus:        "",
  motherboards:"",
  memoryKits:  "",
  psus:        "",
  cases:       "",
  coolers:     "",
  storage:     "",
};

// === MODE B — Fallback via l'index freeurls (catalogue minimal) ===
const FREEURLS_INDEX = "/export/freeurls/urls.index.csv.gz"; // souvent accessible

function dl(pathname, outFile, gunzip=true){
  const auth = Buffer.from(`${USER}:${PASS}`).toString("base64");
  const options = { hostname: "data.icecat.biz", path: pathname, method: "GET",
    headers: { Authorization: `Basic ${auth}` } };
  return new Promise((res, rej)=>{
    const req = request(options, async r => {
      if (r.statusCode !== 200) return rej(new Error(`HTTP ${r.statusCode} on ${pathname}`));
      const ws = createWriteStream(outFile);
      try{
        if(gunzip){ const z = createGunzip(); await pipeline(r, z, ws); }
        else { await pipeline(r, ws); }
        res(outFile);
      }catch(e){ rej(e); }
    });
    req.on("error", rej); req.end();
  });
}
async function parseTSV(file){
  const raw = await readFile(file, "utf-8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const head = lines[0].split("\t");
  return lines.slice(1).map(l => {
    const cols = l.split("\t"); const o = {};
    head.forEach((h,i)=> o[h] = cols[i]); return o;
  });
}
async function parseCSV(file){
  const raw = await readFile(file, "utf-8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const head = lines[0].split(",");
  return lines.slice(1).map(l=>{
    // CSV simple (pas de quotes complexes)
    const cols = l.split(",");
    const o={}; head.forEach((h,i)=> o[h]=cols[i]); return o;
  });
}

// === Mappers (Mode A) — quand on a des TSV “riches” par catégorie
const mapA = {
  cpus: r => ({ id: `cpu-${(r.Brand||"")}-${(r.Model||"")}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
                brand:r.Brand||"", model:r.Model||"", socket:r.Socket||"", tdp:Number(r.TDP)||65 }),
  gpus: r => ({ id: `gpu-${(r.Brand||"")}-${(r.Model||"")}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
                brand:r.Brand||"", model:r.Model||"", tdp:Number(r.TDP)||200, powerConnectors:r.Power_Connectors||"" }),
  motherboards: r => ({ id: `mb-${(r.Brand||"")}-${(r.Model||"")}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
                brand:r.Brand||"", model:r.Model||"", socket:r.Socket||"", formFactor:r.Form_Factor||"",
                memoryType:r.Memory_Type||"", memorySlots:Number(r.Memory_Slots)||2,
                maxMemoryMhz:Number(r.Max_Memory_Speed_MHz)||undefined, m2Slots:Number(r.M2_Slots)||0, sataPorts:Number(r.SATA_Ports)||2 }),
  memoryKits: r => ({ id: `ram-${(r.Brand||"")}-${(r.Model||"")}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
                brand:r.Brand||"", model:r.Model||"", type:r.Type||"", modules:Number(r.Modules)||2,
                capacityPer:Number(r.Capacity_GB_per_Module)||8, speedMhz:Number(r.Speed_MHz)||3200 }),
  psus: r => ({ id: `psu-${(r.Brand||"")}-${(r.Model||"")}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
                brand:r.Brand||"", model:r.Model||"", wattage:Number(r.Wattage_W)||650, efficiency:r.Efficiency||"" }),
  cases: r => ({ id: `case-${(r.Brand||"")}-${(r.Model||"")}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
                brand:r.Brand||"", model:r.Model||"", supports:(r.Supported_Formats||"").replace(/\s+/g,"") }),
  coolers: r => ({ id: `cool-${(r.Brand||"")}-${(r.Model||"")}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
                brand:r.Brand||"", model:r.Model||"", type:/aio|liquid/i.test(String(r.Type||""))?"AIO":"AIR" }),
  storage: r => ({ id: `sto-${(r.Brand||"")}-${(r.Model||"")}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
                brand:r.Brand||"", model:r.Model||"", type:/nvme|m\.2|pcie/i.test(String(r.Interface||""))?"NVMe":"SATA" }),
};

async function fetchModeA(cat){
  const path = ENDPOINTS[cat];
  if (!path) return null; // pas dispo → on tentera le mode B
  const out = resolve(TMP, `${cat}.tsv`);
  await dl(path, out); // telecharge + gunzip en TSV
  const rows = await parseTSV(out);
  const map = mapA[cat];
  return rows.map(map).filter(x=>x.brand && x.model);
}

// === Mode B — fallback: index freeurls → catalogue minimal (brand/model)
async function fetchModeB(filterFn){
  const out = resolve(TMP, "urls.index.csv");
  await dl(FREEURLS_INDEX, out); // gunzip CSV
  const rows = await parseCSV(out);
  // format de l’index: beaucoup de colonnes; on utilise Brand + ProductName + Category
  const data = rows
    .filter(filterFn)
    .map(r => ({
      id: (r["Product ID"] || r["Prod_id"] || `${r.Brand}-${r["Product Name"]}` || "").toLowerCase().replace(/[^a-z0-9]+/g,"-"),
      brand: r.Brand || "",
      model: r["Product Name"] || r["Model"] || ""
    }))
    .filter(x=>x.brand && x.model);
  // déduplique
  const seen = new Set(); const outRows=[];
  for(const it of data){ const k=it.brand+"|"+it.model; if(seen.has(k)) continue; seen.add(k); outRows.push(it); }
  return outRows;
}

export async function fetchCpus(){
  const a = await fetchModeA("cpus");
  if (a) return a;
  return fetchModeB(r => /cpu|processor/i.test(String(r.Category || "")));
}
export async function fetchGpus(){
  const a = await fetchModeA("gpus");
  if (a) return a;
  return fetchModeB(r => /video|graphics|gpu/i.test(String(r.Category || "")));
}
export async function fetchMotherboards(){
  const a = await fetchModeA("motherboards");
  if (a) return a;
  return fetchModeB(r => /motherboard/i.test(String(r.Category || "")));
}
export async function fetchMemoryKits(){
  const a = await fetchModeA("memoryKits");
  if (a) return a;
  return fetchModeB(r => /memory|ram/i.test(String(r.Category || "")));
}
export async function fetchPsus(){
  const a = await fetchModeA("psus");
  if (a) return a;
  return fetchModeB(r => /power supply|psu/i.test(String(r.Category || "")));
}
export async function fetchCases(){
  const a = await fetchModeA("cases");
  if (a) return a;
  return fetchModeB(r => /case/i.test(String(r.Category || "")));
}
export async function fetchCoolers(){
  const a = await fetchModeA("coolers");
  if (a) return a;
  return fetchModeB(r => /cooler|cooling/i.test(String(r.Category || "")));
}
export async function fetchStorage(){
  const a = await fetchModeA("storage");
  if (a) return a;
  return fetchModeB(r => /ssd|hdd|storage|nvme|sata/i.test(String(r.Category || "")));
}
