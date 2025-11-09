import { request } from "node:https";

function downloadCSV(url) {
  return new Promise((resolve, reject) => {
    request(url, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    }).on("error", reject).end();
  });
}

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

export async function fetchMotherboards() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/motherboards.csv";
  const rows = parseCSV(await downloadCSV(url));

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

export async function fetchMemoryKits() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/memory.csv";
  const rows = parseCSV(await downloadCSV(url));

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

export async function fetchPSUs() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/psus.csv";
  const rows = parseCSV(await downloadCSV(url));

  return rows.map(r => ({
    id: `psu-${r.Manufacturer}-${r.Model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    wattage: r.Wattage || null,
    efficiency: r.Efficiency || ""
  }));
}

export async function fetchCases() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/cases.csv";
  const rows = parseCSV(await downloadCSV(url));

  return rows.map(r => ({
    id: `case-${r.Manufacturer}-${r.Model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    formFactor: r.Type || "",
    maxGpuLength: r.MaxGpuLength || null
  }));
}

export async function fetchStorage() {
  const url = "https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/storage.csv";
  const rows = parseCSV(await downloadCSV(url));

  return rows.map(r => ({
    id: `sto-${r.Manufacturer}-${r.Model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
    brand: r.Manufacturer || "",
    model: r.Model || "",
    type: r.Interface || "",
    capacity: r.Capacity || ""
  }));
}
