import { HandCoins, Landmark } from "lucide-react";
import { TIENDA } from "@/lib/config";

// Logo de cada forma de pago: Yape y Plin con su logo oficial; transferencia y contra entrega con ícono.
// Todos ocupan la misma caja cuadrada para que se vean parejos.
// tamano: clases de alto/ancho de la caja · apagado: en gris (opción no disponible)
export default function LogoPago({ forma, apagado, tamano = "h-9 w-9" }) {
  const logo = TIENDA.pagos[String(forma).toLowerCase()]?.logo;
  const caja = `flex ${tamano} shrink-0 items-center justify-center overflow-hidden rounded-[28%] ${apagado ? "opacity-40 grayscale" : ""}`;
  if (logo) {
    return (
      <span className={caja}>
        <img src={logo} alt="" className="h-full w-full object-contain" />
      </span>
    );
  }
  const transferencia = /transferencia/i.test(forma);
  const Icono = transferencia ? Landmark : HandCoins;
  return (
    <span className={`${caja} ${transferencia ? "bg-marca-700" : "bg-acento-500"} text-white`}>
      <Icono className="h-[58%] w-[58%]" aria-hidden="true" />
    </span>
  );
}
