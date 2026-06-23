import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Owner from '@/models/Owner';

// GET all owners
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const owners = await Owner.find({}).sort({ createdAt: -1 });
    return NextResponse.json(owners);
  } catch (error) {
    console.error('Error fetching owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owners' },
      { status: 500 }
    );
  }
}

// POST create new owner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    
    // Check if email already exists
    const existingOwner = await Owner.findOne({ email: data.email.toLowerCase() });
    if (existingOwner) {
      return NextResponse.json(
        { error: 'An owner with this email already exists' },
        { status: 400 }
      );
    }
    
    const owner = new Owner(data);
    await owner.save();
    
    return NextResponse.json(owner, { status: 201 });
  } catch (error: any) {
    console.error('Error creating owner:', error);
    return NextResponse.json(
      { error: 'Failed to create owner', details: error.message },
      { status: 500 }
    );
  }
}

