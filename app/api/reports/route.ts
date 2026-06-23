import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const reports = await Report.find({}).sort({ reportDate: -1 });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    // Prepare report data with defaults and validation
    const reportData: any = {
      petId: body.petId,
      petName: body.petName || '',
      vetId: body.vetId || session.user?.id || 'default-vet-id',
      vetName: body.vetName || session.user?.name || 'Dr. Demo User',
      reportType: body.reportType,
      reportDate: body.reportDate ? new Date(body.reportDate) : new Date(),
      status: body.status === 'in progress' ? 'in-progress' : (body.status || 'pending'),
      findings: body.findings || '',
      diagnosis: body.diagnosis || 'Pending diagnosis',
      recommendations: body.recommendations || 'Pending recommendations',
      priority: body.priority === 'normal' ? 'medium' : (body.priority || 'medium'),
      notes: body.notes || '',
    };

    // Validate required fields
    if (!reportData.petId || !reportData.reportType || !reportData.findings) {
      return NextResponse.json(
        { error: 'Missing required fields: petId, reportType, and findings are required' },
        { status: 400 }
      );
    }

    const report = new Report(reportData);
    await report.save();
    
    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error('Error creating report:', error);
    
    // Provide more detailed error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors,
          message: validationErrors.join(', ')
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create report',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
