import { Document, Types } from 'mongoose';

/**
 * Supported Train Classification Categories.
 */
export enum TrainType {
  EXPRESS = 'Express',
  SUPERFAST = 'Superfast',
  RAJDHANI = 'Rajdhani',
  SHATABDI = 'Shatabdi',
  VANDE_BHARAT = 'Vande Bharat',
  PASSENGER = 'Passenger',
}

/**
 * Days of the week for train scheduling operation.
 */
export enum OperatingDay {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN',
}

/**
 * Transit itinerary optimization filters.
 */
export enum OptimizationMode {
  FASTEST = 'FASTEST',
  BALANCED = 'BALANCED',
  LEAST_TRANSFERS = 'LEAST_TRANSFERS',
  MOST_RELIABLE = 'MOST_RELIABLE',
}

/**
 * Station model interface mapping.
 */
export interface IStation extends Document {
  name: string;
  stationCode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  zone: string;
  isJunction: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Train model interface mapping.
 */
export interface ITrain extends Document {
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  operatingDays: OperatingDay[];
  sourceStation: Types.ObjectId | IStation;
  destinationStation: Types.ObjectId | IStation;
  averageDelayMinutes: number;
  cancellationProbability: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual leg stoppage item mapping.
 */
export interface ITrainStop extends Document {
  trainId: Types.ObjectId | ITrain;
  stationId: Types.ObjectId | IStation;
  stopNumber: number;
  arrivalTime: string;   // Format: HH:mm
  departureTime: string; // Format: HH:mm
  dayOffset: number;
  distanceFromSource: number;
  platform?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User account interface mapping.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // select: false, so optional
  savedStations: Types.ObjectId[] | IStation[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

/**
 * Saved User Journey filter criteria mapping.
 */
export interface ISavedJourney extends Document {
  userId: Types.ObjectId | IUser;
  sourceStation: Types.ObjectId | IStation;
  destinationStation: Types.ObjectId | IStation;
  optimizationMode: OptimizationMode;
  createdAt: Date;
  updatedAt: Date;
}
