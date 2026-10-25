"use client";

import { usePathname } from "next/navigation";
import { IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp } from "@/lib/config";

export default function WhatsAppFlotante() {
  const pathname = usePathname();
  // En ficha de producto y carrito hay una barra fija abajo en celular: subimos el botón
  const elevado = pathname.startsWith("/producto/") || pathname === "/carrito";
  return (
    <a
      href={linkWhatsApp("Hola FerreCenter, quisiera hacer una consulta.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={`fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg ring-4 ring-white/60 transition hover:scale-105 hover:bg-whatsapp-oscuro lg:bottom-6 ${
        elevado ? "bottom-24" : "bottom-5"
      }`}
    >
      <IconoWhatsApp className="h-8 w-8" />
    </a>
  );
}
