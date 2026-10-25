import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import Galeria from "@/components/Galeria";
import LogoMarca from "@/components/LogoMarca";
import DescripcionCompleta from "@/components/DescripcionCompleta";
import AsesorProducto from "@/components/AsesorProducto";
import CompraProducto from "@/components/CompraProducto";
import FilaProductos from "@/components/FilaProductos";
import Migas from "@/components/Migas";
import Precio from "@/components/Precio";
import { IMAGEN_GENERICA, obtenerProducto, productos, relacionados } from "@/lib/productos";
import { TIENDA } from "@/lib/config";
import { soles } from "@/lib/formato";

export const dynamicParams = false;

export function generateStaticParams() {
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = obtenerProducto(slug);
  if (!p) return {};
  const titulo = `${p.nombre} ${p.marca}${p.modelo ? ` ${p.modelo}` : ""}`;
  const descripcion = `${p.descripcion || p.nombre} Precio: ${soles(p.precioFinal)}. ${
    p.garantia ? `Garantía ${p.garantia}. ` : ""
  }Envíos a todo el Perú. Compra en FerreCenter.`;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/producto/${p.slug}` },
    // La imagen para compartir la genera opengraph-image.jsx (foto + precio)
    openGraph: { title: titulo, description: descripcion, type: "website" },
  };
}

export default async function PaginaProducto({ params }) {
  const { slug } = await params;
  const p = obtenerProducto(slug);
  if (!p) notFound();

  const imagenes = p.imagenes.length ? p.imagenes : [IMAGEN_GENERICA];
  const agotado = p.stock <= 0;
  const ficha = [
    { nombre: "Marca", valor: p.marca },
    p.modelo && { nombre: "Modelo", valor: p.modelo },
    { nombre: "Código (SKU)", valor: p.sku },
    { nombre: "Categoría", valor: [p.categoria, p.subcategoria].filter(Boolean).join(" › ") },
    { nombre: "Unidad de venta", valor: p.unidad },
    p.peso && { nombre: "Peso", valor: `${p.peso} kg` },
    p.garantia && { nombre: "Garantía", valor: p.garantia },
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nombre,
    sku: p.sku,
    mpn: p.modelo || undefined,
    description: p.descripcion || p.nombre,
    image: imagenes.map((i) => `${TIENDA.url}${i}`),
    brand: { "@type": "Brand", name: p.marca },
    category: p.categoria,
    offers: {
      "@type": "Offer",
      url: `${TIENDA.url}/producto/${p.slug}`,
      priceCurrency: "PEN",
      price: p.precioFinal.toFixed(2),
      availability: agotado ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: TIENDA.nombre },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="contenedor">
        <Migas
          items={[
            { nombre: p.categoria, href: `/categoria/${p.categoriaSlug}` },
            ...(p.subcategoria ? [{ nombre: p.subcategoria, href: `/categoria/${p.categoriaSlug}?sub=${p.subcategoriaSlug}` }] : []),
            { nombre: p.nombre },
          ]}
        />

        <div className="grid gap-6 rounded-2xl bg-white p-4 sm:p-6 md:grid-cols-2 lg:gap-10">
          <div className="min-w-0">
            <Galeria imagenes={imagenes} tamanos={p.imagenes.length ? p.tamanos : []} nombre={p.nombre} descuento={p.descuento} />
            {/* Computadora: descripción completa debajo de las fotos */}
            <DescripcionCompleta parrafos={p.descripcionLarga} className="mt-6 hidden md:block" />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Link href={`/marca/${p.marcaSlug}`} className="inline-block transition hover:opacity-80" aria-label={`Ver más productos ${p.marca}`}>
                <LogoMarca marca={{ slug: p.marcaSlug, nombre: p.marca }} className="h-9" compacto />
              </Link>
              <h1 className="mt-1 text-xl font-extrabold leading-tight text-gray-900 sm:text-2xl">{p.nombre}</h1>
              <p className="mt-1 text-xs text-gray-500">
                SKU: {p.sku}
                {p.modelo && ` · Modelo: ${p.modelo}`}
              </p>
            </div>

            <div className="flex items-end gap-3">
              <Precio producto={p} grande />
              {p.descuento > 0 && (
                <span className="mb-1.5 rounded-md bg-oferta px-2 py-0.5 text-sm font-bold text-white">-{p.descuento}%</span>
              )}
            </div>
            {p.precioOferta && <p className="-mt-2 text-sm font-semibold text-green-700">Ahorras {soles(p.precio - p.precioOferta)}</p>}

            <div className="flex flex-wrap gap-2 text-sm">
              {agotado ? (
                <span className="rounded-full bg-gray-800 px-3 py-1 font-bold text-white">Agotado</span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700">
                  <PackageCheck className="h-4 w-4" aria-hidden="true" />
                  {p.stock <= 5 ? `¡Solo quedan ${p.stock}!` : "En stock"}
                </span>
              )}
              {p.garantia && (
                <span className="flex items-center gap-1.5 rounded-full bg-marca-50 px-3 py-1 font-semibold text-marca-700">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Garantía {p.garantia}
                </span>
              )}
            </div>

            {p.descripcion && <p className="text-[15px] leading-relaxed text-gray-700">{p.descripcion}</p>}

            <CompraProducto producto={p} />

            <ul className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-marca-600" aria-hidden="true" />
                <span>
                  Envío a la ciudad de Tacna por {soles(TIENDA.envioTacna)} y a todo el Perú por agencia.{" "}
                  <Link href="/envios" className="font-semibold text-marca-600 underline">
                    Ver costos y plazos
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-marca-600" aria-hidden="true" />
                <span>Paga con {TIENDA.formasPago.join(", ").replace(/, ([^,]*)$/, " o $1")}.</span>
              </li>
            </ul>
            <AsesorProducto producto={p} />
            {/* Celular: descripción completa después de la información de compra */}
            <DescripcionCompleta parrafos={p.descripcionLarga} className="md:hidden" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-4 sm:p-6" aria-labelledby="titulo-specs">
            <h2 id="titulo-specs" className="mb-3 text-lg font-extrabold text-marca-900">
              Especificaciones técnicas
            </h2>
            {p.especificaciones.length ? (
              <ul className="divide-y divide-gray-100 text-sm">
                {p.especificaciones.map((e, i) => (
                  <li key={i} className="flex gap-4 py-2.5">
                    {e.nombre ? (
                      <>
                        <span className="w-2/5 shrink-0 text-gray-500">{e.nombre}</span>
                        <span className="font-semibold text-gray-800">{e.valor}</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-800">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-acento-500" aria-hidden="true" />
                        {e.valor}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Consúltanos por WhatsApp para más detalles técnicos.</p>
            )}
          </section>
          <section className="rounded-2xl bg-white p-4 sm:p-6" aria-labelledby="titulo-ficha">
            <h2 id="titulo-ficha" className="mb-3 text-lg font-extrabold text-marca-900">
              Ficha del producto
            </h2>
            <dl className="divide-y divide-gray-100 text-sm">
              {ficha.map((f) => (
                <div key={f.nombre} className="flex gap-4 py-2.5">
                  <dt className="w-2/5 shrink-0 text-gray-500">{f.nombre}</dt>
                  <dd className="font-semibold text-gray-800">{f.valor}</dd>
                </div>
              ))}
            </dl>
            {p.garantia && (
              <p className="mt-3 text-xs text-gray-500">
                La garantía cubre defectos de fabricación. Revisa nuestra política de{" "}
                <Link href="/cambios-y-devoluciones" className="underline">
                  cambios y devoluciones
                </Link>
                .
              </p>
            )}
          </section>
        </div>
      </div>

      <FilaProductos titulo="Productos relacionados" productos={relacionados(p)} href={`/categoria/${p.categoriaSlug}`} />
      {/* Espacio para la barra fija de compra en celular */}
      {!agotado && <div className="h-16 md:hidden" aria-hidden="true" />}
    </>
  );
}
