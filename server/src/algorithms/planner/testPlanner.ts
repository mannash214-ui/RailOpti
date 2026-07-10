import mongoose from 'mongoose';
import { GraphBuilder } from '../graph/builder';
import { JourneyPlanner } from './JourneyPlanner';

async function runTest() {
  console.log('\x1b[36m[Planner Test] Bootstrapping planner test environment...\x1b[0m');

  const graphStartTime = Date.now();
  
  // 1. Build the immutable graph
  const builder = new GraphBuilder({
    minTransferTime: 20,
    maxTransferTime: 1440,
  });
  const graph = await builder.build();
  const graphBuildTime = Date.now() - graphStartTime;
  console.log(`[Planner Test] Graph compiled in ${graphBuildTime}ms.`);

  // 2. Instantiate the JourneyPlanner
  const planner = new JourneyPlanner(graph);

  // 3. Define search parameters
  const source = 'Silchar';
  const destination = 'Patna';
  const departureTime = '08:00';
  const maxTransfers = 2;

  console.log(`\n\x1b[33m[Planner Test] Planning journey from "${source}" to "${destination}" departing at "${departureTime}" (Max Transfers: ${maxTransfers})...\x1b[0m`);

  const planStartTime = Date.now();
  const result = await planner.plan({
    sourceStation: source,
    destinationStation: destination,
    departureAfter: departureTime,
    maximumTransfers: maxTransfers,
  });
  const planTime = Date.now() - planStartTime;

  // 4. Output results
  console.log('\n==================================================');
  console.log('             JOURNEY PLANNING REPORT              ');
  console.log('==================================================');
  
  if (!result || result.journeys.length === 0) {
    console.log('\x1b[31mJourney Found           : No route found.\x1b[0m');
    console.log(`Execution Time (Query)  : ${planTime}ms`);
    console.log(`Visited States          : ${result?.visitedStates ?? 0}`);
    console.log('==================================================\n');
  } else {
    const j = result.journeys[0];
    console.log('\x1b[32mJourney Found           : Yes!\x1b[0m');
    console.log(`Origin Station          : ${j.departureStation} (${j.departureStationCode})`);
    console.log(`Destination Station     : ${j.destinationStation} (${j.destinationStationCode})`);
    console.log(`Departure Time          : ${j.departureTime}`);
    console.log(`Arrival Time            : ${j.arrivalTime}`);
    console.log(`Total Journey Duration  : ${j.totalTimeMinutes} minutes`);
    console.log(` - Travel Time in Motion: ${j.travelTimeMinutes} minutes`);
    console.log(` - Waiting Time / Layover: ${j.waitingTimeMinutes} minutes`);
    console.log(`Number of Transfers     : ${j.transferCount}`);
    console.log(`Visited States          : ${result.visitedStates}`);
    console.log(`Execution Time (Query)  : ${result.executionTimeMs}ms`);
    console.log('--------------------------------------------------');
    console.log('Journey Train Segments:');
    
    j.trainSegments.forEach((segment, idx) => {
      console.log(`\n  [Segment ${idx + 1}] Train ${segment.trainNumber} - ${segment.trainName}`);
      console.log(`    Board   : ${segment.fromStationName} (${segment.fromStationCode}) at ${segment.departureTime}`);
      console.log(`    Alight  : ${segment.toStationName} (${segment.toStationCode}) at ${segment.arrivalTime}`);
      console.log(`    Duration: ${segment.travelMinutes} minutes`);
    });
    console.log('==================================================\n');
  }

  // 5. Clean disconnect
  await mongoose.disconnect();
}

runTest().catch(async (error) => {
  console.error('\x1b[31m[Planner Test Error] Test failed:\x1b[0m', error);
  try {
    await mongoose.disconnect();
  } catch (err) {
    // Silent
  }
  process.exit(1);
});
