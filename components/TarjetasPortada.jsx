import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Truck } from "lucide-react";
import { imagenPrincipal, marcas } from "@/lib/productos";
import { linkWhatsApp } from "@/lib/config";
import { soles } from "@/lib/formato";
import RotadorOfertas from "./RotadorOfertas";
import RotadorLogos from "./RotadorLogos";
import LogoMarca from "./LogoMarca";
import PersonajeCajas from "./PersonajeCajas";
import PersonajeOfertas from "./PersonajeOfertas";

// Colores de cada sello: borde de letras, dos tonos de profundidad, brillo y fondo del círculo
const TONOS = {
  azul: { borde: "#1e40af", sombra: "#1e3a8a", fondo: "#172554", brillo: "#3b82f6", cinta: "#2563eb" },
  verde: { borde: "#15803d", sombra: "#166534", fondo: "#052e16", brillo: "#22c55e", cinta: "#16a34a" },
};

// Letras gruesas con relieve (contorno + sombras apiladas que simulan profundidad)
const relieve = (t) => ({
  color: "#eef2f7",
  WebkitTextStroke: `3px ${t.borde}`,
  paintOrder: "stroke fill",
  textShadow: `0 2px 0 ${t.sombra}, 0 3px 0 ${t.sombra}, 0 4px 0 ${t.fondo}, 0 5px 0 ${t.fondo}, 0 8px 10px rgba(0,0,0,.5)`,
});

