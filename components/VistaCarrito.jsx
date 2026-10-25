"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCarrito } from "./CarritoContext";
import { IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp, TIENDA } from "@/lib/config";
import { soles } from "@/lib/formato";

const CLAVE_DATOS = "ferrecenter-datos-cliente";

const DESTINOS = ["Ciudad de Tacna", "Otra ciudad del Perú"];
const esContraEntrega = (f) => f.toLowerCase().includes("contra entrega");
// Yape / Plin → sus datos de config; si no, null
const billetera = (f) => TIENDA.pagos[String(f).toLowerCase()] || null;

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
      Pagas {monto} al recibir tu pedido{destino ? "" : " (solo ciudad de Tacna)"}: en efectivo, Yape o Plin.
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
    datos.destino === DESTINOS[0] ? `Envío (Tacna): ${soles(envio)}` : "Envío: por agencia, según tarifa (se coordina)",
    `*TOTAL: ${soles(subtotal + envio)}*`,
    "",
    `*Nombre:* ${datos.nombre}`,
    `*Entrega:* ${datos.destino}`,
    `*Distrito:* ${datos.distrito}`,
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
  const [datos, setDatos] = useState({ nombre: "", destino: "", distrito: "", pago: "", notas: "" });
  const [errores, setErrores] = useState({});
  const envio = datos.destino === DESTINOS[0] ? TIENDA.envioTacna : 0;

  // Contra entrega solo existe en la ciudad de Tacna
  useEffect(() => {
    if (datos.destino === DESTINOS[1] && esContraEntrega(datos.pago)) setDatos((d) => ({ ...d, pago: "" }));
  }, [datos.destino, datos.pago]);

  useEffect(() => {
    if (cargado) sincronizar(actuales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargado]);

  // Recordar nombre y distrito para la próxima compra
  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE_DATOS) || "{}");
      setDatos((d) => ({ ...d, nombre: g.nombre || "", destino: g.destino || "", distrito: g.distrito || "", pago: g.pago || "" }));
    } catch {}
  }, []);

  const set = (campo) => (e) => {
    setDatos((d) => ({ ...d, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  function enviar(e) {
    e.preventDefault();
    const er = {};
    if (datos.nombre.trim().length < 2) er.nombre = "Escribe tu nombre";
    if (!datos.destino) er.destino = "Elige dónde recibes tu pedido";
    if (datos.distrito.trim().length < 2) er.distrito = "Escribe tu distrito";
    if (!datos.pago) er.pago = "Elige una forma de pago";
    setErrores(er);
    if (Object.keys(er).length) return;
    try {
      localStorage.setItem(CLAVE_DATOS, JSON.stringify({ nombre: datos.nombre, destino: datos.destino, distrito: datos.distrito, pago: datos.pago }));
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

      <form onSubmit={enviar} noValidate className="rounded-2xl bg-white p-4 sm:p-6 lg:sticky lg:top-36" aria-label="Datos del pedido">
        <h2 className="mb-3 text-lg font-extrabold text-marca-900">Resumen del pedido</h2>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Subtotal ({totalUnidades} u.)</dt>
            <dd className="font-semibold">{soles(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Envío</dt>
            <dd className={datos.destino === DESTINOS[0] ? "font-semibold" : "text-right text-gray-600"}>
              {datos.destino === DESTINOS[0]
                ? soles(envio)
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
            <div className="grid grid-cols-2 gap-2">
              {DESTINOS.map((d, n) => (
                <label
                  key={d}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition ${
                    datos.destino === d ? "border-marca-600 bg-marca-50 text-marca-800" : "border-gray-300 text-gray-700"
                  }`}
                >
                  <input type="radio" name="destino" value={d} checked={datos.destino === d} onChange={set("destino")} className="sr-only" />
                  <span className="block font-semibold">{d}</span>
                  <span className="text-xs text-gray-500">{n === 0 ? `Envío ${soles(TIENDA.envioTacna)}` : "Por agencia"}</span>
                </label>
              ))}
            </div>
            {errores.destino && <p className="mt-1 text-xs text-oferta">{errores.destino}</p>}
          </fieldset>
          <div>
            <label htmlFor="distrito" className="mb-1 block text-sm font-semibold text-gray-700">
              Distrito y ciudad
            </label>
            <input
              id="distrito"
              className="campo"
              value={datos.distrito}
              onChange={set("distrito")}
              placeholder="Ej.: Gregorio Albarracín, Tacna"
              autoComplete="address-level2"
              aria-invalid={!!errores.distrito}
            />
            {errores.distrito && <p className="mt-1 text-xs text-oferta">{errores.distrito}</p>}
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-gray-700">Forma de pago</legend>
            <div className="grid grid-cols-2 gap-2">
              {TIENDA.formasPago.map((f) => {
                const bloqueado = esContraEntrega(f) && datos.destino === DESTINOS[1];
                return (
                  <label
                    key={f}
                    className={`rounded-lg border px-3 py-2.5 text-center text-sm font-semibold transition ${
                      bloqueado
                        ? "cursor-not-allowed border-gray-200 text-gray-400"
                        : datos.pago === f
                          ? "cursor-pointer border-marca-600 bg-marca-50 text-marca-800"
                          : "cursor-pointer border-gray-300 text-gray-700"
                    }`}
                  >
                    <input type="radio" name="pago" value={f} checked={datos.pago === f} onChange={set("pago")} disabled={bloqueado} className="sr-only" />
                    {f}
                    {esContraEntrega(f) && <span className="block text-[11px] font-normal text-gray-500">Solo ciudad de Tacna</span>}
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
            <textarea id="notas" rows={2} className="campo" value={datos.notas} onChange={set("notas")} placeholder="Referencia, horario de entrega, factura…" />
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
