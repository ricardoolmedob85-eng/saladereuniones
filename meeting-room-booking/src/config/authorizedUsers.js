// Lista blanca de los 4 usuarios autorizados de la app.
// Las contraseñas NUNCA se guardan aquí — solo existen en Firebase Authentication.
// Este mapa solo define nombre visible y rol (admin vs. usuario normal).
//
// Cómo crear estos 4 usuarios en Firebase Auth: ver README.md paso 2,
// o ejecutar `npm run seed:users` usando scripts/seedUsers.cjs.
export const AUTHORIZED_USERS = {
  'admin@empresa.com': { name: 'Administración', role: 'admin' },
  'usuario1@empresa.com': { name: 'Usuario 1', role: 'user' },
  'usuario2@empresa.com': { name: 'Usuario 2', role: 'user' },
  'usuario3@empresa.com': { name: 'Usuario 3', role: 'user' },
};

export const isAuthorized = (email) =>
  Object.prototype.hasOwnProperty.call(AUTHORIZED_USERS, (email || '').toLowerCase());

export const getUserProfile = (email) => AUTHORIZED_USERS[(email || '').toLowerCase()] || null;
