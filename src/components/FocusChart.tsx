import React, { useState } from 'react';
import { FocusPoint } from '../types';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';

export type ChartPeriod = 'daily' | 'monthly' | 'yearly';

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
      case 'yearly': return '年別';
    }
  };

  const getPeriodIcon = (period: ChartPeriod) => {
    switch (period) {
      case 'daily': return Calendar;
      case 'monthly': return BarChart3;
      case 'yearly': return TrendingUp;
    }
  };

  return (
    <div className="space-y-4">
      {/* 期間選択ボタン */}
      {onPeriodChange && (
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">集中度の推移</h3>
          <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm">
            {(['daily', 'monthly', 'yearly'] as ChartPeriod[]).map((p) => {
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
        
        {/* データライン */}
        <polyline
          fill="none"
          stroke="rgba(59, 130, 246, 0.8)"
          strokeWidth="3"
          points={chartData.map((point, index) => 
            `${(index / (chartData.length - 1)) * 100}%,${100 - point.score}%`
          ).join(' ')}
        />
        
        {/* データポイント */}
        {chartData.map((point, index) => (
          <g key={index}>
            <circle
              cx={`${(index / (data.length - 1)) * 100}%`}
              cy={`${100 - point.score}%`}
              r="6"
              fill={getPointColor(point.score)}
              stroke="white"
              strokeWidth="2"
              className="drop-shadow-lg"
            />
            <circle
              cx={`${(index / (data.length - 1)) * 100}%`}
              cy={`${100 - point.score}%`}
              r="12"
              fill={getPointColor(point.score)}
              opacity="0.2"
              className="animate-pulse"
            />
          </g>
        ))}
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