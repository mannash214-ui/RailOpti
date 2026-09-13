import fs from 'fs';
import path from 'path';

let cachedStations: any[] | null = null;
let cachedTrains: any[] | null = null;
let cachedStops: any[] | null = null;

function locateDataDir(): string {
  const possiblePaths = [
    path.join(__dirname, '../../data'),
    path.join(process.cwd(), 'server/data'),
    path.join(process.cwd(), 'data'),
    path.join(__dirname, '../../../data'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, 'stations.json'))) {
      return p;
    }
  }
  
  throw new Error('Data directory containing stations.json could not be located.');
}

export function getStaticStations(): any[] {
  if (cachedStations) return cachedStations;
  const dir = locateDataDir();
  const raw = fs.readFileSync(path.join(dir, 'stations.json'), 'utf-8');
  const data = JSON.parse(raw);
  cachedStations = data.map((s: any, idx: number) => ({
    _id: `stat_${s.stationCode}_${idx}`,
    name: s.stationName,
    stationCode: s.stationCode,
    city: s.city,
    state: s.state,
    latitude: s.latitude,
    longitude: s.longitude,
    zone: s.zone,
    isJunction: s.isJunction,
  }));
  return cachedStations!;
}

export function getStaticTrains(): any[] {
  if (cachedTrains) return cachedTrains;
  const dir = locateDataDir();
  const raw = fs.readFileSync(path.join(dir, 'trains.json'), 'utf-8');
  cachedTrains = JSON.parse(raw);
  return cachedTrains!;
}

export function getStaticTrainStops(): any[] {
  if (cachedStops) return cachedStops;
  const dir = locateDataDir();
  const raw = fs.readFileSync(path.join(dir, 'trainStops.json'), 'utf-8');
  cachedStops = JSON.parse(raw);
  return cachedStops!;
}
