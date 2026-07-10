import api from './api';
import { Journey } from '../components/JourneyTimeline';

export interface SearchRequest {
  sourceStation: string;
  destinationStation: string;
  departureAfter: string;
  arrivalBefore?: string;
  optimizationMode?: string;
  maximumTransfers?: number;
  minimumTransferMinutes?: number;
  maximumWaitingMinutes?: number;
  maximumJourneyDurationMinutes?: number;
  allowedTrainTypes?: string[];
  avoidOvernightTransfers?: boolean;
}

export const journeyService = {
  search: async (request: SearchRequest): Promise<Journey[]> => {
    const response = await api.post('/journeys/search', request);
    return response.data?.data?.journeys || [];
  },

  save: async (journey: Journey): Promise<any> => {
    const response = await api.post('/journeys', journey);
    return response.data?.data?.journey;
  },

  getUserJourneys: async (): Promise<Journey[]> => {
    const response = await api.get('/journeys');
    return response.data?.data?.journeys || [];
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/journeys/${id}`);
  },
};

export default journeyService;