// Sello: ícono arriba, texto en relieve sobre un círculo, cinta y moneda abajo
// figura: reemplaza el círculo con ícono por un dibujo más alto (p. ej. el personaje animado)
function Insignia({ tono = "azul", icono: Icono, figura, arriba, conector, abajo, moneda }) {
  const t = TONOS[tono];
  const plata = { borderColor: t.borde };
  return (
    <span className="relative flex flex-col items-center" aria-hidden="true">
      {/* Cinta que cuelga del sello */}
      <span
        className="absolute bottom-0 left-1/2 h-10 w-14 -translate-x-1/2"
        style={{ background: `linear-gradient(${t.borde}, ${t.cinta})`, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)" }}
      />
      {/* Círculo del sello */}
      <span
        className="absolute left-1/2 h-[5.5rem] w-[5.5rem] -translate-x-1/2 rounded-full"
        style={{ top: figura ? "5rem" : "1.25rem", background: t.sombra, boxShadow: `inset 0 0 0 4px ${t.brillo}, 0 6px 14px rgba(0,0,0,.4)` }}
      />
      {figura ? (
        <span className="relative z-10 -mb-2 block">{figura}</span>
      ) : (
        <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-[3px] bg-gradient-to-b from-white to-slate-300 text-slate-800 shadow-md" style={plata}>
          <Icono className="h-5 w-5" strokeWidth={2.5} />
        </span>
      )}
      <span className="relative z-10 -mt-1 text-[2rem] font-black uppercase leading-none tracking-tight" style={relieve(t)}>
        {arriba}
      </span>
      <span className="relative z-10 flex items-center gap-1">
        <span className="rounded-full border-2 px-1.5 text-[10px] font-black uppercase leading-4" style={{ borderColor: t.brillo, background: t.fondo }}>
          {conector}
        </span>
        <span className="text-[2.75rem] font-black uppercase leading-none tracking-tight" style={relieve(t)}>
          {abajo}
        </span>
      </span>
      <span className="relative z-10 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-gradient-to-b from-white to-slate-300 text-[9px] font-black shadow" style={{ ...plata, color: t.sombra }}>
        {moneda}
      </span>
    </span>
  );
}

// Tarjetas al lado del carrusel de la portada (solo en computadora).
// diseno: "producto" = foto y precio reales · "icono" = sellos en relieve (ofertas y por mayor)
export default function TarjetasPortada({ diseno = "producto", oferta, ofertas = [], mayoristas = [] }) {
  // Solo lo necesario para el rotador (no se envía todo el catálogo al navegador)
  const fotosOfertas = ofertas
    .filter((p) => p.imagenes.length)
    .map((p) => ({ sku: p.sku, imagen: imagenPrincipal(p), descuento: p.descuento }));
  const linkMayor = linkWhatsApp("Hola FerreCenter, quiero una cotización por mayor.");
  const base = "group relative flex flex-1 overflow-hidden rounded-2xl text-white transition hover:brightness-105";

  if (diseno === "icono") {
    return (
      <div className="hidden flex-col gap-4 lg:flex">
        <Link
          href="/catalogo?oferta=1"
          className={`${base} items-center justify-center bg-[radial-gradient(circle_at_45%_40%,#3b82f6,#1d4ed8_45%,#0b2a6b)] p-3`}
          aria-label={`Ofertas del día: hasta ${oferta?.descuento || 0}% de descuento`}
        >
          {/* Franja de luz diagonal de fondo */}
          <span className="pointer-events-none absolute -right-1/4 top-0 h-[200%] w-1/2 rotate-[35deg] bg-white/10" aria-hidden="true" />
          {fotosOfertas.length > 0 ? (
            // Con productos en oferta: sello a la izquierda y sus fotos rotando a la derecha
            <span className="relative flex w-full items-center justify-between gap-2">
              <span className="flex flex-col items-center gap-1.5">
                <span className="[zoom:0.7]">
                  <Insignia tono="azul" figura={<PersonajeOfertas />} arriba="Ofertas" conector="del" abajo="Día" moneda="S/." />
                </span>
                <span className="flex items-center text-xs font-semibold group-hover:underline">
                  Ver ofertas <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>
              <RotadorOfertas productos={fotosOfertas} />
            </span>
          ) : (
            <Insignia tono="azul" figura={<PersonajeOfertas />} arriba="Ofertas" conector="del" abajo="Día" moneda="S/." />
          )}
          {!fotosOfertas.length && oferta?.descuento > 0 && (
            <span className="absolute right-2 top-3 rotate-12 rounded-full bg-oferta px-2.5 py-1 text-center text-[10px] font-bold leading-tight shadow-lg">
              Hasta
              <span className="block text-base font-black">-{oferta.descuento}%</span>
            </span>
          )}
          {!fotosOfertas.length && (
            <span className="absolute bottom-2.5 right-3 flex items-center text-xs font-semibold group-hover:underline">
                Ver ofertas <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </Link>
        <a
          href={linkMayor}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} items-center justify-center bg-[radial-gradient(circle_at_45%_40%,#22c55e,#15803d_45%,#052e16)] p-3`}
          aria-label="¿Compras por mayor? Pide tu cotización por WhatsApp"
        >
          <span className="pointer-events-none absolute -right-1/4 top-0 h-[200%] w-1/2 rotate-[35deg] bg-white/10" aria-hidden="true" />
          {/* Sello a la izquierda y los logos de las marcas rotando a la derecha */}
          <span className="relative flex w-full items-center justify-between gap-2">
            <span className="flex flex-col items-center gap-1.5">
              <span className="[zoom:0.7]">
                <Insignia tono="verde" figura={<PersonajeCajas />} arriba="Compras" conector="por" abajo="Mayor" moneda={<Truck className="h-3.5 w-3.5" strokeWidth={2.5} />} />
              </span>
              <span className="flex items-center text-xs font-semibold group-hover:underline">
                Cotizar <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </span>
            <span className="flex flex-col items-center gap-2">
              <span className="rotate-[-4deg] rounded-full bg-acento-500 px-2 py-1 text-center text-[10px] font-bold leading-tight shadow-lg">
                Precios especiales en
              </span>
              <RotadorLogos>
                {marcas.map((m) => (
                  <LogoMarca key={m.slug} marca={m} className="h-12 w-24 shadow-lg ring-2 ring-white/80" />
                ))}
              </RotadorLogos>
            </span>
          </span>
        </a>
      </div>
    );
  }

  // Diseño "producto": foto real + datos (precio de la mejor oferta, productos para mayoristas)
  return (
    <div className="hidden flex-col gap-4 lg:flex">
      <Link href={oferta ? `/producto/${oferta.slug}` : "/catalogo?oferta=1"} className={`${base} items-center gap-3 bg-acento-500 p-5`}>
        <span className="relative z-10 flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-white/85">Ofertas del día</span>
          {oferta ? (
            <>
              <span className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">{oferta.nombre}</span>
              <span className="mt-1.5 text-xs text-white/75 line-through">{soles(oferta.precio)}</span>
              <span className="text-2xl font-extrabold leading-none">{soles(oferta.precioFinal)}</span>
            </>
          ) : (
            <span className="mt-1 text-xl font-extrabold">Aprovecha ahora</span>
          )}
          <span className="mt-2 flex items-center text-xs font-semibold group-hover:underline">
            Ver ofertas <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
        {oferta && (
          <span className="relative h-24 w-24 shrink-0">
            <span className="absolute inset-0 overflow-hidden rounded-full bg-white shadow-lg">
              <span className="absolute inset-[14%]">
                <Image src={imagenPrincipal(oferta)} alt="" fill sizes="96px" className="object-contain mix-blend-multiply" />
              </span>
            </span>
            <span className="absolute -right-1 -top-1 rounded-full bg-oferta px-2 py-0.5 text-xs font-extrabold shadow">-{oferta.descuento}%</span>
          </span>
        )}
      </Link>

      <a href={linkMayor} target="_blank" rel="noopener noreferrer" className={`${base} items-center gap-3 bg-whatsapp p-5`}>
        <span className="relative z-10 flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-white/85">Empresas y obras</span>
          <span className="mt-1 text-xl font-extrabold leading-tight">¿Compras por mayor?</span>
          <span className="mt-1 text-xs text-white/85">Precios especiales por volumen</span>
          <span className="mt-2 flex items-center text-xs font-semibold group-hover:underline">
            Pide tu cotización <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
        {mayoristas.length > 0 && (
          <span className="relative h-24 w-24 shrink-0">
            {mayoristas.slice(0, 2).map((p, i) => (
              <span
                key={p.sku}
                className={`absolute h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-lg ${i === 0 ? "left-0 top-0" : "bottom-0 right-0"}`}
              >
                <span className="absolute inset-[14%]">
                  <Image src={imagenPrincipal(p)} alt="" fill sizes="64px" className="object-contain mix-blend-multiply" />
                </span>
              </span>
            ))}
          </span>
        )}
      </a>
    </div>
  );
}
