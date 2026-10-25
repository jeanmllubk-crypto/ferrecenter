"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCarrito } from "./CarritoContext";
import { IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp } from "@/lib/config";
import { soles } from "@/lib/formato";

export default function CompraProducto({ producto }) {
  const router = useRouter();
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const agotado = producto.stock <= 0;
  const max = Math.max(1, producto.stock);

  const consulta = linkWhatsApp(
    agotado
      ? `Hola FerreCenter, quisiera saber cuándo tendrán stock de: ${producto.nombre} (${producto.sku}).`
      : `Hola FerreCenter, quiero comprar: ${producto.nombre} (${producto.sku}) x ${cantidad} – ${soles(producto.precioFinal * cantidad)}`
  );

  if (agotado) {
    return (
      <div className="space-y-3">
        <button disabled className="w-full rounded-xl bg-gray-200 py-3.5 font-bold text-gray-500">
          Agotado
        </button>
        <a
          href={consulta}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-whatsapp py-3 font-bold text-whatsapp-oscuro hover:bg-whatsapp/5"
        >
          <IconoWhatsApp className="h-5 w-5" /> Avísame cuando llegue
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Cantidad</span>
          <div className="flex items-center rounded-lg border border-gray-300 bg-white">
            <button
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              aria-label="Disminuir cantidad"
              className="flex h-10 w-10 items-center justify-center text-gray-700 disabled:opacity-40"
              disabled={cantidad <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min="1"
              max={max}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Math.min(max, Number(e.target.value) || 1)))}
              aria-label="Cantidad"
              className="h-10 w-12 border-x border-gray-300 text-center font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setCantidad((c) => Math.min(max, c + 1))}
              aria-label="Aumentar cantidad"
              className="flex h-10 w-10 items-center justify-center text-gray-700 disabled:opacity-40"
              disabled={cantidad >= max}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          onClick={() => agregar(producto, cantidad)}
          className="hidden w-full items-center justify-center gap-2 rounded-xl bg-marca-700 py-3.5 font-bold text-white transition hover:bg-marca-800 active:scale-[.99] md:flex"
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" /> Agregar al carrito
        </button>
        <button
          onClick={() => {
            agregar(producto, cantidad);
            router.push("/carrito");
          }}
          className="hidden w-full items-center justify-center gap-2 rounded-xl bg-acento-500 py-3.5 font-bold text-white transition hover:bg-acento-600 md:flex"
        >
          Comprar ahora
        </button>
        <a
          href={consulta}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-whatsapp py-3 font-bold text-whatsapp-oscuro hover:bg-whatsapp/5"
        >
          <IconoWhatsApp className="h-5 w-5" /> Pedir este producto por WhatsApp
        </a>
      </div>

      {/* Barra fija de compra en celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,.08)] md:hidden">
        <button
          onClick={() => agregar(producto, cantidad)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-marca-700 py-3 text-sm font-bold text-white active:scale-[.98]"
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" /> Agregar
        </button>
        <button
          onClick={() => {
            agregar(producto, cantidad);
            router.push("/carrito");
          }}
          className="flex-1 rounded-xl bg-acento-500 py-3 text-sm font-bold text-white active:scale-[.98]"
        >
          Comprar ahora
        </button>
      </div>
    </>
  );
}
