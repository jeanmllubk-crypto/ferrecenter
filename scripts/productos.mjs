// Convierte Catalogo_Productos_Herramientas.xlsx en data/productos.json
// y copia las fotos a public/productos/.
// Uso: npm run productos

import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import sizeOf from "image-size";

const RAIZ = process.cwd();
const EXCEL = path.join(RAIZ, "Catalogo_Productos_Herramientas.xlsx");
const HOJA = "Productos";
const FILA_ENCABEZADOS = 3;
const SALIDA = path.join(RAIZ, "data", "productos.json");
const DESTINO_FOTOS = path.join(RAIZ, "public", "productos");
// Se usa la primera carpeta de fotos que exista
const CARPETAS_FOTOS = ["fotos", "Imagenes de Productos"].map((c) => path.join(RAIZ, c));
const EXTENSIONES = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const TAMANO_RECOMENDADO = 800; // px del lado mayor; las fotos más pequeñas se ven borrosas en la ficha

// Encabezado del Excel -> campo interno (se comparan sin tildes ni mayúsculas)
const COLUMNAS = {
  sku: ["sku / codigo", "sku", "codigo"],
  nombre: ["nombre del producto", "nombre"],
  marca: ["marca"],
  categoria: ["categoria"],
  subcategoria: ["subcategoria"],
  modelo: ["modelo"],
  descripcion: ["descripcion corta", "descripcion"],
  descripcionLarga: ["descripcion larga", "descripcion completa", "informacion adicional"],
  especificaciones: ["especificaciones tecnicas", "especificaciones"],
  unidad: ["unidad"],
  precioVenta: ["precio venta (s/)", "precio venta"],
  precioOferta: ["precio oferta (s/)", "precio oferta"],
  stock: ["stock actual", "stock"],
  garantia: ["garantia"],
  peso: ["peso (kg)", "peso"],
  imagen: ["imagen (archivo)", "imagen", "imagenes"],
  destacado: ["destacado"],
  activo: ["activo"],
};

const normalizar = (t) =>
  String(t ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const slugify = (t) =>
  normalizar(t)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Devuelve el valor "visible" de una celda (resuelve fórmulas, enlaces y texto enriquecido)
function valorCelda(celda) {
  let v = celda?.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    if ("result" in v) v = v.result;
    else if ("richText" in v) v = v.richText.map((r) => r.text).join("");
    else if ("text" in v) v = v.text;
    else if (v instanceof Date) return v.toISOString();
    else if ("formula" in v || "sharedFormula" in v) return "";
  }
  return v ?? "";
}

const texto = (v) => String(v ?? "").trim();
const numero = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const esSi = (v) => ["si", "s", "yes", "x", "1", "true"].includes(normalizar(v));

