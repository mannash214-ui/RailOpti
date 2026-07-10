import { Request, Response, NextFunction } from 'express';
import { StationService } from '../services/station.service';

export class StationController {
  public static async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stations = await StationService.getAllStations();
      
      res.status(200).json({
        status: 'success',
        results: stations.length,
        data: { stations },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const station = await StationService.createStation(req.body);
      
      res.status(201).json({
        status: 'success',
        data: { station },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async search(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const q = (req.query.q as string || '').trim();
      const stations = await StationService.searchStations(q);
      
      res.status(200).json({
        status: 'success',
        data: { stations },
      });
    } catch (error) {
      next(error);
    }
  }
}
export default StationController;
