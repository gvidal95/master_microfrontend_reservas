import { mockReservations } from '../data/reservation';
import type { ReservationData, ReservationSaveData } from '../types/reservation';

/** Servicio de reservas con almacenamiento mock y una interfaz compatible con HTTP. */
export const reservationService = {
  /** Obtiene las reservas activas que bloquean horarios en una fecha. */
  getOccupiedReservationsByDate: async (date: string): Promise<ReservationData[]> => {
    return mockReservations.filter((reservation) =>
      reservation.reservation_date === date && reservation.reservation_state === 'ACTIVO');
  },

  /** Crea una reserva en el almacén mock. En el futuro delegará en POST /reservations. */
  saveReservation: async (reservation: ReservationSaveData): Promise<ReservationData> => {
    const savedReservation: ReservationData = {
      ...reservation,
      reservation_id: mockReservations.reduce(
        (highestId, current) => Math.max(highestId, current.reservation_id), 0) + 1,
    };

    mockReservations.push(savedReservation);
    return savedReservation;
  },
};
