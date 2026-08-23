import type { ReservationData } from '../types/reservation';

/** Ejemplo del modelo utilizado por una reserva. */
export const reservationData: ReservationData = {
  reservation_id: 1,
  reservation_date: '2026-08-24',
  reservation_start_time: '17:00:00',
  reservation_end_time: '18:00:00',
  reservation_court_id: 1,
  reservation_user_id: 1,
  reservation_state: 'ACTIVO',
};

/**
 * Almacén temporal de reservas. Al estar separado del servicio se puede sustituir
 * por una llamada al API sin cambiar el contrato consumido por los componentes.
 */
export const mockReservations: ReservationData[] = [reservationData];
