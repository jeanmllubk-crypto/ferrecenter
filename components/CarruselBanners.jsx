"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconoWhatsApp } from "./IconosSociales";

const TEMAS = {
  naranja: "bg-gradient-to-br from-[#d4202f] via-[#e2442a] to-[#f57c00]",
  rojo: "bg-gradient-to-br from-[#8f1420] via-[#b81d2b] to-[#d4202f]",
  azul: "bg-gradient-to-br from-marca-900 via-marca-700 to-marca-500",
  verde: "bg-gradient-to-br from-[#0f5132] via-[#178a42] to-[#1fae54]",
  oscuro: "bg-gradient-to-br from-[#11161d] via-marca-950 to-marca-800",
};

// Los banners con fechas se filtran en el navegador, así una campaña empieza
// y termina a tiempo aunque la web se haya publicado antes
function vigente(b, hoy) {
  if (b.desde && hoy < b.desde) return false;
  if (b.hasta && hoy > b.hasta) return false;
  return true;
}

function Enlace({ banner, className, children, ...resto }) {
  return banner.externo ? (
    <a href={banner.href} target="_blank" rel="noopener noreferrer" className={className} {...resto}>
      {children}
    </a>
  ) : (
    <Link href={banner.href} className={className} {...resto}>
      {children}
    </Link>
  );
}

function Diapositiva({ b, i }) {
  if (b.imagenPropia) {
    return (
      <Enlace banner={b} className="relative block min-h-[220px] w-full sm:min-h-[300px] lg:min-h-[340px]" aria-label={b.titulo || b.boton}>
        <picture>
          {b.imagenCelular && <source media="(max-width: 639px)" srcSet={b.imagenCelular} />}
          <img src={b.imagenPropia} alt={b.titulo || ""} className="absolute inset-0 h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
        </picture>
      </Enlace>
    );
  }

  return (
    <div className={`relative flex min-h-[220px] w-full items-center overflow-hidden sm:min-h-[300px] lg:min-h-[340px] ${TEMAS[b.tema] || TEMAS.azul}`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-white/5" />
      <div className="relative z-10 flex w-full items-center gap-3 px-5 py-6 sm:px-10 lg:px-14">
        <div className={b.imagen || b.externo ? "max-w-[58%] sm:max-w-md" : "max-w-xl"}>
          {b.etiqueta && (
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white sm:text-xs">
              {b.etiqueta}
            </span>
          )}
          <h2 className="mt-2 line-clamp-3 text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">{b.titulo}</h2>
          {b.texto && <p className="mt-2 line-clamp-2 text-sm text-white/85 sm:text-lg">{b.texto}</p>}
          <Enlace
            banner={b}
            className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-marca-900 shadow transition hover:scale-105 sm:px-7 sm:py-3 sm:text-base"
          >
            {b.boton}
          </Enlace>
        </div>
        {b.imagen && (
          <div className="relative ml-auto w-[42%] max-w-[300px] shrink-0">
            <div className="relative aspect-square overflow-hidden rounded-full bg-white shadow-2xl">
              {/* La foto va dentro del círculo y su fondo blanco se funde con él (multiply), sin esquinas visibles */}
              <div className="absolute inset-[16%]">
                <Image src={b.imagen} alt="" fill sizes="(max-width: 640px) 30vw, 220px" className="object-contain mix-blend-multiply" priority={i === 0} />
              </div>
            </div>
            {b.precio && (
              <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 flex-col items-center whitespace-nowrap rounded-xl bg-white px-3 py-1 shadow-lg sm:px-4 sm:py-1.5">
                {b.precio.normal && <span className="text-[10px] text-gray-500 line-through sm:text-xs">{b.precio.normal}</span>}
                <span className={`text-sm font-extrabold sm:text-xl ${b.precio.normal ? "text-oferta" : "text-marca-900"}`}>{b.precio.final}</span>
              </div>
            )}
            {b.precio?.descuento > 0 && (
              <span className="absolute right-0 top-1 rounded-full bg-oferta px-2 py-1 text-xs font-extrabold text-white shadow sm:right-2 sm:top-3 sm:px-3 sm:text-base">
                -{b.precio.descuento}%
              </span>
            )}
          </div>
        )}
        {!b.imagen && b.externo && (
          <div className="ml-auto flex aspect-square w-[34%] max-w-[220px] shrink-0 items-center justify-center rounded-full bg-white text-whatsapp shadow-2xl">
            <IconoWhatsApp className="h-1/2 w-1/2" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarruselBanners({ banners: todos }) {
  const [banners, setBanners] = useState(todos);
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const pista = useRef(null);
  const total = banners.length;

  useEffect(() => {
    const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" }); // AAAA-MM-DD en hora de Perú
    const filtrados = todos.filter((b) => vigente(b, hoy));
    if (filtrados.length !== todos.length) setBanners(filtrados.length ? filtrados : todos);
  }, [todos]);

  const ir = useCallback(
    (i) => {
      const n = (i + total) % total;
      const el = pista.current;
      if (el) el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
      setActual(n);
    },
    [total]
  );

  // Sincroniza el punto activo cuando el usuario desliza con el dedo
  function alDesplazar() {
    const el = pista.current;
    if (!el) return;
    const n = Math.round(el.scrollLeft / el.clientWidth);
    if (n !== actual) setActual(n);
  }

  useEffect(() => {
    if (pausado || total < 2) return;
    const t = setInterval(() => ir(actual + 1), 5500);
    return () => clearInterval(t);
  }, [actual, pausado, total, ir]);

  if (!total) return null;

  return (
    <section
      className="relative min-w-0"
      aria-roledescription="carrusel"
      aria-label="Ofertas destacadas"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onTouchStart={() => setPausado(true)}
    >
      <div ref={pista} onScroll={alDesplazar} className="sin-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl">
        {banners.map((b, i) => (
          <div key={i} className="w-full shrink-0 snap-center" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${total}`}>
            <Diapositiva b={b} i={i} />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={() => ir(actual - 1)}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-marca-900 shadow hover:bg-white md:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => ir(actual + 1)}
            aria-label="Banner siguiente"
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-marca-900 shadow hover:bg-white md:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => ir(i)}
                aria-label={`Ir al banner ${i + 1}`}
                aria-current={i === actual}
                className={`h-2 rounded-full transition-all ${i === actual ? "w-6 bg-white" : "w-2 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
