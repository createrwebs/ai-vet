'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, PawPrint } from 'lucide-react';

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

interface SearchablePetSelectProps {
  value: string;
  onChange: (pet: Pet | null) => void;
  placeholder?: string;
  className?: string;
}

const getSpeciesEmoji = (species: string): string => {
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

export default function SearchablePetSelect({
  value,
  onChange,
  placeholder = "Search and select a pet...",
  className = ""
}: SearchablePetSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchPets(searchTerm);
      } else {
        searchPets('');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load initial pets when component mounts
  useEffect(() => {
    searchPets('');
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPets = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pets/search?q=${encodeURIComponent(query)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      }
    } catch (error) {
      console.error('Error searching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // If search term is cleared, clear selection
    if (!newSearchTerm.trim()) {
      setSelectedPet(null);
      onChange(null);
    }
  };

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setSearchTerm(`${pet.name} (${pet.species})`);
    setIsOpen(false);
    onChange(pet);
  };

  const handleClear = () => {
    setSelectedPet(null);
    setSearchTerm('');
    onChange(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < pets.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && pets[highlightedIndex]) {
          handlePetSelect(pets[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <PawPrint className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {selectedPet && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mx-auto"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : pets.length > 0 ? (
            pets.map((pet, index) => (
              <div
                key={pet._id}
                onClick={() => handlePetSelect(pet)}
                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === highlightedIndex
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSpeciesEmoji(pet.species)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{pet.name}</div>
                      <div className="text-sm text-gray-500">
                        {pet.petId} • {pet.breed} • Owner: {pet.ownerName}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 capitalize">
                    {pet.species}
                  </div>
                </div>
              </div>
            ))
          ) : searchTerm.trim() ? (
            <div className="p-3 text-center text-gray-500">
              No pets found for "{searchTerm}"
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              Start typing to search pets...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

