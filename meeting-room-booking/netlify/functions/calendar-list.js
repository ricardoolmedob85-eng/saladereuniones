const { getCalendarClient, getCalendarId, jsonResponse } = require('./_googleClient');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  try {
    const { timeMinISO, timeMaxISO } = JSON.parse(event.body || '{}');

    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMinISO || new Date().toISOString(),
      timeMax: timeMaxISO,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    });

    const events = (response.data.items || []).map((e) => ({
      id: e.id,
      summary: e.summary,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      htmlLink: e.htmlLink,
    }));

    return jsonResponse(200, { events });
  } catch (err) {
    console.error('calendar-list error:', err);
    return jsonResponse(500, { error: err.message || 'Error al leer eventos de Google Calendar.' });
  }
};
