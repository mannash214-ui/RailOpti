import mongoose from 'mongoose';
import { Station } from '../models/station.model';
import { getStaticStations } from '../utils/dataLoader';

export class StationService {
  /**
   * Retrieves all active stations sorted alphabetically by name.
   */
  public static async getAllStations(): Promise<any[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const dbResults = await Station.find().sort({ name: 1 });
        if (dbResults && dbResults.length > 0) return dbResults;
      } catch (err) {
        console.warn('[StationService] DB query failed, using static stations.');
      }
    }
    return getStaticStations();
  }

  /**
   * Find a station by its 3-letter station code.
   */
  public static async getStationByCode(code: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const dbRes = await Station.findOne({ stationCode: code.toUpperCase() });
        if (dbRes) return dbRes;
      } catch (err) {
        // Fallback
      }
    }
    return getStaticStations().find(s => s.stationCode === code.toUpperCase()) || null;
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

    const staticStations = getStaticStations();
    const qLower = q.toLowerCase();
    
    return staticStations
      .filter(s => s.stationCode.toLowerCase().startsWith(qLower) || s.name.toLowerCase().includes(qLower))
      .slice(0, 10);
  }
}
