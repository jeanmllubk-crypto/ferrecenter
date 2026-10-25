# FerreCenter – Tienda online de herramientas

Next.js 15 + Tailwind CSS 4. Lista para publicar en Vercel.

## Uso diario

1. Edita `Catalogo_Productos_Herramientas.xlsx` (hoja **Productos**, datos desde la fila 4).
2. Guarda las fotos en la carpeta **`fotos`** (o `Imagenes de Productos`) con el nombre que pusiste en la columna *Imagen*.
   - Para varias fotos de un producto: escribe varios nombres separados por coma, o nombra las extra `SKU-2.jpg`, `SKU-3.jpg`…
3. Cierra el Excel y ejecuta:

```bash
npm run productos
```

Solo se publican los productos con **Activo = Sí**. Precio de compra, margen y proveedor **no** se publican en la web.

| Columna del Excel | Dónde aparece en la web |
| --- | --- |
| Destacado = Sí | Banner de portada y primeros lugares en "Más vendidos" |
| Precio oferta | Precio tachado, % de descuento y sección "Ofertas del día" |
| Stock actual = 0 | Etiqueta "Agotado" y botón deshabilitado |
| Filas más abajo | Sección "Nuevos" |
| Subcategoría | Mega menú y filtros |
| Descripción larga (columna Y) | Sección "Descripción del producto" en la ficha. Cada Alt + Enter es un párrafo nuevo; líneas que empiezan con "-" forman una lista; "Importante:" o "Recomendación:" se resaltan |

## Ver en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Datos de la tienda

Teléfono, correo, redes sociales, RUC, dirección, mapa, horario, costo de envío en Tacna y formas de pago: `lib/config.js`.

## Banners de la portada

Textos, colores, productos, fechas de campaña o imágenes propias: `lib/banners.js` (instrucciones al inicio del archivo). Las imágenes propias van en `public/banners/`.

## Libro de Reclamaciones (envío automático)

Los reclamos se envían por correo a la tienda y una copia al cliente usando Gmail. Configura `.env.local` (ver `.env.local.example`) con `GMAIL_USUARIO` y `GMAIL_CLAVE_APP` (contraseña de aplicación de Google). Sin estos datos, el formulario ofrece enviar por WhatsApp o correo.

## Publicar en Vercel

1. Sube esta carpeta a un repositorio de GitHub (incluye el Excel y la carpeta de fotos). El archivo `.env.local` **no** se sube.
2. En vercel.com → *Add New Project* → elige el repositorio → *Deploy*.
3. En *Settings → Environment Variables* agrega:
   - `NEXT_PUBLIC_SITE_URL`: tu dominio (ej. `https://ferrecenter.pe`), para el SEO y las imágenes al compartir.
   - `GMAIL_USUARIO` y `GMAIL_CLAVE_APP`: los mismos de `.env.local`, para el Libro de Reclamaciones.
4. Vuelve a desplegar (*Deployments → Redeploy*) para que tome las variables.

**Mostrar en Google:** mientras `mostrarEnGoogle` sea `false` en `lib/config.js`, la web funciona con el enlace pero Google no la muestra en sus resultados. Cámbialo a `true` cuando la tienda esté lista para el público.

`npm run build` ejecuta automáticamente `npm run productos`, así que Vercel siempre usa el Excel del repositorio.
