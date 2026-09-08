import * as fs from 'fs';
import * as path from 'path';

// Define core interfaces mapping standard DB structure
interface StationData {
  stationCode: string;
  stationName: string;
  city: string;
  state: string;
  zone: string;
  isJunction: boolean;
  latitude: number;
  longitude: number;
}

interface TrainData {
  trainNumber: string;
  trainName: string;
  trainType: string;
  operatingDays: string[];
  sourceStation: string; // code
  destinationStation: string; // code
  averageDelayMinutes: number;
  delayStandardDeviation: number;
  cancellationProbability: number;
}

interface TrainStopData {
  trainId: string; // trainNumber
  stationId: string; // stationCode
  stopNumber: number;
  arrivalTime: string;
  departureTime: string;
  dayOffset: number;
  distanceFromSource: number;
  platform?: string;
  travelMinutesFromPrevious: number;
}

// Mapping of synthetic stations to real Indian Railways stations
const REAL_STATIONS_MAPPING: Record<string, { code: string; name: string; city: string; state: string; zone: string; isJunction: boolean; latitude: number; longitude: number }> = {
  // West Bengal
  'EX-WB1': { code: 'KQU', name: 'Kamarkundu Junction', city: 'Hooghly', state: 'West Bengal', zone: 'ER', isJunction: true, latitude: 22.8210, longitude: 88.2110 },
  'EX-WB2': { code: 'GMAN', name: 'Gumani', city: 'Murshidabad', state: 'West Bengal', zone: 'ER', isJunction: false, latitude: 24.5210, longitude: 87.8310 },
  'EX-WB3': { code: 'ADST', name: 'Adi Saptagram', city: 'Hooghly', state: 'West Bengal', zone: 'ER', isJunction: false, latitude: 22.9212, longitude: 88.3510 },
  'EX-WB4': { code: 'TPH', name: 'Tinpahar Junction', city: 'Sahibganj', state: 'West Bengal', zone: 'ER', isJunction: true, latitude: 25.0210, longitude: 87.8310 },
  'EX-WB5': { code: 'SDLE', name: 'Swadinpur', city: 'Birbhum', state: 'West Bengal', zone: 'ER', isJunction: false, latitude: 24.2210, longitude: 87.7910 },
  'EX-WB6': { code: 'AMP', name: 'Ahmadpur Junction', city: 'Birbhum', state: 'West Bengal', zone: 'ER', isJunction: true, latitude: 23.8310, longitude: 87.6910 },
  'EX-WB7': { code: 'NDAE', name: 'Nabadwip Dham', city: 'Nadia', state: 'West Bengal', zone: 'ER', isJunction: false, latitude: 23.4110, longitude: 88.3710 },
  'EX-WB8': { code: 'STB', name: 'Shantipur Junction', city: 'Nadia', state: 'West Bengal', zone: 'ER', isJunction: true, latitude: 23.2510, longitude: 88.5410 },
  'EX-WB9': { code: 'TKGP', name: 'Thakurnagar', city: 'North 24 Parganas', state: 'West Bengal', zone: 'ER', isJunction: false, latitude: 22.9810, longitude: 88.7910 },
  'EX-WB10': { code: 'MUG', name: 'Mogra', city: 'Hooghly', state: 'West Bengal', zone: 'ER', isJunction: false, latitude: 22.9810, longitude: 88.3710 },

  // Bihar
  'EX-BH1': { code: 'THA', name: 'Tehta', city: 'Jehanabad', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.1210, longitude: 84.9910 },
  'EX-BH2': { code: 'TEA', name: 'Taregna', city: 'Patna', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.3510, longitude: 85.0210 },
  'EX-BH3': { code: 'MOR', name: 'Mor', city: 'Patna', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.4310, longitude: 85.8710 },
  'EX-BH4': { code: 'LAK', name: 'Lakho', city: 'Begusarai', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.4410, longitude: 86.1910 },
  'EX-BH5': { code: 'UMNR', name: 'Umeshnagar', city: 'Khagaria', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.5310, longitude: 86.4310 },
  'EX-BH6': { code: 'DURE', name: 'Dumraon', city: 'Buxar', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.5310, longitude: 84.1510 },
  'EX-BH7': { code: 'BTA', name: 'Bihta', city: 'Patna', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.5610, longitude: 84.8710 },
  'EX-BH8': { code: 'WRS', name: 'Warisaliganj', city: 'Nawada', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.0110, longitude: 85.6310 },
  'EX-BH9': { code: 'MNP', name: 'Mananpur', city: 'Lakhisarai', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.1310, longitude: 86.2910 },
  'EX-BH10': { code: 'BRYA', name: 'Barhiya', city: 'Lakhisarai', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.2910, longitude: 86.0110 },

  // Assam
  'EX-AS1': { code: 'JM', name: 'Jamunamukh', city: 'Hojai', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 26.1110, longitude: 92.7510 },
  'EX-AS2': { code: 'DHRY', name: 'Dhalpukhuri', city: 'Hojai', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 25.9610, longitude: 92.9510 },
  'EX-AS3': { code: 'BRLF', name: 'Bar Langfer', city: 'Karbi Anglong', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 25.9110, longitude: 93.2510 },
  'EX-AS4': { code: 'JTTN', name: 'Jorhat Town', city: 'Jorhat', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 26.7510, longitude: 94.2210 },
  'EX-AS5': { code: 'NMT', name: 'Namtiali', city: 'Sivasagar', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 26.8510, longitude: 94.7210 },
  'EX-AS6': { code: 'SFR', name: 'Safrai', city: 'Sivasagar', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 26.9610, longitude: 94.9510 },
  'EX-AS7': { code: 'DDKM', name: 'Dikom', city: 'Dibrugarh', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 27.5310, longitude: 95.0510 },
  'EX-AS8': { code: 'MJN', name: 'Makum Junction', city: 'Tinsukia', state: 'Assam', zone: 'NFR', isJunction: true, latitude: 27.5010, longitude: 95.4410 },
  'EX-AS9': { code: 'SQF', name: 'Sukritipur', city: 'Cachar', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 24.8710, longitude: 92.7310 },
  'EX-AS10': { code: 'NKD', name: 'Nekiland', city: 'Karimganj', state: 'Assam', zone: 'NFR', isJunction: false, latitude: 24.7810, longitude: 92.4210 },

  // Odisha
  'EX-OD1': { code: 'HNZ', name: 'Hunsa', city: 'Jajpur', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 20.8910, longitude: 86.2110 },
  'EX-OD2': { code: 'RNTL', name: 'Ranital', city: 'Bhadrak', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 21.1310, longitude: 86.5910 },
  'EX-OD3': { code: 'HIP', name: 'Haldipada', city: 'Balasore', state: 'Odisha', zone: 'SER', isJunction: false, latitude: 21.5710, longitude: 87.0110 },
  'EX-OD4': { code: 'KPJG', name: 'Kerejanga', city: 'Angul', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 20.8510, longitude: 85.0210 },
  'EX-OD5': { code: 'SNDR', name: 'Send Road', city: 'Dhenkanal', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 20.7110, longitude: 85.5210 },
  'EX-OD6': { code: 'SBPD', name: 'Sambalpur Road', city: 'Sambalpur', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 21.4710, longitude: 83.9810 },
  'EX-OD7': { code: 'BRPL', name: 'Barpali', city: 'Bargarh', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 21.1710, longitude: 83.5910 },
  'EX-OD8': { code: 'DFR', name: 'Deogaon Road', city: 'Balangir', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 20.5510, longitude: 83.4310 },
  'EX-OD9': { code: 'SFK', name: 'Sikir', city: 'Titlagarh', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 20.2110, longitude: 83.0510 },
  'EX-OD10': { code: 'SPRD', name: 'Singapur Road Junction', city: 'Rayagada', state: 'Odisha', zone: 'ECoR', isJunction: true, latitude: 19.2610, longitude: 83.4310 },

  // Jharkhand
  'EX-JH1': { code: 'THO', name: 'Tulin', city: 'Purulia', state: 'West Bengal', zone: 'SER', isJunction: false, latitude: 23.3610, longitude: 85.9210 },
  'EX-JH2': { code: 'RDF', name: 'Radhagaon', city: 'Bokaro', state: 'Jharkhand', zone: 'SER', isJunction: false, latitude: 23.6110, longitude: 86.1310 },
  'EX-JH3': { code: 'TELO', name: 'Telo', city: 'Bokaro', state: 'Jharkhand', zone: 'ECR', isJunction: false, latitude: 23.7910, longitude: 86.1710 },
  'EX-JH4': { code: 'HZD', name: 'Hazaribagh Road', city: 'Giridih', state: 'Jharkhand', zone: 'ECR', isJunction: false, latitude: 24.1610, longitude: 85.8310 },
  'EX-JH5': { code: 'DEMU', name: 'Demu', city: 'Latehar', state: 'Jharkhand', zone: 'ECR', isJunction: false, latitude: 23.7510, longitude: 84.3910 },
  'EX-JH6': { code: 'RICR', name: 'Ranchi Road', city: 'Ramgarh', state: 'Jharkhand', zone: 'ECR', isJunction: false, latitude: 23.6310, longitude: 85.5510 },
  'EX-JH7': { code: 'RMT', name: 'Ramgarh Cantt', city: 'Ramgarh', state: 'Jharkhand', zone: 'SER', isJunction: false, latitude: 23.6310, longitude: 85.5110 },
  'EX-JH8': { code: 'KFT', name: 'Kajri', city: 'Palamu', state: 'Jharkhand', zone: 'ECR', isJunction: false, latitude: 24.0810, longitude: 84.1510 },
  'EX-JH9': { code: 'JNP', name: 'Jagadishpur', city: 'Deoghar', state: 'Jharkhand', zone: 'ER', isJunction: false, latitude: 24.1910, longitude: 86.7310 },
  'EX-JH10': { code: 'KBQ', name: 'Kumrabad Rohini', city: 'Deoghar', state: 'Jharkhand', zone: 'ER', isJunction: false, latitude: 24.4910, longitude: 86.6810 },

  // Town/Bypass stations
  'BJU_T': { code: 'GHX', name: 'Garhara', city: 'Barauni', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.4350, longitude: 86.0120 },
  'PNBE_T': { code: 'GZH', name: 'Gulzarbagh', city: 'Patna', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.5990, longitude: 85.1950 },
  'BBS_T': { code: 'MCS', name: 'Mancheswar', city: 'Bhubaneswar', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 20.3150, longitude: 85.8390 },
  'CTC_T': { code: 'KNPR', name: 'Kendrapara Road', city: 'Cuttack', state: 'Odisha', zone: 'ECoR', isJunction: false, latitude: 20.4850, longitude: 85.9010 },
  'ROU_T': { code: 'GP', name: 'Rajgangpur', city: 'Sundargarh', state: 'Odisha', zone: 'SER', isJunction: false, latitude: 22.1890, longitude: 84.5820 },
  'JSG_T': { code: 'IB', name: 'Ib', city: 'Jharsuguda', state: 'Odisha', zone: 'SER', isJunction: false, latitude: 21.9010, longitude: 83.9650 },
  'SBP_T': { code: 'SLRA', name: 'Sarla Junction', city: 'Sambalpur', state: 'Odisha', zone: 'ECoR', isJunction: true, latitude: 21.5120, longitude: 83.9950 },
  'DNR_T': { code: 'NEO', name: 'Neora', city: 'Patna', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.5890, longitude: 84.9750 },
  'KGG_T': { code: 'OLP', name: 'Olapur', city: 'Khagaria', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.5790, longitude: 86.4150 },
  'PNC_T': { code: 'DDGJ', name: 'Deedarganj', city: 'Patna', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.5790, longitude: 85.2850 },
  'KIUL_T': { code: 'MKB', name: 'Mankatha', city: 'Lakhisarai', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 25.3210, longitude: 86.0950 },
  'JAJ_T': { code: 'GHR', name: 'Gidhaur', city: 'Jamui', state: 'Bihar', zone: 'ECR', isJunction: false, latitude: 24.8990, longitude: 86.2850 },
  'BGP_T': { code: 'SAB', name: 'Sabour', city: 'Bhagalpur', state: 'Bihar', zone: 'ER', isJunction: false, latitude: 25.2490, longitude: 87.0550 },
  'RNC_T': { code: 'NKM', name: 'Namkum', city: 'Ranchi', state: 'Jharkhand', zone: 'SER', isJunction: false, latitude: 23.3490, longitude: 85.3850 },
  'DHN_T': { code: 'KDS', name: 'Kusunda Junction', city: 'Dhanbad', state: 'Jharkhand', zone: 'ECR', isJunction: true, latitude: 23.7790, longitude: 86.3950 },
  'MURI_T': { code: 'SLF', name: 'Silli Junction', city: 'Muri', state: 'Jharkhand', zone: 'SER', isJunction: true, latitude: 23.3590, longitude: 85.8350 },
  'JSME_T': { code: 'BDME', name: 'Baidyanathdham', city: 'Deoghar', state: 'Jharkhand', zone: 'ER', isJunction: false, latitude: 24.4930, longitude: 86.6990 }
};

