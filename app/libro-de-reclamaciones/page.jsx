import PaginaInfo from "@/components/PaginaInfo";
import FormularioReclamo from "@/components/FormularioReclamo";

export const metadata = {
  title: "Libro de Reclamaciones",
  description: "Libro de Reclamaciones virtual de FerreCenter conforme al Código de Protección y Defensa del Consumidor del Perú.",
  alternates: { canonical: "/libro-de-reclamaciones" },
};

export default function LibroReclamaciones() {
  return (
    <PaginaInfo
      titulo="Libro de Reclamaciones"
      subtitulo="Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N.° 29571)."
    >
      <FormularioReclamo />
    </PaginaInfo>
  );
}
