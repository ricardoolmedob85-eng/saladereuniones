import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarPlus, Clock, Mail, Users, FileText } from 'lucide-react';
import RoomSelector from './RoomSelector';
import { AMENITIES, getRoomById, BOOKING_RULES } from '../../config/rooms';
import { useAuth } from '../../context/AuthContext';
import { combineDateTime, validateBookingTime, findCollision, todayISODate, maxAdvanceISODate } from '../../utils/dateValidation';
import { createBookingDoc } from '../../services/bookingService';
import { createCalendarEvent } from '../../services/calendarService';

const emptyAmenities = AMENITIES.reduce((acc, a) => ({ ...acc, [a.id]: false }), {});

export default function BookingForm({ bookings, onCreated }) {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [organizerName, setOrganizerName] = useState(user?.name || '');
  const [guestsRaw, setGuestsRaw] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [amenities, setAmenities] = useState(emptyAmenities);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const minDate = useMemo(() => todayISODate(), []);
  const maxDate = useMemo(() => maxAdvanceISODate(), []);

  const toggleAmenity = (id) => setAmenities((prev) => ({ ...prev, [id]: !prev[id] }));

  const resetForm = () => {
    setRoomId('');
    setTitle('');
    setGuestsRaw('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setAmenities(emptyAmenities);
  };

  const parseGuestEmails = (raw) =>
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    const errors = [];
    if (!roomId) errors.push('Selecciona una sala.');
    if (!title.trim()) errors.push('Indica el título de la reunión.');
    if (!organizerName.trim()) errors.push('Indica el nombre del organizador.');

    const guestEmails = parseGuestEmails(guestsRaw);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidGuests = guestEmails.filter((email) => !emailRegex.test(email));
    if (invalidGuests.length > 0) {
      errors.push(`Correo(s) de invitados inválido(s): ${invalidGuests.join(', ')}`);
    }

    const timeCheck = validateBookingTime({ date, startTime, endTime });
    if (!timeCheck.valid) errors.push(...timeCheck.errors);

    if (timeCheck.valid && roomId) {
      const roomBookings = bookings.filter((b) => b.roomId === roomId);
      const collision = findCollision(timeCheck.start, timeCheck.end, roomBookings);
      if (collision) {
        errors.push(
          `Ya existe una reserva en esta sala de ${collision.start.toLocaleTimeString('es-BO', {
            hour: '2-digit',
            minute: '2-digit',
          })} a ${collision.end.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })} ("${collision.title}"). Elige otro horario o sala.`
        );
      }
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    const room = getRoomById(roomId);
    try {
      // 1. Crear el evento en el calendario centralizado (envía la invitación por correo)
      const calendarResult = await createCalendarEvent({
        roomName: room.name,
        title: title.trim(),
        description: `Reservado por ${organizerName} vía App de Reservas de Salas.\nEquipamiento: ${AMENITIES.filter(
          (a) => amenities[a.id]
        )
          .map((a) => a.label)
          .join(', ') || 'Ninguno'}`,
        start: timeCheck.start,
        end: timeCheck.end,
        organizerEmail: user.email,
        guestEmails,
      });

      // 2. Guardar la reserva en Firestore (fuente de verdad para colisiones y "Mis Reservas")
      await createBookingDoc({
        roomId,
        title: title.trim(),
        organizerName: organizerName.trim(),
        organizerEmail: user.email,
        guestEmails,
        start: timeCheck.start,
        end: timeCheck.end,
        amenities,
        calendarEventId: calendarResult.eventId,
      });

      toast.success('¡Reserva confirmada! Se envió la invitación por correo.');
      resetForm();
      onCreated?.();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'No se pudo completar la reserva. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">1. Sala</h3>
        <RoomSelector value={roomId} onChange={setRoomId} />
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-ink-600 mb-1.5 flex items-center gap-1">
            <FileText size={13} /> Título de la reunión
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Revisión de presupuesto Q3"
            className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-600 mb-1.5">Organizador</label>
          <input
            type="text"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-600 mb-1.5 flex items-center gap-1">
            <Mail size={13} /> Correo del organizador
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-ink-50 text-sm text-ink-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-ink-600 mb-1.5 flex items-center gap-1">
            <Users size={13} /> Invitados (correos separados por comas)
          </label>
          <input
            type="text"
            value={guestsRaw}
            onChange={(e) => setGuestsRaw(e.target.value)}
            placeholder="persona1@empresa.com, persona2@empresa.com"
            className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-400"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3 flex items-center gap-1">
          <Clock size={13} /> 2. Fecha y horario
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1.5">Fecha</label>
            <input
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1.5">Inicio</label>
            <input
              type="time"
              value={startTime}
              min="08:00"
              max="19:59"
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1.5">Fin</label>
            <input
              type="time"
              value={endTime}
              min="08:00"
              max="20:00"
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-400"
            />
          </div>
        </div>
        <p className="text-[11px] text-ink-400 mt-2">
          Horario permitido desde las 08:00, duración máxima de {BOOKING_RULES.MAX_DURATION_MINUTES / 60} horas,
          hasta {BOOKING_RULES.MAX_ADVANCE_DAYS} días de anticipación.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">3. Equipamiento e insumos</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {AMENITIES.map((a) => (
            <label
              key={a.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                amenities[a.id] ? 'border-ink-900 bg-ink-50' : 'border-ink-200 hover:border-ink-300'
              }`}
            >
              <input
                type="checkbox"
                checked={amenities[a.id]}
                onChange={() => toggleAmenity(a.id)}
                className="w-4 h-4 rounded accent-ink-900"
              />
              <span className="text-sm font-medium text-ink-700">{a.label}</span>
            </label>
          ))}
        </div>
      </section>

      {formErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 space-y-1">
          {formErrors.map((err, i) => (
            <p key={i} className="text-sm text-red-600">
              • {err}
            </p>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-ink-900 hover:bg-ink-800 text-white font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-60"
      >
        <CalendarPlus size={17} />
        {submitting ? 'Confirmando reserva…' : 'Confirmar Reserva'}
      </button>
    </form>
  );
}
