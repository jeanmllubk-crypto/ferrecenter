"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HandCoins, Landmark, MapPin, Minus, Navigation, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCarrito } from "./CarritoContext";
import { IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp, TIENDA } from "@/lib/config";
import { soles } from "@/lib/formato";
import SelectorUbigeo from "./SelectorUbigeo";

// El mapa (Leaflet) se descarga solo cuando el cliente lo abre
const MapaUbicacion = dynamic(() => import("./MapaUbicacion"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-gray-100" />,
});

const CLAVE_DATOS = "ferrecenter-datos-cliente";

const RECOJO = "Recojo en tienda";
const TACNA = "Ciudad de Tacna";
const PERU = "Otra ciudad del Perú";
const DESTINOS = [RECOJO, TACNA, PERU];
const NOTA_DESTINO = { [RECOJO]: "Gratis", [TACNA]: `Envío ${soles(TIENDA.envioTacna)}`, [PERU]: "Por agencia" };
const esContraEntrega = (f) => f.toLowerCase().includes("contra entrega");
// Ubicación de la tienda: Google Maps abre la ruta desde donde esté el cliente
const COORDS_TIENDA = TIENDA.mapaCoordenadas.replace(/\s+/g, "");
const RUTA_TIENDA = `https://www.google.com/maps/dir/?api=1&destination=${COORDS_TIENDA}`;
const linkMapa = (u) => `https://www.google.com/maps?q=${u.lat},${u.lng}`;
const SIN_UBIGEO = { departamento: "", provincia: "", distrito: "", centro: null };
const UBIGEO_TACNA = { departamento: "Tacna", provincia: "Tacna", distrito: "", centro: COORDS_TIENDA.split(",").map(Number) };
// Yape / Plin → sus datos de config; si no, null
const billetera = (f) => TIENDA.pagos[String(f).toLowerCase()] || null;

// Logo de cada forma de pago: Yape y Plin con su logo oficial; transferencia y contra entrega con ícono
function LogoPago({ forma, apagado }) {
  const logo = billetera(forma)?.logo;
  const caja = `flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl ${apagado ? "opacity-40 grayscale" : ""}`;
  if (logo) {
    return (
      <span className={`${caja} border border-gray-200`}>
        <img src={logo} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  const Icono = /transferencia/i.test(forma) ? Landmark : HandCoins;
  const color = /transferencia/i.test(forma) ? "bg-marca-700" : "bg-acento-500";
  return (
    <span className={`${caja} ${color} text-white`}>
      <Icono className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

function BotonCopiar({ valor }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard?.writeText(String(valor).replace(/[\s-]+/g, "")).then(() => {
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        })
      }
      className="shrink-0 rounded-md border border-marca-200 bg-white px-2.5 py-1 text-xs font-semibold text-marca-700 hover:bg-marca-100"
    >
      {copiado ? "¡Copiado!" : "Copiar"}
    </button>
  );
}

// Instrucciones de pago que ve el cliente al elegir la forma de pago
function InfoPago({ pago, monto, destino }) {
  const [copiado, setCopiado] = useState(false);
  if (!pago) return null;
  const b = billetera(pago);

  if (b) {
    return (
      <div className="mt-2 rounded-lg border border-marca-100 bg-marca-50 p-3 text-sm text-gray-700">
        <p>
          Paga <strong>{monto}</strong> por {pago} al:
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-xl font-extrabold tracking-wide text-marca-900">{b.numero}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(b.numero.replace(/\s+/g, "")).then(() => {
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              });
            }}
            className="rounded-md border border-marca-200 bg-white px-3 py-1 text-xs font-semibold text-marca-700 hover:bg-marca-100"
          >
            {copiado ? "¡Copiado!" : "Copiar número"}
          </button>
        </div>
        {b.titular && <p className="text-xs text-gray-500">A nombre de: {b.titular}</p>}
        {b.qr && (
          <div className="mt-3 flex flex-col items-center gap-1">
            <a href={b.qrCompleto || b.qr} target="_blank" rel="noopener noreferrer" aria-label={`Ver QR de ${pago} en grande`}>
              <img src={b.qr} alt={`Código QR de ${pago}`} className="w-52 rounded-lg border border-gray-200 bg-white p-2" />
            </a>
            <span className="text-center text-xs text-gray-500">O escanea el QR desde tu app (tócalo para verlo en grande)</span>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">Luego envía tu pedido y adjunta la captura del pago en WhatsApp.</p>
      </div>
    );
  }

  if (pago.toLowerCase().includes("transferencia")) {
    return (
      <div className="mt-2 rounded-lg border border-marca-100 bg-marca-50 p-3 text-sm text-gray-700">
        {TIENDA.pagos.cuentas.length ? (
          <>
            <p>
              Transfiere <strong>{monto}</strong> a {TIENDA.pagos.cuentas.length > 1 ? "cualquiera de estas cuentas" : "esta cuenta"}:
            </p>
            {TIENDA.pagos.cuentas.map((c) => (
              <div key={c.numero} className="mt-2 rounded-md border border-marca-100 bg-white p-2.5">
                <p className="font-bold text-marca-900">
                  {c.banco}
                  {c.moneda && <span className="font-normal text-gray-500"> · {c.moneda}</span>}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs">
                    Cuenta: <strong className="text-sm">{c.numero}</strong>
                  </span>
                  <BotonCopiar valor={c.numero} />
                </div>
                {c.cci && (
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xs">
                      CCI: <strong className="text-sm">{c.cci}</strong>
                    </span>
                    <BotonCopiar valor={c.cci} />
                  </div>
                )}
                {c.titular && <p className="mt-1 text-xs text-gray-500">Titular: {c.titular}</p>}
              </div>
            ))}
            <p className="mt-2 text-xs text-gray-500">Luego envía tu pedido y adjunta la constancia de la transferencia en WhatsApp.</p>
          </>
        ) : (
          <p>Te enviaremos los datos de la cuenta bancaria por WhatsApp para que transfieras {monto}.</p>
        )}
      </div>
    );
  }

  return (
    <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
      {destino === RECOJO ? `Pagas ${monto} al recoger tu pedido en la tienda` : `Pagas ${monto} al recibir tu pedido`}
      {destino ? "" : " (ciudad de Tacna o recojo en tienda)"}: en efectivo, Yape o Plin.
    </p>
  );
}

