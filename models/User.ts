import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  password?: string;
  role: 'veterinarian' | 'admin' | 'staff' | 'receptionist';
  specialization?: string;
  licenseNumber?: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['veterinarian', 'admin', 'staff', 'receptionist'],
      default: 'veterinarian',
    },
    specialization: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple model initialization in development
export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
