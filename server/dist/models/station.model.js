"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Station = void 0;
const mongoose_1 = require("mongoose");
const stationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Station name is required.'],
        trim: true,
    },
    stationCode: {
        type: String,
        required: [true, 'Station code is required.'],
        uppercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                // Standard station code check: 2 to 10 capital alphanumeric letters, hyphens, and underscores
                return /^[A-Z0-9_-]{2,10}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid station code (2-10 uppercase alphanumeric, hyphen, or underscore characters).`,
        },
    },
    city: {
        type: String,
        required: [true, 'City is required.'],
        trim: true,
    },
    state: {
        type: String,
        required: [true, 'State is required.'],
        trim: true,
    },
    latitude: {
        type: Number,
        required: [true, 'Latitude is required.'],
        min: [-90, 'Latitude must be at least -90.'],
        max: [90, 'Latitude cannot exceed 90.'],
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required.'],
        min: [-180, 'Longitude must be at least -180.'],
        max: [180, 'Longitude cannot exceed 180.'],
    },
    zone: {
        type: String,
        required: [true, 'Railway zone is required (e.g. CR, NR, ER, WR, SR).'],
        uppercase: true,
        trim: true,
    },
    isJunction: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Indexes
stationSchema.index({ stationCode: 1 }, { unique: true });
stationSchema.index({ city: 1 });
stationSchema.index({ state: 1 });
exports.Station = (0, mongoose_1.model)('Station', stationSchema);
exports.default = exports.Station;
