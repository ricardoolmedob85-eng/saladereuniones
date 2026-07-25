import React, { useState } from 'react';
import { CalendarClock, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      // authError ya queda seteado por el contexto
    } finally {
      setSubmitting(false);
    }
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4 relative overflow-hidden">
      {/* Acentos decorativos sutiles con los 4 colores de las salas */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-emerald-600/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/10 mb-4">
            <CalendarClock className="text-white" size={26} />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Reserva de Salas</h1>
          <p className="text-ink-400 text-sm mt-1">Piso 14 y Piso 12 · Acceso interno</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl2 shadow-panel p-6 space-y-4 border border-white/5"
        >
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1.5">Correo corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario1@empresa.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-400"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink-900 hover:bg-ink-800 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-ink-500 text-xs mt-5">
          Acceso restringido a los 4 usuarios autorizados de la oficina.
        </p>
      </div>
    </div>
  );
}
