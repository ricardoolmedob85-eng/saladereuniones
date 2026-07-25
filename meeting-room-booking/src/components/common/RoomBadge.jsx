import React from 'react';
import { getRoomById } from '../../config/rooms';

export default function RoomBadge({ roomId, showFloor = true, size = 'md' }) {
  const room = getRoomById(roomId);
  if (!room) return null;

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses}`}
      style={{ backgroundColor: room.bg, color: room.color, border: `1px solid ${room.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: room.color }} />
      {room.name}
      {showFloor && <span className="opacity-70 font-medium">· P{room.floor}</span>}
    </span>
  );
}
