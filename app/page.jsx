import Image from "next/image";
import Link from "next/link";
import { BadgePercent, ChevronRight, CreditCard, Sparkles, TrendingUp, Truck } from "lucide-react";
import CarruselBanners from "@/components/CarruselBanners";
import FilaProductos from "@/components/FilaProductos";
import IconoCategoria from "@/components/IconoCategoria";
import LogoMarca from "@/components/LogoMarca";
import { IconoWhatsApp } from "@/components/IconosSociales";
import { categorias, destacados, imagenPrincipal, marcas, masVendidos, nuevos, ofertasDelDia, productos } from "@/lib/productos";
import { linkWhatsApp } from "@/lib/config";
import { soles } from "@/lib/formato";
import configBanners from "@/lib/banners";
import TarjetasPortada from "@/components/TarjetasPortada";

// Diseño de las tarjetas junto al carrusel: "producto" (foto y precio) o "icono" (ícono grande)
const DISENO_TARJETAS = "icono";

export const metadata = {
  alternates: { canonical: "/" },
};

// Convierte la lista de lib/banners.js en datos listos para el carrusel
function armarBanners() {
  const maxDescuento = Math.max(0, ...productos.map((p) => p.descuento));
  const elegir = (ref) => {
    if (!ref) return null;
    if (ref === "oferta") return ofertasDelDia(1)[0] || null;
    if (ref === "destacado") return destacados(1)[0] || productos[0] || null;
    return productos.find((p) => p.sku.toLowerCase() === String(ref).toLowerCase()) || null;
  };

  return configBanners
    .filter((b) => b.activo !== false)
    .map((b) => {
      const p = elegir(b.producto);
      // Si pide un producto que no existe (o no hay ofertas), el banner se oculta
      if (b.producto && !p && !b.imagen) return null;
      const reemplazar = (t = "") =>
        String(t)
          .replaceAll("{descuento}", maxDescuento)
          .replaceAll("{nombre}", p?.nombre ?? "")
          .replaceAll("{marca}", p?.marca ?? "")
          .replaceAll("{slug}", p?.slug ?? "")
          .replaceAll("{precio}", p ? soles(p.precioFinal) : "")
          .replaceAll("{precioNormal}", p ? soles(p.precio) : "");
      const whatsapp = b.enlace === "whatsapp";
      return {
        etiqueta: reemplazar(b.etiqueta),
        titulo: reemplazar(b.titulo),
        texto: reemplazar(b.texto),
        boton: reemplazar(b.boton) || "Ver más",
        href: whatsapp ? linkWhatsApp(`Hola FerreCenter, vi su banner: ${reemplazar(b.titulo)}`) : reemplazar(b.enlace) || "/catalogo",
        externo: whatsapp,
        imagen: p && p.imagenes.length ? imagenPrincipal(p) : null,
        precio: b.mostrarPrecio && p ? { final: soles(p.precioFinal), normal: p.precioOferta ? soles(p.precio) : null, descuento: p.descuento } : null,
        tema: b.tema || "azul",
        imagenPropia: b.imagen || null,
        imagenCelular: b.imagenCelular || null,
        desde: b.desde || null,
        hasta: b.hasta || null,
      };
    })
    .filter(Boolean);
}

export default function Inicio() {
  const ofertas = ofertasDelDia(10);
  const vendidos = masVendidos(10);
  const recientes = nuevos(10);

  return (
    <>
      <h1 className="sr-only">FerreCenter: herramientas, EPP, protección colectiva, discos de corte y accesorios en Tacna y todo el Perú</h1>

      <div className="contenedor grid gap-4 pt-4 lg:grid-cols-[1fr_18rem]">
        <CarruselBanners banners={armarBanners()} />
        <TarjetasPortada
          diseno={DISENO_TARJETAS}
          oferta={ofertasDelDia(1)[0]}
          ofertas={ofertasDelDia(12)}
          mayoristas={destacados(4).filter((p) => p.imagenes.length && p.sku !== ofertasDelDia(1)[0]?.sku)}
        />
      </div>

      <div className="contenedor mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-marca-900 sm:text-sm">
        {[
          { icono: Truck, texto: "Envíos a todo el Perú" },
          { icono: CreditCard, texto: "Yape, Plin y más" },
          { icono: IconoWhatsApp, texto: "Atención por WhatsApp" },
        ].map(({ icono: Icono, texto }) => (
          <div key={texto} className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-3 sm:flex-row sm:justify-center sm:gap-2">
            <Icono className="h-5 w-5 text-acento-500" aria-hidden="true" />
            {texto}
          </div>
        ))}
      </div>

      <section className="contenedor py-6" aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" className="mb-3 text-lg font-extrabold text-marca-900 sm:text-xl">
          Categorías
        </h2>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categoria/${c.slug}`}
                className="flex h-full flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-4 text-center transition hover:border-marca-500 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marca-50 text-marca-700">
                  <IconoCategoria slug={c.slug} className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold leading-tight text-gray-800 sm:text-sm">{c.nombre}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FilaProductos
        titulo="Ofertas del día"
        icono={<BadgePercent className="h-6 w-6 text-oferta" aria-hidden="true" />}
        href="/catalogo?oferta=1"
        productos={ofertas}
        prioridad
      />
      <FilaProductos
        titulo="Más vendidos"
        icono={<TrendingUp className="h-6 w-6 text-acento-500" aria-hidden="true" />}
        href="/catalogo"
        productos={vendidos}
      />
      <FilaProductos
        titulo="Nuevos"
        icono={<Sparkles className="h-6 w-6 text-marca-500" aria-hidden="true" />}
        href="/catalogo?orden=nuevos"
        productos={recientes}
      />

      <section className="contenedor py-6" aria-labelledby="titulo-marcas">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="titulo-marcas" className="text-lg font-extrabold text-marca-900 sm:text-xl">
            Por marca
          </h2>
          <Link href="/marcas" className="flex items-center text-sm font-semibold text-marca-600 hover:underline">
            Ver marcas <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {marcas.map((m) => {
            const muestra = productos.filter((p) => p.marcaSlug === m.slug).slice(0, 3);
            return (
              <li key={m.slug}>
                <Link
                  href={`/marca/${m.slug}`}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-marca-500 hover:shadow-md"
                >
                  <LogoMarca marca={m} className="h-12 w-full" />
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">
                      {m.cantidad} {m.cantidad === 1 ? "producto" : "productos"}
                    </span>
                    <span className="flex shrink-0 -space-x-3">
                      {muestra.map((p) => (
                        <span key={p.sku} className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white shadow">
                          <Image src={imagenPrincipal(p)} alt="" fill sizes="48px" className="object-contain p-1" />
                        </span>
                      ))}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
