"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Estrellas from "./Estrellas";
import { linkWhatsApp } from "@/lib/config";
import { enviarResenas, obtenerPedido, registroActivo } from "@/lib/registro";

const TEXTOS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

// Página "Califica tu compra": el cliente entra con su número de pedido (viene en el enlace que le enviamos
// por WhatsApp) y califica cada producto que compró. Solo funciona con pedidos entregados.
export default function FormularioCalificacion() {
  const params = useSearchParams();
  const [codigo, setCodigo] = useState(params.get("pedido")?.toUpperCase() || "");
  const [pedido, setPedido] = useState(null);
  const [estado, setEstado] = useState("inicio"); // inicio · buscando · listo · enviando · enviado
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [notas, setNotas] = useState({}); // { sku: { estrellas, comentario } }

  async function buscar(c = codigo) {
    const limpio = c.trim().toUpperCase();
    if (!limpio) return setError("Escribe tu número de pedido.");
    setEstado("buscando");
    setError("");
    try {
      const r = await obtenerPedido(limpio);
      if (!r.ok) {
        setError(r.error || "No encontramos ese pedido.");
        return setEstado("inicio");
      }
      setPedido(r);
      setNombre(r.nombre || "");
      setEstado("listo");
    } catch {
      setError("No pudimos conectarnos. Revisa tu internet e inténtalo otra vez.");
      setEstado("inicio");
    }
  }

  // Si llegó con el enlace (?pedido=…), buscar de una vez
  useEffect(() => {
    if (codigo && registroActivo) buscar(codigo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiar = (sku, campo, valor) => setNotas((n) => ({ ...n, [sku]: { ...n[sku], [campo]: valor } }));

  async function enviar(e) {
    e.preventDefault();
    const resenas = pedido.productos
      .filter((p) => !p.calificado && notas[p.sku]?.estrellas)
      .map((p) => ({ sku: p.sku, estrellas: notas[p.sku].estrellas, comentario: notas[p.sku].comentario || "" }));
    if (!resenas.length) return setError("Elige las estrellas de al menos un producto.");
    setEstado("enviando");
    setError("");
    try {
      const r = await enviarResenas({ codigo: codigo.trim().toUpperCase(), nombre: nombre.trim(), resenas });
      if (!r.ok) {
        setError(r.error || "No se pudo enviar tu calificación.");
        return setEstado("listo");
      }
      setEstado("enviado");
    } catch {
      setError("No pudimos conectarnos. Revisa tu internet e inténtalo otra vez.");
      setEstado("listo");
    }
  }

  if (!registroActivo) {
    return (
      <p className="rounded-xl bg-gray-50 p-4 text-gray-700">
        Muy pronto podrás calificar tus compras aquí. Mientras tanto, cuéntanos tu experiencia por{" "}
        <a href={linkWhatsApp("Hola FerreCenter, quiero calificar mi compra.")} className="font-semibold text-marca-700 underline">
          WhatsApp
        </a>
        .
      </p>
    );
  }

  if (estado === "enviado") {
    return (
      <div className="rounded-2xl bg-white p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-whatsapp" aria-hidden="true" />
        <h2 className="mt-2 text-xl font-bold text-gray-900">¡Gracias por tu calificación!</h2>
        <p className="mt-1 text-gray-600">La revisaremos y pronto aparecerá en la página del producto. Tu opinión ayuda a otros clientes.</p>
        <Link href="/catalogo" className="mt-5 inline-block rounded-xl bg-marca-700 px-6 py-3 font-bold text-white hover:bg-marca-800">
          Seguir comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {estado !== "listo" && estado !== "enviando" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            buscar();
          }}
          className="rounded-2xl bg-white p-4 sm:p-6"
        >
          <label htmlFor="codigo" className="mb-1 block text-sm font-semibold text-gray-700">
            Número de pedido
          </label>
          <div className="flex gap-2">
            <input
              id="codigo"
              className="campo uppercase"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej.: FC-261025-AB12"
              autoComplete="off"
            />
            <button type="submit" disabled={estado === "buscando"} className="shrink-0 rounded-lg bg-marca-700 px-4 font-semibold text-white hover:bg-marca-800 disabled:opacity-60">
              {estado === "buscando" ? "Buscando…" : "Buscar"}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">Lo encuentras en el mensaje de tu pedido por WhatsApp («Pedido N°»).</p>
          {error && <p className="mt-2 text-sm text-oferta">{error}</p>}
        </form>
      )}

      {pedido && (estado === "listo" || estado === "enviando") && (
        <form onSubmit={enviar} className="space-y-4 rounded-2xl bg-white p-4 sm:p-6">
          <p className="text-gray-700">
            Pedido <strong className="text-marca-900">{codigo.toUpperCase()}</strong>. ¿Qué te parecieron tus productos?
          </p>
          <ul className="space-y-3">
            {pedido.productos.map((p) => (
              <li key={p.sku} className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-900">{p.nombre}</p>
                {p.calificado ? (
                  <p className="mt-1 text-sm text-gray-500">Ya calificaste este producto. ¡Gracias!</p>
                ) : (
                  <>
                    <div className="mt-1 flex items-center gap-2">
                      <Estrellas valor={notas[p.sku]?.estrellas || 0} onCambio={(n) => cambiar(p.sku, "estrellas", n)} tamano="h-7 w-7" etiqueta={`Calificación de ${p.nombre}`} />
                      <span className="text-sm text-gray-500">{TEXTOS[notas[p.sku]?.estrellas || 0]}</span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={600}
                      className="campo mt-2"
                      value={notas[p.sku]?.comentario || ""}
                      onChange={(e) => cambiar(p.sku, "comentario", e.target.value)}
                      placeholder="Cuéntanos tu experiencia (opcional)"
                      aria-label={`Comentario sobre ${p.nombre}`}
                    />
                  </>
                )}
              </li>
            ))}
          </ul>
          <div>
            <label htmlFor="nombre-resena" className="mb-1 block text-sm font-semibold text-gray-700">
              Tu nombre <span className="font-normal text-gray-400">(se mostrará solo el primer nombre)</span>
            </label>
            <input id="nombre-resena" className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={40} />
          </div>
          {error && <p className="text-sm text-oferta">{error}</p>}
          <button type="submit" disabled={estado === "enviando"} className="w-full rounded-xl bg-marca-700 py-3.5 font-bold text-white hover:bg-marca-800 disabled:opacity-60">
            {estado === "enviando" ? "Enviando…" : "Enviar calificación"}
          </button>
        </form>
      )}
    </div>
  );
}
