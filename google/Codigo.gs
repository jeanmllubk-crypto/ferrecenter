/**
 * FerreCenter · Control de ventas, stock, ganancias y reseñas (Google Apps Script)
 *
 * Va pegado dentro de la hoja de Google "FerreCenter - Ventas" (Extensiones > Apps Script).
 * Pasos completos en google/LEEME.md.
 *
 * Pestañas que crea "configurar":
 *   - Ventas: una fila por venta (web o fuera de la web), con su canal y estado.
 *   - Detalle: una fila por producto vendido, con costo y ganancia.
 *   - Productos: costo, precio, stock y alertas. MANDA en la web: de aquí salen el precio y el stock que se muestran.
 *   - Entradas: mercadería que compras (suma al stock).
 *   - Resumen: ventas y ganancia del mes, por canal, productos más vendidos y stock bajo.
 *   - Reseñas: calificaciones de los clientes; en la web solo salen las que tienen "Sí" en "Aprobada".
 * Formularios: "Registrar venta" (ventas fuera de la web) y "Registrar compra" (entradas de mercadería).
 */

// Clave para que solo la computadora de la tienda pueda cargar productos nuevos. Se rellena al copiar el código.
const TOKEN_SINCRONIZAR = "";

const ZONA = "America/Lima";
const HOJAS = {
  ventas: "Ventas",
  detalle: "Detalle",
  productos: "Productos",
  entradas: "Entradas",
  resumen: "Resumen",
  resenas: "Reseñas",
};
const COL = {
  ventas: [
    "Fecha", "N° de pedido", "Canal", "Estado", "Cliente", "Teléfono", "Entrega", "Departamento", "Provincia", "Distrito",
    "Dirección", "Referencia", "Ubicación (mapa)", "Productos", "Códigos (SKU)", "Subtotal", "Envío", "Total", "Forma de pago", "Comentarios",
  ],
  detalle: ["Fecha", "N° de pedido", "Canal", "Estado", "SKU", "Producto", "Cantidad", "Precio unit.", "Subtotal", "Costo unit.", "Costo total", "Ganancia"],
  productos: [
    "SKU", "Producto", "Marca", "Costo (S/.)", "Precio (S/.)", "Precio oferta (S/.)", "Stock inicial",
    "Entradas", "Vendidos", "Stock actual", "Stock mínimo", "Alerta", "Proveedor",
  ],
  entradas: ["Fecha", "SKU", "Producto", "Cantidad", "Costo unit.", "Total", "Proveedor", "Notas"],
  resenas: ["Fecha", "N° de pedido", "SKU", "Producto", "Nombre", "Estrellas", "Comentario", "Aprobada"],
};
const CANALES = ["Web", "Tienda", "WhatsApp", "Facebook", "Instagram", "TikTok", "Otro"];
const ESTADOS = ["Pendiente", "Pagado", "Entregado", "Cancelado"];
const PAGOS = ["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta", "Otro"];
const RANURAS = 5; // cuántos productos distintos se pueden anotar en una venta del formulario
const SOLES = '"S/." #,##0.00';

// ═════════════ Menú en la hoja ═════════════
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("FerreCenter")
    .addItem("Actualizar la web (precios y stock)", "actualizarWeb")
    .addItem("Actualizar listas de productos de los formularios", "actualizarFormularios")
    .addSeparator()
    .addItem("Ver enlaces de los formularios", "verEnlaces")
    .addItem("Guardar enlace de Netlify (build hook)", "guardarEnlaceNetlify")
    .addToUi();
}

