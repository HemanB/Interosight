import React, { useState } from 'react';

const HistoryScreen: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const recentInteractions: any[] = [];

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'module':
        return '📚';
      case 'freeform':
        return '✍️';
      case 'meal':
        return '🍽️';
      case 'behavior':
        return '📊';
      default:
        return '📝';
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'module':
        return 'bg-primary-100 text-primary-700';
      case 'freeform':
        return 'bg-accent-100 text-accent-700';
      case 'meal':
        return 'bg-olive-100 text-olive-700';
      case 'behavior':
        return 'bg-brown-100 text-brown-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your History</h1>
            <p className="text-gray-600">Track your progress and insights over time</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedTimeframe === '7d' ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
              onClick={() => setSelectedTimeframe('7d')}
            >
              7 Days
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedTimeframe === '30d' ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
              onClick={() => setSelectedTimeframe('30d')}
            >
              30 Days
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedTimeframe === '90d' ? 'bg-primary-500 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
              onClick={() => setSelectedTimeframe('90d')}
            >
              90 Days
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Engagement Over Time</h2>
          <div className="h-64 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-600">Cumulative Word Count & Active Time</p>
              <p className="text-sm text-gray-500 mt-2">No data yet. Start journaling and logging to see your progress!</p>
            </div>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Timeline</h2>
          <div className="h-64 bg-gradient-to-br from-olive-50 to-accent-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">⏰</div>
              <p className="text-gray-600">30-Day Interaction Timeline</p>
              <p className="text-sm text-gray-500 mt-2">No activity yet. Your timeline will appear here.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Emotional Landscape</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-gradient-to-br from-accent-50 to-primary-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🧇</div>
              <p className="text-gray-600">Sentiment Analysis</p>
              <p className="text-sm text-gray-500 mt-2">Sentiment analysis will be available after you complete the base modules.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-olive-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">LLM Insights</h3>
              <p className="text-sm text-gray-600">No insights yet. Complete some activities to see insights here.</p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Pattern Recognition</h3>
              <p className="text-sm text-gray-600">No patterns detected yet. Patterns will appear as you log more data.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentInteractions.length === 0 && (
            <div className="text-center text-gray-500 py-8">No recent activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen; 