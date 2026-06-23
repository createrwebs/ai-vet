import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { requirePermission } from '@/lib/auth-middleware';

export async function GET() {
  try {
    // Check if user can read appointments
    await requirePermission('appointments.canRead');

    await dbConnect();
    const appointments = await Appointment.find({}).sort({ appointmentDate: -1 });
    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden: Insufficient permissions') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user can create appointments
    await requirePermission('appointments.canCreate');

    await dbConnect();
    const body = await request.json();
    
    const appointment = new Appointment(body);
    await appointment.save();
    
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating appointment:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden: Insufficient permissions') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