// ═════════════ Se ejecuta desde el editor (▶ Ejecutar con "configurar"). Se puede repetir sin perder datos ═════════════
function configurar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  libro.setSpreadsheetTimeZone(ZONA);

  // Ventas
  const ventas = hoja_(HOJAS.ventas, COL.ventas);
  lista_(ventas, COL.ventas.indexOf("Canal") + 1, CANALES);
  lista_(ventas, COL.ventas.indexOf("Estado") + 1, ESTADOS);
  formato_(ventas, ["Subtotal", "Envío", "Total"], COL.ventas, SOLES);
  formato_(ventas, ["Fecha"], COL.ventas, "dd/mm/yyyy hh:mm");

  // Detalle
  const detalle = hoja_(HOJAS.detalle, COL.detalle);
  formato_(detalle, ["Precio unit.", "Subtotal", "Costo unit.", "Costo total", "Ganancia"], COL.detalle, SOLES);
  formato_(detalle, ["Fecha"], COL.detalle, "dd/mm/yyyy hh:mm");

  // Entradas (va antes que Productos porque sus fórmulas la usan)
  const entradas = hoja_(HOJAS.entradas, COL.entradas);
  formato_(entradas, ["Costo unit.", "Total"], COL.entradas, SOLES);
  formato_(entradas, ["Fecha"], COL.entradas, "dd/mm/yyyy hh:mm");

  // Productos (las columnas Entradas, Vendidos, Stock actual y Alerta se calculan solas)
  const productos = hoja_(HOJAS.productos, COL.productos);
  formato_(productos, ["Costo (S/.)", "Precio (S/.)", "Precio oferta (S/.)"], COL.productos, SOLES);
  productos.getRange("H2").setFormula('=ARRAYFORMULA(IF(A2:A="","",SUMIF(Entradas!B2:B,A2:A,Entradas!D2:D)))');
  // Vendidos = todo lo del Detalle menos lo cancelado (SUMIFS no funciona dentro de ARRAYFORMULA; SUMIF sí)
  productos.getRange("I2").setFormula(
    '=ARRAYFORMULA(IF(A2:A="","",SUMIF(Detalle!E2:E,A2:A,Detalle!G2:G)-SUMIF(Detalle!E2:E&"|"&Detalle!D2:D,A2:A&"|Cancelado",Detalle!G2:G)))'
  );
  productos.getRange("J2").setFormula('=ARRAYFORMULA(IF(A2:A="","",IF(G2:G="",0,G2:G)+H2:H-I2:I))');
  productos.getRange("L2").setFormula('=ARRAYFORMULA(IF(A2:A="","",IF(J2:J<=0,"Agotado",IF(J2:J<=K2:K,"Stock bajo","OK"))))');
  productos.getRange("H1:J1").setBackground("#1f6f43");
  productos.getRange("L1").setBackground("#1f6f43");
  const reglas = [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Agotado").setBackground("#fde2e2").setFontColor("#b91c1c").setRanges([productos.getRange("L2:L")]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Stock bajo").setBackground("#fff4d6").setFontColor("#a16207").setRanges([productos.getRange("L2:L")]).build(),
  ];
  productos.setConditionalFormatRules(reglas);

  // Reseñas
  const resenas = hoja_(HOJAS.resenas, COL.resenas);
  lista_(resenas, COL.resenas.indexOf("Aprobada") + 1, ["Sí", "No"]);
  formato_(resenas, ["Fecha"], COL.resenas, "dd/mm/yyyy hh:mm");

  armarResumen_();
  armarFormularios_();

  // Se borra la hoja vacía que Google crea al inicio
  ["Hoja 1", "Hoja1", "Sheet1"].forEach((n) => {
    const h = libro.getSheetByName(n);
    if (h && h.getLastRow() === 0 && libro.getSheets().length > 1) libro.deleteSheet(h);
  });
  libro.setActiveSheet(libro.getSheetByName(HOJAS.resumen));
  libro.moveActiveSheet(1);

  Logger.log("Listo ✔");
  Logger.log(textoEnlaces_()); // solo en el registro: una ventana aquí dejaría el editor esperando
}

