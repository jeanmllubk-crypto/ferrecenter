import { Suspense } from "react";
import Catalogo from "./Catalogo";
import Migas from "./Migas";
import TarjetaProducto from "./TarjetaProducto";
import { categorias, marcas } from "@/lib/productos";

// Mientras carga el filtro (y para Google), se muestra la grilla completa en HTML
function GrillaInicial({ productos }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {productos.slice(0, 24).map((p) => (
        <li key={p.sku}>
          <TarjetaProducto producto={p} />
        </li>
      ))}
    </ul>
  );
}

export default function VistaCatalogo({ titulo, descripcion, migas, productos, fijo, children }) {
  return (
    <div className="contenedor pb-6">
      <Migas items={migas} />
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold text-marca-900 sm:text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-1 max-w-3xl text-sm text-gray-600 sm:text-base">{descripcion}</p>}
      </header>
      {children}
      <Suspense fallback={<GrillaInicial productos={productos} />}>
        <Catalogo productos={productos} categorias={categorias} marcas={marcas} fijo={fijo} />
      </Suspense>
    </div>
  );
}
