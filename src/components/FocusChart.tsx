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
  
  // 平均集中度を計算
  const averageScore = chartData.length > 0 
    ? chartData.reduce((sum, point) => sum + point.score, 0) / chartData.length 
    : 0;
  
  // 総作業時間を計算（分単位）
  const totalFocusHours = chartData.reduce((sum, point) => sum + (point.focusHours || 0), 0);
  const totalFocusMinutes = totalFocusHours * 60;
  
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

      {/* 円グラフエリア */}
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          {/* 円グラフ */}
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              {/* 背景円 */}
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="16"
              />
              {/* 進捗円 */}
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke={getPointColor(averageScore)}
                strokeWidth="16"
                strokeDasharray={`${(averageScore / 100) * 502.65} 502.65`}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${getPointColor(averageScore)})`,
                  transition: 'stroke-dasharray 0.8s ease-in-out',
                }}
              />
            </svg>
            
            {/* 中央の数値 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-white drop-shadow-lg">
                {Math.round(averageScore)}%
              </p>
              <p className="text-gray-300 text-sm mt-1">
                {period === 'daily' ? '日別平均集中度' : '月別平均集中度'}
              </p>
            </div>
          </div>
          
          {/* 作業時間表示（円グラフの上） */}
          {totalFocusHours > 0 && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-2xl font-bold text-white drop-shadow-lg">
                {period === 'daily' ? Math.round(totalFocusMinutes) : Math.round(totalFocusHours)}
                {period === 'daily' ? '分' : '時間'}
              </p>
              <p className="text-gray-300 text-xs">
                {period === 'daily' ? '日別総作業時間' : '月別総作業時間'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};