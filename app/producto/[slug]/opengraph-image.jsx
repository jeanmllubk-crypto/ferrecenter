import { ImageResponse } from "next/og";
import { COLORES, Diana, Marca, TAMANO_OG, fuentesOg, imagenComoDataUri } from "@/lib/og";
import { obtenerProducto, productos } from "@/lib/productos";
import { soles } from "@/lib/formato";

export const alt = "Producto de FerreCenter";
export const size = TAMANO_OG;
export const contentType = "image/png";

export function generateStaticParams() {
  return productos.map((p) => ({ slug: p.slug }));
}

export default async function Imagen({ params }) {
  const { slug } = await params;
  const p = obtenerProducto(slug);
  const foto = await imagenComoDataUri(p?.imagenes?.[0]);
  const nombre = p ? (p.nombre.length > 60 ? `${p.nombre.slice(0, 57)}…` : p.nombre) : "FerreCenter";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Inter", background: COLORES.navy }}>
        <div style={{ width: 560, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", position: "relative" }}>
          {foto ? (
            <img src={foto} width={440} height={440} style={{ objectFit: "contain" }} />
          ) : (
            <Diana tamano={260} mira={COLORES.navy} />
          )}
          {p?.descuento > 0 && (
            <div style={{ position: "absolute", top: 36, left: 36, display: "flex", background: COLORES.oferta, color: "#fff", fontSize: 40, fontWeight: 800, padding: "8px 20px", borderRadius: 12 }}>
              -{p.descuento}%
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 60px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Diana tamano={56} />
            <Marca tamano={40} />
          </div>

          {p && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORES.naranja, textTransform: "uppercase", letterSpacing: 2 }}>{p.marca}</div>
              <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.12 }}>{nombre}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 8 }}>
                <div style={{ fontSize: 64, fontWeight: 800, color: p.precioOferta ? "#ff8a8a" : "#fff" }}>{soles(p.precioFinal)}</div>
                {p.precioOferta && (
                  <div style={{ fontSize: 32, color: "#aecdee", textDecoration: "line-through", marginBottom: 12 }}>{soles(p.precio)}</div>
                )}
              </div>
              {p.stock <= 0 && <div style={{ fontSize: 28, fontWeight: 700, color: "#aecdee" }}>Agotado</div>}
            </div>
          )}

          <div style={{ display: "flex", fontSize: 26, color: "#aecdee" }}>Envíos a todo el Perú · Pide por WhatsApp</div>
        </div>
      </div>
    ),
    { ...size, fonts: await fuentesOg() }
  );
}
