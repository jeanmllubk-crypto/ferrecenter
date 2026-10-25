"use client";

import { useEffect, useState } from "react";

// Lista oficial de ubigeos (INEI): [{ n: departamento, p: [{ n: provincia, d: [[distrito, lat, lng], …] }] }]
// Se descarga una sola vez y solo cuando el cliente llega a este paso (≈65 KB).
let cache = null;
function cargarUbigeo() {
  if (!cache) cache = fetch("/datos/ubigeo.json").then((r) => r.json());
  return cache;
}

// Coordenadas del distrito; los distritos nuevos sin coordenadas usan las de otro distrito de su provincia
function centroDe(provincia, distrito) {
  const d = provincia?.d.find((x) => x[0] === distrito);
  const conCoords = d?.[1] != null ? d : provincia?.d.find((x) => x[1] != null);
  return conCoords ? [conCoords[1], conCoords[2]] : null;
}

// Departamento → Provincia → Distrito. "fijo" bloquea departamento y provincia (p. ej. envío en la ciudad de Tacna)
export default function SelectorUbigeo({ valor, onCambio, fijo, error }) {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    cargarUbigeo().then(setDatos).catch(() => setDatos([]));
  }, []);

  const dep = datos?.find((d) => d.n === valor.departamento);
  const prov = dep?.p.find((p) => p.n === valor.provincia);

  function cambiar(campo, texto) {
    const nuevo = { ...valor, [campo]: texto };
    if (campo === "departamento") Object.assign(nuevo, { provincia: "", distrito: "" });
    if (campo === "provincia") nuevo.distrito = "";
    const d = datos?.find((x) => x.n === nuevo.departamento);
    const p = d?.p.find((x) => x.n === nuevo.provincia);
    onCambio({ ...nuevo, centro: centroDe(p, nuevo.distrito) });
  }

  const select = (id, etiqueta, campo, opciones, bloqueado) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-gray-600">
        {etiqueta}
      </label>
      <select
        id={id}
        className="campo"
        value={valor[campo]}
        onChange={(e) => cambiar(campo, e.target.value)}
        disabled={bloqueado || !opciones.length}
        aria-invalid={!!error && !valor[campo]}
      >
        <option value="">{datos ? "Elige…" : "Cargando…"}</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {select("departamento", "Departamento", "departamento", datos?.map((d) => d.n) || [], fijo)}
        {select("provincia", "Provincia", "provincia", dep?.p.map((p) => p.n) || [], fijo)}
        {select("distrito", "Distrito", "distrito", prov?.d.map((d) => d[0]) || [])}
      </div>
      {error && <p className="mt-1 text-xs text-oferta">{error}</p>}
    </div>
  );
}
