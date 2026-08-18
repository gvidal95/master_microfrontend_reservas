import type { AuthContext } from '../types/auth';

export const mockAuth: AuthContext = {
  token: 'mock-jwt.reservas.local',
  user: { id: 'reservas-local-user', name: 'Usuario de prueba', email: 'usuario@demo.com', role: 'normal' },
};
