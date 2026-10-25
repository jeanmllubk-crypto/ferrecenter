import { categorias, marcas, productos } from "@/lib/productos";
import { TIENDA } from "@/lib/config";

export default function sitemap() {
  const ahora = new Date();
  const url = (ruta) => `${TIENDA.url}${ruta}`;
  const fijas = ["", "/catalogo", "/marcas", "/nosotros", "/envios", "/cambios-y-devoluciones", "/contacto", "/libro-de-reclamaciones", "/privacidad"];
  return [
    ...fijas.map((r) => ({ url: url(r), lastModified: ahora, changeFrequency: "weekly", priority: r === "" ? 1 : 0.5 })),
    ...categorias.filter((c) => c.cantidad).map((c) => ({ url: url(`/categoria/${c.slug}`), lastModified: ahora, changeFrequency: "weekly", priority: 0.7 })),
    ...marcas.map((m) => ({ url: url(`/marca/${m.slug}`), lastModified: ahora, changeFrequency: "weekly", priority: 0.7 })),
    ...productos.map((p) => ({ url: url(`/producto/${p.slug}`), lastModified: ahora, changeFrequency: "weekly", priority: 0.8 })),
  ];
}
