import { Station } from '../models/station.model';

export class StationService {
  /**
   * Retrieves all active stations sorted alphabetically by name.
   */
  public static async getAllStations(): Promise<any[]> {
    return Station.find({ isActive: true }).sort({ name: 1 });
  }

  /**
   * Find a station by its 3-letter station code.
   */
  public static async getStationByCode(code: string): Promise<any | null> {
    return Station.findOne({ code: code.toUpperCase(), isActive: true });
  }

  /**
   * Admin: Creates a new station node.
   */
  public static async createStation(stationData: any): Promise<any> {
    return Station.create(stationData);
  }
}
