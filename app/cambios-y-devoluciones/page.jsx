import Link from "next/link";
import PaginaInfo from "@/components/PaginaInfo";
import { linkWhatsApp } from "@/lib/config";

export const metadata = {
  title: "Cambios y devoluciones",
  description: "Política de cambios, devoluciones y garantía de FerreCenter. Conoce los plazos y condiciones para cambiar tus productos.",
  alternates: { canonical: "/cambios-y-devoluciones" },
};

export default function Cambios() {
  return (
    <PaginaInfo titulo="Cambios y devoluciones" subtitulo="Compra con tranquilidad.">
      <div className="prosa">
        <h2>Plazo para cambios</h2>
        <p>
          Puedes solicitar el cambio de un producto dentro de los <strong>7 días calendario</strong> siguientes a la entrega, siempre que esté
          nuevo, sin uso, con su empaque original, accesorios y comprobante de pago.
        </p>
        <h2>Productos con fallas (garantía)</h2>
        <ul>
          <li>Cada producto indica su tiempo de garantía en la ficha (por ejemplo, 3 o 6 meses).</li>
          <li>La garantía cubre defectos de fabricación. No cubre mal uso, golpes, humedad, conexión a voltaje incorrecto ni desgaste normal.</li>
          <li>Evaluaremos el producto y, según el caso, lo repararemos, cambiaremos o devolveremos tu dinero.</li>
        </ul>
        <h2>Devoluciones de dinero</h2>
        <p>
          Si corresponde una devolución, la realizaremos por el mismo medio de pago o por transferencia en un plazo máximo de 7 días hábiles
          desde la aprobación.
        </p>
        <h2>Cómo solicitarlo</h2>
        <ul>
          <li>
            Escríbenos por{" "}
            <a href={linkWhatsApp("Hola FerreCenter, quiero solicitar un cambio o devolución.")} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>{" "}
            con tu nombre, número de pedido o comprobante y fotos del producto.
          </li>
          <li>Te indicaremos cómo enviarnos o entregarnos el producto.</li>
        </ul>
        <p>
          Si no estás conforme con nuestra atención, puedes registrar tu caso en el <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link>.
        </p>
      </div>
    </PaginaInfo>
  );
}
