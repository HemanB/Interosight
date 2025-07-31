import React, { useState } from 'react';

interface ModuleScreenProps {
  moduleId: string;
  setCurrentScreen?: (screen: { screen: string; moduleId?: string }) => void;
}

// Module content based on PRD
const moduleContent = {
  introduction: {
    title: 'Introduction',
    description: 'Setting the stage for recovery',
    submodules: [
      {
        id: 'welcome',
        title: 'Welcome to Your Recovery Journey',
        prompt: 'Take a moment to reflect on what brought you to this point. What does recovery mean to you right now?',
        requiredWords: 50
      },
      {
        id: 'goals',
        title: 'Your Recovery Goals',
        prompt: 'What are your hopes and goals for your recovery journey? What would you like to achieve?',
        requiredWords: 75
      },
      {
        id: 'support',
        title: 'Your Support System',
        prompt: 'Who are the people in your life who support your recovery? How do they help you?',
        requiredWords: 60
      },
      {
        id: 'commitment',
        title: 'Your Commitment',
        prompt: 'What are you willing to commit to in your recovery? What small steps can you take today?',
        requiredWords: 50
      }
    ]
  }
};

const ModuleScreen: React.FC<ModuleScreenProps> = ({ moduleId, setCurrentScreen }) => {
  const [currentSubmodule, setCurrentSubmodule] = useState(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [completedSubmodules, setCompletedSubmodules] = useState<Set<number>>(new Set());

  const module = moduleContent[moduleId as keyof typeof moduleContent];
  const currentSubmoduleData = module?.submodules[currentSubmodule];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJournalEntry(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const handleSave = () => {
    if (wordCount >= (currentSubmoduleData?.requiredWords || 0)) {
      setCompletedSubmodules(prev => new Set([...prev, currentSubmodule]));
      setJournalEntry('');
      setWordCount(0);
      
      if (currentSubmodule < (module?.submodules.length || 0) - 1) {
        setCurrentSubmodule(currentSubmodule + 1);
      } else {
        // Module completed
        alert('Congratulations! You have completed this module.');
        if (setCurrentScreen) {
          setCurrentScreen({ screen: 'home' });
        }
      }
    } else {
      alert(`Please write at least ${currentSubmoduleData?.requiredWords} words to continue.`);
    }
  };

  const handleBack = () => {
    if (setCurrentScreen) {
      setCurrentScreen({ screen: 'home' });
    }
  };

  const handlePrevious = () => {
    if (currentSubmodule > 0) {
      setCurrentSubmodule(currentSubmodule - 1);
      setJournalEntry('');
      setWordCount(0);
    }
  };

  const handleNext = () => {
    if (currentSubmodule < (module?.submodules.length || 0) - 1) {
      setCurrentSubmodule(currentSubmodule + 1);
      setJournalEntry('');
      setWordCount(0);
    }
  };

  if (!module) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Module Not Found</h1>
          <p className="text-gray-600 mb-4">The requested module could not be found.</p>
          <button onClick={handleBack} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = (completedSubmodules.size / (module.submodules.length)) * 100;
  const isCurrentSubmoduleCompleted = completedSubmodules.has(currentSubmodule);
  const canContinue = wordCount >= (currentSubmoduleData?.requiredWords || 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="text-primary-600 hover:text-primary-800 mb-4 flex items-center"
        >
          ← Back to Home
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{module.title}</h1>
        <p className="text-gray-600 mb-4">{module.description}</p>
        
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completedSubmodules.size} of {module.submodules.length} completed
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Submodule Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto">
          {module.submodules.map((submodule, index) => (
            <button
              key={submodule.id}
              onClick={() => {
                setCurrentSubmodule(index);
                setJournalEntry('');
                setWordCount(0);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                index === currentSubmodule
                  ? 'bg-primary-600 text-white'
                  : completedSubmodules.has(index)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {completedSubmodules.has(index) ? '✓ ' : ''}{submodule.title}
            </button>
          ))}
        </div>
      </div>

      {/* Current Submodule */}
      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {currentSubmoduleData?.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {currentSubmoduleData?.prompt}
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <textarea
              value={journalEntry}
              onChange={handleTextChange}
              placeholder="Take your time to reflect and write your thoughts..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {wordCount} / {currentSubmoduleData?.requiredWords} words required
              {wordCount >= (currentSubmoduleData?.requiredWords || 0) && (
                <span className="text-green-600 ml-2">✓</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentSubmodule === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={handleSave}
            disabled={!canContinue}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentSubmodule === module.submodules.length - 1 ? 'Complete Module' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleScreen; 