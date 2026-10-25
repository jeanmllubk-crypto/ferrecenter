/**
 * FerreCenter · Registro de ventas y reseñas (Google Apps Script)
 *
 * Va pegado dentro de la hoja de Google "FerreCenter - Ventas" (Extensiones > Apps Script).
 * Pasos completos en google/LEEME.md.
 *
 * Hojas que crea "configurar":
 *   - Ventas: todas las ventas, de la web (se registran solas) y de fuera de la web (formulario).
 *   - Reseñas: calificaciones de los clientes; solo se muestran en la web las que tienen "Sí" en "Aprobada".
 *   - Formulario: el "Registrar venta" para anotar desde el celular las ventas de la tienda, WhatsApp, etc.
 */

const HOJA_VENTAS = "Ventas";
const HOJA_RESENAS = "Reseñas";
const COLUMNAS_VENTAS = [
  "Fecha", "N° de pedido", "Canal", "Estado", "Cliente", "Teléfono", "Entrega", "Departamento", "Provincia", "Distrito",
  "Dirección", "Referencia", "Ubicación (mapa)", "Productos", "Códigos (SKU)", "Subtotal", "Envío", "Total", "Forma de pago", "Comentarios",
];
const COLUMNAS_RESENAS = ["Fecha", "N° de pedido", "SKU", "Producto", "Nombre", "Estrellas", "Comentario", "Aprobada"];
const ESTADOS = ["Pendiente", "Pagado", "Entregado", "Cancelado"];
const ZONA = "America/Lima";

// ───────────── Se ejecuta UNA vez desde el editor (botón ▶ Ejecutar con "configurar") ─────────────
function configurar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  libro.setSpreadsheetTimeZone(ZONA);

  const ventas = hoja_(HOJA_VENTAS, COLUMNAS_VENTAS);
  const estados = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).setAllowInvalid(false).build();
  ventas.getRange(2, COLUMNAS_VENTAS.indexOf("Estado") + 1, 2000, 1).setDataValidation(estados);
  ["Subtotal", "Envío", "Total"].forEach((c) => ventas.getRange(2, COLUMNAS_VENTAS.indexOf(c) + 1, 2000, 1).setNumberFormat('"S/." #,##0.00'));
  ventas.getRange(2, 1, 2000, 1).setNumberFormat("dd/mm/yyyy hh:mm");

  const resenas = hoja_(HOJA_RESENAS, COLUMNAS_RESENAS);
  const siNo = SpreadsheetApp.newDataValidation().requireValueInList(["Sí", "No"], true).build();
  resenas.getRange(2, COLUMNAS_RESENAS.indexOf("Aprobada") + 1, 2000, 1).setDataValidation(siNo);
  resenas.getRange(2, 1, 2000, 1).setNumberFormat("dd/mm/yyyy hh:mm");

  // Formulario para registrar ventas fuera de la web
  let form;
  const idForm = PropertiesService.getScriptProperties().getProperty("FORM_ID");
  if (idForm) form = FormApp.openById(idForm);
  else {
    form = FormApp.create("FerreCenter · Registrar venta");
    form.setDescription("Anota aquí las ventas que no pasan por la web (tienda, WhatsApp directo, Facebook…).");
    form.addMultipleChoiceItem().setTitle("Canal").setChoiceValues(["Tienda", "WhatsApp", "Facebook", "Instagram", "TikTok", "Otro"]).setRequired(true);
    form.addParagraphTextItem().setTitle("Productos").setHelpText("Uno por línea, con cantidad. Ej.: 2 x Casco de seguridad blanco").setRequired(true);
    form.addTextItem().setTitle("Total (S/.)").setRequired(true)
      .setValidation(FormApp.createTextValidation().requireNumber().setHelpText("Solo el número, ej.: 45.50").build());
    form.addMultipleChoiceItem().setTitle("Forma de pago").setChoiceValues(["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta", "Otro"]).setRequired(true);
    form.addTextItem().setTitle("Cliente (opcional)");
    form.addTextItem().setTitle("Teléfono (opcional)");
    form.addParagraphTextItem().setTitle("Comentarios (opcional)");
    PropertiesService.getScriptProperties().setProperty("FORM_ID", form.getId());
    ScriptApp.newTrigger("alEnviarFormulario").forForm(form).onFormSubmit().create();
  }

  Logger.log("Listo ✔");
  Logger.log("Enlace del formulario para registrar ventas (guárdalo en tu celular): " + form.getPublishedUrl());
}

