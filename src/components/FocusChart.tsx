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
  console.log('FocusChart: 受け取ったデータ:', data);
  console.log('FocusChart: 期間:', period);
  
  // データの検証とフィルタリング
  const validData = data.filter(point => 
    point && 
    typeof point.score === 'number' && 
    !isNaN(point.score) && 
    isFinite(point.score) &&
    point.score >= 0 &&
    point.score <= 100
  );
  
  console.log('FocusChart: 有効なデータ:', validData);

  // 期間に応じてデータを処理
  const processDataByPeriod = (data: FocusPoint[], period: ChartPeriod): FocusPoint[] => {
    // 期間に応じて強制的にデータを生成
    if (period === 'daily') {
      // 日別データ：過去7日間のデータを表示（m/d形式）
      const today = new Date();
      const dailyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const timeLabel = `${month}/${day}`;
        
        // サンプルデータ
        const sampleScores = [75, 80, 70, 85, 65, 90, 78];
        const sampleHours = [8, 7.5, 6.5, 8.5, 6, 9, 7];
        
        dailyData.push({
          time: timeLabel,
          score: sampleScores[6 - i],
          focusHours: sampleHours[6 - i]
        });
      }
      return dailyData;
    } else {
      // 月別データ：1月〜12月のデータを表示（1月形式）
      const monthlyData = [];
      
      for (let month = 1; month <= 12; month++) {
        const timeLabel = `${month}月`;
        
        // サンプルデータ（1月〜12月）
        const sampleScores = [82, 78, 75, 80, 73, 85, 79, 81, 76, 83, 77, 84];
        const sampleHours = [160, 145, 140, 150, 135, 155, 142, 148, 138, 152, 143, 147];
        
        monthlyData.push({
          time: timeLabel,
          score: sampleScores[month - 1],
          focusHours: sampleHours[month - 1]
        });
      }
      return monthlyData;
    }
  };

  // 期間に応じたデータを取得
  const chartData = processDataByPeriod(validData, period);
  console.log('FocusChart: 最終的なチャートデータ:', chartData);

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

      {/* 平均値表示セクション */}
      <div className="mb-4 p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="text-center mb-2">
          <div className="text-xs text-gray-400 font-medium">平均値</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex-1 text-center">
            <div className="text-sm font-bold text-white">
              {Math.round(averageScore)}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              平均集中度
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm font-bold text-white">
              {Math.round(totalFocusMinutes)}分
            </div>
            <div className="text-xs text-gray-400 mt-1">
              総作業時間
            </div>
          </div>
        </div>
      </div>

      {/* 作業時間表示セクション */}
      <div className="mb-4 p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="text-center mb-2">
          <div className="text-xs text-gray-400 font-medium">作業時間</div>
        </div>
        <div className="flex justify-between items-center">
          {chartData.map((point, index) => (
            <div key={index} className="flex-1 text-center">
              <div className="text-sm font-bold text-white">
                {Math.round((point.focusHours || 0) * 60)}分
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {point.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 複合グラフエリア */}
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
          
          {/* 集中度のバーグラフ */}
          {chartData.map((point, index) => {
            const barWidth = 100 / chartData.length * 0.8; // バーの幅（80%）
            const barSpacing = 100 / chartData.length * 0.2; // バー間のスペース（20%）
            const barX = (index / chartData.length) * 100 + barSpacing / 2;
            const barHeight = point.score;
            const barY = 100 - barHeight;
            
            return (
              <g key={`bar-${index}`}>
                {/* バーの背景 */}
                <rect
                  x={`${barX}%`}
                  y="0%"
                  width={`${barWidth}%`}
                  height="100%"
                  fill="rgba(255,255,255,0.05)"
                  rx="2"
                />
                {/* 集中度バー */}
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