import React, { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { GroupedHistoryEntries } from '../../services/historyService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ActivityTimelineChartProps {
  historyData: GroupedHistoryEntries[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

const ActivityTimelineChart: React.FC<ActivityTimelineChartProps> = ({ historyData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);

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

    const element = document.getElementById('activity-timeline-chart');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Memoized computation of chart data
  const computedChartData = useMemo(() => {
    if (!isVisible || historyData.length === 0) return null;

    // Create activity map by date
    const activityMap = new Map<string, { 
      totalEntries: number; 
      wordCount: number; 
      activities: { [key: string]: number } 
    }>();
    
    // Process all entries and group by date
    historyData.forEach(group => {
      const date = group.date;
      const existing = activityMap.get(date) || { 
        totalEntries: 0, 
        wordCount: 0, 
        activities: {} 
      };
      
      group.entries.forEach(entry => {
        existing.totalEntries += 1;
        existing.wordCount += entry.metadata.wordCount || 0;
        existing.activities[entry.type] = (existing.activities[entry.type] || 0) + 1;
      });
      
      activityMap.set(date, existing);
    });

    // Sort dates and create timeline data
    const sortedDates = Array.from(activityMap.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    const labels: string[] = [];
    const activityData: number[] = [];
    const wordCountData: number[] = [];

    sortedDates.forEach(date => {
      const data = activityMap.get(date)!;
      labels.push(date);
      activityData.push(data.totalEntries);
      wordCountData.push(data.wordCount);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Daily Entries',
          data: activityData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Word Count',
          data: wordCountData,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  }, [historyData, isVisible]);

  // Update chart data when computed data changes
  useEffect(() => {
    if (computedChartData) {
      setChartData(computedChartData);
    }
  }, [computedChartData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label === 'Word Count') {
              return `${label}: ${value.toLocaleString()} words`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Count',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  if (!isVisible) {
    return (
      <div id="activity-timeline-chart" className="h-64 bg-gradient-to-br from-olive-50 to-accent-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">⏰</div>
          <p className="text-gray-600">Loading activity timeline...</p>
        </div>
      </div>
    );
  }

  if (!chartData || historyData.length === 0) {
    return (
      <div id="activity-timeline-chart" className="h-64 bg-gradient-to-br from-olive-50 to-accent-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">⏰</div>
          <p className="text-gray-600">No activity timeline yet</p>
          <p className="text-sm text-gray-500 mt-2">Your timeline will appear here as you log activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="activity-timeline-chart" className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ActivityTimelineChart; 