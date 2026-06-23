import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Owner from '@/models/Owner';
import Pet from '@/models/Pet';

// GET single owner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    
    const owner = await Owner.findById(id);
    
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }
    
    // Get all pets belonging to this owner
    const pets = await Pet.find({ ownerEmail: owner.email });
    
    return NextResponse.json({
      ...owner.toObject(),
      pets
    });
  } catch (error) {
    console.error('Error fetching owner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owner' },
      { status: 500 }
    );
  }
}

// PUT update owner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const data = await request.json();
    
    const owner = await Owner.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(owner);
  } catch (error: any) {
    console.error('Error updating owner:', error);
    return NextResponse.json(
      { error: 'Failed to update owner', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE owner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    
    // Check if owner has any pets
    const owner = await Owner.findById(id);
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }
    
    const petCount = await Pet.countDocuments({ ownerEmail: owner.email });
    if (petCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete owner. They have ${petCount} pet(s) registered. Please reassign or delete the pets first.` },
        { status: 400 }
      );
    }
    
    await Owner.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    console.error('Error deleting owner:', error);
    return NextResponse.json(
      { error: 'Failed to delete owner' },
      { status: 500 }
    );
  }
}

