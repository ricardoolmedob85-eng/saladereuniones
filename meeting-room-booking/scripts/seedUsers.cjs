/**
 * Script de un solo uso, LOCAL, para crear los 4 usuarios autorizados en
 * Firebase Authentication. No se despliega ni se sube al repositorio.
 *
 * Uso:
 *   1. Descarga una clave de Service Account desde:
 *      Firebase Console > Configuración del proyecto > Cuentas de servicio
 *      > Generar nueva clave privada. Guárdala como service-account.json
 *      en la raíz del proyecto (ya está en .gitignore).
 *   2. Ejecuta: npm run seed:users
 */
const admin = require('firebase-admin');
const path = require('path');

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH || './service-account.json';
const serviceAccount = require(path.resolve(process.cwd(), keyPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Credenciales de prueba — CÁMBIALAS antes o después del primer login.
const USERS_TO_CREATE = [
  { email: 'admin@empresa.com', password: 'Admin#2026', displayName: 'Administración' },
  { email: 'usuario1@empresa.com', password: 'Usuario1#2026', displayName: 'Usuario 1' },
  { email: 'usuario2@empresa.com', password: 'Usuario2#2026', displayName: 'Usuario 2' },
  { email: 'usuario3@empresa.com', password: 'Usuario3#2026', displayName: 'Usuario 3' },
];

async function run() {
  for (const u of USERS_TO_CREATE) {
    try {
      const existing = await admin.auth().getUserByEmail(u.email).catch(() => null);
      if (existing) {
        console.log(`Ya existe: ${u.email} (uid: ${existing.uid}) — se omite.`);
        continue;
      }
      const created = await admin.auth().createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
        emailVerified: true,
      });
      console.log(`Creado: ${u.email} (uid: ${created.uid})`);
    } catch (err) {
      console.error(`Error creando ${u.email}:`, err.message);
    }
  }
  console.log('\nListo. Recuerda actualizar las contraseñas reales y compartirlas de forma segura con el equipo.');
  process.exit(0);
}

run();
