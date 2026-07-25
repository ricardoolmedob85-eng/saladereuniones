import { BOOKING_RULES } from '../config/rooms';

/**
 * Combina un string de fecha (YYYY-MM-DD) y hora (HH:mm) en un objeto Date local.
 */
export function combineDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Valida los datos de una reserva contra todas las reglas de negocio.
 * Retorna { valid: boolean, errors: string[] }
 */
export function validateBookingTime({ date, startTime, endTime }) {
  const errors = [];
  const start = combineDateTime(date, startTime);
  const end = combineDateTime(date, endTime);
  const now = new Date();

  if (!start || !end) {
    errors.push('Debes indicar fecha, hora de inicio y hora de fin.');
    return { valid: false, errors };
  }

  if (end <= start) {
    errors.push('La hora de fin debe ser posterior a la hora de inicio.');
  }

  // Horario permitido: a partir de las 08:00
  const minStart = new Date(start);
  minStart.setHours(BOOKING_RULES.MIN_HOUR, 0, 0, 0);
  if (start < minStart) {
    errors.push(`El horario de reserva solo está permitido a partir de las ${String(BOOKING_RULES.MIN_HOUR).padStart(2, '0')}:00.`);
  }

  const maxEnd = new Date(start);
  maxEnd.setHours(BOOKING_RULES.MAX_HOUR, 0, 0, 0);
  if (end > maxEnd) {
    errors.push(`Las reservas deben finalizar antes de las ${String(BOOKING_RULES.MAX_HOUR).padStart(2, '0')}:00.`);
  }

  // Duración máxima
  const durationMinutes = (end - start) / 60000;
  if (durationMinutes > BOOKING_RULES.MAX_DURATION_MINUTES) {
    errors.push(`La duración máxima por reserva es de ${BOOKING_RULES.MAX_DURATION_MINUTES / 60} horas.`);
  }
  if (durationMinutes <= 0) {
    errors.push('La duración de la reserva no es válida.');
  }

  // No permitir reservar en el pasado
  if (start < now) {
    errors.push('No puedes reservar en una fecha u hora que ya pasó.');
  }

  // Ventana máxima de anticipación: 15 días
  const maxAdvanceDate = new Date();
  maxAdvanceDate.setDate(maxAdvanceDate.getDate() + BOOKING_RULES.MAX_ADVANCE_DAYS);
  maxAdvanceDate.setHours(23, 59, 59, 999);
  if (start > maxAdvanceDate) {
    errors.push(`Solo puedes reservar con un máximo de ${BOOKING_RULES.MAX_ADVANCE_DAYS} días de anticipación.`);
  }

  return { valid: errors.length === 0, errors, start, end };
}

/**
 * Verifica si dos rangos de tiempo se solapan.
 */
export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Revisa colisión de horario contra una lista de reservas existentes de la misma sala.
 * excludeId permite ignorar la propia reserva al reagendar.
 */
export function findCollision(newStart, newEnd, existingBookings, excludeId = null) {
  return existingBookings.find((b) => {
    if (excludeId && b.id === excludeId) return false;
    if (b.status === 'cancelled') return false;
    const bStart = b.start instanceof Date ? b.start : new Date(b.start);
    const bEnd = b.end instanceof Date ? b.end : new Date(b.end);
    return rangesOverlap(newStart, newEnd, bStart, bEnd);
  });
}

export function todayISODate() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function maxAdvanceISODate() {
  const d = new Date();
  d.setDate(d.getDate() + BOOKING_RULES.MAX_ADVANCE_DAYS);
  return d.toISOString().split('T')[0];
}
