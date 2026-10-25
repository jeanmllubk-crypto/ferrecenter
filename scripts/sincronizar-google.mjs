// Agrega a la pestaña "Productos" de la hoja de Google los productos del Excel que aún no están.
// Lleva SKU, nombre, marca, costo, precio, precio de oferta, stock inicial, stock mínimo y proveedor.
// No cambia costo, precio ni stock de los que ya están en la hoja (ahí se manejan desde entonces).
// Uso: npm run sincronizar-google
import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";

const RAIZ = process.cwd();
const EXCEL = path.join(RAIZ, "Catalogo_Productos_Herramientas.xlsx");
const COLUMNAS = {
  sku: ["sku / codigo", "sku", "codigo"],
  nombre: ["nombre del producto", "nombre"],
  marca: ["marca"],
  costo: ["precio compra (s/)", "precio compra", "costo"],
  precio: ["precio venta (s/)", "precio venta"],
  precioOferta: ["precio oferta (s/)", "precio oferta"],
  stock: ["stock actual", "stock"],
  stockMinimo: ["stock minimo"],
  proveedor: ["proveedor"],
  activo: ["activo"],
};

const normalizar = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const valor = (c) => {
  let v = c?.value;
  if (v && typeof v === "object") v = "result" in v ? v.result : v.text ?? (v.richText || []).map((r) => r.text).join("");
  return v ?? "";
};

// La URL sale de lib/config.js y la clave de .env.local (GOOGLE_TOKEN), que no se sube a GitHub
const url = fs.readFileSync(path.join(RAIZ, "lib", "config.js"), "utf8").match(/registroUrl:\s*"([^"]*)"/)?.[1];
const env = fs.existsSync(path.join(RAIZ, ".env.local")) ? fs.readFileSync(path.join(RAIZ, ".env.local"), "utf8") : "";
const token = env.match(/^GOOGLE_TOKEN=(.+)$/m)?.[1]?.trim();
if (!url || !token) {
  console.error("❌ Falta registroUrl en lib/config.js o GOOGLE_TOKEN en .env.local.");
  process.exit(1);
}

const libro = new ExcelJS.Workbook();
await libro.xlsx.readFile(EXCEL);
const hoja = libro.getWorksheet("Productos");
const indice = {};
hoja.getRow(3).eachCell((c, col) => {
  const enc = normalizar(valor(c));
  for (const [campo, alias] of Object.entries(COLUMNAS)) if (!indice[campo] && alias.includes(enc)) indice[campo] = col;
});
const leer = (fila, campo) => (indice[campo] ? valor(fila.getCell(indice[campo])) : "");

const productos = [];
for (let r = 4; r <= hoja.rowCount; r++) {
  const fila = hoja.getRow(r);
  const sku = String(leer(fila, "sku")).trim();
  if (!sku || !["si", "s", "yes", "x", "1", "true"].includes(normalizar(leer(fila, "activo")))) continue;
  productos.push(Object.fromEntries(Object.keys(COLUMNAS).filter((c) => c !== "activo").map((c) => [c, leer(fila, c)])));
}

const r = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({ accion: "sincronizar", token, productos }),
});
const res = await r.json();
if (!res.ok) {
  console.error(`❌ La hoja respondió: ${res.error}`);
  process.exit(1);
}
console.log(`✅ ${productos.length} productos revisados; ${res.agregados} nuevos agregados a la pestaña Productos.`);
