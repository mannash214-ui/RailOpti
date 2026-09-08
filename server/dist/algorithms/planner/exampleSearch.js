"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../../config/db");
const builder_1 = require("../graph/builder");
const JourneyPlanner_1 = require("./JourneyPlanner");
async function runExample() {
    console.log('[Example Search] Connecting to database...');
    await (0, db_1.connectDB)();
    console.log('[Example Search] Compiling graph...');
    const builder = new builder_1.GraphBuilder({
        minTransferTime: 20,
        maxTransferTime: 1440,
    });
    const graph = await builder.build();
    const planner = new JourneyPlanner_1.JourneyPlanner(graph);
    const source = 'Silchar';
    const destination = 'Patna';
    const travelDate = '2026-09-16'; // Wednesday
    const departureTime = '08:00';
    console.log(`\nPlanning Journey from "${source}" to "${destination}" on ${travelDate} at ${departureTime}...`);
    const result = await planner.plan({
        sourceStation: source,
        destinationStation: destination,
        travelDate,
        departureAfter: departureTime,
        maximumTransfers: 3,
    });
    if (!result || result.journeys.length === 0) {
        console.log('No journeys found.');
    }
    else {
        console.log('\n==================================================');
        console.log('             EXAMPLE SEARCH RESULTS               ');
        console.log('==================================================');
        console.log(`Travel Date             : ${travelDate}`);
        console.log(`Computed Weekday        : Wednesday`);
        console.log(`Total Journeys Found    : ${result.journeys.length}`);
        console.log('--------------------------------------------------');
        result.journeys.forEach((journey, idx) => {
            console.log(`\nJourney Option ${idx + 1} (Score: ${journey.overallScore}/100)`);
            console.log(`  Departure: ${journey.departureStation} (${journey.departureStationCode}) at ${journey.actualDepartureDateTime} (${journey.departureDay})`);
            console.log(`  Arrival  : ${journey.destinationStation} (${journey.destinationStationCode}) at ${journey.actualArrivalDateTime} (${journey.arrivalDay})`);
            console.log(`  Duration : ${journey.totalTimeMinutes} minutes (Travel: ${journey.travelTimeMinutes}m, Wait: ${journey.waitingTimeMinutes}m)`);
            console.log(`  Transfers: ${journey.transferCount}`);
            console.log('  Train Segments:');
            journey.trainSegments.forEach((seg, sIdx) => {
                console.log(`    [Segment ${sIdx + 1}] Train ${seg.trainNumber} (${seg.trainName})`);
                console.log(`      Board: ${seg.fromStationName} at ${seg.actualDepartureDateTime}`);
                console.log(`      Alight: ${seg.toStationName} at ${seg.actualArrivalDateTime}`);
                console.log(`      Operating days: ${seg.trainNumber} runs on: [${graph.getTrainNodes(seg.trainNumber)[0]?.operatingDays?.join(', ')}]`);
            });
            console.log('--------------------------------------------------');
        });
    }
    await mongoose_1.default.disconnect();
}
runExample().catch(async (err) => {
    console.error(err);
    await mongoose_1.default.disconnect();
});
