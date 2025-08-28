import React, { useState, useEffect } from 'react';
import { LogOut, Activity, Clock, TrendingUp, Users, Timer, Play, Coffee, Square, Target, Settings, X, User, Monitor, Plus, Crown, Trash2 } from 'lucide-react';
import { GoalSettingModal } from './GoalSettingModal';
import { SettingsModal } from './SettingsModal';
import { DetailView } from './DetailView';
import { AddMemberModal } from './AddMemberModal';
import { TeamMember } from '../types';
import { ChartPeriod } from './FocusChart';

import { MemberCard } from './MemberCard';
import { PomodoroTimer } from './PomodoroTimer';


interface DashboardProps {
  teamMembers: TeamMember[];
  onMemberSelect: (member: TeamMember) => void;
  onGoalUpdate: (memberId: string, newGoal: string) => void;
  onYearlyGoalUpdate: (memberId: string, newYearlyGoal: string) => void;
  isAdmin: boolean;
  onDeleteMember: (memberId: string) => void;
  trackedUser: TeamMember;
  onWorkStart?: () => void;
  onWorkBreak?: () => void;
  onWorkFinish?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  teamMembers,
  onMemberSelect, 
  onGoalUpdate,
  onYearlyGoalUpdate,
  isAdmin,
  onDeleteMember,
  trackedUser,
  onWorkStart,
  onWorkBreak,
  onWorkFinish
}) => {
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  // 現在のユーザー情報を取得
  const currentUser = localStorage.getItem('currentUser') || '';
  const userId = localStorage.getItem('userId') || '';
  
  // 設定とプロフィールの初期化
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    autoResetDaily: true,
    focusThreshold: 50
  });

  const [profile, setProfile] = useState({
    displayName: currentUser,
    avatar: "",
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ログアウト関数
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfile');
    window.location.reload();
  };

  // 作業状態管理関数
  const handleWorkStart = () => {
    console.log('Dashboard: 作業開始');
    if (onWorkStart) {
      onWorkStart();
    }
  };

  const handleWorkBreak = () => {
    console.log('Dashboard: 休憩開始');
    if (onWorkBreak) {
      onWorkBreak();
    }
  };

  const handleWorkFinish = () => {
    console.log('Dashboard: 作業終了');
    if (onWorkFinish) {
      onWorkFinish();
    }
  };

  // 設定変更ハンドラー
  const handleSettingsChange = (newSettings: any) => {
    setSettings(newSettings);
  };

  // プロフィール更新ハンドラー
  const handleProfileUpdate = (newProfile: any) => {
    setProfile(newProfile);
  };

  // 期間変更ハンドラー
  const [currentPeriod, setCurrentPeriod] = useState<ChartPeriod>('daily');
  
  const handlePeriodChange = (period: ChartPeriod) => {
    console.log('Dashboard: 期間変更:', period);
    setCurrentPeriod(period);
  };

  // 管理者権限チェック
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (window.electronAPI && typeof window.electronAPI.dbIsUserAdmin === 'function') {
        try {
          const adminStatus = await window.electronAPI.dbIsUserAdmin(trackedUser.id);
          console.log('Dashboard: 管理者権限確認結果:', adminStatus);
        } catch (error) {
          console.error('管理者権限チェックエラー:', error);
        }
      }
    };

    checkAdminStatus();
  }, [trackedUser.id]);

  // デバッグ用：trackedUserの状態をログ出力
  useEffect(() => {
    console.log('Dashboard: trackedUser更新:', trackedUser);
  }, [trackedUser]);
  
  // ステータス別の人数を計算
  const workingMembers = teamMembers.filter(member => member.workStatus === 'working').length;
  const breakMembers = teamMembers.filter(member => member.workStatus === 'break').length;
  const finishedMembers = teamMembers.filter(member => member.workStatus === 'finished').length;
  
  // 現在のユーザーの作業時間と休憩時間
  const currentUserWorkHours = trackedUser.dailyStats.focusHours;
  const currentUserBreakHours = trackedUser.dailyStats.breakHours;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      {/* メインコンテンツエリア */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左側：自分の情報 */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            あなたの情報
          </h2>
          
          {/* 自分のプロフィールカード */}
          <MemberCard
            member={trackedUser}
            onClick={() => setIsDetailViewOpen(true)}
            onGoalUpdate={onGoalUpdate}
            isAdmin={isAdmin}
          />
          
                    {/* メニューバー */}
          <div className="backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 p-4 mb-6 mt-8">
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <p className="text-gray-300 text-base">ようこそ、{profile.displayName || currentUser}さん</p>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* 作業状態メニュー */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleWorkStart}
                    disabled={trackedUser.workStatus === 'working'}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium text-white ${
                      trackedUser.workStatus === 'working'
                      ? 'bg-slate-700/15 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    style={{
                      boxShadow: trackedUser.workStatus === 'working' 
                        ? '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)' 
                        : '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)',
                      outline: trackedUser.workStatus === 'working' ? '2px solid rgba(51,65,85,.45)' : 'none'
                    }}
                  >
                    <Play className="w-5 h-5" />
                    開始
                  </button>
                  
                  <button
                    onClick={handleWorkBreak}
                    disabled={trackedUser.workStatus === 'break'}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium text-white ${
                      trackedUser.workStatus === 'break'
                      ? 'bg-slate-700/15 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    style={{
                      boxShadow: trackedUser.workStatus === 'break' 
                        ? '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)' 
                        : '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)',
                      outline: trackedUser.workStatus === 'break' ? '2px solid rgba(51,65,85,.45)' : 'none'
                    }}
                  >
                    <Coffee className="w-5 h-5" />
                    休憩
                  </button>
                  
                  <button
                    onClick={handleWorkFinish}
                    disabled={trackedUser.workStatus === 'finished'}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium text-white ${
                      trackedUser.workStatus === 'finished'
                      ? 'bg-slate-700/15 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    style={{
                      boxShadow: trackedUser.workStatus === 'finished' 
                        ? '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)' 
                        : '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)',
                      outline: trackedUser.workStatus === 'finished' ? '2px solid rgba(51,65,85,.45)' : 'none'
                    }}
                  >
                    <Square className="w-5 h-5" />
                    終了
                  </button>
                </div>
                
                {/* その他のボタン */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsGoalModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all duration-200 text-base font-medium"
                    title="今日の目標設定"
                    style={{
                      boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)',
                    }}
                  >
                    <Target className="w-5 h-5" />
                    目標設定
                  </button>
                  
                  <button
                    onClick={() => setIsPomodoroOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all duration-200 text-base font-medium"
                    title="ポモドーロタイマー"
                    style={{
                      boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)',
                    }}
                  >
                    <Timer className="w-5 h-5" />
                    タイマー
                  </button>
                  
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all duration-200 text-base font-medium"
                    title="設定"
                    style={{
                      boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(51,65,85,.18)',
                    }}
                  >
                    <Settings className="w-5 h-5" />
                    設定
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-slate-600 hover:bg-slate-700/20 rounded-lg text-slate-200 transition-all duration-200 text-base font-medium"
                    style={{
                      boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(71,85,105,.18)',
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右側：チーム情報 */}
        <div className="lg:col-span-3">
          {/* チームメンバー */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              チームメンバー
            </h2>
            {/* 管理者のみ追加ボタンを表示 */}
            {isAdmin && (
              <button onClick={() => setIsAddMemberOpen(true)} className="p-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-all duration-200" title="メンバーを追加">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {teamMembers && teamMembers.filter(member => member.id !== 'current-user').map((member) => (
              <MemberCard 
                key={`${member.id}-${member.todayGoal}`} 
                member={member} 
                onClick={() => onMemberSelect(member)} 
                onGoalUpdate={onGoalUpdate}
                isAdmin={isAdmin}
              />
            ))}
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
          onGoalUpdate?.('current-user', goal);
          setIsGoalModalOpen(false);
        }}
        currentGoal={trackedUser.todayGoal || ''}
        userName={currentUser}
      />

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* DetailView モーダル */}
      <DetailView
        member={trackedUser}
        isOpen={isDetailViewOpen}
        onClose={() => setIsDetailViewOpen(false)}
        onGoalUpdate={onGoalUpdate}
        onYearlyGoalUpdate={onYearlyGoalUpdate}
        currentPeriod={currentPeriod}
        onPeriodChange={handlePeriodChange}
        isAdmin={isAdmin}
        onDeleteMember={onDeleteMember}
      />

      {/* AddMember モーダル */}
      {isAdmin && <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />}
    </div>
  );
};