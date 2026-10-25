import { Suspense } from "react";
import PaginaInfo from "@/components/PaginaInfo";
import FormularioCalificacion from "@/components/FormularioCalificacion";

export const metadata = {
  title: "Califica tu compra",
  description: "Califica los productos que compraste en FerreCenter.",
  robots: { index: false, follow: false },
};

export default function Calificar() {
  return (
    <PaginaInfo titulo="Califica tu compra" subtitulo="Tu opinión ayuda a otros clientes a elegir mejor.">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white" />}>
        <FormularioCalificacion />
      </Suspense>
    </PaginaInfo>
  );
}
