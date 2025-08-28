import React, { useState } from 'react';
import { FocusPoint } from '../types';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';

export type ChartPeriod = 'daily' | 'monthly';

interface FocusChartProps {
  data: FocusPoint[];
  period?: ChartPeriod;
  onPeriodChange?: (period: ChartPeriod) => void;
}

export const FocusChart: React.FC<FocusChartProps> = ({ 
  data, 
  period = 'daily', 
  onPeriodChange 
}) => {
  // データの検証とフィルタリング
  const validData = data.filter(point => 
    point && 
    typeof point.score === 'number' && 
    !isNaN(point.score) && 
    isFinite(point.score) &&
    point.score >= 0 &&
    point.score <= 100
  );

  // データが空または無効な場合はデフォルトデータを使用
  const chartData = validData.length > 0 ? validData : [
    { time: '今日', score: 75 },
    { time: '昨日', score: 80 },
    { time: '2日前', score: 70 },
    { time: '3日前', score: 85 },
    { time: '4日前', score: 65 },
    { time: '5日前', score: 90 },
    { time: '6日前', score: 78 }
  ];

  const maxScore = Math.max(...chartData.map(d => d.score));
  const minScore = Math.min(...chartData.map(d => d.score));
  
  const getPointColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getPeriodLabel = (period: ChartPeriod) => {
    switch (period) {
      case 'daily': return '日別';
      case 'monthly': return '月別';
    }
  };

  const getPeriodIcon = (period: ChartPeriod) => {
    switch (period) {
      case 'daily': return Calendar;
      case 'monthly': return BarChart3;
    }
  };

  return (
    <div className="space-y-4">
      {/* 期間選択ボタン */}
      {onPeriodChange && (
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">集中度の推移</h3>
          <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm">
            {(['daily', 'monthly'] as ChartPeriod[]).map((p) => {
              const Icon = getPeriodIcon(p);
              return (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    period === p
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {getPeriodLabel(p)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* グラフエリア */}
      <div className="h-64 relative">
      <svg className="w-full h-full">
        {/* グリッドライン */}
        {[20, 40, 60, 80].map((value) => (
          <g key={value}>
            <line
              x1="0"
              y1={`${100 - value}%`}
              x2="100%"
              y2={`${100 - value}%`}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="2,2"
            />
            <text
              x="10"
              y={`${100 - value}%`}
              dy="-5"
              fill="rgba(255,255,255,0.5)"
              fontSize="12"
            >
              {value}%
            </text>
          </g>
        ))}
        
        {/* バーグラフ */}
        {chartData.map((point, index) => {
          const barWidth = 100 / chartData.length * 0.8; // バーの幅（80%）
          const barSpacing = 100 / chartData.length * 0.2; // バー間のスペース（20%）
          const barX = (index / chartData.length) * 100 + barSpacing / 2;
          const barHeight = point.score;
          const barY = 100 - barHeight;
          
          return (
            <g key={index}>
              {/* バーの背景 */}
              <rect
                x={`${barX}%`}
                y="0%"
                width={`${barWidth}%`}
                height="100%"
                fill="rgba(255,255,255,0.05)"
                rx="2"
              />
              {/* メインバー */}
              <rect
                x={`${barX}%`}
                y={`${barY}%`}
                width={`${barWidth}%`}
                height={`${barHeight}%`}
                fill={getPointColor(point.score)}
                rx="2"
                className="drop-shadow-lg transition-all duration-300"
                style={{
                  filter: `drop-shadow(0 0 8px ${getPointColor(point.score)})`,
                }}
              />
              {/* バー内に集中度を表示 */}
              <text
                x={`${barX + barWidth / 2}%`}
                y={`${barY + barHeight / 2}%`}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                className="drop-shadow-lg"
              >
                {Math.round(point.score)}%
              </text>
              {/* バー枠外の上に作業時間を表示 */}
              {point.focusHours !== undefined && (
                <text
                  x={`${barX + barWidth / 2}%`}
                  y={`${barY - 5}%`}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.9)"
                  fontSize="9"
                  fontWeight="500"
                  className="drop-shadow-lg"
                >
                  {point.focusHours.toFixed(1)}h
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* X軸ラベル */}
      <div className="flex justify-between mt-2 px-2">
        {chartData.map((point, index) => (
          <span key={index} className="text-gray-400 text-xs text-center">
            {point.time}
          </span>
        ))}
      </div>
      </div>
    </div>
  );
};