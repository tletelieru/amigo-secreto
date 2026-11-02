# Plan — Amigo Secreto

App para sortear el amigo secreto sin servidor. El sorteo se hace en el navegador y cada persona recibe un link privado con su resultado. 100% en GitHub Pages.

## Fase 1 — Sin backend

### Crear el grupo

- [x] Evento: nombre, fecha, monto sugerido y nota.
- [x] Participantes con nombre y emoji opcional.
- [x] Exclusiones en ambos sentidos o en uno solo.
- [x] Avisar antes de sortear si las exclusiones lo hacen imposible.

### Sorteo

- [x] Asignación con restricciones: nadie se saca a sí mismo ni a un excluido.
- [x] Reintentos aleatorios y, si fallan, matching bipartito, que resuelve también los casos ajustados.
- [x] Opción de ronda única (A → B → C → … → A), con búsqueda de ciclo acotada.
- [x] Aleatoriedad con `crypto.getRandomValues`.

### Links privados

- [x] Resultado y datos del evento en el hash de la URL, que no se envía al servidor.
- [x] Cifrado AES-GCM con una clave aleatoria por link, también en el hash.
- [x] Página de resultado con sobre que se abre y confeti.

### Link único con Google

- [x] Correo de Google opcional por participante.
- [x] Con todos los correos, un solo link para el grupo. Cada resultado va cifrado con una clave derivada del correo.
- [x] Cada persona entra con Google y ve solo lo suyo, sin servidor.
- [ ] Crear el Client ID de Google, autorizar los orígenes y guardarlo como variable `VITE_GOOGLE_CLIENT_ID` del repo. Sin él, los correos y el link único quedan ocultos.

Es protección para un grupo de amigos: alguien con conocimientos técnicos que conozca otro correo podría descifrar ese resultado.

### Modo "no mirar"

- [x] Quien organiza solo ve la lista con Copiar, Compartir y WhatsApp.
- [x] Advertencia honesta: abrir un link ajeno mostraría el resultado.
- [x] Marcar cada link como enviado, solo en local.

### Guardado

- [x] Grupo en localStorage para reenviar links o rehacer el sorteo.
- [x] Exportar e importar como JSON.
- [x] Listas de participantes guardadas, con sus exclusiones, para reutilizarlas.
- [x] `GroupStore` como punto de extensión para un backend futuro.

### Publicación

- [x] Crear el repo en GitHub y activar Pages.
- [x] Limitar los pull requests a colaboradores al hacerlo público.

## Fase 2 — Backend liviano (opcional)

Supabase o Firebase en free tier, sin servidor propio.

- [ ] Vista única garantizada por el servidor.
- [ ] Guardar el resultado como imagen.
- [ ] Listas de deseos editables.
- [ ] Inscripción por link de invitación.
- [ ] Saber quién ya vio su resultado.
- [ ] Chat anónimo con tu amigo secreto.
- [ ] Alternativa sin backend: lista de deseos fija que viaja en el link.
