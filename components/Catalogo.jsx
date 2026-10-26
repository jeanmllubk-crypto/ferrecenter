"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import TarjetaProducto from "./TarjetaProducto";
import { IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp } from "@/lib/config";

const POR_PAGINA = 24;

const ORDENES = [
  { valor: "relevancia", texto: "Relevancia" },
  { valor: "nuevos", texto: "Más nuevos" },
  { valor: "precio-asc", texto: "Precio: menor a mayor" },
  { valor: "precio-desc", texto: "Precio: mayor a menor" },
  { valor: "descuento", texto: "Mayor descuento" },
];

const RANGOS = [
  { min: "", max: "50", texto: "Hasta S/. 50" },
  { min: "50", max: "100", texto: "S/. 50 a S/. 100" },
  { min: "100", max: "300", texto: "S/. 100 a S/. 300" },
  { min: "300", max: "", texto: "Más de S/. 300" },
];

const normalizar = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const lista = (v) => (v ? v.split(",").filter(Boolean) : []);

function Grupo({ titulo, children }) {
  return (
    <fieldset className="border-b border-gray-200 pb-5 pt-5 first:pt-1 last:border-b-0">
      <legend className="float-left mb-2.5 w-full text-sm font-bold text-marca-900">{titulo}</legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  );
}

function Opcion({ marcado, alCambiar, texto, cantidad, tipo = "checkbox", nombre }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-gray-700">
      <input type={tipo} name={nombre} checked={marcado} onChange={alCambiar} className="h-4 w-4 accent-marca-600" />
      <span className="flex-1">{texto}</span>
      {cantidad !== undefined && <span className="text-xs text-gray-400">({cantidad})</span>}
    </label>
  );
}

