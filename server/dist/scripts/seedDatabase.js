"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const db_1 = require("../config/db");
const validateDataset_1 = require("./validateDataset");
// Import Models
const station_model_1 = require("../models/station.model");
const train_model_1 = require("../models/train.model");
const trainStop_model_1 = require("../models/trainStop.model");
async function seed() {
    // 1) Validate the dataset first
    const isValid = await (0, validateDataset_1.validateDataset)();
    if (!isValid) {
        console.error('\x1b[31m[Seeder Aborted] Dataset validation failed. Seeding is not allowed.\x1b[0m');
        process.exit(1);
    }
    console.log('\x1b[36m[Seeder] Initializing database connection...\x1b[0m');
    await (0, db_1.connectDB)();
    // 2) Safely clear current collections
    console.log('\x1b[33m[Seeder] Clearing old collections...\x1b[0m');
    await station_model_1.Station.deleteMany({});
    await train_model_1.Train.deleteMany({});
    await trainStop_model_1.TrainStop.deleteMany({});
    console.log('\x1b[32m[Seeder] Database cleared successfully.\x1b[0m\n');
    // Load JSON Files
    const dataDir = path.join(__dirname, '../../data');
    const stationsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'stations.json'), 'utf-8'));
    const trainsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'trains.json'), 'utf-8'));
    const stopsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'trainStops.json'), 'utf-8'));
    // 3) Import Stations
    console.log('Importing Stations...');
    const stationCodeToId = new Map();
    // Map stationName in JSON to name in Mongoose Station model
    const processedStations = stationsRaw.map((s) => ({
        name: s.stationName,
        stationCode: s.stationCode,
        city: s.city,
        state: s.state,
        latitude: s.latitude,
        longitude: s.longitude,
        zone: s.zone,
        isJunction: s.isJunction,
    }));
    // Bulk insert stations
    const insertedStations = await station_model_1.Station.insertMany(processedStations);
    insertedStations.forEach((s) => {
        stationCodeToId.set(s.stationCode, s._id);
    });
    console.log(`\x1b[32m  ${insertedStations.length} / ${stationsRaw.length} stations imported.\x1b[0m\n`);
    // 4) Import Trains
    console.log('Importing Trains...');
    const trainNumberToId = new Map();
    const processedTrains = trainsRaw.map((t) => {
        const sourceId = stationCodeToId.get(t.sourceStation);
        const destId = stationCodeToId.get(t.destinationStation);
        if (!sourceId || !destId) {
            throw new Error(`Referential failure mapping stations for train: ${t.trainNumber}`);
        }
        return {
            ...t,
            sourceStation: sourceId,
            destinationStation: destId,
        };
    });
    const insertedTrains = await train_model_1.Train.insertMany(processedTrains);
    insertedTrains.forEach((t) => {
        trainNumberToId.set(t.trainNumber, t._id);
    });
    console.log(`\x1b[32m  ${insertedTrains.length} / ${trainsRaw.length} trains imported.\x1b[0m\n`);
    // 5) Import TrainStops in batches of 1000
    console.log('Importing TrainStops...');
    const processedStops = stopsRaw.map((stop) => {
        const tId = trainNumberToId.get(stop.trainId);
        const sId = stationCodeToId.get(stop.stationId);
        if (!tId || !sId) {
            throw new Error(`Referential failure mapping TrainStop for train ${stop.trainId} at station ${stop.stationId}`);
        }
        return {
            trainId: tId,
            stationId: sId,
            stopNumber: stop.stopNumber,
            arrivalTime: stop.arrivalTime,
            departureTime: stop.departureTime,
            dayOffset: stop.dayOffset,
            distanceFromSource: stop.distanceFromSource,
            platform: stop.platform,
        };
    });
    const batchSize = 1000;
    let stopsImported = 0;
    const totalStops = processedStops.length;
    while (stopsImported < totalStops) {
        const chunk = processedStops.slice(stopsImported, stopsImported + batchSize);
        await trainStop_model_1.TrainStop.insertMany(chunk);
        stopsImported += chunk.length;
        console.log(`  ${stopsImported} / ${totalStops}`);
    }
    console.log('\n\x1b[32m==================================================');
    console.log('                 IMPORT COMPLETE                  ');
    console.log('==================================================\x1b[0m');
    // Close the database connection cleanly
    await mongoose_1.default.disconnect();
}
seed().catch(async (error) => {
    console.error('\x1b[31m[Seeder Fatal Error] Seeding operation failed:\x1b[0m', error);
    try {
        await mongoose_1.default.disconnect();
    }
    catch (disError) {
        // Silent
    }
    process.exit(1);
});
