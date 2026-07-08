import { Router } from 'express';
import { StationController } from '../controllers/station.controller';

const router = Router();

// GET /api/stations
router.get('/', StationController.getAll);

// POST /api/stations
router.post('/', StationController.create);

export default router;
