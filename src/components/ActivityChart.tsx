import React from 'react';
import { ActivityData } from '../types';

interface ActivityChartProps {
  data: ActivityData[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.timeSpent, 0);
  const maxTime = Math.max(...data.map(item => item.timeSpent));

  return (
    <div className="space-y-4">
      {/* 総時間表示 */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-white">{total.toFixed(1)}h</div>
        <div className="text-gray-400 text-sm">総作業時間</div>
      </div>
      
      {/* バーグラフ */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const barHeight = (item.timeSpent / maxTime) * 100;
          
          return (
            <div key={index} className="space-y-2">
              {/* アプリ名と時間 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white font-medium text-sm">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">
                    {item.timeSpent.toFixed(1)}h
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
              
              {/* バーグラフ */}
              <div className="relative h-8 bg-gray-700/30 rounded-lg overflow-hidden">
                {/* バーの背景 */}
                <div className="absolute inset-0 bg-gray-600/20 rounded-lg"></div>
                
                {/* メインバー */}
                <div
                  className="h-full rounded-lg transition-all duration-500 relative"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${item.percentage}%`,
                    boxShadow: `0 0 10px ${item.color}40`
                  }}
                >
                  {/* バー内のグラデーション効果 */}
                  <div 
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, ${item.color}80, ${item.color})`
                    }}
                  ></div>
                  
                  {/* バー内の数値表示 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold drop-shadow-lg">
                      {item.timeSpent.toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};