import { TIENDA } from "@/lib/config";

// Logo de la marca si existe en config; si no, el nombre en texto.
// compacto: para usos pequeños (fichas y tarjetas): el bloque se ajusta al ancho del logo.
export default function LogoMarca({ marca, className = "h-12", compacto = false }) {
  const logo = TIENDA.logosMarcas?.[marca.slug];
  if (!logo) {
    return compacto ? (
      <span className={`inline-flex items-center text-xs font-bold uppercase tracking-wide text-marca-600 ${className}`}>{marca.nombre}</span>
    ) : (
      <span className={`flex items-center text-2xl font-black uppercase tracking-tight text-marca-900 ${className}`}>{marca.nombre}</span>
    );
  }
  return (
    <span
      className={`${compacto ? "inline-flex w-fit" : "flex"} items-center justify-center rounded-md ${logo.fondo ? (compacto ? "px-2" : "px-3") : ""} ${className}`}
      style={logo.fondo ? { background: logo.fondo } : undefined}
    >
      <img
        src={logo.src}
        alt={marca.nombre}
        className={`${logo.lleno ? "h-full rounded-md" : compacto ? "max-h-[62%]" : "max-h-[70%]"} w-auto max-w-full object-contain`}
      />
    </span>
  );
}
