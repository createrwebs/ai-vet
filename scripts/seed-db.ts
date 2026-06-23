// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Debug: Verify MONGODB_URI is loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ Not found');

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Pet from '../models/Pet';
import Owner from '../models/Owner';
import Appointment from '../models/Appointment';
import Report from '../models/Report';
import dbConnect from '../lib/mongodb';

async function seedDatabase() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Clear existing data (but keep users - we'll check and create if needed)
    await Owner.deleteMany({});
    await Pet.deleteMany({});
    await Appointment.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing data (keeping users)');

    // Create sample owners
    const owners = [
      {
        ownerId: 'OWN-0001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        preferredContactMethod: 'phone' as const,
        status: 'active' as const
      },
      {
        ownerId: 'OWN-0002',
        firstName: 'Emily',
        lastName: 'Chen',
        email: 'emily.chen@email.com',
        phone: '+1-555-0201',
        address: '456 Oak Ave',
        city: 'Somewhere',
        state: 'NY',
        zipCode: '10001',
        preferredContactMethod: 'email' as const,
        status: 'active' as const
      },
      {
        ownerId: 'OWN-0003',
        firstName: 'Michael',
        lastName: 'Davis',
        email: 'michael.davis@email.com',
        phone: '+1-555-0301',
        address: '789 Pine Rd',
        city: 'Elsewhere',
        state: 'TX',
        zipCode: '75001',
        preferredContactMethod: 'phone' as const,
        emergencyContact: {
          name: 'Jennifer Davis',
          phone: '+1-555-0302',
          relationship: 'Spouse'
        },
        status: 'active' as const
      },
      {
        ownerId: 'OWN-0004',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0401',
        address: '321 Elm St',
        city: 'Newtown',
        state: 'FL',
        zipCode: '33101',
        preferredContactMethod: 'sms' as const,
        status: 'active' as const
      },
      {
        ownerId: 'OWN-0005',
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@email.com',
        phone: '+1-555-0501',
        address: '654 Maple Dr',
        city: 'Birdtown',
        state: 'WA',
        zipCode: '98001',
        preferredContactMethod: 'email' as const,
        status: 'active' as const
      }
    ];

    await Owner.insertMany(owners);
    console.log(`Created ${owners.length} owners`);

    // Hash password for all users
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    // Update the default password to 'password123'
    // Create users for each role if they don't exist
    const usersToCreate = [
      {
        email: 'vet@aivet.com',
        name: 'Dr. Sarah Mitchell',
        password: hashedPassword,
        role: 'veterinarian' as const,
        specialization: 'Small Animals',
        licenseNumber: 'VET-2024-001',
      },
      {
        email: 'admin@aivet.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin' as const,
      },
      {
        email: 'staff@aivet.com',
        name: 'Staff Member',
        password: hashedPassword,
        role: 'staff' as const,
      },
      {
        email: 'receptionist@aivet.com',
        name: 'Receptionist User',
        password: hashedPassword,
        role: 'receptionist' as const,
      },
    ];

    let usersCreated = 0;
    for (const userData of usersToCreate) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        usersCreated++;
        console.log(`Created ${userData.role} user: ${userData.email}`);
      } else {
        console.log(`${userData.role} user already exists: ${userData.email}`);
      }
    }

    if (usersCreated > 0) {
      console.log(`\n✅ Created ${usersCreated} new user(s)`);
    } else {
      console.log(`\n✅ All users already exist`);
    }
    
    console.log(`\n📋 Login credentials for all roles:`);
    console.log(`   Email: [role]@aivet.com (e.g., vet@aivet.com, admin@aivet.com)`);
    console.log(`   Password: ${defaultPassword}\n`);

    // Create sample pets
    const pets = [
      {
        petId: 'PET-0001',
        name: 'Max',
        species: 'dog' as const,
        breed: 'Golden Retriever',
        dateOfBirth: new Date('2020-03-15'),
        gender: 'male' as const,
        weight: 32,
        weightUnit: 'kg' as const,
        color: 'Golden',
        microchipNumber: 'CHIP-001-2024',
        ownerName: 'John Smith',
        ownerEmail: 'john.smith@email.com',
        ownerPhone: '+1-555-0101',
        ownerAddress: '123 Main St, Anytown, USA',
        medicalHistory: ['Hip Dysplasia', 'Allergies'],
        allergies: ['Chicken'],
        currentMedications: ['Glucosamine', 'Omega-3'],
        vaccinations: [
          { name: 'Rabies', date: new Date('2023-06-15'), nextDueDate: new Date('2024-06-15') },
          { name: 'DHPP', date: new Date('2023-06-15'), nextDueDate: new Date('2024-06-15') }
        ],
        spayedNeutered: true,
        assignedVet: 'Dr. Sarah Mitchell',
        status: 'active' as const
      },
      {
        petId: 'PET-0002',
        name: 'Luna',
        species: 'cat' as const,
        breed: 'Persian',
        dateOfBirth: new Date('2021-07-22'),
        gender: 'female' as const,
        weight: 4.5,
        weightUnit: 'kg' as const,
        color: 'White',
        microchipNumber: 'CHIP-002-2024',
        ownerName: 'Emily Chen',
        ownerEmail: 'emily.chen@email.com',
        ownerPhone: '+1-555-0201',
        ownerAddress: '456 Oak Ave, Somewhere, USA',
        medicalHistory: ['Kidney Disease - Stage 1'],
        allergies: [],
        currentMedications: ['Kidney Support Supplement'],
        vaccinations: [
          { name: 'Rabies', date: new Date('2023-08-10'), nextDueDate: new Date('2024-08-10') },
          { name: 'FVRCP', date: new Date('2023-08-10'), nextDueDate: new Date('2024-08-10') }
        ],
        spayedNeutered: true,
        assignedVet: 'Dr. Sarah Mitchell',
        status: 'active' as const
      },
      {
        petId: 'PET-0003',
        name: 'Buddy',
        species: 'dog' as const,
        breed: 'Labrador Retriever',
        dateOfBirth: new Date('2019-11-08'),
        gender: 'male' as const,
        weight: 28,
        weightUnit: 'kg' as const,
        color: 'Black',
        ownerName: 'Michael Davis',
        ownerEmail: 'michael.davis@email.com',
        ownerPhone: '+1-555-0301',
        ownerAddress: '789 Pine Rd, Elsewhere, USA',
        medicalHistory: ['Arthritis', 'Dental Disease'],
        allergies: ['Beef'],
        currentMedications: ['Rimadyl', 'Dental Chews'],
        vaccinations: [
          { name: 'Rabies', date: new Date('2023-11-01'), nextDueDate: new Date('2024-11-01') },
          { name: 'DHPP', date: new Date('2023-11-01'), nextDueDate: new Date('2024-11-01') },
          { name: 'Bordetella', date: new Date('2023-11-01'), nextDueDate: new Date('2024-05-01') }
        ],
        spayedNeutered: true,
        assignedVet: 'Dr. Sarah Mitchell',
        status: 'active' as const
      },
      {
        petId: 'PET-0004',
        name: 'Whiskers',
        species: 'cat' as const,
        breed: 'Maine Coon',
        dateOfBirth: new Date('2022-02-14'),
        gender: 'male' as const,
        weight: 7,
        weightUnit: 'kg' as const,
        color: 'Tabby',
        microchipNumber: 'CHIP-004-2024',
        ownerName: 'Sarah Johnson',
        ownerEmail: 'sarah.johnson@email.com',
        ownerPhone: '+1-555-0401',
        ownerAddress: '321 Elm St, Newtown, USA',
        medicalHistory: [],
        allergies: [],
        currentMedications: [],
        vaccinations: [
          { name: 'Rabies', date: new Date('2024-01-15'), nextDueDate: new Date('2025-01-15') },
          { name: 'FVRCP', date: new Date('2024-01-15'), nextDueDate: new Date('2025-01-15') }
        ],
        spayedNeutered: false,
        assignedVet: 'Dr. Sarah Mitchell',
        status: 'active' as const
      },
      {
        petId: 'PET-0005',
        name: 'Charlie',
        species: 'bird' as const,
        breed: 'African Grey Parrot',
        age: '5 years',
        gender: 'male' as const,
        color: 'Grey with Red Tail',
        ownerName: 'Robert Wilson',
        ownerEmail: 'robert.wilson@email.com',
        ownerPhone: '+1-555-0501',
        ownerAddress: '654 Maple Dr, Birdtown, USA',
        medicalHistory: ['Feather Plucking - resolved'],
        allergies: [],
        currentMedications: [],
        vaccinations: [],
        assignedVet: 'Dr. Sarah Mitchell',
        status: 'active' as const
      }
    ];

    const createdPets = await Pet.insertMany(pets);
    console.log(`Created ${createdPets.length} pets`);

    // Create sample appointments
    const appointments = [
      {
        petId: createdPets[0].petId,
        petName: 'Max',
        petSpecies: 'Dog',
        petBreed: 'Golden Retriever',
        ownerName: 'John Smith',
        ownerEmail: 'john.smith@email.com',
        ownerPhone: '+1-555-0101',
        vetName: 'Dr. Sarah Mitchell',
        vetEmail: 'vet@aivet.com',
        appointmentDate: new Date(),
        appointmentTime: '09:00 AM',
        appointmentType: 'checkup' as const,
        status: 'confirmed' as const,
        notes: 'Annual wellness exam and vaccination update',
        symptoms: ['Routine checkup'],
        weight: 32,
        temperature: 38.5
      },
      {
        petId: createdPets[1].petId,
        petName: 'Luna',
        petSpecies: 'Cat',
        petBreed: 'Persian',
        ownerName: 'Emily Chen',
        ownerEmail: 'emily.chen@email.com',
        ownerPhone: '+1-555-0201',
        vetName: 'Dr. Sarah Mitchell',
        vetEmail: 'vet@aivet.com',
        appointmentDate: new Date(),
        appointmentTime: '10:30 AM',
        appointmentType: 'follow-up' as const,
        status: 'confirmed' as const,
        notes: 'Kidney function follow-up, blood work review',
        symptoms: ['Increased thirst', 'Frequent urination'],
        diagnosis: 'Chronic Kidney Disease Stage 1',
        treatment: 'Continue renal diet, monitor water intake'
      },
      {
        petId: createdPets[2].petId,
        petName: 'Buddy',
        petSpecies: 'Dog',
        petBreed: 'Labrador Retriever',
        ownerName: 'Michael Davis',
        ownerEmail: 'michael.davis@email.com',
        ownerPhone: '+1-555-0301',
        vetName: 'Dr. Sarah Mitchell',
        vetEmail: 'vet@aivet.com',
        appointmentDate: new Date(),
        appointmentTime: '02:00 PM',
        appointmentType: 'dental' as const,
        status: 'scheduled' as const,
        notes: 'Dental cleaning procedure',
        symptoms: ['Bad breath', 'Tartar buildup']
      },
      {
        petId: createdPets[3].petId,
        petName: 'Whiskers',
        petSpecies: 'Cat',
        petBreed: 'Maine Coon',
        ownerName: 'Sarah Johnson',
        ownerEmail: 'sarah.johnson@email.com',
        ownerPhone: '+1-555-0401',
        vetName: 'Dr. Sarah Mitchell',
        vetEmail: 'vet@aivet.com',
        appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
        appointmentTime: '11:00 AM',
        appointmentType: 'surgery' as const,
        status: 'scheduled' as const,
        notes: 'Neutering surgery - fasting required',
        symptoms: []
      }
    ];

    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`Created ${createdAppointments.length} appointments`);

    // Create sample reports
    const reports = [
      {
        petId: createdPets[0]._id.toString(),
        petName: 'Max',
        petSpecies: 'Dog',
        ownerName: 'John Smith',
        vetId: 'demo-vet',
        vetName: 'Dr. Sarah Mitchell',
        reportType: 'lab' as const,
        reportDate: new Date(),
        status: 'completed' as const,
        findings: 'Complete blood count normal. Liver and kidney function within normal ranges. Slight elevation in cholesterol.',
        diagnosis: 'Healthy with mild hypercholesterolemia',
        recommendations: 'Switch to weight management diet, increase exercise, recheck in 6 months',
        prescriptions: ['Hill\'s Metabolic Diet'],
        priority: 'low' as const,
        notes: 'Owner counseled on diet changes'
      },
      {
        petId: createdPets[1]._id.toString(),
        petName: 'Luna',
        petSpecies: 'Cat',
        ownerName: 'Emily Chen',
        vetId: 'demo-vet',
        vetName: 'Dr. Sarah Mitchell',
        reportType: 'lab' as const,
        reportDate: new Date(),
        status: 'reviewed' as const,
        findings: 'BUN: 35 (high), Creatinine: 2.1 (slightly elevated), SDMA: 18. Urine specific gravity: 1.025',
        diagnosis: 'Chronic Kidney Disease - Stage 2',
        recommendations: 'Continue renal diet, consider phosphorus binder, increase water intake, recheck in 3 months',
        prescriptions: ['Royal Canin Renal Support', 'Aluminum Hydroxide'],
        priority: 'medium' as const,
        notes: 'Disease progression noted, discussed with owner'
      },
      {
        petId: createdPets[2]._id.toString(),
        petName: 'Buddy',
        petSpecies: 'Dog',
        ownerName: 'Michael Davis',
        vetId: 'demo-vet',
        vetName: 'Dr. Sarah Mitchell',
        reportType: 'dental' as const,
        reportDate: new Date(),
        status: 'pending' as const,
        findings: 'Grade 3 periodontal disease on upper left premolar. Moderate tartar accumulation on all teeth.',
        diagnosis: 'Periodontal Disease Grade 3',
        recommendations: 'Full dental cleaning under anesthesia, possible extraction of affected tooth',
        priority: 'high' as const,
        notes: 'Pre-anesthetic bloodwork scheduled'
      },
      {
        petId: createdPets[4]._id.toString(),
        petName: 'Charlie',
        petSpecies: 'Bird',
        ownerName: 'Robert Wilson',
        vetId: 'demo-vet',
        vetName: 'Dr. Sarah Mitchell',
        reportType: 'diagnostic' as const,
        reportDate: new Date(),
        status: 'completed' as const,
        findings: 'Feather condition improved. No signs of PBFD. Good body condition score.',
        diagnosis: 'Healthy - Previous feather plucking resolved',
        recommendations: 'Continue enrichment activities, balanced diet, regular socialization',
        priority: 'low' as const,
        notes: 'Behavioral modification successful'
      }
    ];

    const createdReports = await Report.insertMany(reports);
    console.log(`Created ${createdReports.length} reports`);

    console.log('🐾 Veterinary database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