// 1. COMPACT GEOGRAPHICAL STATION DICTIONARY
// Over 300 realistic stations covering West Bengal, Assam, Bihar, Odisha, Jharkhand, Tripura, etc.
const STATIONS_RAW: [string, string, string, string, string, boolean, number, number][] = [
  // West Bengal (ER / SER / NFR)
  ['HWH', 'Howrah Junction', 'Kolkata', 'West Bengal', 'ER', true, 22.5833, 88.3424],
  ['SDAH', 'Sealdah', 'Kolkata', 'West Bengal', 'ER', true, 22.5697, 88.3712],
  ['KOAA', 'Kolkata Chitpur', 'Kolkata', 'West Bengal', 'ER', true, 22.5982, 88.3789],
  ['SHM', 'Shalimar', 'Howrah', 'West Bengal', 'SER', false, 22.5594, 88.3183],
  ['SRC', 'Santragachi Junction', 'Howrah', 'West Bengal', 'SER', true, 22.5714, 88.2917],
  ['KGP', 'Kharagpur Junction', 'Kharagpur', 'West Bengal', 'SER', true, 22.3302, 87.3237],
  ['MDN', 'Midnapore', 'Midnapore', 'West Bengal', 'SER', false, 22.4172, 87.3275],
  ['BWN', 'Bardhaman Junction', 'Bardhaman', 'West Bengal', 'ER', true, 23.2389, 87.8614],
  ['DGR', 'Durgapur', 'Durgapur', 'West Bengal', 'ER', false, 23.4984, 87.3106],
  ['RNG', 'Raniganj', 'Asansol', 'West Bengal', 'ER', false, 23.6121, 87.1124],
  ['ASN', 'Asansol Junction', 'Asansol', 'West Bengal', 'ER', true, 23.6828, 86.9749],
  ['BHP', 'Bolpur Shantiniketan', 'Bolpur', 'West Bengal', 'ER', false, 23.6657, 87.6934],
  ['RPH', 'Rampurhat Junction', 'Rampurhat', 'West Bengal', 'ER', true, 24.1683, 87.7816],
  ['NHT', 'Nalhati Junction', 'Nalhati', 'West Bengal', 'ER', true, 24.2982, 87.8341],
  ['MLDT', 'Malda Town', 'Malda', 'West Bengal', 'ER', true, 25.0108, 88.1362],
  ['NJP', 'New Jalpaiguri Junction', 'Siliguri', 'West Bengal', 'NFR', true, 26.6833, 88.4411],
  ['SGUJ', 'Siliguri Junction', 'Siliguri', 'West Bengal', 'NFR', true, 26.7118, 88.4316],
  ['JPE', 'Jalpaiguri Road', 'Jalpaiguri', 'West Bengal', 'NFR', false, 26.5412, 88.7410],
  ['DQG', 'Dhupguri', 'Dhupguri', 'West Bengal', 'NFR', false, 26.5910, 89.0142],
  ['NCB', 'New Cooch Behar Junction', 'Cooch Behar', 'West Bengal', 'NFR', true, 26.3402, 89.4718],
  ['NOQ', 'New Alipurduar', 'Alipurduar', 'West Bengal', 'NFR', false, 26.5050, 89.7522],
  ['ADRA', 'Adra Junction', 'Adra', 'West Bengal', 'SER', true, 23.4981, 86.6908],
  ['BQA', 'Bankura Junction', 'Bankura', 'West Bengal', 'SER', true, 23.2334, 87.0709],
  ['BDC', 'Bandel Junction', 'Bandel', 'West Bengal', 'ER', true, 22.9238, 88.3752],
  ['SHE', 'Sheoraphuli Junction', 'Serampore', 'West Bengal', 'ER', true, 22.7937, 88.3241],
  ['KWAE', 'Katwa Junction', 'Katwa', 'West Bengal', 'ER', true, 23.6429, 88.1352],
  ['AZ', 'Azimganj Junction', 'Azimganj', 'West Bengal', 'ER', true, 24.2381, 88.2435],
  ['RHA', 'Ranaghat Junction', 'Ranaghat', 'West Bengal', 'ER', true, 23.1782, 88.5638],
  ['NH', 'Naihati Junction', 'Naihati', 'West Bengal', 'ER', true, 22.9009, 88.4239],
  ['BNJ', 'Bongaon Junction', 'Bongaon', 'West Bengal', 'ER', true, 23.0450, 88.8256],
  ['HAS', 'Hasimara', 'Alipurduar', 'West Bengal', 'NFR', false, 26.7450, 89.3450],
  ['APDJ', 'Alipurduar Junction', 'Alipurduar', 'West Bengal', 'NFR', true, 26.4950, 89.5250],
  ['SM', 'Samsi', 'Malda', 'West Bengal', 'NFR', false, 25.2612, 87.9348],
  ['AUB', 'Aluabari Road Junction', 'Islampur', 'West Bengal', 'NFR', true, 26.2750, 88.1912],
  ['TKG', 'Thakurganj', 'Thakurganj', 'West Bengal', 'NFR', false, 26.4410, 88.1310],
  ['BOE', 'Barsoi Junction', 'Barsoi', 'West Bengal', 'NFR', true, 25.6410, 87.9410],
  ['DDL', 'Dalkhola', 'Dalkhola', 'West Bengal', 'NFR', false, 25.8612, 87.8540],
  ['LGL', 'Lalgola', 'Lalgola', 'West Bengal', 'ER', false, 24.4172, 88.2512],
  ['BGB', 'Budge Budge', 'Kolkata', 'West Bengal', 'ER', false, 22.4812, 88.1812],
  ['LLH', 'Liluah', 'Howrah', 'West Bengal', 'ER', false, 22.6189, 88.3412],
  ['RIS', 'Rishra', 'Hooghly', 'West Bengal', 'ER', false, 22.7118, 88.3340],
  ['SRP', 'Serampore', 'Serampore', 'West Bengal', 'ER', false, 22.7538, 88.3412],
  ['CGR', 'Chandannagar', 'Chandannagar', 'West Bengal', 'ER', false, 22.8612, 88.3612],
  ['CNS', 'Chuchura', 'Chinsurah', 'West Bengal', 'ER', false, 22.9010, 88.3840],
  ['PAN', 'Panagarh', 'Panagarh', 'West Bengal', 'ER', false, 23.4410, 87.4612],
  ['SIT', 'Sitarampur Junction', 'Asansol', 'West Bengal', 'ER', true, 23.7010, 86.8710],
  ['SLS', 'Salanpur', 'Salanpur', 'West Bengal', 'ER', false, 23.7712, 86.8812],
  ['BRR', 'Barakar', 'Barakar', 'West Bengal', 'ER', false, 23.7420, 86.8210],
  ['KAN', 'Khana Junction', 'Bardhaman', 'West Bengal', 'ER', true, 23.3421, 87.7410],
  ['FLK', 'Falakata', 'Falakata', 'West Bengal', 'NFR', false, 26.5210, 89.2140],
  ['DLK', 'Dankuni Junction', 'Hooghly', 'West Bengal', 'ER', true, 22.6840, 88.2910],
  ['BLRG', 'Balurghat', 'Balurghat', 'West Bengal', 'NFR', false, 25.2210, 88.7610],
  ['GZO', 'Gazole', 'Malda', 'West Bengal', 'NFR', false, 25.2140, 88.1910],
  ['EKI', 'Eklakhi Junction', 'Malda', 'West Bengal', 'NFR', true, 25.1740, 88.1610],
  ['RDP', 'Radhikapur', 'Dinajpur', 'West Bengal', 'NFR', false, 25.6120, 88.2640],
  ['KNE', 'Kishanganj', 'Kishanganj', 'Bihar', 'NFR', false, 26.0740, 87.9412],
  ['MIG', 'Midnapore Town', 'Midnapore', 'West Bengal', 'SER', false, 22.4210, 87.3110],
  ['VSU', 'Bishnupur Junction', 'Bishnupur', 'West Bengal', 'SER', true, 23.0673, 87.3197],
  ['GBA', 'Garhbeta', 'Garhbeta', 'West Bengal', 'SER', false, 22.8624, 87.3512],
  ['CDGR', 'Chandrakona Road', 'Chandrakona Road', 'West Bengal', 'SER', false, 22.7538, 87.3712],
  ['SLB', 'Salboni', 'Salboni', 'West Bengal', 'SER', false, 22.6412, 87.3212],

  // Assam (NFR)
  ['GHY', 'Guwahati', 'Guwahati', 'Assam', 'NFR', true, 26.1822, 91.7516],
  ['KYQ', 'Kamakhya Junction', 'Guwahati', 'Assam', 'NFR', true, 26.1557, 91.7012],
  ['RNY', 'Rangiya Junction', 'Rangiya', 'Assam', 'NFR', true, 26.4382, 91.6210],
  ['NBQ', 'New Bongaigaon Junction', 'Bongaigaon', 'Assam', 'NFR', true, 26.5112, 90.5612],
  ['LMG', 'Lumding Junction', 'Lumding', 'Assam', 'NFR', true, 25.7510, 93.1810],
  ['SCL', 'Silchar', 'Silchar', 'Assam', 'NFR', false, 24.8210, 92.8010],
  ['DBRG', 'Dibrugarh', 'Dibrugarh', 'Assam', 'NFR', false, 27.4850, 94.9310],
  ['TSK', 'Tinsukia Junction', 'Tinsukia', 'Assam', 'NFR', true, 27.5012, 95.3612],
  ['LEDO', 'Ledo', 'Ledo', 'Assam', 'NFR', false, 27.2910, 95.7310],
  ['DNT', 'Dangari', 'Dangari', 'Assam', 'NFR', false, 27.6010, 95.5310],
  ['GLPT', 'Goalpara Town', 'Goalpara', 'Assam', 'NFR', false, 26.1610, 90.6310],
  ['AYU', 'Abhayapuri Bazar', 'Abhayapuri', 'Assam', 'NFR', false, 26.3312, 90.6610],
  ['KOJ', 'Kokrajhar', 'Kokrajhar', 'Assam', 'NFR', false, 26.4010, 90.2710],
  ['BPRD', 'Barpeta Road', 'Barpeta', 'Assam', 'NFR', false, 26.4950, 90.9710],
  ['CPK', 'Chaparmukh Junction', 'Nagaon', 'Assam', 'NFR', true, 26.2412, 92.5110],
  ['HJI', 'Hojai', 'Hojai', 'Assam', 'NFR', false, 26.0010, 92.8510],
  ['LKA', 'Lanka', 'Hojai', 'Assam', 'NFR', false, 25.9210, 93.0010],
  ['DPU', 'Diphu', 'Diphu', 'Assam', 'NFR', false, 25.8450, 93.4210],
  ['DMV', 'Dimapur', 'Dimapur', 'Nagaland', 'NFR', false, 25.8912, 93.7312], // Nagaland border
  ['FKG', 'Furkating Junction', 'Golaghat', 'Assam', 'NFR', true, 26.4712, 93.9710],
  ['MXN', 'Mariani Junction', 'Jorhat', 'Assam', 'NFR', true, 26.6612, 94.3210],
  ['SLGR', 'Simaluguri Junction', 'Simaluguri', 'Assam', 'NFR', true, 26.8912, 94.8110],
  ['LHB', 'Lahowal', 'Lahowal', 'Assam', 'NFR', false, 27.5010, 95.0010],
  ['LEDO_H', 'Ledo Town', 'Ledo', 'Assam', 'NFR', false, 27.2810, 95.7210],
  ['JID', 'Jagi Road', 'Jagi Road', 'Assam', 'NFR', false, 26.1510, 92.1410],
  ['MBG', 'Maibang', 'Maibang', 'Assam', 'NFR', false, 25.3010, 93.1610],
  ['NHLG', 'New Haflong', 'Haflong', 'Assam', 'NFR', false, 25.1612, 93.0210],
  ['BPB', 'Badarpur Junction', 'Badarpur', 'Assam', 'NFR', true, 24.9010, 92.6210],
  ['KTX', 'Katakhal Junction', 'Katakhal', 'Assam', 'NFR', true, 24.8510, 92.6810],
  ['SCA', 'Salchapra', 'Salchapra', 'Assam', 'NFR', false, 24.8112, 92.7410],
  ['HKD', 'Hailakandi', 'Hailakandi', 'Assam', 'NFR', false, 24.6812, 92.5610],
  ['KXJ', 'Karimganj Junction', 'Karimganj', 'Assam', 'NFR', true, 24.8682, 92.3510],
  ['TNL', 'Tangla', 'Tangla', 'Assam', 'NFR', false, 26.6512, 91.9010],
  ['ULG', 'Udalguri', 'Udalguri', 'Assam', 'NFR', false, 26.7450, 92.1310],
  ['RPAN', 'Rangapara North Junction', 'Rangapara', 'Assam', 'NFR', true, 26.8210, 92.6510],
  ['DKGN', 'Dekargaon', 'Tezpur', 'Assam', 'NFR', false, 26.6612, 92.8310],
  ['GPZ', 'Gohpur', 'Gohpur', 'Assam', 'NFR', false, 26.8812, 93.6310],
  ['VNE', 'Viswanath Charali', 'Charali', 'Assam', 'NFR', false, 26.8612, 93.1510],
  ['DBRT', 'Dibrugarh Town', 'Dibrugarh', 'Assam', 'NFR', false, 27.4810, 94.9010],
  ['NTS', 'New Tinsukia Junction', 'Tinsukia', 'Assam', 'NFR', true, 27.5050, 95.3610],
  ['AGI', 'Amguri Junction', 'Amguri', 'Assam', 'NFR', true, 26.8010, 94.6110],
  ['MRHT', 'Moranhat', 'Moranhat', 'Assam', 'NFR', false, 27.1810, 94.6910],
  ['DMR', 'Dharmanagar', 'Dharmanagar', 'Tripura', 'NFR', false, 24.3612, 92.1610],
  ['ABSA', 'Ambassa', 'Ambassa', 'Tripura', 'NFR', false, 23.9812, 91.8410],
  ['AGTL', 'Agartala', 'Agartala', 'Tripura', 'NFR', true, 23.8340, 91.2828],
  ['UDPU', 'Udaipur', 'Udaipur', 'Tripura', 'NFR', false, 23.5312, 91.4810],
  ['SBRM', 'Sabroom', 'Sabroom', 'Tripura', 'NFR', false, 22.9810, 91.7110],
  ['MANU', 'Manu', 'Manu', 'Tripura', 'NFR', false, 24.0112, 91.9810],
  ['KUGT', 'Kumarghat', 'Kumarghat', 'Tripura', 'NFR', false, 24.1612, 92.0310],
  ['JRN', 'Jirania', 'Jirania', 'Tripura', 'NFR', false, 23.8110, 91.4110],
  ['SKAP', 'Sekerkote', 'Sekerkote', 'Tripura', 'NFR', false, 23.7510, 91.2810],
  ['VBR', 'Bishalgarh', 'Bishalgarh', 'Tripura', 'NFR', false, 23.6912, 91.2610],
  ['MNDP', 'Mendipathar', 'Mendipathar', 'Meghalaya', 'NFR', false, 25.9212, 90.6510],
  ['JRBM', 'Jiribam', 'Jiribam', 'Manipur', 'NFR', false, 24.7910, 93.1210],
  ['BHRB', 'Bairabi', 'Bairabi', 'Mizoram', 'NFR', false, 24.1910, 92.5410],
  ['NHLN', 'Naharlagun', 'Naharlagun', 'Arunachal Pradesh', 'NFR', false, 27.1012, 93.7610],
  ['HMY', 'Harmuti Junction', 'Harmuti', 'Assam', 'NFR', true, 27.0210, 93.8110],
  ['BHAL', 'Bhalukpong', 'Bhalukpong', 'Arunachal Pradesh', 'NFR', false, 27.0112, 92.6410],

  // Bihar (ECR / ER)
  ['PNBE', 'Patna Junction', 'Patna', 'Bihar', 'ECR', true, 25.6022, 85.1194],
  ['DNR', 'Danapur', 'Patna', 'Bihar', 'ECR', true, 25.5912, 85.0410],
  ['ARA', 'Ara Junction', 'Ara', 'Bihar', 'ECR', true, 25.5512, 84.6610],
  ['BXR', 'Buxar', 'Buxar', 'Bihar', 'ECR', false, 25.5712, 83.9710],
  ['RJPB', 'Rajendra Nagar Terminal', 'Patna', 'Bihar', 'ECR', false, 25.5982, 85.1610],
  ['PNC', 'Patna Saheb', 'Patna', 'Bihar', 'ECR', false, 25.5940, 85.2212],
  ['BKP', 'Bakhtiyarpur Junction', 'Bakhtiyarpur', 'Bihar', 'ECR', true, 25.4612, 85.5210],
  ['MKA', 'Mokama Junction', 'Mokama', 'Bihar', 'ECR', true, 25.3912, 85.9010],
  ['BJU', 'Barauni Junction', 'Barauni', 'Bihar', 'ECR', true, 25.4312, 85.9810],
  ['BGS', 'Begusarai', 'Begusarai', 'Bihar', 'ECR', false, 25.4172, 86.1310],
  ['KGG', 'Khagaria Junction', 'Khagaria', 'Bihar', 'ECR', true, 25.5012, 86.4710],
  ['NNA', 'Naugachia', 'Naugachia', 'Bihar', 'ECR', false, 25.3912, 87.1012],
  ['KIR', 'Katihar Junction', 'Katihar', 'Bihar', 'NFR', true, 25.5348, 87.5612],
  ['GAYA', 'Gaya Junction', 'Gaya', 'Bihar', 'ECR', true, 24.7950, 85.0010],
  ['BELA', 'Bela', 'Bela', 'Bihar', 'ECR', false, 25.0310, 84.9910],
  ['JHD', 'Jehanabad', 'Jehanabad', 'Bihar', 'ECR', false, 25.2112, 84.9912],
  ['NWD', 'Nawada', 'Nawada', 'Bihar', 'ECR', false, 24.8812, 85.5410],
  ['KIUL', 'Kiul Junction', 'Kiul', 'Bihar', 'ECR', true, 25.2512, 86.2212],
  ['JAJ', 'Jhajha', 'Jhajha', 'Bihar', 'ECR', true, 24.8912, 86.3812],
  ['JMU', 'Jamui', 'Jamui', 'Bihar', 'ECR', false, 24.9112, 86.2210],
  ['LKR', 'Lakhisarai Junction', 'Lakhisarai', 'Bihar', 'ECR', true, 25.2612, 86.1012],
  ['BGP', 'Bhagalpur Junction', 'Bhagalpur', 'Bihar', 'ER', true, 25.2440, 87.0012],
  ['SGG', 'Sultanganj', 'Sultanganj', 'Bihar', 'ER', false, 25.2410, 86.7410],
  ['JMP', 'Jamalpur Junction', 'Jamalpur', 'Bihar', 'ER', true, 25.3012, 86.5012],
  ['BUA', 'Barhiya', 'Barhiya', 'Bihar', 'ECR', false, 25.2810, 86.0210],
  ['HTZ', 'Hathidah Junction', 'Hathidah', 'Bihar', 'ECR', true, 25.3612, 85.9610],
  ['SHC', 'Saharsa Junction', 'Saharsa', 'Bihar', 'ECR', true, 25.8810, 86.6010],
  ['SBV', 'Simri Bakhtiyarpur', 'Bakhtiyarpur', 'Bihar', 'ECR', false, 25.7510, 86.6210],
  ['COP', 'Copar', 'Copar', 'Bihar', 'ECR', false, 25.6812, 86.5910],
  ['DMH', 'Dauram Madhepura', 'Madhepura', 'Bihar', 'ECR', false, 25.9010, 86.7910],
  ['MNE', 'Mansi Junction', 'Mansi', 'Bihar', 'ECR', true, 25.4812, 86.5910],
  ['THB', 'Thana Bihpur Junction', 'Bihpur', 'Bihar', 'ECR', true, 25.4312, 86.9010],
  ['SMO', 'Semapur', 'Semapur', 'Bihar', 'NFR', false, 25.4610, 87.4210],
  ['SRI', 'Salmari', 'Salmari', 'Bihar', 'NFR', false, 25.6512, 87.7910],
  ['AZR', 'Azamnagar Road', 'Azamnagar', 'Bihar', 'NFR', false, 25.6912, 87.8910],
  ['DNR_T', 'Danapur Town', 'Danapur', 'Bihar', 'ECR', false, 25.6010, 85.0210],
  ['KGG_T', 'Khagaria Town', 'Khagaria', 'Bihar', 'ECR', false, 25.5110, 86.4610],
  ['BJU_T', 'Barauni Town', 'Barauni', 'Bihar', 'ECR', false, 25.4410, 85.9610],
  ['PNC_T', 'Patna Saheb Town', 'Patna', 'Bihar', 'ECR', false, 25.5840, 85.2410],
  ['KIUL_T', 'Kiul Town', 'Kiul', 'Bihar', 'ECR', false, 25.2610, 86.2010],
  ['JAJ_T', 'Jhajha Town', 'Jhajha', 'Bihar', 'ECR', false, 24.9010, 86.3610],
  ['BGP_T', 'Bhagalpur Town', 'Bhagalpur', 'Bihar', 'ER', false, 25.2510, 86.9810],

  // Jharkhand (SER / ECR / ER)
  ['RNC', 'Ranchi Junction', 'Ranchi', 'Jharkhand', 'SER', true, 23.3421, 85.3097],
  ['HTE', 'Hatia', 'Ranchi', 'Jharkhand', 'SER', false, 23.3082, 85.2917],
  ['MURI', 'Muri Junction', 'Muri', 'Jharkhand', 'SER', true, 23.3712, 85.8612],
  ['BKSC', 'Bokaro Steel City', 'Bokaro', 'Jharkhand', 'SER', false, 23.6412, 86.1510],
  ['CRP', 'Chandrapura Junction', 'Chandrapura', 'Jharkhand', 'ECR', true, 23.7512, 86.2210],
  ['GMO', 'Netaji SC Bose Gomoh Junction', 'Gomoh', 'Jharkhand', 'ECR', true, 23.8682, 86.1310],
  ['DHN', 'Dhanbad Junction', 'Dhanbad', 'Jharkhand', 'ECR', true, 23.8012, 86.4312],
  ['MDP', 'Madhupur Junction', 'Madhupur', 'Jharkhand', 'ER', true, 24.2512, 86.6410],
  ['JSME', 'Jasidih Junction', 'Deoghar', 'Jharkhand', 'ER', true, 24.5112, 86.6412],
  ['KQR', 'Koderma Junction', 'Koderma', 'Jharkhand', 'ECR', true, 24.4682, 85.6010],
  ['HZIB', 'Hazaribagh Town', 'Hazaribagh', 'Jharkhand', 'ECR', false, 23.9912, 85.3612],
  ['BRKA', 'Barkakana Junction', 'Barkakana', 'Jharkhand', 'ECR', true, 23.6212, 85.4710],
  ['DTO', 'Daltonganj', 'Daltonganj', 'Jharkhand', 'ECR', false, 24.0312, 84.0710],
  ['LTHR', 'Latehar', 'Latehar', 'Jharkhand', 'ECR', false, 23.7410, 84.5010],
  ['TORI', 'Tori Junction', 'Tori', 'Jharkhand', 'ECR', true, 23.6812, 84.7810],
  ['RHE', 'Rahe', 'Rahe', 'Jharkhand', 'SER', false, 23.3210, 85.7410],
  ['SILLI', 'Silli', 'Silli', 'Jharkhand', 'SER', false, 23.3512, 85.8110],
  ['MHQ', 'Mahuda Junction', 'Mahuda', 'Jharkhand', 'SER', true, 23.7412, 86.2010],
  ['KTH', 'Katrasgarh', 'Katrasgarh', 'Jharkhand', 'ECR', false, 23.8010, 86.2810],
  ['PKA', 'Putki', 'Dhanbad', 'Jharkhand', 'ECR', false, 23.7810, 86.3610],
  ['VAA', 'Bhaga Junction', 'Bhaga', 'Jharkhand', 'SER', true, 23.6810, 86.3910],
  ['JMT', 'Jamtara', 'Jamtara', 'Jharkhand', 'ER', false, 24.0812, 86.8010],
  ['CRJ', 'Chittaranjan', 'Mihijam', 'Jharkhand', 'ER', false, 24.0112, 86.9010],
  ['BRKA_T', 'Barkakana Town', 'Barkakana', 'Jharkhand', 'ECR', false, 23.6110, 85.4510],
  ['RNC_T', 'Ranchi Town', 'Ranchi', 'Jharkhand', 'SER', false, 23.3321, 85.2897],
  ['DHN_T', 'Dhanbad Town', 'Dhanbad', 'Jharkhand', 'ECR', false, 23.8112, 86.4112],
  ['MURI_T', 'Muri Town', 'Muri', 'Jharkhand', 'SER', false, 23.3612, 85.8412],
  ['JSME_T', 'Jasidih Town', 'Deoghar', 'Jharkhand', 'ER', false, 24.5012, 86.6212],

  // Odisha (ECoR / SER)
  ['BBS', 'Bhubaneswar', 'Bhubaneswar', 'Odisha', 'ECoR', true, 20.2524, 85.8449],
  ['CTC', 'Cuttack Junction', 'Cuttack', 'Odisha', 'ECoR', true, 20.4618, 85.8840],
  ['JJKR', 'Jajpur Keonjhar Road', 'Jajpur', 'Odisha', 'ECoR', false, 20.9510, 86.1310],
  ['BHC', 'Bhadrak', 'Bhadrak', 'Odisha', 'ECoR', false, 21.0512, 86.5110],
  ['BLS', 'Balasore', 'Balasore', 'Odisha', 'SER', false, 21.4912, 86.9312],
  ['ROU', 'Rourkela Junction', 'Rourkela', 'Odisha', 'SER', true, 22.2212, 84.8710],
  ['JSG', 'Jharsuguda Junction', 'Jharsuguda', 'Odisha', 'SER', true, 21.8512, 84.0210],
  ['SBP', 'Sambalpur Junction', 'Sambalpur', 'Odisha', 'ECoR', true, 21.4612, 83.9710],
  ['ANGL', 'Angul', 'Angul', 'Odisha', 'ECoR', false, 20.8412, 85.1210],
  ['TLHR', 'Talcher', 'Talcher', 'Odisha', 'ECoR', false, 20.9212, 85.2210],
  ['DNKL', 'Dhenkanal', 'Dhenkanal', 'Odisha', 'ECoR', false, 20.6512, 85.6010],
  ['KUR', 'Khurda Road Junction', 'Jatni', 'Odisha', 'ECoR', true, 20.1512, 85.7010],
  ['PURI', 'Puri', 'Puri', 'Odisha', 'ECoR', false, 19.8118, 85.8110],
  ['BAM', 'Berhampur', 'Brahmapur', 'Odisha', 'ECoR', false, 19.3112, 84.7910],
  ['PSA', 'Palasa', 'Palasa', 'Andhra Pradesh', 'ECoR', false, 18.7712, 84.4110],
  ['BALU', 'Balugaon', 'Balugaon', 'Odisha', 'ECoR', false, 19.7410, 85.2110],
  ['CAP', 'Chatrapur', 'Chatrapur', 'Odisha', 'ECoR', false, 19.3512, 84.9010],
  ['RAIR', 'Rairakhol', 'Rairakhol', 'Odisha', 'ECoR', false, 21.0612, 84.3410],
  ['BRGA', 'Bargarh Road', 'Bargarh', 'Odisha', 'ECoR', false, 21.3312, 83.6210],
  ['BLGR', 'Balangir', 'Balangir', 'Odisha', 'ECoR', false, 20.7212, 83.4810],
  ['TIG', 'Titlagarh Junction', 'Titlagarh', 'Odisha', 'ECoR', true, 20.2812, 83.1410],
  ['KBJ', 'Kantabanji', 'Kantabanji', 'Odisha', 'ECoR', false, 20.4812, 82.6810],
  ['KSNG', 'Kesinga', 'Kesinga', 'Odisha', 'ECoR', false, 20.2012, 83.2210],
  ['MNGD', 'Muniguda', 'Muniguda', 'Odisha', 'ECoR', false, 19.6310, 83.4910],
  ['RGDA', 'Rayagada', 'Rayagada', 'Odisha', 'ECoR', false, 19.1712, 83.4210],
  ['JKP', 'Jakhapura Junction', 'Jakhapura', 'Odisha', 'ECoR', true, 20.9610, 86.1010],
  ['SKND', 'Sukinda Road', 'Sukinda', 'Odisha', 'ECoR', false, 20.9810, 86.2010],
  ['HCNR', 'Harichandanpur', 'Harichandanpur', 'Odisha', 'ECoR', false, 21.3412, 85.7910],
  ['KDJR', 'Kendujhargarh', 'Kendujhar', 'Odisha', 'ECoR', false, 21.6412, 85.6010],
  ['VSKP', 'Visakhapatnam Junction', 'Visakhapatnam', 'Andhra Pradesh', 'ECoR', true, 17.7212, 83.2810],
  ['VZM', 'Vizianagaram Junction', 'Vizianagaram', 'Andhra Pradesh', 'ECoR', true, 18.1212, 83.4010],
  ['BBS_T', 'Bhubaneswar Town', 'Bhubaneswar', 'Odisha', 'ECoR', false, 20.2624, 85.8249],
  ['CTC_T', 'Cuttack Town', 'Cuttack', 'Odisha', 'ECoR', false, 20.4718, 85.8640],
  ['ROU_T', 'Rourkela Town', 'Rourkela', 'Odisha', 'SER', false, 22.2312, 84.8510],
  ['JSG_T', 'Jharsuguda Town', 'Jharsuguda', 'Odisha', 'SER', false, 21.8612, 84.0010],
  ['SBP_T', 'Sambalpur Town', 'Sambalpur', 'Odisha', 'ECoR', false, 21.4712, 83.9510],

  // Extra generic stations to reach ~300
  // Generated systematically to flesh out local branch loops
  ['EX-WB1', 'Chandrakona Halt', 'Chandrakona', 'West Bengal', 'SER', false, 22.7510, 87.3510],
  ['EX-WB2', 'Salboni Halt', 'Salboni', 'West Bengal', 'SER', false, 22.6510, 87.3010],
  ['EX-WB3', 'Garhbeta Road', 'Garhbeta', 'West Bengal', 'SER', false, 22.8812, 87.3610],
  ['EX-WB4', 'Rampurhat Halt', 'Rampurhat', 'West Bengal', 'ER', false, 24.1810, 87.7910],
  ['EX-WB5', 'Nalhati Halt', 'Nalhati', 'West Bengal', 'ER', false, 24.3110, 87.8510],
  ['EX-WB6', 'Bolpur Town', 'Bolpur', 'West Bengal', 'ER', false, 23.6810, 87.7110],
  ['EX-WB7', 'Katwa Town', 'Katwa', 'West Bengal', 'ER', false, 23.6610, 88.1510],
  ['EX-WB8', 'Ranaghat Town', 'Ranaghat', 'West Bengal', 'ER', false, 23.1910, 88.5810],
  ['EX-WB9', 'Bongaon Town', 'Bongaon', 'West Bengal', 'ER', false, 23.0610, 88.8410],
  ['EX-WB10', 'Bandel Town', 'Bandel', 'West Bengal', 'ER', false, 22.9410, 88.3910],
  ['EX-BH1', 'Jehanabad Town', 'Jehanabad', 'Bihar', 'ECR', false, 25.2310, 85.0110],
  ['EX-BH2', 'Taregna Halt', 'Taregna', 'Bihar', 'ECR', false, 25.3210, 85.0310],
  ['EX-BH3', 'Mokama Halt', 'Mokama', 'Bihar', 'ECR', false, 25.4110, 85.9210],
  ['EX-BH4', 'Begusarai Town', 'Begusarai', 'Bihar', 'ECR', false, 25.4310, 86.1510],
  ['EX-BH5', 'Khagaria Halt', 'Khagaria', 'Bihar', 'ECR', false, 25.5210, 86.4910],
  ['EX-BH6', 'Buxar Town', 'Buxar', 'Bihar', 'ECR', false, 25.5910, 83.9910],
  ['EX-BH7', 'Ara Town', 'Ara', 'Bihar', 'ECR', false, 25.5710, 84.6810],
  ['EX-BH8', 'Nawada Halt', 'Nawada', 'Bihar', 'ECR', false, 24.9010, 85.5610],
  ['EX-BH9', 'Jamui Town', 'Jamui', 'Bihar', 'ECR', false, 24.9310, 86.2410],
  ['EX-BH10', 'Lakhisarai Town', 'Lakhisarai', 'Bihar', 'ECR', false, 25.2810, 86.1210],
  ['EX-AS1', 'Hojai Town', 'Hojai', 'Assam', 'NFR', false, 26.0210, 92.8710],
  ['EX-AS2', 'Lanka Town', 'Lanka', 'Assam', 'NFR', false, 25.9410, 93.0210],
  ['EX-AS3', 'Diphu Town', 'Diphu', 'Assam', 'NFR', false, 25.8610, 93.4410],
  ['EX-AS4', 'Mariani Town', 'Jorhat', 'Assam', 'NFR', false, 26.6810, 94.3410],
  ['EX-AS5', 'Amguri Town', 'Amguri', 'Assam', 'NFR', false, 26.8210, 94.6310],
  ['EX-AS6', 'Simaluguri Town', 'Simaluguri', 'Assam', 'NFR', false, 26.9110, 94.8310],
  ['EX-AS7', 'Dibrugarh Bypass', 'Dibrugarh', 'Assam', 'NFR', false, 27.4610, 94.9310],
  ['EX-AS8', 'Tinsukia Town', 'Tinsukia', 'Assam', 'NFR', false, 27.5210, 95.3810],
  ['EX-AS9', 'Badarpur Town', 'Badarpur', 'Assam', 'NFR', false, 24.9210, 92.6410],
  ['EX-AS10', 'Karimganj Town', 'Karimganj', 'Assam', 'NFR', false, 24.8810, 92.3710],
  ['EX-OD1', 'Jajpur Town', 'Jajpur', 'Odisha', 'ECoR', false, 20.9710, 86.1510],
  ['EX-OD2', 'Bhadrak Halt', 'Bhadrak', 'Odisha', 'ECoR', false, 21.0710, 86.5310],
  ['EX-OD3', 'Balasore Town', 'Balasore', 'Odisha', 'SER', false, 21.5110, 86.9510],
  ['EX-OD4', 'Angul Town', 'Angul', 'Odisha', 'ECoR', false, 20.8610, 85.1410],
  ['EX-OD5', 'Dhenkanal Town', 'Dhenkanal', 'Odisha', 'ECoR', false, 20.6710, 85.6210],
  ['EX-OD6', 'Sambalpur Halt', 'Sambalpur', 'Odisha', 'ECoR', false, 21.4810, 83.9910],
  ['EX-OD7', 'Bargarh Town', 'Bargarh', 'Odisha', 'ECoR', false, 21.3510, 83.6410],
  ['EX-OD8', 'Balangir Town', 'Balangir', 'Odisha', 'ECoR', false, 20.7410, 83.5010],
  ['EX-OD9', 'Titlagarh Halt', 'Titlagarh', 'Odisha', 'ECoR', false, 20.3010, 83.1610],
  ['EX-OD10', 'Rayagada Town', 'Rayagada', 'Odisha', 'ECoR', false, 19.1910, 83.4410],
  ['EX-JH1', 'Muri Halt', 'Muri', 'Jharkhand', 'SER', false, 23.3810, 85.8810],
  ['EX-JH2', 'Bokaro Town', 'Bokaro', 'Jharkhand', 'SER', false, 23.6610, 86.1710],
  ['EX-JH3', 'Gomoh Town', 'Gomoh', 'Jharkhand', 'ECR', false, 23.8810, 86.1510],
  ['EX-JH4', 'Koderma Town', 'Koderma', 'Jharkhand', 'ECR', false, 24.4810, 85.6210],
  ['EX-JH5', 'Latehar Town', 'Latehar', 'Jharkhand', 'ECR', false, 23.7610, 84.5210],
  ['EX-JH6', 'Tori Town', 'Tori', 'Jharkhand', 'ECR', false, 23.7010, 84.8010],
  ['EX-JH7', 'Barkakana Halt', 'Barkakana', 'Jharkhand', 'ECR', false, 23.6310, 85.4910],
  ['EX-JH8', 'Daltonganj Town', 'Daltonganj', 'Jharkhand', 'ECR', false, 24.0510, 84.0910],
  ['EX-JH9', 'Madhupur Town', 'Madhupur', 'Jharkhand', 'ER', false, 24.2710, 86.6610],
  ['EX-JH10', 'Jasidih Halt', 'Deoghar', 'Jharkhand', 'ER', false, 24.5310, 86.6610]
];

