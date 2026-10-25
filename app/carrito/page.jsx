import Migas from "@/components/Migas";
import VistaCarrito from "@/components/VistaCarrito";
import { imagenPrincipal, productos } from "@/lib/productos";

export const metadata = {
  title: "Carrito de compras",
  robots: { index: false, follow: true },
};

export default function PaginaCarrito() {
  // Precios y stock vigentes, para corregir carritos guardados con datos antiguos
  const actuales = Object.fromEntries(
    productos.map((p) => [p.sku, { nombre: p.nombre, slug: p.slug, precio: p.precioFinal, stock: p.stock, imagen: imagenPrincipal(p) }])
  );
  return (
    <div className="contenedor pb-6">
      <Migas items={[{ nombre: "Carrito" }]} />
      <h1 className="mb-4 text-2xl font-extrabold text-marca-900 sm:text-3xl">Mi carrito</h1>
      <VistaCarrito actuales={actuales} />
    </div>
  );
}
