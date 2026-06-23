import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET single user by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const data = await request.json();

    // Validate role if provided
    if (data.role) {
      const validRoles = ['veterinarian', 'admin', 'staff', 'receptionist'];
      if (!validRoles.includes(data.role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be one of: veterinarian, admin, staff, receptionist' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await User.findOne({ 
        email: data.email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        );
      }
      data.email = data.email.toLowerCase();
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    } else {
      // Don't update password if not provided
      delete data.password;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (currentUser._id.toString() === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

