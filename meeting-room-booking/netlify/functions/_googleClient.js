const { google } = require('googleapis');

/**
 * Construye un cliente autenticado de Google Calendar usando una Service Account
 * de Google Cloud. Las credenciales viven SOLO como variables de entorno del
 * servidor (Netlify), nunca se exponen al navegador.
 *
 * Requisitos previos (ver README paso 3):
 *  1. Crear un proyecto en Google Cloud y habilitar "Google Calendar API".
 *  2. Crear una Service Account y generar una clave JSON.
 *  3. Compartir el Google Calendar centralizado con el correo de la Service
 *     Account, otorgándole el permiso "Hacer cambios en los eventos".
 */
function getCalendarClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new Error(
      'Faltan credenciales de la Service Account (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) en las variables de entorno de Netlify.'
    );
  }

  // En Netlify, los saltos de línea de la clave privada se guardan como "\n" literal.
  const privateKey = rawKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

function getCalendarId() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error('Falta GOOGLE_CALENDAR_ID en las variables de entorno de Netlify.');
  }
  return calendarId;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

module.exports = { getCalendarClient, getCalendarId, jsonResponse };