// Map raw stations to objects using the REAL_STATIONS_MAPPING replacement table
const STATIONS: StationData[] = STATIONS_RAW.map(([code, name, city, state, zone, isJunction, lat, lon]) => {
  if (REAL_STATIONS_MAPPING[code]) {
    const r = REAL_STATIONS_MAPPING[code];
    return {
      stationCode: r.code,
      stationName: r.name,
      city: r.city,
      state: r.state,
      zone: r.zone,
      isJunction: r.isJunction,
      latitude: r.latitude,
      longitude: r.longitude,
    };
  }
  return {
    stationCode: code,
    stationName: name,
    city,
    state,
    zone,
    isJunction,
    latitude: lat,
    longitude: lon,
  };
});

// Build helper map for quick code checks
const STATIONS_MAP = new Map<string, StationData>();
for (const s of STATIONS) {
  STATIONS_MAP.set(s.stationCode, s);
}

// 2. DEFINE REALISTIC CONNECTED CORRIDORS
// Paths must overlap to generate transfer opportunities
const CORRIDORS: string[][] = [
  // 1) East Coast Corridor: Howrah to Visakhapatnam
  ['HWH', 'LLH', 'RIS', 'SRP', 'CGR', 'CNS', 'BDC', 'KGP', 'EX-OD3', 'BLS', 'EX-OD2', 'BHC', 'JJKR', 'EX-OD1', 'CTC', 'BBS', 'KUR', 'BALU', 'CAP', 'BAM', 'PSA', 'VZM', 'VSKP'],
  // 2) Main Line Trunk North: Howrah to Guwahati via Malda Town
  ['HWH', 'BWN', 'BHP', 'EX-WB6', 'RPH', 'EX-WB4', 'NHT', 'EX-WB5', 'MLDT', 'SM', 'BOE', 'KNE', 'AUB', 'TKG', 'NJP', 'JPE', 'DQG', 'FLK', 'NCB', 'NOQ', 'KOJ', 'NBQ', 'BPRD', 'RNY', 'KYQ', 'GHY'],
  // 3) Gangetic Trunk Main: Howrah to Patna
  ['HWH', 'BWN', 'PAN', 'DGR', 'RNG', 'ASN', 'SIT', 'SLS', 'BRR', 'CRJ', 'JMT', 'MDP', 'EX-JH9', 'JSME', 'EX-JH10', 'JAJ', 'EX-BH9', 'JMU', 'KIUL', 'LKR', 'EX-BH10', 'BUA', 'HTZ', 'MKA', 'EX-BH3', 'BKP', 'PNC', 'RJPB', 'PNBE'],
  // 4) Ganga-Brahmaputra Link: Patna to Guwahati via Katihar
  ['PNBE', 'RJPB', 'PNC', 'BKP', 'MKA', 'BJU', 'BGS', 'EX-BH4', 'KGG', 'EX-BH5', 'MNE', 'THB', 'NNA', 'KIR', 'SMO', 'SRI', 'BOE', 'KNE', 'NJP', 'JPE', 'NCB', 'NBQ', 'GLPT', 'AYU', 'KYQ', 'GHY'],
  // 5) Surma Valley Link: Guwahati to Silchar
  ['GHY', 'JID', 'CPK', 'HJI', 'EX-AS1', 'LKA', 'EX-AS2', 'LMG', 'EX-AS3', 'DPU', 'DMV', 'MBG', 'NHLG', 'EX-AS9', 'BPB', 'KTX', 'SCA', 'SCL'],
  // 6) Upper Assam Trunk: Guwahati to Tinsukia / Ledo
  ['GHY', 'JID', 'HJI', 'LMG', 'DPU', 'DMV', 'FKG', 'MXN', 'EX-AS4', 'AGI', 'EX-AS5', 'SLGR', 'EX-AS6', 'MRHT', 'LHB', 'DBRG', 'DBRT', 'NTS', 'TSK', 'LEDO', 'DNT'],
  // 7) Tripura Border Link: Silchar to Sabroom / Agartala
  ['SCL', 'KTX', 'HKD', 'BPB', 'EX-AS10', 'KXJ', 'DMR', 'KUGT', 'MANU', 'ABSA', 'JRN', 'AGTL', 'SKAP', 'VBR', 'UDPU', 'SBRM'],
  // 8) Ranchi Loop: Ranchi to Patna
  ['RNC', 'HTE', 'MURI', 'EX-JH1', 'SILLI', 'BKSC', 'EX-JH2', 'CRP', 'MHQ', 'KTH', 'PKA', 'GMO', 'EX-JH3', 'KQR', 'EX-JH4', 'GAYA', 'EX-BH8', 'NWD', 'BELA', 'JHD', 'EX-BH1', 'EX-BH2', 'PNBE'],
  // 9) Coal Belt Loop: Ranchi to Howrah
  ['RNC', 'HTE', 'MURI', 'SILLI', 'RHE', 'VAA', 'ADRA', 'BQA', 'VSU', 'GBA', 'CDGR', 'SLB', 'EX-WB3', 'EX-WB2', 'MIG', 'MDN', 'KGP', 'SRC', 'SHM', 'HWH'],
  // 10) Odisha Inland Loop: Bhubaneswar to Rourkela
  ['BBS', 'CTC', 'DNKL', 'EX-OD5', 'TLHR', 'ANGL', 'EX-OD4', 'RAIR', 'SBP', 'EX-OD6', 'BRGA', 'EX-OD7', 'BLGR', 'EX-OD8', 'TIG', 'EX-OD9', 'KBJ', 'KSNG', 'MNGD', 'RGDA', 'EX-OD10', 'JSG', 'ROU'],
  // 11) Hill Top Link: Guwahati to Naharlagun / Arunachal
  ['GHY', 'KYQ', 'RNY', 'TNL', 'ULG', 'RPAN', 'DKGN', 'GPZ', 'VNE', 'HMY', 'NHLN', 'BHAL'],
  // 12) West-East Link: Katihar to Siliguri (Mahananda valley)
  ['KIR', 'SRI', 'BOE', 'DDL', 'KNE', 'AUB', 'TKG', 'SGUJ', 'NJP']
];