// ───────────── Venta registrada con el formulario → fila en "Ventas" ─────────────
function alEnviarFormulario(e) {
  const r = {};
  e.response.getItemResponses().forEach((it) => (r[it.getItem().getTitle()] = it.getResponse()));
  const total = Number(String(r["Total (S/.)"] || "0").replace(",", "."));
  agregarVenta_({
    codigo: nuevoCodigo_("FV"),
    canal: r["Canal"],
    estado: "Entregado",
    cliente: r["Cliente (opcional)"] || "",
    telefono: r["Teléfono (opcional)"] || "",
    productos: r["Productos"],
    total: total,
    pago: r["Forma de pago"],
    notas: r["Comentarios (opcional)"] || "",
  });
}

// ───────────── La web llama aquí ─────────────
// POST (texto JSON): { accion: "pedido", … } o { accion: "resena", … }
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.accion === "pedido") return json_(registrarPedido_(d));
    if (d.accion === "resena") return json_(registrarResenas_(d));
    return json_({ ok: false, error: "Acción desconocida" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// GET ?accion=resenas&sku=XXX → reseñas aprobadas del producto
// GET ?accion=pedido&codigo=FC-… → productos del pedido (para la página "Califica tu compra")
function doGet(e) {
  const p = e.parameter || {};
  if (p.accion === "resenas") return json_({ ok: true, resenas: resenasAprobadas_(p.sku) });
  if (p.accion === "pedido") return json_(pedidoParaCalificar_(p.codigo));
  return json_({ ok: true, mensaje: "FerreCenter: registro activo" });
}

// ───────────── Pedidos de la web ─────────────
function registrarPedido_(d) {
  const codigo = limpiar_(d.codigo, 30);
  if (!/^FC-\d{6}-[A-Z0-9]{4}$/.test(codigo)) return { ok: false, error: "Código inválido" };
  if (filaDePedido_(codigo)) return { ok: true, repetido: true }; // el mismo pedido enviado dos veces
  const items = Array.isArray(d.items) ? d.items.slice(0, 60) : [];
  agregarVenta_({
    codigo: codigo,
    canal: "Web",
    estado: "Pendiente",
    cliente: limpiar_(d.nombre, 80),
    entrega: limpiar_(d.destino, 40),
    departamento: limpiar_(d.departamento, 40),
    provincia: limpiar_(d.provincia, 40),
    distrito: limpiar_(d.distrito, 60),
    direccion: limpiar_(d.direccion, 200),
    referencia: limpiar_(d.referencia, 200),
    ubicacion: limpiar_(d.ubicacion, 120),
    productos: items.map((i) => `${Number(i.cantidad) || 1} x ${limpiar_(i.nombre, 120)}`).join("\n"),
    skus: items.map((i) => limpiar_(i.sku, 30)).join(", "),
    subtotal: Number(d.subtotal) || 0,
    envio: Number(d.envio) || 0,
    total: Number(d.total) || 0,
    pago: limpiar_(d.pago, 40),
    notas: limpiar_(d.notas, 300),
  });
  return { ok: true };
}

function agregarVenta_(v) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_VENTAS);
  hoja.appendRow([
    new Date(), v.codigo, v.canal, v.estado, v.cliente || "", v.telefono || "", v.entrega || "", v.departamento || "", v.provincia || "",
    v.distrito || "", v.direccion || "", v.referencia || "", v.ubicacion || "", v.productos || "", v.skus || "", v.subtotal || "",
    v.envio || "", v.total || 0, v.pago || "", v.notas || "",
  ]);
}

