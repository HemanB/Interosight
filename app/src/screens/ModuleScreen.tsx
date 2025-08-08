import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generateFollowUpPrompt } from '../services/googleAIService';
import { 
  getModuleProgress, 
  createModuleEntry, 
  getSubmoduleEntries,
  completeSubmodule,
  trackDiscardedPrompt,
  getModuleContent
} from '../services/moduleService';
import type { JournalEntry, Module } from '../types';

interface ModuleScreenProps {
  moduleId: string;
  setCurrentScreen?: (screen: { screen: string; moduleId?: string }) => void;
}

const ModuleScreen: React.FC<ModuleScreenProps> = ({ moduleId, setCurrentScreen }) => {
  const { user } = useAuth();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModuleLoading, setIsModuleLoading] = useState(true);
  const [canReprompt, setCanReprompt] = useState(false);
  const [module, setModule] = useState<Module | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moduleProgress, setModuleProgress] = useState<any>(null);

  const currentPromptData = module?.submodules?.[currentPromptIndex];

  useEffect(() => {
    if (user) {
      loadModule();
    }
  }, [user, moduleId]);

  useEffect(() => {
    if (user && currentPromptData) {
      loadEntries();
    }
  }, [user, moduleId, currentPromptIndex, currentPromptData]);

  useEffect(() => {
    // Enable reprompt if there's a saved response without a follow-up
    const lastEntry = entries[entries.length - 1];
    setCanReprompt(
      entries.length > 0 && 
      lastEntry?.type === 'module_journal' &&
      !isLoading
    );
  }, [entries, isLoading]);

  const loadModule = async () => {
    if (!user) return;
    try {
      setIsModuleLoading(true);
      setError(null);
      console.log('Loading module:', moduleId);
      const moduleData = await getModuleContent(user.uid, moduleId);
      console.log('Module data:', moduleData);
      if (!moduleData) {
        console.error('Module not found:', moduleId);
        setError('Module not found');
        return;
      }
      if (!moduleData.submodules || moduleData.submodules.length === 0) {
        console.error('Module has no content:', moduleId);
        setError('Module has no content');
        return;
      }
      setModule(moduleData);
      
      // Load module progress
      const progress = await getModuleProgress(user.uid, moduleId);
      setModuleProgress(progress);
      console.log('Module progress:', progress);
      
      console.log('Module loaded successfully:', moduleId);
    } catch (err) {
      console.error('Error loading module:', err);
      setError('Failed to load module');
    } finally {
      setIsModuleLoading(false);
    }
  };

  const loadEntries = async () => {
    if (!user || !currentPromptData) return;
    try {
      const promptEntries = await getSubmoduleEntries(
        user.uid,
        moduleId,
        currentPromptData.id
      );
      setEntries(promptEntries);
    } catch (err) {
      console.error('Error loading entries:', err);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResponse(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const handleSave = async () => {
    if (!user || !currentPromptData || wordCount < (currentPromptData.wordCountRequirement?.minimum || 0)) {
      return;
    }

    setIsLoading(true);
    try {
      // Save user response
      const entryId = await createModuleEntry(
        user.uid,
        moduleId,
        currentPromptData.id,
        response,
        false, // not an AI prompt
        {
          originalPrompt: currentPromptData.prompt,
          userResponse: response,
          shuffleCount: 0,
          chainPosition: entries.length,
          parentEntryId: entries[entries.length - 1]?.id
        }
      );

      // Update module progress to mark this submodule as completed
      await completeSubmodule(user.uid, moduleId, currentPromptData.id);

      // Reload module progress to reflect the update
      const progress = await getModuleProgress(user.uid, moduleId);
      setModuleProgress(progress);

      // Clear the response field but keep it in entries
      setResponse('');
      setWordCount(0);
      await loadEntries();
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprompt = async () => {
    if (!user || !currentPromptData || entries.length === 0) return;

    setIsLoading(true);
    try {
      // Get the conversation history
      const lastEntry = entries[entries.length - 1];
      const lastAIPrompt = entries.filter(e => e.type === 'ai_prompt').pop();
      
      // If there's already an AI prompt, this is a shuffle
      if (lastAIPrompt) {
        // Track the discarded prompt
        await trackDiscardedPrompt(
          user.uid,
          moduleId,
          currentPromptData.id,
          lastAIPrompt.content,
          {
            originalPrompt: currentPromptData.prompt,
            userResponse: lastEntry.content,
            shuffleCount: entries.filter(e => e.type === 'ai_prompt').length,
            reason: 'shuffle',
            chainPosition: entries.length,
            parentEntryId: lastEntry.id,
            promptFeatures: {
              emotionalIntensity: 0.5,
              personalizationLevel: 0.7,
              questionType: 'follow_up'
            }
          }
        );
        
        // Delete the old AI prompt
        // Note: In a real implementation, you'd want to soft delete or mark as discarded
        // For now, we'll just generate a new one and let the old one remain in the chain
      }

      // Generate follow-up using the entire conversation context
      const followUp = await generateFollowUpPrompt({
        userResponse: lastEntry.content,
        originalPrompt: currentPromptData.prompt,
        previousPrompts: entries
          .filter(e => e.type === 'ai_prompt')
          .map(e => ({ content: e.content, type: e.type }))
      });

      // Save the AI reprompt
      const entryId = await createModuleEntry(
        user.uid,
        moduleId,
        currentPromptData.id,
        followUp,
        true, // is an AI prompt
        {
          originalPrompt: currentPromptData.prompt,
          userResponse: lastEntry.content,
          shuffleCount: entries.filter(e => e.type === 'ai_prompt').length,
          chainPosition: entries.length,
          parentEntryId: lastEntry.id
        }
      );

      await loadEntries();
    } catch (error) {
      console.error('Error generating reprompt:', error);
      // Track discarded prompt if generation fails
      if (error instanceof Error) {
        await trackDiscardedPrompt(
          user.uid,
          moduleId,
          currentPromptData.id,
          error.message,
          {
            originalPrompt: currentPromptData.prompt,
            userResponse: entries[entries.length - 1].content,
            shuffleCount: entries.filter(e => e.type === 'ai_prompt').length,
            reason: 'timeout',
            chainPosition: entries.length,
            parentEntryId: entries[entries.length - 1].id,
            promptFeatures: {
              emotionalIntensity: 0.5,
              personalizationLevel: 0.7,
              questionType: 'follow_up'
            }
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!module?.submodules) return;
    if (currentPromptIndex < module.submodules.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setResponse('');
      setWordCount(0);
    }
  };

  const handlePrevious = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
      setResponse('');
      setWordCount(0);
    }
  };

  // Loading state
  if (isModuleLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading module...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !module || !module.submodules) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            {error || 'Module not found'}
          </h2>
          <button 
            onClick={() => setCurrentScreen?.({ screen: 'home' })} 
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
        <button
        onClick={() => setCurrentScreen?.({ screen: 'home' })}
        className="text-primary-600 hover:text-primary-800 mb-4"
        >
          ← Back to Home
        </button>

      <h1 className="text-2xl font-bold mb-4">{module.title}</h1>
      <p className="text-gray-600 mb-6">{module.description}</p>

      {/* Module Progress */}
      {moduleProgress && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Module Progress</span>
            <span className="text-sm text-gray-500">
              {Object.keys(moduleProgress.submodules || {}).filter(
                (submoduleId) => moduleProgress.submodules[submoduleId]?.status === 'completed'
              ).length} / {module.submodules.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.keys(moduleProgress.submodules || {}).filter(
                  (submoduleId) => moduleProgress.submodules[submoduleId]?.status === 'completed'
                ).length / module.submodules.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Navigation Pills */}
      {module.submodules && module.submodules.length > 0 && (
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {module.submodules.map((prompt, index) => (
            <button
              key={prompt.id}
              onClick={() => {
                setCurrentPromptIndex(index);
                setResponse('');
                setWordCount(0);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                index === currentPromptIndex
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {prompt.title}
            </button>
          ))}
        </div>
      )}

      {currentPromptData && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">
            {currentPromptData.title}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {currentPromptData.prompt}
          </p>

          {/* Conversation Thread */}
          {entries.length > 0 && (
            <div className="mb-6 space-y-4">
              {entries.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`p-4 rounded-lg ${
                    entry.type === 'module_journal'
                      ? 'bg-gray-50 border-l-4 border-primary-500' 
                      : 'bg-primary-50 border-l-4 border-primary-300'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {entry.type === 'module_journal' ? 'Your Response' : 'Reprompt'}
                  </div>
                  <p>{entry.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Response Input */}
          <div className="mb-4">
            <textarea
              value={response}
              onChange={handleTextChange}
              placeholder="Take your time to reflect..."
              className="w-full h-40 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
            <div className="text-sm text-gray-500 mt-2">
              {wordCount} / {currentPromptData.wordCountRequirement?.minimum} words required
          </div>
        </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
              disabled={currentPromptIndex === 0}
              className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          
            <div className="flex space-x-2">
          <button
            onClick={handleSave}
                disabled={wordCount < (currentPromptData.wordCountRequirement?.minimum || 0) || isLoading}
                className="btn-primary disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={handleReprompt}
                disabled={!canReprompt || isLoading}
                className="btn-primary disabled:opacity-50"
              >
                Reprompt
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={currentPromptIndex === module.submodules.length - 1}
              className="btn-secondary disabled:opacity-50"
            >
              Next
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default ModuleScreen; 