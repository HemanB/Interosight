import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllUserHistory, type GroupedHistoryEntries, type HistoryEntry } from '../services/historyService';

const HistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [historyData, setHistoryData] = useState<GroupedHistoryEntries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, selectedTimeframe]);

  const loadHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAllUserHistory(user.uid);
      
      // Debug: Log summary information
      data.forEach(group => {
        group.entries.forEach(entry => {
          console.log(`Entry ${entry.id} (${entry.type}):`, {
            hasSummary: !!entry.llmSummary,
            summaryLength: entry.llmSummary?.length || 0,
            contentLength: entry.content.length
          });
        });
      });
      
      // Filter by timeframe
      const filteredData = filterByTimeframe(data, selectedTimeframe);
      setHistoryData(filteredData);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterByTimeframe = (data: GroupedHistoryEntries[], timeframe: string): GroupedHistoryEntries[] => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeframe) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return data.map(group => ({
      ...group,
      entries: group.entries.filter(entry => entry.createdAt >= cutoffDate)
    })).filter(group => group.entries.length > 0);
  };

  const handleEntryClick = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const getEntryIcon = (type: string) => {
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

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'freeform':
        return 'bg-green-900 text-green-100 border-green-700';
      case 'module':
        return 'bg-amber-900 text-amber-100 border-amber-700';
      case 'meal':
        return 'bg-blue-900 text-blue-100 border-blue-700';
      case 'behavior':
        return 'bg-red-900 text-red-100 border-red-700';
      default:
        return 'bg-gray-800 text-gray-100 border-gray-700';
    }
  };

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'freeform':
        return 'Freeform Journal';
      case 'module':
        return 'Module Entry';
      case 'meal':
        return 'Meal Log';
      case 'behavior':
        return 'Behavior Log';
      default:
        return 'Entry';
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

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading your history...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">{error}</h2>
          <button onClick={loadHistory} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalEntries = historyData.reduce((sum, group) => sum + group.entries.length, 0);

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
              <p className="text-sm text-gray-500 mt-2">
                {totalEntries > 0 
                  ? `${totalEntries} entries in the last ${selectedTimeframe === '7d' ? '7 days' : selectedTimeframe === '30d' ? '30 days' : '90 days'}`
                  : 'No data yet. Start journaling and logging to see your progress!'
                }
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Timeline</h2>
          <div className="h-64 bg-gradient-to-br from-olive-50 to-accent-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">⏰</div>
              <p className="text-gray-600">30-Day Interaction Timeline</p>
              <p className="text-sm text-gray-500 mt-2">
                {historyData.length > 0 
                  ? `${historyData.length} days with activity`
                  : 'No activity yet. Your timeline will appear here.'
                }
              </p>
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
              <p className="text-sm text-gray-500 mt-2">
                {totalEntries > 0 
                  ? 'Sentiment analysis will be available after you complete more entries.'
                  : 'Sentiment analysis will be available after you complete the base modules.'
                }
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-olive-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">LLM Insights</h3>
              <p className="text-sm text-gray-600">
                {totalEntries > 0 
                  ? 'Complete some activities to see insights here.'
                  : 'No insights yet. Complete some activities to see insights here.'
                }
              </p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Pattern Recognition</h3>
              <p className="text-sm text-gray-600">
                {totalEntries > 0 
                  ? 'Patterns will appear as you log more data.'
                  : 'No patterns detected yet. Patterns will appear as you log more data.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
        
        {historyData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg mb-2">No recent activity</p>
            <p className="text-sm">Start journaling, logging meals, or completing modules to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {historyData.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
                  {group.date}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getEntryColor(entry.type)}`}
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getEntryIcon(entry.type)}</span>
                          <span className="text-xs font-medium opacity-75">
                            {getEntryTypeLabel(entry.type)}
                          </span>
                        </div>
                        <span className="text-xs opacity-75">{entry.title}</span>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-sm mb-1">{entry.description}</h4>
                        <p className="text-xs opacity-90 leading-relaxed">
                          {entry.llmSummary ? (
                            <>
                              <span className="text-blue-600 font-medium">AI Summary: </span>
                              {entry.llmSummary}
                            </>
                          ) : (
                            <>
                              <span className="text-gray-500 font-medium">Preview: </span>
                              {entry.content.length > 100 ? entry.content.substring(0, 100) + '...' : entry.content}
                            </>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs opacity-75">
                        <span>{entry.metadata.wordCount} words</span>
                        {entry.metadata.emotions && entry.metadata.emotions.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <span>😊</span>
                            <span>{entry.metadata.emotions.slice(0, 2).join(', ')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Entry Modal */}
      {isModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getEntryIcon(selectedEntry.type)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {getEntryTypeLabel(selectedEntry.type)}
                    </h2>
                    <p className="text-sm text-gray-500">{formatFullDate(selectedEntry.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedEntry.description}</p>
                </div>

                {/* Conversation Thread for Journal Entries */}
                {(selectedEntry.type === 'freeform' || selectedEntry.type === 'module') && selectedEntry.metadata.conversationThread && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Conversation</h3>
                    <div className="space-y-3">
                      {selectedEntry.metadata.conversationThread.map((message, index) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.type === 'ai_prompt' 
                              ? 'bg-blue-50 border-l-4 border-blue-300' 
                              : 'bg-gray-50 border-l-4 border-green-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${
                              message.type === 'ai_prompt' ? 'text-blue-700' : 'text-green-700'
                            }`}>
                              {message.type === 'ai_prompt' ? 'AI Assistant' : 'You'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatFullDate(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pre/Post Information for Meal Logs */}
                {selectedEntry.type === 'meal' && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Meal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-3">Before Eating</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-red-700">Hunger Level:</span>
                            <span className="font-medium">{selectedEntry.metadata.satietyPre}/10</span>
                          </div>
                          <div>
                            <span className="text-red-700">Emotions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedEntry.metadata.emotionPre?.map((emotion, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                >
                                  {emotion}
                                </span>
                              )) || <span className="text-gray-500">None</span>}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-700">General Affect:</span>
                            <span className="font-medium">{selectedEntry.metadata.affectPre}/10</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-3">After Eating</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Satiety Level:</span>
                            <span className="font-medium">{selectedEntry.metadata.satietyPost}/10</span>
                          </div>
                          <div>
                            <span className="text-green-700">Emotions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedEntry.metadata.emotionPost?.map((emotion, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                >
                                  {emotion}
                                </span>
                              )) || <span className="text-gray-500">None</span>}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">General Affect:</span>
                            <span className="font-medium">{selectedEntry.metadata.affectPost}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre/Post Information for Behavior Logs */}
                {selectedEntry.type === 'behavior' && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Behavior Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-3">Before the Behavior</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-red-700">Emotions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedEntry.metadata.emotionPre?.map((emotion, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                >
                                  {emotion}
                                </span>
                              )) || <span className="text-gray-500">None</span>}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-700">General Affect:</span>
                            <span className="font-medium">{selectedEntry.metadata.affectPre}/10</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-3">After the Behavior</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-green-700">Emotions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedEntry.metadata.emotionPost?.map((emotion, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                >
                                  {emotion}
                                </span>
                              )) || <span className="text-gray-500">None</span>}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">General Affect:</span>
                            <span className="font-medium">{selectedEntry.metadata.affectPost}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content for non-journal entries */}
                {(selectedEntry.type === 'meal' || selectedEntry.type === 'behavior') && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedEntry.content}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Word Count:</span>
                        <span className="font-medium">{selectedEntry.metadata.wordCount}</span>
                      </div>
                      {selectedEntry.metadata.moduleId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Module:</span>
                          <span className="font-medium">{selectedEntry.metadata.moduleId}</span>
                        </div>
                      )}
                      {selectedEntry.metadata.mealType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Meal Type:</span>
                          <span className="font-medium">{selectedEntry.metadata.mealType}</span>
                        </div>
                      )}
                      {selectedEntry.metadata.location && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedEntry.metadata.location}</span>
                        </div>
                      )}
                      {selectedEntry.metadata.socialContext && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Social Context:</span>
                          <span className="font-medium">{selectedEntry.metadata.socialContext}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedEntry.llmSummary && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">AI Summary</h3>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-blue-800 italic text-sm">{selectedEntry.llmSummary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryScreen; 