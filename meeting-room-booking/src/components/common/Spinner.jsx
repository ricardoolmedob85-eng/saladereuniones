import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Cargando…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-ink-500 py-10 ${className}`}>
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
