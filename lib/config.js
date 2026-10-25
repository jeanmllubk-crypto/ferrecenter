// Datos generales de la tienda: edita aquí teléfono, correo, redes, etc.
export const TIENDA = {
  nombre: "FerreCenter",
  eslogan: "Herramientas, seguridad industrial y accesorios para tu obra",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ferrecenter.netlify.app",
  // false = la web funciona con el enlace, pero se pide a Google que NO la muestre en sus resultados.
  // Cámbialo a true cuando la tienda esté lista para el público.
  mostrarEnGoogle: false,
  whatsapp: "51917880764",
  telefonoVisible: "+51 917 880 764",
  telefonoLlamadas: "+51917880764", // número para el botón "Llamar"
  // Ubicación exacta de la tienda para el mapa de Contacto (latitud, longitud), ej. "-18.0450, -70.2600".
  // Mientras esté vacío, el mapa no se muestra (Google no encuentra bien la dirección escrita).
  mapaCoordenadas: "-18.038728, -70.253691",
  correo: "ventas@ferrecenter.pe", // el que se muestra en la web
  correoDestino: "jeanmll.ubk@gmail.com", // el que recibe los mensajes (temporalmente tu correo personal)
  direccion: 'Asoc. 1ero de Mayo Mz "J" Lt "23", Crnel. Gregorio Albarracín - Tacna - Tacna',
  // Misma dirección separada en partes, para Google
  ubicacion: {
    calle: 'Asoc. 1ero de Mayo Mz "J" Lt "23"',
    distrito: "Coronel Gregorio Albarracín Lanchipa",
    region: "Tacna",
  },
  horario: "Lunes a sábado de 9:00 a. m. a 7:00 p. m.",
  ruc: "RUC 20609709449",
  razonSocial: "Inversiones Wiñay Sur E.I.R.L.",
  redes: {
    // Temporalmente perfiles personales, hasta crear los de la empresa
    facebook: "https://www.facebook.com/share/1CHXppwjVE/",
    instagram: "https://www.instagram.com/jeanm.ll",
    tiktok: "https://www.tiktok.com/@jeanmll07",
  },
  // Logos de las marcas (archivos en public/marcas/). Sin logo se muestra el nombre en texto.
  // "fondo": color detrás del logo, para logos claros que no se leen sobre blanco.
  logosMarcas: {
    truper: { src: "/marcas/truper.svg", fondo: "#FF6720" }, // recortado a la palabra; original en logos-originales/truper-original.svg
    uyustools: { src: "/marcas/uyustools.svg", fondo: "#111111" },
    total: { src: "/marcas/total.png", lleno: true, fondo: "#096d71" }, // "lleno": la imagen ya trae su fondo y ocupa todo el alto
  },
  envioTacna: 15, // costo fijo de envío a toda la ciudad de Tacna (S/.)
  // Enlace de la "Aplicación web" de Google Apps Script (google/LEEME.md). Registra los pedidos en la hoja
  // "FerreCenter - Ventas" y guarda/lee las reseñas. Vacío = la tienda funciona igual, pero sin registro ni reseñas.
  registroUrl: "https://script.google.com/macros/s/AKfycbzp8SQ2z4WLeDgi3GvlZmh6juiGDHFrnXEF4l9r-bXt_ZkCKV-CWk4u_vPYz5zTEuqjNQ/exec",
  // Datos para pagar. "titular" es el nombre que ve el cliente en su app al pagar.
  // "qr": imagen del código QR dentro de public/pagos/ (vacío = no se muestra QR).
  // cuentas: [{ banco: "BCP", moneda: "Soles", numero: "...", cci: "...", titular: "..." }]  → vacío = se envían por WhatsApp
  pagos: {
    // qr: solo el código (recortado) · qrCompleto: la imagen original que se abre al tocarlo · logo: ícono en "Forma de pago"
    yape: { numero: "917 880 764", titular: "Jean Marco Leonel Labra", qr: "/pagos/yape-qr-codigo.jpeg", qrCompleto: "/pagos/yape-qr.jpeg", logo: "/pagos/yape-logo.png" },
    plin: { numero: "917 880 764", titular: "Jean Marco Leonel Labra", qr: "/pagos/plin-qr-codigo.jpeg", qrCompleto: "/pagos/plin-qr.jpeg", logo: "/pagos/plin-logo.png" },
    cuentas: [
      { banco: "Interbank", moneda: "Soles", numero: "898 3502467630", cci: "00389801350246763040", titular: "Jean Marco Leonel Labra" },
      { banco: "Scotiabank", moneda: "Soles", numero: "7407474266", cci: "00941720740747426672", titular: "Jean Marco Leonel Labra" },
    ],
  },
  formasPago: ["Yape", "Plin", "Transferencia", "Contra entrega"],
};

export function linkWhatsApp(texto = "") {
  const base = `https://wa.me/${TIENDA.whatsapp}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
