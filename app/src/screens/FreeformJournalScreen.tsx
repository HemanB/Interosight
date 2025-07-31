import React, { useState } from 'react';

interface FreeformJournalScreenProps {
  setCurrentScreen?: (screen: { screen: string; moduleId?: string }) => void;
}

const FreeformJournalScreen: React.FC<FreeformJournalScreenProps> = ({ setCurrentScreen }) => {
  const [journalEntry, setJournalEntry] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJournalEntry(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const handleSave = () => {
    // TODO: Save to Firebase
    console.log('Saving journal entry:', journalEntry);
    alert('Journal entry saved! (Firebase integration pending)');
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
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {wordCount} words
          </div>
          <button
            onClick={handleSave}
            disabled={wordCount === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeformJournalScreen; 