import { Router } from 'express';
import { JourneyController } from '../controllers/journey.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Apply JWT verification middleware to all journey pathways
router.use(protect as any);

// GET /api/journeys - List all saved journeys for authenticated user
router.get('/', JourneyController.getUserJourneys as any);

// POST /api/journeys - Save an itinerary
router.post('/', JourneyController.save as any);

// DELETE /api/journeys/:id - Delete an itinerary
router.delete('/:id', JourneyController.delete as any);

export default router;
