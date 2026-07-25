import {
  addDoc,
  collection,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Suscripción en tiempo real a TODAS las reservas activas (para el calendario general
 * y para la verificación de colisiones). Se filtra "cancelled" en el cliente para
 * poder mostrarlas tachadas si se desea.
 */
export function subscribeToBookings(onChange, onError) {
  const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('start', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          start: data.start?.toDate ? data.start.toDate() : new Date(data.start),
          end: data.end?.toDate ? data.end.toDate() : new Date(data.end),
        };
      });
      onChange(bookings);
    },
    onError
  );
}

/**
 * Suscripción a las reservas de un usuario específico (panel "Mis Reservas").
 */
export function subscribeToUserBookings(userEmail, onChange, onError) {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('organizerEmail', '==', userEmail),
    orderBy('start', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          start: data.start?.toDate ? data.start.toDate() : new Date(data.start),
          end: data.end?.toDate ? data.end.toDate() : new Date(data.end),
        };
      });
      onChange(bookings);
    },
    onError
  );
}

/**
 * Crea una nueva reserva en Firestore. Devuelve el id del documento creado.
 */
export async function createBookingDoc(bookingData) {
  const ref = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    ...bookingData,
    status: 'confirmed',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Guarda el ID del evento de Google Calendar asociado a una reserva.
 */
export async function attachCalendarEventId(bookingId, calendarEventId) {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), { calendarEventId });
}

/**
 * Marca una reserva como cancelada (soft delete) en Firestore.
 */
export async function cancelBookingDoc(bookingId) {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
  });
}

/**
 * Actualiza fecha/hora (y opcionalmente sala) de una reserva existente (reagendamiento).
 */
export async function rescheduleBookingDoc(bookingId, { roomId, start, end }) {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    roomId,
    start,
    end,
    rescheduledAt: serverTimestamp(),
  });
}
