import React, { useEffect, useState } from 'react';
import { User, Crown, Trash2 } from 'lucide-react';
import { TeamMember } from '../types';

interface MemberCardProps {
  member: TeamMember;
  onClick: () => void;
  onGoalUpdate?: (memberId: string, newGoal: string) => void;
  isAdmin?: boolean;
  onDeleteMember?: (memberId: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  onClick, 
  onGoalUpdate,
  isAdmin = false,
  onDeleteMember
}) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteMember && window.confirm(`${member.name}を削除しますか？`)) {
      onDeleteMember(member.id);
    }
  };

  // 集中度に基づくネオンカラーの計算
  const getNeonStyle = (focusScore: number, workStatus?: string) => {
    // 作業状態に基づいてネオンカラーを決定
    if (workStatus === 'break') {
      return {
        borderColor: 'rgba(250, 204, 21, 0.6)',
        boxShadow: '0 0 20px rgba(250, 204, 21, 0.6)',
        hoverBoxShadow: '0 0 30px rgba(250, 204, 21, 0.8)',
        textColor: 'text-yellow-400'
      };
    } else if (workStatus === 'finished') {
      return {
        borderColor: 'rgba(156, 163, 175, 0.6)',
        boxShadow: '0 0 20px rgba(156, 163, 175, 0.6)',
        hoverBoxShadow: '0 0 30px rgba(156, 163, 175, 0.8)',
        textColor: 'text-gray-400'
      };
    }
    
    // 集中度に基づいてネオンカラーを決定
    if (focusScore >= 80) {
      return {
        borderColor: 'rgba(34, 211, 238, 0.6)',
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)',
        hoverBoxShadow: '0 0 30px rgba(34, 211, 238, 0.8)',
        textColor: 'text-cyan-400'
      };
    } else if (focusScore >= 60) {
      return {
        borderColor: 'rgba(74, 222, 128, 0.6)',
        boxShadow: '0 0 20px rgba(74, 222, 128, 0.6)',
        hoverBoxShadow: '0 0 30px rgba(74, 222, 128, 0.8)',
        textColor: 'text-green-400'
      };
    } else if (focusScore >= 40) {
      return {
        borderColor: 'rgba(250, 204, 21, 0.6)',
        boxShadow: '0 0 20px rgba(250, 204, 21, 0.6)',
        hoverBoxShadow: '0 0 30px rgba(250, 204, 21, 0.8)',
        textColor: 'text-yellow-400'
      };
    } else if (focusScore >= 20) {
      return {
        borderColor: 'rgba(250, 204, 21, 0.6)',
        boxShadow: '0 0 20px rgba(250, 204, 21, 0.6)',
        hoverBoxShadow: '0 0 30px rgba(250, 204, 21, 0.8)',
        textColor: 'text-yellow-400'
      };
    } else {
      return {
        borderColor: 'rgba(156, 163, 175, 0.6)',
        boxShadow: '0 0 20px rgba(156, 163, 175, 0.6)',
        hoverBoxShadow: '0 0 30px rgba(156, 163, 175, 0.8)',
        textColor: 'text-gray-400'
      };
    }
  };

  const neonStyle = getNeonStyle(member.focusScore, member.workStatus);
  const [animatedScore, setAnimatedScore] = useState(0);

  // アニメーション効果
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(member.focusScore);
    }, 100);
    return () => clearTimeout(timer);
  }, [member.focusScore]);

  // 休憩時と終了時のオーバーレイ表示
  const isPaused = member.workStatus === 'break';
  const isFinished = member.workStatus === 'finished';

  return (
    <div 
      className="backdrop-blur-lg bg-white/10 rounded-xl border p-6 cursor-pointer hover:bg-white/15 transition-all duration-300 relative group"
      onClick={onClick}
      style={{
        borderColor: neonStyle.borderColor,
        boxShadow: neonStyle.boxShadow,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = neonStyle.hoverBoxShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = neonStyle.boxShadow;
      }}
    >
      {/* 休憩時のポーズオーバーレイ */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-yellow-500/90 rounded-full p-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      {/* 管理者削除ボタン */}
      {isAdmin && member.id !== 'current-user' && onDeleteMember && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 p-1 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-200"
          title="メンバーを削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
            {member.avatar && member.avatar !== '/avatars/current-user.jpg' && !member.avatar.startsWith('data:') ? (
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" onError={(e) => { /* ... */ }} />
            ) : member.avatar && member.avatar.startsWith('data:') ? (
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" onError={(e) => { /* ... */ }} />
            ) : null}
            <User className={`w-6 h-6 text-gray-300 ${member.avatar && member.avatar !== '/avatars/current-user.jpg' ? 'hidden' : ''}`} />
          </div>
          {/* 管理者王冠アイコン */}
          {member.isAdmin && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">{member.name}</h3>
            {member.isAdmin && (
              <Crown className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <p className="text-gray-300 text-sm">{member.currentActivity}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center relative">
            {/* 円グラフ */}
            <div className="relative w-16 h-16 mx-auto mb-2 transition-all duration-500">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                {/* 背景円 */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="2"
                />
                {/* 進捗円 */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={neonStyle.borderColor}
                  strokeWidth="2"
                  strokeDasharray={`${(animatedScore / 100) * 100.53} 100.53`}
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 8px ${neonStyle.borderColor})`,
                    transition: 'stroke-dasharray 0.8s ease-in-out',
                  }}
                />
              </svg>
              {/* 中央の数値 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`text-lg font-bold ${neonStyle.textColor} transition-all duration-800`}>
                  {isFinished ? Math.round(member.focusHistory.reduce((a, b) => a + b.score, 0) / Math.max(member.focusHistory.length, 1)) : animatedScore}
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-xs">
              {isFinished ? '平均集中度' : '集中度'}
            </p>
          </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{Math.round(member.dailyStats.totalHours * 60)}分</p>
          <p className="text-gray-400 text-xs">
            {isFinished ? '本日の作業時間' : '作業時間'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">今日の目標</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            member.workStatus === 'working' ? 'bg-green-500/20 text-green-400' :
            member.workStatus === 'break' ? 'bg-yellow-500/20 text-yellow-400' :
            member.workStatus === 'finished' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {member.workStatus === 'working' ? '作業中' :
             member.workStatus === 'break' ? '休憩中' :
             member.workStatus === 'finished' ? '終了' :
             '未開始'}
          </span>
        </div>
        <p className="text-white text-sm line-clamp-2">{member.todayGoal || '目標が設定されていません'}</p>
      </div>

      {/* 管理者のみ表示される削除ボタン */}
      {isAdmin && member.id !== 'current-user' && onDeleteMember && (
        <div className="mt-4 pt-3 border-t border-gray-600/30">
          <button
            onClick={handleDeleteClick}
            className="w-full px-3 py-2 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-200 text-sm opacity-60 hover:opacity-100"
            title="メンバーを削除"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            削除
          </button>
        </div>
      )}
    </div>
  );
};