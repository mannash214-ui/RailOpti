import mongoose from 'mongoose';
import { Station } from '../models/station.model';
import dotenv from 'dotenv';
dotenv.config();

async function listAllStations() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/optirail');
  const stations = await Station.find({}).sort({ name: 1 });
  console.log(`Total stations: ${stations.length}`);
  console.log('Sample stations:', stations.slice(0, 30).map(s => `${s.name} (${s.stationCode})`));
  await mongoose.disconnect();
}
listAllStations();
