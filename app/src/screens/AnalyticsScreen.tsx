import React, { useState } from 'react';
import { BarChart3, TrendingUp, Activity, Utensils, BookOpen } from 'lucide-react';

const AnalyticsScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & History</h1>
          <p className="text-gray-600 mt-1">Track your progress and patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="input-field w-32"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Utensils className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Meals Logged</p>
              <p className="text-2xl font-bold text-gray-900">28</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Behaviors Tracked</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Journal Entries</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mood Trend</p>
              <p className="text-2xl font-bold text-gray-900">+20%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Meal Consistency</h3>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-12">{day}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.random() * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {Math.floor(Math.random() * 3) + 1}/3
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI-Generated Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Meal Timing Pattern</h4>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  medium
                </span>
              </div>
              <p className="text-sm text-gray-600">
                You tend to skip lunch on Thursdays. Consider setting a reminder.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Improved Mood</h4>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  positive
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Your overall mood has improved by 20% this week compared to last week.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent History</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Utensils className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Breakfast</h4>
                <div className="text-sm text-gray-500">Today at 08:30</div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Oatmeal with berries and nuts</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex space-x-2">
                  <span className="px-2 py-1 text-xs bg-white rounded-full text-gray-600">
                    satisfied
                  </span>
                  <span className="px-2 py-1 text-xs bg-white rounded-full text-gray-600">
                    calm
                  </span>
                </div>
                <span className="text-xs text-gray-500">Home</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen; 