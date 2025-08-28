import React from 'react';
import { X, User, Target, Clock, TrendingUp, Activity, Trash2 } from 'lucide-react';
import { TeamMember } from '../types';
import { FocusChart, ChartPeriod } from './FocusChart';

interface DetailViewProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onGoalUpdate?: (memberId: string, newGoal: string) => void;
  onYearlyGoalUpdate?: (memberId: string, newYearlyGoal: string) => void;
  currentPeriod?: ChartPeriod;
  onPeriodChange?: (period: ChartPeriod) => void;
  isAdmin?: boolean;
  onDeleteMember?: (memberId: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ 
  member, 
  isOpen, 
  onClose,
  onGoalUpdate,
  onYearlyGoalUpdate,
  currentPeriod = 'daily',
  onPeriodChange,
  isAdmin = false,
  onDeleteMember
}) => {
  if (!isOpen) return null;

  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState(member.todayGoal || '');
  const [isEditingYearlyGoal, setIsEditingYearlyGoal] = React.useState(false);
  const [newYearlyGoal, setNewYearlyGoal] = React.useState(member.yearlyGoal || '');

  const handleGoalSave = () => {
    if (onGoalUpdate) {
      onGoalUpdate(member.id, newGoal);
    }
    setIsEditingGoal(false);
  };

  const handleGoalCancel = () => {
    setNewGoal(member.todayGoal || '');
    setIsEditingGoal(false);
  };

  const handleYearlyGoalSave = () => {
    if (onYearlyGoalUpdate) {
      onYearlyGoalUpdate(member.id, newYearlyGoal);
    }
    setIsEditingYearlyGoal(false);
  };

  const handleYearlyGoalCancel = () => {
    setNewYearlyGoal(member.yearlyGoal || '');
    setIsEditingYearlyGoal(false);
  };

  const handleDeleteClick = () => {
    if (onDeleteMember && window.confirm(`${member.name}を削除しますか？`)) {
      onDeleteMember(member.id);
      onClose();
    }
  };

  // デバッグ用：削除ボタンの表示条件をログ出力
  console.log('DetailView: 削除ボタン表示条件:', {
    isAdmin,
    memberId: member.id,
    currentUserId: localStorage.getItem('userId'),
    hasOnDeleteMember: !!onDeleteMember,
    shouldShow: isAdmin && member.id !== 'current-user' && member.id !== localStorage.getItem('userId') && !!onDeleteMember
  });

  return (
    <div className={`${isOpen ? 'block' : 'hidden'} ${member.id === 'current-user' ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' : 'w-full'}`}>
      <div className={`bg-gray-800 rounded-xl border border-white/20 ${member.id === 'current-user' ? 'max-w-2xl w-full max-h-[90vh] overflow-y-auto' : 'w-full'}`}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            {member.name}の詳細情報
          </h2>
          {member.id === 'current-user' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* プロフィール情報 */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
              {member.avatar && member.avatar !== '/avatars/current-user.jpg' ? (
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <User className={`w-10 h-10 text-gray-300 ${member.avatar && member.avatar !== '/avatars/current-user.jpg' ? 'hidden' : ''}`} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl">{member.name}</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                member.workStatus === 'working' ? 'bg-green-500/20 text-green-400' :
                member.workStatus === 'break' ? 'bg-yellow-500/20 text-yellow-400' :
                member.workStatus === 'finished' ? 'bg-gray-500/20 text-gray-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {member.workStatus === 'working' ? '作業中' :
                 member.workStatus === 'break' ? '休憩中' :
                 member.workStatus === 'finished' ? 'オフライン' :
                 'オフライン'}
              </div>
            </div>
          </div>

          {/* 集中度スコア */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 text-lg">集中度スコア</span>
              <span className="text-white font-bold text-2xl">{Math.round(member.focusScore)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${
                  member.focusScore >= 80 ? 'from-green-400 to-emerald-500' :
                  member.focusScore >= 50 ? 'from-yellow-400 to-orange-500' :
                  'from-red-400 to-pink-500'
                }`}
                style={{ width: `${Math.round(member.focusScore)}%` }}
              />
            </div>
          </div>

          {/* 今日の目標 */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 text-lg">今日の目標</span>
              </div>
              {member.id === 'current-user' && (
                <button
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {isEditingGoal ? 'キャンセル' : '編集'}
                </button>
              )}
            </div>
            {isEditingGoal ? (
              <div className="space-y-2">
                <textarea
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white resize-none"
                  rows={3}
                  placeholder="今日の目標を入力してください"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleGoalSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleGoalCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white text-lg">
                {member.todayGoal || '目標が設定されていません'}
              </p>
            )}
          </div>

          {/* 集中度グラフ */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <FocusChart 
              data={member.focusHistory} 
              period={currentPeriod}
              onPeriodChange={member.id === 'current-user' ? onPeriodChange : undefined}
            />
          </div>

          {/* 今年の目標 */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-gray-300 text-lg">今年の目標</h4>
              {member.id === 'current-user' && (
                <button
                  onClick={() => setIsEditingYearlyGoal(!isEditingYearlyGoal)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {isEditingYearlyGoal ? 'キャンセル' : '編集'}
                </button>
              )}
            </div>
            {isEditingYearlyGoal ? (
              <div className="space-y-2">
                <textarea
                  value={newYearlyGoal}
                  onChange={(e) => setNewYearlyGoal(e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white resize-none"
                  rows={3}
                  placeholder="今年の目標を入力してください"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleYearlyGoalSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleYearlyGoalCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white text-lg">
                {member.yearlyGoal || '今年の目標が設定されていません'}
              </p>
            )}
          </div>

          {/* 管理者のみ表示される削除ボタン */}
          {isAdmin && member.id !== 'current-user' && member.id !== localStorage.getItem('userId') && onDeleteMember && (
            <div className="pt-6 border-t border-gray-600/30">
              <button
                onClick={handleDeleteClick}
                className="w-full px-4 py-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-200 text-sm opacity-60 hover:opacity-100"
                title="メンバーを削除"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                メンバーを削除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};