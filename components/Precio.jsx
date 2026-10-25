import { soles } from "@/lib/formato";

export default function Precio({ producto, grande = false }) {
  const { precio, precioOferta } = producto;
  return (
    <div className="flex flex-col">
      {precioOferta ? (
        <>
          <span className={`font-extrabold text-oferta ${grande ? "text-3xl" : "text-lg"}`}>{soles(precioOferta)}</span>
          <span className={`text-gray-500 line-through ${grande ? "text-base" : "text-sm"}`}>
            <span className="sr-only">Precio normal: </span>
            {soles(precio)}
          </span>
        </>
      ) : (
        <span className={`font-extrabold text-marca-600 ${grande ? "text-3xl" : "text-lg"}`}>{soles(precio)}</span>
      )}
    </div>
  );
}
