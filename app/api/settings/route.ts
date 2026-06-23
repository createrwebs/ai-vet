import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get or create settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({});
      await settings.save();
    }

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    await dbConnect();

    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updates },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings 
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
