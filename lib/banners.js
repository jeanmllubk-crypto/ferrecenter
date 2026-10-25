// BANNERS DE LA PORTADA
// Edita esta lista para cambiar los banners del carrusel. Se muestran en este orden.
//
// Campos:
//   activo      true / false  → mostrar u ocultar sin borrarlo
//   etiqueta    texto pequeño arriba (ej. "Ofertas del día")
//   titulo      texto grande
//   texto       texto debajo del título
//   boton       texto del botón
//   enlace      a dónde lleva el botón: "/catalogo", "/categoria/herramientas-electricas",
//               "/marca/truper", "/producto/...", o "whatsapp" para abrir un chat
//   producto    SKU del Excel (ej. "TRU-TAL-001") para usar su foto y precio,
//               o "oferta" (el de mayor descuento) o "destacado" (el primero con Destacado = Sí)
//   mostrarPrecio  true para mostrar el precio junto a la foto
//   tema        color de fondo: "naranja", "azul", "verde", "oscuro" o "rojo"
//   desde/hasta fechas opcionales "AAAA-MM-DD" para campañas con inicio y fin
//
// En los textos puedes usar: {nombre} {marca} {precio} {precioNormal} {descuento}
// y en el enlace {slug} (se reemplazan con los datos del producto elegido).
// Si el banner usa "oferta" y no hay productos en oferta, se oculta solo.
//
// Banner con imagen propia (ej. diseñado en Canva): pon la imagen en public/banners/
// y usa  imagen: "/banners/mi-banner.jpg"  (1600 × 500 px)  e
// imagenCelular: "/banners/mi-banner-celular.jpg"  (800 × 600 px, opcional).
// Con imagen propia no se dibujan los textos: el banner entero lleva al "enlace".

const banners = [
  {
    activo: true,
    etiqueta: "Ofertas del día",
    titulo: "Hasta {descuento}% de descuento",
    texto: "Herramientas, EPP y accesorios a precios especiales.",
    boton: "Ver ofertas",
    enlace: "/catalogo?oferta=1",
    producto: "oferta",
    mostrarPrecio: true,
    tema: "naranja",
  },
  {
    activo: true,
    etiqueta: "Temporada de obra",
    titulo: "Todo para tu obra",
    texto: "Taladros, amoladoras y herramientas eléctricas con garantía.",
    boton: "Ver herramientas eléctricas",
    enlace: "/categoria/herramientas-electricas",
    producto: "TOT-AMO-001",
    tema: "oscuro",
  },
  {
    activo: true,
    etiqueta: "Destacado",
    titulo: "{nombre}",
    texto: "{marca} · ahora a {precio}",
    boton: "Comprar ahora",
    enlace: "/producto/{slug}",
    producto: "destacado",
    mostrarPrecio: true,
    tema: "azul",
  },
  {
    activo: true,
    etiqueta: "Envíos a todo el Perú",
    titulo: "Despachamos desde Tacna",
    texto: "Paga con Yape, Plin, transferencia o contra entrega.",
    boton: "Ver envíos",
    enlace: "/envios",
    producto: "UYU-ALI-001",
    tema: "verde",
  },
  {
    // Actívalo (true) cuando cargues productos de la categoría "Seguridad (EPP)" en el Excel
    activo: false,
    etiqueta: "Seguridad industrial",
    titulo: "Equipos de protección personal",
    texto: "Cascos, guantes, lentes, arneses y señalización para tu obra.",
    boton: "Ver EPP",
    enlace: "/categoria/seguridad-epp",
    tema: "verde",
  },
  {
    activo: true,
    etiqueta: "Empresas y maestros de obra",
    titulo: "¿Compras por mayor?",
    texto: "Te enviamos una cotización especial por WhatsApp.",
    boton: "Pedir cotización",
    enlace: "whatsapp",
    tema: "rojo",
  },
];

export default banners;
