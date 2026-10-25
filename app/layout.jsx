import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFlotante from "@/components/WhatsAppFlotante";
import AvisoCarrito from "@/components/AvisoCarrito";
import { CarritoProvider } from "@/components/CarritoContext";
import { categorias, marcas, productos, imagenPrincipal } from "@/lib/productos";
import { TIENDA } from "@/lib/config";

export const metadata = {
  metadataBase: new URL(TIENDA.url),
  title: {
    default: "FerreCenter | Herramientas, EPP y Accesorios en Tacna y todo el Perú",
    template: "%s | FerreCenter",
  },
  description:
    "Tienda online de herramientas, equipos de protección personal (EPP), protección colectiva, discos de corte, desarmadores y accesorios en Perú. Marcas Truper, Uyustools y Total. Precios en soles, envíos a todo el Perú y pedidos por WhatsApp.",
  keywords: ["ferretería online", "herramientas Perú", "EPP", "equipos de protección personal", "seguridad industrial", "protección colectiva", "discos de corte", "desarmadores", "cascos de seguridad", "guantes de trabajo", "Truper", "Uyustools", "Total", "Tacna", "ferretería Tacna"],
  applicationName: "FerreCenter",
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "FerreCenter",
  },
  twitter: { card: "summary_large_image" },
  // Ver "mostrarEnGoogle" en lib/config.js
  ...(!TIENDA.mostrarEnGoogle && { robots: { index: false, follow: false } }),
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#0a2a4e",
  width: "device-width",
  initialScale: 1,
};

const jsonLdTienda = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: TIENDA.nombre,
  url: TIENDA.url,
  telephone: `+${TIENDA.whatsapp}`,
  email: TIENDA.correo,
  priceRange: "S/.",
  currenciesAccepted: "PEN",
  paymentAccepted: TIENDA.formasPago.join(", "),
  address: {
    "@type": "PostalAddress",
    streetAddress: TIENDA.ubicacion.calle,
    addressLocality: TIENDA.ubicacion.distrito,
    addressRegion: TIENDA.ubicacion.region,
    addressCountry: "PE",
  },
  sameAs: Object.values(TIENDA.redes),
  ...(TIENDA.mapaCoordenadas && {
    geo: {
      "@type": "GeoCoordinates",
      latitude: Number(TIENDA.mapaCoordenadas.split(",")[0]),
      longitude: Number(TIENDA.mapaCoordenadas.split(",")[1]),
    },
  }),
};

export default function RootLayout({ children }) {
  // Índice ligero para las sugerencias del buscador
  const indice = productos.map((p) => ({
    slug: p.slug,
    nombre: p.nombre,
    marca: p.marca,
    sku: p.sku,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    precio: p.precioFinal,
    imagen: imagenPrincipal(p),
  }));

  return (
    <html lang="es-PE">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTienda) }} />
        <CarritoProvider>
          <Header categorias={categorias} marcas={marcas} indice={indice} />
          <main className="flex-1">{children}</main>
          <Footer categorias={categorias} />
          <WhatsAppFlotante />
          <AvisoCarrito />
        </CarritoProvider>
      </body>
    </html>
  );
}
