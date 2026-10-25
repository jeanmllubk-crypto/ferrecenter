import { Building2, Clock, Headset, Phone } from "lucide-react";
import { IconoWhatsApp } from "./IconosSociales";
import { linkWhatsApp, TIENDA } from "@/lib/config";

// Tarjeta de ayuda en la ficha de producto: asesoría y cotización por mayor.
// Los mensajes de WhatsApp ya incluyen el producto para que el cliente no tenga que escribirlo.
export default function AsesorProducto({ producto }) {
  const ref = `${producto.nombre} (${producto.sku})`;
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200" aria-label="Ayuda y compras por mayor">
      <div className="p-4">
        <h2 className="flex items-center gap-2 font-bold text-marca-900">
          <Headset className="h-5 w-5 text-acento-500" aria-hidden="true" />
          ¿Tienes dudas sobre este producto?
        </h2>
        <p className="mt-1 text-sm text-gray-600">Te asesoramos para elegir la herramienta o el equipo de seguridad correcto.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={linkWhatsApp(`Hola FerreCenter, tengo una consulta sobre: ${ref}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-whatsapp py-2.5 text-sm font-semibold text-white hover:bg-whatsapp-oscuro"
          >
            <IconoWhatsApp className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href={`tel:${TIENDA.telefonoLlamadas}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-marca-200 bg-white py-2.5 text-sm font-semibold text-marca-700 hover:bg-marca-50"
          >
            <Phone className="h-4 w-4" aria-hidden="true" /> Llamar
          </a>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {TIENDA.horario}
        </p>
      </div>

      <div className="border-t border-gray-200 bg-marca-50 p-4">
        <h2 className="flex items-center gap-2 font-bold text-marca-900">
          <Building2 className="h-5 w-5 text-marca-600" aria-hidden="true" />
          ¿Compras por mayor o para tu empresa?
        </h2>
        <p className="mt-1 text-sm text-gray-600">Precios especiales por volumen para empresas, maestros de obra y ferreterías.</p>
        <a
          href={linkWhatsApp(`Hola FerreCenter, quiero una cotización por mayor de: ${ref}. Cantidad aproximada: `)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-marca-700 py-2.5 text-sm font-semibold text-white hover:bg-marca-800"
        >
          Pedir cotización
        </a>
      </div>
    </section>
  );
}
