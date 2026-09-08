import { Schema, model } from 'mongoose';

const savedJourneySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
    },
    departureStation: { type: String },
    departureStationCode: { type: String },
    destinationStation: { type: String },
    destinationStationCode: { type: String },
    departureTime: { type: String },
    arrivalTime: { type: String },
    totalTimeMinutes: { type: Number },
    travelTimeMinutes: { type: Number },
    waitingTimeMinutes: { type: Number },
    transferCount: { type: Number },
    reliabilityScore: { type: Number },
    overallScore: { type: Number },
    trainSegments: { type: Schema.Types.Mixed },
    travelDate: { type: String },
    actualDepartureDateTime: { type: String },
    actualArrivalDateTime: { type: String },
    arrivalDay: { type: String },
    departureDay: { type: String },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Indexes
savedJourneySchema.index({ userId: 1 });

export const SavedJourney = model('SavedJourney', savedJourneySchema);
export default SavedJourney;