// ═════════════ Resumen ═════════════
function armarResumen_() {
  const h = hoja_(HOJAS.resumen, []);
  h.clear();
  h.setFrozenRows(0);
  const vendido = 'Detalle!D2:D<>"Cancelado",Detalle!D2:D<>"Pendiente"'; // solo ventas pagadas o entregadas
  const delMes = 'TEXT(Detalle!A2:A,"yyyymm")=TEXT(TODAY(),"yyyymm")';
  h.getRange("A1").setValue("FerreCenter · Resumen").setFontSize(16).setFontWeight("bold");
  h.getRange("A2").setValue("Cuenta las ventas en estado Pagado o Entregado. El stock ya descuenta también los pedidos Pendientes.").setFontColor("#666666");

  const tarjetas = [
    ["Ventas del mes", `=SUMPRODUCT((${delMes})*(Detalle!D2:D<>"Cancelado")*(Detalle!D2:D<>"Pendiente")*Detalle!I2:I)`, SOLES],
    ["Ganancia del mes", `=SUMPRODUCT((${delMes})*(Detalle!D2:D<>"Cancelado")*(Detalle!D2:D<>"Pendiente")*Detalle!L2:L)`, SOLES],
    ["Pedidos pendientes", '=COUNTIF(Ventas!D2:D,"Pendiente")', "0"],
    ["Productos con stock bajo o agotados", '=COUNTIF(Productos!L2:L,"Stock bajo")+COUNTIF(Productos!L2:L,"Agotado")', "0"],
  ];
  tarjetas.forEach(([t, f, fmt], i) => {
    h.getRange(4, 1 + i * 2).setValue(t).setFontColor("#555555");
    h.getRange(5, 1 + i * 2).setFormula(f).setNumberFormat(fmt).setFontSize(18).setFontWeight("bold").setFontColor("#0a2a4e");
  });

  const titulo = (celda, texto) => h.getRange(celda).setValue(texto).setFontWeight("bold").setFontColor("#ffffff").setBackground("#0a2a4e");
  titulo("A8", "Ventas por canal (este mes)");
  h.getRange("A9").setFormula(
    `=IFERROR(QUERY({Detalle!C2:C,Detalle!I2:I,Detalle!L2:L,Detalle!A2:A,Detalle!D2:D},"select Col1, sum(Col2), sum(Col3) where Col5 <> 'Cancelado' and Col5 <> 'Pendiente' and Col4 >= date '"&TEXT(EOMONTH(TODAY(),-1)+1,"yyyy-mm-dd")&"' group by Col1 label Col1 'Canal', sum(Col2) 'Ventas', sum(Col3) 'Ganancia'",0),"Aún no hay ventas este mes")`
  );
  titulo("E8", "Ventas por mes");
  h.getRange("E9").setFormula(
    `=IFERROR(QUERY({Detalle!A2:A,Detalle!I2:I,Detalle!L2:L,Detalle!D2:D},"select year(Col1), month(Col1)+1, sum(Col2), sum(Col3) where Col1 is not null and Col4 <> 'Cancelado' and Col4 <> 'Pendiente' group by year(Col1), month(Col1)+1 order by year(Col1) desc, month(Col1)+1 desc label year(Col1) 'Año', month(Col1)+1 'Mes', sum(Col2) 'Ventas', sum(Col3) 'Ganancia'",0),"Aún no hay ventas")`
  );
  titulo("A22", "Productos más vendidos");
  h.getRange("A23").setFormula(
    `=IFERROR(QUERY({Detalle!F2:F,Detalle!G2:G,Detalle!I2:I,Detalle!L2:L,Detalle!D2:D},"select Col1, sum(Col2), sum(Col3), sum(Col4) where Col1 is not null and Col5 <> 'Cancelado' and Col5 <> 'Pendiente' group by Col1 order by sum(Col2) desc limit 10 label Col1 'Producto', sum(Col2) 'Unidades', sum(Col3) 'Ventas', sum(Col4) 'Ganancia'",0),"Aún no hay ventas")`
  );
  titulo("F22", "Stock bajo o agotado");
  h.getRange("F23").setFormula(
    `=IFERROR(FILTER({Productos!A2:A,Productos!B2:B,Productos!J2:J,Productos!K2:K,Productos!L2:L},(Productos!L2:L="Stock bajo")+(Productos!L2:L="Agotado")),"Todo con stock suficiente ✔")`
  );
  ["B9:C40", "G9:H40", "C23:D40"].forEach((r) => h.getRange(r).setNumberFormat(SOLES));
  h.setColumnWidths(1, 10, 130);
}

