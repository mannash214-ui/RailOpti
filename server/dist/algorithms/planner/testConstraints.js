"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const builder_1 = require("../graph/builder");
const JourneyPlanner_1 = require("./JourneyPlanner");
const types_1 = require("../../models/types");
async function runTest() {
    console.log('\x1b[36m[Constraints Test] Bootstrapping planner environment...\x1b[0m');
    // 1. Build the immutable graph
    const builder = new builder_1.GraphBuilder({
        minTransferTime: 20,
        maxTransferTime: 1440,
    });
    const graph = await builder.build();
    const planner = new JourneyPlanner_1.JourneyPlanner(graph);
    const source = 'Silchar';
    const destination = 'Patna';
    const departureTime = '08:00';
    console.log('\n----------------------------------------------------------------------');
    console.log('TEST 1: Allowed Train Types = ["Express", "Superfast"] (Excluding Shatabdi/Rajdhani)');
    console.log('----------------------------------------------------------------------');
    const result1 = await planner.plan({
        sourceStation: source,
        destinationStation: destination,
        departureAfter: departureTime,
        maximumTransfers: 2,
        allowedTrainTypes: ['Express', 'Superfast'],
        optimizationMode: types_1.OptimizationMode.BALANCED,
    });
    if (!result1 || result1.journeys.length === 0) {
        console.log('\x1b[31mNo journeys found matching train type restrictions.\x1b[0m');
    }
    else {
        console.log(`Journeys Found: ${result1.journeys.length}`);
        result1.journeys.slice(0, 3).forEach((j, idx) => {
            console.log(`\nOption ${idx + 1} (Score: ${j.overallScore}/100)`);
            console.log(`  Duration: ${j.totalTimeMinutes}m | Transfers: ${j.transferCount}`);
            j.trainSegments.forEach((seg, sIdx) => {
                console.log(`    Leg ${sIdx + 1}: Train ${seg.trainNumber} (${seg.trainName})`);
            });
        });
    }
    console.log('\n----------------------------------------------------------------------');
    console.log('TEST 2: Avoid Overnight Transfers = true');
    console.log('----------------------------------------------------------------------');
    const result2 = await planner.plan({
        sourceStation: source,
        destinationStation: destination,
        departureAfter: departureTime,
        maximumTransfers: 2,
        avoidOvernightTransfers: true,
        optimizationMode: types_1.OptimizationMode.BALANCED,
    });
    if (!result2 || result2.journeys.length === 0) {
        console.log('\x1b[31mNo journeys found avoiding overnight transfers.\x1b[0m');
    }
    else {
        console.log(`Journeys Found: ${result2.journeys.length}`);
        result2.journeys.slice(0, 3).forEach((j, idx) => {
            console.log(`\nOption ${idx + 1} (Score: ${j.overallScore}/100)`);
            console.log(`  Duration: ${j.totalTimeMinutes}m | Transfers: ${j.transferCount}`);
            j.trainSegments.forEach((seg, sIdx) => {
                console.log(`    Leg ${sIdx + 1}: Train ${seg.trainNumber} (${seg.trainName})`);
            });
        });
    }
    console.log('\n----------------------------------------------------------------------');
    console.log('TEST 3: Maximum Waiting Time = 110 minutes (Excludes longer wait transfers)');
    console.log('----------------------------------------------------------------------');
    const result3 = await planner.plan({
        sourceStation: source,
        destinationStation: destination,
        departureAfter: departureTime,
        maximumTransfers: 2,
        maximumWaitingMinutes: 110,
        optimizationMode: types_1.OptimizationMode.BALANCED,
    });
    if (!result3 || result3.journeys.length === 0) {
        console.log('\x1b[31mNo journeys found under 110 minutes waiting limit.\x1b[0m');
    }
    else {
        console.log(`Journeys Found: ${result3.journeys.length}`);
        result3.journeys.forEach((j, idx) => {
            console.log(`\nOption ${idx + 1} (Score: ${j.overallScore}/100)`);
            console.log(`  Duration: ${j.totalTimeMinutes}m | Transfers: ${j.transferCount} | Wait time: ${j.waitingTimeMinutes}m`);
            j.trainSegments.forEach((seg, sIdx) => {
                console.log(`    Leg ${sIdx + 1}: Train ${seg.trainNumber} (${seg.trainName})`);
            });
        });
    }
    await mongoose_1.default.disconnect();
}
runTest().catch(async (error) => {
    console.error('\x1b[31m[Constraints Test Error] Test failed:\x1b[0m', error);
    try {
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        // Silent
    }
    process.exit(1);
});
