import mongoose from 'mongoose';
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

  /**
   * Search stations matching query q by name or code.
   */
  public static async searchStations(q: string): Promise<any[]> {
    if (!q) return [];
    
    if (mongoose.connection.readyState === 1) {
      const dbResults = await Station.find({
        $or: [
          { stationCode: new RegExp(`^${q}`, 'i') },
          { name: new RegExp(q, 'i') },
        ],
      }).limit(10);

      if (dbResults && dbResults.length > 0) {
        return dbResults;
      }
    }

    const { getStaticStations } = await import('../utils/dataLoader');
    const staticStations = getStaticStations();
    const qLower = q.toLowerCase();
    
    return staticStations
      .filter(s => s.stationCode.toLowerCase().startsWith(qLower) || s.name.toLowerCase().includes(qLower))
      .slice(0, 10);
  }
}
