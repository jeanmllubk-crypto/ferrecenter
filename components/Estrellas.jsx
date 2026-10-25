"use client";

import { Star } from "lucide-react";

// Estrellas de calificación. Con "onCambio" se pueden elegir (formulario); sin él solo se muestran.
// "valor" acepta decimales para el promedio (ej. 4.5 pinta media estrella).
export default function Estrellas({ valor = 0, onCambio, tamano = "h-4 w-4", etiqueta }) {
  const elegible = typeof onCambio === "function";
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role={elegible ? "radiogroup" : "img"}
      aria-label={etiqueta || `${valor} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const relleno = Math.max(0, Math.min(1, valor - (n - 1)));
        const estrella = (
          <span className={`relative inline-block ${tamano}`}>
            <Star className={`absolute inset-0 ${tamano} text-gray-300`} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${relleno * 100}%` }}>
              <Star className={`${tamano} text-amber-400`} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
        return elegible ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valor === n}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onClick={() => onCambio(n)}
            className="rounded p-0.5 transition hover:scale-110"
          >
            {estrella}
          </button>
        ) : (
          <span key={n}>{estrella}</span>
        );
      })}
    </span>
  );
}
