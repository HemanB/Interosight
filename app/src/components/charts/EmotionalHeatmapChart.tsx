import React, { useMemo, useState, useEffect } from 'react';
import type { GroupedHistoryEntries } from '../../services/historyService';

interface EmotionalHeatmapChartProps {
  historyData: GroupedHistoryEntries[];
}

interface HeatmapData {
  date: string;
  intensity: number;
  emotions: string[];
  avgAffect: number;
}

const EmotionalHeatmapChart: React.FC<EmotionalHeatmapChartProps> = ({ historyData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);

  // Lazy loading - only compute when component becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('emotional-heatmap-chart');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Memoized computation of heatmap data
  const computedHeatmapData = useMemo(() => {
    if (!isVisible || historyData.length === 0) return [];

    // Process data for heatmap - aggregate daily affect scores
    const dailyData = new Map<string, {
      emotions: string[];
      affects: number[];
      totalEntries: number;
    }>();

    // Process each history group to build daily aggregations
    historyData.forEach(group => {
      // Convert group.date to actual Date object
      let groupDate: Date;
      if (group.date === 'Today') {
        groupDate = new Date();
      } else if (group.date === 'Yesterday') {
        groupDate = new Date();
        groupDate.setDate(groupDate.getDate() - 1);
      } else {
        // Parse the full date string
        groupDate = new Date(group.date);
      }

      // Create a consistent date key format for matching
      const dateKey = groupDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const existing = dailyData.get(dateKey) || {
        emotions: [],
        affects: [],
        totalEntries: 0
      };

      // Process each entry in the group
      group.entries.forEach(entry => {
        existing.totalEntries++;

        // Collect emotions from metadata
        if (entry.metadata.emotions) {
          existing.emotions.push(...entry.metadata.emotions);
        }
        if (entry.metadata.emotionPre) {
          existing.emotions.push(...entry.metadata.emotionPre);
        }
        if (entry.metadata.emotionPost) {
          existing.emotions.push(...entry.metadata.emotionPost);
        }

        // Collect affect scores (prefer post over pre, fallback to general affect)
        let affectScore = null;
        if (entry.metadata.affectPost !== undefined) {
          affectScore = entry.metadata.affectPost;
        } else if (entry.metadata.affectPre !== undefined) {
          affectScore = entry.metadata.affectPre;
        } else if (entry.metadata.affect !== undefined) {
          affectScore = entry.metadata.affect;
        }

        if (affectScore !== null) {
          existing.affects.push(affectScore);
        }
      });

      dailyData.set(dateKey, existing);
    });

    // Convert daily data to heatmap format
    const heatmap: HeatmapData[] = Array.from(dailyData.entries()).map(([dateKey, data]) => {
      const avgAffect = data.affects.length > 0 
        ? data.affects.reduce((sum, affect) => sum + affect, 0) / data.affects.length 
        : 5; // Default neutral if no affect data

      return {
        date: dateKey,
        intensity: data.totalEntries,
        emotions: data.emotions,
        avgAffect: avgAffect
      };
    });

    return heatmap;
  }, [historyData, isVisible]);

  // Update heatmap data when computed data changes
  useEffect(() => {
    setHeatmapData(computedHeatmapData);
  }, [computedHeatmapData]);

  const renderHeatmapCalendar = () => {
    const today = new Date(2025, 7, 8); // Friday, August 8th, 2025 (month is 0-indexed)
    const fiveMonthsAgo = new Date(today.getTime() - 150 * 24 * 60 * 60 * 1000); // ~5 months
    
    // Get the Sunday of the week containing fiveMonthsAgo
    const startSunday = new Date(fiveMonthsAgo);
    startSunday.setDate(fiveMonthsAgo.getDate() - fiveMonthsAgo.getDay());
    
    // Calculate number of weeks to show (usually ~22 weeks)
    const weeks = Math.ceil((today.getTime() - startSunday.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Build the calendar grid
    const calendar: Array<Array<{
      date: Date;
      data: HeatmapData | null;
      isInRange: boolean;
    }>> = [];

    // Generate month labels with better alignment
    const monthLabels: Array<{ month: string; week: number }> = [];
    let currentMonth = -1;

    for (let week = 0; week < weeks; week++) {
      const weekDays = [];
      const weekStart = new Date(startSunday.getTime() + week * 7 * 24 * 60 * 60 * 1000);
      
      // Check if this week contains the first day of a new month
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart.getTime() + day * 24 * 60 * 60 * 1000);
        if (date.getMonth() !== currentMonth && date.getDate() === 1) {
          currentMonth = date.getMonth();
          monthLabels.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            week: week
          });
          break;
        }
      }

      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart.getTime() + day * 24 * 60 * 60 * 1000);
        const isInRange = date >= fiveMonthsAgo && date <= today;
        
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const dayData = heatmapData.find(d => d.date === dateStr) || null;
        
        weekDays.push({
          date,
          data: dayData,
          isInRange
        });
      }
      calendar.push(weekDays);
    }

    const getIntensityClass = (data: HeatmapData | null, isInRange: boolean) => {
      if (!isInRange) return 'bg-gray-50 border-gray-100';
      if (!data || data.intensity === 0) return 'bg-gray-100 border-gray-200';
      
      // Simple gray to olive gradient based on average daily affect
      const normalizedAffect = Math.max(0, Math.min(1, data.avgAffect / 10)); // Clamp to 0-1
      
      // Gray to green scale based on affect level (using valid Tailwind colors)
      if (normalizedAffect >= 0.9) return 'bg-green-600 border-green-700';
      if (normalizedAffect >= 0.8) return 'bg-green-500 border-green-600';
      if (normalizedAffect >= 0.7) return 'bg-green-400 border-green-500';
      if (normalizedAffect >= 0.6) return 'bg-green-300 border-green-400';
      if (normalizedAffect >= 0.5) return 'bg-green-200 border-green-300';
      if (normalizedAffect >= 0.4) return 'bg-gray-300 border-gray-400';
      if (normalizedAffect >= 0.3) return 'bg-gray-200 border-gray-300';
      if (normalizedAffect >= 0.2) return 'bg-gray-100 border-gray-200';
      return 'bg-gray-50 border-gray-100';
    };

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-3">
        {/* Month labels */}
        <div className="relative">
          <div className="flex" style={{ marginLeft: '24px' }}>
            {monthLabels.map((label, index) => (
              <div
                key={index}
                className="text-xs text-gray-600 font-medium"
                style={{
                  position: 'absolute',
                  left: `${label.week * 12}px`, // Better spacing for alignment
                  top: 0
                }}
              >
                {label.month}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col space-y-1 mr-2">
            <div className="h-3"></div> {/* Spacer for month labels */}
            {dayLabels.map((day, index) => (
              <div
                key={day}
                className={`text-xs text-gray-600 h-2.5 flex items-center ${
                  index % 2 === 1 ? '' : 'opacity-0'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heat map grid */}
          <div className="flex space-x-1">
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                <div className="h-3"></div> {/* Spacer for month labels */}
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-2.5 h-2.5 rounded-sm border cursor-pointer transition-colors hover:border-gray-400 ${getIntensityClass(day.data, day.isInRange)}`}
                    title={
                      day.isInRange && day.data
                        ? `${day.data.intensity} entries on ${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, Avg affect: ${day.data.avgAffect.toFixed(1)}${day.data.emotions.length > 0 ? `, Emotions: ${day.data.emotions.slice(0, 3).join(', ')}${day.data.emotions.length > 3 ? '...' : ''}` : ''}`
                        : day.isInRange
                        ? `No entries on ${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
          <span>Low</span>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-gray-50 border border-gray-100 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-gray-200 border border-gray-300 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-green-200 border border-green-300 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-green-400 border border-green-500 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-green-600 border border-green-700 rounded-sm"></div>
          </div>
          <span>High</span>
        </div>
      </div>
    );
  };

  if (!isVisible) {
    return <div id="emotional-heatmap-chart" className="h-64 flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (heatmapData.length === 0) {
    return (
      <div id="emotional-heatmap-chart" className="h-64 flex items-center justify-center text-gray-500">
        No emotional data available
      </div>
    );
  }

  return (
    <div id="emotional-heatmap-chart" className="h-64">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Emotional Activity (Past 5 Months)</h3>
        <div className="flex-1 flex items-start justify-start overflow-x-auto">
          <div className="min-w-max">
            {renderHeatmapCalendar()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalHeatmapChart; 