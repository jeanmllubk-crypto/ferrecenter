import Link from "next/link";
import PaginaInfo from "@/components/PaginaInfo";
import { linkWhatsApp, TIENDA } from "@/lib/config";

export const metadata = {
  title: "Política de privacidad",
  description: `Cómo ${TIENDA.nombre} usa y protege tus datos personales, conforme a la Ley N.° 29733 de Protección de Datos Personales.`,
  alternates: { canonical: "/privacidad" },
};

export default function Privacidad() {
  return (
    <PaginaInfo titulo="Política de privacidad" subtitulo="Conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento.">
      <div className="prosa">
        <h2>Quién es responsable de tus datos</h2>
        <p>
          {TIENDA.razonSocial} ({TIENDA.ruc}), con domicilio en {TIENDA.direccion}, que opera la tienda {TIENDA.nombre}.
        </p>

        <h2>Qué datos recogemos</h2>
        <ul>
          <li>
            <strong>Al hacer un pedido:</strong> tu nombre, el lugar de entrega (departamento, provincia, distrito, dirección y referencia), la ubicación
            que marques en el mapa (si lo haces), los productos, el monto y la forma de pago. Tu número de teléfono nos llega cuando nos escribes por WhatsApp.
          </li>
          <li>
            <strong>Al calificar una compra:</strong> tu número de pedido, tus estrellas, tu comentario y tu nombre (en la web solo se muestra el primer nombre).
          </li>
          <li>
            <strong>En el Libro de Reclamaciones:</strong> los datos que pide la ley para atender tu reclamo o queja.
          </li>
        </ul>

        <h2>Para qué los usamos</h2>
        <ul>
          <li>Preparar, entregar y dar seguimiento a tus pedidos, y coordinar el pago.</li>
          <li>Llevar el registro de nuestras ventas y cumplir con nuestras obligaciones legales y tributarias.</li>
          <li>Publicar tu opinión sobre los productos, solo si tú la envías y luego de revisarla.</li>
          <li>Atender tus reclamos, consultas y garantías.</li>
        </ul>
        <p>No vendemos ni alquilamos tus datos, y no los usamos para enviarte publicidad sin tu permiso.</p>

        <h2>Con quién los compartimos</h2>
        <p>Solo con los servicios que necesitamos para atenderte:</p>
        <ul>
          <li>WhatsApp (Meta), por donde nos envías el pedido.</li>
          <li>Google, donde guardamos el registro de pedidos y opiniones en una hoja de cálculo privada.</li>
          <li>La agencia de transporte o el repartidor, solo con lo necesario para entregar tu pedido.</li>
          <li>Autoridades, cuando la ley lo exija.</li>
        </ul>

        <h2>Datos guardados en tu dispositivo</h2>
        <p>
          Tu carrito y los datos de entrega que escribiste se guardan en tu propio navegador para que no tengas que volver a escribirlos en tu próxima compra.
          Puedes borrarlos limpiando los datos del sitio en tu navegador.
        </p>

        <h2>Cuánto tiempo los guardamos</h2>
        <p>Mientras sean necesarios para atender tu pedido y por el plazo que exigen las normas tributarias y de protección al consumidor.</p>

        <h2>Tus derechos</h2>
        <p>
          Puedes pedir en cualquier momento acceder a tus datos, corregirlos, eliminarlos u oponerte a su uso (derechos ARCO). Escríbenos a{" "}
          <a href={`mailto:${TIENDA.correo}`}>{TIENDA.correo}</a> o por <a href={linkWhatsApp("Hola FerreCenter, quiero hacer una consulta sobre mis datos personales.")}>WhatsApp</a>.
          Si no quedas conforme con nuestra respuesta, puedes acudir a la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia.
        </p>

        <p>
          También puedes revisar nuestra política de <Link href="/cambios-y-devoluciones">cambios y devoluciones</Link> y el{" "}
          <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link>.
        </p>
      </div>
    </PaginaInfo>
  );
}
