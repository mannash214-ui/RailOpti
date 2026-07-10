"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
// Import Models
const station_model_1 = require("../models/station.model");
const train_model_1 = require("../models/train.model");
const trainStop_model_1 = require("../models/trainStop.model");
async function verify() {
    console.log('\x1b[36m[Verifier] Initializing database connection...\x1b[0m');
    await (0, db_1.connectDB)();
    console.log('\x1b[33m[Verifier] Running aggregation queries...\x1b[0m\n');
    // 1) Stations count
    const totalStations = await station_model_1.Station.countDocuments({});
    // 2) Trains count
    const totalTrains = await train_model_1.Train.countDocuments({});
    // 3) TrainStops count
    const totalStops = await trainStop_model_1.TrainStop.countDocuments({});
    // 4) Junctions count
    const junctionsCount = await station_model_1.Station.countDocuments({ isJunction: true });
    // 5) Number of train types and listing them
    const trainTypeAgg = await train_model_1.Train.aggregate([
        { $group: { _id: '$trainType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    const totalTrainTypes = trainTypeAgg.length;
    // 6) Average stops per train
    const stopsPerTrainAgg = await trainStop_model_1.TrainStop.aggregate([
        { $group: { _id: '$trainId', stopsCount: { $sum: 1 } } },
        { $group: { _id: null, avgStops: { $avg: '$stopsCount' } } }
    ]);
    const averageStopsPerTrain = stopsPerTrainAgg[0]?.avgStops || 0;
    // 7) Average delay
    const delayAgg = await train_model_1.Train.aggregate([
        { $group: { _id: null, avgDelay: { $avg: '$averageDelayMinutes' } } }
    ]);
    const averageDelay = delayAgg[0]?.avgDelay || 0;
    // 8) Maximum corridor length (longest stop sequence number)
    const maxCorridorAgg = await trainStop_model_1.TrainStop.aggregate([
        { $group: { _id: '$trainId', maxStop: { $max: '$stopNumber' } } },
        { $group: { _id: null, overallMax: { $max: '$maxStop' } } }
    ]);
    const maxCorridorLength = maxCorridorAgg[0]?.overallMax || 0;
    // 9) Most connected stations: stations with the highest number of stops running through them
    const connectedStationsAgg = await trainStop_model_1.TrainStop.aggregate([
        { $group: { _id: '$stationId', totalVisits: { $sum: 1 } } },
        { $sort: { totalVisits: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'stations',
                localField: '_id',
                foreignField: '_id',
                as: 'stationDetails'
            }
        },
        { $unwind: '$stationDetails' },
        {
            $project: {
                code: '$stationDetails.stationCode',
                name: '$stationDetails.name',
                city: '$stationDetails.city',
                visits: '$totalVisits'
            }
        }
    ]);
    console.log('==================================================');
    console.log('            DATABASE VERIFICATION STATS           ');
    console.log('==================================================');
    console.log(`Stations in DB       : ${totalStations}`);
    console.log(`Trains in DB         : ${totalTrains}`);
    console.log(`TrainStops in DB     : ${totalStops}`);
    console.log(`Junction Stations    : ${junctionsCount}`);
    console.log(`Train Types Count    : ${totalTrainTypes}`);
    console.log('--------------------------------------------------');
    console.log(`Average Stops/Train  : ${averageStopsPerTrain.toFixed(2)}`);
    console.log(`Average delay (mins) : ${averageDelay.toFixed(2)} mins`);
    console.log(`Max Corridor Length  : ${maxCorridorLength} stops`);
    console.log('--------------------------------------------------');
    console.log('Train Distribution by Type:');
    trainTypeAgg.forEach((t) => {
        console.log(` - ${t._id}: ${t.count} trains`);
    });
    console.log('--------------------------------------------------');
    console.log('Top 10 Busiest Stations (Total stop listings):');
    connectedStationsAgg.forEach((s, idx) => {
        console.log(` [${idx + 1}] ${s.name} (${s.code}) - ${s.city} -> ${s.visits} stops scheduled`);
    });
    console.log('==================================================\n');
    await mongoose_1.default.disconnect();
}
verify().catch(async (error) => {
    console.error('\x1b[31m[Verifier Fatal Error] Statistics compilation failed:\x1b[0m', error);
    try {
        await mongoose_1.default.disconnect();
    }
    catch (disError) {
        // Silent
    }
    process.exit(1);
});
