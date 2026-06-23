import mongoose from 'mongoose';

export interface IAppointment {
  _id: string;
  petId?: string;
  petName: string;
  petSpecies?: string;
  petBreed?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  vetName: string;
  vetEmail?: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: 'consultation' | 'follow-up' | 'followUp' | 'checkup' | 'vaccination' | 'surgery' | 'grooming' | 'dental' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'inProgress' | 'completed' | 'cancelled' | 'no-show';
  reason?: string;
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string[];
  weight?: number;
  temperature?: number;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new mongoose.Schema<IAppointment>(
  {
    petId: {
      type: String,
      required: false,
      trim: true,
    },
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    petSpecies: {
      type: String,
      trim: true,
    },
    petBreed: {
      type: String,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    ownerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    vetName: {
      type: String,
      required: true,
      trim: true,
    },
    vetEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ['consultation', 'follow-up', 'followUp', 'checkup', 'vaccination', 'surgery', 'grooming', 'dental', 'emergency'],
      default: 'consultation',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'inProgress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    symptoms: [{
      type: String,
      trim: true,
    }],
    diagnosis: {
      type: String,
      trim: true,
    },
    treatment: {
      type: String,
      trim: true,
    },
    prescriptions: [{
      type: String,
      trim: true,
    }],
    weight: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple model initialization in development
export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);
