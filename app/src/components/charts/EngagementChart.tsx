import React, { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { GroupedHistoryEntries } from '../../services/historyService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EngagementChartProps {
  historyData: GroupedHistoryEntries[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
}

const EngagementChart: React.FC<EngagementChartProps> = ({ historyData }) => {
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

    const element = document.getElementById('engagement-chart');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Memoized computation of chart data
  const computedChartData = useMemo(() => {
    if (!isVisible || historyData.length === 0) return null;

    // Create a map of dates to aggregate data
    const dateMap = new Map<string, { wordCount: number; entryCount: number; activities: string[] }>();
    
    // Process all entries and group by date
    historyData.forEach(group => {
      const date = group.date;
      const existing = dateMap.get(date) || { wordCount: 0, entryCount: 0, activities: [] };
      
      group.entries.forEach(entry => {
        existing.wordCount += entry.metadata.wordCount || 0;
        existing.entryCount += 1;
        existing.activities.push(entry.type);
      });
      
      dateMap.set(date, existing);
    });

    // Sort dates and create cumulative data
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    let cumulativeWordCount = 0;
    let cumulativeEntries = 0;
    
    const labels: string[] = [];
    const wordCountData: number[] = [];
    const entryCountData: number[] = [];
    const activityData: number[] = [];

    sortedDates.forEach(date => {
      const data = dateMap.get(date)!;
      cumulativeWordCount += data.wordCount;
      cumulativeEntries += data.entryCount;
      
      labels.push(date);
      wordCountData.push(cumulativeWordCount);
      entryCountData.push(cumulativeEntries);
      activityData.push(data.activities.length);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Cumulative Word Count',
          data: wordCountData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Total Entries',
          data: entryCountData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: false,
          tension: 0.4,
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
            if (label === 'Cumulative Word Count') {
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
          maxTicksLimit: 8,
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
      <div id="engagement-chart" className="h-64 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-600">Loading engagement data...</p>
        </div>
      </div>
    );
  }

  if (!chartData || historyData.length === 0) {
    return (
      <div id="engagement-chart" className="h-64 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-600">No engagement data yet</p>
          <p className="text-sm text-gray-500 mt-2">Start journaling and logging to see your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div id="engagement-chart" className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default EngagementChart; 