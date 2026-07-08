"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const station_routes_1 = __importDefault(require("./station.routes"));
const journey_routes_1 = __importDefault(require("./journey.routes"));
const search_routes_1 = __importDefault(require("./search.routes"));
const router = (0, express_1.Router)();
// Mount endpoints under matching resources
router.use('/auth', auth_routes_1.default);
router.use('/stations', station_routes_1.default);
router.use('/journeys', journey_routes_1.default);
router.use('/search', search_routes_1.default);
exports.default = router;