// Clean and substitute codes in corridors
const cleanCorridors = CORRIDORS.map(corridor => {
  return corridor.map(code => {
    if (REAL_STATIONS_MAPPING[code]) {
      return REAL_STATIONS_MAPPING[code].code;
    }
    return code;
  }).filter(code => {
    const exists = STATIONS_MAP.has(code);
    if (!exists) {
      console.warn(`[Warning] Station code ${code} missing from dictionary. Filtering out.`);
    }
    return exists;
  });
});

// Calculate distance using Haversine formula (km)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 1.15 * 10) / 10;
}

// 3. GENERATE TRAINS AND TIMETABLES USING REAL TRAINS LIST
const trainTypesConfig = {
  'Passenger': { speed: 48, layover: 2, delayAvg: 45, delayStd: 25, cancelProb: 0.02 },
  'Express': { speed: 68, layover: 3, delayAvg: 25, delayStd: 15, cancelProb: 0.01 },
  'Superfast': { speed: 88, layover: 4, delayAvg: 15, delayStd: 10, cancelProb: 0.005 },
  'Rajdhani': { speed: 108, layover: 8, delayAvg: 8, delayStd: 6, cancelProb: 0.002 },
  'Shatabdi': { speed: 102, layover: 6, delayAvg: 10, delayStd: 7, cancelProb: 0.003 },
  'Vande Bharat': { speed: 112, layover: 5, delayAvg: 6, delayStd: 5, cancelProb: 0.002 },
};

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const generatedTrains: TrainData[] = [];
const generatedStops: TrainStopData[] = [];

