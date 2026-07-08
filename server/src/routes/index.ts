import { Router } from 'express';
import authRoutes from './auth.routes';
import stationRoutes from './station.routes';
import journeyRoutes from './journey.routes';
import searchRoutes from './search.routes';

const router = Router();

// Mount endpoints under matching resources
router.use('/auth', authRoutes);
router.use('/stations', stationRoutes);
router.use('/journeys', journeyRoutes);
router.use('/search', searchRoutes);

export default router;
