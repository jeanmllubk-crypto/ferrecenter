import Link from "next/link";

export default function Logo({ claro = true, className = "" }) {
  return (
    <Link href="/" aria-label="FerreCenter, ir al inicio" className={`flex items-center gap-2 shrink-0 ${className}`}>
      {/* Diana: anillo y centro naranjas con mira; la mira cambia de color según el fondo */}
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <circle cx="20" cy="20" r="14.5" fill="none" stroke="#f57c00" strokeWidth="4" />
        <circle cx="20" cy="20" r="4.5" fill="#f57c00" />
        <path d="M20 1.5v6M20 32.5v6M1.5 20h6M32.5 20h6" stroke={claro ? "#fff" : "#0a2a4e"} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className={`text-[1.45rem] font-extrabold tracking-tight leading-none ${claro ? "text-white" : "text-marca-900"}`}>
        Ferre<span className="text-acento-500">Center</span>
      </span>
    </Link>
  );
}
