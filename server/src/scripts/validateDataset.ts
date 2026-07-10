import * as fs from 'fs';
import * as path from 'path';

const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export async function validateDataset(): Promise<boolean> {
  console.log('\x1b[36m[Validator] Starting dataset validation checks...\x1b[0m');
  
  const dataDir = path.join(__dirname, '../../data');
  const stationsPath = path.join(dataDir, 'stations.json');
  const trainsPath = path.join(dataDir, 'trains.json');
  const stopsPath = path.join(dataDir, 'trainStops.json');

  // 1) Read JSON files
  if (!fs.existsSync(stationsPath) || !fs.existsSync(trainsPath) || !fs.existsSync(stopsPath)) {
    console.error('\x1b[31m[Validator Error] Required JSON files are missing in server/data/ directory.\x1b[0m');
    return false;
  }

  const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf-8'));
  const trains = JSON.parse(fs.readFileSync(trainsPath, 'utf-8'));
  const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf-8'));

  const errors: string[] = [];
  const warnings: string[] = [];

  // 2) Unique stationCodes check
  const stationCodes = new Set<string>();
  for (const s of stations) {
    if (!s.stationCode) {
      errors.push(`Station object missing stationCode: ${JSON.stringify(s)}`);
      continue;
    }
    if (stationCodes.has(s.stationCode)) {
      errors.push(`Duplicate stationCode detected: ${s.stationCode}`);
    }
    stationCodes.add(s.stationCode);
  }

  // 3) Unique trainNumbers check
  const trainNumbers = new Set<string>();
  for (const t of trains) {
    if (!t.trainNumber) {
      errors.push(`Train object missing trainNumber: ${JSON.stringify(t)}`);
      continue;
    }
    if (trainNumbers.has(t.trainNumber)) {
      errors.push(`Duplicate trainNumber detected: ${t.trainNumber}`);
    }
    trainNumbers.add(t.trainNumber);

    // Verify sourceStation and destinationStation refer to valid stations
    if (!t.sourceStation) {
      errors.push(`Train ${t.trainNumber} is missing sourceStation.`);
    } else if (!stationCodes.has(t.sourceStation)) {
      errors.push(`Train ${t.trainNumber} has non-existent sourceStation: ${t.sourceStation}`);
    }

    if (!t.destinationStation) {
      errors.push(`Train ${t.trainNumber} is missing destinationStation.`);
    } else if (!stationCodes.has(t.destinationStation)) {
      errors.push(`Train ${t.trainNumber} has non-existent destinationStation: ${t.destinationStation}`);
    }
  }

  // Group stops by train number to validate sequencing and properties
  const stopsByTrain = new Map<string, any[]>();
  for (const stop of stops) {
    const tId = stop.trainId;
    if (!stopsByTrain.has(tId)) {
      stopsByTrain.set(tId, []);
    }
    stopsByTrain.get(tId)!.push(stop);
  }

  // 4) Referential, sequence, chronology, and duplicate stop checks
  const trainStopUniqueness = new Set<string>(); // Tracks duplicate trainId + stationId stops

  for (const [trainId, trainStops] of stopsByTrain.entries()) {
    // Check if train number exists in trains dataset
    if (!trainNumbers.has(trainId)) {
      errors.push(`TrainStop references non-existent trainNumber: ${trainId}`);
    }

    // Sort stops by stopNumber to check sequence
    trainStops.sort((a, b) => a.stopNumber - b.stopNumber);

    let lastStopNumber = 0;
    let lastDayOffset = 0;
    
    for (let idx = 0; idx < trainStops.length; idx++) {
      const stop = trainStops[idx];

      // Station reference check
      if (!stationCodes.has(stop.stationId)) {
        errors.push(`TrainStop for Train ${trainId} references non-existent stationCode: ${stop.stationId}`);
      }

      // Unique Stop constraint check
      const uniqueStopKey = `${trainId}-${stop.stationId}`;
      if (trainStopUniqueness.has(uniqueStopKey)) {
        errors.push(`Duplicate TrainStop found (same Train at same Station twice): ${trainId} stopping at ${stop.stationId}`);
      }
      trainStopUniqueness.add(uniqueStopKey);

      // Stop sequencing checks (starts at 1, increments sequentially by 1)
      const expectedStopNumber = lastStopNumber + 1;
      if (stop.stopNumber !== expectedStopNumber) {
        errors.push(`Train ${trainId} has out-of-sequence stopNumber. Expected: ${expectedStopNumber}, Found: ${stop.stopNumber}`);
      }
      lastStopNumber = stop.stopNumber;

      // Day offset monotonicity check
      if (stop.dayOffset < lastDayOffset) {
        errors.push(`Train ${trainId} at stop ${stop.stationId} has dayOffset decrease. Current: ${stop.dayOffset}, Previous: ${lastDayOffset}`);
      }
      lastDayOffset = stop.dayOffset;

      // Arrival & Departure Time formats validation
      if (idx === 0) {
        // First stop
        if (stop.arrivalTime !== 'Source') {
          errors.push(`Train ${trainId} origin stop arrivalTime must be "Source". Found: "${stop.arrivalTime}"`);
        }
        if (!timeFormatRegex.test(stop.departureTime)) {
          errors.push(`Train ${trainId} origin departureTime has invalid format: "${stop.departureTime}"`);
        }
      } else if (idx === trainStops.length - 1) {
        // Final stop
        if (stop.departureTime !== 'Destination') {
          errors.push(`Train ${trainId} destination stop departureTime must be "Destination". Found: "${stop.departureTime}"`);
        }
        if (!timeFormatRegex.test(stop.arrivalTime)) {
          errors.push(`Train ${trainId} destination arrivalTime has invalid format: "${stop.arrivalTime}"`);
        }
      } else {
        // Intermediate stop
        if (!timeFormatRegex.test(stop.arrivalTime)) {
          errors.push(`Train ${trainId} stop ${stop.stopNumber} (${stop.stationId}) arrivalTime invalid: "${stop.arrivalTime}"`);
        }
        if (!timeFormatRegex.test(stop.departureTime)) {
          errors.push(`Train ${trainId} stop ${stop.stopNumber} (${stop.stationId}) departureTime invalid: "${stop.departureTime}"`);
        }
      }
    }
  }

  // 5) Print detailed validation report
  console.log('\n==================================================');
  console.log('              DATASET VALIDATION REPORT           ');
  console.log('==================================================');
  console.log(`Stations Checked   : ${stations.length}`);
  console.log(`Trains Checked     : ${trains.length}`);
  console.log(`TrainStops Checked : ${stops.length}`);
  console.log('--------------------------------------------------');
  
  if (errors.length > 0) {
    console.log(`\x1b[31mStatus             : FAILED (${errors.length} errors found)\x1b[0m`);
    console.log('--------------------------------------------------');
    console.log('Errors List (First 15 shown):');
    errors.slice(0, 15).forEach((err, index) => {
      console.log(`[${index + 1}] ${err}`);
    });
    if (errors.length > 15) {
      console.log(`... and ${errors.length - 15} more errors.`);
    }
    console.log('==================================================\n');
    return false;
  } else {
    console.log('\x1b[32mStatus             : PASSED (Zero errors found)\x1b[0m');
    if (warnings.length > 0) {
      console.log(`Warnings           : ${warnings.length} issues flagged`);
      warnings.forEach((warn, index) => console.log(` - [Warning ${index + 1}] ${warn}`));
    } else {
      console.log('Warnings           : None');
    }
    console.log('==================================================\n');
    return true;
  }
}

// Executable startup hook
if (require.main === module) {
  validateDataset().then((isValid) => {
    if (!isValid) {
      process.exit(1);
    }
  }).catch((err) => {
    console.error('Fatal unhandled exception in validation script:', err);
    process.exit(1);
  });
}
