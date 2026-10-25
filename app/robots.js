import { TIENDA } from "@/lib/config";

export default function robots() {
  // Mientras la tienda no esté lista, se pide a los buscadores que no la recorran
  if (!TIENDA.mostrarEnGoogle) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/carrito"] },
    sitemap: `${TIENDA.url}/sitemap.xml`,
  };
}
