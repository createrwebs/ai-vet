import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Pet from '../../../../models/Pet';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const species = searchParams.get('species') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let searchFilter: any = {};
    
    if (query.trim()) {
      // Search by pet name, owner name, email, phone, or petId
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { ownerName: { $regex: query, $options: 'i' } },
        { ownerEmail: { $regex: query, $options: 'i' } },
        { ownerPhone: { $regex: query, $options: 'i' } },
        { petId: { $regex: query, $options: 'i' } },
        { breed: { $regex: query, $options: 'i' } },
        { microchipNumber: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Filter by species if provided
    if (species.trim()) {
      searchFilter.species = species;
    }
    
    const pets = await Pet.find(searchFilter)
      .select('_id petId name species breed ownerName ownerEmail ownerPhone')
      .limit(limit)
      .sort({ name: 1 });
    
    return NextResponse.json(pets);
  } catch (error) {
    console.error('Error searching pets:', error);
    return NextResponse.json(
      { error: 'Failed to search pets' },
      { status: 500 }
    );
  }
}


