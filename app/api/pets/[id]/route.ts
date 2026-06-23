import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Pet from '@/models/Pet';

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
    const pet = await Pet.findById(id);
    
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(pet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pet' },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    
    const { id } = await params;
    const pet = await Pet.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(pet);
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json(
      { error: 'Failed to update pet' },
      { status: 500 }
    );
  }
}

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
    const pet = await Pet.findByIdAndDelete(id);
    
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json(
      { error: 'Failed to delete pet' },
      { status: 500 }
    );
  }
}


