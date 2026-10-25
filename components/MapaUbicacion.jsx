"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";

// Pin propio (SVG), así no dependemos de las imágenes de marcador de Leaflet
const PIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
  <path d="M16 43s14-15.6 14-27A14 14 0 0 0 2 16c0 11.4 14 27 14 27z" fill="#d4202f" stroke="#fff" stroke-width="2"/>
  <circle cx="16" cy="16" r="5.5" fill="#fff"/></svg>`;

// Mapa (OpenStreetMap) para que el cliente marque dónde entregar: toca el mapa o arrastra el pin.
// valor: { lat, lng } o null · centro: [lat, lng] donde empieza el mapa (su distrito)
export default function MapaUbicacion({ valor, centro, onCambio }) {
  const caja = useRef(null);
  const mapa = useRef(null);
  const pin = useRef(null);
  const L = useRef(null);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState("");

  function ponerPin(lat, lng, mover = true) {
    if (!mapa.current) return;
    if (pin.current) pin.current.setLatLng([lat, lng]);
    else {
      const icono = L.current.divIcon({ html: PIN, className: "", iconSize: [32, 44], iconAnchor: [16, 43] });
      pin.current = L.current.marker([lat, lng], { icon: icono, draggable: true }).addTo(mapa.current);
      pin.current.on("dragend", () => {
        const p = pin.current.getLatLng();
        onCambio({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) });
      });
    }
    if (mover) mapa.current.setView([lat, lng], Math.max(mapa.current.getZoom(), 17));
  }

  // Crear el mapa (Leaflet se carga solo cuando se abre)
  useEffect(() => {
    let cancelado = false;
    import("leaflet").then((mod) => {
      if (cancelado || !caja.current || mapa.current) return;
      L.current = mod.default || mod;
      const inicio = valor ? [valor.lat, valor.lng] : centro || [-9.19, -75.02];
      mapa.current = L.current.map(caja.current, { zoomControl: true }).setView(inicio, valor ? 17 : centro ? 15 : 5);
      L.current
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(mapa.current);
      if (valor) ponerPin(valor.lat, valor.lng, false);
      mapa.current.on("click", (e) => {
        const p = { lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) };
        ponerPin(p.lat, p.lng, false);
        onCambio(p);
      });
    });
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      pin.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si quitan la ubicación (o cambia el distrito), sacar el pin del mapa
  useEffect(() => {
    if (!valor && pin.current) {
      pin.current.remove();
      pin.current = null;
    }
  }, [valor]);

  // Si cambia el distrito y aún no hay pin, llevar el mapa a ese distrito
  useEffect(() => {
    if (mapa.current && centro && !pin.current) mapa.current.setView(centro, 15);
  }, [centro]);

  function miUbicacion() {
    if (!navigator.geolocation) return setAviso("Tu navegador no permite obtener la ubicación. Marca el punto en el mapa.");
    setBuscando(true);
    setAviso("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBuscando(false);
        const p = { lat: +coords.latitude.toFixed(6), lng: +coords.longitude.toFixed(6) };
        ponerPin(p.lat, p.lng);
        onCambio(p);
      },
      () => {
        setBuscando(false);
        setAviso("No pudimos obtener tu ubicación (revisa el permiso de ubicación). Puedes marcar el punto tocando el mapa.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={miUbicacion}
        disabled={buscando}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-marca-300 bg-marca-50 px-3 py-2 text-sm font-semibold text-marca-800 hover:bg-marca-100 disabled:opacity-60"
      >
        <LocateFixed className="h-4 w-4" aria-hidden="true" />
        {buscando ? "Buscando tu ubicación…" : "Usar mi ubicación actual"}
      </button>
      <div ref={caja} className="relative z-0 h-64 w-full overflow-hidden rounded-lg border border-gray-300" aria-label="Mapa para marcar el lugar de entrega" />
      <p className="text-xs text-gray-500">
        {valor ? "Listo. Si no es el lugar exacto, arrastra el pin o toca otro punto del mapa." : "Toca el mapa en el lugar exacto de entrega para poner el pin."}
      </p>
      {aviso && <p className="text-xs text-oferta">{aviso}</p>}
    </div>
  );
}
