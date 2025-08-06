import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  createFreeformEntry, 
  getFreeformEntries, 
  generateFreeformReprompt,
  trackDiscardedFreeformPrompt,
  type FreeformEntry 
} from '../services/freeformService';

interface FreeformJournalScreenProps {
  setCurrentScreen?: (screen: { screen: string; moduleId?: string }) => void;
}

const FreeformJournalScreen: React.FC<FreeformJournalScreenProps> = ({ setCurrentScreen }) => {
  const { user } = useAuth();
  const [journalEntry, setJournalEntry] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [entries, setEntries] = useState<FreeformEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canReprompt, setCanReprompt] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Generate a new session ID for each visit to freeform journaling
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      // Don't load previous entries - start fresh each time
      setEntries([]);
    }
  }, [user]);

  useEffect(() => {
    // Enable reprompt if there's a saved response without a follow-up
    const lastEntry = entries[entries.length - 1];
    setCanReprompt(
      entries.length > 0 && 
      lastEntry && 
      !lastEntry.isAIPrompt &&
      !isLoading
    );
  }, [entries, isLoading]);

  const loadEntries = async () => {
    if (!user) return;
    try {
      const userEntries = await getFreeformEntries(user.uid);
      setEntries(userEntries);
    } catch (err) {
      console.error('Error loading entries:', err);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJournalEntry(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const handleSave = async () => {
    if (!user || wordCount === 0) return;

    setIsLoading(true);
    try {
      // Save user response
      const lastEntry = entries[entries.length - 1];
      const parentEntryId = lastEntry?.id || undefined;
      
      await createFreeformEntry(
        user.uid,
        journalEntry,
        false, // not an AI prompt
        parentEntryId,
        sessionId
      );

      // Clear the response field but keep it in entries
      setJournalEntry('');
      setWordCount(0);
      await loadEntries();
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprompt = async () => {
    if (!user || entries.length === 0) return;

    setIsLoading(true);
    try {
      // Get the conversation history
      const lastEntry = entries[entries.length - 1];
      const lastAIPrompt = entries.filter(e => e.isAIPrompt).pop();
      
      // If there's already an AI prompt, this is a shuffle
      if (lastAIPrompt) {
        // Track the discarded prompt
        await trackDiscardedFreeformPrompt(
          user.uid,
          lastAIPrompt.content,
          {
            userResponse: lastEntry.content,
            reason: 'shuffle',
            chainPosition: entries.length,
            parentEntryId: lastEntry.id,
            sessionId
          }
        );
        
        // Delete the old AI prompt
        // Note: In a real implementation, you'd want to soft delete or mark as discarded
        // For now, we'll just generate a new one and let the old one remain in the chain
      }

      // Generate follow-up using the entire conversation context
      const followUp = await generateFreeformReprompt(
        user.uid,
        lastEntry.content,
        entries
      );

      // Save the AI reprompt
      await createFreeformEntry(
        user.uid,
        followUp,
        true, // is an AI prompt
        lastEntry.id || undefined,
        sessionId
      );

      await loadEntries();
    } catch (error) {
      console.error('Error generating reprompt:', error);
      // Track discarded prompt if generation fails
      if (error instanceof Error && entries.length > 0) {
        await trackDiscardedFreeformPrompt(
          user.uid,
          error.message,
          {
            userResponse: entries[entries.length - 1].content,
            reason: 'timeout',
            chainPosition: entries.length,
            parentEntryId: entries[entries.length - 1].id,
            sessionId
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (setCurrentScreen) {
      setCurrentScreen({ screen: 'home' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="text-primary-600 hover:text-primary-800 mb-4 flex items-center"
        >
          ← Back to Home
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Freeform Journaling</h1>
        <p className="text-gray-600">Write freely about anything on your mind</p>
      </div>

      {/* Conversation Thread */}
      {entries.length > 0 && (
        <div className="mb-6 space-y-4">
          {entries.map((entry, index) => (
            <div 
              key={entry.id}
              className={`p-4 rounded-lg ${
                entry.isAIPrompt
                  ? 'bg-primary-50 border-l-4 border-primary-300' 
                  : 'bg-gray-50 border-l-4 border-primary-500'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {entry.isAIPrompt ? 'Reprompt' : 'Your Entry'}
              </div>
              <p>{entry.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Thoughts
          </label>
          <textarea
            value={journalEntry}
            onChange={handleTextChange}
            placeholder="Write whatever comes to mind... There are no rules here. Just let your thoughts flow naturally."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {wordCount} words
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={wordCount === 0 || isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={handleReprompt}
              disabled={!canReprompt || isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reprompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeformJournalScreen; 