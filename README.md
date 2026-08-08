# Carta sorpresa

Una experiencia romántica interactiva ambientada en un pantano nocturno de cuento. Incluye una carta original, una pregunta respetuosa con respuestas libres, escenas distintas para “Sí” y “No”, animación accesible y notificaciones privadas por correo.

## Configuración de la sorpresa

### 1. Dónde está la carta

La carta mostrada por el sitio está en `public/assets/images/mi-carta.png`. Es una copia con nombre estable del PNG original colocado en la raíz del proyecto. El contenido de la imagen no fue alterado. Para cambiarla, reemplaza ese archivo conservando el mismo nombre; se recomienda una imagen vertical PNG o WebP de alta resolución.

### 2. Cómo cambiar textos

Los textos de la bienvenida, la pregunta y las respuestas están en `app/surprise.tsx`. La carta no se transcribe ni se modifica en ese archivo: siempre se carga desde la imagen anterior.

### 3. Cómo agregar música

Coloca un MP3 en `public/assets/music/romantic-theme.mp3`. El control de sonido aparecerá automáticamente cuando el archivo exista. La página jamás intenta reproducir música antes de una interacción; en la escena de respuesta afirmativa puede comenzar después de pulsar “Sí”.

### 4. Cómo configurar Gmail y notificaciones

El navegador envía eventos básicos al endpoint privado `/api/notify`. El servidor usa Resend para entregar los mensajes a Gmail. Crea una cuenta en Resend, verifica el remitente si usarás un dominio propio y configura las tres variables indicadas abajo. No coloques claves dentro de `app/surprise.tsx` ni en ningún archivo público.

Se registran una sola vez por sesión, de forma razonable: apertura, llegada a la carta, respuesta “Sí” y respuesta “No”. Los datos se limitan a evento, fecha/hora, respuesta, navegador, idioma, pantalla aproximada e identificador anónimo de sesión. No se solicita ubicación, cámara, micrófono, contactos ni datos sensibles.

### 5. Variables de entorno

Copia `.env.example` como `.env.local` para desarrollo y completa:

```env
NOTIFICATION_EMAIL=tu_cuenta@gmail.com
RESEND_API_KEY=re_xxxxxxxxx
FROM_EMAIL=Sorpresa <onboarding@resend.dev>
```

`.env.local` está ignorado por Git. En Render, agrega esos mismos nombres desde el panel de Environment del servicio.

### 6. Cómo desplegar

El repositorio incluye `render.yaml`. En Render elige **New → Blueprint**, conecta este repositorio y confirma el servicio. Render pedirá los tres secretos marcados como privados. El proyecto requiere Node 22.13 o posterior.

Para desarrollo local usa `pnpm install` y `pnpm run dev`. Para validar producción usa `pnpm run build`.

### 7. Reiniciar la experiencia

Abre la URL agregando `?reset=true`. Esto borra únicamente el estado local cuyos nombres comienzan por `storybook-`, reinicia la experiencia y después limpia el parámetro de la dirección.

### 8. Modo de vista previa

Abre la URL agregando `?preview=true`. Aparecerá una barra discreta para saltar entre Inicio, Carta, Pregunta, Sí y No. La barra no aparece en el modo normal. Los parámetros se pueden combinar como `?reset=true&preview=true`.

## Accesibilidad y privacidad

La experiencia responde a `prefers-reduced-motion`, admite navegación con teclado, mantiene botones táctiles amplios y no mueve ni bloquea la respuesta “No”. El almacenamiento del navegador se limita a la sesión anónima, deduplicación de eventos y progreso visto.
