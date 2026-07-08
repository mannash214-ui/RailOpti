import { Schema, model } from 'mongoose';

const routeLegSchema = new Schema({
  trainNumber: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
});

const journeySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A saved journey must belong to an authenticated user.'],
    },
    originStation: {
      type: String,
      required: [true, 'Origin station is required.'],
    },
    destinationStation: {
      type: String,
      required: [true, 'Destination station is required.'],
    },
    totalDuration: {
      type: String,
      required: true,
    },
    transfersCount: {
      type: Number,
      required: true,
    },
    avgWaitingTimeMins: {
      type: Number,
      required: true,
    },
    reliabilityIndex: {
      type: Number,
      required: true,
    },
    legs: [routeLegSchema],
  },
  {
    timestamps: true,
  }
);

// Optimize retrieval of saved journeys for a particular user
journeySchema.index({ userId: 1 });

export const Journey = model('Journey', journeySchema);
export default Journey;
