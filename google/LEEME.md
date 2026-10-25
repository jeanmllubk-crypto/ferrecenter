# Registro de ventas y reseñas con Google

Con esto, la tienda guarda sola cada pedido de la web en una hoja de Google, tú anotas las ventas de fuera de la web con un formulario, y los clientes pueden calificar lo que compraron. Todo es gratis y se hace **una sola vez** (unos 10 minutos).

## Paso 1. Crear la hoja

1. Entra a <https://sheets.google.com> con la cuenta de Google de la tienda (por ahora puede ser la tuya).
2. Crea una hoja en blanco y ponle de nombre **FerreCenter - Ventas**.

## Paso 2. Pegar el código

1. En la hoja, ve al menú **Extensiones → Apps Script**. Se abre el editor en otra pestaña.
2. Borra todo lo que aparece en el archivo `Código.gs`.
3. Abre el archivo `google/Codigo.gs` de este proyecto, copia **todo** su contenido y pégalo en el editor.
4. Arriba, cambia el nombre del proyecto de "Proyecto sin título" a **FerreCenter registro**.
5. Guarda con **Ctrl + S**.

## Paso 3. Preparar la hoja (una sola vez)

1. En la barra de arriba del editor, elige la función **configurar** y presiona **▶ Ejecutar**.
2. Google pedirá permiso: **Revisar permisos** → elige tu cuenta → si aparece "Google no verificó esta app", toca **Configuración avanzada** → **Ir a FerreCenter registro (no seguro)** → **Permitir**.
   (Es tu propio código: el aviso sale porque no lo publicó una empresa verificada).
3. Al terminar, abajo en el **Registro de ejecución** aparece el **enlace del formulario "Registrar venta"**. Cópialo y guárdalo en tu celular (por ejemplo, en un chat contigo mismo o como acceso directo en la pantalla de inicio).

En la hoja ahora tienes las pestañas **Ventas** y **Reseñas**.

## Paso 4. Publicar el código como aplicación web

1. En el editor, arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje ⚙ de "Seleccionar tipo", elige **Aplicación web**.
3. Llena así:
   - Descripción: `Tienda`
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
4. Presiona **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
5. Pásame esa URL por el chat y yo la coloco en la tienda (va en `registroUrl` de `lib/config.js`).

> "Cualquier usuario" significa que la tienda puede enviar pedidos y leer las reseñas aprobadas. Nadie puede ver tu hoja: sigue siendo privada.

## Cómo se usa en el día a día

### Pedidos de la web
- Cada pedido llega a tu WhatsApp con su **N° de pedido** (ej. `FC-261025-AB12`) y al mismo tiempo aparece una fila en **Ventas** con estado **Pendiente**.
- Ve cambiando el **Estado**: Pendiente → Pagado → Entregado (o Cancelado si no se concretó).

### Ventas fuera de la web (tienda, WhatsApp directo, Facebook…)
- Abre el formulario **Registrar venta** desde tu celular y llénalo. Se agrega solo a **Ventas** con su canal y estado Entregado.

### Reseñas
1. Cuando entregues un pedido de la web, márcalo como **Entregado** en la hoja.
2. Envíale al cliente por WhatsApp el enlace para calificar, con su número de pedido:
   `https://ferrecenter.netlify.app/calificar?pedido=FC-261025-AB12`
   Ejemplo de mensaje: *"¡Gracias por tu compra! ¿Nos ayudas calificando tus productos? Toma un minuto: (enlace)"*
3. Sus calificaciones aparecen en la pestaña **Reseñas** con **Aprobada = No**.
4. Revísalas y cambia a **Sí** las que quieras publicar. Aparecen en la página del producto al instante.

Solo pueden calificar pedidos de la web que estén **Entregados**, una vez por producto.

## Si cambias el código más adelante

Si te paso una versión nueva de `Codigo.gs`: pégala en el editor, guarda y ve a **Implementar → Gestionar implementaciones → ✏ Editar → Versión: Nueva versión → Implementar**. La URL no cambia.
