// Piezas compartidas por las imágenes de vista previa (WhatsApp, Facebook, Google)
import fs from "node:fs/promises";
import path from "node:path";

export const TAMANO_OG = { width: 1200, height: 630 };
export const COLORES = { navy: "#0a2a4e", navyClaro: "#155aa8", naranja: "#f57c00", oferta: "#d4202f" };

export async function fuentesOg() {
  const dir = path.join(process.cwd(), "node_modules", "@fontsource", "inter", "files");
  const cargar = (peso) => fs.readFile(path.join(dir, `inter-latin-${peso}-normal.woff`));
  const [regular, negrita, extra] = await Promise.all([cargar(400), cargar(700), cargar(800)]);
  return [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: negrita, weight: 700, style: "normal" },
    { name: "Inter", data: extra, weight: 800, style: "normal" },
  ];
}

// Convierte una imagen de /public en data URI (el generador no puede leer rutas relativas)
export async function imagenComoDataUri(ruta) {
  if (!ruta) return null;
  try {
    const archivo = path.join(process.cwd(), "public", decodeURIComponent(ruta));
    const ext = path.extname(archivo).slice(1).toLowerCase();
    const tipo = { jpg: "jpeg", jpeg: "jpeg", png: "png", webp: "webp", svg: "svg+xml" }[ext];
    if (!tipo || tipo === "webp") return null;
    const datos = await fs.readFile(archivo);
    return `data:image/${tipo};base64,${datos.toString("base64")}`;
  } catch {
    return null;
  }
}

export function Diana({ tamano = 120, mira = "#fff" }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="14.5" fill="none" stroke={COLORES.naranja} strokeWidth="4" />
      <circle cx="20" cy="20" r="4.5" fill={COLORES.naranja} />
      <path d="M20 1.5v6M20 32.5v6M1.5 20h6M32.5 20h6" stroke={mira} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Marca({ tamano = 64, claro = true }) {
  return (
    <div style={{ display: "flex", fontSize: tamano, fontWeight: 800, letterSpacing: -tamano * 0.03 }}>
      <span style={{ color: claro ? "#fff" : COLORES.navy }}>Ferre</span>
      <span style={{ color: COLORES.naranja }}>Center</span>
    </div>
  );
}
