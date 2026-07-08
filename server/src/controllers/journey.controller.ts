import { Response, NextFunction } from 'express';
import { JourneyService } from '../services/journey.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

export class JourneyController {
  public static async getUserJourneys(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        return next(new AppError('Unauthorized: Missing user information.', 401));
      }
      
      const journeys = await JourneyService.getUserJourneys(req.user.id);
      
      res.status(200).json({
        status: 'success',
        results: journeys.length,
        data: { journeys },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async save(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        return next(new AppError('Unauthorized: Missing user information.', 401));
      }

      const journey = await JourneyService.saveJourney(req.user.id, req.body);
      
      res.status(201).json({
        status: 'success',
        data: { journey },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        return next(new AppError('Unauthorized: Missing user information.', 401));
      }

      await JourneyService.deleteJourney(req.user.id, req.params.id);
      
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default JourneyController;
