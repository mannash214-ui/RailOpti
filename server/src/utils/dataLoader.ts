import stationsData from '../../data/stations.json';
import trainsData from '../../data/trains.json';
import trainStopsData from '../../data/trainStops.json';

let cachedStations: any[] | null = null;
let cachedTrains: any[] | null = null;
let cachedStops: any[] | null = null;

export function getStaticStations(): any[] {
  if (cachedStations) return cachedStations;
  cachedStations = (stationsData as any[]).map((s: any, idx: number) => ({
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
  return cachedStations;
}

export function getStaticTrains(): any[] {
  if (cachedTrains) return cachedTrains;
  cachedTrains = trainsData as any[];
  return cachedTrains;
}

export function getStaticTrainStops(): any[] {
  if (cachedStops) return cachedStops;
  cachedStops = trainStopsData as any[];
  return cachedStops;
}
