import { notFound } from "next/navigation";
import VistaCatalogo from "@/components/VistaCatalogo";
import { marcas, obtenerMarca, productos } from "@/lib/productos";

export const dynamicParams = false;

export function generateStaticParams() {
  return marcas.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = obtenerMarca(slug);
  if (!m) return {};
  return {
    title: `${m.nombre} en Perú: herramientas y accesorios originales`,
    description: `Compra productos ${m.nombre} originales en FerreCenter: precios en soles, garantía y envíos a todo el Perú. Pide por WhatsApp.`,
    alternates: { canonical: `/marca/${m.slug}` },
  };
}

export default async function PaginaMarca({ params }) {
  const { slug } = await params;
  const m = obtenerMarca(slug);
  if (!m) notFound();
  return (
    <VistaCatalogo
      titulo={`Productos ${m.nombre}`}
      descripcion={`Productos ${m.nombre} originales con garantía. ${m.cantidad} ${m.cantidad === 1 ? "producto disponible" : "productos disponibles"}.`}
      migas={[{ nombre: "Marcas", href: "/marcas" }, { nombre: m.nombre }]}
      productos={productos.filter((p) => p.marcaSlug === slug)}
      fijo={{ marca: slug }}
    />
  );
}
