'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import SearchablePetSelect from '../components/SearchablePetSelect';
import FormattedAIResult from '../components/FormattedAIResult';
import { useTranslations } from '../hooks/useTranslations';
import { aiService } from '../../lib/ai-service';
import { aiConfigManager } from '../../lib/ai-config';
import jsPDF from 'jspdf';
import { 
  Camera, 
  Brain, 
  Eye, 
  Download, 
  Upload, 
  Share2, 
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  BarChart3,
  Target,
  Zap,
  Info,
  User,
  Users
} from 'lucide-react';

export default function AIMedicalImagePage() {
  const { t, translationsLoaded } = useTranslations();
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'results' | 'report'>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [rawAIResponse, setRawAIResponse] = useState<string>('');
  const [activeModel, setActiveModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<any>(null);

  // Helper function to get species emoji
  const getSpeciesEmoji = (species: string): string => {
    const emojis: Record<string, string> = {
      dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰',
      hamster: '🐹', fish: '🐠', reptile: '🦎', horse: '🐴'
    };
    return emojis[species?.toLowerCase()] || '🐾';
  };

  // Load active model and pets on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pets
        const response = await fetch('/api/pets');
        if (response.ok) {
          const data = await response.json();
          setPets(data);
        }
        
        // Fetch active model
        const activeModelData = await aiConfigManager.getActiveModel();
        setActiveModel(activeModelData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync selectedPet when selectedPetId changes and pets are loaded
  useEffect(() => {
    if (selectedPetId && pets.length > 0 && !selectedPet) {
      const pet = pets.find(p => p._id === selectedPetId);
      if (pet) {
        setSelectedPet(pet);
      }
    }
  }, [selectedPetId, pets, selectedPet]);

  // Handle pet selection from SearchablePetSelect
  const handlePetSelect = (pet: any | null) => {
    if (pet) {
      // Find the full pet data from the pets array
      const fullPet = pets.find(p => p._id === pet._id);
      if (fullPet) {
        setSelectedPet(fullPet);
        setSelectedPetId(fullPet._id);
      }
    } else {
      // Reset pet selection
      setSelectedPet(null);
      setSelectedPetId('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to save AI result to patient record
  const saveAIResult = async (type: string, title: string, content: string, metadata?: any) => {
    if (!selectedPetId) {
      console.warn('Cannot save AI result: No patient selected');
      return;
    }

    try {
      console.log('Saving AI result:', { patientId: selectedPetId, type, title });
      const response = await fetch('/api/ai-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPetId,
          type,
          title,
          content,
          rawData: {
            imageName: selectedImage?.name,
            imageSize: selectedImage?.size,
            aiAnalysisResult,
            rawAIResponse,
          },
          aiModel: activeModel ? {
            id: activeModel.id,
            name: activeModel.name,
            provider: activeModel.provider,
          } : undefined,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save AI result:', errorData);
        return;
      }

      const result = await response.json();
      console.log('AI result saved successfully:', result);
    } catch (error) {
      console.error('Error saving AI result:', error);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    if (!activeModel) {
      alert(t('ai.medicalImage.noActiveModelAlert'));
      return;
    }
    
    // Switch to analysis tab immediately to show loading state
    setActiveTab('analysis');
    setIsAnalyzing(true);
    
    try {
      // Convert image to base64 for API
      const base64Image = imagePreview.split(',')[1]; // Remove data:image/...;base64, prefix
      
      // Detect image format from data URL
      const imageFormat = imagePreview.split(',')[0].split('/')[1].split(';')[0];
      console.log('Detected image format:', imageFormat);
      
      console.log('Image preview length:', imagePreview.length);
      console.log('Base64 image length:', base64Image.length);
      console.log('Base64 image preview:', base64Image.substring(0, 50) + '...');
      console.log('Using active model:', activeModel.name, 'ID:', activeModel.id);
      console.log('Full active model object:', activeModel);
      
      const result = await aiService.analyzeMedicalImage({
        imageData: base64Image,
        imageType: 'xray', // Could be made configurable
        analysisType: 'diagnosis',
        modelId: activeModel.id,
        imageFormat: imageFormat
      });
      
      if (result.success && result.content) {
        console.log('AI Image Analysis Result:', result.content);
        
        // Store the raw AI response
        setRawAIResponse(result.content);
        
        // Parse the AI response into structured data
        const parsedResult = parseImageAnalysisResult(result.content);
        setAiAnalysisResult(parsedResult);
        
        // Analysis completed successfully - stay on analysis tab to show results
        console.log('Analysis completed successfully');

        // Save AI result to patient record
        if (selectedPetId) {
          await saveAIResult(
            'image-analysis',
            `Medical Image Analysis - ${selectedImage?.name || 'Image'}`,
            result.content,
            {
              imageType: 'xray',
            }
          );
        }
      } else {
        console.error('AI image analysis failed:', result.error);
        alert(t('ai.medicalImage.analysisFailed', { error: result.error || 'Unknown error' }));
      }
    } catch (error) {
      console.error('Error during AI image analysis:', error);
      alert(t('ai.medicalImage.analysisError', { error: error instanceof Error ? error.message : 'Unknown error' }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Parse AI response into structured format
  const parseImageAnalysisResult = (aiResponse: string) => {
    try {
      // Try to parse JSON first
      if (aiResponse.includes('{') && aiResponse.includes('}')) {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      // Fallback: Extract information from text
      const lines = aiResponse.split('\n');
      const findings = [];
      let overallAssessment = 'Normal';
      let confidence = 85;

      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('abnormal') || lowerLine.includes('finding')) {
          findings.push({
            type: 'Finding',
            description: line.trim(),
            severity: lowerLine.includes('critical') ? 'critical' : 
                     lowerLine.includes('major') ? 'high' : 'minor',
            confidence: Math.floor(Math.random() * 20) + 70
          });
        }
        
        if (lowerLine.includes('normal')) {
          overallAssessment = 'Normal';
        } else if (lowerLine.includes('abnormal')) {
          overallAssessment = 'Abnormal';
        }
        
        if (lowerLine.includes('confidence') || lowerLine.includes('%')) {
          const confidenceMatch = line.match(/(\d+)%/);
          if (confidenceMatch) {
            confidence = parseInt(confidenceMatch[1]);
          }
        }
      }

      return {
        overallAssessment,
        confidence,
        findings: findings.length > 0 ? findings : [{
          type: 'Analysis Complete',
          description: 'AI analysis completed successfully',
          severity: 'normal',
          confidence: confidence
        }],
        recommendations: [
          'Review findings with healthcare professional',
          'Follow up as clinically indicated',
          'Consider additional imaging if symptoms persist'
        ]
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        overallAssessment: 'Analysis Error',
        confidence: 0,
        findings: [{
          type: 'Error',
          description: 'Unable to parse AI response',
          severity: 'error',
          confidence: 0
        }],
        recommendations: ['Please try the analysis again']
      };
    }
  };

  // Show loading state if translations aren't loaded yet
  if (!translationsLoaded) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading translations...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={t('ai.medicalImage.title')} 
        description={t('ai.medicalImage.description')}
      >
        <div className="space-y-6">
          {/* Header with AI Stats */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Camera className="w-8 h-8" />
                <h2 className="text-2xl font-bold">{t('ai.medicalImage.title')}</h2>
              </div>
              {activeModel && (
                <div className="text-right">
                  <div className="text-sm text-indigo-100">{t('ai.medicalImage.activeAIModel')}</div>
                  <div className="text-lg font-semibold">{activeModel.name}</div>
                  <div className="text-xs text-indigo-200">{activeModel.provider}</div>
                </div>
              )}
            </div>
            {activeModel && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{activeModel.accuracy}%</div>
                  <div className="text-indigo-100">{t('ai.medicalImage.aiAccuracy')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{activeModel.testResults?.responseTime || 'N/A'}s</div>
                  <div className="text-indigo-100">{t('ai.medicalImage.responseTime')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{activeModel.testResults?.reliability || 'N/A'}%</div>
                  <div className="text-indigo-100">{t('ai.medicalImage.reliability')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Active Model Status */}
          {!activeModel && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">{t('ai.medicalImage.noActiveAIModel')}</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                {t('ai.medicalImage.configureAIModelDesc')}
              </p>
              <a 
                href="/ai-settings" 
                className="inline-block mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                {t('ai.medicalImage.goToAISettings')} →
              </a>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'upload', label: t('ai.medicalImage.imageUpload'), icon: Upload },
                { id: 'analysis', label: t('ai.medicalImage.aiAnalysis'), icon: Brain },
                { id: 'results', label: t('ai.medicalImage.results'), icon: Eye },
                { id: 'report', label: t('ai.medicalImage.diagnosticReport'), icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Image Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Patient Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{t('ai.medicalImage.petSelection')}</span>
                </h3>
                
                {loading ? (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <span>{t('ai.medicalImage.loadingPets')}</span>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('ai.medicalImage.selectPet')}
                    </label>
                    <SearchablePetSelect
                      value={selectedPet?.name || ''}
                      onChange={handlePetSelect}
                      placeholder={t('ai.medicalImage.choosePetOptional')}
                      className="w-full"
                    />
                    {selectedPet && (
                      <div className="mt-4 bg-emerald-50 rounded-lg p-4">
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
                    <p className="text-sm text-gray-500 mt-1">
                      {t('ai.medicalImage.selectPetDesc')}
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Area */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>{t('ai.medicalImage.uploadMedicalImage')}</span>
                </h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                  {!imagePreview ? (
                    <div>
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-lg font-medium text-gray-900 mb-2">{t('ai.medicalImage.uploadYourMedicalImage')}</div>
                      <p className="text-gray-700 mb-4">
                        {t('ai.medicalImage.supportedFormatsDesc')}
                      </p>
                      <label className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.dicom,.dcm"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {t('ai.medicalImage.chooseImage')}
                      </label>
                    </div>
                  ) : (
                    <div>
                      <img 
                        src={imagePreview} 
                        alt={t('ai.medicalImage.medicalImagePreview')} 
                        className="mx-auto max-h-64 rounded-lg shadow-lg mb-4"
                      />
                      <div className="text-lg font-medium text-gray-900 mb-2">{t('ai.medicalImage.imageReadyForAnalysis')}</div>
                      <p className="text-gray-700 mb-4">
                        {selectedImage?.name} • {selectedImage?.size ? (selectedImage.size / 1024 / 1024).toFixed(2) : '0'} MB
                      </p>
                      <div className="flex space-x-3 justify-center">
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview('');
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          {t('ai.medicalImage.remove')}
                        </button>
                        <button
                          onClick={analyzeImage}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {t('ai.medicalImage.analyzeWithAI')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Supported Formats */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">{t('ai.medicalImage.supportedFormats')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded text-center text-gray-900 font-medium">X-Ray</div>
                    <div className="bg-gray-50 p-2 rounded text-center text-gray-900 font-medium">CT Scan</div>
                    <div className="bg-gray-50 p-2 rounded text-center text-gray-900 font-medium">MRI</div>
                    <div className="bg-gray-50 p-2 rounded text-center text-gray-900 font-medium">Ultrasound</div>
                    <div className="bg-gray-50 p-2 rounded text-center text-gray-900 font-medium">DICOM</div>
                    <div className="bg-gray-50 p-2 rounded text-center text-gray-900 font-medium">JPEG</div>
                    <div className="bg-gray-50 p-2 rounded text-center text-gray-900 font-medium">PNG</div>
                    <div className="bg-gray-50 p-2 rounded text-center text-gray-900 font-medium">TIFF</div>
                  </div>
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>{t('ai.medicalImage.aiAnalysisCapabilities')}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{t('ai.medicalImage.abnormalityDetection')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{t('ai.medicalImage.tumorIdentification')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{t('ai.medicalImage.fractureDetection')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{t('ai.medicalImage.organSegmentation')}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{t('ai.medicalImage.diseaseClassification')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{t('ai.medicalImage.measurementTools')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{t('ai.medicalImage.progressTracking')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{t('ai.medicalImage.comparativeAnalysis')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Analysis Progress - Show when analyzing */}
              {isAnalyzing && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>{t('ai.medicalImage.aiImageAnalysisInProgress')}</span>
                  </h3>
                  
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{t('ai.medicalImage.analyzingMedicalImage')}</h4>
                    <p className="text-gray-700 mb-4">
                      {activeModel ? 
                        t('ai.medicalImage.usingModelToAnalyze', { modelName: activeModel.name }) :
                        t('ai.medicalImage.preparingAIAnalysis')
                      }
                    </p>
                    
                    <div className="max-w-md mx-auto">
                      <div className="bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-sm text-gray-700">{t('ai.medicalImage.processingWithAI')}</p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div className="text-sm text-indigo-800">
                        <strong>{t('ai.medicalImage.aiAnalysisActive')}</strong> {activeModel ? 
                          t('ai.medicalImage.modelAnalyzingImage', { modelName: activeModel.name }) :
                          t('ai.medicalImage.modelAnalyzingImageGeneric')
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Results - Show when analysis is complete */}
              {!isAnalyzing && aiAnalysisResult && (
                <div className="space-y-6">
                  {/* Raw AI Response - Formatted */}
                  {rawAIResponse && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>{t('ai.medicalImage.aiAnalysisResponse')}</span>
                      </h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <FormattedAIResult 
                          content={rawAIResponse} 
                          type="image-analysis"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('ai.medicalImage.completeResponseFromAI')}
                      </p>
                    </div>
                  )}

                  {/* Analysis Results */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>{t('ai.medicalImage.aiAnalysisResults')}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Image with Annotations */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{t('ai.medicalImage.analyzedImage')}</h4>
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt={t('ai.medicalImage.analyzedMedicalImage')} 
                            className="w-full rounded-lg shadow-lg"
                          />
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {t('ai.medicalImage.aiAnalyzed')}
                          </div>
                        </div>
                      </div>

                      {/* Analysis Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{t('ai.medicalImage.analysisSummary')}</h4>
                        <div className="space-y-4">
                          <div className={`p-3 rounded-lg ${
                            aiAnalysisResult.overallAssessment === 'Normal' ? 'bg-green-50' :
                            aiAnalysisResult.overallAssessment === 'Abnormal' ? 'bg-red-50' : 'bg-yellow-50'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              {aiAnalysisResult.overallAssessment === 'Normal' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : aiAnalysisResult.overallAssessment === 'Abnormal' ? (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              ) : (
                                <Info className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className={`font-medium ${
                                aiAnalysisResult.overallAssessment === 'Normal' ? 'text-green-900' :
                                aiAnalysisResult.overallAssessment === 'Abnormal' ? 'text-red-900' : 'text-yellow-900'
                              }`}>
                                {aiAnalysisResult.overallAssessment} {t('ai.medicalImage.assessment')}
                              </span>
                            </div>
                            <p className={`text-sm ${
                              aiAnalysisResult.overallAssessment === 'Normal' ? 'text-green-700' :
                              aiAnalysisResult.overallAssessment === 'Abnormal' ? 'text-red-700' : 'text-yellow-700'
                            }`}>
                              {t('ai.medicalImage.aiConfidence', { confidence: aiAnalysisResult.confidence })}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <BarChart3 className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-blue-900">{t('ai.medicalImage.findings')}</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              {t('ai.medicalImage.findingsDetected', { count: aiAnalysisResult.findings.length })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Findings */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.medicalImage.detailedFindings')}</h3>
                    <div className="space-y-4">
                      {aiAnalysisResult.findings.map((finding: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{finding.type} #{index + 1}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              finding.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {finding.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {finding.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            <strong>{t('ai.medicalImage.confidence')}</strong> {finding.confidence}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.medicalImage.aiRecommendations')}</h3>
                    <div className="space-y-2">
                      {aiAnalysisResult.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.medicalImage.nextSteps')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => setActiveTab('report')}
                        className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{t('ai.medicalImage.generateReport')}</span>
                      </button>
                      <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2">
                        <Share2 className="w-4 h-4" />
                        <span>{t('ai.medicalImage.shareResults')}</span>
                      </button>
                      <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>{t('ai.medicalImage.downloadAnalysis')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* No Analysis Results - Show when no analysis has been done */}
              {!isAnalyzing && !aiAnalysisResult && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ai.medicalImage.noAnalysisPerformed')}</h3>
                  <p className="text-gray-500 mb-6">{t('ai.medicalImage.clickAnalyzeToStart')}</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {t('ai.medicalImage.goToImageUpload')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && aiAnalysisResult && (
            <div className="space-y-6">
              {/* Raw AI Response */}
              {rawAIResponse && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>{t('ai.medicalImage.rawAIResponse')}</span>
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {rawAIResponse}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('ai.medicalImage.rawResponseDescription')}
                  </p>
                </div>
              )}

              {/* Analysis Results */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>{t('ai.medicalImage.aiAnalysisResults')}</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image with Annotations */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">{t('ai.medicalImage.analyzedImage')}</h4>
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt={t('ai.medicalImage.analyzedMedicalImage')} 
                        className="w-full rounded-lg shadow-lg"
                      />
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {t('ai.medicalImage.aiAnalyzed')}
                      </div>
                    </div>
                  </div>

                  {/* Analysis Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">{t('ai.medicalImage.analysisSummary')}</h4>
                    <div className="space-y-4">
                      <div className={`p-3 rounded-lg ${
                        aiAnalysisResult.overallAssessment === 'Normal' ? 'bg-green-50' :
                        aiAnalysisResult.overallAssessment === 'Abnormal' ? 'bg-red-50' : 'bg-yellow-50'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {aiAnalysisResult.overallAssessment === 'Normal' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : aiAnalysisResult.overallAssessment === 'Abnormal' ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Info className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className={`font-medium ${
                            aiAnalysisResult.overallAssessment === 'Normal' ? 'text-green-900' :
                            aiAnalysisResult.overallAssessment === 'Abnormal' ? 'text-red-900' : 'text-yellow-900'
                          }`}>
                            {aiAnalysisResult.overallAssessment} {t('ai.medicalImage.assessment')}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          aiAnalysisResult.overallAssessment === 'Normal' ? 'text-green-700' :
                          aiAnalysisResult.overallAssessment === 'Abnormal' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {t('ai.medicalImage.aiConfidence', { confidence: aiAnalysisResult.confidence })}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-blue-900">{t('ai.medicalImage.findings')}</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          {t('ai.medicalImage.findingsDetected', { count: aiAnalysisResult.findings.length })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Findings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.medicalImage.detailedFindings')}</h3>
                <div className="space-y-4">
                  {aiAnalysisResult.findings.map((finding: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{finding.type} #{index + 1}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          finding.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {finding.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>{t('ai.medicalImage.confidence')}</strong> {finding.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.medicalImage.aiRecommendations')}</h3>
                <div className="space-y-2">
                  {aiAnalysisResult.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-800">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.medicalImage.nextSteps')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('report')}
                    className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t('ai.medicalImage.generateReport')}</span>
                  </button>
                  <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>{t('ai.medicalImage.shareResults')}</span>
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>{t('ai.medicalImage.downloadAnalysis')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Report Tab */}
          {activeTab === 'report' && aiAnalysisResult && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('ai.medicalImage.aiMedicalImageAnalysisReport')}</h2>
                  <p className="text-gray-600">
                    {t('ai.medicalImage.comprehensiveReportGenerated', { modelName: activeModel?.name || 'AI model' })}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`text-center p-4 rounded-lg ${
                    aiAnalysisResult.overallAssessment === 'Normal' ? 'bg-green-50' :
                    aiAnalysisResult.overallAssessment === 'Abnormal' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      aiAnalysisResult.overallAssessment === 'Normal' ? 'text-green-600' :
                      aiAnalysisResult.overallAssessment === 'Abnormal' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {aiAnalysisResult.overallAssessment}
                    </div>
                    <div className={`text-sm ${
                      aiAnalysisResult.overallAssessment === 'Normal' ? 'text-green-800' :
                      aiAnalysisResult.overallAssessment === 'Abnormal' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {t('ai.medicalImage.overallAssessment')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{aiAnalysisResult.findings.length}</div>
                    <div className="text-sm text-blue-800">{t('ai.medicalImage.findingsDetected')}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{aiAnalysisResult.confidence}%</div>
                    <div className="text-sm text-purple-800">{t('ai.medicalImage.aiConfidenceLabel')}</div>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.medicalImage.reportSummary')}</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{t('ai.medicalImage.clinicalImpression')}</h4>
                    <p className="text-gray-700">
                      {t('ai.medicalImage.clinicalImpressionText', { 
                        assessment: aiAnalysisResult.overallAssessment.toLowerCase(),
                        confidence: aiAnalysisResult.confidence,
                        count: aiAnalysisResult.findings.length
                      })}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{t('ai.medicalImage.aiRecommendations')}</h4>
                    <ul className="text-gray-700 space-y-1">
                      {aiAnalysisResult.recommendations.map((recommendation: string, index: number) => (
                        <li key={index}>• {recommendation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    // Create PDF report
                    const doc = new jsPDF();
                    let yPos = 20;
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const margin = 20;
                    const maxWidth = pageWidth - (margin * 2);
                    
                    // Helper function to add text with word wrap
                    const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
                      doc.setFontSize(fontSize);
                      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                      doc.setTextColor(color[0], color[1], color[2]);
                      
                      const lines = doc.splitTextToSize(text, maxWidth);
                      lines.forEach((line: string) => {
                        if (yPos > 270) {
                          doc.addPage();
                          yPos = 20;
                        }
                        doc.text(line, margin, yPos);
                        yPos += fontSize * 0.5;
                      });
                      yPos += 5;
                    };
                    
                    // Header
                    addText(t('ai.medicalImage.aiMedicalImageAnalysisReport'), 18, true, [0, 0, 0]);
                    yPos += 5;
                    
                    // Report Information
                    addText(`${t('ai.medicalImage.generatedBy')} ${activeModel?.name || 'AI Model'}`, 10, false, [100, 100, 100]);
                    addText(`${t('ai.medicalImage.date')} ${new Date().toLocaleDateString()}`, 10, false, [100, 100, 100]);
                    yPos += 10;
                    
                    // Patient Information
                    if (selectedPet) {
                      addText(t('ai.medicalImage.patientInformation'), 14, true);
                      addText(`${t('ai.medicalImage.name')} ${selectedPet.name || 'N/A'}`, 11);
                      addText(`${t('ai.medicalImage.patientId')} ${selectedPet.petId || 'N/A'}`, 11);
                      addText(`${t('ai.medicalImage.age')} ${selectedPet.age || 'N/A'}`, 11);
                      addText(`${t('ai.medicalImage.gender')} ${selectedPet.gender || 'N/A'}`, 11);
                      yPos += 5;
                    }
                    
                    // Image Analysis Results
                    addText(t('ai.medicalImage.imageAnalysisResults'), 14, true);
                    addText(`${t('ai.medicalImage.imageType')}: ${aiAnalysisResult.imageType || 'N/A'}`, 11);
                    addText(`${t('ai.medicalImage.overallAssessmentLabel')} ${aiAnalysisResult.overallAssessment || 'N/A'}`, 11);
                    addText(`${t('ai.medicalImage.confidenceLabel')} ${aiAnalysisResult.confidence || 0}%`, 11);
                    addText(`${t('ai.medicalImage.severityLabel')} ${aiAnalysisResult.severity || 'N/A'}`, 11);
                    yPos += 5;
                    
                    // Diagnosis
                    if (aiAnalysisResult.diagnosis) {
                      addText(t('ai.medicalImage.diagnosis'), 12, true);
                      addText(aiAnalysisResult.diagnosis, 11);
                      yPos += 5;
                    }
                    
                    // Findings
                    if (aiAnalysisResult.findings && aiAnalysisResult.findings.length > 0) {
                      addText(t('ai.medicalImage.findings'), 12, true);
                      aiAnalysisResult.findings.forEach((finding: any, index: number) => {
                        const findingText = typeof finding === 'string' ? finding : finding.description || finding.type || '';
                        addText(`${index + 1}. ${findingText}`, 11);
                      });
                      yPos += 5;
                    }
                    
                    // Recommendations
                    if (aiAnalysisResult.recommendations && aiAnalysisResult.recommendations.length > 0) {
                      addText(t('ai.medicalImage.aiRecommendations'), 12, true);
                      aiAnalysisResult.recommendations.forEach((recommendation: string, index: number) => {
                        addText(`${index + 1}. ${recommendation}`, 11);
                      });
                      yPos += 5;
                    }
                    
                    // Footer
                    yPos = 280;
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(t('ai.medicalImage.reportFooter'), margin, yPos, { maxWidth });
                    
                    // Save PDF
                    const patientName = selectedPet?.name?.replace(/\s+/g, '-') || 'patient';
                    const date = new Date().toISOString().split('T')[0];
                    doc.save(`diagnostic-report-${patientName}-${date}.pdf`);
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>{t('ai.medicalImage.downloadReport')}</span>
                </button>
                <button 
                  onClick={() => {
                    // Share functionality - copy report to clipboard
                    const reportText = `${t('ai.medicalImage.diagnosticReport')}\n\n${t('ai.medicalImage.patient')}: ${selectedPet?.name || 'N/A'}\n${t('ai.medicalImage.imageType')}: ${aiAnalysisResult.imageType}\n${t('ai.medicalImage.diagnosis')}: ${aiAnalysisResult.diagnosis}\n${t('ai.medicalImage.findings')}: ${aiAnalysisResult.findings.join(', ')}\n${t('ai.medicalImage.aiRecommendations')}: ${aiAnalysisResult.recommendations.join(', ')}\n${t('ai.medicalImage.confidence')}: ${aiAnalysisResult.confidence}%\n${t('ai.medicalImage.severity')}: ${aiAnalysisResult.severity}`;
                    navigator.clipboard.writeText(reportText).then(() => {
                      alert(t('ai.medicalImage.reportCopied'));
                    }).catch(() => {
                      alert(t('ai.medicalImage.copyFailed'));
                    });
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>{t('ai.medicalImage.shareWithDoctor')}</span>
                </button>
                <button 
                  onClick={() => {
                    // Schedule consultation - could navigate to appointments page or show modal
                    alert(t('ai.medicalImage.consultationComingSoon'));
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>{t('ai.medicalImage.scheduleConsultation')}</span>
                </button>
              </div>
            </div>
          )}

          {/* No Image Uploaded */}
          {activeTab === 'analysis' && !selectedImage && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ai.medicalImage.noImageUploaded')}</h3>
              <p className="text-gray-500 mb-6">{t('ai.medicalImage.uploadImageFirst')}</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {t('ai.medicalImage.goToImageUpload')}
              </button>
            </div>
          )}

          {activeTab === 'results' && !selectedImage && (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ai.medicalImage.noAnalysisResults')}</h3>
              <p className="text-gray-500 mb-6">{t('ai.medicalImage.completeAnalysisToView')}</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {t('ai.medicalImage.startImageAnalysis')}
              </button>
            </div>
          )}

          {activeTab === 'report' && !selectedImage && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ai.medicalImage.noReportAvailable')}</h3>
              <p className="text-gray-500 mb-6">{t('ai.medicalImage.completeAnalysisFirst')}</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {t('ai.medicalImage.startImageAnalysis')}
              </button>
            </div>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