// ═════════════ Formularios ═════════════
function armarFormularios_() {
  const props = PropertiesService.getScriptProperties();

  // Registrar venta (fuera de la web)
  const venta = formulario_("FORM_ID", "FerreCenter · Registrar venta", "Anota aquí las ventas que no pasan por la web (tienda, WhatsApp directo, Facebook…).");
  venta.addListItem().setTitle("Canal").setChoiceValues(CANALES.filter((c) => c !== "Web")).setRequired(true);
  for (let i = 1; i <= RANURAS; i++) {
    venta.addListItem().setTitle(`Producto ${i}`).setChoiceValues(["(cargando…)"]).setRequired(i === 1);
    venta.addTextItem().setTitle(`Cantidad ${i}`).setRequired(i === 1)
      .setValidation(FormApp.createTextValidation().requireWholeNumber().setHelpText("Solo números enteros, ej.: 2").build());
  }
  venta.addTextItem().setTitle("Total cobrado (S/.)").setHelpText("Déjalo vacío si cobraste el precio normal. Llénalo si hiciste descuento.")
    .setValidation(FormApp.createTextValidation().requireNumber().setHelpText("Solo el número, ej.: 45.50").build());
  venta.addListItem().setTitle("Forma de pago").setChoiceValues(PAGOS).setRequired(true);
  venta.addTextItem().setTitle("Cliente (opcional)");
  venta.addTextItem().setTitle("Teléfono (opcional)");
  venta.addParagraphTextItem().setTitle("Comentarios (opcional)");
  disparador_(venta, "alEnviarFormulario");

  // Registrar compra (entrada de mercadería)
  const compra = formulario_("FORM_COMPRA_ID", "FerreCenter · Registrar compra", "Anota la mercadería que llega del proveedor. Se suma al stock.");
  compra.addListItem().setTitle("Producto").setChoiceValues(["(cargando…)"]).setRequired(true);
  compra.addTextItem().setTitle("Cantidad").setRequired(true)
    .setValidation(FormApp.createTextValidation().requireWholeNumber().setHelpText("Solo números enteros").build());
  compra.addTextItem().setTitle("Costo unitario (S/.)").setHelpText("Si lo llenas, se actualiza el costo del producto para calcular la ganancia.")
    .setValidation(FormApp.createTextValidation().requireNumber().setHelpText("Solo el número, ej.: 12.50").build());
  compra.addTextItem().setTitle("Proveedor (opcional)");
  compra.addParagraphTextItem().setTitle("Notas (opcional)");
  disparador_(compra, "alEnviarCompra");

  props.setProperty("FORMS_LISTOS", "1");
  actualizarFormularios();
}

// Crea el formulario o, si ya existe, lo vacía para rehacer sus preguntas (el enlace no cambia)
function formulario_(clave, titulo, descripcion) {
  const props = PropertiesService.getScriptProperties();
  let f;
  const id = props.getProperty(clave);
  if (id) {
    f = FormApp.openById(id);
    f.getItems().forEach((it) => f.deleteItem(it));
  } else {
    f = FormApp.create(titulo);
    props.setProperty(clave, f.getId());
  }
  f.setTitle(titulo).setDescription(descripcion);
  return f;
}

function disparador_(form, funcion) {
  const existe = ScriptApp.getProjectTriggers().some((t) => t.getHandlerFunction() === funcion && t.getTriggerSourceId() === form.getId());
  if (!existe) ScriptApp.newTrigger(funcion).forForm(form).onFormSubmit().create();
}

