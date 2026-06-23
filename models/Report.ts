import mongoose from 'mongoose';

export interface IReport {
  _id: string;
  petId: string;
  petName: string;
  petSpecies?: string;
  ownerName?: string;
  vetId: string;
  vetName: string;
  reportType: 'lab' | 'imaging' | 'diagnostic' | 'treatment' | 'follow-up' | 'vaccination' | 'surgery' | 'dental';
  reportDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'reviewed';
  findings: string;
  diagnosis: string;
  recommendations: string;
  prescriptions?: string[];
  attachments?: string[];
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new mongoose.Schema<IReport>(
  {
    petId: {
      type: String,
      required: true,
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
    ownerName: {
      type: String,
      trim: true,
    },
    vetId: {
      type: String,
      required: true,
    },
    vetName: {
      type: String,
      required: true,
      trim: true,
    },
    reportType: {
      type: String,
      enum: ['lab', 'imaging', 'diagnostic', 'treatment', 'follow-up', 'vaccination', 'surgery', 'dental'],
      required: true,
    },
    reportDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'reviewed'],
      default: 'pending',
    },
    findings: {
      type: String,
      required: true,
      trim: true,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    recommendations: {
      type: String,
      required: true,
      trim: true,
    },
    prescriptions: [{
      type: String,
      trim: true,
    }],
    attachments: [{
      type: String,
      trim: true,
    }],
    notes: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple model initialization in development
export default mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema);
