import { Schema, model } from 'mongoose';
import { ISavedJourney, OptimizationMode } from './types';

const savedJourneySchema = new Schema<ISavedJourney>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
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
    optimizationMode: {
      type: String,
      required: [true, 'Optimization mode filter is required.'],
      enum: {
        values: Object.values(OptimizationMode),
        message: '{VALUE} is not a valid optimization mode.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
savedJourneySchema.index({ userId: 1 });
savedJourneySchema.index({ sourceStation: 1 });
savedJourneySchema.index({ destinationStation: 1 });

export const SavedJourney = model<ISavedJourney>('SavedJourney', savedJourneySchema);
export default SavedJourney;