function main() {
  return (async () => {
    if (!fs.existsSync(EXCEL)) {
      console.error(`❌ No se encontró ${path.basename(EXCEL)} en la carpeta del proyecto.`);
      process.exit(1);
    }

    const libro = new ExcelJS.Workbook();
    await libro.xlsx.readFile(EXCEL);
    const hoja = libro.getWorksheet(HOJA);
    if (!hoja) {
      console.error(`❌ El Excel no tiene una hoja llamada "${HOJA}".`);
      process.exit(1);
    }

    // Mapear columnas por su encabezado (así puedes reordenar columnas sin romper nada)
    const indice = {};
    hoja.getRow(FILA_ENCABEZADOS).eachCell((celda, col) => {
      const enc = normalizar(valorCelda(celda));
      for (const [campo, alias] of Object.entries(COLUMNAS)) {
        if (!indice[campo] && alias.includes(enc)) indice[campo] = col;
      }
    });
    for (const obligatorio of ["sku", "nombre", "precioVenta", "activo"]) {
      if (!indice[obligatorio]) {
        console.error(`❌ Falta la columna "${COLUMNAS[obligatorio][0]}" en la fila ${FILA_ENCABEZADOS}.`);
        process.exit(1);
      }
    }

    // Categorías definidas en la hoja "Listas" (para el menú aunque aún no tengan productos)
    const categoriasLista = [];
    const listas = libro.getWorksheet("Listas");
    if (listas) {
      let colCat = null;
      listas.getRow(1).eachCell((c, col) => {
        if (normalizar(valorCelda(c)).startsWith("categor")) colCat = col;
      });
      if (colCat) {
        for (let r = 2; r <= listas.rowCount; r++) {
          const v = texto(valorCelda(listas.getRow(r).getCell(colCat)));
          if (v) categoriasLista.push(v);
        }
      }
    }

    // Fotos disponibles
    const carpetaFotos = CARPETAS_FOTOS.find((c) => fs.existsSync(c));
    const archivosFotos = carpetaFotos ? fs.readdirSync(carpetaFotos) : [];
    const porNombre = new Map(archivosFotos.map((f) => [f.toLowerCase(), f]));
    fs.rmSync(DESTINO_FOTOS, { recursive: true, force: true });
    fs.mkdirSync(DESTINO_FOTOS, { recursive: true });

    const copiarFoto = (archivo) => {
      const destino = archivo.replace(/\s+/g, "-");
      fs.copyFileSync(path.join(carpetaFotos, archivo), path.join(DESTINO_FOTOS, destino));
      return `/productos/${encodeURIComponent(destino)}`;
    };

    const productos = [];
    const avisos = [];
    const skus = new Set();
    const leer = (fila, campo) => (indice[campo] ? valorCelda(fila.getCell(indice[campo])) : "");

    for (let r = FILA_ENCABEZADOS + 1; r <= hoja.rowCount; r++) {
      const fila = hoja.getRow(r);
      const sku = texto(leer(fila, "sku"));
      const nombre = texto(leer(fila, "nombre"));
      if (!sku && !nombre) continue;
      if (!esSi(leer(fila, "activo"))) continue;

      if (!sku || !nombre) {
        avisos.push(`Fila ${r}: falta SKU o nombre, se omitió.`);
        continue;
      }
      if (skus.has(sku)) {
        avisos.push(`Fila ${r}: el SKU ${sku} está repetido, se omitió.`);
        continue;
      }
      skus.add(sku);

      const precio = numero(leer(fila, "precioVenta"));
      if (precio === null || precio <= 0) {
        avisos.push(`Fila ${r} (${sku}): no tiene precio de venta, se omitió.`);
        continue;
      }
      let precioOferta = numero(leer(fila, "precioOferta"));
      if (precioOferta !== null && (precioOferta <= 0 || precioOferta >= precio)) precioOferta = null;
      const precioFinal = precioOferta ?? precio;

      // Imágenes: la(s) de la columna Imagen (separadas por coma o ;) + SKU-2.jpg, SKU-3.jpg...
      const nombresImagen = texto(leer(fila, "imagen"))
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const extras = [];
      for (let n = 2; n <= 8; n++) {
        for (const sep of ["-", "_", " "]) {
          for (const ext of EXTENSIONES) extras.push(`${sku}${sep}${n}${ext}`);
        }
      }
      const imagenes = [];
      const tamanos = []; // tamaño real de cada foto, para no estirarla de más en la web
      for (const archivo of [...nombresImagen, ...extras]) {
        const real = porNombre.get(archivo.toLowerCase());
        if (real) {
          const url = copiarFoto(real);
          if (imagenes.includes(url)) continue;
          imagenes.push(url);
          let t = { ancho: 0, alto: 0 };
          try {
            const d = sizeOf(fs.readFileSync(path.join(carpetaFotos, real)));
            t = { ancho: d.width, alto: d.height };
          } catch {}
          tamanos.push(t);
          if (t.ancho && Math.max(t.ancho, t.alto) < TAMANO_RECOMENDADO) {
            avisos.push(`${sku}: la foto "${real}" es pequeña (${t.ancho}×${t.alto}); se verá borrosa. Usa una de ${TAMANO_RECOMENDADO} px o más.`);
          }
        }
      }
      if (nombresImagen.length && !imagenes.length) {
        avisos.push(`${sku}: no se encontró la foto "${nombresImagen[0]}", se usará la imagen genérica.`);
      }

      const especificaciones = texto(leer(fila, "especificaciones"))
        .split(/[;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const i = s.indexOf(":");
          return i > 0 ? { nombre: s.slice(0, i).trim(), valor: s.slice(i + 1).trim() } : { nombre: "", valor: s };
        });

      const marca = texto(leer(fila, "marca")) || "Otra";
      const categoria = texto(leer(fila, "categoria")) || "Otros";
      const subcategoria = texto(leer(fila, "subcategoria"));
      const stockNum = numero(leer(fila, "stock"));

      productos.push({
        sku,
        slug: slugify(`${nombre}-${sku}`),
        nombre,
        marca,
        marcaSlug: slugify(marca),
        categoria,
        categoriaSlug: slugify(categoria),
        subcategoria,
        subcategoriaSlug: subcategoria ? slugify(subcategoria) : "",
        modelo: texto(leer(fila, "modelo")),
        descripcion: texto(leer(fila, "descripcion")),
        // Cada salto de línea en la celda (Alt + Enter) es un párrafo nuevo
        descripcionLarga: texto(leer(fila, "descripcionLarga"))
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean),
        especificaciones,
        unidad: texto(leer(fila, "unidad")) || "Unidad",
        precio,
        precioOferta,
        precioFinal,
        descuento: precioOferta ? Math.round((1 - precioOferta / precio) * 100) : 0,
        stock: stockNum === null ? 0 : Math.max(0, Math.floor(stockNum)),
        garantia: texto(leer(fila, "garantia")),
        peso: numero(leer(fila, "peso")),
        imagenes,
        tamanos,
        destacado: esSi(leer(fila, "destacado")),
        orden: r, // posición en el Excel: filas más abajo = más nuevos
      });
    }

    // Categorías con sus subcategorías
    const mapaCat = new Map();
    for (const nombre of categoriasLista) {
      mapaCat.set(slugify(nombre), { nombre, slug: slugify(nombre), cantidad: 0, subcategorias: [] });
    }
    for (const p of productos) {
      if (!mapaCat.has(p.categoriaSlug)) {
        mapaCat.set(p.categoriaSlug, { nombre: p.categoria, slug: p.categoriaSlug, cantidad: 0, subcategorias: [] });
      }
      const cat = mapaCat.get(p.categoriaSlug);
      cat.cantidad++;
      if (p.subcategoria) {
        let sub = cat.subcategorias.find((s) => s.slug === p.subcategoriaSlug);
        if (!sub) cat.subcategorias.push((sub = { nombre: p.subcategoria, slug: p.subcategoriaSlug, cantidad: 0 }));
        sub.cantidad++;
      }
    }

    const mapaMarca = new Map();
    for (const p of productos) {
      const m = mapaMarca.get(p.marcaSlug) || { nombre: p.marca, slug: p.marcaSlug, cantidad: 0 };
      m.cantidad++;
      mapaMarca.set(p.marcaSlug, m);
    }

    const datos = {
      generado: new Date().toISOString(),
      productos,
      categorias: [...mapaCat.values()],
      marcas: [...mapaMarca.values()].sort((a, b) => b.cantidad - a.cantidad),
    };

    fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
    fs.writeFileSync(SALIDA, JSON.stringify(datos, null, 2));

    console.log(`✅ ${productos.length} productos activos guardados en data/productos.json`);
    console.log(`   Fotos: ${carpetaFotos ? path.basename(carpetaFotos) : "(no se encontró carpeta 'fotos')"} → public/productos`);
    for (const a of avisos) console.log(`⚠️  ${a}`);
  })();
}

main().catch((e) => {
  if (e.code === "EBUSY" || e.code === "EPERM") {
    console.error("❌ No se pudo leer el Excel. Ciérralo en Excel y vuelve a intentarlo.");
  } else {
    console.error("❌ Error:", e.message);
  }
  process.exit(1);
});
