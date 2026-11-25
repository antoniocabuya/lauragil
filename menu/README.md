# Menú · Mi grado

Página de una sola vista para elegir el menú y confirmar la asistencia al grado de Laura Sofía Gil Díaz. Es HTML, CSS y JavaScript sin dependencias: se puede abrir desde cualquier hosting estático.

## Ver en local

```bash
python3 -m http.server 8090 --directory menu
```

Abre `http://localhost:8090`. No necesita `npm` ni compilación.

En el celular, desliza las tarjetas de platos (o usa las flechas) para cambiar de plato. La página está pensada para pantallas táctiles: el deslizamiento sigue el dedo y un gesto rápido avanza; el desplazamiento vertical de la página sigue funcionando.

## Conectar el Google Form (importante)

Sin esto la página funciona en **modo demo**: muestra el gracias, pero no guarda nada.

1. Crea un Form nuevo con estos campos, en este orden:
   - **Nombre** · respuesta corta · obligatorio
   - **Personas** · número · obligatorio
   - **A**, **B**, **C**, **D**, **E** · número · obligatorios (aceptan 0)
   - **Alergias o notas** · respuesta corta · opcional
2. En el Form: **Respuestas → Vincular a Hojas de cálculo**. Ahí quedan todas las respuestas.
3. Abre el Form publicado y busca en el código fuente `formResponse` y los `entry.XXXX`. También sirve **⋮ → Obtener enlace pre-rellenado**.
4. Pega los datos en `app.js`:

```js
const CONFIG = {
  formAction: "https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse",
  entries: {
    name: "entry.111111111",
    party: "entry.222222222",
    a: "entry.333333333",
    b: "entry.444444444",
    c: "entry.555555555",
    d: "entry.666666666",
    e: "entry.777777777",
    notes: "entry.888888888"
  }
};
```

5. Envía una respuesta de prueba desde la página y revisa la hoja.

La página envía con `fetch(..., { mode: "no-cors" })`, igual que el formulario anterior: el navegador no puede leer la respuesta de Google, así que el «gracias» es optimista. Si quieres estar seguro, revisa la hoja después de la primera respuesta real.

El Form también sirve como plan B: compártelo si alguien no puede usar la página.

## Publicar

Sube el contenido de `menu/` al repo de GitHub Pages (por ejemplo `antoniocabuya/lauragil`) y activa Pages. Las rutas son relativas, así que funciona tanto en la raíz como en `/menu/`.

Prueba en el celular antes de compartir: la portada, elegir dos platos y confirmar.

## Editar

- **Platos y descripciones**: `DISHES` al inicio de `app.js`.
- **Fotos de los platos**: `fotos/platos/`, de Pexels (licencia libre). Si cambias una, mantén el nombre o ajusta `img` en `DISHES`.
- **Fecha, lugar, plazo y textos**: `index.html`.
- **Colores y tipografía**: variables al inicio de `style.css`.
- **Fondo**: gradientes animados en `style.css` (`.aurora`) y luces/confeti en `app.js`. Sin imágenes.
- **Fuentes**: `fonts/`, autocontenidas.

Si alguien edita su respuesta, se crea una fila nueva en la hoja: borra la anterior a mano. Para el grado alcanza con revisar la hoja el día antes.
