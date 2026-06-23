import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Pet from '@/models/Pet';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const pets = await Pet.find({}).sort({ createdAt: -1 });
    return NextResponse.json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    // Debug: Log the incoming data
    console.log('Incoming pet data:', JSON.stringify(body, null, 2));
    
    // Clean up the data
    const cleanedData: any = {
      name: body.name,
      species: body.species,
      breed: body.breed,
      gender: body.gender,
      ownerName: body.ownerName,
      ownerEmail: body.ownerEmail,
      ownerPhone: body.ownerPhone ? body.ownerPhone.trim() : '',
      medicalHistory: body.medicalHistory || [],
      allergies: body.allergies || [],
      currentMedications: body.currentMedications || [],
      vaccinations: body.vaccinations || [],
      status: body.status || 'active',
    };
    
    // Optional fields
    if (body.dateOfBirth) {
      cleanedData.dateOfBirth = body.dateOfBirth;
    }
    if (body.age && body.age.trim()) {
      cleanedData.age = body.age.trim();
    }
    if (body.weight) {
      cleanedData.weight = body.weight;
    }
    if (body.weightUnit) {
      cleanedData.weightUnit = body.weightUnit;
    }
    if (body.color && body.color.trim()) {
      cleanedData.color = body.color.trim();
    }
    if (body.microchipNumber && body.microchipNumber.trim()) {
      cleanedData.microchipNumber = body.microchipNumber.trim();
    }
    if (body.ownerAddress && body.ownerAddress.trim()) {
      cleanedData.ownerAddress = body.ownerAddress.trim();
    }
    if (body.spayedNeutered !== undefined) {
      cleanedData.spayedNeutered = body.spayedNeutered;
    }
    if (body.assignedVet && body.assignedVet.trim()) {
      cleanedData.assignedVet = body.assignedVet.trim();
    }
    if (body.notes && body.notes.trim()) {
      cleanedData.notes = body.notes.trim();
    }
    
    console.log('Cleaned pet data:', JSON.stringify(cleanedData, null, 2));
    
    const pet = new Pet(cleanedData);
    
    // Validate the pet before saving
    const validationError = pet.validateSync();
    if (validationError) {
      console.error('Validation error details:', validationError);
      const errorMessages: string[] = [];
      if (validationError.errors) {
        Object.keys(validationError.errors).forEach(key => {
          errorMessages.push(`${key}: ${validationError.errors[key].message}`);
        });
      }
      return NextResponse.json({ 
        error: 'Pet validation failed', 
        details: errorMessages.length > 0 ? errorMessages.join(', ') : validationError.message 
      }, { status: 400 });
    }
    
    await pet.save();
    
    return NextResponse.json(pet, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pet:', error);
    
    // Handle duplicate key error
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
        error: 'Pet validation failed', 
        details: errorMessages.length > 0 ? errorMessages.join(', ') : error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create pet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


