import { Schema, model } from 'mongoose';

const stationSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Station unique code is required (e.g. KGX).'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Station name is required.'],
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing Station code for rapid indexing searches
stationSchema.index({ code: 1 });

export const Station = model('Station', stationSchema);
export default Station;
