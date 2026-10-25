"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function Galeria({ imagenes, tamanos = [], nombre, descuento }) {
  const [actual, setActual] = useState(0);
  const [zoom, setZoom] = useState(null);
  const pista = useRef(null);

  function ir(i) {
    setActual(i);
    const el = pista.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {imagenes.length > 1 && (
        <div className="sin-scrollbar flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {imagenes.map((src, i) => (
            <button
              key={src}
              onClick={() => ir(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === actual}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${i === actual ? "border-marca-600" : "border-gray-200"}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
      <div className="relative flex-1">
        <div
          ref={pista}
          onScroll={(e) => setActual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="sin-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl border border-gray-200 bg-white"
        >
          {imagenes.map((src, i) => {
            const t = tamanos[i];
            const ladoMayor = t?.ancho ? Math.max(t.ancho, t.alto) : 0;
            // Fotos pequeñas: se muestran a lo sumo 1,3× su tamaño real y sin lupa (si no, se ven borrosas)
            const pequena = ladoMayor > 0 && ladoMayor < 800;
            const maximo = pequena ? Math.round(ladoMayor * 1.3) : null;
            return (
              <div
                key={src}
                className={`relative w-full shrink-0 snap-center overflow-hidden ${pequena ? "" : "aspect-square cursor-zoom-in"}`}
                style={pequena ? { height: `min(100vw, ${maximo + 48}px)` } : undefined}
                onMouseMove={(e) => {
                  if (pequena) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                onMouseLeave={() => setZoom(null)}
              >
                <div className="absolute inset-6 flex items-center justify-center">
                  <div className="relative h-full w-full" style={maximo ? { maxWidth: maximo, maxHeight: maximo } : undefined}>
                    <Image
                      src={src}
                      alt={i === 0 ? nombre : `${nombre} - foto ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={i === 0}
                      quality={90}
                      className="object-contain transition-transform duration-200"
                      style={zoom && i === actual ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {descuento > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-oferta px-2.5 py-1 text-sm font-bold text-white">-{descuento}%</span>
        )}
        {imagenes.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 md:hidden">
            {imagenes.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full ${i === actual ? "w-5 bg-marca-700" : "w-1.5 bg-gray-300"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
