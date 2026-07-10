import { Schema, model } from 'mongoose';
import { ITrain, TrainType, OperatingDay } from './types';

const trainSchema = new Schema<ITrain>(
  {
    trainNumber: {
      type: String,
      required: [true, 'Train number is required.'],
      trim: true,
      uppercase: true,
      validate: {
        validator: function (v: string) {
          // Accept standard 5-digit train numbers or alphanumeric codes (3-10 digits/chars)
          return /^[A-Z0-9]{3,10}$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid train number (3-10 alphanumeric characters).`,
      },
    },
    trainName: {
      type: String,
      required: [true, 'Train name is required.'],
      trim: true,
    },
    trainType: {
      type: String,
      required: [true, 'Train type is required.'],
      enum: {
        values: Object.values(TrainType),
        message: '{VALUE} is not a valid train type.',
      },
    },
    operatingDays: {
      type: [
        {
          type: String,
          enum: {
            values: Object.values(OperatingDay),
            message: '{VALUE} is not a valid operating day.',
          },
        },
      ],
      required: [true, 'Train operating days must be provided.'],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A train must run on at least one operating day.',
      },
    },
    sourceStation: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Source station reference is required.'],
    },
    destinationStation: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Destination station reference is required.'],
    },
    averageDelayMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Average delay minutes cannot be negative.'],
    },
    cancellationProbability: {
      type: Number,
      default: 0.0,
      min: [0, 'Cancellation probability must be at least 0.'],
      max: [1, 'Cancellation probability cannot exceed 1.'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
trainSchema.index({ trainNumber: 1 }, { unique: true });
trainSchema.index({ sourceStation: 1 });
trainSchema.index({ destinationStation: 1 });

export const Train = model<ITrain>('Train', trainSchema);
export default Train;
