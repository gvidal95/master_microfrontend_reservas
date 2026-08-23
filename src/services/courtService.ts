import type { CourtData } from '../types/court';
import { createApiClient } from './apiClient';

/** Servicio HTTP para las operaciones relacionadas con canchas y sus horarios. */
export const createCourtService = (token: string) => {
  const courtApi = createApiClient('http://localhost:8081/courts/api', token);

  return {
    /** Obtiene las canchas junto con sus datos de deporte y horarios. */
    getCourts: async (date: string): Promise<CourtData[]> => {
      const { data } = await courtApi.get<CourtData[]>('/courts',
        {
          params: {
            date
          }
        }
      );
      return data;
    },
  };
};

export type CourtService = ReturnType<typeof createCourtService>;
