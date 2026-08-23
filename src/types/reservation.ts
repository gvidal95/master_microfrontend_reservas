export type ReservationState = 'ACTIVO' | 'CANCELADO';

/** Modelo de una reserva tal como se almacena y se recibe desde el servicio. */
export type ReservationData = {
  reservation_id: number;
  reservation_date: string;
  reservation_start_time: string;
  reservation_end_time: string;
  reservation_court_id: number;
  reservation_user_id: number;
  reservation_state: ReservationState;
};

/** Datos necesarios para crear una reserva nueva. */
export type ReservationSaveData = Omit<ReservationData, 'reservation_id'>;
