import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';

export class SearchController {
  public static async queryOptimalItineraries(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        origin,
        destination,
        date,
        maxTransfers,
        maxWaitTime,
        minReliability,
      } = req.query;

      // Map query variables to service layer parameters
      const results = await SearchService.searchOptimalItineraries({
        originCode: origin as string,
        destinationCode: destination as string,
        dateStr: date as string,
        maxTransfers: maxTransfers ? Number(maxTransfers) : undefined,
        maxWaitTimeMins: maxWaitTime ? Number(maxWaitTime) : undefined,
        minReliabilityIndex: minReliability ? Number(minReliability) : undefined,
      });

      res.status(200).json({
        status: 'success',
        results: results.length,
        data: { itineraries: results },
      });
    } catch (error) {
      next(error);
    }
  }
}
export default SearchController;
