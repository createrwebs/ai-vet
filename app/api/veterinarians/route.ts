import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET all veterinarians (authenticated users only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    let searchFilter: any = { role: 'veterinarian' };

    if (search.trim()) {
      // Search by name, email, specialization, or license number
      searchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch veterinarians with search filter
    const veterinarians = await User.find(searchFilter)
      .select('name email specialization licenseNumber image')
      .limit(limit)
      .sort({ name: 1 });

    return NextResponse.json(veterinarians);
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    return NextResponse.json(
      { error: 'Failed to fetch veterinarians' },
      { status: 500 }
    );
  }
}
