'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  PawPrint,
  Stethoscope,
  Save,
  ArrowLeft,
  AlertCircle,
  FileText,
  CheckCircle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import SearchablePetSelect from '../../components/SearchablePetSelect';
import SearchableVetSelect from '../../components/SearchableVetSelect';
import { useTranslations } from '../../hooks/useTranslations';

interface Pet {
  _id: string;
  petId: string;
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

interface AppointmentFormData {
  petId: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  vetName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  reason: string;
  notes: string;
  status: string;
}

export default function NewAppointmentPage() {
  const { t, translationsLoaded } = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pet' | 'appointment' | 'details' | 'review'>('pet');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedVet, setSelectedVet] = useState<any>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    petId: '',
    petName: '',
    petSpecies: '',
    petBreed: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    vetName: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    reason: '',
    notes: '',
    status: 'scheduled'
  });

  const appointmentTypes = [
    { value: 'consultation', label: t('appointments.types.consultation') },
    { value: 'follow-up', label: t('appointments.types.followUp') },
    { value: 'checkup', label: t('appointments.types.checkup') },
    { value: 'vaccination', label: t('appointments.types.vaccination') },
    { value: 'surgery', label: t('appointments.types.surgery') },
    { value: 'dental', label: t('appointments.types.dental') },
    { value: 'grooming', label: t('appointments.types.grooming') },
    { value: 'emergency', label: t('appointments.types.emergency') }
  ];

  const statusOptions = [
    { value: 'scheduled', label: t('appointments.status.scheduled') },
    { value: 'confirmed', label: t('appointments.status.confirmed') },
    { value: 'in-progress', label: t('appointments.status.inProgress') },
    { value: 'completed', label: t('appointments.status.completed') },
    { value: 'cancelled', label: t('appointments.status.cancelled') }
  ];

  // Handle veterinarian selection
  const handleVetChange = (vet: any) => {
    setSelectedVet(vet);
    setFormData(prev => ({
      ...prev,
      vetName: vet ? vet.name : ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePetSelect = (pet: Pet | null) => {
    setSelectedPet(pet);
    if (pet) {
      setFormData(prev => ({
        ...prev,
        petId: pet.petId,
        petName: pet.name,
        petSpecies: pet.species,
        petBreed: pet.breed,
        ownerName: pet.ownerName,
        ownerEmail: pet.ownerEmail,
        ownerPhone: pet.ownerPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        petId: '',
        petName: '',
        petSpecies: '',
        petBreed: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.petName.trim()) {
      newErrors.petName = t('appointments.new.validation.petNameRequired');
    }

    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = t('appointments.new.validation.ownerEmailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = t('appointments.new.validation.ownerEmailInvalid');
    }

    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = t('appointments.new.validation.ownerPhoneRequired');
    }

    if (!formData.vetName.trim()) {
      newErrors.vetName = t('appointments.new.validation.vetNameRequired');
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = t('appointments.new.validation.appointmentDateRequired');
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = t('appointments.new.validation.appointmentDatePast');
      }
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = t('appointments.new.validation.appointmentTimeRequired');
    }

    if (!formData.reason.trim()) {
      newErrors.reason = t('appointments.new.validation.reasonRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/appointments');
      } else {
        const errorData = await response.json();
        console.error('Error creating appointment:', errorData);
        alert(t('appointments.new.errors.createFailed', { error: errorData.error || 'Unknown error' }));
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(t('appointments.new.errors.createFailedGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/appointments');
  };

  const nextTab = () => {
    const tabs = ['pet', 'appointment', 'details', 'review'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1] as any);
    }
  };

  const prevTab = () => {
    const tabs = ['pet', 'appointment', 'details', 'review'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1] as any);
    }
  };

  const isTabValid = (tab: string) => {
    switch (tab) {
      case 'pet':
        return formData.petName && formData.ownerEmail && formData.ownerPhone;
      case 'appointment':
        return formData.vetName && formData.appointmentDate && formData.appointmentTime;
      case 'details':
        return formData.reason;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const getSpeciesEmoji = (species: string): string => {
    const emojis: Record<string, string> = {
      dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰',
      hamster: '🐹', fish: '🐠', reptile: '🦎', horse: '🐴'
    };
    return emojis[species?.toLowerCase()] || '🐾';
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={t('appointments.new.title')}
        description={t('appointments.new.description')}
      >
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('appointments.new.backToAppointments')}
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { id: 'pet', label: t('appointments.new.steps.petOwnerInfo'), icon: PawPrint },
                { id: 'appointment', label: t('appointments.new.steps.appointmentDetails'), icon: Calendar },
                { id: 'details', label: t('appointments.new.steps.additionalInfo'), icon: FileText },
                { id: 'review', label: t('appointments.new.steps.reviewConfirm'), icon: CheckCircle }
              ].map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    activeTab === step.id 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : isTabValid(step.id)
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${
                      activeTab === step.id ? 'text-emerald-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className={`w-8 md:w-16 h-0.5 mx-2 md:mx-4 ${
                      isTabValid(step.id) ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Pet & Owner Tab */}
            {activeTab === 'pet' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <PawPrint className="h-5 w-5 text-emerald-600 mr-2" />
                  {t('appointments.new.petOwnerInformation')}
                </h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('appointments.new.selectPet')} *
                  </label>
                  <SearchablePetSelect
                    value={formData.petName}
                    onChange={handlePetSelect}
                    placeholder={t('appointments.new.searchPetPlaceholder')}
                  />
                  {errors.petName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.petName}
                    </p>
                  )}
                </div>

                {selectedPet && (
                  <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{getSpeciesEmoji(selectedPet.species)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedPet.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{selectedPet.species} • {selectedPet.breed}</p>
                        <p className="text-sm text-gray-500">ID: {selectedPet.petId}</p>
                      </div>
                    </div>
                  </div>
                )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      {t('appointments.new.ownerName')}
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      {t('appointments.new.ownerEmail')} *
                      </label>
                      <input
                        type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                        onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.ownerEmail ? 'border-red-500' : 'border-gray-300'
                      } ${selectedPet ? 'bg-gray-50' : ''}`}
                      readOnly={!!selectedPet}
                      />
                    {errors.ownerEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.ownerEmail}</p>
                      )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      {t('appointments.new.ownerPhone')} *
                    </label>
                      <input
                        type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                        onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.ownerPhone ? 'border-red-500' : 'border-gray-300'
                      } ${selectedPet ? 'bg-gray-50' : ''}`}
                      readOnly={!!selectedPet}
                      />
                    {errors.ownerPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.ownerPhone}</p>
                      )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={nextTab}
                    disabled={!isTabValid('pet')}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {t('appointments.new.nextAppointmentDetails')}
                  </button>
                </div>
              </div>
            )}

            {/* Appointment Tab */}
            {activeTab === 'appointment' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  {t('appointments.new.appointmentDetails')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Stethoscope className="inline h-4 w-4 mr-1" />
                      {t('appointments.new.veterinarian')} *
                    </label>
                    <SearchableVetSelect
                      value={formData.vetName}
                      onChange={handleVetChange}
                      placeholder={t('appointments.new.searchVetPlaceholder')}
                      className={`w-full ${errors.vetName ? 'border-red-500' : ''}`}
                    />
                    {errors.vetName && (
                      <p className="mt-1 text-sm text-red-600">{errors.vetName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('appointments.new.appointmentType')}
                    </label>
                    <select
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {appointmentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('appointments.new.date')} *
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.appointmentDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('appointments.new.time')} *
                    </label>
                    <input
                      type="time"
                      name="appointmentTime"
                      value={formData.appointmentTime}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.appointmentTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.appointmentTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('appointments.new.status')}
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={prevTab}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    {t('appointments.new.back')}
                  </button>
                  <button
                    type="button"
                    onClick={nextTab}
                    disabled={!isTabValid('appointment')}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {t('appointments.new.nextAdditionalInfo')}
                  </button>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <FileText className="h-5 w-5 text-purple-600 mr-2" />
                  {t('appointments.new.additionalInformation')}
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('appointments.new.reasonForVisit')} *
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder={t('appointments.new.reasonPlaceholder')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.reason ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.reason && (
                      <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('appointments.new.additionalNotes')}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder={t('appointments.new.notesPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={prevTab}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    {t('appointments.new.back')}
                  </button>
                  <button
                    type="button"
                    onClick={nextTab}
                    disabled={!isTabValid('details')}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {t('appointments.new.nextReview')}
                  </button>
                </div>
              </div>
            )}

            {/* Review Tab */}
            {activeTab === 'review' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  {t('appointments.new.reviewConfirmAppointment')}
                </h3>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <PawPrint className="h-4 w-4 mr-2 text-emerald-600" />
                      {t('appointments.new.petInformation')}
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.petName')}:</dt>
                        <dd className="font-medium">{formData.petName} {getSpeciesEmoji(formData.petSpecies)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.speciesBreed')}:</dt>
                        <dd className="font-medium capitalize">{formData.petSpecies} - {formData.petBreed}</dd>
                    </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.owner')}:</dt>
                        <dd className="font-medium">{formData.ownerName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.phone')}:</dt>
                        <dd className="font-medium">{formData.ownerPhone}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      {t('appointments.new.appointmentDetails')}
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.veterinarianLabel')}:</dt>
                        <dd className="font-medium">{formData.vetName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.date')}:</dt>
                        <dd className="font-medium">{formData.appointmentDate}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.time')}:</dt>
                        <dd className="font-medium">{formData.appointmentTime}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.type')}:</dt>
                        <dd className="font-medium capitalize">{formData.appointmentType}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('appointments.new.status')}:</dt>
                        <dd className="font-medium capitalize">{formData.status}</dd>
                      </div>
                    </dl>
                    </div>
                  </div>
                  
                  {formData.reason && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('appointments.new.reasonForVisitLabel')}</h4>
                      <p className="text-sm text-gray-600">{formData.reason}</p>
                    </div>
                  )}
                  
                  {formData.notes && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('appointments.new.additionalNotes')}</h4>
                      <p className="text-sm text-gray-600">{formData.notes}</p>
                    </div>
                  )}

                <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={prevTab}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                    {t('appointments.new.back')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('appointments.new.scheduling')}
                    </>
                  ) : (
                    <>
                        <Save className="h-4 w-4 mr-2" />
                        {t('appointments.new.scheduleAppointment')}
                    </>
                  )}
                </button>
             </div>
           </div>
            )}
         </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
