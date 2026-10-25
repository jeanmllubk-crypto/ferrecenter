"use client";

import { Children, useEffect, useState } from "react";

// Muestra los logos de marca (ya armados en el servidor) uno a la vez, con puntitos debajo
export default function RotadorLogos({ children, intervalo = 2500 }) {
  const logos = Children.toArray(children);
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (logos.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActual((n) => (n + 1) % logos.length), intervalo);
    return () => clearInterval(t);
  }, [logos.length, intervalo]);

  return (
    <span className="flex flex-col items-center gap-2" aria-hidden="true">
      <span className="relative block h-12 w-24">
        {logos.map((logo, i) => (
          <span
            key={i}
            className={`absolute inset-0 transition-all duration-700 ${i === actual ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
          >
            {logo}
          </span>
        ))}
      </span>
      {logos.length > 1 && (
        <span className="flex gap-1.5">
          {logos.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === actual ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
          ))}
        </span>
      )}
    </span>
  );
}
