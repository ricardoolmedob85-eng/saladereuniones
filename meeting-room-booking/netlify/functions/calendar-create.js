const { getCalendarClient, getCalendarId, jsonResponse } = require('./_googleClient');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  try {
    const { summary, description, startISO, endISO, attendees = [] } = JSON.parse(event.body || '{}');

    if (!summary || !startISO || !endISO) {
      return jsonResponse(400, { error: 'Faltan campos obligatorios (summary, startISO, endISO).' });
    }

    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    const response = await calendar.events.insert({
      calendarId,
      sendUpdates: 'all', // envía la invitación/confirmación estándar por correo
      requestBody: {
        summary,
        description: description || '',
        start: { dateTime: startISO },
        end: { dateTime: endISO },
        attendees: attendees.map((email) => ({ email })),
        reminders: { useDefault: true },
      },
    });

    return jsonResponse(200, {
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    });
  } catch (err) {
    console.error('calendar-create error:', err);
    return jsonResponse(500, { error: err.message || 'Error al crear el evento en Google Calendar.' });
  }
};
