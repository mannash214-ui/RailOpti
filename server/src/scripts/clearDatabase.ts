import mongoose from 'mongoose';
import readline from 'readline';
import { connectDB } from '../config/db';

// Import Models
import { Station } from '../models/station.model';
import { Train } from '../models/train.model';
import { TrainStop } from '../models/trainStop.model';
import { User } from '../models/user.model';
import { SavedJourney } from '../models/savedJourney.model';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function clearCollections() {
  console.log('\x1b[33m  Deletions starting...\x1b[0m');
  
  const stationsResult = await Station.deleteMany({});
  console.log(`  - Stations cleared: ${stationsResult.deletedCount}`);

  const trainsResult = await Train.deleteMany({});
  console.log(`  - Trains cleared: ${trainsResult.deletedCount}`);

  const stopsResult = await TrainStop.deleteMany({});
  console.log(`  - TrainStops cleared: ${stopsResult.deletedCount}`);

  const savedJourneysResult = await SavedJourney.deleteMany({});
  console.log(`  - SavedJourneys cleared: ${savedJourneysResult.deletedCount}`);

  const usersResult = await User.deleteMany({});
  console.log(`  - Users cleared: ${usersResult.deletedCount}`);

  console.log('\n\x1b[32m[Clear Complete] All specified collections have been cleared successfully.\x1b[0m\n');
}

async function main() {
  console.log('\x1b[36m[Clear Database] Initializing database connection...\x1b[0m');
  await connectDB();

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
      } catch (error) {
        console.error('\x1b[31m[Clear Error] Operation failed with error:\x1b[0m', error);
      }
    } else {
      console.log('\x1b[36m[Aborted] Database clear operation cancelled by user.\x1b[0m\n');
    }

    await mongoose.disconnect();
  });
}

main().catch(async (error) => {
  console.error('\x1b[31m[Clear Database Fatal Error]:\x1b[0m', error);
  rl.close();
  try {
    await mongoose.disconnect();
  } catch (err) {
    // Silent
  }
  process.exit(1);
});