function armarMensaje(items, subtotal, envio, datos) {
  const lineas = [
    "*Nuevo pedido – FerreCenter*",
    "",
    ...items.map(
      (i, n) => `${n + 1}. ${i.nombre} (${i.marca})\n   Cód.: ${i.sku}\n   ${i.cantidad} x ${soles(i.precio)} = *${soles(i.cantidad * i.precio)}*`
    ),
    "",
    `Subtotal: ${soles(subtotal)}`,
    datos.destino === TACNA
      ? `Envío (Tacna): ${soles(envio)}`
      : datos.destino === RECOJO
        ? "Envío: gratis (recojo en tienda)"
        : "Envío: por agencia, según tarifa (se coordina)",
    `*TOTAL: ${soles(subtotal + envio)}*`,
    "",
    `*Nombre:* ${datos.nombre}`,
    `*Entrega:* ${datos.destino}`,
    ...(datos.destino === RECOJO
      ? [`*Tienda:* ${TIENDA.direccion}`]
      : [
          `*Departamento / Provincia / Distrito:* ${datos.ubigeo.departamento} / ${datos.ubigeo.provincia} / ${datos.ubigeo.distrito}`,
          `*Dirección:* ${datos.direccion.trim()}`,
          ...(datos.referencia.trim() ? [`*Referencia:* ${datos.referencia.trim()}`] : []),
          ...(datos.ubicacion ? [`*Ubicación en el mapa:* ${linkMapa(datos.ubicacion)}`] : []),
        ]),
    `*Forma de pago:* ${datos.pago}${
      billetera(datos.pago)
        ? ` (al ${billetera(datos.pago).numero}) – envío la captura del pago`
        : /transferencia/i.test(datos.pago) && TIENDA.pagos.cuentas.length
          ? " – envío la constancia de la transferencia"
          : ""
    }`,
  ];
  if (datos.notas.trim()) lineas.push(`*Comentarios:* ${datos.notas.trim()}`);
  return lineas.join("\n");
}

