"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Station = void 0;
const mongoose_1 = require("mongoose");
const stationSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: [true, 'Station unique code is required (e.g. KGX).'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Station name is required.'],
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Indexing Station code for rapid indexing searches
stationSchema.index({ code: 1 });
exports.Station = (0, mongoose_1.model)('Station', stationSchema);
exports.default = exports.Station;
