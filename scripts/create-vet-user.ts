import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import dbConnect from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';

async function createVetUser() {
  try {
    await dbConnect();
    console.log('Connected to database');

    const email = 'vet@aivet.com';
    const password = 'password123';
    const name = 'Dr. Sarah Mitchell';
    const role = 'veterinarian';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update existing user
      existingUser.password = hashedPassword;
      existingUser.name = name;
      existingUser.role = role;
      existingUser.specialization = 'Small Animals';
      existingUser.licenseNumber = 'VET-2024-001';
      await existingUser.save();
      console.log(`✅ Updated existing user: ${email}`);
    } else {
      // Create new user
      const user = new User({
        email,
        name,
        password: hashedPassword,
        role,
        specialization: 'Small Animals',
        licenseNumber: 'VET-2024-001',
      });
      await user.save();
      console.log(`✅ Created new user: ${email}`);
    }

    console.log(`\n📋 User Details:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password} (hashed in database)`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: ${role}`);
    console.log(`\n✅ User created/updated successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

createVetUser();
