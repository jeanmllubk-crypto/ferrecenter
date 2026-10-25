import VistaCatalogo from "@/components/VistaCatalogo";
import { productos } from "@/lib/productos";

export const metadata = {
  title: "Catálogo de herramientas, EPP y accesorios",
  description:
    "Encuentra herramientas, equipos de protección personal (EPP), protección colectiva, discos de corte, desarmadores y accesorios. Filtra por marca, categoría y precio. Precios en soles y envíos a todo el Perú.",
  alternates: { canonical: "/catalogo" },
};

export default function PaginaCatalogo() {
  return (
    <VistaCatalogo
      titulo="Catálogo de productos"
      descripcion="Herramientas eléctricas y manuales, EPP, protección colectiva, discos de corte y accesorios, con garantía y envío a todo el Perú."
      migas={[{ nombre: "Catálogo" }]}
      productos={productos}
    />
  );
}
