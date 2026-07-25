import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getRoomById, ROOMS } from '../../config/rooms';
import Modal from '../common/Modal';
import RoomBadge from '../common/RoomBadge';
import StatusBadge from '../common/StatusBadge';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

const MESSAGES = {
  today: 'Hoy',
  previous: 'Anterior',
  next: 'Siguiente',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Reserva',
  noEventsInRange: 'No hay reservas en este rango.',
};

export default function CalendarView({ bookings }) {
  const [selected, setSelected] = useState(null);
  const [roomFilter, setRoomFilter] = useState('all');

  const events = useMemo(
    () =>
      bookings
        .filter((b) => b.status !== 'cancelled')
        .filter((b) => roomFilter === 'all' || b.roomId === roomFilter)
        .map((b) => ({
          id: b.id,
          title: `${getRoomById(b.roomId)?.name || b.roomId} · ${b.title}`,
          start: b.start,
          end: b.end,
          resource: b,
        })),
    [bookings, roomFilter]
  );

  const eventStyleGetter = (event) => {
    const room = getRoomById(event.resource.roomId);
    return {
      style: {
        backgroundColor: room?.color || '#334155',
        color: 'white',
      },
    };
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setRoomFilter('all')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            roomFilter === 'all' ? 'bg-ink-900 text-white border-ink-900' : 'border-ink-200 text-ink-600 hover:border-ink-300'
          }`}
        >
          Todas las salas
        </button>
        {ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => setRoomFilter(room.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={
              roomFilter === room.id
                ? { backgroundColor: room.color, borderColor: room.color, color: 'white' }
                : { borderColor: room.border, color: room.color, backgroundColor: room.bg }
            }
          >
            {room.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-3 sm:p-4">
        <div style={{ height: 640 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.WEEK}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            messages={MESSAGES}
            culture="es"
            min={new Date(1970, 0, 1, 7, 0)}
            max={new Date(1970, 0, 1, 20, 30)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelected(event.resource)}
            popup
          />
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''}>
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <RoomBadge roomId={selected.roomId} />
              <StatusBadge status={selected.status} />
            </div>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-ink-500">Organizador</dt>
                <dd className="font-medium text-ink-900">{selected.organizerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Fecha</dt>
                <dd className="font-medium text-ink-900">
                  {selected.start.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Horario</dt>
                <dd className="font-medium text-ink-900">
                  {selected.start.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {selected.end.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                </dd>
              </div>
              {selected.guestEmails?.length > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500 shrink-0">Invitados</dt>
                  <dd className="font-medium text-ink-900 text-right">{selected.guestEmails.join(', ')}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
