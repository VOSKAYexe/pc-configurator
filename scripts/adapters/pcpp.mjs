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
    headers.forEach((h,i)=>obj[h.trim()]=cols[i]?.trim());
    return obj;
  });
}

export async function fetchCPU() {
  const url="https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/cpus.csv";
  return parseCSV(await downloadCSV(url));
}

export async function fetchGPU() {
  const url="https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/gpus.csv";
  return parseCSV(await downloadCSV(url));
}

export async function fetchMotherboards() {
  const url="https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/motherboards.csv";
  return parseCSV(await downloadCSV(url));
}

export async function fetchMemory() {
  const url="https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/memory.csv";
  return parseCSV(await downloadCSV(url));
}

export async function fetchPSU() {
  const url="https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/psus.csv";
  return parseCSV(await downloadCSV(url));
}

export async function fetchCases() {
  const url="https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/cases.csv";
  return parseCSV(await downloadCSV(url));
}

export async function fetchStorage() {
  const url="https://raw.githubusercontent.com/jonbrooks/pcpp-data/master/storage.csv";
  return parseCSV(await downloadCSV(url));
}
