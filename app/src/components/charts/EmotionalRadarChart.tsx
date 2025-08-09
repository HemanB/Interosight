import React, { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import type { GroupedHistoryEntries } from '../../services/historyService';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface EmotionalRadarChartProps {
  historyData: GroupedHistoryEntries[];
}

interface RadarData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    pointBackgroundColor: string;
  }[];
}

const EmotionalRadarChart: React.FC<EmotionalRadarChartProps> = ({ historyData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [radarData, setRadarData] = useState<RadarData | null>(null);

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

    const element = document.getElementById('emotional-radar-chart');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Memoized computation of radar data
  const computedRadarData = useMemo(() => {
    if (!isVisible || historyData.length === 0) return null;

    // Define emotion categories for radar chart
    const emotionCategories = {
      'Joy': ['happy', 'joy', 'excited', 'grateful', 'content', 'peaceful', 'proud', 'satisfied'],
      'Anxiety': ['anxious', 'nervous', 'worried', 'stressed', 'overwhelmed', 'panic'],
      'Sadness': ['sad', 'lonely', 'empty', 'hopeless', 'depressed', 'melancholy'],
      'Anger': ['angry', 'frustrated', 'irritated', 'rage', 'annoyed'],
      'Fear': ['fear', 'scared', 'terrified', 'afraid'],
      'Guilt': ['guilt', 'shame', 'regret', 'disappointed'],
      'Calm': ['calm', 'relaxed', 'serene', 'tranquil'],
      'Confusion': ['confused', 'uncertain', 'lost', 'overwhelmed']
    };

    const categoryScores = {
      week1: {} as { [key: string]: number },
      week2: {} as { [key: string]: number }
    };

    // Initialize category scores
    Object.keys(emotionCategories).forEach(category => {
      categoryScores.week1[category] = 0;
      categoryScores.week2[category] = 0;
    });

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Process each history group to categorize emotions by week
    historyData.forEach(group => {
      const groupDate = new Date(group.date);

      // Process each entry in the group
      group.entries.forEach(entry => {
        // Categorize emotions for radar chart (week-based)
        const isCurrentWeek = groupDate >= oneWeekAgo;
        const targetWeek = isCurrentWeek ? categoryScores.week1 : categoryScores.week2;

        const allEmotions = [
          ...(entry.metadata.emotions || []),
          ...(entry.metadata.emotionPre || []),
          ...(entry.metadata.emotionPost || [])
        ];

        // Count emotions by category
        allEmotions.forEach(emotion => {
          const emotionLower = emotion.toLowerCase();
          Object.entries(emotionCategories).forEach(([category, keywords]) => {
            if (keywords.some(keyword => emotionLower.includes(keyword))) {
              targetWeek[category] = (targetWeek[category] || 0) + 1;
            }
          });
        });
      });
    });

    // Build radar chart data
    const radar: RadarData = {
      labels: Object.keys(emotionCategories),
      datasets: [
        {
          label: 'This Week',
          data: Object.keys(emotionCategories).map(category => categoryScores.week1[category] || 0),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(34, 197, 94)',
        },
        {
          label: 'Last Week',
          data: Object.keys(emotionCategories).map(category => categoryScores.week2[category] || 0),
          borderColor: 'rgb(156, 163, 175)',
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(156, 163, 175)',
        }
      ]
    };

    return radar;
  }, [historyData, isVisible]);

  // Update radar data when computed data changes
  useEffect(() => {
    setRadarData(computedRadarData);
  }, [computedRadarData]);

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 10,
          boxWidth: 12,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.r} occurrences`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
  };

  if (!isVisible) {
    return <div id="emotional-radar-chart" className="h-64 flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!radarData) {
    return (
      <div id="emotional-radar-chart" className="h-64 flex items-center justify-center text-gray-500">
        No emotional data available
      </div>
    );
  }

  return (
    <div id="emotional-radar-chart" className="h-64">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Emotion Categories</h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xs">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalRadarChart; 