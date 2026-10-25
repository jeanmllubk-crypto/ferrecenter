import { ImageResponse } from "next/og";
import { COLORES, Diana, Marca, TAMANO_OG, fuentesOg } from "@/lib/og";
import { TIENDA } from "@/lib/config";

export const alt = "FerreCenter: herramientas, EPP y accesorios con envíos a todo el Perú";
export const size = TAMANO_OG;
export const contentType = "image/png";

export default async function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: COLORES.navy,
          padding: "70px 80px",
          fontFamily: "Inter",
          color: "#fff",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -140, top: -140, width: 520, height: 520, borderRadius: 520, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", right: 120, bottom: -220, width: 420, height: 420, borderRadius: 420, background: "rgba(245,124,0,0.12)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Diana tamano={130} />
          <Marca tamano={92} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.15, maxWidth: 1040 }}>
            Herramientas, EPP y accesorios para tu obra
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {["Envíos a todo el Perú", "Yape · Plin · Contra entrega"].map((t) => (
              <div key={t} style={{ display: "flex", background: COLORES.naranja, color: "#fff", fontSize: 28, fontWeight: 700, padding: "10px 22px", borderRadius: 999 }}>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#aecdee" }}>
          <span>Tacna, Perú</span>
          <span>WhatsApp {TIENDA.telefonoVisible}</span>
        </div>
      </div>
    ),
    { ...size, fonts: await fuentesOg() }
  );
}
