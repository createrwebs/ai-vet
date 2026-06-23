import mongoose from 'mongoose';

export interface IPatient {
  _id: string;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  assignedDoctor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new mongoose.Schema<IPatient>(
  {
    patientId: {
      type: String,
      unique: true,
      required: false, // Will be auto-generated in pre-save hook
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        required: false,
        trim: true,
      },
      phone: {
        type: String,
        required: false,
        trim: true,
      },
      relationship: {
        type: String,
        required: false,
        trim: true,
      },
    },
    medicalHistory: [{
      type: String,
      trim: true,
    }],
    allergies: [{
      type: String,
      trim: true,
    }],
    currentMedications: [{
      type: String,
      trim: true,
    }],
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    assignedDoctor: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate patient ID
patientSchema.pre('save', async function(next) {
  // Always generate patientId if it doesn't exist (for new documents)
  if (!this.patientId) {
    try {
      // Find the highest existing patient ID
      const PatientModel = this.constructor as any;
      const lastPatient = await PatientModel.findOne({}, { patientId: 1 }, { sort: { patientId: -1 } });
      
      let nextId = 1;
      if (lastPatient && lastPatient.patientId) {
        // Extract number from existing patient ID (e.g., "PAT-0001" -> 1)
        const match = lastPatient.patientId.match(/PAT-(\d+)/);
        if (match) {
          nextId = parseInt(match[1]) + 1;
        }
      }
      
      // Generate new patient ID with zero-padding
      this.patientId = `PAT-${nextId.toString().padStart(4, '0')}`;
      console.log('Generated patientId:', this.patientId);
    } catch (error) {
      console.error('Error generating patient ID:', error);
      // Fallback to timestamp-based ID
      this.patientId = `PAT-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Prevent multiple model initialization in development
export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', patientSchema);
