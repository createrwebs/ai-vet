'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from '../hooks/useTranslations';
import { useSettings } from '../contexts/SettingsContext';
import { usePermissions } from '../../hooks/usePermissions';
import LanguageSwitcher from './LanguageSwitcher';
import { 
  PawPrint, 
  Calendar, 
  FileText, 
  Home,
  Stethoscope,
  Plus,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  Brain,
  TrendingUp,
  Pill,
  Camera,
  Shield,
  LineChart,
  Mic,
  User,
  ChevronDown,
  Syringe,
  Users
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function SidebarLayout({ children, title, description }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, translationsLoaded } = useTranslations();
  const { settings } = useSettings();
  const {
    canManageUsers,
    canAccessSettings,
    canAccessAISettings,
    canRead,
    canCreate,
    canUseAIFeature
  } = usePermissions();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);

              // Build navigation based on permissions
            const navigation = [
              { id: 'dashboard', label: t('navigation.dashboard'), icon: Home, href: '/', alwaysShow: true },
              ...(canRead('pets') ? [{ id: 'pets', label: t('navigation.pets'), icon: PawPrint, href: '/pets' }] : []),
              ...(canRead('owners') ? [{ id: 'owners', label: t('navigation.petOwners'), icon: User, href: '/owners' }] : []),
              ...(canRead('appointments') ? [{ id: 'appointments', label: t('navigation.appointments'), icon: Calendar, href: '/appointments' }] : []),
              ...(canRead('reports') ? [{ id: 'reports', label: t('navigation.reports'), icon: FileText, href: '/reports' }] : []),
              ...(canManageUsers ? [{ id: 'users', label: t('navigation.userManagement'), icon: Users, href: '/users' }] : []),
              ...(canUseAIFeature('TreatmentRecommendations') ? [{ id: 'ai-treatment-recommendations', label: t('navigation.aiTreatmentRecommendations'), icon: Stethoscope, href: '/ai-treatment-recommendations' }] : []),
              ...(canUseAIFeature('DrugInteraction') ? [{ id: 'ai-drug-interaction', label: t('navigation.aiDrugInteraction'), icon: Pill, href: '/ai-drug-interaction' }] : []),
              ...(canUseAIFeature('MedicalImage') ? [{ id: 'ai-medical-image', label: t('navigation.aiMedicalImage'), icon: Camera, href: '/ai-medical-image' }] : []),
              ...(canUseAIFeature('AppointmentOptimizer') ? [{ id: 'ai-appointment-optimizer', label: t('navigation.aiAppointmentOptimizer'), icon: Calendar, href: '/ai-appointment-optimizer' }] : []),
              ...(canUseAIFeature('RiskAssessment') ? [{ id: 'ai-risk-assessment', label: t('navigation.aiRiskAssessment'), icon: Shield, href: '/ai-risk-assessment' }] : []),
              ...(canUseAIFeature('HealthTrends') ? [{ id: 'ai-health-trends', label: t('navigation.aiHealthTrends'), icon: LineChart, href: '/ai-health-trends' }] : []),
              ...(canUseAIFeature('VoiceInput') ? [{ id: 'ai-voice-input', label: t('navigation.aiVoiceInput'), icon: Mic, href: '/ai-voice-input' }] : []),
              ...(canUseAIFeature('HealthAnalytics') ? [{ id: 'ai-health-analytics', label: t('navigation.aiHealthAnalytics'), icon: TrendingUp, href: '/ai-health-analytics' }] : []),
              ...(canUseAIFeature('Assistant') ? [{ id: 'ai-assistant', label: t('navigation.aiAssistant'), icon: Stethoscope, href: '/ai-assistant' }] : []),
            ];

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Close profile menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (mobileProfileMenuRef.current && !mobileProfileMenuRef.current.contains(event.target as Node)) {
        setMobileProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Show loading state if translations aren't loaded yet
  if (!translationsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading translations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {settings?.systemTitle || ''}
              </h1>
              <p className="text-xs text-gray-700">
                {settings?.systemDescription || ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>


        {/* Navigation Menu */}
        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActiveRoute(item.href)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* General Settings */}
        {(canAccessSettings || canAccessAISettings) && (
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="space-y-1">
              {canAccessSettings && (
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-4 w-4 text-gray-600" />
              <span>{t('settings.title')}</span>
            </Link>
              )}
              {canAccessAISettings && (
            <Link
              href="/ai-settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-4 w-4 text-purple-600" />
              <span>{t('navigation.aiSettings')}</span>
            </Link>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-3 py-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 px-3">
            {t('quickActions.title')}
          </h3>
          <div className="space-y-1">
            {canCreate('pets') && (
            <Link
              href="/pets/new"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span>{t('quickActions.newPet')}</span>
            </Link>
            )}
            {canCreate('appointments') && (
            <Link
              href="/appointments/new"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Plus className="h-4 w-4 text-green-600" />
              <span>{t('quickActions.newAppointment')}</span>
            </Link>
            )}
          </div>
        </div>

        {/* Language Switcher */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="px-3">
            <LanguageSwitcher />
          </div>
        </div>

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || t('auth.veterinarian')}
                </p>
                <p className="text-xs text-gray-700">{session?.user?.role || t('auth.veterinarian')}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>{t('profile.profileSettings')}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('profile.logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <LanguageSwitcher />
              <div className="relative" ref={mobileProfileMenuRef}>
                <button
                  onClick={() => setMobileProfileMenuOpen(!mobileProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {session?.user?.name?.charAt(0) || 'D'}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Profile Dropdown Menu */}
                {mobileProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{session?.user?.name || t('auth.veterinarian')}</p>
                        <p className="text-xs text-gray-600">{session?.user?.email || 'vet@aivet.com'}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setMobileProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>{t('profile.profileSettings')}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setMobileProfileMenuOpen(false);
                          signOut({ callbackUrl: '/login' });
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('profile.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                                        <p className="text-gray-700">{description}</p>
              )}
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
