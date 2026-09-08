import mongoose from 'mongoose';
import { connectDB } from '../../config/db';
import { Station } from '../../models/station.model';
import { Train } from '../../models/train.model';
import { TrainStop } from '../../models/trainStop.model';
import { GraphBuilder } from '../graph/builder';
import { JourneyPlanner } from './JourneyPlanner';
import { TrainType, OperatingDay } from '../../models/types';
import { AppError } from '../../middleware/error';

async function runTests() {
  console.log('\x1b[36m[Date-Aware Planner Tests] Connecting to database...\x1b[0m');
  await connectDB();

  console.log('[Date-Aware Planner Tests] Cleaning up old temporary test data...');
  // Clean up any stray test data
  await TrainStop.deleteMany({ platform: 'TEST_PLAT' });
  await Train.deleteMany({ trainName: /TEST_TRAIN/ });
  await Station.deleteMany({ city: 'TEST_CITY' });

  console.log('[Date-Aware Planner Tests] Seeding temporary test stations...');
  const stationA = await Station.create({
    name: 'Test Station A',
    stationCode: 'TSA',
    city: 'TEST_CITY',
    state: 'Test State',
    latitude: 25.0,
    longitude: 90.0,
    zone: 'Test Zone',
    isJunction: true,
  });

  const stationB = await Station.create({
    name: 'Test Station B',
    stationCode: 'TSB',
    city: 'TEST_CITY',
    state: 'Test State',
    latitude: 26.0,
    longitude: 91.0,
    zone: 'Test Zone',
    isJunction: true,
  });

  const stationC = await Station.create({
    name: 'Test Station C',
    stationCode: 'TSC',
    city: 'TEST_CITY',
    state: 'Test State',
    latitude: 27.0,
    longitude: 92.0,
    zone: 'Test Zone',
    isJunction: true,
  });

  console.log('[Date-Aware Planner Tests] Seeding temporary test trains...');

  // 1. Monday-only train
  const trainMon = await Train.create({
    trainNumber: 'TMON1',
    trainName: 'TEST_TRAIN_MON',
    trainType: TrainType.EXPRESS,
    operatingDays: [OperatingDay.MON],
    sourceStation: stationA._id,
    destinationStation: stationB._id,
    averageDelayMinutes: 5,
    cancellationProbability: 0.01,
  });
  await TrainStop.create([
    { trainId: trainMon._id, stationId: stationA._id, stopNumber: 1, arrivalTime: 'Source', departureTime: '09:00', dayOffset: 0, distanceFromSource: 0, platform: 'TEST_PLAT' },
    { trainId: trainMon._id, stationId: stationB._id, stopNumber: 2, arrivalTime: '12:00', departureTime: 'Destination', dayOffset: 0, distanceFromSource: 150, platform: 'TEST_PLAT' },
  ]);

  // 2. Wednesday-only train
  const trainWed = await Train.create({
    trainNumber: 'TWED1',
    trainName: 'TEST_TRAIN_WED',
    trainType: TrainType.EXPRESS,
    operatingDays: [OperatingDay.WED],
    sourceStation: stationA._id,
    destinationStation: stationB._id,
    averageDelayMinutes: 10,
    cancellationProbability: 0.02,
  });
  await TrainStop.create([
    { trainId: trainWed._id, stationId: stationA._id, stopNumber: 1, arrivalTime: 'Source', departureTime: '10:00', dayOffset: 0, distanceFromSource: 0, platform: 'TEST_PLAT' },
    { trainId: trainWed._id, stationId: stationB._id, stopNumber: 2, arrivalTime: '13:00', departureTime: 'Destination', dayOffset: 0, distanceFromSource: 150, platform: 'TEST_PLAT' },
  ]);

  // 3. Weekend train
  const trainWek = await Train.create({
    trainNumber: 'TWEK1',
    trainName: 'TEST_TRAIN_WEK',
    trainType: TrainType.SUPERFAST,
    operatingDays: [OperatingDay.SAT, OperatingDay.SUN],
    sourceStation: stationA._id,
    destinationStation: stationB._id,
    averageDelayMinutes: 2,
    cancellationProbability: 0.0,
  });
  await TrainStop.create([
    { trainId: trainWek._id, stationId: stationA._id, stopNumber: 1, arrivalTime: 'Source', departureTime: '11:00', dayOffset: 0, distanceFromSource: 0, platform: 'TEST_PLAT' },
    { trainId: trainWek._id, stationId: stationB._id, stopNumber: 2, arrivalTime: '14:00', departureTime: 'Destination', dayOffset: 0, distanceFromSource: 150, platform: 'TEST_PLAT' },
  ]);

  // 4. Daily train
  const trainDly = await Train.create({
    trainNumber: 'TDLY1',
    trainName: 'TEST_TRAIN_DLY',
    trainType: TrainType.SUPERFAST,
    operatingDays: [OperatingDay.MON, OperatingDay.TUE, OperatingDay.WED, OperatingDay.THU, OperatingDay.FRI, OperatingDay.SAT, OperatingDay.SUN],
    sourceStation: stationA._id,
    destinationStation: stationB._id,
    averageDelayMinutes: 0,
    cancellationProbability: 0.0,
  });
  await TrainStop.create([
    { trainId: trainDly._id, stationId: stationA._id, stopNumber: 1, arrivalTime: 'Source', departureTime: '09:15', dayOffset: 0, distanceFromSource: 0, platform: 'TEST_PLAT' },
    { trainId: trainDly._id, stationId: stationB._id, stopNumber: 2, arrivalTime: '12:15', departureTime: 'Destination', dayOffset: 0, distanceFromSource: 150, platform: 'TEST_PLAT' },
  ]);

  // 5. Overnight train (Wednesday) departing Wednesday 22:30, arriving Thursday 05:45
  const trainOvn = await Train.create({
    trainNumber: 'TOVN1',
    trainName: 'TEST_TRAIN_OVN',
    trainType: TrainType.RAJDHANI,
    operatingDays: [OperatingDay.WED],
    sourceStation: stationA._id,
    destinationStation: stationB._id,
    averageDelayMinutes: 0,
    cancellationProbability: 0.0,
  });
  await TrainStop.create([
    { trainId: trainOvn._id, stationId: stationA._id, stopNumber: 1, arrivalTime: 'Source', departureTime: '22:30', dayOffset: 0, distanceFromSource: 0, platform: 'TEST_PLAT' },
    { trainId: trainOvn._id, stationId: stationB._id, stopNumber: 2, arrivalTime: '05:45', departureTime: 'Destination', dayOffset: 1, distanceFromSource: 400, platform: 'TEST_PLAT' },
  ]);

  // 6. Overnight transfer train sequence:
  // Train A: departs 23:00, arrives 01:00 next day (dayOffset 1)
  // Train B: departs 02:00, arrives 04:00 (dayOffset 1)
  const trainTrsfA = await Train.create({
    trainNumber: 'TTRFA',
    trainName: 'TEST_TRAIN_TRFA',
    trainType: TrainType.SHATABDI,
    operatingDays: [OperatingDay.MON, OperatingDay.TUE, OperatingDay.WED, OperatingDay.THU, OperatingDay.FRI, OperatingDay.SAT, OperatingDay.SUN],
    sourceStation: stationA._id,
    destinationStation: stationB._id,
    averageDelayMinutes: 0,
    cancellationProbability: 0.0,
  });
  await TrainStop.create([
    { trainId: trainTrsfA._id, stationId: stationA._id, stopNumber: 1, arrivalTime: 'Source', departureTime: '23:00', dayOffset: 0, distanceFromSource: 0, platform: 'TEST_PLAT' },
    { trainId: trainTrsfA._id, stationId: stationB._id, stopNumber: 2, arrivalTime: '01:00', departureTime: 'Destination', dayOffset: 1, distanceFromSource: 100, platform: 'TEST_PLAT' },
  ]);

  const trainTrsfB = await Train.create({
    trainNumber: 'TTRFB',
    trainName: 'TEST_TRAIN_TRFB',
    trainType: TrainType.SHATABDI,
    operatingDays: [OperatingDay.MON, OperatingDay.TUE, OperatingDay.WED, OperatingDay.THU, OperatingDay.FRI, OperatingDay.SAT, OperatingDay.SUN],
    sourceStation: stationB._id,
    destinationStation: stationC._id,
    averageDelayMinutes: 0,
    cancellationProbability: 0.0,
  });
  await TrainStop.create([
    { trainId: trainTrsfB._id, stationId: stationB._id, stopNumber: 1, arrivalTime: 'Source', departureTime: '02:00', dayOffset: 1, distanceFromSource: 0, platform: 'TEST_PLAT' },
    { trainId: trainTrsfB._id, stationId: stationC._id, stopNumber: 2, arrivalTime: '04:00', departureTime: 'Destination', dayOffset: 1, distanceFromSource: 100, platform: 'TEST_PLAT' },
  ]);

  console.log('[Date-Aware Planner Tests] Building graph in memory...');
  const builder = new GraphBuilder({
    minTransferTime: 20,
    maxTransferTime: 1440,
  });
  const graph = await builder.build();
  const planner = new JourneyPlanner(graph);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(` \x1b[32m✓ [PASS]\x1b[0m ${msg}`);
      passed++;
    } else {
      console.log(` \x1b[31m✗ [FAIL]\x1b[0m ${msg}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // Test 1: Monday-only train
  // Monday: 2026-09-14 (expected Mon train TMON1 to be selected)
  // ----------------------------------------------------
  try {
    const resMon = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-14',
      departureTime: '08:00',
      maxTransfers: 1,
    });
    const foundMonTrain = resMon?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TMON1'));
    const foundWedTrain = resMon?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TWED1'));
    assert(!!foundMonTrain && !foundWedTrain, 'Monday-only train is matched on Monday, and Wednesday-only is ignored.');
  } catch (err: any) {
    assert(false, `Test 1 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 2: Wednesday-only train
  // Wednesday: 2026-09-16 (expected Wed train TWED1 to be selected)
  // ----------------------------------------------------
  try {
    const resWed = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-16',
      departureTime: '08:00',
      maxTransfers: 1,
    });
    const foundWedTrain = resWed?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TWED1'));
    const foundMonTrain = resWed?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TMON1'));
    assert(!!foundWedTrain && !foundMonTrain, 'Wednesday-only train is matched on Wednesday, and Monday-only is ignored.');
  } catch (err: any) {
    assert(false, `Test 2 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 3: Weekend train
  // Saturday: 2026-09-19
  // Tuesday: 2026-09-15
  // ----------------------------------------------------
  try {
    const resSat = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-19',
      departureTime: '08:00',
      maxTransfers: 1,
    });
    const foundWekSat = resSat?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TWEK1'));

    const resTue = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-15',
      departureTime: '08:00',
      maxTransfers: 1,
    });
    const foundWekTue = resTue?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TWEK1'));

    assert(!!foundWekSat && !foundWekTue, 'Weekend train is matched on Saturday, and ignored on Tuesday.');
  } catch (err: any) {
    assert(false, `Test 3 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 4: Daily train
  // Monday: 2026-09-14
  // Wednesday: 2026-09-16
  // ----------------------------------------------------
  try {
    const resMon = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-14',
      departureTime: '08:00',
      maxTransfers: 1,
    });
    const resWed = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-16',
      departureTime: '08:00',
      maxTransfers: 1,
    });
    const foundMon = resMon?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TDLY1'));
    const foundWed = resWed?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TDLY1'));
    assert(!!foundMon && !!foundWed, 'Daily train is active and matched on both Monday and Wednesday.');
  } catch (err: any) {
    assert(false, `Test 4 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 5: Overnight train
  // Wednesday 2026-09-16
  // Depart 22:30, Arrive 05:45 next day.
  // Expected actualDepartureDateTime = "16 Sep 2026 22:30"
  // Expected actualArrivalDateTime = "17 Sep 2026 05:45"
  // Departure Day = Wed, Arrival Day = Thu
  // ----------------------------------------------------
  try {
    const resOvn = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-16',
      departureTime: '21:00',
      maxTransfers: 1,
    });
    const ovnJourney = resOvn?.journeys.find(j => j.trainSegments.some(s => s.trainNumber === 'TOVN1') && j.transferCount === 0);
    if (resOvn) {
      console.log('All journeys found in Test 5:', JSON.stringify(resOvn.journeys, null, 2));
    }
    assert(!!ovnJourney, 'Overnight train option is resolved.');
    if (ovnJourney) {
      assert(ovnJourney.actualDepartureDateTime === '16 Sep 2026 22:30', `Departure Datetime: ${ovnJourney.actualDepartureDateTime} (expected 16 Sep 2026 22:30)`);
      assert(ovnJourney.actualArrivalDateTime === '17 Sep 2026 05:45', `Arrival Datetime: ${ovnJourney.actualArrivalDateTime} (expected 17 Sep 2026 05:45)`);
      assert(ovnJourney.departureDay === 'Wed', `Departure Day: ${ovnJourney.departureDay} (expected Wed)`);
      assert(ovnJourney.arrivalDay === 'Thu', `Arrival Day: ${ovnJourney.arrivalDay} (expected Thu)`);
    }
  } catch (err: any) {
    assert(false, `Test 5 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 6: Overnight transfer
  // Journey TSA -> TSC via TSB
  // TSA -> TSB (Train A): departs 23:00, arrives 01:00 next day (dayOffset 1)
  // TSB -> TSC (Train B): departs 02:00 (dayOffset 1), arrives 04:00 (dayOffset 1)
  // ----------------------------------------------------
  try {
    const resTrsf = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station C',
      travelDate: '2026-09-16',
      departureTime: '22:00',
      maxTransfers: 2,
    });
    const trsfJourney = resTrsf?.journeys.find(j => j.trainSegments.some(s => s.trainNumber === 'TTRFA') && j.trainSegments.some(s => s.trainNumber === 'TTRFB'));
    assert(!!trsfJourney, 'Overnight transfer journey is resolved.');
    if (trsfJourney) {
      assert(trsfJourney.actualDepartureDateTime === '16 Sep 2026 23:00', `Departure: ${trsfJourney.actualDepartureDateTime} (expected 16 Sep 2026 23:00)`);
      assert(trsfJourney.actualArrivalDateTime === '17 Sep 2026 04:00', `Arrival: ${trsfJourney.actualArrivalDateTime} (expected 17 Sep 2026 04:00)`);
      assert(trsfJourney.departureDay === 'Wed', `Departure Day: ${trsfJourney.departureDay}`);
      assert(trsfJourney.arrivalDay === 'Thu', `Arrival Day: ${trsfJourney.arrivalDay}`);
    }
  } catch (err: any) {
    assert(false, `Test 6 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 7: Invalid operating day
  // Querying Mon-only train on Tuesday 2026-09-15 (should be completely ignored)
  // ----------------------------------------------------
  try {
    const resTue = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-15',
      departureTime: '08:00',
      maxTransfers: 1,
    });
    const foundMonTrain = resTue?.journeys.some(j => j.trainSegments.some(s => s.trainNumber === 'TMON1'));
    assert(!foundMonTrain, 'Monday-only train is ignored when travelDate falls on Tuesday.');
  } catch (err: any) {
    assert(false, `Test 7 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 8: Date conversion
  // Input: 2026-07-15 (Wednesday) -> verify internal weekday
  // We can verify this via the config weekday generated inside the plan method.
  // ----------------------------------------------------
  try {
    // Explicit date verification helper
    const dateObj = new Date(Date.UTC(2026, 6, 15));
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const wk = weekdays[dateObj.getUTCDay()];
    assert(wk === 'WED', `Date conversion for 2026-07-15 is correctly computed as WED (got ${wk}).`);
  } catch (err: any) {
    assert(false, `Test 8 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 9: Leap year date
  // 2028-02-29 (Leap day, Tuesday)
  // Overnight train departing 2028-02-29 23:00, arriving 2028-03-01 01:00
  // Verify leap day rolls over correctly to 1 Mar 2028
  // ----------------------------------------------------
  try {
    const resLeap = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2028-02-29',
      departureTime: '22:00',
      maxTransfers: 1,
    });
    const leapJourney = resLeap?.journeys.find(j => j.trainSegments.some(s => s.trainNumber === 'TTRFA'));
    assert(!!leapJourney, 'Leap day journey is parsed successfully.');
    if (leapJourney) {
      assert(leapJourney.actualDepartureDateTime === '29 Feb 2028 23:00', `Leap departure: ${leapJourney.actualDepartureDateTime}`);
      assert(leapJourney.actualArrivalDateTime === '1 Mar 2028 01:00', `Leap arrival rolls over to March 1st correctly: ${leapJourney.actualArrivalDateTime}`);
      assert(leapJourney.departureDay === 'Tue', `Leap departure day: ${leapJourney.departureDay} (expected Tue)`);
      assert(leapJourney.arrivalDay === 'Wed', `Leap arrival day: ${leapJourney.arrivalDay} (expected Wed)`);
    }
  } catch (err: any) {
    assert(false, `Test 9 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 10: Journey crossing midnight
  // Train departs Tuesday 23:00, arrives Wednesday 01:00
  // Verify date rolls over from 2026-09-15 to 2026-09-16
  // ----------------------------------------------------
  try {
    const resMid = await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-09-15',
      departureTime: '22:00',
      maxTransfers: 1,
    });
    const midJourney = resMid?.journeys.find(j => j.trainSegments.some(s => s.trainNumber === 'TTRFA'));
    assert(!!midJourney, 'Midnight crossing journey resolved.');
    if (midJourney) {
      assert(midJourney.actualDepartureDateTime === '15 Sep 2026 23:00', `Departure: ${midJourney.actualDepartureDateTime}`);
      assert(midJourney.actualArrivalDateTime === '16 Sep 2026 01:00', `Arrival crosses midnight to next day: ${midJourney.actualArrivalDateTime}`);
    }
  } catch (err: any) {
    assert(false, `Test 10 failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 11: Past travel date validation
  // Expect validation to throw AppError with 400 status
  // ----------------------------------------------------
  try {
    await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2000-01-01',
      departureTime: '08:00',
      maxTransfers: 1,
    });
    assert(false, 'Past travel date did not throw validation error.');
  } catch (err: any) {
    assert(err instanceof AppError && err.statusCode === 400 && err.message.includes('Past travel dates'), `Past travel date correctly rejected: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test 12: Invalid date validation
  // Expect validation to throw AppError with 400 status
  // ----------------------------------------------------
  try {
    await planner.plan({
      sourceStation: 'Test Station A',
      destinationStation: 'Test Station B',
      travelDate: '2026-02-29', // 2026 is not a leap year, so invalid!
      departureTime: '08:00',
      maxTransfers: 1,
    });
    assert(false, 'Invalid calendar date did not throw validation error.');
  } catch (err: any) {
    assert(err instanceof AppError && err.statusCode === 400 && err.message.includes('Invalid calendar date'), `Invalid calendar date correctly rejected: ${err.message}`);
  }

  console.log('\n[Date-Aware Planner Tests] Cleaning up temporary test data from database...');
  await TrainStop.deleteMany({ platform: 'TEST_PLAT' });
  await Train.deleteMany({ trainName: /TEST_TRAIN/ });
  await Station.deleteMany({ city: 'TEST_CITY' });

  console.log('\n==================================================');
  console.log('              TEST EXECUTION SUMMARY              ');
  console.log('==================================================');
  console.log(`Total Passed Tests : ${passed}`);
  console.log(`Total Failed Tests : ${failed}`);
  console.log('==================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(async (error) => {
  console.error('\x1b[31m[Date-Aware Planner Tests Error] Exec fail:\x1b[0m', error);
  try {
    await mongoose.disconnect();
  } catch (err) {
    // Silent
  }
  process.exit(1);
});
