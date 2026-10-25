import { ChevronDown } from "lucide-react";

// Párrafos de la columna "Descripción larga" del Excel.
// "Importante: ..." o "Recomendación: ..." resaltan la etiqueta; líneas que empiezan con "-" o "•" forman una lista.
function Bloques({ parrafos }) {
  const bloques = [];
  for (const p of parrafos) {
    const vineta = p.match(/^[-•]\s*(.+)/);
    if (vineta) {
      const ultimo = bloques[bloques.length - 1];
      if (ultimo?.tipo === "lista") ultimo.items.push(vineta[1]);
      else bloques.push({ tipo: "lista", items: [vineta[1]] });
    } else {
      bloques.push({ tipo: "parrafo", texto: p });
    }
  }
  return bloques.map((b, i) =>
    b.tipo === "lista" ? (
      <ul key={i} className="list-disc space-y-1 pl-5">
        {b.items.map((it, j) => (
          <li key={j}>{it}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>
        {(() => {
          const m = b.texto.match(/^(Importante|Recomendaci[oó]n|Nota|Incluye|Uso)\s*:\s*(.*)$/i);
          return m ? (
            <>
              <strong className="text-gray-900">{m[1]}:</strong> {m[2]}
            </>
          ) : (
            b.texto
          );
        })()}
      </p>
    )
  );
}

export default function DescripcionCompleta({ parrafos, className = "" }) {
  if (!parrafos?.length) return null;
  return (
    <details open className={`group rounded-xl border border-gray-200 bg-white ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-bold text-marca-900 [&::-webkit-details-marker]:hidden">
        Descripción del producto
        <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-3 text-[15px] leading-relaxed text-gray-700">
        <Bloques parrafos={parrafos} />
      </div>
    </details>
  );
}
