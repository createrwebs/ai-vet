'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  PawPrint,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';

// Demo user credentials
const DEMO_USERS = [
  {
    email: 'admin@aivet.com',
    password: 'password123',
    role: 'Administrator',
    icon: '👨‍💼'
  },
  {
    email: 'vet@aivet.com',
    password: 'password123',
    role: 'Veterinarian',
    icon: '👨‍⚕️'
  },
  {
    email: 'staff@aivet.com',
    password: 'password123',
    role: 'Staff',
    icon: '👤'
  },
  {
    email: 'receptionist@aivet.com',
    password: 'password123',
    role: 'Receptionist',
    icon: '📞'
  }
];

export default function LoginPage() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/');
      }
    };
    checkSession();

    // Check if demo mode is enabled
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo-check');
        if (response.ok) {
          const data = await response.json();
          setIsDemo(data.isDemo || false);
        }
      } catch (error) {
        console.error('Error checking demo mode:', error);
      }
    };
    checkDemoMode();
  }, [router]);

  const handleDemoUserClick = (email: string, password: string) => {
    setFormData({
      email,
      password
    });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        setSuccess('Login successful! Redirecting to dashboard...');
        router.push('/');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`w-full ${isDemo ? 'max-w-6xl' : 'max-w-md'} flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center`}>
        {/* Left Side - Login Form */}
        <div className={`w-full ${isDemo ? 'lg:w-1/2' : 'max-w-md mx-auto'} space-y-8`}>
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <PawPrint className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('login.subtitle')}
          </h2>
          <p className="text-gray-600">
            {t('login.description')}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={t('login.email')}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={t('login.password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('login.signingIn')}</span>
                </div>
              ) : (
                <span>{t('login.signIn')}</span>
              )}
            </button>
          </form>
        </div>
        </div>

        {/* Right Side - Demo Credentials Section */}
        {isDemo && (
          <div className="w-full lg:w-1/2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 lg:sticky lg:top-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Demo Credentials
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Click on any user below to auto-fill their credentials:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => handleDemoUserClick(user.email, user.password)}
                    className="flex items-center space-x-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors text-left"
                    disabled={isLoading}
                  >
                    <span className="text-2xl">{user.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.role}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
