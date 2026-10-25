import Link from "next/link";

export const metadata = { title: "Página no encontrada" };

export default function NoEncontrado() {
  return (
    <div className="contenedor py-16 text-center">
      <p className="text-6xl font-black text-marca-200">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-marca-900">No encontramos esta página</h1>
      <p className="mt-2 text-gray-600">Puede que el producto ya no esté disponible o que el enlace haya cambiado.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold">
          Ir al inicio
        </Link>
        <Link href="/catalogo" className="rounded-xl bg-marca-700 px-5 py-3 font-bold text-white">
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
