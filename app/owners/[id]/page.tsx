'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  PawPrint,
  Plus,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import { useTranslations } from '../../hooks/useTranslations';

interface Pet {
  _id: string;
  petId: string;
  name: string;
  species: string;
  breed: string;
  status: string;
}

interface Owner {
  _id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferredContactMethod?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  status: string;
  pets?: Pet[];
  createdAt: string;
}

export default function OwnerViewPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslations();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await fetch(`/api/owners/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setOwner(data);
        } else {
          setError(t('owners.ownerNotFound'));
        }
      } catch (error) {
        console.error('Error fetching owner:', error);
        setError(t('owners.ownerNotFound'));
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOwner();
    }
  }, [params.id]);

  const getSpeciesEmoji = (species: string): string => {
    const emojis: Record<string, string> = {
      dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰',
      hamster: '🐹', fish: '🐠', reptile: '🦎', horse: '🐴'
    };
    return emojis[species?.toLowerCase()] || '🐾';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title={t('owners.ownerDetails')} description={t('owners.viewOwnerInformation')}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error || !owner) {
    return (
      <ProtectedRoute>
        <SidebarLayout title={t('owners.ownerNotFound')} description={t('owners.ownerNotFoundDesc')}>
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('owners.ownerNotFound')}</h3>
            <p className="mt-1 text-sm text-gray-700">{error}</p>
            <div className="mt-6">
              <Link
                href="/owners"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('owners.backToOwners')}</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  const fullAddress = [owner.address, owner.city, owner.state, owner.zipCode].filter(Boolean).join(', ');

  return (
    <ProtectedRoute>
      <SidebarLayout title={t('owners.ownerDetails')} description={t('owners.viewOwnerInformation')}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/owners"
              className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('owners.backToOwners')}
            </Link>
            
            {/* Owner Header Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {owner.firstName} {owner.lastName}
                    </h1>
                    <p className="text-gray-500">ID: {owner.ownerId}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      owner.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {owner.status}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/owners/${owner._id}/edit`}
                  className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>{t('owners.editOwnerButton')}</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('owners.contactInformation')}</h3>
                <dl className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <dt className="text-sm text-gray-500">{t('owners.email')}</dt>
                      <dd className="text-sm font-medium">
                        <a href={`mailto:${owner.email}`} className="text-emerald-600 hover:underline">
                          {owner.email}
                        </a>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <dt className="text-sm text-gray-500">{t('owners.phone')}</dt>
                      <dd className="text-sm font-medium">
                        <a href={`tel:${owner.phone}`} className="text-emerald-600 hover:underline">
                          {owner.phone}
                        </a>
                      </dd>
                      {owner.alternatePhone && (
                        <dd className="text-sm text-gray-600 mt-1">
                          {t('common.alt', { defaultValue: 'Alt' })}: {owner.alternatePhone}
                        </dd>
                      )}
                    </div>
                  </div>
                  {fullAddress && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">{t('owners.address')}</dt>
                        <dd className="text-sm font-medium">{fullAddress}</dd>
                      </div>
                    </div>
                  )}
                  {owner.preferredContactMethod && (
                    <div className="pt-2 border-t">
                      <dt className="text-sm text-gray-500">{t('owners.preferredContact')}</dt>
                      <dd className="text-sm font-medium capitalize">{owner.preferredContactMethod}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Emergency Contact */}
              {owner.emergencyContact?.name && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    {t('owners.emergencyContact')}
                  </h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">{t('owners.name')}</dt>
                      <dd className="text-sm font-medium">{owner.emergencyContact.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">{t('owners.phone')}</dt>
                      <dd className="text-sm font-medium">{owner.emergencyContact.phone}</dd>
                    </div>
                    {owner.emergencyContact.relationship && (
                      <div>
                        <dt className="text-sm text-gray-500">{t('owners.relationship')}</dt>
                        <dd className="text-sm font-medium">{owner.emergencyContact.relationship}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Notes */}
              {owner.notes && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('owners.notes')}</h3>
                  <p className="text-sm text-gray-600">{owner.notes}</p>
                </div>
              )}
            </div>

            {/* Pets */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <PawPrint className="h-5 w-5 text-emerald-600 mr-2" />
                    {t('owners.petsCount', { count: owner.pets?.length || 0 })}
                  </h3>
                  <Link
                    href="/pets/new"
                    className="inline-flex items-center space-x-1 text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('owners.addPet')}</span>
                  </Link>
                </div>

                {owner.pets && owner.pets.length > 0 ? (
                  <div className="space-y-4">
                    {owner.pets.map((pet) => (
                      <div 
                        key={pet._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/pets/${pet._id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl">{getSpeciesEmoji(pet.species)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{pet.name}</h4>
                            <p className="text-sm text-gray-500 capitalize">
                              {pet.species} • {pet.breed}
                            </p>
                            <p className="text-xs text-gray-400">{pet.petId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pet.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pet.status}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/pets/${pet._id}`);
                            }}
                            className="p-2 text-gray-400 hover:text-emerald-600"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PawPrint className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('owners.noPetsRegistered')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('owners.noPetsRegisteredDesc')}</p>
                    <div className="mt-4">
                      <Link
                        href="/pets/new"
                        className="inline-flex items-center space-x-2 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4" />
                        <span>{t('owners.addPet')}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

