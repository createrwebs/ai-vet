import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Owner from '@/models/Owner';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    let searchQuery = {};
    
    if (query.trim()) {
      searchQuery = {
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { ownerId: { $regex: query, $options: 'i' } }
        ]
      };
    }
    
    const owners = await Owner.find(searchQuery)
      .sort({ lastName: 1, firstName: 1 })
      .limit(limit);
    
    return NextResponse.json(owners);
  } catch (error) {
    console.error('Error searching owners:', error);
    return NextResponse.json(
      { error: 'Failed to search owners' },
      { status: 500 }
    );
  }
}

