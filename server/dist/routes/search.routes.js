"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("../controllers/search.controller");
const router = (0, express_1.Router)();
// GET /api/search - Query multi-train routing optimization
router.get('/', search_controller_1.SearchController.queryOptimalItineraries);
exports.default = router;