// Pone en las listas de los formularios todos los productos de la pestaña Productos
function actualizarFormularios() {
  const opciones = productos_().map((p) => `${p.sku} · ${p.nombre}`);
  const lista = opciones.length ? opciones : ["(primero carga productos)"];
  const props = PropertiesService.getScriptProperties();
  [props.getProperty("FORM_ID"), props.getProperty("FORM_COMPRA_ID")].filter(Boolean).forEach((id) => {
    FormApp.openById(id).getItems(FormApp.ItemType.LIST).forEach((it) => {
      if (/^Producto/.test(it.getTitle())) it.asListItem().setChoiceValues(lista);
    });
  });
}

function textoEnlaces_() {
  const props = PropertiesService.getScriptProperties();
  const enlace = (clave) => (props.getProperty(clave) ? FormApp.openById(props.getProperty(clave)).getPublishedUrl() : "(aún no creado: ejecuta configurar)");
  return `Registrar venta: ${enlace("FORM_ID")}\nRegistrar compra: ${enlace("FORM_COMPRA_ID")}`;
}

// Desde el menú de la hoja: muestra los enlaces en una ventana
function verEnlaces() {
  SpreadsheetApp.getUi().alert("Enlaces de los formularios (guárdalos en tu celular)", textoEnlaces_(), SpreadsheetApp.getUi().ButtonSet.OK);
}

// ═════════════ Formularios → hoja ═════════════
// Venta de fuera de la web: fila en Ventas + una fila por producto en Detalle
function alEnviarFormulario(e) {
  const r = respuestas_(e);
  const catalogo = mapaProductos_();
  let lineas = [];
  for (let i = 1; i <= RANURAS; i++) {
    const sku = String(r[`Producto ${i}`] || "").split(" · ")[0].trim();
    const cant = Math.floor(Number(r[`Cantidad ${i}`]));
    const p = catalogo[sku];
    if (!p || !(cant > 0)) continue;
    lineas.push({ sku: sku, nombre: p.nombre, cantidad: cant, precio: p.oferta || p.precio || 0 });
  }
  if (!lineas.length) return;
  const lista = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const cobrado = Number(String(r["Total cobrado (S/.)"] || "").replace(",", "."));
  // Si hubo descuento, el precio de cada producto se ajusta en la misma proporción
  if (cobrado > 0 && lista > 0 && Math.abs(cobrado - lista) > 0.009) {
    lineas = lineas.map((l) => ({ ...l, precio: Math.round(((l.precio * cobrado) / lista) * 100) / 100 }));
  }
  const total = cobrado > 0 ? cobrado : lista;
  const codigo = nuevoCodigo_("FV");
  agregarVenta_({
    codigo: codigo,
    canal: r["Canal"],
    estado: "Entregado",
    cliente: r["Cliente (opcional)"] || "",
    telefono: r["Teléfono (opcional)"] || "",
    productos: lineas.map((l) => `${l.cantidad} x ${l.nombre}`).join("\n"),
    skus: lineas.map((l) => l.sku).join(", "),
    subtotal: total,
    total: total,
    pago: r["Forma de pago"],
    notas: r["Comentarios (opcional)"] || "",
  });
  agregarDetalle_(codigo, r["Canal"], lineas, catalogo);
}

// Compra al proveedor: fila en Entradas (suma al stock) y actualiza el costo del producto
function alEnviarCompra(e) {
  const r = respuestas_(e);
  const sku = String(r["Producto"] || "").split(" · ")[0].trim();
  const catalogo = mapaProductos_();
  const p = catalogo[sku];
  const cant = Math.floor(Number(r["Cantidad"]));
  if (!p || !(cant > 0)) return;
  const costo = Number(String(r["Costo unitario (S/.)"] || "").replace(",", "."));
  libro_().getSheetByName(HOJAS.entradas).appendRow([
    new Date(), sku, p.nombre, cant, costo > 0 ? costo : "", costo > 0 ? costo * cant : "", r["Proveedor (opcional)"] || "", r["Notas (opcional)"] || "",
  ]);
  if (costo > 0) libro_().getSheetByName(HOJAS.productos).getRange(p.fila, COL.productos.indexOf("Costo (S/.)") + 1).setValue(costo);
}

