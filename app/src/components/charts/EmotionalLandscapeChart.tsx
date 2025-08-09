import React from 'react';
import type { GroupedHistoryEntries } from '../../services/historyService';
import EmotionalHeatmapChart from './EmotionalHeatmapChart';
import EmotionalRadarChart from './EmotionalRadarChart';

interface EmotionalLandscapeChartProps {
  historyData: GroupedHistoryEntries[];
}

const EmotionalLandscapeChart: React.FC<EmotionalLandscapeChartProps> = ({ historyData }) => {
  return (
    <div id="emotional-landscape-chart" className="h-64">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <EmotionalHeatmapChart historyData={historyData} />
        <EmotionalRadarChart historyData={historyData} />
      </div>
    </div>
  );
};

export default EmotionalLandscapeChart; 