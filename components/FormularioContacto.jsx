"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp, TIENDA } from "@/lib/config";

export default function FormularioContacto() {
  const [d, setD] = useState({ nombre: "", telefono: "", mensaje: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });

  const texto = () => `Hola FerreCenter, soy ${d.nombre}${d.telefono ? ` (tel. ${d.telefono})` : ""}.\n\n${d.mensaje}`;

  function validar() {
    if (!d.nombre.trim() || !d.mensaje.trim()) {
      setError("Completa tu nombre y tu mensaje.");
      return false;
    }
    setError("");
    return true;
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
      <div>
        <label htmlFor="c-nombre" className="mb-1 block text-sm font-semibold text-gray-700">
          Nombre
        </label>
        <input id="c-nombre" className="campo" value={d.nombre} onChange={set("nombre")} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="c-tel" className="mb-1 block text-sm font-semibold text-gray-700">
          Teléfono <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <input id="c-tel" type="tel" className="campo" value={d.telefono} onChange={set("telefono")} autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="c-msj" className="mb-1 block text-sm font-semibold text-gray-700">
          Mensaje
        </label>
        <textarea id="c-msj" rows={4} className="campo" value={d.mensaje} onChange={set("mensaje")} placeholder="¿En qué te podemos ayudar?" />
      </div>
      {error && <p className="text-sm text-oferta">{error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => validar() && window.open(linkWhatsApp(texto()), "_blank", "noopener")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-whatsapp py-3 font-bold text-white hover:bg-whatsapp-oscuro"
        >
          <IconoWhatsApp className="h-5 w-5" /> Enviar por WhatsApp
        </button>
        <button
          type="button"
          onClick={() =>
            validar() &&
            (window.location.href = `mailto:${TIENDA.correoDestino}?subject=${encodeURIComponent("Consulta desde la web")}&body=${encodeURIComponent(texto())}`)
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-marca-700 py-3 font-bold text-marca-700 hover:bg-marca-50"
        >
          <Mail className="h-5 w-5" aria-hidden="true" /> Enviar por correo
        </button>
      </div>
    </form>
  );
}
