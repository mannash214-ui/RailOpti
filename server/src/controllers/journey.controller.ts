import { Request, Response, NextFunction } from 'express';
import { JourneyService } from '../services/journey.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { GraphBuilder } from '../algorithms/graph/builder';
import { JourneyPlanner } from '../algorithms/planner/JourneyPlanner';

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

  private static cachedGraph: any = null;

  public static async search(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!JourneyController.cachedGraph) {
        const builder = new GraphBuilder({
          minTransferTime: 20,
          maxTransferTime: 1440,
        });
        JourneyController.cachedGraph = await builder.build();
      }

      const planner = new JourneyPlanner(JourneyController.cachedGraph);
      const result = await planner.plan(req.body);

      if (!result) {
        res.status(404).json({
          status: 'fail',
          message: 'Failed to resolve stations or compute itineraries.',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default JourneyController;
