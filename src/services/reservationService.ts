import type { reservationDataSave } from '../data/reservation';
import type { ReservationData } from '../types/reservation';
import axios from 'axios';
import { createApiClient } from './apiClient';

const getReservationErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return undefined;

  const responseData: unknown = error.response?.data;
  if (typeof responseData === 'string' && responseData.trim()) return responseData;

  if (
    responseData
    && typeof responseData === 'object'
    && 'message' in responseData
    && typeof responseData.message === 'string'
    && responseData.message.trim()
  ) {
    return responseData.message;
  }

  return undefined;
};

/** Servicio de reservas con almacenamiento mock y una interfaz compatible con HTTP. */
export const createReservationService = (token: string) => {
  const reservationApi = createApiClient('http://localhost:8080/reservations/api/', token);

  return {
    /** Obtiene las reservas activas que bloquean horarios en una fecha. */
    getOccupiedReservationsByDate: async (date: string): Promise<ReservationData[]> => {
      const { data } = await reservationApi.get<ReservationData[]>('reservations/active', {
        params: { date },
      });
      return data;
    },

    /** Obtiene las reservas activas pertenecientes a un usuario. */
    getActiveReservationsByUser: async (userId: number): Promise<ReservationData[]> => {
      const { data } = await reservationApi.get<ReservationData[]>(`reservations/active/user/${userId}`);
      return data;
    },

    /** Obtiene las reservas canceladas pertenecientes a un usuario. */
    getCancelledReservationsByUser: async (userId: number): Promise<ReservationData[]> => {
      const { data } = await reservationApi.get<ReservationData[]>(`reservations/canceled/user/${userId}`);
      return data;
    },

    /** Cancela una reserva existente. */
    cancelReservation: async (reservationId: number): Promise<void> => {
      await reservationApi.patch(`reservations/${reservationId}/cancel`);
    },

    /** Guarda una reserva mediante el API de reservaciones. */
    saveReservation: async (reservation: typeof reservationDataSave): Promise<ReservationData> => {
      try {
        const { data } = await reservationApi.post<ReservationData>('reservations', reservation);
        return data;
      } catch (error) {
        throw new Error(
          getReservationErrorMessage(error)
          ?? 'No se pudo guardar la reserva. Inténtalo nuevamente.',
        );
      }
    },
  };
};

export type ReservationService = ReturnType<typeof createReservationService>;
