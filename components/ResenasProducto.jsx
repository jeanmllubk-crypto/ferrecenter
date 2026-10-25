"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import Estrellas from "./Estrellas";
import { obtenerResenas, registroActivo } from "@/lib/registro";

const fechaCorta = (f) => new Date(`${f}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

// Opiniones aprobadas del producto (se leen de la hoja de Google al abrir la página)
export default function ResenasProducto({ sku }) {
  const [resenas, setResenas] = useState(null);
  const [verTodas, setVerTodas] = useState(false);

  useEffect(() => {
    if (!registroActivo) return;
    obtenerResenas(sku)
      .then((r) => setResenas(r.ok ? r.resenas : []))
      .catch(() => setResenas([]));
  }, [sku]);

  if (!registroActivo) return null;

  const total = resenas?.length || 0;
  const promedio = total ? resenas.reduce((s, r) => s + r.estrellas, 0) / total : 0;
  const conteo = [5, 4, 3, 2, 1].map((n) => ({ n, cant: resenas?.filter((r) => r.estrellas === n).length || 0 }));
  const visibles = verTodas ? resenas : resenas?.slice(0, 4);

  return (
    <section className="mt-4 rounded-2xl bg-white p-4 sm:p-6" aria-labelledby="titulo-resenas">
      <h2 id="titulo-resenas" className="mb-3 text-lg font-extrabold text-marca-900">
        Opiniones de clientes
      </h2>

      {resenas === null ? (
        <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
      ) : total === 0 ? (
        <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          <MessageSquareText className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
          <p>
            Este producto aún no tiene opiniones. Si lo compraste, puedes{" "}
            <Link href="/calificar" className="font-semibold text-marca-700 underline">
              calificarlo con tu número de pedido
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
          {/* Resumen: promedio y barras por estrellas */}
          <div>
            <p className="text-4xl font-extrabold text-gray-900">{promedio.toFixed(1)}</p>
            <Estrellas valor={promedio} tamano="h-5 w-5" />
            <p className="mt-1 text-sm text-gray-500">
              {total} {total === 1 ? "opinión" : "opiniones"}
            </p>
            <ul className="mt-3 space-y-1">
              {conteo.map(({ n, cant }) => (
                <li key={n} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-3">{n}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(cant / total) * 100}%` }} />
                  </span>
                  <span className="w-4 text-right">{cant}</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="divide-y divide-gray-100">
            {visibles.map((r, i) => (
              <li key={i} className="py-3 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Estrellas valor={r.estrellas} />
                  <span className="text-sm font-semibold text-gray-900">{r.nombre}</span>
                  <span className="rounded-full bg-whatsapp/10 px-2 py-0.5 text-[11px] font-semibold text-whatsapp-oscuro">Compra verificada</span>
                </div>
                {r.comentario && <p className="mt-1 text-sm text-gray-700">{r.comentario}</p>}
                <p className="mt-1 text-xs text-gray-400">{fechaCorta(r.fecha)}</p>
              </li>
            ))}
            {total > 4 && !verTodas && (
              <li className="pt-3">
                <button onClick={() => setVerTodas(true)} className="text-sm font-semibold text-marca-700 hover:underline">
                  Ver las {total} opiniones
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  );
}
