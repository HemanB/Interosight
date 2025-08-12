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

    // Generate the past 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    const labels: string[] = [];
    const dailyWordCount: number[] = [];
    const dailyEntryCount: number[] = [];
    
    // Create data for each of the past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      labels.push(dateKey);
      
      // Find data for this date
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const group = historyData.find(g => {
        let groupDate: Date;
        if (g.date === 'Today') {
          groupDate = new Date();
        } else if (g.date === 'Yesterday') {
          groupDate = new Date();
          groupDate.setDate(groupDate.getDate() - 1);
        } else {
          groupDate = new Date(g.date);
        }
        return groupDate.toISOString().split('T')[0] === dateStr;
      });
      
      if (group) {
        const wordCount = group.entries.reduce((sum, entry) => sum + (entry.metadata.wordCount || 0), 0);
        const entryCount = group.entries.length;
        dailyWordCount.push(wordCount);
        dailyEntryCount.push(entryCount);
      } else {
        dailyWordCount.push(0);
        dailyEntryCount.push(0);
      }
    }

    // Calculate cumulative data
    let cumulativeWordCount = 0;
    let cumulativeEntries = 0;
    
    const cumulativeWordCountData: number[] = [];
    const cumulativeEntryCountData: number[] = [];

    dailyWordCount.forEach((wordCount, index) => {
      cumulativeWordCount += wordCount;
      cumulativeEntries += dailyEntryCount[index];
      cumulativeWordCountData.push(cumulativeWordCount);
      cumulativeEntryCountData.push(cumulativeEntries);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Cumulative Word Count',
          data: cumulativeWordCountData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1', // Secondary axis for word count
        },
        {
          label: 'Total Entries',
          data: cumulativeEntryCountData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y', // Primary axis for entry count
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
          text: 'Past 7 Days',
        },
        ticks: {
          maxTicksLimit: 7,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Total Entries',
          color: 'rgb(59, 130, 246)',
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: true,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Cumulative Words',
          color: 'rgb(34, 197, 94)',
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
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