import Link from "next/link";
import PaginaInfo from "@/components/PaginaInfo";
import { TIENDA } from "@/lib/config";

export const metadata = {
  title: "Nosotros",
  description: "Conoce FerreCenter: tienda en Tacna de herramientas, EPP, protección colectiva y accesorios, con envíos a todo el Perú y atención por WhatsApp.",
  alternates: { canonical: "/nosotros" },
};

export default function Nosotros() {
  return (
    <PaginaInfo titulo="Nosotros" subtitulo="Herramientas y seguridad de confianza para profesionales, empresas y hogares del Perú.">
      <div className="prosa">
        <p>
          En <strong>FerreCenter</strong> vendemos herramientas, equipos de protección personal (EPP), protección colectiva, discos de corte, desarmadores y
          accesorios, con marcas originales como <strong>Truper</strong>, <strong>Uyustools</strong> y <strong>Total</strong>, pensados para maestros de obra, técnicos, talleres, empresas y para quienes hacen sus propios arreglos en casa.
        </p>
        <h2>Nuestra misión</h2>
        <p>
          Hacer que comprar herramientas y equipos de seguridad sea fácil, rápido y seguro: precios claros en soles, asesoría honesta y despacho a todo el Perú.
        </p>
        <h2>¿Por qué comprar con nosotros?</h2>
        <ul>
          <li>Productos originales con garantía del fabricante.</li>
          <li>Atención personalizada por WhatsApp antes y después de tu compra.</li>
          <li>Pagos con Yape, Plin, transferencia bancaria o contra entrega.</li>
          <li>Estamos en Tacna y enviamos a todo el Perú.</li>
          <li>Precios especiales para compras por mayor y empresas.</li>
        </ul>
        <h2>Atención</h2>
        <p>
          {TIENDA.horario}. Escríbenos al {TIENDA.telefonoVisible} o visita nuestra página de <Link href="/contacto">contacto</Link>.
        </p>
      </div>
    </PaginaInfo>
  );
}
