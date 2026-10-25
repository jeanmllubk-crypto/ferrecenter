"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Posición de cada círculo según cuántos productos tenga el grupo (1, 2 o 3)
const POSICIONES = {
  1: ["left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2"],
  2: ["left-0 top-1 h-[4.5rem] w-[4.5rem]", "bottom-1 right-0 h-[4.5rem] w-[4.5rem]"],
  3: [
    "left-1/2 top-0 h-[4.25rem] w-[4.25rem] -translate-x-1/2",
    "bottom-0 left-0 h-[3.75rem] w-[3.75rem]",
    "bottom-0 right-0 h-[3.75rem] w-[3.75rem]",
  ],
};

// Fotos de los productos en oferta, de tres en tres, cambiando cada pocos segundos
export default function RotadorOfertas({ productos }) {
  const grupos = [];
  for (let i = 0; i < productos.length; i += 3) grupos.push(productos.slice(i, i + 3));
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (grupos.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActual((n) => (n + 1) % grupos.length), 3500);
    return () => clearInterval(t);
  }, [grupos.length]);

  return (
    <span className="relative block h-36 w-[7.5rem] shrink-0" aria-hidden="true">
      {grupos.map((grupo, g) => (
        <span
          key={g}
          className={`absolute inset-0 transition-all duration-700 ${g === actual ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        >
          {grupo.map((p, i) => (
            <span key={p.sku} className={`absolute ${POSICIONES[grupo.length][i]}`}>
              <span className="absolute inset-0 overflow-hidden rounded-full border-[3px] border-[#3b82f6] bg-white shadow-[0_6px_14px_rgba(0,0,0,.4)]">
                <span className="absolute inset-[14%]">
                  <Image src={p.imagen} alt="" fill sizes="96px" className="object-contain mix-blend-multiply" />
                </span>
              </span>
              {p.descuento > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-oferta px-1.5 py-0.5 text-[10px] font-black leading-none shadow">
                  -{p.descuento}%
                </span>
              )}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
