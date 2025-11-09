// scripts/adapters/pcpp_norm.mjs
import { request } from "node:https";

function fetch(url) {
  return new Promise((resolve, reject) => {
    request(url, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(d));
    }).on("error", reject).end();
  });
}

function parseCSV(csv) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const cols = line.split(",");
    const o = {};
    headers.forEach((h, i) => o[h] = (cols[i] || "").trim());
    return o;
  });
}

const BASE = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master";
const idify = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

export async function fetchCpus() {
  const rows = parseCSV(await fetch(`${BASE}/cpus.csv`));
  return rows.map(r => ({
    id: "cpu-" + idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    socket: r.Socket || "",
    tdp: Number(r.TDP) || 65,
    igpu: /yes|true/i.test(r.iGPU || "")
  }));
}

export async function fetchGpus() {
  const rows = parseCSV(await fetch(`${BASE}/gpus.csv`));
  return rows.map(r => ({
    id: "gpu-" + idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    tdp: Number(r.TDP) || 200,
    lengthMm: Number(r.Length) || undefined,
    powerConnectors: r["Power Connectors"] || ""
  }));
}

export async function fetchMotherboards() {
  const rows = parseCSV(await fetch(`${BASE}/motherboards.csv`));
  return rows.map(r => ({
    id: "mb-" + idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    socket: r.Socket || "",
    formFactor: r.FormFactor || "",
    memoryType: r.MemoryType || "",
    memorySlots: Number(r.MemorySlots) || 4,
    maxMemoryMhz: Number(r.MaxMemorySpeed) || undefined,
    m2Slots: Number(r.M2Slots) || 0,
    sataPorts: Number(r.SATAPorts) || 2
  }));
}

export async function fetchMemoryKits() {
  const rows = parseCSV(await fetch(`${BASE}/memory.csv`));
  return rows.map(r => ({
    id: "ram-" + idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    type: r.Type || "",
    modules: Number((r.Modules || "").replace(/x.*/i, "")) || 2,
    capacityPer: Number(r.CapacityPerModule) || 8,
    speedMhz: Number(r.Speed) || 3200,
    ecc: /ecc/i.test(r.Type || "")
  }));
}

export async function fetchPsus() {
  const rows = parseCSV(await fetch(`${BASE}/psus.csv`));
  return rows.map(r => ({
    id: "psu-" + idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    wattage: Number(r.Wattage) || 650,
    efficiency: r.Efficiency || "",
    eps8: Number(r.EPS8Pins) || 1,
    pcie8: Number(r.PCIe8Pins) || 2,
    hppwr: /12vhpwr/i.test(r.Connectors || "") ? 1 : 0
  }));
}

export async function fetchCases() {
  const rows = parseCSV(await fetch(`${BASE}/cases.csv`));
  return rows.map(r => ({
    id: "case-" + idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    supports: (r.FormFactors || "ATX,mATX,ITX").replace(/\s+/g, ""),
    gpuMaxLen: Number(r.GPUMaxLength) || undefined,
    coolerMaxH: Number(r.CoolerMaxHeight) || undefined,
    fanMounts: Number(r.FanMounts) || undefined,
    fanSizes: r.FanSizes || "120,140",
    radiators: r.RadiatorSupport || "240,280"
  }));
}

export async function fetchCoolers() {
  // PCPP n'en fournit pas: on met un petit fallback pour que l’UI fonctionne
  return [
    { id: "cool-ag400", brand: "DeepCool", model: "AG400", type: "AIR", tdpRating: 220, socketSupport: "AM4,AM5,LGA1700", heightMm: 150 },
    { id: "cool-lf2-240", brand: "Arctic", model: "Liquid Freezer II 240", type: "AIO", radiatorSize: "240" }
  ];
}

export async function fetchStorage() {
  const rows = parseCSV(await fetch(`${BASE}/storage.csv`));
  return rows.map(r => ({
    id: "sto-" + idify(r.Model),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    type: /nvme|m\.2|pcie/i.test(r.Interface || "") ? "NVMe" : "SATA",
    iface: r.Interface || "",
    sizeGb: Number(r.Capacity) || undefined
  }));
}
