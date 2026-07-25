# Reserva de Salas de Reuniones — App Interna

React + Tailwind + Firebase (Auth/Firestore) + Google Calendar, lista para desplegar en Netlify.

Salas: **Sala Jobs** (P14), **Sala SCOTT** (P12), **Sala Bezos** (P12), **Sala Gates** (P12).

---

## ⚠️ Nota técnica importante (léela antes de configurar)

Pediste conectar Google Calendar "utilizando una API Key". Eso funciona para **leer**
calendarios **públicos**, pero la API de Google Calendar **no permite crear ni
modificar eventos con una simple API Key** (Google lo bloquea por diseño: escribir
requiere una identidad autenticada, no solo una clave).

Para que la app pueda **crear el evento, invitar automáticamente al organizador e
invitados, y enviar la confirmación estándar por correo** (requisito 4), esta
implementación usa una **Service Account de Google Cloud** en vez de una API Key
suelta. Es igual de "centralizada" (un solo calendario, una sola credencial para
toda la oficina) pero sí funciona para escritura. Las credenciales de la Service
Account viven únicamente en el backend (**Netlify Functions**), nunca en el
navegador — así que siguen sin exponerse al cliente, igual que pediste con el
`.env`.

En resumen: mismo resultado que pediste (1 calendario centralizado, invitaciones
automáticas por correo, lectura en tiempo real), pero con la credencial correcta
para que realmente funcione.

---

## 1. Estructura del proyecto

```
meeting-room-booking/
├── netlify/functions/       # Backend serverless: habla con Google Calendar
├── src/
│   ├── config/               # firebaseConfig.js, rooms.js, authorizedUsers.js
│   ├── context/AuthContext.jsx
│   ├── services/              # bookingService.js (Firestore), calendarService.js (Calendar)
│   ├── components/            # Login, Booking, CalendarView, MyBookings, Layout, common
│   ├── hooks/useBookings.js
│   └── utils/dateValidation.js
├── scripts/seedUsers.cjs      # crea los 4 usuarios en Firebase Auth (uso local)
├── firestore.rules / firestore.indexes.json
├── netlify.toml
└── .env.example
```

---

## 2. Configurar Firebase (Auth + Firestore)

