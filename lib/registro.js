// Conexión con la hoja de Google "FerreCenter - Ventas" (ver google/LEEME.md).
// Se usa "text/plain" para que el navegador no haga la consulta previa (CORS) que Google no responde.
import { TIENDA } from "./config";

export const registroActivo = Boolean(TIENDA.registroUrl);

// Número de pedido: FC-AAMMDD-XXXX (fecha de Perú + 4 caracteres al azar, sin letras que se confundan)
export function nuevoCodigoPedido() {
  const fecha = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" }).slice(2).replaceAll("-", "");
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const azar = Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => letras[n % letras.length]).join("");
  return `FC-${fecha}-${azar}`;
}

// Guarda el pedido sin esperar respuesta: así WhatsApp se abre al instante y, si falla, no bloquea la compra
export function registrarPedido(pedido) {
  if (!registroActivo) return;
  try {
    fetch(TIENDA.registroUrl, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ accion: "pedido", ...pedido }),
    }).catch(() => {});
  } catch {}
}

async function consultar(params) {
  const r = await fetch(`${TIENDA.registroUrl}?${new URLSearchParams(params)}`);
  return r.json();
}

export const obtenerResenas = (sku) => consultar({ accion: "resenas", sku });
export const obtenerPedido = (codigo) => consultar({ accion: "pedido", codigo });

export async function enviarResenas(datos) {
  const r = await fetch(TIENDA.registroUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ accion: "resena", ...datos }),
  });
  return r.json();
}
