import { request } from "node:https";

// Télécharge un CSV depuis PCPartPicker (mirror sans login)
function downloadCSV(url) {
  return new Promise((resolve, reject) => {
    request(url, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    }).on("error", reject).end();
  });
}

// Convertit CSV → objets
function parseCSV(csv) {
  const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",");

  return lines.map(l => {
    const cols = l.split(",");
    const obj = {};
    headers.forEach((h,i) => obj[h.trim()] = cols[i]?.trim());
    return obj;
  });
}

// Motherboards
export async function fetchMotherboards() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/motherboards.csv";
  const csv = await downloadCSV(url);
  const rows = parseCSV(csv);

  return rows.map(r => ({
    id: `mb-${r.Manufacturer}-${r.Model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    socket: r.Socket || "",
    chipset: r.Chipset || "",
    formFactor: r.FormFactor || "",
    memoryType: r.MemoryType || "",
    maxMemory: r.MaxMemory || null
  }));
}

// Memory Kits
export async function fetchMemoryKits() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/memory.csv";
  const csv = await downloadCSV(url);
  const rows = parseCSV(csv);

  return rows.map(r => ({
    id: `ram-${r.Manufacturer}-${r.Model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    type: r.Type || "",
    speed: r.Speed || "",
    modules: r.Modules || "",
    size: r.Capacity || ""
  }));
}

// Power Supplies
export async function fetchPSUs() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/psus.csv";
  const csv = await downloadCSV(url);
  const rows = parseCSV(csv);

  return rows.map(r => ({
    id: `psu-${r.Manufacturer}-${r.Model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    wattage: r.Wattage || null,
    efficiency: r.Efficiency || ""
  }));
}

// Cases
export async function fetchCases() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/cases.csv";
  const csv = await downloadCSV(url);
  const rows = parseCSV(csv);

  return rows.map(r => ({
    id: `case-${r.Manufacturer}-${r.Model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    formFactor: r.Type || "",
    maxGpuLength: r.MaxGpuLength || null
  }));
}

// Storage
export async function fetchStorage() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/storage.csv";
  const csv = await downloadCSV(url);
  const rows = parseCSV(csv);

  return rows.map(r => ({
    id: `sto-${r.Manufacturer}-${r.Model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    type: r.Interface || "",
    capacity: r.Capacity || ""
  }));
}
