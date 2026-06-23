import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { requirePermission } from '@/lib/auth-middleware';

export async function GET() {
  try {
    // Check if user can read patients
    await requirePermission('patients.canRead');

    await dbConnect();
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    return NextResponse.json(patients);
  } catch (error: any) {
    console.error('Error fetching patients:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden: Insufficient permissions') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user can create patients
    await requirePermission('patients.canCreate');

    await dbConnect();
    const body = await request.json();
    
    // Debug: Log the incoming data
    console.log('Incoming patient data:', JSON.stringify(body, null, 2));
    
    // Clean up the data: convert empty strings to undefined for optional fields
    const cleanedData: any = {
      name: body.name,
      email: body.email,
      phone: body.phone ? body.phone.trim() : '',
      dateOfBirth: body.dateOfBirth,
      gender: body.gender || '',
      medicalHistory: body.medicalHistory || [],
      allergies: body.allergies || [],
      currentMedications: body.currentMedications || [],
    };
    if (body.address && body.address.trim()) {
      cleanedData.address = body.address.trim();
    }
    if (body.bloodType && body.bloodType.trim() && body.bloodType !== 'none') {
      cleanedData.bloodType = body.bloodType;
    }
    
    // Handle emergency contact - only include if at least one field has a value
    if (body.emergencyContact) {
      const emergencyContact: any = {};
      if (body.emergencyContact.name && body.emergencyContact.name.trim()) {
        emergencyContact.name = body.emergencyContact.name.trim();
      }
      if (body.emergencyContact.phone && body.emergencyContact.phone.trim()) {
        emergencyContact.phone = body.emergencyContact.phone.trim();
      }
      if (body.emergencyContact.relationship && body.emergencyContact.relationship.trim()) {
        emergencyContact.relationship = body.emergencyContact.relationship.trim();
      }
      
      // Only add emergencyContact if it has at least one field
      if (Object.keys(emergencyContact).length > 0) {
        cleanedData.emergencyContact = emergencyContact;
      }
    }
    
    console.log('Cleaned patient data:', JSON.stringify(cleanedData, null, 2));
    
    const patient = new Patient(cleanedData);
    
    // Validate the patient before saving
    const validationError = patient.validateSync();
    if (validationError) {
      console.error('Validation error details:', validationError);
      const errorMessages: string[] = [];
      if (validationError.errors) {
        Object.keys(validationError.errors).forEach(key => {
          errorMessages.push(`${key}: ${validationError.errors[key].message}`);
        });
      }
      return NextResponse.json({ 
        error: 'Patient validation failed', 
        details: errorMessages.length > 0 ? errorMessages.join(', ') : validationError.message 
      }, { status: 400 });
    }
    
    await patient.save();
    
    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    console.error('Error creating patient:', error);
    
    // Handle duplicate key error (e.g., duplicate email)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ 
        error: 'Duplicate entry',
        details: `${field} already exists`
      }, { status: 400 });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages: string[] = [];
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          errorMessages.push(`${key}: ${error.errors[key].message}`);
        });
      }
      return NextResponse.json({ 
        error: 'Patient validation failed', 
        details: errorMessages.length > 0 ? errorMessages.join(', ') : error.message 
      }, { status: 400 });
    }
    
    // Handle authorization errors
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden: Insufficient permissions') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create patient',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