// Load the raw trains data we pre-filtered
const rawTrainsPath = path.join(__dirname, '../../data/raw_trains.json');
if (!fs.existsSync(rawTrainsPath)) {
  console.error('[Error] raw_trains.json is missing in server/data/. Please generate it first.');
  process.exit(1);
}
const rawTrainsList: Array<{ name: string; number: string }> = JSON.parse(fs.readFileSync(rawTrainsPath, 'utf-8'));

// Filter out duplicate numbers to be absolutely safe
const uniqueRawTrains: Array<{ name: string; number: string }> = [];
const seenTrainNumbers = new Set<string>();
for (const rt of rawTrainsList) {
  if (!seenTrainNumbers.has(rt.number)) {
    uniqueRawTrains.push(rt);
    seenTrainNumbers.add(rt.number);
  }
}

console.log(`Loaded ${uniqueRawTrains.length} unique real trains from raw_trains.json.`);

// We want to generate ~1080 trains. Let's process the unique trains
for (let idx = 0; idx < uniqueRawTrains.length; idx++) {
  const rt = uniqueRawTrains[idx];
  const trainNumber = rt.number;
  const trainName = rt.name;

  // Determine train type from keywords
  let trainType = 'Express';
  const nameUpper = trainName.toUpperCase();
  if (nameUpper.includes('VANDE BHARAT') || nameUpper.includes(' VB ') || nameUpper.includes('V BANDE')) {
    trainType = 'Vande Bharat';
  } else if (nameUpper.includes('SHATABDI') || nameUpper.includes('SHT')) {
    trainType = 'Shatabdi';
  } else if (nameUpper.includes('RAJDHANI') || nameUpper.includes('RJD')) {
    trainType = 'Rajdhani';
  } else if (nameUpper.includes('SUPERFAST') || nameUpper.includes('SF') || nameUpper.includes('SUF')) {
    trainType = 'Superfast';
  } else if (nameUpper.includes('PASSENGER') || nameUpper.includes('PASS') || nameUpper.includes('PAS') || nameUpper.includes('DEMU') || nameUpper.includes('MEMU') || nameUpper.includes('LOCAL')) {
    trainType = 'Passenger';
  }

  const typeConfig = trainTypesConfig[trainType as keyof typeof trainTypesConfig] || trainTypesConfig.Express;

  // Determine target corridor based on keyword scoring
  let bestCorridorIdx = -1;
  let bestScore = -1;

  for (let c = 0; c < cleanCorridors.length; c++) {
    let score = 0;
    const corridor = cleanCorridors[c];
    for (const code of corridor) {
      const station = STATIONS_MAP.get(code)!;
      if (nameUpper.includes(code) || nameUpper.includes(station.city.toUpperCase()) || nameUpper.includes(station.stationName.toUpperCase().replace(' JUNCTION', ''))) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCorridorIdx = c;
    }
  }

  // Fallback to modulo indexing if score is 0
  if (bestScore <= 0) {
    bestCorridorIdx = idx % cleanCorridors.length;
  }

  const corridor = cleanCorridors[bestCorridorIdx];
  const direction = (parseInt(trainNumber, 10) % 2 === 1) ? 'UP' : 'DOWN';
  const path = direction === 'UP' ? [...corridor] : [...corridor].reverse();

  // Selected stop sequence: junctions are always included, intermediate stops are selected based on probability
  const stopsSelected: string[] = [];
  stopsSelected.push(path[0]);

  const inclusionProbability = trainType === 'Passenger' ? 1.0 : (trainType === 'Express' ? 0.65 : (trainType === 'Superfast' ? 0.4 : 0.15));

  for (let i = 1; i < path.length - 1; i++) {
    const s = STATIONS_MAP.get(path[i])!;
    if (s.isJunction) {
      stopsSelected.push(path[i]);
    } else {
      if (idx % 100 / 100 < inclusionProbability) {
        stopsSelected.push(path[i]);
      }
    }
  }
  stopsSelected.push(path[path.length - 1]);

  // Adjust stop sequence length (12 to 25 stops constraints if possible, but keep it realistic)
  let finalStops = stopsSelected;
  if (finalStops.length < 12 && path.length >= 12) {
    const missing = 12 - finalStops.length;
    const currentSet = new Set(finalStops);
    let added = 0;
    for (let i = 0; i < path.length && added < missing; i++) {
      if (!currentSet.has(path[i])) {
        finalStops.push(path[i]);
        added++;
      }
    }
    finalStops = path.filter(code => finalStops.includes(code));
  } else if (finalStops.length > 25) {
    const intermediates = finalStops.slice(1, finalStops.length - 1);
    const junctions = intermediates.filter(code => STATIONS_MAP.get(code)!.isJunction);
    const nonJunctions = intermediates.filter(code => !STATIONS_MAP.get(code)!.isJunction);
    
    const filledIntermediates = [...junctions];
    let fillIdx = 0;
    while (filledIntermediates.length < 23 && fillIdx < nonJunctions.length) {
      filledIntermediates.push(nonJunctions[fillIdx]);
      fillIdx++;
    }
    const sortedIntermediates = path.filter(code => filledIntermediates.includes(code));
    finalStops = [finalStops[0], ...sortedIntermediates, finalStops[finalStops.length - 1]];
  }

  if (finalStops.length < 3) {
    // Fail-safe minimum stops to prevent path reconstructor errors
    finalStops = path.slice(0, Math.min(12, path.length));
  }

  const sourceCode = finalStops[0];
  const destCode = finalStops[finalStops.length - 1];

  // Distribute operating days
  let operatingDays: string[] = [];
  const dayMode = idx % 4;
  if (dayMode === 0 || trainType === 'Passenger') {
    operatingDays = [...WEEK_DAYS]; // Daily
  } else if (dayMode === 1) {
    operatingDays = ['MON', 'WED', 'FRI']; // Tri-weekly
  } else if (dayMode === 2) {
    operatingDays = ['TUE', 'THU', 'SAT']; // Tri-weekly alt
  } else {
    operatingDays = [WEEK_DAYS[idx % 7]]; // Weekly
  }

  // Push train data
  generatedTrains.push({
    trainNumber,
    trainName,
    trainType,
    operatingDays,
    sourceStation: sourceCode,
    destinationStation: destCode,
    averageDelayMinutes: Math.round((typeConfig.delayAvg + (idx % 7)) * 10) / 10,
    delayStandardDeviation: Math.round((typeConfig.delayStd + (idx % 3)) * 10) / 10,
    cancellationProbability: typeConfig.cancelProb,
  });

  // Individual stop timetables generator
  let currentHour = (5 + idx * 2) % 24;
  let currentMinute = (idx * 7) % 60;
  let dayOffset = 0;
  let cumulativeDistance = 0.0;

  for (let i = 0; i < finalStops.length; i++) {
    const currentStopCode = finalStops[i];
    const currentStopStation = STATIONS_MAP.get(currentStopCode)!;

    let arrivalTime = '';
    let departureTime = '';
    let travelMinutes = 0;

    if (i === 0) {
      arrivalTime = 'Source';
      departureTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    } else {
      const prevStopCode = finalStops[i - 1];
      const prevStopStation = STATIONS_MAP.get(prevStopCode)!;

      const distanceDiff = calculateHaversineDistance(
        prevStopStation.latitude,
        prevStopStation.longitude,
        currentStopStation.latitude,
        currentStopStation.longitude
      );

      cumulativeDistance += distanceDiff;

      const hoursNeeded = distanceDiff / typeConfig.speed;
      travelMinutes = Math.round(hoursNeeded * 60);
      if (travelMinutes < 10) travelMinutes = 10;

      currentMinute += travelMinutes;
      while (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
        if (currentHour >= 24) {
          currentHour -= 24;
          dayOffset += 1;
        }
      }

      arrivalTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      if (i === finalStops.length - 1) {
        departureTime = 'Destination';
      } else {
        currentMinute += typeConfig.layover;
        while (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
          if (currentHour >= 24) {
            currentHour -= 24;
            dayOffset += 1;
          }
        }
        departureTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      }
    }

    generatedStops.push({
      trainId: trainNumber,
      stationId: currentStopCode,
      stopNumber: i + 1,
      arrivalTime,
      departureTime,
      dayOffset,
      distanceFromSource: Math.round(cumulativeDistance * 10) / 10,
      platform: (1 + ((i + idx) % 8)).toString(), // Platform 1 to 8
      travelMinutesFromPrevious: travelMinutes,
    });
  }
}

// 5. EXPORT TO JSON FILES
const OUTPUT_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'stations.json'),
  JSON.stringify(STATIONS, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'trains.json'),
  JSON.stringify(generatedTrains, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'trainStops.json'),
  JSON.stringify(generatedStops, null, 2),
  'utf-8'
);

console.log('==================================================');
console.log('Real Indian Railways Network Dataset Complete!');
console.log('==================================================');
console.log(`Generated Stations   : ${STATIONS.length}`);
console.log(`Generated Trains     : ${generatedTrains.length}`);
console.log(`Generated TrainStops : ${generatedStops.length}`);
console.log(`Saved output files to: ${OUTPUT_DIR}`);
console.log('==================================================');
