"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Mail, Printer, Send } from "lucide-react";
import { IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp, TIENDA } from "@/lib/config";

const VACIO = {
  nombre: "",
  tipoDoc: "DNI",
  documento: "",
  domicilio: "",
  telefono: "",
  correo: "",
  menor: false,
  apoderado: "",
  bien: "Producto",
  monto: "",
  descripcionBien: "",
  pedidoRef: "",
  tipo: "Reclamo",
  detalle: "",
  pedido: "",
  acepto: false,
};

function Campo({ id, etiqueta, error, opcional, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-700">
        {etiqueta} {opcional && <span className="font-normal text-gray-400">(opcional)</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-oferta">{error}</p>}
    </div>
  );
}

export default function FormularioReclamo() {
  const [d, setD] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(null);
  const [estado, setEstado] = useState("listo"); // listo | enviando | error

  // La fecha se toma en el navegador (la página es estática y se generó en otro momento)
  const [fecha, setFecha] = useState(null);
  useEffect(() => setFecha(new Date()), []);
  const fechaTexto = fecha ? fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setD((x) => ({ ...x, [k]: v }));
    setErrores((x) => ({ ...x, [k]: undefined }));
  };

  function validar() {
    const er = {};
    if (d.nombre.trim().length < 3) er.nombre = "Escribe tu nombre completo";
    if (d.documento.trim().length < 8) er.documento = "Escribe un número de documento válido";
    if (d.domicilio.trim().length < 5) er.domicilio = "Escribe tu domicilio";
    if (d.telefono.trim().length < 6) er.telefono = "Escribe un teléfono de contacto";
    if (!/^\S+@\S+\.\S+$/.test(d.correo)) er.correo = "Escribe un correo válido";
    if (d.menor && d.apoderado.trim().length < 3) er.apoderado = "Escribe el nombre del padre, madre o apoderado";
    if (d.descripcionBien.trim().length < 3) er.descripcionBien = "Indica el producto o servicio";
    if (d.detalle.trim().length < 10) er.detalle = "Describe lo ocurrido";
    if (d.pedido.trim().length < 3) er.pedido = "Indica qué solicitas";
    if (!d.acepto) er.acepto = "Debes aceptar para continuar";
    setErrores(er);
    if (Object.keys(er).length) {
      document.getElementById(`r-${Object.keys(er)[0]}`)?.focus();
      return false;
    }
    return true;
  }

  function codigo() {
    const f = (fecha || new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const n = Math.floor(1000 + Math.random() * 9000);
    return `LR-${f}-${n}`;
  }

  function texto(cod) {
    return [
      `*LIBRO DE RECLAMACIONES – ${TIENDA.razonSocial}*`,
      `Hoja N.°: ${cod}`,
      `Fecha: ${fechaTexto}`,
      `Proveedor: ${TIENDA.razonSocial} – ${TIENDA.ruc}`,
      "",
      "*1. Datos del consumidor*",
      `Nombre: ${d.nombre}`,
      `${d.tipoDoc}: ${d.documento}`,
      `Domicilio: ${d.domicilio}`,
      `Teléfono: ${d.telefono}`,
      `Correo: ${d.correo}`,
      d.menor ? `Menor de edad – Padre/madre/apoderado: ${d.apoderado}` : null,
      "",
      "*2. Bien contratado*",
      `Tipo: ${d.bien}`,
      `Descripción: ${d.descripcionBien}`,
      d.pedidoRef ? `N.° de pedido / comprobante: ${d.pedidoRef}` : null,
      d.monto ? `Monto reclamado: S/. ${d.monto}` : null,
      "",
      `*3. Detalle (${d.tipo.toUpperCase()})*`,
      d.detalle,
      "",
      "*Pedido del consumidor:*",
      d.pedido,
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  async function enviarAutomatico(e) {
    e?.preventDefault();
    if (!validar() || estado === "enviando") return;
    setEstado("enviando");
    try {
      const r = await fetch("/api/reclamo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      const res = await r.json().catch(() => ({}));
      if (!r.ok || !res.codigo) throw new Error(res.error || "Error");
      setEnviado({ codigo: res.codigo, cuerpo: texto(res.codigo), automatico: true });
      setEstado("listo");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setEstado("error");
    }
  }

  function enviar(medio) {
    if (!validar()) return;
    const cod = enviado?.codigo || codigo();
    const cuerpo = texto(cod);
    if (medio === "whatsapp") {
      window.open(linkWhatsApp(cuerpo), "_blank", "noopener");
    } else {
      const asunto = `Libro de Reclamaciones – ${d.tipo} ${cod}`;
      window.location.href = `mailto:${TIENDA.correoDestino}?cc=${encodeURIComponent(d.correo)}&subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
        cuerpo.replace(/\*/g, "")
      )}`;
    }
    setEnviado({ codigo: cod, cuerpo });
  }

  if (enviado) {
    return (
      <div className="text-center">
        <CircleCheck className="mx-auto h-14 w-14 text-green-600" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold text-gray-900">Hoja de reclamación {enviado.codigo}</h2>
        {enviado.automatico ? (
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
            Recibimos tu {d.tipo.toLowerCase()} y te enviamos una copia a <strong>{d.correo}</strong> (revisa también la carpeta de spam). Te responderemos en
            un plazo no mayor a <strong>15 días hábiles</strong>.
          </p>
        ) : (
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
            Si no se abrió WhatsApp o tu correo, usa los botones de abajo. Guarda o imprime esta copia: te responderemos en un plazo no mayor a{" "}
            <strong>15 días hábiles</strong> al correo {d.correo}.
          </p>
        )}
        <pre className="mx-auto mt-5 max-w-lg whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-left text-xs text-gray-700">{enviado.cuerpo.replace(/\*/g, "")}</pre>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row print:hidden">
          {!enviado.automatico && (
            <>
          <button onClick={() => enviar("whatsapp")} className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-3 font-bold text-white">
            <IconoWhatsApp className="h-5 w-5" /> Reenviar por WhatsApp
          </button>
          <button onClick={() => enviar("correo")} className="flex items-center justify-center gap-2 rounded-xl border-2 border-marca-700 px-5 py-3 font-bold text-marca-700">
            <Mail className="h-5 w-5" aria-hidden="true" /> Enviar por correo
          </button>
            </>
          )}
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-bold text-gray-700">
            <Printer className="h-5 w-5" aria-hidden="true" /> Imprimir copia
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviarAutomatico} noValidate className="space-y-6">
      <div className="grid gap-2 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
        <p>
          <span className="text-gray-500">Fecha:</span> <strong>{fechaTexto}</strong>
        </p>
        <p>
          <span className="text-gray-500">Proveedor:</span> <strong>{TIENDA.razonSocial}</strong> – {TIENDA.ruc}
        </p>
        <p className="sm:col-span-2">
          <span className="text-gray-500">Domicilio:</span> {TIENDA.direccion}
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-base font-bold text-marca-900">1. Identificación del consumidor reclamante</legend>
        <Campo id="r-nombre" etiqueta="Nombres y apellidos" error={errores.nombre}>
          <input id="r-nombre" className="campo" value={d.nombre} onChange={set("nombre")} autoComplete="name" />
        </Campo>
        <div className="grid grid-cols-[7rem_1fr] gap-2">
          <Campo id="r-tipoDoc" etiqueta="Documento">
            <select id="r-tipoDoc" className="campo" value={d.tipoDoc} onChange={set("tipoDoc")}>
              <option>DNI</option>
              <option>CE</option>
              <option>Pasaporte</option>
              <option>RUC</option>
            </select>
          </Campo>
          <Campo id="r-documento" etiqueta="Número" error={errores.documento}>
            <input id="r-documento" inputMode="numeric" className="campo" value={d.documento} onChange={set("documento")} />
          </Campo>
        </div>
        <Campo id="r-domicilio" etiqueta="Domicilio" error={errores.domicilio}>
          <input id="r-domicilio" className="campo" value={d.domicilio} onChange={set("domicilio")} autoComplete="street-address" />
        </Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo id="r-telefono" etiqueta="Teléfono" error={errores.telefono}>
            <input id="r-telefono" type="tel" className="campo" value={d.telefono} onChange={set("telefono")} autoComplete="tel" />
          </Campo>
          <Campo id="r-correo" etiqueta="Correo electrónico" error={errores.correo}>
            <input id="r-correo" type="email" className="campo" value={d.correo} onChange={set("correo")} autoComplete="email" />
          </Campo>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={d.menor} onChange={set("menor")} className="h-4 w-4 accent-marca-600" />
          Soy menor de edad
        </label>
        {d.menor && (
          <Campo id="r-apoderado" etiqueta="Nombre del padre, madre o apoderado" error={errores.apoderado}>
            <input id="r-apoderado" className="campo" value={d.apoderado} onChange={set("apoderado")} />
          </Campo>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-base font-bold text-marca-900">2. Identificación del bien contratado</legend>
        <div className="flex gap-4 text-sm">
          {["Producto", "Servicio"].map((b) => (
            <label key={b} className="flex items-center gap-2">
              <input type="radio" name="bien" value={b} checked={d.bien === b} onChange={set("bien")} className="h-4 w-4 accent-marca-600" />
              {b}
            </label>
          ))}
        </div>
        <Campo id="r-descripcionBien" etiqueta="Descripción del producto o servicio" error={errores.descripcionBien}>
          <input id="r-descripcionBien" className="campo" value={d.descripcionBien} onChange={set("descripcionBien")} />
        </Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo id="r-pedidoRef" etiqueta="N.° de pedido o comprobante" opcional>
            <input id="r-pedidoRef" className="campo" value={d.pedidoRef} onChange={set("pedidoRef")} />
          </Campo>
          <Campo id="r-monto" etiqueta="Monto reclamado (S/.)" opcional>
            <input id="r-monto" type="number" min="0" step="0.01" inputMode="decimal" className="campo" value={d.monto} onChange={set("monto")} />
          </Campo>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-base font-bold text-marca-900">3. Detalle de la reclamación y pedido del consumidor</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { v: "Reclamo", t: "Disconformidad relacionada a los productos o servicios." },
            { v: "Queja", t: "Disconformidad no relacionada a los productos o servicios, o malestar respecto a la atención al público." },
          ].map((o) => (
            <label
              key={o.v}
              className={`cursor-pointer rounded-xl border p-3 text-sm ${d.tipo === o.v ? "border-marca-600 bg-marca-50" : "border-gray-300"}`}
            >
              <span className="flex items-center gap-2 font-bold text-gray-900">
                <input type="radio" name="tipo" value={o.v} checked={d.tipo === o.v} onChange={set("tipo")} className="h-4 w-4 accent-marca-600" />
                {o.v}
              </span>
              <span className="mt-1 block text-xs text-gray-600">{o.t}</span>
            </label>
          ))}
        </div>
        <Campo id="r-detalle" etiqueta="Detalle" error={errores.detalle}>
          <textarea id="r-detalle" rows={4} className="campo" value={d.detalle} onChange={set("detalle")} placeholder="Cuéntanos qué ocurrió" />
        </Campo>
        <Campo id="r-pedido" etiqueta="Pedido" error={errores.pedido}>
          <textarea id="r-pedido" rows={2} className="campo" value={d.pedido} onChange={set("pedido")} placeholder="¿Qué solución solicitas?" />
        </Campo>
      </fieldset>

      <div>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input id="r-acepto" type="checkbox" checked={d.acepto} onChange={set("acepto")} className="mt-0.5 h-4 w-4 shrink-0 accent-marca-600" />
          Declaro que los datos consignados son verdaderos y autorizo su uso para la atención de esta reclamación.
        </label>
        {errores.acepto && <p className="mt-1 text-xs text-oferta">{errores.acepto}</p>}
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-marca-700 py-3.5 font-bold text-white hover:bg-marca-800 disabled:opacity-60"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          {estado === "enviando" ? "Enviando…" : `Enviar ${d.tipo.toLowerCase()}`}
        </button>
        {estado === "error" && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-oferta">
            No pudimos enviarlo automáticamente. Por favor, envíalo por WhatsApp o por correo con los botones de abajo.
          </p>
        )}
        <p className="text-center text-xs text-gray-500">Al enviarlo recibirás una copia en tu correo. También puedes enviarlo por:</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => enviar("whatsapp")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-whatsapp py-2.5 text-sm font-bold text-whatsapp-oscuro hover:bg-whatsapp/5"
          >
            <IconoWhatsApp className="h-4 w-4" /> WhatsApp
          </button>
          <button
            type="button"
            onClick={() => enviar("correo")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-300 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            <Mail className="h-4 w-4" aria-hidden="true" /> Mi programa de correo
          </button>
        </div>
      </div>

      <div className="space-y-1 rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
        <p>
          * La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una
          denuncia ante el INDECOPI.
        </p>
        <p>* El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles.</p>
      </div>
    </form>
  );
}