1. Crea un proyecto en https://console.firebase.google.com
2. **Authentication** → pestaña **Sign-in method** → habilita el proveedor **Correo/contraseña**.
3. **Firestore Database** → crear base de datos (modo producción).
4. Despliega las reglas de seguridad incluidas:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # selecciona tu proyecto, usa los archivos ya incluidos
   firebase deploy --only firestore:rules,firestore:indexes
   ```
5. **Configuración del proyecto → General**, copia las claves del "SDK de
   Firebase para la Web" a tu `.env` (prefijo `VITE_FIREBASE_...`).
6. Crea los 4 usuarios autorizados:
   - **Opción rápida (manual):** Authentication → Users → Add user, para cada
     correo/contraseña que definas.
   - **Opción con script:** Configuración del proyecto → Cuentas de servicio →
     Generar nueva clave privada → guárdala como `service-account.json` en la
     raíz (ya está en `.gitignore`) → `npm run seed:users`.
   - Edita `src/config/authorizedUsers.js` si quieres cambiar los 4 correos o
     nombres visibles (admin vs. usuario normal).

**Credenciales de prueba** (definidas en `scripts/seedUsers.cjs`, cámbialas):

| Rol    | Correo                  | Contraseña      |
|--------|--------------------------|-----------------|
| Admin  | admin@empresa.com        | Admin#2026      |
| Usuario| usuario1@empresa.com     | Usuario1#2026   |
| Usuario| usuario2@empresa.com     | Usuario2#2026   |
| Usuario| usuario3@empresa.com     | Usuario3#2026   |

---

## 3. Configurar Google Calendar (Service Account)

1. Ve a https://console.cloud.google.com y crea (o reutiliza) un proyecto.
2. **APIs y servicios → Biblioteca** → busca "Google Calendar API" → **Habilitar**.
3. **APIs y servicios → Credenciales → Crear credenciales → Cuenta de servicio**.
   Dale un nombre (ej. `salas-calendar-bot`) y créala.
4. Entra a la cuenta de servicio creada → pestaña **Claves** → **Agregar clave →
   Crear clave nueva → JSON**. Se descarga un archivo JSON: ahí están
   `client_email` y `private_key`.
5. Crea (o usa) el **calendario centralizado** en https://calendar.google.com:
   - Configuración del calendario → **Compartir con determinadas personas** →
     agrega el `client_email` de la Service Account (termina en
     `...gserviceaccount.com`) con permiso **"Hacer cambios en los eventos"**.
   - En "Integrar calendario" copia el **ID del calendario**
     (ej. `xxxxxx@group.calendar.google.com`).
6. Con esos 3 datos completa en tu `.env` (y en Netlify, ver paso 5):
   ```
   GOOGLE_CALENDAR_ID=xxxxxx@group.calendar.google.com
   GOOGLE_SERVICE_ACCOUNT_EMAIL=salas-calendar-bot@tu-proyecto.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   VITE_GOOGLE_CALENDAR_ID=xxxxxx@group.calendar.google.com
   ```
   > La `PRIVATE_KEY` debe pegarse **con los `\n` literales** (no saltos de
   > línea reales) cuando la guardes como variable de entorno de Netlify.

---

## 4. Ejecutar en local

```bash
npm install
cp .env.example .env      # completa todas las variables
netlify dev                # sirve el front + las Netlify Functions juntas
```

> Usa `netlify dev` (no `npm run dev` solo) para que las Netlify Functions
> (`/.netlify/functions/...`) funcionen en local. Instala la CLI con
> `npm install -g netlify-cli` si no la tienes.

---

## 5. Desplegar en Netlify (GitHub → Netlify)

1. Sube este proyecto a un repositorio de GitHub.
2. En https://app.netlify.com → **Add new site → Import an existing project**
   → conecta tu repo de GitHub.
3. Build settings (ya vienen en `netlify.toml`, no deberías tocarlas):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. **Site settings → Environment variables** → agrega TODAS las variables de
   tu `.env` (las `VITE_...` y también las del backend: `GOOGLE_CALENDAR_ID`,
   `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`).
5. **Deploy site**. Netlify construirá el front y publicará automáticamente las
   funciones en `/.netlify/functions/*`.

---

## 6. Funcionalidades implementadas

- **Login** con Firebase Auth, restringido a 4 correos predefinidos
  (`src/config/authorizedUsers.js`).
- **Reserva**: sala, título, organizador, invitados, fecha/hora, checkboxes de
  equipamiento (proyector/TV, videoconferencia, café, saladitos).
- **Validaciones**: desde las 08:00, máx. 2 horas, máx. 15 días de
  anticipación, verificación de colisión de horario por sala en tiempo real
  (`src/utils/dateValidation.js`).
- **Google Calendar**: cada reserva crea un evento etiquetado `[Sala X] Título`,
  invita al organizador + invitados (`sendUpdates: 'all'` = correo automático
  de Calendar), y se sincroniza al reagendar/cancelar.
- **Calendario visual**: vista mes/semana/día/agenda (`react-big-calendar`) con
  colores por sala: Jobs azul, SCOTT esmeralda, Bezos ámbar, Gates violeta.
- **Mis Reservas**: listado de próximas reservas y historial, con **Cancelar**
  (borra el evento de Calendar + marca `status: cancelled` en Firestore) y
  **Reagendar** (valida la nueva sala/horario contra colisiones antes de
  guardar).

## 7. Notas de seguridad

- Las claves de Firebase (`VITE_FIREBASE_*`) son públicas por diseño (así
  funciona el SDK web de Firebase); lo que realmente protege los datos son las
  **reglas de Firestore** (`firestore.rules`), que exigen sesión autenticada.
- La Service Account de Google **nunca** se expone al navegador: solo vive
  como variable de entorno de las Netlify Functions.
- Si más adelante quieres reforzar el acceso (por ejemplo, restringir el
  dominio de correo permitido), puedes ampliar `firestore.rules` o agregar
  Firebase App Check.
