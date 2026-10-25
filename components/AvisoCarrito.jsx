"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { useCarrito } from "./CarritoContext";

export default function AvisoCarrito() {
  const { aviso } = useCarrito();
  if (!aviso) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 top-24 z-[70] mx-auto flex max-w-md items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl"
    >
      <CircleCheck className="h-5 w-5 shrink-0 text-[#4ade80]" aria-hidden="true" />
      <span className="line-clamp-2 flex-1">{aviso}</span>
      <Link href="/carrito" className="shrink-0 font-bold text-acento-400 hover:underline">
        Ver carrito
      </Link>
    </div>
  );
}
