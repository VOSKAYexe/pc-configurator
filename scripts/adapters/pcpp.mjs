// PCPP adapter formatted for your index.html
// parses CSV and normalizes fields

import { request } from "node:https";

function downloadCSV(url){
  return new Promise((resolve,reject)=>{
    request(url,res=>{
      let d=""; res.on("data",c=>d+=c);
      res.on("end",()=>resolve(d));
    }).on("error",reject).end();
  });
}

function parseCSV(csv){
  const lines=csv.split(/\r?\n/).filter(x=>x.trim()!=="");
  const headers=lines.shift().split(",");
  return lines.map(l=>{
    const cols=l.split(",");
    const o={};
    headers.forEach((h,i)=>o[h.trim()]=cols[i]?.trim());
    return o;
  });
}

function idify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-"); }

// Normalizers
export async function fetchCPU(){
  const rows=parseCSV(await downloadCSV("https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/cpus.csv"));
  return rows.map(r=>({
    id:"cpu-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    socket:r.Socket||"",
    tdp:parseInt(r.TDP)||null
  }));
}

export async function fetchGPU(){
  const rows=parseCSV(await downloadCSV("https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/gpus.csv"));
  return rows.map(r=>({
    id:"gpu-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    lengthMm:parseInt(r.Length)||null,
    tdp:parseInt(r.TDP)||null,
    powerConnectors:r["Power Connectors"]||""
  }));
}

export async function fetchMotherboards(){
  const rows=parseCSV(await downloadCSV("https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/motherboards.csv"));
  return rows.map(r=>({
    id:"mb-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    socket:r.Socket||"",
    formFactor:r.FormFactor||"",
    memoryType:r.MemoryType||"",
    memorySlots:parseInt(r.MemorySlots)||null,
    maxMemoryMhz:parseInt(r.MaxMemorySpeed)||null,
    m2Slots:parseInt(r.M2Slots)||null,
    sataPorts:parseInt(r.SATAPorts)||null
  }));
}

export async function fetchMemory(){
  const rows=parseCSV(await downloadCSV("https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/memory.csv"));
  return rows.map(r=>({
    id:"ram-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    type:r.Type||"",
    modules:r.Modules||"",
    speedMhz:parseInt(r.Speed)||null,
    capacityPer:r.CapacityPerModule||""
  }));
}

export async function fetchPSU(){
  const rows=parseCSV(await downloadCSV("https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/psus.csv"));
  return rows.map(r=>({
    id:"psu-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    wattage:parseInt(r.Wattage)||null,
    pcie8:parseInt(r.PCIe8Pins)||null,
    hppwr:parseInt(r.HPPWR)||null
  }));
}

export async function fetchCases(){
  const rows=parseCSV(await downloadCSV("https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/cases.csv"));
  return rows.map(r=>({
    id:"case-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    supports:r.FormFactors||"",
    gpuMaxLen:parseInt(r.GPUMaxLength)||null,
    coolerMaxH:parseInt(r.CoolerMaxHeight)||null
  }));
}

export async function fetchStorage(){
  const rows=parseCSV(await downloadCSV("https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/storage.csv"));
  return rows.map(r=>({
    id:"sto-"+idify(r.Model),
    brand:r.Manufacturer||"",
    model:r.Model||"",
    type:r.Interface||"",
    capacity:r.Capacity||""
  }));
}
