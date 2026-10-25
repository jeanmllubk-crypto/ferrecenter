"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingCart, Truck, X } from "lucide-react";
import Logo from "./Logo";
import IconoCategoria from "./IconoCategoria";
import { IconoWhatsApp } from "./IconosSociales";
import { useCarrito } from "./CarritoContext";
import { linkWhatsApp, TIENDA } from "@/lib/config";
import { soles } from "@/lib/formato";

const normalizar = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Ejemplos que rotan en el buscador (puedes cambiarlos o agregar más)
const EJEMPLOS_BUSQUEDA = [
  "taladro",
  "casco de seguridad",
  "disco de corte",
  "guantes de trabajo",
  "desarmador",
  "cono de seguridad",
  "lentes de protección",
  "amoladora",
  "arnés de seguridad",
  "wincha",
];

const ENLACES = [
  { href: "/catalogo?oferta=1", texto: "Ofertas" },
  { href: "/catalogo?orden=nuevos", texto: "Nuevos" },
  { href: "/marcas", texto: "Marcas" },
  { href: "/envios", texto: "Envíos" },
  { href: "/contacto", texto: "Contacto" },
];

function Buscador({ id, indice, autoFocus = false, alBuscar, qUrl = "" }) {
  const router = useRouter();
  const [q, setQ] = useState(qUrl);
  const [abierto, setAbierto] = useState(false);
  const [ejemplo, setEjemplo] = useState(0);

  // El texto de ayuda va rotando ejemplos del catálogo
  useEffect(() => {
    const t = setInterval(() => setEjemplo((i) => (i + 1) % EJEMPLOS_BUSQUEDA.length), 3000);
    return () => clearInterval(t);
  }, []);
  const caja = useRef(null);

  // Mantiene en la caja lo que se buscó (y la limpia al salir del catálogo)
  useEffect(() => setQ(qUrl), [qUrl]);

  const sugerencias = useMemo(() => {
    const t = normalizar(q).trim();
    if (t.length < 2) return [];
    const palabras = t.split(/\s+/);
    return indice.filter((p) => palabras.every((w) => p.texto.includes(w))).slice(0, 6);
  }, [q, indice]);

  useEffect(() => {
    const cerrar = (e) => caja.current && !caja.current.contains(e.target) && setAbierto(false);
    document.addEventListener("pointerdown", cerrar);
    return () => document.removeEventListener("pointerdown", cerrar);
  }, []);

  function enviar(e) {
    e.preventDefault();
    setAbierto(false);
    alBuscar?.();
    router.push(q.trim() ? `/catalogo?q=${encodeURIComponent(q.trim())}` : "/catalogo");
  }

  return (
    <div ref={caja} className="relative w-full">
      <form role="search" onSubmit={enviar} className="flex w-full overflow-hidden rounded-full bg-white shadow-sm">
        <label htmlFor={id} className="sr-only">
          Buscar productos
        </label>
        <input
          id={id}
          type="search"
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => {
            setQ(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          placeholder={`¿Qué buscas? Ej.: ${EJEMPLOS_BUSQUEDA[ejemplo]}`}
          className="min-w-0 flex-1 px-4 py-2.5 text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
        />
        <button type="submit" aria-label="Buscar" className="flex items-center bg-acento-500 px-4 text-white hover:bg-acento-600">
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
      {abierto && sugerencias.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {sugerencias.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/producto/${p.slug}`}
                onClick={() => {
                  setAbierto(false);
                  setQ("");
                  alBuscar?.();
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-marca-50"
              >
                <Image src={p.imagen} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-gray-800">{p.nombre}</span>
                  <span className="text-xs font-semibold text-marca-600">{p.marca}</span>
                </span>
                <span className="text-sm font-bold text-marca-600">{soles(p.precio)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LeerBusqueda(props) {
  const params = useSearchParams();
  const pathname = usePathname();
  return <Buscador {...props} qUrl={pathname === "/catalogo" ? params.get("q") || "" : ""} />;
}

// useSearchParams necesita Suspense para que las páginas sigan siendo estáticas
function BuscadorConUrl(props) {
  return (
    <Suspense fallback={<Buscador {...props} />}>
      <LeerBusqueda {...props} />
    </Suspense>
  );
}

function MegaMenu({ categorias, marcas, cerrar }) {
  const [activa, setActiva] = useState(categorias.find((c) => c.cantidad) || categorias[0]);
  if (!activa) return null;
  return (
    <div className="absolute left-0 right-0 top-full z-40 hidden lg:block">
      <div className="contenedor">
        <div className="grid grid-cols-[18rem_1fr] overflow-hidden rounded-b-xl border border-t-0 border-gray-200 bg-white text-gray-800 shadow-2xl">
          <ul className="max-h-[70vh] overflow-y-auto border-r border-gray-100 bg-gray-50 py-2">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categoria/${c.slug}`}
                  onMouseEnter={() => setActiva(c)}
                  onFocus={() => setActiva(c)}
                  onClick={cerrar}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                    activa.slug === c.slug ? "bg-white font-semibold text-marca-700" : "hover:bg-white"
                  }`}
                >
                  <IconoCategoria slug={c.slug} className="h-5 w-5 text-acento-500" />
                  <span className="flex-1">{c.nombre}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-marca-900">{activa.nombre}</h3>
              <Link href={`/categoria/${activa.slug}`} onClick={cerrar} className="text-sm font-semibold text-marca-600 hover:underline">
                Ver todo ({activa.cantidad})
              </Link>
            </div>
            {activa.subcategorias.length ? (
              <ul className="grid grid-cols-3 gap-x-6 gap-y-2">
                {activa.subcategorias.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/categoria/${activa.slug}?sub=${s.slug}`}
                      onClick={cerrar}
                      className="text-sm text-gray-700 hover:text-marca-600 hover:underline"
                    >
                      {s.nombre} <span className="text-gray-400">({s.cantidad})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Pronto agregaremos productos en esta categoría. ¿Buscas algo en especial?{" "}
                <a href={linkWhatsApp(`Hola FerreCenter, busco productos de ${activa.nombre}`)} className="font-semibold text-whatsapp-oscuro underline">
                  Escríbenos por WhatsApp
                </a>
                .
              </p>
            )}
            <div className="mt-8 border-t border-gray-100 pt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Compra por marca</p>
              <div className="flex flex-wrap gap-2">
                {marcas.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/categoria/${activa.slug}?marca=${m.slug}`}
                    onClick={cerrar}
                    className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-marca-800 hover:border-marca-500"
                  >
                    {m.nombre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuMovil({ categorias, marcas, cerrar }) {
  const [abierta, setAbierta] = useState(null);
  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
      <div className="absolute inset-0 bg-black/50" onClick={cerrar} />
      <nav className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-white">
        <div className="flex items-center justify-between bg-marca-900 px-4 py-3">
          <Logo />
          <button onClick={cerrar} aria-label="Cerrar menú" className="rounded-full p-1 text-white hover:bg-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-gray-500">Categorías</p>
        <ul>
          {categorias.map((c) => (
            <li key={c.slug} className="border-b border-gray-100">
              <div className="flex items-center">
                <Link href={`/categoria/${c.slug}`} onClick={cerrar} className="flex flex-1 items-center gap-3 px-4 py-3 text-[15px] text-gray-800">
                  <IconoCategoria slug={c.slug} className="h-5 w-5 text-acento-500" />
                  {c.nombre}
                </Link>
                {c.subcategorias.length > 0 && (
                  <button
                    onClick={() => setAbierta(abierta === c.slug ? null : c.slug)}
                    aria-expanded={abierta === c.slug}
                    aria-label={`Ver subcategorías de ${c.nombre}`}
                    className="px-4 py-3 text-gray-500"
                  >
                    <ChevronDown className={`h-5 w-5 transition ${abierta === c.slug ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
              {abierta === c.slug && (
                <ul className="bg-gray-50 pb-2">
                  {c.subcategorias.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/categoria/${c.slug}?sub=${s.slug}`} onClick={cerrar} className="block py-2 pl-12 pr-4 text-sm text-gray-700">
                        {s.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <p className="px-4 pb-1 pt-5 text-xs font-bold uppercase tracking-wide text-gray-500">Marcas</p>
        <div className="flex flex-wrap gap-2 px-4">
          {marcas.map((m) => (
            <Link key={m.slug} href={`/marca/${m.slug}`} onClick={cerrar} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-marca-800">
              {m.nombre}
            </Link>
          ))}
        </div>
        <ul className="mt-5 border-t border-gray-100 py-2 text-[15px]">
          {[...ENLACES, { href: "/nosotros", texto: "Nosotros" }, { href: "/cambios-y-devoluciones", texto: "Cambios y devoluciones" }, { href: "/libro-de-reclamaciones", texto: "Libro de Reclamaciones" }].map((e) => (
            <li key={e.href}>
              <Link href={e.href} onClick={cerrar} className="block px-4 py-2.5 text-gray-700">
                {e.texto}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={linkWhatsApp("Hola FerreCenter, quisiera hacer una consulta.")}
          target="_blank"
          rel="noopener noreferrer"
          className="m-4 mt-auto flex items-center justify-center gap-2 rounded-lg bg-whatsapp py-3 font-semibold text-white"
        >
          <IconoWhatsApp className="h-5 w-5" /> Escríbenos por WhatsApp
        </a>
      </nav>
    </div>
  );
}

export default function Header({ categorias, marcas, indice }) {
  const pathname = usePathname();
  const { totalUnidades, cargado } = useCarrito();
  const [megaAbierto, setMegaAbierto] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);
  const temporizador = useRef(null);

  const indiceBusqueda = useMemo(
    () => indice.map((p) => ({ ...p, texto: normalizar(`${p.nombre} ${p.marca} ${p.sku} ${p.categoria} ${p.subcategoria}`) })),
    [indice]
  );

  useEffect(() => {
    setMegaAbierto(false);
    setMenuMovil(false);
  }, [pathname]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && (setMegaAbierto(false), setMenuMovil(false));
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuMovil ? "hidden" : "";
  }, [menuMovil]);

  const abrirMega = () => {
    clearTimeout(temporizador.current);
    setMegaAbierto(true);
  };
  const cerrarMega = () => {
    temporizador.current = setTimeout(() => setMegaAbierto(false), 150);
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <div className="hidden bg-marca-950 text-xs text-marca-100 sm:block">
        <div className="contenedor flex h-8 items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Envíos a todo el Perú
          </span>
          <span className="flex items-center gap-4">
            <span>{TIENDA.horario}</span>
            <Link href="/libro-de-reclamaciones" className="hover:text-white">
              Libro de Reclamaciones
            </Link>
          </span>
        </div>
      </div>

      <div className="bg-marca-900">
        <div className="contenedor flex items-center gap-3 py-2.5 lg:gap-6 lg:py-3">
          <button onClick={() => setMenuMovil(true)} aria-label="Abrir menú" className="-ml-1 rounded-lg p-1 text-white hover:bg-white/10 lg:hidden">
            <Menu className="h-7 w-7" />
          </button>
          <Logo />
          <div className="hidden flex-1 md:block">
            <BuscadorConUrl id="buscar" indice={indiceBusqueda} />
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <a
              href={linkWhatsApp("Hola FerreCenter, quisiera hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg p-2 text-white hover:bg-white/10"
            >
              <IconoWhatsApp className="h-6 w-6 text-[#4ade80]" />
              <span className="hidden text-left text-xs leading-tight xl:block">
                Ventas por WhatsApp
                <span className="block text-sm font-bold">{TIENDA.telefonoVisible}</span>
              </span>
            </a>
            <Link href="/carrito" className="relative flex items-center gap-2 rounded-lg p-2 text-white hover:bg-white/10" aria-label={`Carrito, ${totalUnidades} productos`}>
              <ShoppingCart className="h-7 w-7" />
              {cargado && totalUnidades > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-acento-500 px-1 text-xs font-bold text-white">
                  {totalUnidades > 99 ? "99+" : totalUnidades}
                </span>
              )}
              <span className="hidden text-sm font-semibold lg:block">Carrito</span>
            </Link>
          </div>
        </div>
        <div className="contenedor pb-2.5 md:hidden">
          <BuscadorConUrl id="buscar-movil" indice={indiceBusqueda} />
        </div>
      </div>

      <nav className="relative hidden bg-marca-800 lg:block" onMouseLeave={cerrarMega} aria-label="Navegación principal">
        <div className="contenedor flex h-11 items-center gap-1 text-sm text-white">
          <button
            onMouseEnter={abrirMega}
            onClick={() => setMegaAbierto((v) => !v)}
            aria-expanded={megaAbierto}
            className={`flex h-full items-center gap-2 px-4 font-semibold ${megaAbierto ? "bg-white text-marca-900" : "bg-marca-700 hover:bg-marca-600"}`}
          >
            <Menu className="h-5 w-5" aria-hidden="true" /> Categorías
            <ChevronDown className={`h-4 w-4 transition ${megaAbierto ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {ENLACES.map((e) => (
            <Link key={e.href} href={e.href} className="rounded px-3 py-1.5 hover:bg-white/10">
              {e.texto}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-1">
            {marcas.map((m) => (
              <Link key={m.slug} href={`/marca/${m.slug}`} className="rounded px-3 py-1.5 font-semibold text-acento-400 hover:bg-white/10">
                {m.nombre}
              </Link>
            ))}
          </span>
        </div>
        {megaAbierto && (
          <div onMouseEnter={abrirMega}>
            <MegaMenu categorias={categorias} marcas={marcas} cerrar={() => setMegaAbierto(false)} />
          </div>
        )}
      </nav>

      {menuMovil && <MenuMovil categorias={categorias} marcas={marcas} cerrar={() => setMenuMovil(false)} />}
    </header>
  );
}
