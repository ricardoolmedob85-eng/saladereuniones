import React from 'react';

const STYLES = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-ink-100 text-ink-500 border-ink-200 line-through',
};

const LABELS = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STYLES[status] || STYLES.confirmed}`}
    >
      {LABELS[status] || status}
    </span>
  );
}