export default function Catalogo({ productos, categorias, marcas, fijo = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [panel, setPanel] = useState(false);
  // Alto del encabezado fijo: la columna de filtros se pega justo debajo al bajar
  const [altoHeader, setAltoHeader] = useState(144);

  useEffect(() => {
    const header = document.querySelector("header.sticky");
    if (!header) return;
    const medir = () => setAltoHeader(header.offsetHeight);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  const q = params.get("q") || "";
  const selMarcas = fijo.marca ? [fijo.marca] : lista(params.get("marca"));
  const selCategorias = fijo.categoria ? [fijo.categoria] : lista(params.get("categoria"));
  const selSubs = lista(params.get("sub"));
  const min = params.get("min") || "";
  const max = params.get("max") || "";
  const soloOferta = params.get("oferta") === "1";
  const soloStock = params.get("stock") === "1";
  const orden = params.get("orden") || "relevancia";
  const pagina = Math.max(1, Number(params.get("pagina")) || 1);

  const [minLocal, setMinLocal] = useState(min);
  const [maxLocal, setMaxLocal] = useState(max);
  useEffect(() => {
    setMinLocal(min);
    setMaxLocal(max);
  }, [min, max]);

  useEffect(() => {
    document.body.style.overflow = panel ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [panel]);

  function actualizar(cambios, mantenerPagina = false) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(cambios)) {
      if (v === "" || v === null || v === undefined || (Array.isArray(v) && !v.length)) p.delete(k);
      else p.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    if (!mantenerPagina) p.delete("pagina");
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: !mantenerPagina ? false : true });
  }

  const alternar = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // Filtrado
  const { resultado, conteoMarcas, conteoCategorias, conteoSubs } = useMemo(() => {
    const palabras = normalizar(q).trim().split(/\s+/).filter(Boolean);
    const nMin = min === "" ? null : Number(min);
    const nMax = max === "" ? null : Number(max);

    const pasa = (p, ignorar) => {
      if (palabras.length) {
        const texto = normalizar(`${p.nombre} ${p.marca} ${p.sku} ${p.modelo} ${p.categoria} ${p.subcategoria} ${p.descripcion}`);
        if (!palabras.every((w) => texto.includes(w))) return false;
      }
      if (ignorar !== "marca" && selMarcas.length && !selMarcas.includes(p.marcaSlug)) return false;
      if (ignorar !== "categoria" && selCategorias.length && !selCategorias.includes(p.categoriaSlug)) return false;
      if (ignorar !== "sub" && selSubs.length && !selSubs.includes(p.subcategoriaSlug)) return false;
      if (nMin !== null && p.precioFinal < nMin) return false;
      if (nMax !== null && p.precioFinal > nMax) return false;
      if (soloOferta && !p.precioOferta) return false;
      if (soloStock && p.stock <= 0) return false;
      return true;
    };

    const contar = (campo, ignorar) => {
      const m = {};
      for (const p of productos) if (pasa(p, ignorar)) m[p[campo]] = (m[p[campo]] || 0) + 1;
      return m;
    };

    let res = productos.filter((p) => pasa(p));
    const ordenar = {
      nuevos: (a, b) => b.orden - a.orden,
      "precio-asc": (a, b) => a.precioFinal - b.precioFinal,
      "precio-desc": (a, b) => b.precioFinal - a.precioFinal,
      descuento: (a, b) => b.descuento - a.descuento,
      relevancia: (a, b) => (b.stock > 0) - (a.stock > 0) || b.destacado - a.destacado || a.orden - b.orden,
    };
    res = [...res].sort(ordenar[orden] || ordenar.relevancia);

    return {
      resultado: res,
      conteoMarcas: contar("marcaSlug", "marca"),
      conteoCategorias: contar("categoriaSlug", "categoria"),
      conteoSubs: contar("subcategoriaSlug", "sub"),
    };
  }, [productos, q, selMarcas.join(), selCategorias.join(), selSubs.join(), min, max, soloOferta, soloStock, orden]);

  const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
  const paginaReal = Math.min(pagina, totalPaginas);
  const visibles = resultado.slice((paginaReal - 1) * POR_PAGINA, paginaReal * POR_PAGINA);

  const subcategorias = categorias
    .filter((c) => !selCategorias.length || selCategorias.includes(c.slug))
    .flatMap((c) => c.subcategorias);

  const chips = [
    q && { texto: `"${q}"`, quitar: () => actualizar({ q: "" }) },
    ...(!fijo.marca ? selMarcas.map((m) => ({ texto: marcas.find((x) => x.slug === m)?.nombre || m, quitar: () => actualizar({ marca: alternar(selMarcas, m) }) })) : []),
    ...(!fijo.categoria
      ? selCategorias.map((c) => ({ texto: categorias.find((x) => x.slug === c)?.nombre || c, quitar: () => actualizar({ categoria: alternar(selCategorias, c) }) }))
      : []),
    ...selSubs.map((s) => ({ texto: subcategorias.find((x) => x.slug === s)?.nombre || s, quitar: () => actualizar({ sub: alternar(selSubs, s) }) })),
    (min || max) && { texto: `S/. ${min || 0} – ${max ? `S/. ${max}` : "más"}`, quitar: () => actualizar({ min: "", max: "" }) },
    soloOferta && { texto: "En oferta", quitar: () => actualizar({ oferta: "" }) },
    soloStock && { texto: "Con stock", quitar: () => actualizar({ stock: "" }) },
  ].filter(Boolean);

  const limpiar = () => router.replace(pathname, { scroll: false });

  const grupos = [
    !fijo.categoria && {
      id: "categoria",
      titulo: "Categoría",
      cuerpo: categorias
        .filter((c) => c.cantidad > 0)
        .map((c) => (
          <Opcion
            key={c.slug}
            texto={c.nombre}
            cantidad={conteoCategorias[c.slug] || 0}
            marcado={selCategorias.includes(c.slug)}
            alCambiar={() => actualizar({ categoria: alternar(selCategorias, c.slug), sub: "" })}
          />
        )),
    },
    subcategorias.length > 0 && {
      id: "sub",
      titulo: "Subcategoría",
      cuerpo: subcategorias.map((s) => (
        <Opcion
          key={s.slug}
          texto={s.nombre}
          cantidad={conteoSubs[s.slug] || 0}
          marcado={selSubs.includes(s.slug)}
          alCambiar={() => actualizar({ sub: alternar(selSubs, s.slug) })}
        />
      )),
    },
    !fijo.marca && {
      id: "marca",
      titulo: "Marca",
      cuerpo: marcas.map((m) => (
        <Opcion
          key={m.slug}
          texto={m.nombre}
          cantidad={conteoMarcas[m.slug] || 0}
          marcado={selMarcas.includes(m.slug)}
          alCambiar={() => actualizar({ marca: alternar(selMarcas, m.slug) })}
        />
      )),
    },
    {
      id: "precio",
      titulo: "Precio",
      cuerpo: (
        <>
        {RANGOS.map((r) => (
          <Opcion
            key={r.texto}
            tipo="radio"
            nombre="rango"
            texto={r.texto}
            marcado={min === r.min && max === r.max}
            alCambiar={() => actualizar({ min: r.min, max: r.max })}
          />
        ))}
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            actualizar({ min: minLocal, max: maxLocal });
          }}
        >
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Mín."
            aria-label="Precio mínimo"
            value={minLocal}
            onChange={(e) => setMinLocal(e.target.value)}
            className="campo !py-1.5 text-sm"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Máx."
            aria-label="Precio máximo"
            value={maxLocal}
            onChange={(e) => setMaxLocal(e.target.value)}
            className="campo !py-1.5 text-sm"
          />
          <button type="submit" aria-label="Aplicar precio" className="rounded-lg bg-marca-700 p-2 text-white hover:bg-marca-800">
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>
        </>
      ),
    },
    {
      id: "disponibilidad",
      titulo: "Disponibilidad",
      cuerpo: (
        <>
          <Opcion texto="Solo ofertas" marcado={soloOferta} alCambiar={() => actualizar({ oferta: soloOferta ? "" : "1" })} />
          <Opcion texto="Solo con stock" marcado={soloStock} alCambiar={() => actualizar({ stock: soloStock ? "" : "1" })} />
        </>
      ),
    },
  ].filter(Boolean);

  const filtros = grupos.map((g) => (
    <Grupo key={g.id} titulo={g.titulo}>
      {g.cuerpo}
    </Grupo>
  ));

  const conteo = (
    <p className="text-sm text-gray-600">
      <strong className="text-gray-900">{resultado.length}</strong> {resultado.length === 1 ? "producto" : "productos"}
    </p>
  );

  const selectorOrden = (
    <label className="flex flex-1 items-center gap-2 lg:flex-none">
      <span className="hidden text-sm text-gray-600 sm:inline">Ordenar por</span>
      <select
        value={orden}
        onChange={(e) => actualizar({ orden: e.target.value === "relevancia" ? "" : e.target.value })}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 lg:w-auto"
        aria-label="Ordenar productos"
      >
        {ORDENES.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  );

  const botonMovil = (
    <button
      onClick={() => setPanel(true)}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-800 lg:hidden"
    >
      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filtrar
      {chips.length > 0 && <span className="rounded-full bg-marca-700 px-1.5 text-xs text-white">{chips.length}</span>}
    </button>
  );

  const etiquetas = chips.length > 0 && (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.texto}
          onClick={c.quitar}
          className="flex items-center gap-1 rounded-full bg-marca-100 px-3 py-1 text-xs font-semibold text-marca-800 hover:bg-marca-200"
        >
          {c.texto} <X className="h-3.5 w-3.5" aria-label="Quitar filtro" />
        </button>
      ))}
      <button onClick={limpiar} className="px-2 text-xs font-semibold text-gray-600 underline">
        Limpiar todo
      </button>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <aside className="hidden lg:block" aria-label="Filtros">
        {/* Se queda fija debajo del encabezado al bajar; si los filtros no caben, se desplazan dentro */}
        <div
          className="sticky overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-4"
          style={{ top: altoHeader + 16, maxHeight: `calc(100vh - ${altoHeader + 32}px)` }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Filtrar por</h2>
            {chips.length > 0 && (
              <button onClick={limpiar} className="text-xs font-semibold text-marca-600 hover:underline">
                Limpiar
              </button>
            )}
          </div>
          {filtros}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-2">
          {botonMovil}
          <span className="hidden lg:block">{conteo}</span>
          <div className="flex flex-1 lg:ml-auto lg:flex-none">{selectorOrden}</div>
        </div>
        <div className="mb-2 lg:hidden">{conteo}</div>
        {etiquetas && <div className="mb-3">{etiquetas}</div>}

        {visibles.length ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
            {visibles.map((p, i) => (
              <li key={p.sku}>
                <TarjetaProducto producto={p} prioridad={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <p className="text-lg font-bold text-gray-900">No encontramos productos con esos filtros</p>
            <p className="mt-1 text-sm text-gray-600">Prueba con otras palabras o quita algunos filtros. También podemos ayudarte a conseguirlo.</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              {chips.length > 0 && (
                <button onClick={limpiar} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold">
                  Ver todos los productos
                </button>
              )}
              <a
                href={linkWhatsApp(`Hola FerreCenter, estoy buscando: ${q || "una herramienta"}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white"
              >
                <IconoWhatsApp className="h-4 w-4" /> Consultar por WhatsApp
              </a>
            </div>
          </div>
        )}

        {totalPaginas > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Paginación">
            <button
              disabled={paginaReal === 1}
              onClick={() => actualizar({ pagina: paginaReal - 1 > 1 ? String(paginaReal - 1) : "" }, true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white disabled:opacity-40"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - paginaReal) <= 1)
              .map((n, i, arr) => (
                <span key={n} className="flex items-center gap-1">
                  {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
                  <button
                    onClick={() => actualizar({ pagina: n > 1 ? String(n) : "" }, true)}
                    aria-current={n === paginaReal ? "page" : undefined}
                    className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold ${
                      n === paginaReal ? "border-marca-700 bg-marca-700 text-white" : "border-gray-300 bg-white text-gray-800"
                    }`}
                  >
                    {n}
                  </button>
                </span>
              ))}
            <button
              disabled={paginaReal === totalPaginas}
              onClick={() => actualizar({ pagina: String(paginaReal + 1) }, true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white disabled:opacity-40"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        )}
      </div>

      {panel && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPanel(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-lg font-bold">Filtrar</h2>
              <button onClick={() => setPanel(false)} aria-label="Cerrar filtros" className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4">{filtros}</div>
            <div className="flex gap-2 border-t border-gray-100 p-4">
              <button onClick={limpiar} className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-semibold">
                Limpiar
              </button>
              <button onClick={() => setPanel(false)} className="flex-[2] rounded-lg bg-marca-700 py-3 text-sm font-bold text-white">
                Ver {resultado.length} {resultado.length === 1 ? "producto" : "productos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
