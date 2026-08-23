import type { reservationDataSave } from '../data/reservation';
import type { ReservationData } from '../types/reservation';
import { createApiClient } from './apiClient';

/** Servicio de reservas con almacenamiento mock y una interfaz compatible con HTTP. */
export const createReservationService = (token: string) => {
  const reservationApi = createApiClient('http://localhost:8083/reservations/api/', token);

  return {
    /** Obtiene las reservas activas que bloquean horarios en una fecha. */
    getOccupiedReservationsByDate: async (date: string): Promise<ReservationData[]> => {
      const { data } = await reservationApi.get<ReservationData[]>('reservations/active', {
        params: { date },
      });
      return data;
    },

    /** Guarda una reserva mediante el API de reservaciones. */
    saveReservation: async (reservation: typeof reservationDataSave): Promise<ReservationData> => {
      const { data } = await reservationApi.post<ReservationData>('reservations', reservation);
      return data;
    },
  };
};

export type ReservationService = ReturnType<typeof createReservationService>;
