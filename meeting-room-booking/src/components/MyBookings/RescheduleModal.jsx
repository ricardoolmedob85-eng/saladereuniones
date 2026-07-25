import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import RoomSelector from '../Booking/RoomSelector';
import { validateBookingTime, findCollision, todayISODate, maxAdvanceISODate } from '../../utils/dateValidation';
import { rescheduleBookingDoc } from '../../services/bookingService';
import { updateCalendarEvent } from '../../services/calendarService';
import { getRoomById } from '../../config/rooms';

function toDateInputValue(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}
function toTimeInputValue(date) {
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
}

export default function RescheduleModal({ booking, allBookings, onClose, onDone }) {
  const [roomId, setRoomId] = useState(booking.roomId);
  const [date, setDate] = useState(toDateInputValue(booking.start));
  const [startTime, setStartTime] = useState(toTimeInputValue(booking.start));
  const [endTime, setEndTime] = useState(toTimeInputValue(booking.end));
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const minDate = useMemo(() => todayISODate(), []);
  const maxDate = useMemo(() => maxAdvanceISODate(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const timeCheck = validateBookingTime({ date, startTime, endTime });
    const localErrors = [...timeCheck.errors];

    if (timeCheck.valid) {
      const roomBookings = allBookings.filter((b) => b.roomId === roomId);
      const collision = findCollision(timeCheck.start, timeCheck.end, roomBookings, booking.id);
      if (collision) {
        localErrors.push(`Ese horario ya está ocupado en esta sala ("${collision.title}"). Elige otro horario o sala.`);
      }
    }

    if (localErrors.length > 0) {
      setErrors(localErrors);
      return;
    }

    setSubmitting(true);
    try {
      const room = getRoomById(roomId);
      if (booking.calendarEventId) {
        await updateCalendarEvent({
          eventId: booking.calendarEventId,
          roomName: room.name,
          title: booking.title,
          start: timeCheck.start,
          end: timeCheck.end,
        });
      }
      await rescheduleBookingDoc(booking.id, { roomId, start: timeCheck.start, end: timeCheck.end });
      toast.success('Reserva reagendada correctamente.');
      onDone?.();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'No se pudo reagendar la reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Reagendar: ${booking.title}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <RoomSelector value={roomId} onChange={setRoomId} />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1.5">Fecha</label>
            <input
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20"
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
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20"
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
              className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20"
            />
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 space-y-1">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-red-600">
                • {err}
              </p>
            ))}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-ink-600 hover:bg-ink-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-ink-900 text-white hover:bg-ink-800 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
