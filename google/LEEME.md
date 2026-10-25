# Control de ventas, stock, ganancias y reseñas con Google

Todo se lleva en **un solo archivo**: la hoja de Google **FerreCenter - Ventas**.

| Pestaña | Qué tiene | Quién la llena |
|---|---|---|
| **Resumen** | Ventas y ganancia del mes, ventas por canal y por mes, productos más vendidos, stock bajo | Se calcula sola |
| **Ventas** | Una fila por venta: N° de pedido, canal (lista desplegable), estado, cliente, entrega, total | La web (solo) y el formulario "Registrar venta" |
| **Detalle** | Una fila por producto vendido: cantidad, precio, costo y ganancia | Sola |
| **Productos** | Costo, precio, precio de oferta, stock inicial, entradas, vendidos, stock actual y alerta | Tú: costo, precio, oferta, stock inicial y stock mínimo. El resto se calcula solo |
| **Entradas** | Mercadería que compras al proveedor | El formulario "Registrar compra" (o a mano) |
| **Reseñas** | Calificaciones de los clientes | La web; tú apruebas |

## Quién manda en precios y stock

**La pestaña Productos manda.** El precio, el precio de oferta y el stock que ve el cliente en la web salen de ahí.
El Excel del catálogo queda para nombres, descripciones, fotos y especificaciones.
Para que un producto nuevo del Excel aparezca en la hoja: `npm run sincronizar-google` (lo hago yo cuando cargamos productos).

- **Stock actual** = Stock inicial + Entradas − Vendidos. Los pedidos *Pendientes* ya descuentan stock; los *Cancelados* no.
- **Ganancia** = precio cobrado − costo. Solo cuenta ventas *Pagadas* o *Entregadas*.
- El costo de cada venta se guarda en el momento: si luego sube el costo, la ganancia de ventas pasadas no cambia.

## Instalación (una sola vez)

1. Crea la hoja **FerreCenter - Ventas** en <https://sheets.new>.
2. **Extensiones → Apps Script**, borra lo que haya y pega el código de `google/Codigo.gs` (te lo dejo copiado con la clave de sincronización ya puesta).
3. Elige la función **configurar** y presiona **▶ Ejecutar**. Acepta los permisos (**Configuración avanzada → Ir a FerreCenter registro → Permitir**).
4. **Implementar → Nueva implementación → ⚙ Aplicación web** — Ejecutar como: **Yo** · Acceso: **Cualquier usuario** → copia la URL que termina en `/exec` y pásamela.

### Si ya estaba instalado y te paso una versión nueva del código
1. Pega el código nuevo en el editor (Ctrl + A, Ctrl + V) y guarda (Ctrl + S).
2. Ejecuta **configurar** otra vez (no borra tus datos) y acepta los permisos nuevos si los pide.
3. **Implementar → Gestionar implementaciones → ✏ (lápiz) → Versión: Nueva versión → Implementar.** La URL no cambia.

## Actualizar la web con el precio y el stock de la hoja

La web toma los datos de la hoja **cada vez que se publica**. Para no depender de mí:

1. En Netlify: **Site configuration → Build & deploy → Build hooks → Add build hook** (nombre: `Hoja de Google`, rama `main`) → copia el enlace.
2. En la hoja: menú **FerreCenter → Guardar enlace de Netlify** → pégalo.

Desde entonces:
- **FerreCenter → Actualizar la web** publica al momento (tarda ~2 minutos).
- Además se actualiza sola **todos los días a las 7 a. m.**

## Día a día

- **Venta por la web:** llega a tu WhatsApp con su N° de pedido y aparece en **Ventas** como *Pendiente*. Cámbiala a *Pagado* → *Entregado* (o *Cancelado*).
- **Venta en tienda, WhatsApp directo, Facebook…:** formulario **Registrar venta** desde el celular. Eliges el canal, los productos (de una lista) y la cantidad. Si diste descuento, pon el total cobrado.
- **Llegó mercadería:** formulario **Registrar compra**: producto, cantidad y costo. Suma al stock y actualiza el costo.
- **¿Agregaste productos nuevos a la hoja?** Menú **FerreCenter → Actualizar listas de productos** para que salgan en los formularios.
- **Enlaces de los formularios:** menú **FerreCenter → Ver enlaces de los formularios**.

## Reseñas
1. Marca el pedido como **Entregado**.
2. Envíale al cliente: `https://ferrecenter.netlify.app/calificar?pedido=FC-…` (con su número de pedido).
3. Las calificaciones llegan a **Reseñas** con *Aprobada = No*. Cámbialas a **Sí** para publicarlas (salen al instante).
