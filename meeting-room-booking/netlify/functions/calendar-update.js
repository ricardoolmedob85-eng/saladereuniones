const { getCalendarClient, getCalendarId, jsonResponse } = require('./_googleClient');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  try {
    const { eventId, summary, startISO, endISO } = JSON.parse(event.body || '{}');

    if (!eventId || !startISO || !endISO) {
      return jsonResponse(400, { error: 'Faltan campos obligatorios (eventId, startISO, endISO).' });
    }

    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    const requestBody = {
      start: { dateTime: startISO },
      end: { dateTime: endISO },
    };
    if (summary) requestBody.summary = summary;

    const response = await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: 'all',
      requestBody,
    });

    return jsonResponse(200, { eventId: response.data.id, htmlLink: response.data.htmlLink });
  } catch (err) {
    console.error('calendar-update error:', err);
    return jsonResponse(500, { error: err.message || 'Error al actualizar el evento en Google Calendar.' });
  }
};