function respuestas_(e) {
  const r = {};
  e.response.getItemResponses().forEach((it) => (r[it.getItem().getTitle()] = it.getResponse()));
  return r;
}

// ═════════════ La web llama aquí ═════════════
// POST (texto JSON): { accion: "pedido" | "resena" | "sincronizar", … }
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.accion === "pedido") return json_(registrarPedido_(d));
    if (d.accion === "resena") return json_(registrarResenas_(d));
    if (d.accion === "sincronizar") return json_(sincronizarCatalogo_(d));
    return json_({ ok: false, error: "Acción desconocida" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// GET ?accion=productos → precio y stock de cada producto (la web los usa al publicarse)
// GET ?accion=resenas&sku=XXX → reseñas aprobadas · GET ?accion=pedido&codigo=FC-… → pedido para calificar
function doGet(e) {
  const p = e.parameter || {};
  if (p.accion === "productos") {
    return json_({
      ok: true,
      productos: productos_().map((x) => ({ sku: x.sku, precio: x.precio, precioOferta: x.oferta || null, stock: Math.max(0, Math.floor(x.stock)) })),
    });
  }
  if (p.accion === "resenas") return json_({ ok: true, resenas: resenasAprobadas_(p.sku) });
  if (p.accion === "pedido") return json_(pedidoParaCalificar_(p.codigo));
  return json_({ ok: true, mensaje: "FerreCenter: registro activo" });
}

// ═════════════ Pedidos de la web ═════════════
function registrarPedido_(d) {
  const codigo = limpiar_(d.codigo, 30);
  if (!/^FC-\d{6}-[A-Z0-9]{4}$/.test(codigo)) return { ok: false, error: "Código inválido" };
  if (filaDePedido_(codigo)) return { ok: true, repetido: true }; // el mismo pedido enviado dos veces
  const items = (Array.isArray(d.items) ? d.items.slice(0, 60) : []).map((i) => ({
    sku: limpiar_(i.sku, 30),
    nombre: limpiar_(i.nombre, 120),
    cantidad: Math.max(1, Math.floor(Number(i.cantidad) || 1)),
    precio: Number(i.precio) || 0,
  }));
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
    productos: items.map((i) => `${i.cantidad} x ${i.nombre}`).join("\n"),
    skus: items.map((i) => i.sku).join(", "),
    subtotal: Number(d.subtotal) || 0,
    envio: Number(d.envio) || 0,
    total: Number(d.total) || 0,
    pago: limpiar_(d.pago, 40),
    notas: limpiar_(d.notas, 300),
  });
  agregarDetalle_(codigo, "Web", items, mapaProductos_());
  return { ok: true };
}

function agregarVenta_(v) {
  libro_().getSheetByName(HOJAS.ventas).appendRow([
    new Date(), v.codigo, v.canal, v.estado, v.cliente || "", v.telefono || "", v.entrega || "", v.departamento || "", v.provincia || "",
    v.distrito || "", v.direccion || "", v.referencia || "", v.ubicacion || "", v.productos || "", v.skus || "", v.subtotal || "",
    v.envio || "", v.total || 0, v.pago || "", v.notas || "",
  ]);
}

