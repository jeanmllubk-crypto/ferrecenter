import Link from "next/link";
import { ChevronRight } from "lucide-react";
import TarjetaProducto from "./TarjetaProducto";

// Sección de portada: carrusel deslizable en celular, grilla en escritorio
export default function FilaProductos({ titulo, icono, href, productos, prioridad = false }) {
  if (!productos.length) return null;
  return (
    <section className="contenedor py-5" aria-label={titulo}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-marca-900 sm:text-xl">
          {icono}
          {titulo}
        </h2>
        {href && (
          <Link href={href} className="flex shrink-0 items-center text-sm font-semibold text-marca-600 hover:underline">
            Ver todo <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="sin-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {productos.map((p, i) => (
          <div key={p.sku} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23%] lg:w-auto">
            <TarjetaProducto producto={p} prioridad={prioridad && i < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
