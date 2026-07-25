import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Navbar from './components/Layout/Navbar';
import BookingForm from './components/Booking/BookingForm';
import CalendarView from './components/CalendarView/CalendarView';
import MyBookingsPanel from './components/MyBookings/MyBookingsPanel';
import Spinner from './components/common/Spinner';
import { useAllBookings } from './hooks/useBookings';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('new');
  const { bookings, loading: bookingsLoading } = useAllBookings();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <Spinner label="Cargando…" className="text-white" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-ink-50">
      <Toaster position="top-center" toastOptions={{ style: { fontSize: '14px' } }} />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'new' && (
          <div className="max-w-2xl">
            <h2 className="font-display text-xl font-bold text-ink-900 mb-1">Nueva Reserva</h2>
            <p className="text-sm text-ink-500 mb-6">
              Completa los datos y la reserva quedará bloqueada al instante y sincronizada con Google Calendar.
            </p>
            {bookingsLoading ? (
              <Spinner label="Cargando disponibilidad…" />
            ) : (
              <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5 sm:p-6">
                <BookingForm bookings={bookings} onCreated={() => setActiveTab('mine')} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900 mb-1">Calendario de Salas</h2>
            <p className="text-sm text-ink-500 mb-6">Vista en tiempo real de todas las reservas por sala.</p>
            {bookingsLoading ? <Spinner label="Cargando calendario…" /> : <CalendarView bookings={bookings} />}
          </div>
        )}

        {activeTab === 'mine' && (
          <div className="max-w-2xl">
            <h2 className="font-display text-xl font-bold text-ink-900 mb-1">Mis Reservas</h2>
            <p className="text-sm text-ink-500 mb-6">Gestiona, reagenda o cancela tus reservas activas.</p>
            <MyBookingsPanel allBookings={bookings} />
          </div>
        )}
      </main>
    </div>
  );
}