// Una fila por producto, con el costo del momento (así la ganancia no cambia si luego sube el costo)
function agregarDetalle_(codigo, canal, lineas, catalogo) {
  const hoja = libro_().getSheetByName(HOJAS.detalle);
  const ahora = new Date();
  lineas.forEach((l) => {
    const costo = catalogo[l.sku] && catalogo[l.sku].costo > 0 ? catalogo[l.sku].costo : "";
    const subtotal = Math.round(l.precio * l.cantidad * 100) / 100;
    hoja.appendRow([
      ahora, codigo, canal, "", l.sku, l.nombre, l.cantidad, l.precio, subtotal,
      costo, costo === "" ? "" : costo * l.cantidad, costo === "" ? "" : Math.round((subtotal - costo * l.cantidad) * 100) / 100,
    ]);
    const fila = hoja.getLastRow();
    // El estado se copia solo desde Ventas: si cambias el estado allá, se actualiza aquí
    hoja.getRange(fila, 4).setFormula(`=IFERROR(INDEX(Ventas!D:D,MATCH(B${fila},Ventas!B:B,0)),"")`);
  });
}

// ═════════════ Productos ═════════════
// Lee la pestaña Productos: [{ sku, nombre, costo, precio, oferta, stock, fila }]
function productos_() {
  const hoja = libro_().getSheetByName(HOJAS.productos);
  if (!hoja || hoja.getLastRow() < 2) return [];
  const c = (n) => COL.productos.indexOf(n);
  return hoja.getRange(2, 1, hoja.getLastRow() - 1, COL.productos.length).getValues()
    .map((v, i) => ({
      sku: String(v[c("SKU")]).trim(),
      nombre: String(v[c("Producto")]).trim(),
      costo: Number(v[c("Costo (S/.)")]) || 0,
      precio: Number(v[c("Precio (S/.)")]) || 0,
      oferta: Number(v[c("Precio oferta (S/.)")]) || 0,
      stock: Number(v[c("Stock actual")]) || 0,
      fila: i + 2,
    }))
    .filter((p) => p.sku);
}

function mapaProductos_() {
  const m = {};
  productos_().forEach((p) => (m[p.sku] = p));
  return m;
}

// Agrega a Productos los que aún no están (desde el Excel del catálogo). Nunca cambia costo, precio ni stock ya cargados.
function sincronizarCatalogo_(d) {
  if (!TOKEN_SINCRONIZAR || d.token !== TOKEN_SINCRONIZAR) return { ok: false, error: "Sin permiso" };
  const hoja = libro_().getSheetByName(HOJAS.productos);
  const existentes = mapaProductos_();
  const c = (n) => COL.productos.indexOf(n) + 1;
  let agregados = 0;
  let fila = Math.max(2, hoja.getRange("A:A").getValues().filter((x) => String(x[0]).trim() !== "").length + 1);
  (Array.isArray(d.productos) ? d.productos.slice(0, 1000) : []).forEach((p) => {
    const sku = limpiar_(p.sku, 30);
    if (!sku) return;
    if (existentes[sku]) {
      // Solo se actualizan nombre y marca (por si cambiaron en el catálogo)
      hoja.getRange(existentes[sku].fila, c("Producto"), 1, 2).setValues([[limpiar_(p.nombre, 150), limpiar_(p.marca, 40)]]);
      return;
    }
    // Se escribe por partes para no pisar las columnas que se calculan solas
    hoja.getRange(fila, c("SKU"), 1, 7).setValues([[
      sku, limpiar_(p.nombre, 150), limpiar_(p.marca, 40), num_(p.costo), num_(p.precio), num_(p.precioOferta), num_(p.stock) === "" ? 0 : num_(p.stock),
    ]]);
    hoja.getRange(fila, c("Stock mínimo")).setValue(num_(p.stockMinimo));
    hoja.getRange(fila, c("Proveedor")).setValue(limpiar_(p.proveedor, 80));
    fila++;
    agregados++;
  });
  actualizarFormularios();
  return { ok: true, agregados: agregados };
}

