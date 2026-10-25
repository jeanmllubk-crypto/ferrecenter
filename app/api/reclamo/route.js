// Recibe una hoja del Libro de Reclamaciones y la envía por correo:
// una a la tienda y una copia al consumidor (como exige la norma para el libro virtual).
// Necesita las variables GMAIL_USUARIO y GMAIL_CLAVE_APP (ver .env.local.example).
import nodemailer from "nodemailer";
import { TIENDA } from "@/lib/config";

export const runtime = "nodejs";

const texto = (v, max = 2000) => String(v ?? "").trim().slice(0, max);
const escapar = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function validar(d) {
  const errores = [];
  if (texto(d.nombre).length < 3) errores.push("nombre");
  if (texto(d.documento).length < 8) errores.push("documento");
  if (texto(d.domicilio).length < 5) errores.push("domicilio");
  if (texto(d.telefono).length < 6) errores.push("telefono");
  if (!/^\S+@\S+\.\S+$/.test(texto(d.correo, 200))) errores.push("correo");
  if (d.menor && texto(d.apoderado).length < 3) errores.push("apoderado");
  if (texto(d.descripcionBien).length < 3) errores.push("descripcionBien");
  if (texto(d.detalle).length < 10) errores.push("detalle");
  if (texto(d.pedido).length < 3) errores.push("pedido");
  if (!["Reclamo", "Queja"].includes(d.tipo)) errores.push("tipo");
  if (!d.acepto) errores.push("acepto");
  return errores;
}

function filas(d, codigo, fecha) {
  return [
    ["Hoja N.°", codigo],
    ["Fecha", fecha],
    ["Proveedor", `${TIENDA.razonSocial} – ${TIENDA.ruc}`],
    ["Domicilio del proveedor", TIENDA.direccion],
    ["__", "1. Identificación del consumidor reclamante"],
    ["Nombre", texto(d.nombre, 200)],
    [texto(d.tipoDoc, 20) || "Documento", texto(d.documento, 30)],
    ["Domicilio", texto(d.domicilio, 300)],
    ["Teléfono", texto(d.telefono, 30)],
    ["Correo", texto(d.correo, 200)],
    ...(d.menor ? [["Padre, madre o apoderado", texto(d.apoderado, 200)]] : []),
    ["__", "2. Identificación del bien contratado"],
    ["Tipo", d.bien === "Servicio" ? "Servicio" : "Producto"],
    ["Descripción", texto(d.descripcionBien, 500)],
    ...(texto(d.pedidoRef) ? [["N.° de pedido o comprobante", texto(d.pedidoRef, 100)]] : []),
    ...(texto(d.monto) ? [["Monto reclamado", `S/. ${texto(d.monto, 20)}`]] : []),
    ["__", `3. Detalle de la reclamación (${d.tipo.toUpperCase()})`],
    ["Detalle", texto(d.detalle)],
    ["Pedido del consumidor", texto(d.pedido)],
  ];
}

function correoHtml(lista, intro) {
  const cuerpo = lista
    .map(([k, v]) =>
      k === "__"
        ? `<tr><td colspan="2" style="padding:14px 0 6px;font-weight:bold;color:#0a2a4e;border-bottom:2px solid #f57c00">${escapar(v)}</td></tr>`
        : `<tr><td style="padding:6px 12px 6px 0;color:#5b6b80;vertical-align:top;width:38%">${escapar(k)}</td><td style="padding:6px 0;color:#1b2430;white-space:pre-wrap">${escapar(v)}</td></tr>`
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#1b2430">
    <div style="background:#0a2a4e;padding:18px 22px;border-radius:10px 10px 0 0">
      <span style="color:#fff;font-size:22px;font-weight:bold">Ferre</span><span style="color:#f57c00;font-size:22px;font-weight:bold">Center</span>
      <div style="color:#aecdee;font-size:13px;margin-top:4px">Libro de Reclamaciones virtual</div>
    </div>
    <div style="border:1px solid #e3e8ef;border-top:0;padding:18px 22px;border-radius:0 0 10px 10px">
      <p style="margin-top:0">${intro}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${cuerpo}</table>
      <p style="font-size:12px;color:#5b6b80;margin-top:18px">
        * La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.<br>
        * El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles.
      </p>
    </div>
  </div>`;
}

export async function POST(request) {
  let d;
  try {
    d = await request.json();
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const errores = validar(d);
  if (errores.length) return Response.json({ error: "Faltan datos", campos: errores }, { status: 400 });

  const usuario = process.env.GMAIL_USUARIO;
  const clave = process.env.GMAIL_CLAVE_APP;
  if (!usuario || !clave) {
    return Response.json({ error: "El envío automático aún no está configurado" }, { status: 503 });
  }

  const ahora = new Date();
  const enLima = (op) => ahora.toLocaleString("es-PE", { timeZone: "America/Lima", ...op });
  const fecha = enLima({ day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const dia = ahora.toLocaleDateString("en-CA", { timeZone: "America/Lima" }).replace(/-/g, "");
  const codigo = `LR-${dia}-${String(ahora.getTime()).slice(-6)}`;

  const lista = filas(d, codigo, fecha);
  const asunto = `Libro de Reclamaciones – ${d.tipo} ${codigo}`;
  const consumidor = texto(d.correo, 200);
  const tienda = process.env.CORREO_RECLAMOS || TIENDA.correoDestino;

  const transporte = nodemailer.createTransport({ service: "gmail", auth: { user: usuario, pass: clave.replace(/\s+/g, "") } });
  const remitente = `"${TIENDA.nombre} – Libro de Reclamaciones" <${usuario}>`;

  try {
    await transporte.sendMail({
      from: remitente,
      to: tienda,
      replyTo: consumidor,
      subject: `[Nuevo] ${asunto}`,
      html: correoHtml(lista, `Se registró una nueva ${d.tipo.toLowerCase()} en el Libro de Reclamaciones de la web. Responde a este correo para contestar al consumidor.`),
    });
    await transporte.sendMail({
      from: remitente,
      to: consumidor,
      replyTo: tienda,
      subject: `Copia de tu ${d.tipo.toLowerCase()} – ${codigo}`,
      html: correoHtml(
        lista,
        `Hola ${escapar(texto(d.nombre, 200))}, recibimos tu ${d.tipo.toLowerCase()}. Esta es la copia de tu hoja de reclamación. Te responderemos a este correo en un plazo no mayor a 15 días hábiles.`
      ),
    });
  } catch (e) {
    console.error("Error enviando reclamo:", e.message);
    return Response.json({ error: "No se pudo enviar el correo" }, { status: 502 });
  }

  return Response.json({ codigo, fecha });
}
