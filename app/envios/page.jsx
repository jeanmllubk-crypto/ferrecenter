import Link from "next/link";
import PaginaInfo from "@/components/PaginaInfo";
import { linkWhatsApp, TIENDA } from "@/lib/config";
import { soles } from "@/lib/formato";

export const metadata = {
  title: "Envíos y entregas",
  description: "Envío a toda la ciudad de Tacna por S/. 15.00 y despachos a todo el Perú por agencia. Costos y plazos de envío de FerreCenter.",
  alternates: { canonical: "/envios" },
};

export default function Envios() {
  return (
    <PaginaInfo titulo="Envíos y entregas" subtitulo="Llevamos tus productos a todo el Perú.">
      <div className="prosa">
        <h2>Ciudad de Tacna</h2>
        <ul>
          <li>
            Costo de envío fijo de <strong>{soles(TIENDA.envioTacna)}</strong> a toda la ciudad de Tacna.
          </li>
          <li>Entrega en 24 a 48 horas hábiles después de confirmado el pago.</li>
          <li>Pago contra entrega disponible en toda la ciudad de Tacna.</li>
        </ul>
        <h2>Resto del Perú</h2>
        <ul>
          <li>Enviamos a través de agencias de transporte (Shalom, Olva Courier, Marvisur u otra de tu preferencia).</li>
          <li>Plazo referencial: 2 a 5 días hábiles según el destino.</li>
          <li>El flete se paga según la tarifa de la agencia y te enviamos la clave o guía de seguimiento.</li>
        </ul>
        <h2>Recojo</h2>
        <p>Si prefieres recoger tu pedido, coordina el punto y horario por WhatsApp.</p>
        <h2>Al recibir tu pedido</h2>
        <p>
          Revisa que el paquete esté cerrado y en buen estado. Si notas algún daño, tómale fotos y escríbenos dentro de las 24 horas. Más información en{" "}
          <Link href="/cambios-y-devoluciones">Cambios y devoluciones</Link>.
        </p>
        <p>
          ¿Dudas sobre tu envío?{" "}
          <a href={linkWhatsApp("Hola FerreCenter, tengo una consulta sobre envíos.")} target="_blank" rel="noopener noreferrer">
            Escríbenos por WhatsApp
          </a>
          .
        </p>
      </div>
    </PaginaInfo>
  );
}
