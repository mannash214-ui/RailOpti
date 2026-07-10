import { Router } from 'express';
import { StationController } from '../controllers/station.controller';

const router = Router();

// GET /api/stations
router.get('/', StationController.getAll);

// GET /api/stations/search
router.get('/search', StationController.search);

// POST /api/stations
router.post('/', StationController.create);

export default router;
