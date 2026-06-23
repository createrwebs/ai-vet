'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchableVetSelect from '../../../components/SearchableVetSelect';
import { 
  PawPrint, 
  ArrowLeft, 
  Save, 
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Syringe,
  Stethoscope,
  Loader2
} from 'lucide-react';
import ProtectedRoute from '../../../protected-route';
import SidebarLayout from '../../../components/sidebar-layout';

export default function EditPetPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
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
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerAddress: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    assignedVet: '',
    notes: '',
    status: 'active'
  });

  const [activeSection, setActiveSection] = useState('pet');
  const [selectedVet, setSelectedVet] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Note: Veterinarians are fetched by SearchableVetSelect component

        // Fetch pet data
        const response = await fetch(`/api/pets/${params.id}`);
        if (response.ok) {
          const pet = await response.json();
          setFormData({
            name: pet.name || '',
            species: pet.species || '',
            breed: pet.breed || '',
            dateOfBirth: pet.dateOfBirth ? new Date(pet.dateOfBirth).toISOString().split('T')[0] : '',
            gender: pet.gender || '',
            weight: pet.weight?.toString() || '',
            weightUnit: pet.weightUnit || 'kg',
            color: pet.color || '',
            microchipNumber: pet.microchipNumber || '',
            spayedNeutered: pet.spayedNeutered || false,
            ownerName: pet.ownerName || '',
            ownerEmail: pet.ownerEmail || '',
            ownerPhone: pet.ownerPhone || '',
            ownerAddress: pet.ownerAddress || '',
            medicalHistory: pet.medicalHistory?.join('\n') || '',
            allergies: pet.allergies?.join(', ') || '',
            currentMedications: pet.currentMedications?.join('\n') || '',
            assignedVet: pet.assignedVet || '',
            notes: pet.notes || '',
            status: pet.status || 'active'
          });
        } else {
          setError('Pet not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

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
    
    try {
      const petData: any = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        status: formData.status,
        spayedNeutered: formData.spayedNeutered,
      };

      if (formData.dateOfBirth) petData.dateOfBirth = new Date(formData.dateOfBirth);
      if (formData.weight) {
        petData.weight = parseFloat(formData.weight);
        petData.weightUnit = formData.weightUnit;
      }
      if (formData.color) petData.color = formData.color;
      if (formData.microchipNumber) petData.microchipNumber = formData.microchipNumber;
      if (formData.ownerAddress) petData.ownerAddress = formData.ownerAddress;
      if (formData.medicalHistory) petData.medicalHistory = formData.medicalHistory.split('\n').filter(Boolean);
      if (formData.allergies) petData.allergies = formData.allergies.split(',').map(a => a.trim()).filter(Boolean);
      if (formData.currentMedications) petData.currentMedications = formData.currentMedications.split('\n').filter(Boolean);
      if (formData.assignedVet) petData.assignedVet = formData.assignedVet;
      if (formData.notes) petData.notes = formData.notes;

      const response = await fetch(`/api/pets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      if (response.ok) {
        alert('Pet updated successfully!');
        router.push(`/pets/${params.id}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      alert('Error updating pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'pet', label: 'Pet Information', icon: PawPrint },
    { id: 'owner', label: 'Owner Information', icon: User },
    { id: 'medical', label: 'Medical History', icon: FileText },
    { id: 'clinic', label: 'Clinic Info', icon: Stethoscope }
  ];

  const speciesOptions = [
    { value: 'dog', label: '🐕 Dog' },
    { value: 'cat', label: '🐱 Cat' },
    { value: 'bird', label: '🦜 Bird' },
    { value: 'rabbit', label: '🐰 Rabbit' },
    { value: 'hamster', label: '🐹 Hamster' },
    { value: 'fish', label: '🐠 Fish' },
    { value: 'reptile', label: '🦎 Reptile' },
    { value: 'horse', label: '🐴 Horse' },
    { value: 'other', label: '🐾 Other' }
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

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Edit Pet" description="Loading pet information...">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Pet Not Found" description="The requested pet could not be found">
          <div className="text-center py-12">
            <PawPrint className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Pet not found</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
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

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="Edit Pet"
        description={`Editing ${formData.name}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/pets/${params.id}`}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Pet Details</span>
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
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pet Information Section */}
          {activeSection === 'pet' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PawPrint className="h-5 w-5 text-emerald-600 mr-2" />
                Pet Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
                    Species *
                  </label>
                  <select
                    id="species"
                    name="species"
                    required
                    value={formData.species}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select Species</option>
                    {speciesOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                    Breed *
                  </label>
                  <select
                    id="breed"
                    name="breed"
                    required
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select Breed</option>
                    {formData.species && breedsBySpecies[formData.species]?.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                    {!breedsBySpecies[formData.species]?.includes(formData.breed) && formData.breed && (
                      <option value={formData.breed}>{formData.breed}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
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
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">♂ Male</option>
                    <option value="female">♀ Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                    Color/Markings
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        step="0.1"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <select
                        name="weightUnit"
                        value={formData.weightUnit}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50"
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="microchipNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Microchip Number
                  </label>
                  <input
                    type="text"
                    id="microchipNumber"
                    name="microchipNumber"
                    value={formData.microchipNumber}
                    onChange={handleInputChange}
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
                    <span className="ml-2 text-sm font-medium text-gray-700">Spayed/Neutered</span>
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
                Owner Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    required
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Email *
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Phone *
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="ownerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      id="ownerAddress"
                      name="ownerAddress"
                      rows={2}
                      value={formData.ownerAddress}
                      onChange={handleInputChange}
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
                Medical History
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                    Known Allergies
                  </label>
                  <input
                    type="text"
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="Comma separated (e.g., Chicken, Flea medication)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="currentMedications" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Medications
                  </label>
                  <textarea
                    id="currentMedications"
                    name="currentMedications"
                    rows={3}
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    placeholder="One medication per line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History / Previous Conditions
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={4}
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    placeholder="One entry per line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Clinic Information Section */}
          {activeSection === 'clinic' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Stethoscope className="h-5 w-5 text-teal-600 mr-2" />
                Clinic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Veterinarian
                  </label>
                  <SearchableVetSelect
                    value={formData.assignedVet}
                    onChange={handleVetChange}
                    placeholder="Search and select a veterinarian..."
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 bg-white rounded-lg shadow p-4">
            <Link
              href={`/pets/${params.id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

