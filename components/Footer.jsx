import Link from "next/link";
import { BookOpen, Clock, Mail, MapPin, Phone, ShieldCheck, Truck, RefreshCw, CreditCard } from "lucide-react";
import Logo from "./Logo";
import { IconoFacebook, IconoInstagram, IconoTiktok, IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp, TIENDA } from "@/lib/config";

const BENEFICIOS = [
  { icono: Truck, titulo: "Envíos a todo el Perú", texto: "Despachamos desde Tacna" },
  { icono: ShieldCheck, titulo: "Garantía oficial", texto: "Productos 100 % originales" },
  { icono: CreditCard, titulo: "Paga como prefieras", texto: "Yape, Plin, transferencia o contra entrega" },
  { icono: RefreshCw, titulo: "Cambios fáciles", texto: "Hasta 7 días después de tu compra" },
];

export default function Footer({ categorias }) {
  const columnas = [
    {
      titulo: "Categorías",
      enlaces: categorias.slice(0, 6).map((c) => ({ href: `/categoria/${c.slug}`, texto: c.nombre })),
    },
    {
      titulo: "Ayuda",
      enlaces: [
        { href: "/envios", texto: "Envíos y entregas" },
        { href: "/cambios-y-devoluciones", texto: "Cambios y devoluciones" },
        { href: "/contacto", texto: "Contacto" },
        { href: "/carrito", texto: "Mi carrito" },
      ],
    },
    {
      titulo: "FerreCenter",
      enlaces: [
        { href: "/nosotros", texto: "Nosotros" },
        { href: "/catalogo", texto: "Catálogo completo" },
        { href: "/marcas", texto: "Marcas" },
        { href: "/catalogo?oferta=1", texto: "Ofertas" },
      ],
    },
  ];

  const redes = [
    { href: TIENDA.redes.facebook, icono: IconoFacebook, nombre: "Facebook" },
    { href: TIENDA.redes.instagram, icono: IconoInstagram, nombre: "Instagram" },
    { href: TIENDA.redes.tiktok, icono: IconoTiktok, nombre: "TikTok" },
    { href: linkWhatsApp(), icono: IconoWhatsApp, nombre: "WhatsApp" },
  ];

  return (
    <footer className="mt-10 bg-marca-950 text-marca-100">
      <div className="border-b border-white/10 bg-marca-900">
        <ul className="contenedor grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
          {BENEFICIOS.map(({ icono: Icono, titulo, texto }) => (
            <li key={titulo} className="flex items-start gap-3">
              <Icono className="mt-0.5 h-7 w-7 shrink-0 text-acento-400" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-white">{titulo}</span>
                <span className="text-xs text-marca-200">{texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="contenedor grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-marca-200">{TIENDA.eslogan}. Atención personalizada y despacho rápido.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <IconoWhatsApp className="h-4 w-4 text-[#4ade80]" />
              <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {TIENDA.telefonoVisible}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <a href={`tel:${TIENDA.telefonoLlamadas}`} className="hover:text-white">
                Llamar ahora
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <a href={`mailto:${TIENDA.correoDestino}`} className="hover:text-white">
                {TIENDA.correo}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {TIENDA.direccion}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" /> {TIENDA.horario}
            </li>
          </ul>
          <div className="mt-5 flex gap-2">
            {redes.map(({ href, icono: Icono, nombre }) => (
              <a
                key={nombre}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`FerreCenter en ${nombre}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-acento-500"
              >
                <Icono className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {columnas.map((col) => (
          <div key={col.titulo}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">{col.titulo}</h2>
            <ul className="space-y-2 text-sm">
              {col.enlaces.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="text-marca-200 hover:text-white hover:underline">
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-marca-200">Formas de pago</p>
            <ul className="flex flex-wrap gap-2">
              {TIENDA.formasPago.map((f) => (
                <li key={f} className="rounded-md bg-white px-3 py-1 text-xs font-bold text-marca-900">
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-marca-200">
              Yape y Plin: <strong className="text-white">{TIENDA.pagos.yape.numero}</strong>
            </p>
          </div>
          <Link
            href="/libro-de-reclamaciones"
            className="flex items-center gap-3 self-start rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 hover:bg-white/10"
          >
            <BookOpen className="h-8 w-8 text-acento-400" aria-hidden="true" />
            <span className="text-sm leading-tight">
              <span className="block font-bold text-white">Libro de Reclamaciones</span>
              <span className="text-xs text-marca-200">Conforme al Código de Protección y Defensa del Consumidor</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="bg-black/30 px-4 py-4 text-center text-xs text-marca-200">
        <p className="mb-1 font-semibold text-white/90">
          {TIENDA.nombre} es una marca de {TIENDA.razonSocial}
        </p>
        © {new Date().getFullYear()} {TIENDA.razonSocial} · {TIENDA.ruc} · Precios en soles (S/.) con IGV incluido. Las marcas mencionadas pertenecen a
        sus respectivos titulares.
      </div>
    </footer>
  );
}
