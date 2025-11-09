// Fetch PCPP CSVs et normalise vers le schéma attendu par index.html
import { request } from "node:https";

const BASE = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master";

// --- Téléchargement simple ---
function fetchText(url){
  return new Promise((resolve,reject)=>{
    request(url,res=>{
      let d=""; res.on("data",c=>d+=c); res.on("end",()=>resolve(d));
    }).on("error",reject).end();
  });
}

// --- Parseur CSV RFC4180 (gère guillemets, virgules, CRLF) ---
function parseCSV(text){
  const rows=[]; let row=[], field="";
  let i=0, inQuotes=false;
  while(i<text.length){
    const ch=text[i];
    if(inQuotes){
      if(ch==='"' && text[i+1]==='"'){ field+='"'; i+=2; continue; }
      if(ch==='"'){ inQuotes=false; i++; continue; }
      field+=ch; i++; continue;
    }else{
      if(ch==='"'){ inQuotes=true; i++; continue; }
      if(ch===','){ row.push(field.trim()); field=""; i++; continue; }
      if(ch==='\n'){ row.push(field.trim()); rows.push(row); row=[]; field=""; i++; continue; }
      if(ch==='\r'){ i++; continue; }
      field+=ch; i++; continue;
    }
  }
  // dernier champ/ligne
  row.push(field.trim()); rows.push(row);

  // header -> objets
  const header = rows.shift().map(h=>h.trim());
  return rows.filter(r=>r.length && r.some(c=>c!=="")).map(r=>{
    const o={}; header.forEach((h,idx)=>{ o[h]=r[idx]??""; }); return o;
  });
}

const idify = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
const toInt = v => { const n = parseInt(String(v).replace(/[^0-9-]/g,""),10); return Number.isFinite(n)?n:undefined; };

// ----- Normalise chaque catégorie -----
export async function fetchCpus(){
  const rows = parseCSV(await fetchText(`${BASE}/cpus.csv`));
  return rows.map(r=>({
    id: "cpu-"+idify(r.Model || r.Name),
    brand: r.Manufacturer || r.Brand || "",
    model: r.Model || r.Name || "",
    socket: r.Socket || "",
    tdp: toInt(r.TDP) ?? 65,
    igpu: /yes|true|igpu/i.test(r.iGPU||"")
  })).filter(x=>x.brand || x.model);
}

export async function fetchGpus(){
  const rows = parseCSV(await fetchText(`${BASE}/gpus.csv`));
  return rows.map(r=>({
    id: "gpu-"+idify(r.Model || r.Name),
    brand: r.Manufacturer || r.Brand || "",
    model: r.Model || r.Name || "",
    tdp: toInt(r.TDP),
    lengthMm: toInt(r.Length),
    powerConnectors: r["Power Connectors"] || r.Connectors || ""
  })).filter(x=>x.brand || x.model);
}

export async function fetchMotherboards(){
  const rows = parseCSV(await fetchText(`${BASE}/motherboards.csv`));
  return rows.map(r=>({
    id: "mb-"+idify(r.Model || r.Name),
    brand: r.Manufacturer || r.Brand || "",
    model: r.Model || r.Name || "",
    socket: r.Socket || "",
    formFactor: r.FormFactor || r.Form_Factor || "",
    memoryType: r.MemoryType || r.Memory_Type || "",
    memorySlots: toInt(r.MemorySlots) ?? 4,
    maxMemoryMhz: toInt(r.MaxMemorySpeed),
    m2Slots: toInt(r.M2Slots) ?? 0,
    sataPorts: toInt(r.SATAPorts) ?? 2
  })).filter(x=>x.brand || x.model);
}

export async function fetchMemoryKits(){
  const rows = parseCSV(await fetchText(`${BASE}/memory.csv`));
  return rows.map(r=>{
    const modules = toInt((r.Modules||"").match(/^\s*(\d+)/)?.[1]);
    return {
      id: "ram-"+idify(r.Model || r.Name),
      brand: r.Manufacturer || r.Brand || "",
      model: r.Model || r.Name || "",
      type: r.Type || "",
      modules: modules ?? 2,
      capacityPer: toInt(r.CapacityPerModule) ?? toInt(r.CapacityPerStick),
      speedMhz: toInt(r.Speed) ?? 3200,
      ecc: /ecc/i.test(r.Type||"")
    };
  }).filter(x=>x.brand || x.model);
}

export async function fetchPsus(){
  const rows = parseCSV(await fetchText(`${BASE}/psus.csv`));
  return rows.map(r=>({
    id: "psu-"+idify(r.Model || r.Name),
    brand: r.Manufacturer || r.Brand || "",
    model: r.Model || r.Name || "",
    wattage: toInt(r.Wattage),
    efficiency: r.Efficiency || "",
    eps8: toInt(r.EPS8Pins) ?? 1,
    pcie8: toInt(r.PCIe8Pins) ?? 2,
    hppwr: /12vhpwr|hppwr/i.test(r.Connectors||"") ? 1 : 0
  })).filter(x=>x.brand || x.model);
}

export async function fetchCases(){
  const rows = parseCSV(await fetchText(`${BASE}/cases.csv`));
  return rows.map(r=>({
    id: "case-"+idify(r.Model || r.Name),
    brand: r.Manufacturer || r.Brand || "",
    model: r.Model || r.Name || "",
    supports: String(r.FormFactors||r.Supported_Mobos||"").replace(/\s+/g,""),
    gpuMaxLen: toInt(r.GPUMaxLength),
    coolerMaxH: toInt(r.CoolerMaxHeight),
    fanMounts: toInt(r.FanMounts),
    fanSizes: r.FanSizes || "120,140",
    radiators: r.RadiatorSupport || "240,280"
  })).filter(x=>x.brand || x.model);
}

// PCPP ne propose pas toujours les coolers → petite base de secours
export async function fetchCoolers(){
  return [
    {id:"cool-ag400", brand:"DeepCool", model:"AG400", type:"AIR", tdpRating:220, socketSupport:"AM4,AM5,LGA1700", heightMm:150},
    {id:"cool-lf2-240", brand:"Arctic", model:"Liquid Freezer II 240", type:"AIO", radiatorSize:"240"}
  ];
}

export async function fetchStorage(){
  const rows = parseCSV(await fetchText(`${BASE}/storage.csv`));
  return rows.map(r=>{
    const iface = r.Interface || r.Bus || "";
    const isNVMe = /nvme|m\.2|pcie/i.test(iface);
    return {
      id: "sto-"+idify(r.Model || r.Name),
      brand: r.Manufacturer || r.Brand || "",
      model: r.Model || r.Name || "",
      type: isNVMe ? "NVMe" : "SATA",
      iface,
      sizeGb: toInt(r.Capacity)
    };
  }).filter(x=>x.brand || x.model);
}
