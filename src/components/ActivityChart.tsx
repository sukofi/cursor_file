import React from 'react';
import { ActivityData } from '../types';

interface ActivityChartProps {
  data: ActivityData[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.timeSpent, 0);

  return (
    <div className="space-y-4">
      {/* 円グラフ */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            {data.reduce((acc, item, index) => {
              const percentage = (item.timeSpent / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = acc.currentAngle;
              const endAngle = startAngle + angle;
              
              const x1 = 96 + 80 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 96 + 80 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 96 + 80 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 96 + 80 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                'M', 96, 96,
                'L', x1, y1,
                'A', 80, 80, 0, largeArcFlag, 1, x2, y2,
                'Z'
              ].join(' ');
              
              acc.paths.push(
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  className="hover:opacity-80 transition-opacity"
                />
              );
              
              acc.currentAngle = endAngle;
              return acc;
            }, { paths: [] as React.ReactNode[], currentAngle: 0 }).paths}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{total}h</div>
              <div className="text-gray-400 text-sm">総時間</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 凡例とバー */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white font-medium">{item.category}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${item.percentage}%`
                  }}
                />
              </div>
              <span className="text-white font-semibold w-12 text-right">
                {item.timeSpent}h
              </span>
              <span className="text-gray-400 text-sm w-12 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};