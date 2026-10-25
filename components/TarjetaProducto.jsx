import Image from "next/image";
import Link from "next/link";
import Precio from "./Precio";
import LogoMarca from "./LogoMarca";
import BotonAgregar from "./BotonAgregar";
import { imagenPrincipal } from "@/lib/productos";

export default function TarjetaProducto({ producto, prioridad = false }) {
  const agotado = producto.stock <= 0;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg">
      <Link href={`/producto/${producto.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square bg-white">
          <Image
            src={imagenPrincipal(producto)}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-contain p-3 transition duration-300 group-hover:scale-105 ${agotado ? "opacity-50" : ""}`}
            priority={prioridad}
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {producto.descuento > 0 && (
              <span className="rounded-md bg-oferta px-2 py-0.5 text-xs font-bold text-white">-{producto.descuento}%</span>
            )}
            {agotado && <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs font-bold text-white">Agotado</span>}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1 px-3 pb-2 pt-1">
          <LogoMarca marca={{ slug: producto.marcaSlug, nombre: producto.marca }} className="mt-1 h-6" compacto />
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-gray-800">{producto.nombre}</h3>
          <div className="mt-auto pt-1">
            <Precio producto={producto} />
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <BotonAgregar producto={producto} />
      </div>
    </article>
  );
}
