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
    console.log('\x1b[36m[Top-K Test] Bootstrapping planner environment for Top-K query...\x1b[0m');
    const graphStartTime = Date.now();
    // 1. Build the immutable graph
    const builder = new builder_1.GraphBuilder({
        minTransferTime: 20,
        maxTransferTime: 1440,
    });
    const graph = await builder.build();
    const graphBuildTime = Date.now() - graphStartTime;
    console.log(`[Top-K Test] Graph compiled in ${graphBuildTime}ms.`);
    // 2. Instantiate the JourneyPlanner
    const planner = new JourneyPlanner_1.JourneyPlanner(graph);
    // 3. Define search parameters
    const source = 'Silchar';
    const destination = 'Patna';
    const departureTime = '08:00';
    const maxTransfers = 2;
    const mode = types_1.OptimizationMode.BALANCED;
    console.log(`\n\x1b[33m[Top-K Test] Query: "${source}" to "${destination}" departing at "${departureTime}" (Max Transfers: ${maxTransfers})`);
    console.log(`Optimization Mode: ${mode}\x1b[0m`);
    const planStartTime = Date.now();
    const result = await planner.plan({
        sourceStation: source,
        destinationStation: destination,
        departureAfter: departureTime,
        maximumTransfers: maxTransfers,
        optimizationMode: mode,
    });
    const planTime = Date.now() - planStartTime;
    // 4. Output results
    console.log('\n======================================================================');
    console.log(`             TOP-K JOURNEY PLANNING REPORT (Mode: ${mode})             `);
    console.log('======================================================================');
    if (!result || result.journeys.length === 0) {
        console.log('\x1b[31mNo journeys found.\x1b[0m');
        console.log(`Execution Time (Query)  : ${planTime}ms`);
        console.log(`Visited States          : ${result?.visitedStates ?? 0}`);
        console.log('======================================================================\n');
    }
    else {
        console.log(`Visited States          : ${result.visitedStates}`);
        console.log(`Execution Time (Query)  : ${result.executionTimeMs}ms`);
        console.log(`Journeys Found          : ${result.journeys.length} unique itineraries\n`);
        result.journeys.forEach((j, idx) => {
            console.log(`\x1b[32m[Option ${idx + 1}] Rank Score: ${j.overallScore}/100\x1b[0m`);
            console.log(`  Route       : ${j.departureStation} (${j.departureStationCode}) -> ${j.destinationStation} (${j.destinationStationCode})`);
            console.log(`  Schedule    : Departure: ${j.departureTime} | Arrival: ${j.arrivalTime}`);
            console.log(`  Duration    : Total: ${j.totalTimeMinutes}m | Travel: ${j.travelTimeMinutes}m | Wait: ${j.waitingTimeMinutes}m`);
            console.log(`  Transfers   : ${j.transferCount}`);
            console.log(`  Reliability : ${j.reliabilityScore}%`);
            console.log('  Train segments:');
            j.trainSegments.forEach((segment, sIdx) => {
                console.log(`    - Leg ${sIdx + 1}: Train ${segment.trainNumber} [${segment.fromStationCode} -> ${segment.toStationCode}] | Dep: ${segment.departureTime} | Arr: ${segment.arrivalTime} | Delay: ~${segment.averageDelayMinutes}m`);
            });
            console.log('----------------------------------------------------------------------');
        });
        console.log('======================================================================\n');
    }
    // 5. Clean disconnect
    await mongoose_1.default.disconnect();
}
runTest().catch(async (error) => {
    console.error('\x1b[31m[Top-K Test Error] Test failed:\x1b[0m', error);
    try {
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        // Silent
    }
    process.exit(1);
});
