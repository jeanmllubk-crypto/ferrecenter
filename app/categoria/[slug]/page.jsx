import Link from "next/link";
import { notFound } from "next/navigation";
import VistaCatalogo from "@/components/VistaCatalogo";
import Migas from "@/components/Migas";
import IconoCategoria from "@/components/IconoCategoria";
import { IconoWhatsApp } from "@/components/IconosSociales";
import { categorias, obtenerCategoria, productos } from "@/lib/productos";
import { linkWhatsApp } from "@/lib/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return categorias.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = obtenerCategoria(slug);
  if (!c) return {};
  return {
    title: `${c.nombre} en Tacna y todo el Perú`,
    description: `Compra ${c.nombre.toLowerCase()} en FerreCenter, Tacna: precios en soles, garantía y envíos a todo el Perú. Pide por WhatsApp.`,
    alternates: { canonical: `/categoria/${c.slug}` },
    // Las categorías sin productos no se indexan hasta que tengan contenido
    ...(!c.cantidad && { robots: { index: false, follow: true } }),
  };
}

export default async function PaginaCategoria({ params }) {
  const { slug } = await params;
  const c = obtenerCategoria(slug);
  if (!c) notFound();
  const lista = productos.filter((p) => p.categoriaSlug === slug);

  if (!lista.length) {
    const conProductos = categorias.filter((x) => x.cantidad > 0);
    return (
      <div className="contenedor pb-6">
        <Migas items={[{ nombre: "Catálogo", href: "/catalogo" }, { nombre: c.nombre }]} />
        <div className="rounded-2xl bg-white px-6 py-12 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-marca-50 text-marca-700">
            <IconoCategoria slug={c.slug} className="h-10 w-10" />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-acento-500">Próximamente</p>
          <h1 className="mt-1 text-2xl font-extrabold text-marca-900 sm:text-3xl">{c.nombre}</h1>
          <p className="mx-auto mt-2 max-w-md text-gray-600">
            Estamos preparando esta categoría. Si buscas algo en especial, escríbenos y te lo conseguimos.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <a
              href={linkWhatsApp(`Hola FerreCenter, busco productos de ${c.nombre}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3 font-bold text-white hover:bg-whatsapp-oscuro"
            >
              <IconoWhatsApp className="h-5 w-5" /> Consultar por WhatsApp
            </a>
            <Link href="/catalogo" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:border-marca-500">
              Ver todo el catálogo
            </Link>
          </div>
          {conProductos.length > 0 && (
            <div className="mt-10 border-t border-gray-100 pt-6">
              <p className="mb-3 text-sm font-semibold text-gray-500">Mientras tanto, revisa estas categorías:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {conProductos.map((x) => (
                  <Link
                    key={x.slug}
                    href={`/categoria/${x.slug}`}
                    className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-marca-800 hover:border-marca-500"
                  >
                    <IconoCategoria slug={x.slug} className="h-4 w-4 text-acento-500" />
                    {x.nombre}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <VistaCatalogo
      titulo={c.nombre}
      descripcion={`${c.cantidad} ${c.cantidad === 1 ? "producto" : "productos"} de ${c.nombre.toLowerCase()} con garantía y envío a todo el Perú.`}
      migas={[{ nombre: "Catálogo", href: "/catalogo" }, { nombre: c.nombre }]}
      productos={lista}
      fijo={{ categoria: slug }}
    >
      {c.subcategorias.length > 0 && (
        <div className="sin-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
          {c.subcategorias.map((s) => (
            <Link
              key={s.slug}
              href={`/categoria/${c.slug}?sub=${s.slug}`}
              className="shrink-0 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 hover:border-marca-500 hover:text-marca-700"
            >
              {s.nombre}
            </Link>
          ))}
        </div>
      )}
    </VistaCatalogo>
  );
}
