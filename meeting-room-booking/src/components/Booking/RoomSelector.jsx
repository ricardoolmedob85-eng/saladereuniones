import React from 'react';
import { Users, Building2, Check } from 'lucide-react';
import { ROOMS } from '../../config/rooms';

export default function RoomSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ROOMS.map((room) => {
        const active = value === room.id;
        return (
          <button
            type="button"
            key={room.id}
            onClick={() => onChange(room.id)}
            className={`relative text-left p-3.5 rounded-xl border-2 transition-all ${
              active ? 'shadow-card' : 'border-ink-100 hover:border-ink-200'
            }`}
            style={active ? { borderColor: room.color, backgroundColor: room.bg } : {}}
          >
            {active && (
              <span
                className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: room.color }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
            )}
            <p className="font-display font-bold text-sm text-ink-900">{room.name}</p>
            <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-ink-500 font-medium">
              <span className="flex items-center gap-1">
                <Building2 size={12} /> Piso {room.floor} · Sala {room.size}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} /> {room.capacity}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
