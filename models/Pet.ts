import mongoose from 'mongoose';

export interface IPet {
  _id: string;
  petId: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'horse' | 'other';
  breed: string;
  dateOfBirth?: Date;
  age?: string;
  gender: 'male' | 'female' | 'unknown';
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  color?: string;
  microchipNumber?: string;
  // Owner Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress?: string;
  // Medical Information
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  vaccinations: {
    name: string;
    date: Date;
    nextDueDate?: Date;
  }[];
  spayedNeutered?: boolean;
    // Clinic Information
    assignedVet?: string;
    notes?: string;
  status: 'active' | 'inactive' | 'deceased';
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new mongoose.Schema<IPet>(
  {
    petId: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'horse', 'other'],
      required: true,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    age: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      required: true,
    },
    weight: {
      type: Number,
      required: false,
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg',
    },
    color: {
      type: String,
      trim: true,
    },
    microchipNumber: {
      type: String,
      trim: true,
    },
    // Owner Information
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
    ownerAddress: {
      type: String,
      trim: true,
    },
    // Medical Information
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
    vaccinations: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: Date,
        required: true,
      },
      nextDueDate: {
        type: Date,
      },
    }],
    spayedNeutered: {
      type: Boolean,
      default: false,
    },
    // Clinic Information
    assignedVet: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'deceased'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate pet ID
petSchema.pre('save', async function(next) {
  if (!this.petId) {
    try {
      const PetModel = this.constructor as any;
      const lastPet = await PetModel.findOne({}, { petId: 1 }, { sort: { petId: -1 } });
      
      let nextId = 1;
      if (lastPet && lastPet.petId) {
        const match = lastPet.petId.match(/PET-(\d+)/);
        if (match) {
          nextId = parseInt(match[1]) + 1;
        }
      }
      
      this.petId = `PET-${nextId.toString().padStart(4, '0')}`;
      console.log('Generated petId:', this.petId);
    } catch (error) {
      console.error('Error generating pet ID:', error);
      this.petId = `PET-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Prevent multiple model initialization in development
export default mongoose.models.Pet || mongoose.model<IPet>('Pet', petSchema);


