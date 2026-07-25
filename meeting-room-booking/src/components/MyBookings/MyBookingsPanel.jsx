import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarX2, RefreshCw, Users, Mail, Coffee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMyBookings } from '../../hooks/useBookings';
import RoomBadge from '../common/RoomBadge';
import StatusBadge from '../common/StatusBadge';
import Spinner from '../common/Spinner';
import RescheduleModal from './RescheduleModal';
import { cancelBookingDoc } from '../../services/bookingService';
import { deleteCalendarEvent } from '../../services/calendarService';
import { AMENITIES } from '../../config/rooms';

export default function MyBookingsPanel({ allBookings }) {
  const { user } = useAuth();
  const { bookings, loading } = useMyBookings(user?.email);
  const [cancellingId, setCancellingId] = useState(null);
  const [rescheduling, setRescheduling] = useState(null);

  const now = new Date();
  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && b.end >= now);
  const past = bookings.filter((b) => b.status === 'cancelled' || b.end < now);

  const handleCancel = async (booking) => {
    if (!window.confirm(`¿Cancelar la reserva "${booking.title}"? Se eliminará del calendario y se notificará a los invitados.`)) {
      return;
    }
    setCancellingId(booking.id);
    try {
      if (booking.calendarEventId) {
        await deleteCalendarEvent({ eventId: booking.calendarEventId });
      }
      await cancelBookingDoc(booking.id);
      toast.success('Reserva cancelada.');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'No se pudo cancelar la reserva.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Spinner label="Cargando tus reservas…" />;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">
          Próximas ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <EmptyState text="No tienes reservas próximas." />
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={() => handleCancel(b)}
                onReschedule={() => setRescheduling(b)}
                cancelling={cancellingId === b.id}
              />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-3">Historial</h3>
          <div className="space-y-3 opacity-70">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} readOnly />
            ))}
          </div>
        </div>
      )}

      {rescheduling && (
        <RescheduleModal
          booking={rescheduling}
          allBookings={allBookings}
          onClose={() => setRescheduling(null)}
          onDone={() => setRescheduling(null)}
        />
      )}
    </div>
  );
}

function BookingCard({ booking, onCancel, onReschedule, cancelling, readOnly }) {
  const activeAmenities = AMENITIES.filter((a) => booking.amenities?.[a.id]);
  return (
    <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <RoomBadge roomId={booking.roomId} size="sm" />
            <StatusBadge status={booking.status} />
          </div>
          <p className="font-display font-bold text-ink-900">{booking.title}</p>
          <p className="text-sm text-ink-500 mt-0.5">
            {booking.start.toLocaleDateString('es-BO', { weekday: 'long', day: '2-digit', month: 'long' })} ·{' '}
            {booking.start.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })} –{' '}
            {booking.end.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {!readOnly && (
          <div className="flex gap-2">
            <button
              onClick={onReschedule}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-600 border border-ink-200 hover:bg-ink-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw size={13} /> Reagendar
            </button>
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
            >
              <CalendarX2 size={13} /> {cancelling ? 'Cancelando…' : 'Cancelar'}
            </button>
          </div>
        )}
      </div>

      {(booking.guestEmails?.length > 0 || activeAmenities.length > 0) && (
        <div className="mt-3 pt-3 border-t border-ink-100 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-500">
          {booking.guestEmails?.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={13} /> {booking.guestEmails.length} invitado(s)
            </span>
          )}
          {activeAmenities.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Coffee size={13} /> {activeAmenities.map((a) => a.label).join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-10 bg-ink-50 rounded-xl2 border border-dashed border-ink-200">
      <Mail className="mx-auto text-ink-300 mb-2" size={22} />
      <p className="text-sm text-ink-400">{text}</p>
    </div>
  );
}
