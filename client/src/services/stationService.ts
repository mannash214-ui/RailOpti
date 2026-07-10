import api from './api';

export interface StationData {
  _id: string;
  name: string;
  stationCode: string;
  city: string;
  state: string;
}

export const stationService = {
  search: async (query: string, signal?: AbortSignal): Promise<StationData[]> => {
    if (!query.trim()) return [];
    const response = await api.get(`/stations/search`, {
      params: { q: query },
      signal,
    });
    return response.data?.data?.stations || [];
  },

  getAll: async (): Promise<StationData[]> => {
    const response = await api.get('/stations');
    return response.data?.data?.stations || [];
  },
};

export default stationService;
