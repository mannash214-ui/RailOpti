import { RoutingEngine, RouteOption } from '../algorithms/routing';
import { AppError } from '../middleware/error';

interface SearchQueryParams {
  originCode: string;
  destinationCode: string;
  dateStr: string;
  maxTransfers?: number;
  maxWaitTimeMins?: number;
  minReliabilityIndex?: number;
}

export class SearchService {
  /**
   * Conducts journey optimization pathfinding.
   */
  public static async searchOptimalItineraries(params: SearchQueryParams): Promise<RouteOption[]> {
    const {
      originCode,
      destinationCode,
      dateStr,
      maxTransfers = 2,
      maxWaitTimeMins = 60,
      minReliabilityIndex = 80,
    } = params;

    if (!originCode || !destinationCode || !dateStr) {
      throw new AppError('Origin, destination, and travel date are required search inputs.', 400);
    }

    const travelDate = new Date(dateStr);
    if (isNaN(travelDate.getTime())) {
      throw new AppError('Invalid date format.', 400);
    }

    // Call the decoupled optimization engine
    const routes = await RoutingEngine.computeOptimalRoutes(
      originCode.toUpperCase(),
      destinationCode.toUpperCase(),
      travelDate,
      {
        maxTransfers: Number(maxTransfers),
        maxWaitTimeMins: Number(maxWaitTimeMins),
        minReliabilityIndex: Number(minReliabilityIndex),
      }
    );

    return routes;
  }
}
