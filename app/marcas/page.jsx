import Image from "next/image";
import Link from "next/link";
import Migas from "@/components/Migas";
import LogoMarca from "@/components/LogoMarca";
import { imagenPrincipal, marcas, productos } from "@/lib/productos";

export const metadata = {
  title: "Marcas: Truper, Uyustools y Total",
  description: "Compra por marca en FerreCenter: productos Truper, Uyustools y Total originales con garantía y envíos a todo el Perú.",
  alternates: { canonical: "/marcas" },
};

export default function PaginaMarcas() {
  return (
    <div className="contenedor pb-6">
      <Migas items={[{ nombre: "Marcas" }]} />
      <h1 className="mb-4 text-2xl font-extrabold text-marca-900 sm:text-3xl">Nuestras marcas</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {marcas.map((m) => {
          const muestra = productos.filter((p) => p.marcaSlug === m.slug).slice(0, 4);
          return (
            <li key={m.slug}>
              <Link href={`/marca/${m.slug}`} className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-marca-500 hover:shadow-lg">
                <LogoMarca marca={m} className="mb-2 h-14 w-full" />
                <span className="text-sm text-gray-500">
                  {m.cantidad} {m.cantidad === 1 ? "producto" : "productos"}
                </span>
                <span className="mt-4 grid grid-cols-4 gap-2">
                  {muestra.map((p) => (
                    <span key={p.sku} className="relative aspect-square rounded-lg bg-gray-50">
                      <Image src={imagenPrincipal(p)} alt={p.nombre} fill sizes="80px" className="object-contain p-1" />
                    </span>
                  ))}
                </span>
                <span className="mt-4 inline-block text-sm font-semibold text-marca-600">Ver productos {m.nombre} →</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
