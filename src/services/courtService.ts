import axios from 'axios';
import type { CourtData } from '../types/court';

const courtApi = axios.create({
  baseURL: 'http://localhost:8081/courts/api',
});

/** Servicio HTTP para las operaciones relacionadas con canchas y sus horarios. */
export const courtService = {
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
