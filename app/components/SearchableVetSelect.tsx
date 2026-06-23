'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Stethoscope } from 'lucide-react';

interface Veterinarian {
  _id: string;
  name: string;
  email: string;
  specialization?: string;
  licenseNumber?: string;
  image?: string;
}

interface SearchableVetSelectProps {
  value: string;
  onChange: (vet: Veterinarian | null) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchableVetSelect({
  value,
  onChange,
  placeholder = "Search and select a veterinarian...",
  className = ""
}: SearchableVetSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchVeterinarians(searchTerm);
      } else {
        searchVeterinarians('');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load initial veterinarians when component mounts
  useEffect(() => {
    searchVeterinarians('');
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

  const searchVeterinarians = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/veterinarians?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setVeterinarians(data);
      }
    } catch (error) {
      console.error('Error searching veterinarians:', error);
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
      setSelectedVet(null);
      onChange(null);
    }
  };

  const handleVetSelect = (vet: Veterinarian) => {
    setSelectedVet(vet);
    setSearchTerm(`${vet.name}${vet.specialization ? ` - ${vet.specialization}` : ''}${vet.licenseNumber ? ` (${vet.licenseNumber})` : ''}`);
    setIsOpen(false);
    onChange(vet);
  };

  const handleClear = () => {
    setSelectedVet(null);
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
          prev < veterinarians.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && veterinarians[highlightedIndex]) {
          handleVetSelect(veterinarians[highlightedIndex]);
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
          <Stethoscope className="h-4 w-4 text-gray-400" />
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
          {selectedVet && (
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
          ) : veterinarians.length > 0 ? (
            veterinarians.map((vet, index) => (
              <div
                key={vet._id}
                onClick={() => handleVetSelect(vet)}
                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === highlightedIndex
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{vet.name}</div>
                      <div className="text-sm text-gray-500">
                        {vet.specialization && `${vet.specialization} • `}
                        {vet.licenseNumber && `License: ${vet.licenseNumber}`}
                        {!vet.specialization && !vet.licenseNumber && vet.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Dr.
                  </div>
                </div>
              </div>
            ))
          ) : searchTerm.trim() ? (
            <div className="p-3 text-center text-gray-500">
              No veterinarians found for "{searchTerm}"
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              Start typing to search veterinarians...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
