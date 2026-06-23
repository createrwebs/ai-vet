import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET all users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    await dbConnect();
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    await dbConnect();
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.name || !data.role) {
      return NextResponse.json(
        { error: 'Email, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['veterinarian', 'admin', 'staff', 'receptionist'];
    if (!validRoles.includes(data.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: veterinarian, admin, staff, receptionist' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Require password to be provided
    if (!data.password || data.password.trim().length === 0) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (data.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = new User({
      email: data.email.toLowerCase(),
      name: data.name,
      password: hashedPassword,
      role: data.role,
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}