// ───────────── Reseñas ─────────────
function pedidoParaCalificar_(codigo) {
  const fila = filaDePedido_(limpiar_(codigo, 30));
  if (!fila) return { ok: false, error: "No encontramos ese número de pedido." };
  const v = valoresVenta_(fila);
  if (v["Estado"] !== "Entregado") return { ok: false, error: "Podrás calificar tu compra cuando el pedido haya sido entregado." };
  const nombres = String(v["Productos"]).split("\n");
  const skus = String(v["Códigos (SKU)"]).split(",").map((s) => s.trim());
  const yaCalificados = new Set(filasResenas_().filter((r) => r["N° de pedido"] === v["N° de pedido"]).map((r) => r["SKU"]));
  const productos = skus.map((sku, i) => ({ sku: sku, nombre: (nombres[i] || sku).replace(/^\d+\s*x\s*/, ""), calificado: yaCalificados.has(sku) }));
  return { ok: true, nombre: String(v["Cliente"]).split(" ")[0], productos: productos };
}

function registrarResenas_(d) {
  const info = pedidoParaCalificar_(d.codigo);
  if (!info.ok) return info;
  const permitidos = {};
  info.productos.forEach((p) => (permitidos[p.sku] = p));
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_RESENAS);
  let guardadas = 0;
  (Array.isArray(d.resenas) ? d.resenas : []).forEach((r) => {
    const p = permitidos[r.sku];
    const estrellas = Math.round(Number(r.estrellas));
    if (!p || p.calificado || !(estrellas >= 1 && estrellas <= 5)) return;
    hoja.appendRow([new Date(), limpiar_(d.codigo, 30), p.sku, p.nombre, limpiar_(d.nombre, 40) || info.nombre, estrellas, limpiar_(r.comentario, 600), "No"]);
    p.calificado = true;
    guardadas++;
  });
  return guardadas ? { ok: true, guardadas: guardadas } : { ok: false, error: "No hay productos nuevos para calificar en este pedido." };
}

function resenasAprobadas_(sku) {
  return filasResenas_()
    .filter((r) => r["Aprobada"] === "Sí" && (!sku || r["SKU"] === sku))
    .map((r) => ({
      sku: r["SKU"],
      nombre: String(r["Nombre"] || "Cliente").split(" ")[0],
      estrellas: Number(r["Estrellas"]),
      comentario: r["Comentario"],
      fecha: Utilities.formatDate(new Date(r["Fecha"]), ZONA, "yyyy-MM-dd"),
    }))
    .reverse();
}

// ───────────── Utilidades ─────────────
function hoja_(nombre, columnas) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const h = libro.getSheetByName(nombre) || libro.insertSheet(nombre);
  h.getRange(1, 1, 1, columnas.length).setValues([columnas]).setFontWeight("bold").setBackground("#0a2a4e").setFontColor("#ffffff");
  h.setFrozenRows(1);
  return h;
}

function filaDePedido_(codigo) {
  if (!codigo) return 0;
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_VENTAS);
  const ultima = hoja.getLastRow();
  if (ultima < 2) return 0;
  const col = COLUMNAS_VENTAS.indexOf("N° de pedido") + 1;
  const codigos = hoja.getRange(2, col, ultima - 1, 1).getValues();
  for (let i = codigos.length - 1; i >= 0; i--) if (codigos[i][0] === codigo) return i + 2;
  return 0;
}

function valoresVenta_(fila) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_VENTAS);
  const v = hoja.getRange(fila, 1, 1, COLUMNAS_VENTAS.length).getValues()[0];
  const o = {};
  COLUMNAS_VENTAS.forEach((c, i) => (o[c] = v[i]));
  return o;
}

function filasResenas_() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_RESENAS);
  const ultima = hoja.getLastRow();
  if (ultima < 2) return [];
  return hoja.getRange(2, 1, ultima - 1, COLUMNAS_RESENAS.length).getValues().map((v) => {
    const o = {};
    COLUMNAS_RESENAS.forEach((c, i) => (o[c] = v[i]));
    return o;
  });
}

function nuevoCodigo_(prefijo) {
  const fecha = Utilities.formatDate(new Date(), ZONA, "yyMMdd");
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let azar = "";
  for (let i = 0; i < 4; i++) azar += letras[Math.floor(Math.random() * letras.length)];
  return `${prefijo}-${fecha}-${azar}`;
}

// Evita que un texto empiece con "=" (fórmula) y recorta el largo
function limpiar_(t, max) {
  return String(t == null ? "" : t).replace(/^[=+\-@]+/, "").trim().slice(0, max);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
