import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data.data;
  },
};

export default authService;
