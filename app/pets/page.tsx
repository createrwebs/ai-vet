'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PawPrint, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Dog,
  Cat,
  Bird
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import { useTranslations } from '../hooks/useTranslations';

export default function PetsPage() {
  const router = useRouter();
  const { t, translationsLoaded } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('/api/pets');
        if (response.ok) {
          const data = await response.json();
          setPets(data);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.petId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = speciesFilter === 'all' || pet.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'deceased':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species?.toLowerCase()) {
      case 'dog':
        return '🐕';
      case 'cat':
        return '🐱';
      case 'bird':
        return '🦜';
      case 'rabbit':
        return '🐰';
      case 'hamster':
        return '🐹';
      case 'fish':
        return '🐠';
      case 'reptile':
        return '🦎';
      case 'horse':
        return '🐴';
      default:
        return '🐾';
    }
  };

  const handleViewPet = (pet: any) => {
    router.push(`/pets/${pet._id}`);
  };

  const handleEditPet = (pet: any) => {
    router.push(`/pets/${pet._id}/edit`);
  };

  const handleDeletePet = async (pet: any) => {
    const confirmMessage = translationsLoaded 
      ? t('pets.delete.confirm', { name: pet.name })
      : `Are you sure you want to delete ${pet.name}?`;
    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`/api/pets/${pet._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setPets(pets.filter(p => p._id !== pet._id));
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const toggleActionsMenu = (petId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowActionsMenu(showActionsMenu === petId ? null : petId);
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const menuElements = document.querySelectorAll('[data-menu-id]');
      let clickedInsideMenu = false;
      
      menuElements.forEach((menu) => {
        if (menu.contains(target)) {
          clickedInsideMenu = true;
        }
      });
      
      if (!clickedInsideMenu) {
        setShowActionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowActionsMenu(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={translationsLoaded ? t('pets.title') : 'Pets'} 
        description={translationsLoaded ? t('pets.description') : 'Manage your clinic\'s pet patients'}
      >
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {translationsLoaded 
                ? (filteredPets.length === 1 
                    ? t('pets.petCount', { count: filteredPets.length })
                    : t('pets.petCountPlural', { count: filteredPets.length }))
                : `${filteredPets.length} ${filteredPets.length === 1 ? 'pet' : 'pets'}`}
            </span>
          </div>
          <Link
            href="/pets/new"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{translationsLoaded ? t('pets.addNewPet') : 'Add New Pet'}</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={translationsLoaded ? t('pets.searchPets') : 'Search pets by name, owner, or ID...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{translationsLoaded ? t('pets.allSpecies') : 'All Species'}</option>
                <option value="dog">{translationsLoaded ? t('pets.speciesPlural.dog') : 'Dogs'}</option>
                <option value="cat">{translationsLoaded ? t('pets.speciesPlural.cat') : 'Cats'}</option>
                <option value="bird">{translationsLoaded ? t('pets.speciesPlural.bird') : 'Birds'}</option>
                <option value="rabbit">{translationsLoaded ? t('pets.speciesPlural.rabbit') : 'Rabbits'}</option>
                <option value="hamster">{translationsLoaded ? t('pets.speciesPlural.hamster') : 'Hamsters'}</option>
                <option value="fish">{translationsLoaded ? t('pets.speciesPlural.fish') : 'Fish'}</option>
                <option value="reptile">{translationsLoaded ? t('pets.speciesPlural.reptile') : 'Reptiles'}</option>
                <option value="horse">{translationsLoaded ? t('pets.speciesPlural.horse') : 'Horses'}</option>
                <option value="other">{translationsLoaded ? t('pets.speciesPlural.other') : 'Other'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pets List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">{t('common.loading') || 'Loading...'}</p>
              </div>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {translationsLoaded ? t('pets.pet') : 'Pet'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {translationsLoaded ? t('pets.speciesBreed') : 'Species / Breed'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {translationsLoaded ? t('pets.owner') : 'Owner'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {translationsLoaded ? t('pets.status') : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {translationsLoaded ? t('pets.assignedVet') : 'Assigned Vet'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {translationsLoaded ? t('pets.actions') : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPets.map((pet) => (
                  <tr 
                    key={pet._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewPet(pet)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                          {getSpeciesIcon(pet.species)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pet.name}</div>
                          <div className="text-sm text-gray-500">ID: {pet.petId || pet._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{pet.species}</div>
                      <div className="text-sm text-gray-500">{pet.breed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pet.ownerName}</div>
                      <div className="text-sm text-gray-500">{pet.ownerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pet.status || 'active')}`}>
                        {translationsLoaded ? t(`pets.statusValues.${pet.status || 'active'}`) : (pet.status || 'Active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pet.assignedVet || (translationsLoaded ? t('pets.notAssigned') : 'Not assigned')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPet(pet);
                          }}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          {translationsLoaded ? t('pets.view') : 'View'}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPet(pet);
                          }}
                          className="text-green-600 hover:text-green-900 hover:underline"
                        >
                          {translationsLoaded ? t('pets.edit') : 'Edit'}
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActionsMenu(pet._id, e);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {showActionsMenu === pet._id && (
                            <div 
                              data-menu-id={pet._id}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowActionsMenu(null);
                                    handleViewPet(pet);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {translationsLoaded ? t('pets.viewDetails') : 'View Details'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowActionsMenu(null);
                                    handleEditPet(pet);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {translationsLoaded ? t('pets.editPet') : 'Edit Pet'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowActionsMenu(null);
                                    router.push(`/appointments/new?petId=${pet._id}`);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {translationsLoaded ? t('pets.scheduleAppointment') : 'Schedule Appointment'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowActionsMenu(null);
                                    handleDeletePet(pet);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  {translationsLoaded ? t('pets.deletePet') : 'Delete Pet'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!loading && filteredPets.length === 0 && (
          <div className="text-center py-12">
            <PawPrint className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {translationsLoaded ? t('pets.emptyState.noPetsFoundTitle') : 'No pets found'}
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              {searchTerm 
                ? (translationsLoaded ? t('pets.emptyState.tryAdjustingSearch') : 'Try adjusting your search or filter criteria.')
                : (translationsLoaded ? t('pets.emptyState.getStartedAdding') : 'Get started by adding your first pet patient.')
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  href="/pets/new"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{translationsLoaded ? t('pets.addNewPet') : 'Add New Pet'}</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
}

