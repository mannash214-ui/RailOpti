"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const station_controller_1 = require("../controllers/station.controller");
const router = (0, express_1.Router)();
// GET /api/stations
router.get('/', station_controller_1.StationController.getAll);
// GET /api/stations/search
router.get('/search', station_controller_1.StationController.search);
// POST /api/stations
router.post('/', station_controller_1.StationController.create);
exports.default = router;
