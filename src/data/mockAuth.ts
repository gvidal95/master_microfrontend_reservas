import type { AuthContext } from '../types/auth';

export const mockAuth: AuthContext = {
  token: 'mock-jwt.reservas.local',
  user: { id: '1', name: 'Usuario de prueba', email: 'usuario@demo.com', role: 'normal' },
};
