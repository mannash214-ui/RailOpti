import { Journey } from '../models/journey.model';
import { AppError } from '../middleware/error';

export class JourneyService {
  /**
   * Fetch all journeys pinned/saved by a user.
   */
  public static async getUserJourneys(userId: string): Promise<any[]> {
    return Journey.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Save an optimized itinerary to the user's account.
   */
  public static async saveJourney(userId: string, journeyData: any): Promise<any> {
    const newJourney = await Journey.create({
      userId,
      ...journeyData,
    });
    return newJourney;
  }

  /**
   * Deletes a saved journey. Checks ownership.
   */
  public static async deleteJourney(userId: string, journeyId: string): Promise<void> {
    const journey = await Journey.findById(journeyId);
    
    if (!journey) {
      throw new AppError('Journey not found.', 404);
    }

    // Verify ownership security
    if (journey.userId.toString() !== userId) {
      throw new AppError('You do not have permission to delete this journey.', 403);
    }

    await Journey.findByIdAndDelete(journeyId);
  }
}
