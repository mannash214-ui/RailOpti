"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const journey_controller_1 = require("../controllers/journey.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply JWT verification middleware to all journey pathways
router.use(auth_1.protect);
// GET /api/journeys - List all saved journeys for authenticated user
router.get('/', journey_controller_1.JourneyController.getUserJourneys);
// POST /api/journeys - Save an itinerary
router.post('/', journey_controller_1.JourneyController.save);
// DELETE /api/journeys/:id - Delete an itinerary
router.delete('/:id', journey_controller_1.JourneyController.delete);
exports.default = router;
