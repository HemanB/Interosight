import React, { useState } from 'react';
import { BookOpen, Utensils, Activity } from 'lucide-react';

const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'journaling' | 'logging'>('journaling');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-1">Continue your recovery journey</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Streak</p>
            <p className="text-2xl font-bold text-primary-600">5 days</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('journaling')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'journaling'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Journaling
          </button>
          <button
            onClick={() => setActiveTab('logging')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logging'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Utensils className="w-4 h-4 inline mr-2" />
            Logging
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'journaling' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Reflective Journaling</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Prompt
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                    "What does it mean to you to be in recovery? How has your understanding evolved?"
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    className="input-field h-32 resize-none"
                    placeholder="Share your thoughts, feelings, and reflections..."
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">0 words</span>
                  <button className="btn-primary">Continue Reflection</button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Identity Reflection</h4>
                  <p className="text-sm text-gray-600 mt-1">Exploring who I am beyond...</p>
                  <p className="text-xs text-gray-500 mt-2">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Track Your Day</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Utensils className="w-5 h-5 mr-2" />
                    Meal Log
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Meal type (breakfast, lunch, etc.)"
                    />
                    <textarea
                      className="input-field h-20 resize-none"
                      placeholder="What did you eat? How did it feel?"
                    />
                    <button className="btn-secondary w-full">Log Meal</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Behavior Log
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Trigger or situation"
                    />
                    <textarea
                      className="input-field h-20 resize-none"
                      placeholder="What happened? How did you respond?"
                    />
                    <button className="btn-secondary w-full">Log Behavior</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">This Week</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">28</p>
                  <p className="text-sm text-gray-600">Meals Logged</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">8</p>
                  <p className="text-sm text-gray-600">Behaviors Tracked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen; 