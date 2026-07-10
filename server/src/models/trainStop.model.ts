import { Schema, model } from 'mongoose';
import { ITrainStop } from './types';

const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const trainStopSchema = new Schema<ITrainStop>(
  {
    trainId: {
      type: Schema.Types.ObjectId,
      ref: 'Train',
      required: [true, 'Train reference is required.'],
    },
    stationId: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required.'],
    },
    stopNumber: {
      type: Number,
      required: [true, 'Stop sequence number is required.'],
      min: [1, 'Stop sequence number must be at least 1.'],
      validate: {
        validator: Number.isInteger,
        message: 'Stop sequence number must be an integer.',
      },
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required.'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return v === 'Source' || timeFormatRegex.test(v);
        },
        message: (props: any) => `${props.value} is not a valid arrival time (must be HH:mm or 'Source').`,
      },
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required.'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return v === 'Destination' || timeFormatRegex.test(v);
        },
        message: (props: any) => `${props.value} is not a valid departure time (must be HH:mm or 'Destination').`,
      },
    },
    dayOffset: {
      type: Number,
      required: [true, 'Day offset is required.'],
      default: 0,
      min: [0, 'Day offset cannot be negative.'],
      validate: {
        validator: Number.isInteger,
        message: 'Day offset must be an integer.',
      },
    },
    distanceFromSource: {
      type: Number,
      required: [true, 'Distance from source is required.'],
      min: [0, 'Distance from source must be at least 0.'],
    },
    platform: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for ultra-efficient journey planning path searches
// 1. Seq stops lookup per train (Unique compound index, since a train stops at sequence index once)
trainStopSchema.index({ trainId: 1, stopNumber: 1 }, { unique: true });

// 2. Lookup trains leaving a station (out-edges for Dijkstra/RAPTOR expansion)
trainStopSchema.index({ stationId: 1, departureTime: 1 });

// 3. Lookup trains arriving at a station (in-edges for reverse searches)
trainStopSchema.index({ stationId: 1, arrivalTime: 1 });

// 4. Quick schedule membership check (does train stop at station)
trainStopSchema.index({ stationId: 1, trainId: 1 });

export const TrainStop = model<ITrainStop>('TrainStop', trainStopSchema);
export default TrainStop;
