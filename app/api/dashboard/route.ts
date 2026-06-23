import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import Pet from '../../../models/Pet';
import Appointment from '../../../models/Appointment';
import Report from '../../../models/Report';
import dbConnect from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get today's date range
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get last month's date range for percentage calculations
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), lastMonth.getDate());
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Fetch all stats in parallel
    const [
      totalPets,
      petsLastMonth,
      appointmentsToday,
      appointmentsLastMonth,
      totalReports,
      reportsLastMonth,
      recentAppointments,
      recentPets,
      recentReports
    ] = await Promise.all([
      // Total pets
      Pet.countDocuments(),

      // Pets from last month
      Pet.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
      }),

      // Appointments today
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfToday, $lt: endOfToday },
        status: { $ne: 'cancelled' }
      }),

      // Appointments last month
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        status: { $ne: 'cancelled' }
      }),

      // Total reports
      Report.countDocuments(),

      // Reports from last month
      Report.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
      }),

      // Recent appointments (get more to ensure we have enough for top 10)
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('_id petName ownerName vetName appointmentDate appointmentTime status createdAt'),

      // Recent pets (get more to ensure we have enough for top 10)
      Pet.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('name species breed ownerName createdAt'),

      // Recent reports (get more to ensure we have enough for top 10)
      Report.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('_id petName vetName reportType status createdAt')
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? '+' : '';
      return `${sign}${Math.round(change)}%`;
    };

    // Build stats array
    const stats = [
      {
        name: 'totalPets',
        value: totalPets.toString(),
        change: calculateChange(totalPets, petsLastMonth),
        changeType: totalPets >= petsLastMonth ? 'positive' : 'negative'
      },
      {
        name: 'appointmentsToday',
        value: appointmentsToday.toString(),
        change: calculateChange(appointmentsToday, appointmentsLastMonth),
        changeType: appointmentsToday >= appointmentsLastMonth ? 'positive' : 'negative'
      },
      {
        name: 'reportsGenerated',
        value: totalReports.toString(),
        change: calculateChange(totalReports, reportsLastMonth),
        changeType: totalReports >= reportsLastMonth ? 'positive' : 'negative'
      },
      {
        name: 'aiInsights',
        value: '0', // TODO: Implement AI insights tracking
        change: '+0%',
        changeType: 'neutral'
      }
    ];

    // Build recent activities
    const recentActivities: any[] = [];

    // Add recent appointments
    recentAppointments.forEach((appointment: any) => {
      recentActivities.push({
        id: appointment._id.toString(),
        type: 'appointment',
        title: `Appointment: ${appointment.petName}`,
        description: `${appointment.vetName} - ${appointment.appointmentTime}`,
        time: formatTimeAgo(appointment.createdAt),
        createdAt: appointment.createdAt,
        status: appointment.status
      });
    });

    // Add recent pets
    recentPets.forEach((pet: any) => {
      recentActivities.push({
        id: `pet-${pet._id}`,
        type: 'pet',
        title: 'New pet registered',
        description: `${pet.name} (${pet.species}) - Owner: ${pet.ownerName}`,
        time: formatTimeAgo(pet.createdAt),
        createdAt: pet.createdAt,
        status: 'completed'
      });
    });

    // Add recent reports
    recentReports.forEach((report: any) => {
      recentActivities.push({
        id: report._id.toString(),
        type: 'report',
        title: 'Report generated',
        description: `${report.petName} - ${report.reportType}`,
        time: formatTimeAgo(report.createdAt),
        createdAt: report.createdAt,
        status: report.status
      });
    });

    // Sort activities by createdAt date (most recent first) and limit to 5
    recentActivities.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    }).slice(0, 5);

    // Get upcoming appointments (today and future dates)
    // Reuse startOfToday that was already defined above
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfToday },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(4)
    .select('_id petName petSpecies ownerName appointmentTime appointmentType status appointmentDate');
    
    console.log('Upcoming appointments found:', upcomingAppointments.length);

    const formattedUpcomingAppointments = upcomingAppointments.map((appointment: any) => ({
      id: appointment._id.toString(),
      patient: appointment.petName ? `${appointment.petName}${appointment.petSpecies ? ` (${appointment.petSpecies})` : ''}` : 'Unknown Pet',
      owner: appointment.ownerName || 'Unknown Owner',
      time: appointment.appointmentTime || 'N/A',
      type: appointment.appointmentType || 'consultation',
      status: appointment.status === 'confirmed' ? 'confirmed' : 'pending'
    }));
    
    console.log('Formatted upcoming appointments:', formattedUpcomingAppointments);

    return NextResponse.json({
      stats,
      recentActivities,
      upcomingAppointments: formattedUpcomingAppointments
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInHours > 0) {
    return `${diffInHours} hours ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minutes ago`;
  } else {
    return 'Just now';
  }
}
