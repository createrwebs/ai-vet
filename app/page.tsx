'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from './protected-route';
import SidebarLayout from './components/sidebar-layout';
import { useTranslations } from './hooks/useTranslations';
import { useSettings } from './contexts/SettingsContext';
import { useLanguage } from './contexts/LanguageContext';
import { 
  PawPrint, 
  Calendar, 
  FileText, 
  TrendingUp,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  Stethoscope
} from 'lucide-react';

interface DashboardStats {
  name: string;
  value: string;
  change: string;
  changeType: string;
  icon: any;
  color: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status?: string;
  icon?: any;
  color?: string;
}

interface UpcomingAppointment {
  id: string;
  patient: string;
  time: string;
  type: string;
  status: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, translationsLoaded } = useTranslations();
  const { currentLanguage } = useLanguage();
  const { settings } = useSettings();

  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawStatsData, setRawStatsData] = useState<any[]>([]);
  const dataFetchedRef = useRef(false);

  // Helper function to get icon and color for a stat
  const getStatIconAndColor = (statName: string) => {
    let icon, color;
    switch (statName) {
      case 'totalPets':
        icon = PawPrint;
        color = 'blue';
        break;
      case 'appointmentsToday':
        icon = Calendar;
        color = 'green';
        break;
      case 'reportsGenerated':
        icon = FileText;
        color = 'purple';
        break;
      case 'aiInsights':
        icon = TrendingUp;
        color = 'orange';
        break;
      default:
        icon = Activity;
        color = 'gray';
    }
    return { icon, color };
  };

  // Helper function to translate stats
  const translateStats = useCallback((rawStats: any[]) => {
    return rawStats.map((stat: any) => {
      const { icon, color } = getStatIconAndColor(stat.name);
      return {
        name: t(`dashboard.stats.${stat.name}`),
        value: stat.value,
        change: stat.change,
        changeType: stat.changeType,
        icon,
        color,
        originalName: stat.name // Store original name for reference
      };
    });
  }, [t]);

  // Re-translate stats when language changes
  useEffect(() => {
    if (rawStatsData.length > 0 && translationsLoaded) {
      const translatedStats = translateStats(rawStatsData);
      setStats(translatedStats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, translationsLoaded, rawStatsData]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Prevent multiple fetches
      if (dataFetchedRef.current) return;

      try {
        setIsLoading(true);
        dataFetchedRef.current = true;

        const response = await fetch('/api/dashboard');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();

        // Store raw stats data for re-translation
        setRawStatsData(data.stats || []);

        // Transform stats data with translations and icons
        const transformedStats = translateStats(data.stats || []);

        // Transform recent activities with translations
        const transformedActivities = data.recentActivities.map((activity: any) => {
          let icon, color;
          switch (activity.type) {
            case 'appointment':
              icon = Calendar;
              color = 'green';
              break;
            case 'pet':
              icon = PawPrint;
              color = 'blue';
              break;
            case 'report':
              icon = FileText;
              color = 'purple';
              break;
            default:
              icon = Activity;
              color = 'gray';
          }

          return {
            ...activity,
            icon,
            color
          };
        });

        setStats(transformedStats);
        setRecentActivities(transformedActivities);
        setUpcomingAppointments(data.upcomingAppointments || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        // Set fallback data
        const fallbackStats = [
          { name: 'totalPets', value: '0', change: '0%', changeType: 'neutral' },
          { name: 'appointmentsToday', value: '0', change: '0%', changeType: 'neutral' },
          { name: 'reportsGenerated', value: '0', change: '0%', changeType: 'neutral' },
          { name: 'aiInsights', value: '0', change: '0%', changeType: 'neutral' }
        ];
        setRawStatsData(fallbackStats);
        const translatedFallback = translateStats(fallbackStats);
        setStats(translatedFallback);
        setRecentActivities([]);
        setUpcomingAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if translations are loaded and we haven't fetched yet
    if (translationsLoaded && !dataFetchedRef.current) {
      fetchDashboardData();
    }
  }, [translationsLoaded]);

  // Show loading while checking authentication
  if (status === 'loading' || !translationsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }


  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={t('navigation.dashboard')} 
        description="Welcome to your AI-powered veterinary clinic management dashboard"
      >
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              {t('dashboard.welcome.title', { name: session?.user?.name || 'Veterinarian' })}
            </h1>
            <p className="text-blue-100">
              {t('dashboard.welcome.subtitle')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              stats.map((stat) => {
                // Define navigation links for each stat type using original name
                let href = '#';
                const originalName = (stat as any).originalName;
                switch (originalName) {
                  case 'totalPets':
                    href = '/pets';
                    break;
                  case 'appointmentsToday':
                    href = '/appointments';
                    break;
                  case 'reportsGenerated':
                    href = '/reports';
                    break;
                  case 'aiInsights':
                    href = '/ai-assistant';
                    break;
                }

                return (
                  <Link
                    key={stat.name}
                    href={href}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer block"
                  >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${
                          stat.changeType === 'positive' ? 'text-green-600' :
                          stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                          {stat.change} {t('dashboard.stats.changeFromLastMonth')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recentActivity.title')}</h3>
                <Link
                  href="/activity"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('dashboard.recentActivity.viewAll') || 'View All'}
                </Link>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length > 0 ? (
                <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity) => {
                      // Define navigation links for each activity type
                      let href = '#';
                      if (activity.type === 'pet') {
                        // For pets, link to pets list
                        href = '/pets';
                      } else if (activity.type === 'appointment') {
                        // For appointments, link to specific appointment
                        href = `/appointments/${activity.id}`;
                      } else if (activity.type === 'report') {
                        // For reports, link to specific report
                        href = `/reports/${activity.id}`;
                      }

                      return (
                        <Link
                          key={activity.id}
                          href={href}
                          className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                      <div className={`p-2 rounded-full bg-${activity.color}-100`}>
                        <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                        </Link>
                      );
                    })}
                    </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('dashboard.recentActivity.noActivities') || 'No recent activities'}</p>
                </div>
                )}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.upcomingAppointments.title')}</h3>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                      <Link
                        key={appointment.id}
                        href={`/appointments/${appointment.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{appointment.patient}</p>
                          <p className="text-xs text-gray-500">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status === 'confirmed' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                            {t(`dashboard.upcomingAppointments.status.${appointment.status}`)}
                        </span>
                      </div>
                      </Link>
                  ))}
                </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('dashboard.upcomingAppointments.noAppointments') || 'No upcoming appointments'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickActions.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/pets/new" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <PawPrint className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">{t('dashboard.quickActions.addNewPet')}</span>
              </Link>
              <Link href="/appointments/new" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">{t('dashboard.quickActions.scheduleAppointment')}</span>
              </Link>
              <Link href="/reports/new" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">{t('dashboard.quickActions.generateReport')}</span>
              </Link>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}