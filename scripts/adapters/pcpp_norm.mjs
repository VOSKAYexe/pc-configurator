// scripts/adapters/pcpp_norm.mjs

const idify = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
const pick = (row, keys) => {
  for (const k of keys) {
    const v = row[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
};

// ===============================
// CPU
// ===============================
export function mapCpu(row) {
  const brand = pick(row, ["Manufacturer","Brand"]);
  const model = pick(row, ["Model","Name"]);
  const socket = pick(row, ["Socket"]);
  const tdp = Number(pick(row, ["TDP","TDP (W)"])) || 65;
  const igpu = /yes|true|igpu|integrated/i.test(pick(row, ["Integrated Graphics","iGPU"]));

  return {
    id: `cpu-${idify(`${brand} ${model}`)}`,
    brand, model, socket, tdp, igpu
  };
}

// ===============================
// GPU
// ===============================
export function mapGpu(row) {
  const brand = pick(row, ["Manufacturer","Brand"]);
  const model = pick(row, ["Model","Name"]);
  const tdp = Number(pick(row, ["TDP","TDP (W)"])) || undefined;
  const lengthMm = Number(pick(row, ["Length","Length (mm)"])) || undefined;

  return {
    id: `gpu-${idify(`${brand} ${model}`)}`,
    brand, model, tdp, lengthMm
  };
}

// ===============================
// Motherboard
// ===============================
export function mapMotherboard(row) {
  return {
    id: `mb-${idify(`${pick(row,["Manufacturer"])} ${pick(row,["Model"])}`)}`,
    brand: pick(row, ["Manufacturer"]),
    model: pick(row, ["Model"]),
    socket: pick(row, ["Socket"]),
    formFactor: pick(row, ["Form Factor"]),
    memoryType: pick(row, ["Memory Type"]),
    memorySlots: Number(pick(row, ["Memory Slots"])) || 4,
    m2Slots: Number(pick(row, ["M.2 Slots"])) || 0,
    sataPorts: Number(pick(row, ["SATA Ports"])) || 2
  };
}

// ===============================
// RAM
// ===============================
export function mapMemory(row) {
  const brand = pick(row, ["Manufacturer"]);
  const model = pick(row, ["Model"]);
  const type = pick(row, ["Type"]);
  const speed = Number(pick(row, ["Speed"]).replace(/\D+/g,"")) || 3200;

  return {
    id: `ram-${idify(`${brand} ${model}`)}`,
    brand, model,
    type,
    speedMhz: speed,
    capacity: pick(row, ["Capacity"])
  };
}

// ===============================
// PSU
// ===============================
export function mapPsu(row) {
  const brand = pick(row, ["Manufacturer"]);
  const model = pick(row, ["Model"]);

  return {
    id: `psu-${idify(`${brand} ${model}`)}`,
    brand, model,
    wattage: Number(pick(row, ["Wattage"]).replace(/\D+/g,"")) || 650,
    efficiency: pick(row, ["Efficiency"]) || "",
  };
}

// ===============================
// Case
// ===============================
export function mapCase(row) {
  const brand = pick(row, ["Manufacturer"]);
  const model = pick(row, ["Model"]);

  return {
    id: `case-${idify(`${brand} ${model}`)}`,
    brand, model,
    formFactors: pick(row, ["Form Factors"]),
    gpuMaxLen: Number(pick(row, ["GPU Max Length"]).replace(/\D+/g,"")) || undefined,
    coolerMaxH: Number(pick(row, ["CPU Cooler Max Height"]).replace(/\D+/g,"")) || undefined
  };
}

// ===============================
// Storage
// ===============================
export function mapStorage(row) {
  const brand = pick(row, ["Manufacturer"]);
  const model = pick(row, ["Model"]);
  return {
    id: `sto-${idify(`${brand} ${model}`)}`,
    brand, model,
    type: pick(row, ["Type"]),
    capacity: pick(row, ["Capacity"])
  };
}
