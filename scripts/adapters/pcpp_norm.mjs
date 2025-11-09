// Normalise les CSV de https://github.com/jonbrooks/pcpp-data
import { request } from "node:https";

function fetch(url){
  return new Promise((resolve,reject)=>{
    request(url,res=>{
      let d=""; res.on("data",c=>d+=c); res.on("end",()=>resolve(d));
    }).on("error",reject).end();
  });
}
function parseCSV(csv){
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(",").map(h=>h.trim());
  return lines.map(line=>{
    const cols = line.split(",");
    const o = {};
    headers.forEach((h,i)=> o[h] = (cols[i]||"").trim());
    return o;
  });
}
const BASE="https://raw.githubusercontent.com/jonbrooks/pcpp-data/master";
const idify = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-");

// — CPU
export async function fetchCpus(){
  const rows = parseCSV(await fetch(`${BASE}/cpus.csv`));
  return rows.map(r=>({
    id: "cpu-"+idify(r.Model || r.Name),
    brand: r.Manufacturer || r.Brand || "",
    model: r.Model || r.Name || "",
    socket: r.Socket || "",
    tdp: Number(r.TDP) || 65,
    igpu: /yes|true|igpu/i.test(r.iGPU || r.iGpu || "")
  })).filter(x=>x.brand && x.model);
}

// — GPU
export async function fetchGpus(){
  const rows = parseCSV(await fetch(`${BASE}/gpus.csv`));
  return rows.map(r=>({
    id: "gpu-"+idify(r.Model || r.Name),
    brand: r.Manufacturer || r.Brand || "",
    model: r.Model || r.Name || "",
    tdp: Number(r.TDP) || 200,
    lengthMm: Number(r.Length) || undefined,
    powerConnectors: r["Power Connectors"] || r.PowerConnectors || ""
  })).filter(x=>x.brand && x.model);
}

// — Cartes mères
export async function fetchMotherboards(){
  const rows = parseCSV(await fetch(`${BASE}/motherboards.csv`));
  return rows.map(r=>({
    id: "mb-"+idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    socket: r.Socket || "",
    formFactor: r.FormFactor || r.Form_Factor || "",
    memoryType: r.MemoryType || r.Memory_Type || "",
    memorySlots: Number(r.MemorySlots || r.Memory_Slots) || 4,
    maxMemoryMhz: Number(r.MaxMemorySpeed || r.Max_Memory_Speed) || undefined,
    m2Slots: Number(r.M2Slots || r.M2_Slots) || 0,
    sataPorts: Number(r.SATAPorts || r.SATA_Ports) || 2
  })).filter(x=>x.brand && x.model);
}

// — RAM
export async function fetchMemoryKits(){
  const rows = parseCSV(await fetch(`${BASE}/memory.csv`));
  return rows.map(r=>({
    id: "ram-"+idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    type: r.Type || "",
    modules: Number(String(r.Modules||"").match(/\d+/)?.[0] || 2),
    capacityPer: Number(r.CapacityPerModule || r.Capacity_per_module || 8),
    speedMhz: Number(r.Speed) || 3200,
    ecc: /ecc/i.test(r.Type||"")
  })).filter(x=>x.brand && x.model);
}

// — Alims
export async function fetchPsus(){
  const rows = parseCSV(await fetch(`${BASE}/psus.csv`));
  return rows.map(r=>({
    id:"psu-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    wattage:Number(r.Wattage)||650,
    efficiency:r.Efficiency||"",
    eps8:Number(r.EPS8Pins||1),
    pcie8:Number(r.PCIe8Pins||2),
    hppwr:/12vhpwr/i.test(r.Connectors||"") ? 1 : 0
  })).filter(x=>x.brand && x.model);
}

// — Boîtiers
export async function fetchCases(){
  const rows = parseCSV(await fetch(`${BASE}/cases.csv`));
  return rows.map(r=>({
    id:"case-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    supports:(r.FormFactors||"ATX,mATX,ITX").replace(/\s+/g,""),
    gpuMaxLen:Number(r.GPUMaxLength)||undefined,
    coolerMaxH:Number(r.CoolerMaxHeight)||undefined
  })).filter(x=>x.brand && x.model);
}

// — Refroidissement (fallback min.)
export async function fetchCoolers(){
  return [
    {id:"cool-ag400", brand:"DeepCool", model:"AG400", type:"AIR", tdpRating:220, socketSupport:"AM4,AM5,LGA1700", heightMm:150},
    {id:"cool-lf2-240", brand:"Arctic", model:"Liquid Freezer II 240", type:"AIO", radiatorSize:"240"}
  ];
}

// — Stockage
export async function fetchStorage(){
  const rows = parseCSV(await fetch(`${BASE}/storage.csv`));
  return rows.map(r=>({
    id:"sto-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    type:/nvme|m\.2|pcie/i.test(r.Interface||"") ? "NVMe" : "SATA",
    iface:r.Interface||"",
    sizeGb:Number(r.Capacity)||undefined
  })).filter(x=>x.brand && x.model);
}
