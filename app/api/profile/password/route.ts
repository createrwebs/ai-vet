import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    await dbConnect();

    // Find user in database
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check current password - user must have a password set
    if (!user.password) {
      return NextResponse.json({ 
        error: 'Password change not allowed. User has no password set. Please contact administrator.' 
      }, { status: 403 });
    }

    // Verify current password using bcrypt
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await User.findByIdAndUpdate(
      session.user.id,
      { password: hashedNewPassword }
    );

    return NextResponse.json({ 
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