// ═════════════ Actualizar la web (Netlify vuelve a publicar con los precios y el stock de la hoja) ═════════════
function guardarEnlaceNetlify() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt("Enlace de Netlify", "Pega el «Build hook» de Netlify (empieza con https://api.netlify.com/build_hooks/):", ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const url = r.getResponseText().trim();
  if (!/^https:\/\/api\.netlify\.com\/build_hooks\//.test(url)) return ui.alert("Ese enlace no parece un Build hook de Netlify.");
  PropertiesService.getScriptProperties().setProperty("BUILD_HOOK", url);
  // Además se actualiza sola todos los días a las 7 a. m.
  if (!ScriptApp.getProjectTriggers().some((t) => t.getHandlerFunction() === "actualizarWebDiaria")) {
    ScriptApp.newTrigger("actualizarWebDiaria").timeBased().everyDays(1).atHour(7).inTimezone(ZONA).create();
  }
  ui.alert("Listo ✔. Desde ahora puedes usar FerreCenter → Actualizar la web, y además se actualiza sola cada día a las 7 a. m.");
}

function actualizarWeb() {
  const ui = SpreadsheetApp.getUi();
  const url = PropertiesService.getScriptProperties().getProperty("BUILD_HOOK");
  if (!url) return ui.alert("Primero guarda el enlace de Netlify: FerreCenter → Guardar enlace de Netlify.");
  UrlFetchApp.fetch(url, { method: "post", muteHttpExceptions: true });
  ui.alert("Listo ✔. La web se está actualizando con los precios y el stock de la hoja. Tarda unos 2 minutos.");
}

function actualizarWebDiaria() {
  const url = PropertiesService.getScriptProperties().getProperty("BUILD_HOOK");
  if (url) UrlFetchApp.fetch(url, { method: "post", muteHttpExceptions: true });
}

// ═════════════ Reseñas ═════════════
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
  const hoja = libro_().getSheetByName(HOJAS.resenas);
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

// ═════════════ Utilidades ═════════════
function libro_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function hoja_(nombre, columnas) {
  const libro = libro_();
  const h = libro.getSheetByName(nombre) || libro.insertSheet(nombre);
  if (columnas.length) {
    h.getRange(1, 1, 1, columnas.length).setValues([columnas]).setFontWeight("bold").setBackground("#0a2a4e").setFontColor("#ffffff");
    h.setFrozenRows(1);
  }
  return h;
}

function lista_(hoja, columna, valores) {
  const regla = SpreadsheetApp.newDataValidation().requireValueInList(valores, true).setAllowInvalid(false).build();
  hoja.getRange(2, columna, 3000, 1).setDataValidation(regla);
}

function formato_(hoja, nombres, columnas, formato) {
  nombres.forEach((n) => hoja.getRange(2, columnas.indexOf(n) + 1, 3000, 1).setNumberFormat(formato));
}

function filaDePedido_(codigo) {
  if (!codigo) return 0;
  const hoja = libro_().getSheetByName(HOJAS.ventas);
  const ultima = hoja.getLastRow();
  if (ultima < 2) return 0;
  const col = COL.ventas.indexOf("N° de pedido") + 1;
  const codigos = hoja.getRange(2, col, ultima - 1, 1).getValues();
  for (let i = codigos.length - 1; i >= 0; i--) if (codigos[i][0] === codigo) return i + 2;
  return 0;
}

function valoresVenta_(fila) {
  const v = libro_().getSheetByName(HOJAS.ventas).getRange(fila, 1, 1, COL.ventas.length).getValues()[0];
  const o = {};
  COL.ventas.forEach((c, i) => (o[c] = v[i]));
  return o;
}

function filasResenas_() {
  const hoja = libro_().getSheetByName(HOJAS.resenas);
  const ultima = hoja.getLastRow();
  if (ultima < 2) return [];
  return hoja.getRange(2, 1, ultima - 1, COL.resenas.length).getValues().map((v) => {
    const o = {};
    COL.resenas.forEach((c, i) => (o[c] = v[i]));
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

function num_(v) {
  const n = Number(v);
  return v === null || v === undefined || v === "" || isNaN(n) ? "" : n;
}

// Evita que un texto empiece con "=" (fórmula) y recorta el largo
function limpiar_(t, max) {
  return String(t == null ? "" : t).replace(/^[=+\-@]+/, "").trim().slice(0, max);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
