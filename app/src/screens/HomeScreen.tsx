import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Module data structure based on PRD requirements
const modules = [
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Setting the stage for recovery',
    status: 'current' as const,
    submodules: 4,
    completedSubmodules: 0,
    type: 'base' as const
  },
  {
    id: 'identity',
    title: 'Identity',
    description: 'Who you are beyond the eating disorder',
    status: 'locked' as const,
    submodules: 4,
    completedSubmodules: 0,
    type: 'base' as const
  },
  {
    id: 'journey',
    title: 'Your Journey',
    description: 'What brought you here and past recovery attempts',
    status: 'locked' as const,
    submodules: 4,
    completedSubmodules: 0,
    type: 'base' as const
  },
  {
    id: 'daily-impact',
    title: 'Daily Impact',
    description: 'How ED affects your daily life',
    status: 'locked' as const,
    submodules: 4,
    completedSubmodules: 0,
    type: 'dynamic' as const
  },
  {
    id: 'interpersonal',
    title: 'Interpersonal Impact',
    description: 'Impact on relationships and connection',
    status: 'locked' as const,
    submodules: 4,
    completedSubmodules: 0,
    type: 'dynamic' as const
  },
  {
    id: 'emotional',
    title: 'Emotional Landscape',
    description: 'Emotional cognition and interpretation',
    status: 'locked' as const,
    submodules: 4,
    completedSubmodules: 0,
    type: 'dynamic' as const
  }
];

const getStatusIcon = (status: 'completed' | 'current' | 'locked') => {
  switch (status) {
    case 'completed':
      return '✓';
    case 'current':
      return '○';
    case 'locked':
      return '🔒';
  }
};

const getStatusColor = (status: 'completed' | 'current' | 'locked') => {
  switch (status) {
    case 'completed':
      return 'text-primary-600';
    case 'current':
      return 'text-primary-600 animate-pulse';
    case 'locked':
      return 'text-gray-400';
  }
};

interface HomeScreenProps {
  setCurrentScreen?: (screen: { screen: string; moduleId?: string }) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setCurrentScreen }) => {
  const { userProfile } = useAuth();

  // Navigation handlers for main action cards
  const handleContinueJourney = () => {
    // Find the current module and navigate to it
    const currentModule = modules.find(m => m.status === 'current');
    if (currentModule && setCurrentScreen) {
      setCurrentScreen({ screen: 'module', moduleId: currentModule.id });
    }
  };

  const handleFreeformJournaling = () => {
    if (setCurrentScreen) {
      setCurrentScreen({ screen: 'freeform-journal' });
    }
  };

  const handleLogEntry = () => {
    if (setCurrentScreen) {
      setCurrentScreen({ screen: 'log' });
    }
  };

  // Navigation handler for module cards
  const handleModuleClick = (module: typeof modules[0]) => {
    if (module.status === 'current' && setCurrentScreen) {
      setCurrentScreen({ screen: 'module', moduleId: module.id });
    }
    // For locked modules, we could show a message or unlock logic
  };

  // Calculate overall progress
  const totalModules = modules.length;
  const completedModules = 0; // Fresh account - no completed modules
  const currentModule = modules.find(m => m.status === 'current');
  const progressPercentage = ((completedModules + (currentModule ? 0.5 : 0)) / totalModules) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Interosight
            </h1>
            <p className="text-gray-600">Take one step at a time toward healing and self-understanding</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{Math.round(progressPercentage)}%</div>
            <div className="text-sm text-gray-500">Journey Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="card cursor-pointer hover:shadow-lg transition-all"
          onClick={handleContinueJourney}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-4">Begin with guided prompts and structured reflection</p>
            <button className="btn-primary w-full">
              Get Started
            </button>
          </div>
        </div>
        
        <div 
          className="card cursor-pointer hover:shadow-lg transition-all"
          onClick={handleFreeformJournaling}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Freeform Journaling</h3>
            <p className="text-gray-600 mb-4">Write freely about anything on your mind</p>
            <button className="btn-primary w-full">
              Start Writing
            </button>
          </div>
        </div>
        
        <div 
          className="card cursor-pointer hover:shadow-lg transition-all"
          onClick={handleLogEntry}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Track Your Day</h3>
            <p className="text-gray-600 mb-4">Log meals, behaviors, and emotions</p>
            <button className="btn-primary w-full">
              Log Now
            </button>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Recovery Modules</h2>
          <div className="text-sm text-gray-500">
            {completedModules} of {totalModules} completed
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div 
              key={module.id} 
              className={`card-module ${module.status} cursor-pointer hover:shadow-lg transition-all ${
                module.status === 'current' ? 'ring-2 ring-primary-200' : ''
              }`}
              onClick={() => handleModuleClick(module)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{module.title}</h3>
                    {module.type === 'dynamic' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                        Dynamic
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-olive-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(module.completedSubmodules / module.submodules) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-primary-600 font-medium">
                      {module.completedSubmodules}/{module.submodules}
                    </span>
                  </div>
                </div>
                <div className={`text-2xl ${getStatusColor(module.status)}`}>
                  {getStatusIcon(module.status)}
                </div>
              </div>
              <button 
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  module.status === 'current' 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {module.status === 'current' ? 'Start Module' : 'Locked'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen; 