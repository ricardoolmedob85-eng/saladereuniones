const { getCalendarClient, getCalendarId, jsonResponse } = require('./_googleClient');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  try {
    const { eventId } = JSON.parse(event.body || '{}');
    if (!eventId) {
      return jsonResponse(400, { error: 'Falta el campo eventId.' });
    }

    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all',
    });

    return jsonResponse(200, { deleted: true });
  } catch (err) {
    // Si el evento ya no existe en Calendar, lo tratamos como éxito para no
    // bloquear la cancelación en Firestore.
    if (err.code === 410 || err.code === 404) {
      return jsonResponse(200, { deleted: true, note: 'El evento ya no existía en Calendar.' });
    }
    console.error('calendar-delete error:', err);
    return jsonResponse(500, { error: err.message || 'Error al eliminar el evento en Google Calendar.' });
  }
};
