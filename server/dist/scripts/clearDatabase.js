"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const readline_1 = __importDefault(require("readline"));
const db_1 = require("../config/db");
// Import Models
const station_model_1 = require("../models/station.model");
const train_model_1 = require("../models/train.model");
const trainStop_model_1 = require("../models/trainStop.model");
const user_model_1 = require("../models/user.model");
const savedJourney_model_1 = require("../models/savedJourney.model");
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
async function clearCollections() {
    console.log('\x1b[33m  Deletions starting...\x1b[0m');
    const stationsResult = await station_model_1.Station.deleteMany({});
    console.log(`  - Stations cleared: ${stationsResult.deletedCount}`);
    const trainsResult = await train_model_1.Train.deleteMany({});
    console.log(`  - Trains cleared: ${trainsResult.deletedCount}`);
    const stopsResult = await trainStop_model_1.TrainStop.deleteMany({});
    console.log(`  - TrainStops cleared: ${stopsResult.deletedCount}`);
    const savedJourneysResult = await savedJourney_model_1.SavedJourney.deleteMany({});
    console.log(`  - SavedJourneys cleared: ${savedJourneysResult.deletedCount}`);
    const usersResult = await user_model_1.User.deleteMany({});
    console.log(`  - Users cleared: ${usersResult.deletedCount}`);
    console.log('\n\x1b[32m[Clear Complete] All specified collections have been cleared successfully.\x1b[0m\n');
}
async function main() {
    console.log('\x1b[36m[Clear Database] Initializing database connection...\x1b[0m');
    await (0, db_1.connectDB)();
    console.log('\x1b[31m');
    console.log('==================================================');
    console.log('  WARNING: DATABASE CLEAR OPERATION DETECTED      ');
    console.log('==================================================');
    console.log('  This operation will delete ALL documents in:    ');
    console.log('  - Stations                                      ');
    console.log('  - Trains                                        ');
    console.log('  - TrainStops                                    ');
    console.log('  - SavedJourneys                                 ');
    console.log('  - Users                                         ');
    console.log('==================================================');
    console.log('\x1b[0m');
    rl.question('Are you absolutely sure you want to proceed? (y/N): ', async (answer) => {
        rl.close();
        const cleanAnswer = answer.trim().toLowerCase();
        if (cleanAnswer === 'y' || cleanAnswer === 'yes') {
            try {
                await clearCollections();
            }
            catch (error) {
                console.error('\x1b[31m[Clear Error] Operation failed with error:\x1b[0m', error);
            }
        }
        else {
            console.log('\x1b[36m[Aborted] Database clear operation cancelled by user.\x1b[0m\n');
        }
        await mongoose_1.default.disconnect();
    });
}
main().catch(async (error) => {
    console.error('\x1b[31m[Clear Database Fatal Error]:\x1b[0m', error);
    rl.close();
    try {
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        // Silent
    }
    process.exit(1);
});
