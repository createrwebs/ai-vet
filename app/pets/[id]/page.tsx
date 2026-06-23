'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  PawPrint, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Heart,
  User,
  Pill,
  Camera,
  Shield,
  FileText,
  Clock,
  Eye,
  Trash2,
  Syringe,
  Scale,
  Thermometer,
  Stethoscope,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';

export default function PetViewPage() {
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'medical' | 'vaccinations' | 'appointments'>('details');

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await fetch(`/api/pets/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPet(data);
        } else {
          setError('Pet not found');
        }
      } catch (error) {
        console.error('Error fetching pet:', error);
        setError('Failed to fetch pet data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPet();
    }
  }, [params.id]);

  // Fetch appointments for this pet
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!params.id || !pet) return;
      
      try {
        setLoadingAppointments(true);
        const response = await fetch('/api/appointments');
        if (response.ok) {
          const data = await response.json();
          // Filter appointments for this pet
          const petAppointments = data.filter((apt: any) => 
            apt.petId === params.id || 
            apt.petId === pet._id ||
            apt.petId === pet.petId ||
            apt.petName?.toLowerCase() === pet.name?.toLowerCase()
          );
          setAppointments(petAppointments);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (params.id && pet) {
      fetchAppointments();
    }
  }, [params.id, pet]);

  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      dog: '🐕',
      cat: '🐱',
      bird: '🦜',
      rabbit: '🐰',
      hamster: '🐹',
      fish: '🐠',
      reptile: '🦎',
      horse: '🐴'
    };
    return emojis[species?.toLowerCase()] || '🐾';
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Unknown';
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isVaccinationDue = (nextDueDate: string) => {
    if (!nextDueDate) return false;
    return new Date(nextDueDate) <= new Date();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Pet Details" 
          description="View pet information"
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error || !pet) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="Pet Not Found" 
          description="The requested pet could not be found"
        >
          <div className="text-center py-12">
            <PawPrint className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Pet not found</h3>
            <p className="mt-1 text-sm text-gray-700">
              The pet you're looking for doesn't exist or has been removed.
            </p>
            <div className="mt-6">
              <Link
                href="/pets"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Pets</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  const tabs = [
    { id: 'details', label: 'Pet Details', icon: PawPrint },
    { id: 'medical', label: 'Medical History', icon: FileText },
    { id: 'vaccinations', label: 'Vaccinations', icon: Syringe, count: pet.vaccinations?.length || 0 },
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
  ];

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Pet Details" 
        description="View and manage pet information"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/pets"
              className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pets
            </Link>
            
            {/* Pet Header Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{getSpeciesEmoji(pet.species)}</div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                    <p className="text-lg text-gray-600 capitalize">{pet.species} • {pet.breed}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        pet.status === 'active' ? 'bg-green-100 text-green-800' : 
                        pet.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pet.status}
                      </span>
                      <span className="text-sm text-gray-500">ID: {pet.petId}</span>
                      {pet.spayedNeutered && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Spayed/Neutered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/pets/${pet._id}/edit`}
                  className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Pet</span>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto bg-blue-100 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900">Age</p>
                  <p className="text-sm text-gray-600">{calculateAge(pet.dateOfBirth)}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto bg-pink-100 rounded-full">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900">Gender</p>
                  <p className="text-sm text-gray-600 capitalize">{pet.gender === 'male' ? '♂ Male' : pet.gender === 'female' ? '♀ Female' : 'Unknown'}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto bg-orange-100 rounded-full">
                    <Scale className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900">Weight</p>
                  <p className="text-sm text-gray-600">{pet.weight ? `${pet.weight} ${pet.weightUnit || 'kg'}` : 'Not recorded'}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto bg-teal-100 rounded-full">
                    <Stethoscope className="h-5 w-5 text-teal-600" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900">Veterinarian</p>
                  <p className="text-sm text-gray-600">{pet.assignedVet || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                          activeTab === tab.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Pet Details Tab */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pet Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PawPrint className="h-5 w-5 text-emerald-600 mr-2" />
                    Pet Information
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">Name</dt>
                      <dd className="text-sm font-medium text-gray-900">{pet.name}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">Species</dt>
                      <dd className="text-sm font-medium text-gray-900 capitalize">{pet.species}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">Breed</dt>
                      <dd className="text-sm font-medium text-gray-900">{pet.breed}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">Date of Birth</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'Not recorded'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">Gender</dt>
                      <dd className="text-sm font-medium text-gray-900 capitalize">{pet.gender}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">Color</dt>
                      <dd className="text-sm font-medium text-gray-900">{pet.color || 'Not recorded'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500">Microchip</dt>
                      <dd className="text-sm font-medium text-gray-900">{pet.microchipNumber || 'Not chipped'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Owner Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    Owner Information
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Name
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">{pet.ownerName}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        <a href={`mailto:${pet.ownerEmail}`} className="text-emerald-600 hover:underline">{pet.ownerEmail}</a>
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        <a href={`tel:${pet.ownerPhone}`} className="text-emerald-600 hover:underline">{pet.ownerPhone}</a>
                      </dd>
                    </div>
                    {pet.ownerAddress && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Address
                        </dt>
                        <dd className="text-sm font-medium text-gray-900 text-right max-w-xs">{pet.ownerAddress}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Notes */}
                {pet.notes && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 text-gray-600 mr-2" />
                      Notes
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">{pet.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Medical History Tab */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                {/* Allergies */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    Known Allergies
                  </h3>
                  {pet.allergies && pet.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {pet.allergies.map((allergy: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No known allergies</p>
                  )}
                </div>

                {/* Current Medications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Pill className="h-5 w-5 text-blue-600 mr-2" />
                    Current Medications
                  </h3>
                  {pet.currentMedications && pet.currentMedications.length > 0 ? (
                    <ul className="space-y-2">
                      {pet.currentMedications.map((medication: string, index: number) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          {medication}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No current medications</p>
                  )}
                </div>

                {/* Medical History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    Medical History
                  </h3>
                  {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
                    <ul className="space-y-2">
                      {pet.medicalHistory.map((item: string, index: number) => (
                        <li key={index} className="flex items-start text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-1.5"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No medical history recorded</p>
                  )}
                </div>
              </div>
            )}

            {/* Vaccinations Tab */}
            {activeTab === 'vaccinations' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Syringe className="h-5 w-5 text-purple-600 mr-2" />
                    Vaccination Records
                  </h3>
                </div>
                {pet.vaccinations && pet.vaccinations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Given</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pet.vaccinations.map((vax: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vax.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(vax.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {vax.nextDueDate ? new Date(vax.nextDueDate).toLocaleDateString() : 'Not set'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {vax.nextDueDate && isVaccinationDue(vax.nextDueDate) ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Overdue
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Current
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Syringe className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No vaccinations recorded</h3>
                    <p className="mt-1 text-sm text-gray-500">Add vaccination records when editing this pet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    Appointment History
                  </h3>
                  <Link
                    href="/appointments/new"
                    className="inline-flex items-center space-x-2 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700"
                  >
                    <span>Schedule Appointment</span>
                  </Link>
                </div>
                {loadingAppointments ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()).map((apt) => (
                      <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Calendar className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">{apt.appointmentType} - {apt.vetName}</p>
                            {apt.reason && <p className="text-xs text-gray-400 mt-1">{apt.reason}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                          <Link
                            href={`/appointments/${apt._id}`}
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">Schedule an appointment for this pet.</p>
                    <div className="mt-4">
                      <Link
                        href="/appointments/new"
                        className="inline-flex items-center space-x-2 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                      >
                        <span>Schedule Appointment</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

