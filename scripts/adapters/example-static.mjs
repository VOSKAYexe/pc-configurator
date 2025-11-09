// scripts/adapters/example-static.mjs
// Exemple *ultra simple* : retourne quelques pièces codées en dur.
// Remplace ce fichier par de *vrais* adapters (APIs, CSV fabricants, etc.).
export async function fetchCpus(){ return [
  {id:"cpu-intel-12400f", brand:"Intel", model:"Core i5-12400F", socket:"LGA1700", tdp:65},
  {id:"cpu-amd-7600",     brand:"AMD",   model:"Ryzen 5 7600",   socket:"AM5",     tdp:65}
];}
export async function fetchMotherboards(){ return [
  {id:"mb-msi-b660m-a", brand:"MSI", model:"PRO B660M-A", socket:"LGA1700", formFactor:"mATX", memoryType:"DDR4", memorySlots:4, maxMemoryMhz:3200, m2Slots:2, sataPorts:4},
  {id:"mb-asus-b650m",  brand:"ASUS", model:"TUF B650M-PLUS", socket:"AM5", formFactor:"mATX", memoryType:"DDR5", memorySlots:4, maxMemoryMhz:6000, m2Slots:2, sataPorts:4}
];}
export async function fetchMemoryKits(){ return [
  {id:"ram-ddr4-2x8-3200", brand:"Corsair", model:"Vengeance LPX 2x8", type:"DDR4", modules:2, capacityPer:8, speedMhz:3200},
  {id:"ram-ddr5-2x16-6000", brand:"Kingston", model:"Fury Beast 2x16", type:"DDR5", modules:2, capacityPer:16, speedMhz:6000}
];}
export async function fetchGpus(){ return [
  {id:"gpu-4070", brand:"NVIDIA", model:"RTX 4070", tdp:200, powerConnectors:"12VHPWR", lengthMm:244},
  {id:"gpu-6700xt", brand:"AMD", model:"RX 6700 XT", tdp:230, powerConnectors:"2x8-pin", lengthMm:267}
];}
export async function fetchPsus(){ return [
  {id:"psu-rm750e", brand:"Corsair", model:"RM750e", wattage:750, pcie8:2, hppwr:1},
  {id:"psu-pp12m-650", brand:"BeQuiet!", model:"Pure Power 12 M 650", wattage:650, pcie8:2, hppwr:1}
];}
export async function fetchCases(){ return [
  {id:"case-h5", brand:"NZXT", model:"H5 Flow", supports:"ATX,mATX,ITX", gpuMaxLen:365, coolerMaxH:165},
  {id:"case-td300", brand:"Cooler Master", model:"TD300 Mesh", supports:"mATX,ITX", gpuMaxLen:344, coolerMaxH:166}
];}
export async function fetchCoolers(){ return [
  {id:"cool-ag400", brand:"DeepCool", model:"AG400", type:"AIR", heightMm:150},
  {id:"cool-lf2-240", brand:"Arctic", model:"Liquid Freezer II 240", type:"AIO", radiatorSize:"240"}
];}
export async function fetchStorage(){ return [
  {id:"sto-980-1tb", brand:"Samsung", model:"980 1TB", type:"NVMe"},
  {id:"sto-mx500-1tb", brand:"Crucial", model:"MX500 1TB", type:"SATA"}
];}
