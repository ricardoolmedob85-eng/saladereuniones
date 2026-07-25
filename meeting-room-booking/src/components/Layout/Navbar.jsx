import React from 'react';
import { CalendarClock, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'new', label: 'Nueva Reserva' },
  { id: 'calendar', label: 'Calendario' },
  { id: 'mine', label: 'Mis Reservas' },
];

export default function Navbar({ activeTab, onTabChange }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-ink-950 sticky top-0 z-30 border-b border-ink-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <CalendarClock className="text-white" size={18} />
            </div>
            <div className="leading-tight">
              <p className="font-display font-bold text-white text-sm">Reserva de Salas</p>
              <p className="text-ink-400 text-[11px]">Piso 14 · Piso 12</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-right">
              <div className="leading-tight text-right">
                <p className="text-white text-sm font-semibold">{user?.name}</p>
                <p className="text-ink-400 text-[11px] flex items-center gap-1 justify-end">
                  {isAdmin && <ShieldCheck size={12} />}
                  {isAdmin ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-ink-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