export default function VistaCarrito({ actuales }) {
  const { items, cargado, total, totalUnidades, cambiarCantidad, quitar, vaciar, sincronizar } = useCarrito();
  const [datos, setDatos] = useState({
    nombre: "",
    destino: "",
    ubigeo: SIN_UBIGEO,
    direccion: "",
    referencia: "",
    ubicacion: null,
    pago: "",
    notas: "",
  });
  const [errores, setErrores] = useState({});
  const [verMapa, setVerMapa] = useState(false);
  const envio = datos.destino === TACNA ? TIENDA.envioTacna : 0;
  const conEnvio = datos.destino === TACNA || datos.destino === PERU;

  // Contra entrega solo en la ciudad de Tacna o al recoger en tienda
  useEffect(() => {
    if (datos.destino === PERU && esContraEntrega(datos.pago)) setDatos((d) => ({ ...d, pago: "" }));
  }, [datos.destino, datos.pago]);

  useEffect(() => {
    if (cargado) sincronizar(actuales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargado]);

  // Recordar nombre y datos de entrega para la próxima compra
  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE_DATOS) || "{}");
      setDatos((d) => ({
        ...d,
        nombre: g.nombre || "",
        destino: DESTINOS.includes(g.destino) ? g.destino : "",
        ubigeo: g.ubigeo?.departamento ? g.ubigeo : g.destino === TACNA ? UBIGEO_TACNA : SIN_UBIGEO,
        direccion: g.direccion || "",
        referencia: g.referencia || "",
        ubicacion: g.ubicacion || null,
        pago: g.pago || "",
      }));
    } catch {}
  }, []);

  const set = (campo) => (e) => {
    setDatos((d) => ({ ...d, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  // Al elegir la ciudad de Tacna, departamento y provincia quedan fijos en Tacna
  function elegirDestino(e) {
    const destino = e.target.value;
    setDatos((d) => {
      if (destino === TACNA && (d.ubigeo.departamento !== "Tacna" || d.ubigeo.provincia !== "Tacna")) {
        return { ...d, destino, ubigeo: UBIGEO_TACNA, ubicacion: null };
      }
      return { ...d, destino };
    });
    setErrores((er) => ({ ...er, destino: undefined }));
  }

  // Si cambia de distrito, el pin marcado antes ya no sirve
  const cambiarUbigeo = (ubigeo) => {
    setDatos((d) => ({ ...d, ubigeo, ubicacion: ubigeo.distrito === d.ubigeo.distrito ? d.ubicacion : null }));
    setErrores((er) => ({ ...er, ubigeo: undefined }));
  };
  const cambiarUbicacion = (ubicacion) => setDatos((d) => ({ ...d, ubicacion }));

  function enviar(e) {
    e.preventDefault();
    const er = {};
    if (datos.nombre.trim().length < 2) er.nombre = "Escribe tu nombre";
    if (!datos.destino) er.destino = "Elige dónde recibes tu pedido";
    if (conEnvio && !datos.ubigeo.distrito) er.ubigeo = "Elige departamento, provincia y distrito";
    if (conEnvio && datos.direccion.trim().length < 5) er.direccion = "Escribe la dirección exacta de entrega";
    if (!datos.pago) er.pago = "Elige una forma de pago";
    setErrores(er);
    if (Object.keys(er).length) return;
    try {
      const { nombre, destino, ubigeo, direccion, referencia, ubicacion, pago } = datos;
      localStorage.setItem(CLAVE_DATOS, JSON.stringify({ nombre, destino, ubigeo, direccion, referencia, ubicacion, pago }));
    } catch {}
    window.open(linkWhatsApp(armarMensaje(items, total, envio, datos)), "_blank", "noopener");
  }

  if (!cargado) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl bg-white px-6 py-14 text-center">
        <ShoppingCart className="mx-auto h-14 w-14 text-gray-300" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
        <p className="mt-1 text-gray-600">Agrega productos y envíanos tu pedido por WhatsApp.</p>
        <Link href="/catalogo" className="mt-5 inline-block rounded-xl bg-marca-700 px-6 py-3 font-bold text-white hover:bg-marca-800">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_24rem] lg:items-start">
      <section className="rounded-2xl bg-white p-4 sm:p-6" aria-label="Productos en el carrito">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            {totalUnidades} {totalUnidades === 1 ? "producto" : "productos"}
          </h2>
          <button onClick={vaciar} className="text-sm font-semibold text-gray-500 hover:text-oferta">
            Vaciar carrito
          </button>
        </div>
        <ul className="divide-y divide-gray-100">
          {items.map((i) => (
            <li key={i.sku} className="flex gap-3 py-4">
              <Link href={`/producto/${i.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white sm:h-24 sm:w-24">
                <Image src={i.imagen || "/img/sin-foto.svg"} alt={i.nombre} fill sizes="96px" className="object-contain p-1" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs font-bold uppercase text-marca-600">{i.marca}</span>
                <Link href={`/producto/${i.slug}`} className="line-clamp-2 text-sm text-gray-800 hover:underline">
                  {i.nombre}
                </Link>
                <span className="text-xs text-gray-500">{soles(i.precio)} c/u</span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      onClick={() => cambiarCantidad(i.sku, i.cantidad - 1)}
                      disabled={i.cantidad <= 1}
                      aria-label={`Quitar una unidad de ${i.nombre}`}
                      className="flex h-8 w-8 items-center justify-center disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={i.cantidad}
                      onChange={(e) => cambiarCantidad(i.sku, Number(e.target.value) || 1)}
                      aria-label={`Cantidad de ${i.nombre}`}
                      className="h-8 w-10 border-x border-gray-300 text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => cambiarCantidad(i.sku, i.cantidad + 1)}
                      disabled={i.stock > 0 && i.cantidad >= i.stock}
                      aria-label={`Agregar una unidad de ${i.nombre}`}
                      className="flex h-8 w-8 items-center justify-center disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="whitespace-nowrap font-extrabold text-marca-600">{soles(i.precio * i.cantidad)}</span>
                </div>
              </div>
              <button onClick={() => quitar(i.sku)} aria-label={`Eliminar ${i.nombre}`} className="self-start p-1 text-gray-400 hover:text-oferta">
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={enviar} noValidate className="rounded-2xl bg-white p-4 sm:p-6" aria-label="Datos del pedido">
        <h2 className="mb-3 text-lg font-extrabold text-marca-900">Resumen del pedido</h2>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Subtotal ({totalUnidades} u.)</dt>
            <dd className="font-semibold">{soles(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Envío</dt>
            <dd className={datos.destino && datos.destino !== PERU ? "font-semibold" : "text-right text-gray-600"}>
              {datos.destino === TACNA
                ? soles(envio)
                : datos.destino === RECOJO
                  ? "Gratis"
                  : datos.destino
                    ? "Según agencia"
                    : `Tacna ${soles(TIENDA.envioTacna)}`}
            </dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-lg">
            <dt className="font-bold">Total</dt>
            <dd className="font-extrabold text-marca-700">{soles(total + envio)}</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-sm font-semibold text-gray-700">
              Nombre y apellido
            </label>
            <input id="nombre" className="campo" value={datos.nombre} onChange={set("nombre")} autoComplete="name" aria-invalid={!!errores.nombre} />
            {errores.nombre && <p className="mt-1 text-xs text-oferta">{errores.nombre}</p>}
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-gray-700">¿Dónde recibes tu pedido?</legend>
            <div className="grid grid-cols-3 gap-2">
              {DESTINOS.map((d) => (
                <label
                  key={d}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border px-1.5 py-2 text-center text-sm transition ${
                    datos.destino === d ? "border-marca-600 bg-marca-50 text-marca-800" : "border-gray-300 text-gray-700"
                  }`}
                >
                  <input type="radio" name="destino" value={d} checked={datos.destino === d} onChange={elegirDestino} className="sr-only" />
                  <span className="block text-[13px] font-semibold leading-tight">{d}</span>
                  <span className="mt-0.5 text-xs text-gray-500">{NOTA_DESTINO[d]}</span>
                </label>
              ))}
            </div>
            {errores.destino && <p className="mt-1 text-xs text-oferta">{errores.destino}</p>}
          </fieldset>

          {datos.destino === RECOJO && (
            // Datos de la tienda y botón para abrir la ruta en Google Maps
            <div className="rounded-lg border border-marca-100 bg-marca-50 p-3 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-oferta" aria-hidden="true" />
                <span>
                  <strong className="block text-marca-900">Recoge en nuestra tienda</strong>
                  {TIENDA.direccion}
                  <span className="mt-0.5 block text-xs text-gray-500">{TIENDA.horario}</span>
                </span>
              </p>
              <a
                href={RUTA_TIENDA}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-marca-700 px-3 py-2.5 font-semibold text-white hover:bg-marca-800"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" /> Cómo llegar con Google Maps
              </a>
              <p className="mt-2 text-xs text-gray-500">Te avisaremos por WhatsApp cuando tu pedido esté listo para recoger.</p>
            </div>
          )}

          {conEnvio && (
            <>
              <div>
                <p className="mb-1 text-sm font-semibold text-gray-700">Lugar de entrega</p>
                <SelectorUbigeo valor={datos.ubigeo} onCambio={cambiarUbigeo} fijo={datos.destino === TACNA} error={errores.ubigeo} />
              </div>
              <div>
                <label htmlFor="direccion" className="mb-1 block text-sm font-semibold text-gray-700">
                  Dirección exacta
                </label>
                <input
                  id="direccion"
                  className="campo"
                  value={datos.direccion}
                  onChange={set("direccion")}
                  placeholder="Av./Calle, número, Mz. y Lt., urbanización"
                  autoComplete="street-address"
                  aria-invalid={!!errores.direccion}
                />
                {errores.direccion && <p className="mt-1 text-xs text-oferta">{errores.direccion}</p>}
              </div>
              <div>
                <label htmlFor="referencia" className="mb-1 block text-sm font-semibold text-gray-700">
                  Referencia <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  id="referencia"
                  className="campo"
                  value={datos.referencia}
                  onChange={set("referencia")}
                  placeholder="Ej.: frente al parque, portón negro"
                />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-gray-700">
                  Ubicación en el mapa <span className="font-normal text-gray-400">(opcional, para llegar más rápido)</span>
                </p>
                {verMapa ? (
                  <MapaUbicacion valor={datos.ubicacion} centro={datos.ubigeo.centro} onCambio={cambiarUbicacion} />
                ) : (
                  <button
                    type="button"
                    onClick={() => setVerMapa(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-marca-300 px-3 py-2.5 text-sm font-semibold text-marca-700 hover:bg-marca-50"
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {datos.ubicacion ? "Ubicación marcada · cambiarla en el mapa" : "Marcar mi ubicación en el mapa"}
                  </button>
                )}
                {datos.ubicacion && (
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                    <a href={linkMapa(datos.ubicacion)} target="_blank" rel="noopener noreferrer" className="font-semibold text-marca-700 hover:underline">
                      Ver en Google Maps
                    </a>
                    <button type="button" onClick={() => cambiarUbicacion(null)} className="text-gray-500 hover:text-oferta">
                      Quitar ubicación
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-gray-700">Forma de pago</legend>
            <div className="grid grid-cols-2 gap-2">
              {TIENDA.formasPago.map((f) => {
                const bloqueado = esContraEntrega(f) && datos.destino === PERU;
                return (
                  <label
                    key={f}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-sm font-semibold transition ${
                      bloqueado
                        ? "cursor-not-allowed border-gray-200 text-gray-400"
                        : datos.pago === f
                          ? "cursor-pointer border-marca-600 bg-marca-50 text-marca-800"
                          : "cursor-pointer border-gray-300 text-gray-700"
                    }`}
                  >
                    <input type="radio" name="pago" value={f} checked={datos.pago === f} onChange={set("pago")} disabled={bloqueado} className="sr-only" />
                    <LogoPago forma={f} apagado={bloqueado} />
                    <span className="min-w-0 leading-tight">
                      {f}
                      {esContraEntrega(f) && <span className="block text-[11px] font-normal text-gray-500">Tacna o recojo en tienda</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            {errores.pago && <p className="mt-1 text-xs text-oferta">{errores.pago}</p>}
            <InfoPago pago={datos.pago} monto={soles(total + envio)} destino={datos.destino} />
          </fieldset>
          <div>
            <label htmlFor="notas" className="mb-1 block text-sm font-semibold text-gray-700">
              Comentarios <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea id="notas" rows={2} className="campo" value={datos.notas} onChange={set("notas")} placeholder="Horario de entrega, factura con RUC…" />
          </div>
        </div>

        <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp py-3.5 font-bold text-white transition hover:bg-whatsapp-oscuro">
          <IconoWhatsApp className="h-5 w-5" /> Enviar pedido por WhatsApp
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">Te confirmaremos stock y datos de pago por WhatsApp.</p>
      </form>

      {/* Total fijo en celular */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,.08)] lg:hidden">
        <span>
          <span className="block text-xs text-gray-500">Total</span>
          <span className="text-lg font-extrabold">{soles(total + envio)}</span>
        </span>
        <a href="#nombre" className="rounded-xl bg-whatsapp px-5 py-3 text-sm font-bold text-white">
          Completar pedido
        </a>
      </div>
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  );
}
