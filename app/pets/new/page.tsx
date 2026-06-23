'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchableVetSelect from '../../components/SearchableVetSelect';
import { 
  PawPrint, 
  ArrowLeft, 
  Save, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Syringe,
  Scale,
  Heart,
  Stethoscope
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import { useTranslations } from '../../hooks/useTranslations';

export default function NewPetPage() {
  const router = useRouter();
  const { t, translationsLoaded } = useTranslations();
  const [formData, setFormData] = useState({
    // Pet Information
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    weightUnit: 'kg',
    color: '',
    microchipNumber: '',
    spayedNeutered: false,
    
    // Owner Information
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerAddress: '',
    
    // Medical Information
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    
    // Vaccination Records
    rabiesDate: '',
    dhppDate: '',
    bordetellaDate: '',
    
    // Clinic Information
    assignedVet: '',
    notes: ''
  });

  const [activeSection, setActiveSection] = useState('pet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVet, setSelectedVet] = useState<any>(null);

  // Handle veterinarian selection
  const handleVetChange = (vet: any) => {
    setSelectedVet(vet);
    setFormData((prev: any) => ({
      ...prev,
      assignedVet: vet ? vet.name : ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate required fields
    if (!formData.name || !formData.species || !formData.breed || !formData.gender || !formData.ownerName || !formData.ownerEmail || !formData.ownerPhone) {
      alert(t('pets.newPet.validation.requiredFields'));
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare vaccinations array
      const vaccinations: { name: string; date: Date; nextDueDate?: Date }[] = [];
      if (formData.rabiesDate) {
        vaccinations.push({
          name: 'Rabies',
          date: new Date(formData.rabiesDate),
          nextDueDate: new Date(new Date(formData.rabiesDate).setFullYear(new Date(formData.rabiesDate).getFullYear() + 1))
        });
      }
      if (formData.dhppDate) {
        vaccinations.push({
          name: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
          date: new Date(formData.dhppDate),
          nextDueDate: new Date(new Date(formData.dhppDate).setFullYear(new Date(formData.dhppDate).getFullYear() + 1))
        });
      }
      if (formData.bordetellaDate) {
        vaccinations.push({
          name: 'Bordetella (Kennel Cough)',
          date: new Date(formData.bordetellaDate),
          nextDueDate: new Date(new Date(formData.bordetellaDate).setMonth(new Date(formData.bordetellaDate).getMonth() + 6))
        });
      }

      const petData: any = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        status: 'active',
      };

      // Optional fields
      if (formData.dateOfBirth) petData.dateOfBirth = new Date(formData.dateOfBirth);
      if (formData.weight) {
        petData.weight = parseFloat(formData.weight);
        petData.weightUnit = formData.weightUnit;
      }
      if (formData.color) petData.color = formData.color;
      if (formData.microchipNumber) petData.microchipNumber = formData.microchipNumber;
      petData.spayedNeutered = formData.spayedNeutered;
      if (formData.ownerAddress) petData.ownerAddress = formData.ownerAddress;
      if (formData.medicalHistory) petData.medicalHistory = formData.medicalHistory.split('\n').filter(Boolean);
      if (formData.allergies) petData.allergies = formData.allergies.split(',').map(a => a.trim()).filter(Boolean);
      if (formData.currentMedications) petData.currentMedications = formData.currentMedications.split('\n').filter(Boolean);
      if (vaccinations.length > 0) petData.vaccinations = vaccinations;
      if (formData.assignedVet) petData.assignedVet = formData.assignedVet;
      if (formData.notes) petData.notes = formData.notes;

      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      if (response.ok) {
        alert('Pet added successfully!');
        router.push('/pets');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      alert('Error adding pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'pet', labelKey: 'pets.newPet.sections.pet', icon: PawPrint },
    { id: 'owner', labelKey: 'pets.newPet.sections.owner', icon: User },
    { id: 'medical', labelKey: 'pets.newPet.sections.medicalHistory', icon: FileText },
    { id: 'vaccinations', labelKey: 'pets.newPet.sections.vaccinations', icon: Syringe },
    { id: 'clinic', labelKey: 'pets.newPet.sections.clinic', icon: Stethoscope }
  ];

  const speciesOptions = [
    { value: 'dog', labelKey: 'pets.newPet.speciesOptions.dog', emoji: '🐕' },
    { value: 'cat', labelKey: 'pets.newPet.speciesOptions.cat', emoji: '🐱' },
    { value: 'bird', labelKey: 'pets.newPet.speciesOptions.bird', emoji: '🦜' },
    { value: 'rabbit', labelKey: 'pets.newPet.speciesOptions.rabbit', emoji: '🐰' },
    { value: 'hamster', labelKey: 'pets.newPet.speciesOptions.hamster', emoji: '🐹' },
    { value: 'fish', labelKey: 'pets.newPet.speciesOptions.fish', emoji: '🐠' },
    { value: 'reptile', labelKey: 'pets.newPet.speciesOptions.reptile', emoji: '🦎' },
    { value: 'horse', labelKey: 'pets.newPet.speciesOptions.horse', emoji: '🐴' },
    { value: 'other', labelKey: 'pets.newPet.speciesOptions.other', emoji: '🐾' }
  ];

  const breedsBySpecies: Record<string, string[]> = {
    dog: ['Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund', 'Siberian Husky', 'Shih Tzu', 'Mixed Breed', 'Other'],
    cat: ['Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair', 'Abyssinian', 'Bengal', 'Sphynx', 'Scottish Fold', 'Russian Blue', 'Domestic Shorthair', 'Domestic Longhair', 'Mixed Breed', 'Other'],
    bird: ['Parakeet/Budgie', 'Cockatiel', 'African Grey Parrot', 'Cockatoo', 'Macaw', 'Lovebird', 'Canary', 'Finch', 'Conure', 'Other'],
    rabbit: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Flemish Giant', 'Lionhead', 'Dutch', 'Rex', 'Other'],
    hamster: ['Syrian', 'Dwarf Campbell', 'Dwarf Winter White', 'Roborovski', 'Chinese', 'Other'],
    fish: ['Goldfish', 'Betta', 'Guppy', 'Angelfish', 'Tetra', 'Koi', 'Other'],
    reptile: ['Bearded Dragon', 'Leopard Gecko', 'Ball Python', 'Corn Snake', 'Red-Eared Slider', 'Iguana', 'Chameleon', 'Other'],
    horse: ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Morgan', 'Appaloosa', 'Paint', 'Clydesdale', 'Other'],
    other: ['Other']
  };

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={t('pets.newPet.title')}
        description={t('pets.newPet.description')}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/pets"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('pets.newPet.backToPets')}</span>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Navigation */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  <span>{t(section.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pet Information Section */}
          {activeSection === 'pet' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PawPrint className="h-5 w-5 text-emerald-600 mr-2" />
                {t('pets.newPet.sections.pet')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.petName')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('pets.newPet.placeholders.petName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.species')} *
                  </label>
                  <select
                    id="species"
                    name="species"
                    required
                    value={formData.species}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">{t('pets.newPet.selectOptions.selectSpecies')}</option>
                    {speciesOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.emoji} {t(option.labelKey)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.breed')} *
                  </label>
                  <select
                    id="breed"
                    name="breed"
                    required
                    value={formData.breed}
                    onChange={handleInputChange}
                    disabled={!formData.species}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  >
                    <option value="">{formData.species ? t('pets.newPet.selectOptions.selectBreed') : t('pets.newPet.selectOptions.selectBreedFirst')}</option>
                    {formData.species && breedsBySpecies[formData.species]?.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.dateOfBirth')}
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.gender')} *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">{t('pets.newPet.selectOptions.selectGender')}</option>
                    <option value="male">♂ {t('pets.newPet.genderOptions.male')}</option>
                    <option value="female">♀ {t('pets.newPet.genderOptions.female')}</option>
                    <option value="unknown">{t('pets.newPet.genderOptions.unknown')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.colorMarkings')}
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder={t('pets.newPet.placeholders.color')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('pets.newPet.labels.weight')}
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        step="0.1"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="0.0"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <select
                        name="weightUnit"
                        value={formData.weightUnit}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="microchipNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.microchipNumber')}
                  </label>
                  <input
                    type="text"
                    id="microchipNumber"
                    name="microchipNumber"
                    value={formData.microchipNumber}
                    onChange={handleInputChange}
                    placeholder={t('pets.newPet.placeholders.microchip')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="spayedNeutered"
                      checked={formData.spayedNeutered}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{t('pets.newPet.labels.spayedNeutered')}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Owner Information Section */}
          {activeSection === 'owner' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                {t('pets.newPet.sections.owner')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.ownerName')} *
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    required
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder={t('pets.newPet.placeholders.ownerName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.ownerEmail')} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="ownerEmail"
                      name="ownerEmail"
                      required
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      placeholder={t('pets.newPet.placeholders.ownerEmail')}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.ownerPhone')} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      id="ownerPhone"
                      name="ownerPhone"
                      required
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      placeholder={t('pets.newPet.placeholders.ownerPhone')}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="ownerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.ownerAddress')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      id="ownerAddress"
                      name="ownerAddress"
                      rows={2}
                      value={formData.ownerAddress}
                      onChange={handleInputChange}
                      placeholder={t('pets.newPet.placeholders.ownerAddress')}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical History Section */}
          {activeSection === 'medical' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-red-600 mr-2" />
                {t('pets.newPet.sections.medicalHistory')}
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.knownAllergies')}
                  </label>
                  <input
                    type="text"
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder={t('pets.newPet.placeholders.allergies')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="currentMedications" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.currentMedications')}
                  </label>
                  <textarea
                    id="currentMedications"
                    name="currentMedications"
                    rows={3}
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    placeholder={t('pets.newPet.placeholders.medications')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.medicalHistoryPrevious')}
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={4}
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    placeholder={t('pets.newPet.placeholders.medicalHistory')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vaccinations Section */}
          {activeSection === 'vaccinations' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Syringe className="h-5 w-5 text-purple-600 mr-2" />
                {t('pets.newPet.sections.vaccinations')}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{t('pets.newPet.labels.vaccinationDescription')}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="rabiesDate" className="block text-sm font-medium text-gray-700 mb-2">
                    🦠 Rabies
                  </label>
                  <input
                    type="date"
                    id="rabiesDate"
                    name="rabiesDate"
                    value={formData.rabiesDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('pets.newPet.labels.rabiesRequired')}</p>
                </div>
                <div>
                  <label htmlFor="dhppDate" className="block text-sm font-medium text-gray-700 mb-2">
                    💉 DHPP (5-in-1)
                  </label>
                  <input
                    type="date"
                    id="dhppDate"
                    name="dhppDate"
                    value={formData.dhppDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('pets.newPet.labels.dhppDescription')}</p>
                </div>
                <div>
                  <label htmlFor="bordetellaDate" className="block text-sm font-medium text-gray-700 mb-2">
                    🫁 Bordetella
                  </label>
                  <input
                    type="date"
                    id="bordetellaDate"
                    name="bordetellaDate"
                    value={formData.bordetellaDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('pets.newPet.labels.bordetellaDescription')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Clinic Information Section */}
          {activeSection === 'clinic' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Stethoscope className="h-5 w-5 text-teal-600 mr-2" />
                {t('pets.newPet.sections.clinic')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.assignedVeterinarian')}
                  </label>
                  <SearchableVetSelect
                    value={formData.assignedVet}
                    onChange={handleVetChange}
                    placeholder={t('pets.newPet.placeholders.veterinarian')}
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pets.newPet.labels.additionalNotes')}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={t('pets.newPet.placeholders.notes')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <div className="flex space-x-2 overflow-x-auto">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}. {t(section.labelKey)}
                </button>
              ))}
            </div>
            <div className="flex space-x-3 ml-4">
              <Link
                href="/pets"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('pets.newPet.buttons.cancel')}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSubmitting ? t('pets.newPet.buttons.saving') : t('pets.newPet.buttons.savePet')}</span>
              </button>
            </div>
          </div>
        </form>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

