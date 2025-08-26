import React, { useState } from 'react';
import { TrendingUp, Target, X, Users as TeamIcon, LogOut, Timer, Play, Coffee, Square, Settings, User } from 'lucide-react';
import { GoalSettingModal } from './GoalSettingModal';
import { SettingsModal } from './SettingsModal';
import { TeamMember } from '../types';
import { FocusChart, ChartPeriod } from './FocusChart';
import { PomodoroTimer } from './PomodoroTimer';

interface SingleModeViewProps {
  user: TeamMember;
  onGoalUpdate: (memberId: string, newGoal: string) => void;
  onModeChange: (mode: 'single' | 'team') => void;
  onLogout: () => void;
  onWorkStart?: (memberId: string) => void;
  onWorkBreak?: (memberId: string) => void;
  onWorkFinish?: (memberId: string) => void;
  workStatus?: 'working' | 'break' | 'finished';
  settings: any;
  onSettingsChange: (settings: any) => void;
  activeMode: 'single' | 'team';
  currentPeriod?: ChartPeriod;
  onPeriodChange?: (period: ChartPeriod) => void;
}

export const SingleModeView: React.FC<SingleModeViewProps> = ({ user, onGoalUpdate, onModeChange, onLogout, onWorkStart, onWorkBreak, onWorkFinish, workStatus = 'finished', settings, onSettingsChange, activeMode, currentPeriod = 'daily', onPeriodChange }) => {
  const [isPomodoroOpen, setIsPomodoroOpen] = React.useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  
  // 今年の目標の状態管理（現在のユーザーIDで保存）
  const [yearlyGoals, setYearlyGoals] = React.useState<Array<{text: string, completed: boolean}>>(() => {
    const saved = localStorage.getItem('yearly-goals-current-user');
    return saved ? JSON.parse(saved) : [
      { text: '新しい技術を習得する', completed: false },
      { text: 'プロジェクトを完成させる', completed: false },
      { text: '健康管理を改善する', completed: false }
    ];
  });
  const [newYearlyGoal, setNewYearlyGoal] = React.useState('');

  // 今年の目標の操作関数
  const handleYearlyGoalToggle = (index: number) => {
    const updatedGoals = yearlyGoals.map((goal, i) => 
      i === index ? { ...goal, completed: !goal.completed } : goal
    );
    setYearlyGoals(updatedGoals);
    localStorage.setItem('yearly-goals-current-user', JSON.stringify(updatedGoals));
  };

  const handleYearlyGoalDelete = (index: number) => {
    const updatedGoals = yearlyGoals.filter((_, i) => i !== index);
    setYearlyGoals(updatedGoals);
    localStorage.setItem('yearly-goals-current-user', JSON.stringify(updatedGoals));
  };

  const handleYearlyGoalAdd = () => {
    if (newYearlyGoal.trim()) {
      const updatedGoals = [...yearlyGoals, { text: newYearlyGoal.trim(), completed: false }];
      setYearlyGoals(updatedGoals);
      setNewYearlyGoal('');
      localStorage.setItem('yearly-goals-current-user', JSON.stringify(updatedGoals));
    }
  };

  // デバッグ用：現在のworkStatusをログ出力
  React.useEffect(() => {
    console.log('SingleModeView: 現在のworkStatus:', workStatus);
    console.log('SingleModeView: user.workStatus:', user.workStatus);
    console.log('SingleModeView: 作業開始ボタンの無効状態:', workStatus === 'working');
  }, [workStatus, user.workStatus]);



  const getFocusColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFocusGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 50) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      {/* ヘッダー */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-300">
            ようこそ、{user.name}さん
          </p>
        </div>
        
                  <div className="flex items-center gap-4">
            {/* 作業状態メニュー */}
            <div className="flex items-center gap-2">
              {/* デバッグ用テストボタン */}
              <button
                onClick={() => {
                  console.log('SingleModeView: テストボタンクリック');
                  alert('テストボタンがクリックされました');
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                テスト
              </button>
              <button
                onClick={() => {
                  console.log('SingleModeView: 作業開始ボタンクリック, 現在のworkStatus:', workStatus);
                  onWorkStart?.(user.id);
                }}
                disabled={workStatus === 'working'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border-2 border-red-500 ${
                  workStatus === 'working'
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                style={{ minWidth: '120px', minHeight: '40px' }}
              >
                <Play className="w-4 h-4" />
                作業開始
              </button>
              <button
                onClick={() => {
                  console.log('SingleModeView: 休憩ボタンクリック, 現在のworkStatus:', workStatus);
                  onWorkBreak?.(user.id);
                }}
                disabled={workStatus === 'break'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  workStatus === 'break'
                    ? 'bg-yellow-600 text-white cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                <Coffee className="w-4 h-4" />
                休憩
              </button>
              <button
                onClick={() => {
                  console.log('SingleModeView: 終了ボタンクリック, 現在のworkStatus:', workStatus);
                  onWorkFinish?.(user.id);
                }}
                disabled={workStatus === 'finished'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  workStatus === 'finished'
                    ? 'bg-red-600 text-white cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <Square className="w-4 h-4" />
                終了
              </button>
            </div>
            
            {/* 今日の目標設定ボタン */}
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-all duration-200"
              title="今日の目標設定"
            >
              <Target className="w-5 h-5" />
              今日の目標設定
            </button>
            
            {/* ポモドーロタイマーボタン */}
            <button
              onClick={() => setIsPomodoroOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-200"
              title="ポモドーロタイマー"
            >
              <Timer className="w-5 h-5" />
              タイマー
            </button>
            
            {/* 設定ボタン */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
              title="設定"
            >
              <Settings className="w-5 h-5" />
              設定
            </button>
            

            
            {/* ログアウトボタン */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              ログアウト
            </button>
          </div>
      </div>

      {/* モード切り替えバー */}
      <div className="relative z-10 mb-6">
        <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          <button
            onClick={() => onModeChange('single')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
              activeMode === 'single'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" />
            シングルモード
          </button>
          <button
            onClick={() => onModeChange('team')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
              activeMode === 'team'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <TeamIcon className="w-4 h-4" />
            チームモード
          </button>
        </div>
      </div>



      {/* 集中度推移グラフ（一番上） */}
      <div className="relative z-10 mb-8">
        <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-6">
          <FocusChart 
            data={user.focusHistory} 
            period={currentPeriod}
            onPeriodChange={onPeriodChange}
          />
        </div>
      </div>

      {/* 上段：集中度スコア、今日の目標、今年の目標 */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 集中度スコア */}
        <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              集中度スコア
            </h3>
          </div>
          <div className={`text-3xl font-bold ${getFocusColor(user.focusScore)} mb-2`}>
            {Math.round(user.focusScore)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${getFocusGradient(user.focusScore)}`}
              style={{ width: `${Math.round(user.focusScore)}%` }}
            />
          </div>
        </div>

        {/* 今日の目標 */}
        <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-yellow-400" />
            今日の目標
          </h3>
          <p className="text-yellow-300 text-lg">
            {user.todayGoal || '目標を設定してください'}
          </p>
        </div>

        {/* 今年の目標 */}
        <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              今年の目標
            </h3>
            <div className="text-sm text-gray-400">
              {yearlyGoals.filter(g => g.completed).length} / {yearlyGoals.length} 完了
            </div>
          </div>
          {/* 進捗バー */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
              style={{ 
                width: `${yearlyGoals.length > 0 ? (yearlyGoals.filter(g => g.completed).length / yearlyGoals.length) * 100 : 0}%` 
              }}
            />
          </div>
          <div className="space-y-3">
            {yearlyGoals.map((goal, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => handleYearlyGoalToggle(index)}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className={`text-gray-300 flex-1 ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                  {goal.text}
                </span>
                <button
                  onClick={() => handleYearlyGoalDelete(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newYearlyGoal}
                onChange={(e) => setNewYearlyGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleYearlyGoalAdd()}
                placeholder="新しい目標を入力..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleYearlyGoalAdd}
                disabled={!newYearlyGoal.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 下段：現在の活動、今日の統計、今週の統計 */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 現在の活動 */}
        <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-blue-400" />
            現在の活動
          </h3>
          <p className="text-gray-300 text-lg">{user.currentActivity}</p>
        </div>

        {/* 今日の統計 */}
        <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-400" />
            今日の統計
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">総作業時間</span>
              <span className="text-white font-semibold">{user.dailyStats.totalHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">集中時間</span>
              <span className="text-green-400 font-semibold">{user.dailyStats.focusHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">休憩時間</span>
              <span className="text-blue-400 font-semibold">{user.dailyStats.breakHours}h</span>
            </div>
          </div>
        </div>

        {/* 今週の統計 */}
        <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-400" />
            今週の統計
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">週間作業時間</span>
              <span className="text-white font-semibold">32h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">平均集中度</span>
              <span className="text-green-400 font-semibold">78%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">目標達成率</span>
              <span className="text-blue-400 font-semibold">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ポモドーロタイマー */}
      <PomodoroTimer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        settings={settings}
      />

      {/* 目標設定モーダル */}
      <GoalSettingModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={(goal) => {
          onGoalUpdate?.(user.id, goal);
          setIsGoalModalOpen(false);
        }}
        currentGoal={user.todayGoal || ''}
        userName={user.name}
      />

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
};
