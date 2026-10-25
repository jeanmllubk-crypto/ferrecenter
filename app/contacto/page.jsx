import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import PaginaInfo from "@/components/PaginaInfo";
import FormularioContacto from "@/components/FormularioContacto";
import { IconoWhatsApp } from "@/components/IconosSociales";
import { linkWhatsApp, TIENDA } from "@/lib/config";

export const metadata = {
  title: "Contacto",
  description: `Contáctanos por WhatsApp o llámanos al ${TIENDA.telefonoVisible}. Visítanos en Gregorio Albarracín, Tacna. Atención personalizada para compras de herramientas, EPP y accesorios.`,
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  const coordenadas = TIENDA.mapaCoordenadas.replace(/\s+/g, "");

  return (
    <PaginaInfo titulo="Contacto" subtitulo="Estamos para ayudarte a elegir la herramienta o el equipo de seguridad correcto." ancho="max-w-5xl">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={linkWhatsApp("Hola FerreCenter, quisiera hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-whatsapp/10 p-4 hover:bg-whatsapp/15"
            >
              <IconoWhatsApp className="h-8 w-8 shrink-0 text-whatsapp-oscuro" />
              <span>
                <span className="block text-sm text-gray-600">Escríbenos por</span>
                <span className="font-bold text-gray-900">WhatsApp</span>
              </span>
            </a>
            <a href={`tel:${TIENDA.telefonoLlamadas}`} className="flex items-center gap-3 rounded-xl bg-marca-50 p-4 hover:bg-marca-100">
              <Phone className="h-8 w-8 shrink-0 text-marca-700" aria-hidden="true" />
              <span>
                <span className="block text-sm text-gray-600">Llámanos al</span>
                <span className="font-bold text-gray-900">{TIENDA.telefonoVisible}</span>
              </span>
            </a>
          </div>

          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-3 px-1">
              <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-marca-600" aria-hidden="true" />
              <span className="text-gray-800">{TIENDA.direccion}</span>
            </li>
            <li className="flex items-center gap-3 px-1">
              <Clock className="h-6 w-6 shrink-0 text-marca-600" aria-hidden="true" />
              <span className="text-gray-800">{TIENDA.horario}</span>
            </li>
            <li className="flex items-center gap-3 px-1">
              <Mail className="h-6 w-6 shrink-0 text-marca-600" aria-hidden="true" />
              <a href={`mailto:${TIENDA.correoDestino}`} className="font-semibold text-gray-800 hover:underline">
                {TIENDA.correo}
              </a>
            </li>
          </ul>

          {coordenadas && (
            <>
              <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                <iframe
                  title="Ubicación de FerreCenter en Google Maps"
                  src={`https://maps.google.com/maps?q=${coordenadas}&z=17&hl=es&output=embed`}
                  className="h-64 w-full sm:h-72"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${coordenadas}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-marca-700 py-3 font-bold text-marca-700 hover:bg-marca-50"
              >
                <Navigation className="h-5 w-5" aria-hidden="true" /> Cómo llegar
              </a>
            </>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-lg font-bold text-marca-900">Envíanos un mensaje</h2>
          <FormularioContacto />
        </div>
      </div>
    </PaginaInfo>
  );
}
