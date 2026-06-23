import mongoose from 'mongoose';

export interface IOwner {
  _id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ownerSchema = new mongoose.Schema<IOwner>(
  {
    ownerId: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
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
    alternatePhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'sms'],
      default: 'phone',
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
ownerSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
ownerSchema.virtual('fullAddress').get(function() {
  const parts = [this.address, this.city, this.state, this.zipCode].filter(Boolean);
  return parts.join(', ');
});

// Pre-save middleware to generate owner ID
ownerSchema.pre('save', async function(next) {
  if (!this.ownerId) {
    try {
      const OwnerModel = this.constructor as any;
      const lastOwner = await OwnerModel.findOne({}, { ownerId: 1 }, { sort: { ownerId: -1 } });
      
      let nextId = 1;
      if (lastOwner && lastOwner.ownerId) {
        const match = lastOwner.ownerId.match(/OWN-(\d+)/);
        if (match) {
          nextId = parseInt(match[1]) + 1;
        }
      }
      
      this.ownerId = `OWN-${nextId.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating owner ID:', error);
      this.ownerId = `OWN-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Ensure virtual fields are included in JSON
ownerSchema.set('toJSON', { virtuals: true });
ownerSchema.set('toObject', { virtuals: true });

export default mongoose.models.Owner || mongoose.model<IOwner>('Owner', ownerSchema);

