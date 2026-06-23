'use client';

import { useState, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles,
  MessageSquare,
  Brain,
  Zap
} from 'lucide-react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import FormattedAIResult from '../components/FormattedAIResult';
import { aiService } from '../../lib/ai-service';
import { aiConfigManager } from '../../lib/ai-config';
import { useTranslations } from '../hooks/useTranslations';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIAssistantPage() {
  const { t, translationsLoaded } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add welcome message when translations are loaded
  useEffect(() => {
    if (translationsLoaded && messages.length === 0) {
      setMessages([
        {
          id: '1',
          content: t('ai.assistant.welcomeMessage'),
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
  }, [translationsLoaded, t, messages.length]);

  // Function to detect if query is about database data
  const detectDataQuery = (query: string): { type: 'pet' | 'appointment' | 'prescription' | 'general', petName?: string } => {
    const lowerQuery = query.toLowerCase();
    
    // Enhanced pet name extraction - try multiple patterns
    const extractPetName = (query: string): string | undefined => {
      // Pattern 1: "pet [Name]" or "for [Name]" or "about [Name]"
      let match = query.match(/(?:pet|for|about|of|details?|information|medical|history|medications?|allergies?|appointments?|prescription|vaccination|vaccine)\s+(?:pet\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (match && match[1]) return match[1];
      
      // Pattern 2: "[Name]'s" (possessive)
      match = query.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'s/);
      if (match && match[1]) return match[1];
      
      // Pattern 3: "tell me about [Name]" or "show me [Name]"
      match = query.match(/(?:tell\s+me\s+about|show\s+me|what\s+about|information\s+about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (match && match[1]) return match[1];
      
      // Pattern 4: Just a name at the start (if query is short and contains a capitalized name)
      const words = query.split(/\s+/);
      if (words.length <= 5) {
        const capitalizedWords = words.filter(w => /^[A-Z][a-z]+$/.test(w));
        if (capitalizedWords.length >= 2) {
          return capitalizedWords.slice(0, 2).join(' ');
        } else if (capitalizedWords.length === 1 && words.length <= 3) {
          return capitalizedWords[0];
        }
      }
      
      return undefined;
    };
    
    // Check for prescription-related queries
    if (lowerQuery.includes('prescription') || lowerQuery.includes('prescribed') || 
        lowerQuery.includes('latest prescription') || lowerQuery.includes('last prescription') ||
        lowerQuery.includes('recent prescription') || lowerQuery.includes('medication prescribed')) {
      const petName = extractPetName(query);
      return { type: 'prescription', petName };
    }
    
    // Check for pet-related queries
    if (lowerQuery.includes('pet') || lowerQuery.includes('pet\'s') || 
        lowerQuery.includes('medical') || lowerQuery.includes('medication') || 
        lowerQuery.includes('allergy') || lowerQuery.includes('history') ||
        lowerQuery.includes('details') || lowerQuery.includes('information') ||
        lowerQuery.includes('tell me about') || lowerQuery.includes('show me') ||
        lowerQuery.includes('vaccination') || lowerQuery.includes('vaccine') ||
        lowerQuery.includes('dog') || lowerQuery.includes('cat') || lowerQuery.includes('bird') ||
        lowerQuery.includes('owner') || lowerQuery.includes('breed') || lowerQuery.includes('species')) {
      const petName = extractPetName(query);
      if (petName) {
        return { type: 'pet', petName };
      }
      // If no name extracted but query seems pet-related, still try to search
      return { type: 'pet' };
    }
    
    // Check for appointment-related queries
    if (lowerQuery.includes('appointment') || lowerQuery.includes('schedule') || lowerQuery.includes('booking')) {
      return { type: 'appointment' };
    }
    
    // Check if query contains a capitalized name (potential pet name)
    const potentialName = extractPetName(query);
    if (potentialName && potentialName.split(' ').length <= 3) {
      return { type: 'pet', petName: potentialName };
    }
    
    return { type: 'general' };
  };

  // Function to fetch pet data
  const fetchPetData = async (petName?: string) => {
    try {
      let response;
      if (petName) {
        // Search for specific pet
        response = await fetch(`/api/pets/search?q=${encodeURIComponent(petName)}&limit=5`);
        if (response.ok) {
          const searchResults = await response.json();
          if (searchResults && searchResults.length > 0) {
            // Fetch full pet details using the pet ID
            const petId = searchResults[0]._id;
            const fullResponse = await fetch(`/api/pets/${petId}`);
            if (fullResponse.ok) {
              return await fullResponse.json();
            }
            // Fallback to search result if full fetch fails
            return searchResults[0];
          }
        }
        return null;
      } else {
        // Get all pets
        response = await fetch('/api/pets');
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : (data.pets || []);
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching pet data:', error);
      return null;
    }
  };

  // Function to fetch appointment data
  const fetchAppointmentData = async (petId?: string) => {
    try {
      const url = petId 
        ? `/api/appointments?petId=${petId}`
        : '/api/appointments';
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        return data.appointments || data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      return [];
    }
  };

  // Function to fetch prescription data
  const fetchPrescriptionData = async (petId?: string) => {
    try {
      const url = petId 
        ? `/api/ai-results?petId=${petId}&type=prescription`
        : '/api/ai-results/debug?type=prescription';
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        // Handle both response formats
        if (data.results) {
          return data.results;
        } else if (data.allResults) {
          return data.allResults;
        } else if (Array.isArray(data)) {
          return data;
        }
        return [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching prescription data:', error);
      return [];
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get the active AI model
      const activeModel = await aiConfigManager.getActiveModel();
      
      // Detect if query is about database data
      const queryInfo = detectDataQuery(currentInput);
      let contextData = '';
      
      if (queryInfo.type === 'pet') {
        // Fetch pet data
        let petData = null;
        if (queryInfo.petName) {
          // Try to find the pet by name
          petData = await fetchPetData(queryInfo.petName);
          
          // If not found, try searching without the name to show available pets
          if (!petData || (Array.isArray(petData) && petData.length === 0)) {
            // Try alternative search - maybe the name format is different
            const nameParts = queryInfo.petName.split(' ');
            if (nameParts.length > 1) {
              // Try searching with just first name
              petData = await fetchPetData(nameParts[0]);
            }
            // If still not found, get all pets to show available options
            if (!petData || (Array.isArray(petData) && petData.length === 0)) {
              petData = await fetchPetData(); // Get all pets
            }
          }
        } else {
          // No specific pet name, get all pets
          petData = await fetchPetData();
        }
        
        if (petData) {
          if (Array.isArray(petData)) {
            contextData = `\n\nAvailable Pets (${petData.length} total):\n${petData.slice(0, 10).map((p: any) => 
              `- ${p.name} (ID: ${p.petId}, Species: ${p.species || 'N/A'}, Breed: ${p.breed || 'N/A'}, Owner: ${p.ownerName || 'N/A'})`
            ).join('\n')}`;
          } else {
            // Single pet - fetch full medical details
            const appointments = await fetchAppointmentData(petData._id);
            
            // Fetch AI results for this pet (treatment plans, risk assessments, etc.)
            let aiResults: any[] = [];
            try {
              const aiResponse = await fetch(`/api/ai-results?petId=${petData._id}`);
              if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                aiResults = aiData.results || [];
              }
            } catch (error) {
              console.error('Error fetching AI results:', error);
            }
            
            // Build comprehensive medical information
            const medicalHistory = Array.isArray(petData.medicalHistory) 
              ? petData.medicalHistory.join(', ') 
              : (petData.medicalHistory || 'None recorded');
            
            const medications = Array.isArray(petData.currentMedications)
              ? petData.currentMedications.join(', ')
              : (petData.currentMedications || 'None');
            
            const allergies = Array.isArray(petData.allergies)
              ? petData.allergies.join(', ')
              : (petData.allergies || 'None');
            
            const vaccinations = Array.isArray(petData.vaccinations)
              ? petData.vaccinations.map((v: any) => `${v.name} (${new Date(v.date).toLocaleDateString()})`).join(', ')
              : 'None recorded';
            
            // Format AI results summary
            const aiResultsSummary = aiResults.length > 0
              ? `\n\nAI Analysis Results (${aiResults.length}):\n${aiResults.slice(0, 5).map((result: any) => 
                  `- ${result.type}: ${result.title} (${new Date(result.createdAt).toLocaleDateString()})`
                ).join('\n')}`
              : '';
            
            contextData = `\n\nCOMPREHENSIVE PET MEDICAL INFORMATION:\n\nBasic Information:\n- Pet Name: ${petData.name}\n- Pet ID: ${petData.petId}\n- Species: ${petData.species || 'N/A'}\n- Breed: ${petData.breed || 'N/A'}\n- Gender: ${petData.gender || 'N/A'}\n- Age: ${petData.age || 'N/A'}\n- Date of Birth: ${petData.dateOfBirth ? new Date(petData.dateOfBirth).toLocaleDateString() : 'N/A'}\n- Weight: ${petData.weight ? `${petData.weight} ${petData.weightUnit || 'kg'}` : 'N/A'}\n- Color: ${petData.color || 'N/A'}\n- Microchip: ${petData.microchipNumber || 'Not registered'}\n- Spayed/Neutered: ${petData.spayedNeutered ? 'Yes' : 'No'}\n\nOwner Information:\n- Owner Name: ${petData.ownerName || 'N/A'}\n- Owner Email: ${petData.ownerEmail || 'N/A'}\n- Owner Phone: ${petData.ownerPhone || 'N/A'}\n- Owner Address: ${petData.ownerAddress || 'Not provided'}\n\nMedical History:\n- Medical History: ${medicalHistory}\n- Current Medications: ${medications}\n- Allergies: ${allergies}\n- Vaccinations: ${vaccinations}\n\nAppointments (${appointments.length} total):\n${appointments.slice(0, 10).map((apt: any) => 
              `- Date: ${new Date(apt.appointmentDate).toLocaleDateString()}, Time: ${apt.appointmentTime || 'N/A'}, Type: ${apt.appointmentType || 'N/A'}, Status: ${apt.status || 'N/A'}, Diagnosis: ${apt.diagnosis || 'No diagnosis'}, Notes: ${apt.notes || 'None'}`
            ).join('\n')}${aiResultsSummary}`;
          }
        }
      } else if (queryInfo.type === 'appointment') {
        // Fetch appointment data
        const appointments = await fetchAppointmentData();
        if (appointments.length > 0) {
          contextData = `\n\nAppointments (${appointments.length} total):\n${appointments.slice(0, 10).map((apt: any) => 
            `- Pet: ${apt.petName || 'Unknown'}, Owner: ${apt.ownerName || 'Unknown'}, Date: ${new Date(apt.appointmentDate).toLocaleDateString()}, Time: ${apt.appointmentTime || 'N/A'}, Type: ${apt.appointmentType || 'N/A'}, Status: ${apt.status || 'N/A'}`
          ).join('\n')}`;
        }
      } else if (queryInfo.type === 'prescription') {
        // Fetch prescription data
        let prescriptions: any[] = [];
        if (queryInfo.petName) {
          // First find the pet
          const petData = await fetchPetData(queryInfo.petName);
          if (petData && !Array.isArray(petData)) {
            // Fetch prescriptions for this specific pet
            prescriptions = await fetchPrescriptionData(petData._id);
          } else if (Array.isArray(petData) && petData.length > 0) {
            // Try with first matching pet
            prescriptions = await fetchPrescriptionData(petData[0]._id);
          }
        } else {
          // Fetch all prescriptions
          prescriptions = await fetchPrescriptionData();
        }
        
        if (prescriptions.length > 0) {
          // Sort by date (newest first)
          prescriptions.sort((a: any, b: any) => 
            new Date(b.createdAt || b.createdAt).getTime() - new Date(a.createdAt || a.createdAt).getTime()
          );
          
          const latestPrescription = prescriptions[0];
          const petName = queryInfo.petName || 'the pet';
          
          contextData = `\n\nPRESCRIPTION INFORMATION:\n\nLatest Prescription for ${petName}:\n- Title: ${latestPrescription.title || 'Prescription'}\n- Date: ${new Date(latestPrescription.createdAt).toLocaleDateString()}\n- Prescription Details:\n${latestPrescription.content || 'No details available'}\n\n${prescriptions.length > 1 ? `\nTotal Prescriptions: ${prescriptions.length}\nRecent Prescriptions:\n${prescriptions.slice(0, 5).map((presc: any, idx: number) => 
            `${idx + 1}. ${presc.title || 'Prescription'} - ${new Date(presc.createdAt).toLocaleDateString()}`
          ).join('\n')}` : ''}`;
        } else {
          contextData = `\n\nNo prescriptions found${queryInfo.petName ? ` for ${queryInfo.petName}` : ''} in the database.`;
        }
      }
      
      // Build enhanced prompt with context
      const enhancedPrompt = `${t('ai.assistant.aiPrompt')} "${currentInput}". ${t('ai.assistant.aiPromptInstruction')}${contextData ? `\n\nUse the following information from the database to answer the question:${contextData}` : ''}\n\nPlease provide a helpful and accurate response based on the available information.`;
      
      // Call the real AI service
      const result = await aiService.generateText({
        prompt: enhancedPrompt,
        modelId: activeModel?.id || '1',
        maxTokens: 800,
        temperature: 0.7
      });

      if (result.success && result.content) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: result.content,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback response if AI service fails
        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: t('ai.assistant.fallbackResponse'),
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackResponse]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Error response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: t('ai.assistant.errorResponse'),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };



  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Show loading state if translations aren't loaded yet
  if (!translationsLoaded) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('ai.assistant.loadingTranslations')}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={t('ai.assistant.title')} 
        description={t('ai.assistant.description')}
      >
        {/* AI Assistant Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('ai.assistant.headerTitle')}</h2>
              <p className="text-blue-100">{t('ai.assistant.headerDescription')}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm">{t('ai.assistant.symptomAnalysis')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-green-300" />
              <span className="text-sm">{t('ai.assistant.treatmentSuggestions')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-300" />
              <span className="text-sm">{t('ai.assistant.medicalResearch')}</span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{t('ai.assistant.chatTitle')}</h3>
                  <p className="text-sm text-gray-500">{t('ai.assistant.chatStatus')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">{t('ai.assistant.active')}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {message.sender === 'ai' ? (
                        <div className="space-y-2">
                          <div className="text-sm leading-relaxed">
                            {message.content.split('\n').map((line, idx) => {
                              const trimmed = line.trim();
                              
                              // Format headers
                              if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
                                const headerText = trimmed.replace(/\*\*/g, '');
                                return (
                                  <h4 key={idx} className="font-semibold text-gray-900 mt-3 mb-2 text-base first:mt-0">
                                    {headerText}
                                  </h4>
                                );
                              }
                              
                              // Format bullet points
                              if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                                const bulletText = trimmed.replace(/^[-•]\s+/, '');
                                return (
                                  <div key={idx} className="flex items-start space-x-2 ml-2 my-1">
                                    <span className="text-blue-600 mt-1.5">•</span>
                                    <span className="flex-1">{bulletText}</span>
                                  </div>
                                );
                              }
                              
                              // Format numbered lists
                              if (/^\d+\.\s/.test(trimmed)) {
                                return (
                                  <div key={idx} className="flex items-start space-x-2 ml-2 my-1">
                                    <span className="text-blue-600 font-medium mt-0.5">{trimmed.match(/^\d+\./)?.[0]}</span>
                                    <span className="flex-1">{trimmed.replace(/^\d+\.\s+/, '')}</span>
                                  </div>
                                );
                              }
                              
                              // Regular paragraph
                              if (trimmed) {
                                return (
                                  <p key={idx} className="my-1.5 leading-relaxed">
                                    {trimmed}
                                  </p>
                                );
                              }
                              
                              return <br key={idx} />;
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className={`text-xs mt-2 opacity-70 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white border border-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-bl-sm shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">{t('ai.assistant.aiThinking')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t('ai.assistant.placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{t('ai.assistant.send')}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setInputMessage(t('ai.assistant.symptomCheckExample'))}
            className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">{t('ai.assistant.symptomCheck')}</h4>
            <p className="text-sm text-gray-500">{t('ai.assistant.symptomCheckDesc')}</p>
          </button>
          
          <button
            onClick={() => setInputMessage(t('ai.assistant.treatmentInfoExample'))}
            className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-left"
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <Brain className="h-4 w-4 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">{t('ai.assistant.treatmentInfo')}</h4>
            <p className="text-sm text-gray-500">{t('ai.assistant.treatmentInfoDesc')}</p>
          </button>
          
          <button
            onClick={() => setInputMessage(t('ai.assistant.lifestyleTipsExample'))}
            className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">{t('ai.assistant.lifestyleTips')}</h4>
            <p className="text-sm text-gray-500">{t('ai.assistant.lifestyleTipsDesc')}</p>
          </button>
          
          <button
            onClick={() => setInputMessage(t('ai.assistant.medicationInfoExample'))}
            className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-left"
          >
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
              <Bot className="h-4 w-4 text-orange-600" />
            </div>
            <h4 className="font-medium text-gray-900">{t('ai.assistant.medicationInfo')}</h4>
            <p className="text-sm text-gray-500">{t('ai.assistant.medicationInfoDesc')}</p>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-white font-bold">!</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">{t('ai.assistant.disclaimerTitle')}</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {t('ai.assistant.disclaimerText')}
              </p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
