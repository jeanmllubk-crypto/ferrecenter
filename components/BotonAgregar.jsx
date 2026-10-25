"use client";

import { ShoppingCart } from "lucide-react";
import { useCarrito } from "./CarritoContext";

export default function BotonAgregar({ producto, className = "" }) {
  const { agregar } = useCarrito();
  if (producto.stock <= 0) {
    return (
      <button disabled className={`w-full rounded-lg bg-gray-200 py-2 text-sm font-semibold text-gray-500 ${className}`}>
        Agotado
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => agregar(producto)}
      className={`flex w-full items-center justify-center gap-2 rounded-lg bg-marca-700 py-2 text-sm font-semibold text-white transition hover:bg-marca-800 active:scale-[.98] ${className}`}
    >
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      Agregar
    </button>
  );
}
