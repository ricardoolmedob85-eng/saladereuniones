// Este servicio NUNCA llama a la API de Google Calendar directamente desde el
// navegador. Escribir eventos requiere credenciales de una Service Account, que
// deben permanecer en el servidor. Por eso todas las operaciones pasan por las
// Netlify Functions ubicadas en /netlify/functions (ver README, sección "Por qué
// una Service Account y no solo una API Key").

const FUNCTIONS_BASE = '/.netlify/functions';

async function callFunction(path, payload) {
  const res = await fetch(`${FUNCTIONS_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Error al comunicarse con Google Calendar (${path})`);
  }
  return data;
}

/**
 * Crea un evento en el calendario centralizado, etiquetado con el nombre de la sala.
 * Invita automáticamente al organizador y a los invitados (Calendar envía la
 * notificación estándar por correo).
 */
export function createCalendarEvent({ roomName, title, description, start, end, organizerEmail, guestEmails }) {
  return callFunction('calendar-create', {
    summary: `[${roomName}] ${title}`,
    description,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    attendees: [organizerEmail, ...guestEmails].filter(Boolean),
  });
}

/**
 * Actualiza fecha/hora (y opcionalmente el título) de un evento existente — reagendamiento.
 */
export function updateCalendarEvent({ eventId, roomName, title, start, end }) {
  return callFunction('calendar-update', {
    eventId,
    summary: roomName && title ? `[${roomName}] ${title}` : undefined,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  });
}

/**
 * Elimina (cancela) un evento del calendario centralizado.
 */
export function deleteCalendarEvent({ eventId }) {
  return callFunction('calendar-delete', { eventId });
}

/**
 * Lee los eventos del calendario centralizado en un rango de fechas.
 * Útil como respaldo/auditoría para detectar bloqueos creados fuera de la app
 * directamente en Google Calendar.
 */
export function listCalendarEvents({ timeMinISO, timeMaxISO }) {
  return callFunction('calendar-list', { timeMinISO, timeMaxISO });
}
