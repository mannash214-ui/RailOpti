import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from './types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address.',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: [8, 'Password must be at least 8 characters long.'],
      select: false, // Security precaution: exclude password from select results
    },
    savedStations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Station',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password prototype helper
userSchema.methods.comparePassword = async function (passwordInput: string): Promise<boolean> {
  return bcrypt.compare(passwordInput, this.password || '');
};

export const User = model<IUser>('User', userSchema);
export default User;
