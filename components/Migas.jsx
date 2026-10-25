import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TIENDA } from "@/lib/config";

// Ruta de navegación (Inicio > Categoría > Producto) con datos estructurados para Google
export default function Migas({ items }) {
  const todos = [{ nombre: "Inicio", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: todos.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.nombre,
      ...(it.href ? { item: `${TIENDA.url}${it.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Ruta de navegación" className="sin-scrollbar overflow-x-auto py-3">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-500 sm:text-sm">
        {todos.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />}
            {it.href && i < todos.length - 1 ? (
              <Link href={it.href} className="hover:text-marca-600 hover:underline">
                {it.nombre}
              </Link>
            ) : (
              <span aria-current={i === todos.length - 1 ? "page" : undefined} className="max-w-[60vw] truncate font-semibold text-gray-800">
                {it.nombre}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
