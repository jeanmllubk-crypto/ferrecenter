import Migas from "./Migas";

export default function PaginaInfo({ titulo, subtitulo, children, ancho = "max-w-3xl" }) {
  return (
    <div className="contenedor pb-6">
      <Migas items={[{ nombre: titulo }]} />
      <div className={`mx-auto ${ancho}`}>
        <header className="mb-4">
          <h1 className="text-2xl font-extrabold text-marca-900 sm:text-3xl">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-gray-600">{subtitulo}</p>}
        </header>
        <div className="rounded-2xl bg-white p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
