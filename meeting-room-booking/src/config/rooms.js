// Fuente única de verdad para las 4 salas de reuniones.
// El "id" se usa como clave en Firestore y en el título del evento de Calendar.
export const ROOMS = [
  {
    id: 'jobs',
    name: 'Sala Jobs',
    floor: 14,
    size: 'grande',
    capacity: '15+ personas',
    colorKey: 'jobs',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    id: 'scott',
    name: 'Sala SCOTT',
    floor: 12,
    size: 'grande',
    capacity: '12+ personas',
    colorKey: 'scott',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    id: 'bezos',
    name: 'Sala Bezos',
    floor: 12,
    size: 'pequeña',
    capacity: '4-6 personas',
    colorKey: 'bezos',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    id: 'gates',
    name: 'Sala Gates',
    floor: 12,
    size: 'pequeña',
    capacity: '4-6 personas',
    colorKey: 'gates',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
];

export const getRoomById = (id) => ROOMS.find((r) => r.id === id);

// Equipamiento / insumos disponibles para el formulario de reserva
export const AMENITIES = [
  { id: 'projector', label: 'Proyector / Pantalla TV' },
  { id: 'videoconf', label: 'Sistema de Videoconferencia' },
  { id: 'coffee', label: 'Servicio de Café' },
  { id: 'snacks', label: 'Servicio de Saladitos' },
];

// Reglas de negocio para la validación de reservas
export const BOOKING_RULES = {
  MIN_HOUR: 8, // 08:00 AM
  MAX_HOUR: 20, // 08:00 PM — última hora de fin permitida
  MAX_DURATION_MINUTES: 120, // 2 horas
  MAX_ADVANCE_DAYS: 15,
};
