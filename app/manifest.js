// Permite "Agregar a pantalla de inicio" en el celular con el ícono y colores de la tienda
export default function manifest() {
  return {
    name: "FerreCenter – Herramientas, EPP y accesorios",
    short_name: "FerreCenter",
    description: "Tienda online de herramientas, EPP y accesorios en Tacna con envíos a todo el Perú.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5f8",
    theme_color: "#0a2a4e",
    lang: "es-PE",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
