import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { connectDB } from '../config/db';
import { validateDataset } from './validateDataset';

// Import Models
import { Station } from '../models/station.model';
import { Train } from '../models/train.model';
import { TrainStop } from '../models/trainStop.model';

async function seed() {
  // 1) Validate the dataset first
  const isValid = await validateDataset();
  if (!isValid) {
    console.error('\x1b[31m[Seeder Aborted] Dataset validation failed. Seeding is not allowed.\x1b[0m');
    process.exit(1);
  }

  console.log('\x1b[36m[Seeder] Initializing database connection...\x1b[0m');
  await connectDB();

  // 2) Safely clear current collections
  console.log('\x1b[33m[Seeder] Clearing old collections...\x1b[0m');
  await Station.deleteMany({});
  await Train.deleteMany({});
  await TrainStop.deleteMany({});
  console.log('\x1b[32m[Seeder] Database cleared successfully.\x1b[0m\n');

  // Load JSON Files
  const dataDir = path.join(__dirname, '../../data');
  const stationsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'stations.json'), 'utf-8'));
  const trainsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'trains.json'), 'utf-8'));
  const stopsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'trainStops.json'), 'utf-8'));

  // 3) Import Stations
  console.log('Importing Stations...');
  const stationCodeToId = new Map<string, mongoose.Types.ObjectId>();

  // Map stationName in JSON to name in Mongoose Station model
  const processedStations = stationsRaw.map((s: any) => ({
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
  const insertedStations = await Station.insertMany(processedStations);
  insertedStations.forEach((s) => {
    stationCodeToId.set(s.stationCode, s._id as mongoose.Types.ObjectId);
  });
  console.log(`\x1b[32m  ${insertedStations.length} / ${stationsRaw.length} stations imported.\x1b[0m\n`);

  // 4) Import Trains
  console.log('Importing Trains...');
  const trainNumberToId = new Map<string, mongoose.Types.ObjectId>();

  const processedTrains = trainsRaw.map((t: any) => {
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

  const insertedTrains = await Train.insertMany(processedTrains);
  insertedTrains.forEach((t) => {
    trainNumberToId.set(t.trainNumber, t._id as mongoose.Types.ObjectId);
  });
  console.log(`\x1b[32m  ${insertedTrains.length} / ${trainsRaw.length} trains imported.\x1b[0m\n`);

  // 5) Import TrainStops in batches of 1000
  console.log('Importing TrainStops...');
  const processedStops = stopsRaw.map((stop: any) => {
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
    await TrainStop.insertMany(chunk);
    stopsImported += chunk.length;
    console.log(`  ${stopsImported} / ${totalStops}`);
  }

  console.log('\n\x1b[32m==================================================');
  console.log('                 IMPORT COMPLETE                  ');
  console.log('==================================================\x1b[0m');

  // Close the database connection cleanly
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('\x1b[31m[Seeder Fatal Error] Seeding operation failed:\x1b[0m', error);
  try {
    await mongoose.disconnect();
  } catch (disError) {
    // Silent
  }
  process.exit(1);
});
