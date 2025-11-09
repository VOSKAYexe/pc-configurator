// scripts/adapters/icecat.mjs
// Adaptateur Open ICEcat (compte gratuit requis).
// Renseignez ICECAT_USER / ICECAT_PASS dans les *Secrets* GitHub du dépôt.
//
// NOTE: On récupère des exports quotidiens (fichiers gz TSV/CSV) et on réduit aux champs nécessaires.
// Les URL exactes d'export peuvent varier selon ICEcat; ajustez `ENDPOINTS` si besoin.

import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createWriteStream, createReadStream } from "node:fs";
import { rm, mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { request } from "node:https";

const USER = process.env.ICECAT_USER;
const PASS = process.env.ICECAT_PASS;

if(!USER || !PASS){
  console.error("ICECAT_USER / ICECAT_PASS manquants (Secrets GitHub).");
  process.exit(1);
}

// Dossiers temporaires
const TMP = resolve(".tmp_icecat");
await rm(TMP, {recursive:true, force:true});
await mkdir(TMP, {recursive:true});

// Pistes d'exports (exemples) — à adapter selon votre accès ICEcat.
// Ici on suppose des TSV simples par catégorie.
const ENDPOINTS = {
  cpus:    "/export/freeproducts/INT/CPUs.tsv.gz",
  gpus:    "/export/freeproducts/INT/Video_Cards.tsv.gz",
  boards:  "/export/freeproducts/INT/Motherboards.tsv.gz",
  memory:  "/export/freeproducts/INT/Memory.tsv.gz",
  psus:    "/export/freeproducts/INT/Power_Supplies.tsv.gz",
  cases:   "/export/freeproducts/INT/Cases.tsv.gz",
  coolers: "/export/freeproducts/INT/Cooling.tsv.gz",
  storage: "/export/freeproducts/INT/Storage.tsv.gz",
};

function downloadGz(pathname, outFile){
  const auth = Buffer.from(`${USER}:${PASS}`).toString("base64");
  const options = {
    hostname: "data.icecat.biz",
    path: pathname,
    method: "GET",
    headers: { "Authorization": `Basic ${auth}` }
  };
  return new Promise((resolveP, rejectP)=>{
    const req = request(options, async (res) => {
      if(res.statusCode !== 200){
        rejectP(new Error("HTTP "+res.statusCode+" on "+pathname));
        return;
      }
      const gunzip = createGunzip();
      const ws = createWriteStream(outFile);
      try{
        await pipeline(res, gunzip, ws);
        resolveP(outFile);
      }catch(e){ rejectP(e); }
    });
    req.on("error", rejectP);
    req.end();
  });
}

async function parseTsv(file){
  const raw = await readFile(file, "utf-8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if(lines.length === 0) return [];
  const header = lines[0].split("\t");
  const out = [];
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split("\t");
    const row = {};
    for(let j=0;j<header.length;j++){
      row[header[j]] = cols[j];
    }
    out.push(row);
  }
  return out;
}

// Mappers vers votre schéma minimal
function mapCpu(r){
  return {
    id: `cpu-${(r.Brand||"").toLowerCase()}-${(r.Model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
    brand: r.Brand || "",
    model: r.Model || "",
    socket: r.Socket || r.Socket_Name || "",
    tdp: Number(r.TDP) || 65,
    igpu: /yes|true/i.test(String(r.iGPU||"")) ? true : false,
  };
}
function mapGpu(r){
  return {
    id: `gpu-${(r.Brand||"").toLowerCase()}-${(r.Model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
    brand: r.Brand || "",
    model: r.Model || "",
    tdp: Number(r.TDP) || 200,
    lengthMm: Number(r.Length_mm) || undefined,
    powerConnectors: r.Power_Connectors || "",
  };
}
function mapMotherboard(r){
  return {
    id: `mb-${(r.Brand||"").toLowerCase()}-${(r.Model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
    brand: r.Brand || "",
    model: r.Model || "",
    socket: r.Socket || "",
    formFactor: r.Form_Factor || "",
    memoryType: r.Memory_Type || "",
    memorySlots: Number(r.Memory_Slots) || 2,
    maxMemoryMhz: Number(r.Max_Memory_Speed_MHz) || undefined,
    m2Slots: Number(r.M2_Slots) || 0,
    sataPorts: Number(r.SATA_Ports) || 2
  };
}
function mapMemory(r){
  return {
    id: `ram-${(r.Brand||"").toLowerCase()}-${(r.Model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
    brand: r.Brand || "",
    model: r.Model || "",
    type: r.Type || "",
    modules: Number(r.Modules) || 2,
    capacityPer: Number(r.Capacity_GB_per_Module) || 8,
    speedMhz: Number(r.Speed_MHz) || 3200,
    ecc: /ecc/i.test(String(r.Features||"")) || /ecc/i.test(String(r.Type||"")) ? true : false,
  };
}
function mapPsu(r){
  return {
    id: `psu-${(r.Brand||"").toLowerCase()}-${(r.Model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
    brand: r.Brand || "",
    model: r.Model || "",
    wattage: Number(r.Wattage_W) || 650,
    efficiency: r.Efficiency || "",
    pcie8: Number(r.PCIe_8pin) || 2,
    hppwr: /12vhpwr/i.test(String(r.Connectors||"")) ? 1 : 0
  };
}
function mapCase(r){
  return {
    id: `case-${(r.Brand||"").toLowerCase()}-${(r.Model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
    brand: r.Brand || "",
    model: r.Model || "",
    supports: (r.Supported_Formats||"").replace(/\\s+/g,""),
    gpuMaxLen: Number(r.GPU_Max_Length_mm) || undefined,
    coolerMaxH: Number(r.Cooler_Max_Height_mm) || undefined,
    fanMounts: Number(r.Fan_Mounts) || undefined,
    fanSizes: r.Fan_Sizes || "",
    radiators: r.Radiator_Support || ""
  };
}
function mapCooler(r){
  return {
    id: `cool-${(r.Brand||"").toLowerCase()}-${(r.Model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
    brand: r.Brand || "",
    model: r.Model || "",
    type: /aio|liquid/i.test(String(r.Type||"")) ? "AIO" : "AIR",
    tdpRating: Number(r.TDP_Rating_W) || undefined,
    socketSupport: r.Socket_Compatibility || "",
    heightMm: Number(r.Height_mm) || undefined,
    radiatorSize: r.Radiator_Size_mm ? String(r.Radiator_Size_mm) : undefined
  };
}
function mapStorage(r){
  const type = /nvme|m\\.2|pcie/i.test(String(r.Interface||"")) ? "NVMe" : "SATA";
  return {
    id: `sto-${(r.Brand||"").toLowerCase()}-${(r.Model||"").toLowerCase()}`.replace(/[^a-z0-9]+/g,"-"),
    brand: r.Brand || "",
    model: r.Model || "",
    type,
    iface: r.Interface || "",
    sizeGb: Number(r.Capacity_GB) || undefined
  };
}

async function fetchCategory(name){
  const path = ENDPOINTS[name];
  if(!path) return [];
  const out = resolve(TMP, `${name}.tsv`);
  const gzPath = out + ".gz";
  await downloadGz(path, out); // télécharge et décompresse vers `out`
  const rows = await parseTsv(out);
  const map = {
    cpus: mapCpu, gpus: mapGpu, boards: mapMotherboard, memory: mapMemory,
    psus: mapPsu, cases: mapCase, coolers: mapCooler, storage: mapStorage
  }[name];
  if(!map) return [];
  // Filtre basique: éléments avec brand+model valides
  return rows.map(map).filter(x=> (x.brand && x.model));
}

// Exports simples par catégorie (adaptés au build-catalog)
export async function fetchCpus(){ return fetchCategory("cpus"); }
export async function fetchGpus(){ return fetchCategory("gpus"); }
export async function fetchMotherboards(){ return fetchCategory("boards"); }
export async function fetchMemoryKits(){ return fetchCategory("memory"); }
export async function fetchPsus(){ return fetchCategory("psus"); }
export async function fetchCases(){ return fetchCategory("cases"); }
export async function fetchCoolers(){ return fetchCategory("coolers"); }
export async function fetchStorage(){ return fetchCategory("storage"); }
