import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';

const router = Router();

// GET /api/search - Query multi-train routing optimization
router.get('/', SearchController.queryOptimalItineraries);

export default router;
