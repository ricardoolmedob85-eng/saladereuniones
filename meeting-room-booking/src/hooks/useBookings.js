import { useEffect, useState } from 'react';
import { subscribeToBookings, subscribeToUserBookings } from '../services/bookingService';

/**
 * Todas las reservas activas + canceladas de la organización, en tiempo real.
 * Se usa para el calendario general y para la verificación de colisiones.
 */
export function useAllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToBookings(
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('No se pudieron cargar las reservas.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { bookings, loading, error };
}

/**
 * Reservas del usuario autenticado, en tiempo real ("Mis Reservas").
 */
export function useMyBookings(userEmail) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userEmail) return;
    const unsubscribe = subscribeToUserBookings(
      userEmail,
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('No se pudieron cargar tus reservas.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [userEmail]);

  return { bookings, loading, error };
}
