import datos from "@/data/productos.json";

export const IMAGEN_GENERICA = "/img/sin-foto.svg";

export const productos = datos.productos;
export const categorias = datos.categorias;
export const marcas = datos.marcas;

export function imagenPrincipal(p) {
  return p.imagenes?.[0] || IMAGEN_GENERICA;
}

export function obtenerProducto(slug) {
  return productos.find((p) => p.slug === slug);
}

export function obtenerCategoria(slug) {
  return categorias.find((c) => c.slug === slug);
}

export function obtenerMarca(slug) {
  return marcas.find((m) => m.slug === slug);
}

const disponiblesPrimero = (a, b) => (b.stock > 0) - (a.stock > 0);

export function ofertasDelDia(n = 8) {
  return productos
    .filter((p) => p.precioOferta)
    .sort((a, b) => disponiblesPrimero(a, b) || b.descuento - a.descuento)
    .slice(0, n);
}

// "Más vendidos": primero los marcados como Destacado en el Excel
export function masVendidos(n = 8) {
  return [...productos]
    .sort((a, b) => disponiblesPrimero(a, b) || b.destacado - a.destacado || a.orden - b.orden)
    .slice(0, n);
}

export function destacados(n = 8) {
  return productos.filter((p) => p.destacado).slice(0, n);
}

// "Nuevos": las últimas filas agregadas al Excel
export function nuevos(n = 8) {
  return [...productos].sort((a, b) => b.orden - a.orden).slice(0, n);
}

export function relacionados(producto, n = 8) {
  const puntaje = (p) =>
    (p.subcategoriaSlug && p.subcategoriaSlug === producto.subcategoriaSlug ? 3 : 0) +
    (p.categoriaSlug === producto.categoriaSlug ? 2 : 0) +
    (p.marcaSlug === producto.marcaSlug ? 1 : 0);
  return productos
    .filter((p) => p.sku !== producto.sku)
    .map((p) => ({ p, s: puntaje(p) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map(({ p }) => p);
}
