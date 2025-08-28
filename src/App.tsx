import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { DetailView } from './components/DetailView';
import { StatusSelectionModal } from './components/StatusSelectionModal';
import { TeamMember } from './types';
import { ChartPeriod } from './components/FocusChart';
import { useElectronActivityTracker } from './hooks/useElectronActivityTracker';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAdmin, setIsAdmin] = useState(false); // 管理者権限の状態
  const [showStatusSelection, setShowStatusSelection] = useState(false); // ステータス選択モーダルの表示状態

  const [lastResetDate, setLastResetDate] = useState<string>('');
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('dashboard-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('設定の読み込みに失敗:', error);
      }
    }
    return {
      soundEnabled: true,
      notificationsEnabled: true,
      autoResetDaily: true,
      focusThreshold: 70
    };
  });

  // プロフィール情報の状態
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('user-profile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (error) {
        console.error('プロフィールの読み込みに失敗:', error);
      }
    }
    return {
      displayName: currentUser || 'ユーザー',
      avatar: '/avatars/current-user.jpg',
      email: '',
      password: '',
      newPassword: '',
      confirmPassword: ''
    };
  });
  
  // リアルタイムトラッキング
  const { 
    currentUser: trackedUser, 
    startWork, 
    startBreak, 
    finishWork, 
    updateGoal,
    updateYearlyGoal,
    currentPeriod,
    handlePeriodChange,
    dailyHistory,
    monthlyHistory
  } = useElectronActivityTracker(
    profile.displayName || currentUser || 'ユーザー',
    { focusThreshold: settings.focusThreshold }
  );

  // デバッグ用：trackedUserの状態をログ出力
  useEffect(() => {
    console.log('App: trackedUser更新:', trackedUser);
  }, [trackedUser]);

  // プロフィール更新時のデバッグログ
  useEffect(() => {
    console.log('App: プロフィール更新:', profile);
  }, [profile]);

  // 管理者権限を確認する関数
  const checkAdminStatus = async (userId: string) => {
    try {
      if (window.electronAPI && typeof window.electronAPI.dbIsUserAdmin === 'function') {
        const isAdmin = await window.electronAPI.dbIsUserAdmin(userId);
        console.log(`App: ユーザーID ${userId} の管理者権限 = ${isAdmin}`);
        setIsAdmin(isAdmin);
        return isAdmin;
      }
    } catch (error) {
      console.error('管理者権限確認エラー:', error);
      setIsAdmin(false);
    }
    return false;
  };

  // ダミーメンバーを生成する関数
  const generateDummyMembers = (): TeamMember[] => {
    const dummyNames = [
      '田中太郎',
      '佐藤花子',
      '鈴木一郎',
      '高橋美咲',
      '伊藤健太',
      '渡辺恵子',
      '山田次郎',
      '中村真理',
      '小林正男',
      '加藤由美'
    ];

    const workStatuses: ('working' | 'break' | 'finished')[] = ['working', 'break', 'finished'];
    const activities = [
      'コードレビュー中',
      'デザイン作業中',
      '会議参加中',
      'ドキュメント作成中',
      'テスト実行中',
      '休憩中',
      '作業終了'
    ];

    return dummyNames.slice(0, 5).map((name, index) => ({
      id: `dummy-${index + 1}`,
      name: name,
      focusScore: Math.floor(Math.random() * 100),
      currentActivity: activities[Math.floor(Math.random() * activities.length)],
      status: 'online' as const,
      avatar: `/avatars/dummy-${index + 1}.jpg`,
      lastUpdate: new Date(),
      dailyStats: {
        totalHours: Math.random() * 8,
        focusHours: Math.random() * 6,
        breakHours: Math.random() * 2
      },
      activities: [],
      focusHistory: Array.from({ length: 7 }, () => ({
        time: new Date().toLocaleDateString('ja-JP'),
        score: Math.floor(Math.random() * 100),
        focusHours: Math.random() * 8
      })),
      todayGoal: `${['プロジェクト完了', 'コード整理', 'テスト作成', 'ドキュメント更新', 'バグ修正'][Math.floor(Math.random() * 5)]}`,
      yearlyGoal: `${['スキル向上', 'プロジェクト成功', 'チーム貢献', '技術習得', '成果創出'][Math.floor(Math.random() * 5)]}`,
      isWorking: Math.random() > 0.3,
      workStatus: workStatuses[Math.floor(Math.random() * workStatuses.length)],
      isAdmin: false,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 過去30日以内
    }));
  };

  // チームメンバーを読み込む関数
  const loadTeamMembers = async () => {
    if (!window.electronAPI?.dbGetAllUsers) {
      console.error('Electron API not available');
      return;
    }

    try {
      const users = await window.electronAPI.dbGetAllUsers();
      console.log('App: データベースから取得したユーザー:', users);
      
      // 現在のユーザーのIDを取得
      const currentUserId = localStorage.getItem('userId');
      console.log('App: 現在のユーザーID:', currentUserId);
      
      // データベースのユーザーをTeamMember形式に変換
      const dbTeamMembers: TeamMember[] = users.map((user: any) => ({
        id: user.id,
        name: user.displayName || user.name,
        email: user.email,
        avatar: user.avatar || '/avatars/default.jpg',
        status: 'online',
        workStatus: user.workStatus || 'finished',
        currentActivity: user.currentActivity || '活動なし',
        focusScore: user.focusScore || 0,
        dailyStats: {
          totalHours: user.totalHours || 0,
          focusHours: user.focusHours || 0,
          breakHours: user.breakHours || 0
        },
        todayGoal: user.todayGoal || '',
        yearlyGoal: user.yearlyGoal || '',
        isAdmin: user.isAdmin || false,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
      }));

      // 現在のユーザーを除外してチームメンバーを設定
      const otherMembers = dbTeamMembers.filter(member => member.id !== currentUserId);
      
      console.log('App: 現在のユーザーを除外したチームメンバー:', otherMembers);
      
      // ダミーメンバーを生成
      const dummyMembers = generateDummyMembers();
      console.log('App: 生成されたダミーメンバー:', dummyMembers);
      
      // trackedUserが利用可能な場合のみ追加
      if (trackedUser) {
        setTeamMembers([trackedUser, ...otherMembers, ...dummyMembers]);
      } else {
        setTeamMembers([...otherMembers, ...dummyMembers]);
      }
      
      // データベースにユーザーが存在しない場合は、現在のユーザーとダミーメンバーを設定
      if (users.length === 0 && trackedUser) {
        console.log('App: データベースにユーザーが存在しないため、現在のユーザーとダミーメンバーを設定');
        setTeamMembers([trackedUser, ...dummyMembers]);
      }
      
    } catch (error) {
      console.error('App: チームメンバーの読み込みエラー:', error);
      // エラー時はダミーメンバーを設定
      const dummyMembers = generateDummyMembers();
      if (trackedUser) {
        setTeamMembers([trackedUser, ...dummyMembers]);
      } else {
        setTeamMembers(dummyMembers);
      }
    }
  };

  // チームメンバーの初期化と更新
  useEffect(() => {
    if (trackedUser && currentUser) {
      console.log('App: チームメンバー更新処理開始');
      
      if (teamMembers.length === 0) {
        // 初回初期化時のみデータベースから読み込み
        console.log('App: 初回初期化 - データベースからチームメンバーを読み込み');
        loadTeamMembers();
      } else {
        // トラッキングユーザーの更新のみ
        console.log('App: トラッキングユーザーを更新');
        setTeamMembers(prev => {
          if (!prev) return [trackedUser];
          const currentUserId = localStorage.getItem('userId');
          const updated = prev.map(member => 
            member.id === currentUserId ? trackedUser : member
          );
          return updated;
        });
      }
    }
  }, [trackedUser, currentUser]); // 依存関係を簡素化

  // 目標更新ハンドラー
  const handleGoalUpdate = async (memberId: string, newGoal: string) => {
    console.log('App: 目標更新:', memberId, newGoal);
    
    try {
      // データベースに保存
      if (window.electronAPI?.dbUpdateUserGoal) {
        // current-userの場合は実際のuserIdを使用
        const actualUserId = memberId === 'current-user' ? localStorage.getItem('userId') : memberId;
        if (actualUserId) {
          await window.electronAPI.dbUpdateUserGoal(actualUserId, newGoal);
          console.log('App: データベースに目標を保存:', actualUserId, newGoal);
        }
      }
      
      // 現在のユーザーの場合は、useElectronActivityTrackerのupdateGoalを使用
      const currentUserId = localStorage.getItem('userId');
      if (memberId === 'current-user' || memberId === currentUserId) {
        console.log('App: 現在のユーザーの目標を更新:', newGoal);
        updateGoal(newGoal);
      }
      
      // ローカル状態を更新
      setTeamMembers(prev => {
        const updated = prev.map(member => {
          if (member.id === memberId) {
            console.log('App: メンバー更新前:', member);
            const updatedMember = { ...member, todayGoal: newGoal };
            console.log('App: メンバー更新後:', updatedMember);
            return updatedMember;
          }
          return member;
        });
        console.log('App: 更新後の全メンバー:', updated);
        return updated;
      });
      
      // 選択中のメンバーも更新
      if (selectedMember && selectedMember.id === memberId) {
        const updatedMember = { ...selectedMember, todayGoal: newGoal };
        console.log('App: 選択メンバー更新:', updatedMember);
        setSelectedMember(updatedMember);
      }
    } catch (error) {
      console.error('App: 目標更新エラー:', error);
    }
  };

  // 今年の目標更新ハンドラー
  const handleYearlyGoalUpdate = async (memberId: string, newYearlyGoal: string) => {
    console.log('App: 今年の目標更新:', memberId, newYearlyGoal);
    
    try {
      // データベースに保存
      if (window.electronAPI?.dbUpdateUserYearlyGoal) {
        // current-userの場合は実際のuserIdを使用
        const actualUserId = memberId === 'current-user' ? localStorage.getItem('userId') : memberId;
        if (actualUserId) {
          await window.electronAPI.dbUpdateUserYearlyGoal(actualUserId, newYearlyGoal);
          console.log('App: データベースに今年の目標を保存:', actualUserId, newYearlyGoal);
        }
      }
      
      // 現在のユーザーの場合は、useElectronActivityTrackerのupdateYearlyGoalを使用
      const currentUserId = localStorage.getItem('userId');
      if (memberId === 'current-user' || memberId === currentUserId) {
        console.log('App: 現在のユーザーの今年の目標を更新:', newYearlyGoal);
        updateYearlyGoal(newYearlyGoal);
      }
      
      // ローカル状態を更新
      setTeamMembers(prev => {
        const updated = prev.map(member => {
          if (member.id === memberId) {
            console.log('App: メンバーの今年の目標更新前:', member);
            const updatedMember = { ...member, yearlyGoal: newYearlyGoal };
            console.log('App: メンバーの今年の目標更新後:', updatedMember);
            return updatedMember;
          }
          return member;
        });
        console.log('App: 今年の目標更新後の全メンバー:', updated);
        return updated;
      });
      
      // 選択中のメンバーも更新
      if (selectedMember && selectedMember.id === memberId) {
        const updatedMember = { ...selectedMember, yearlyGoal: newYearlyGoal };
        console.log('App: 選択メンバーの今年の目標更新:', updatedMember);
        setSelectedMember(updatedMember);
      }
    } catch (error) {
      console.error('App: 今年の目標更新エラー:', error);
    }
  };

  // 作業開始ハンドラー
  const handleWorkStart = (memberId: string) => {
    console.log('App: 作業開始:', memberId);
    if (memberId === 'current-user') {
      console.log('App: startWork() を呼び出し');
      startWork();
    }
  };

  // 休憩開始ハンドラー
  const handleWorkBreak = (memberId: string) => {
    console.log('App: 休憩開始:', memberId);
    if (memberId === 'current-user') {
      console.log('App: startBreak() を呼び出し');
      startBreak();
    }
  };

  // 作業終了ハンドラー
  const handleWorkFinish = (memberId: string) => {
    console.log('App: 作業終了:', memberId);
    if (memberId === 'current-user') {
      console.log('App: finishWork() を呼び出し');
      finishWork();
    }
  };

  const handleLogin = (user: any) => {
    setIsLoggedIn(true);
    setCurrentUser(user.name);
    localStorage.setItem('currentUser', user.name);
    localStorage.setItem('userId', user.id);
    
    // 管理者権限を確認
    checkAdminStatus(user.id);
    
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      const defaultProfile = {
        displayName: user.name,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        email: user.email
      };
      setProfile(defaultProfile);
      localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
    }
    
    // ログイン後にステータス選択モーダルを表示
    setShowStatusSelection(true);
  };

  const handleMemberSelect = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const handleBackToDashboard = () => {
    setSelectedMember(null);
  };

  // ステータス選択モーダルのハンドラー
  const handleStatusSelection = (status: 'working' | 'break' | 'finished') => {
    console.log('App: ステータス選択:', status);
    setShowStatusSelection(false);
    
    switch (status) {
      case 'working':
        startWork();
        break;
      case 'break':
        startBreak();
        break;
      case 'finished':
        finishWork();
        break;
    }
  };

  // 期間変更ハンドラー
  const handlePeriodChangeForDetail = (period: ChartPeriod) => {
    // 選択中のメンバーのデータを更新
    if (selectedMember) {
      const updatedMember = { ...selectedMember };
      
      if (period === 'daily') {
        // 日別データ：過去7日間
        updatedMember.focusHistory = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i)); // 6日前から今日まで
          const month = date.getMonth() + 1;
          const day = date.getDate();
          return {
            time: `${month}/${day}`,
            score: Math.floor(Math.random() * 100),
            focusHours: Math.random() * 8
          };
        });
      } else if (period === 'monthly') {
        // 月別データ：1月〜現在の月まで
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 現在の月（1-12）
        updatedMember.focusHistory = Array.from({ length: currentMonth }, (_, i) => {
          const month = i + 1;
          return {
            time: `${month}月`,
            score: Math.floor(Math.random() * 100),
            focusHours: Math.random() * 160
          };
        });
      }
      
      setSelectedMember(updatedMember);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedMember(null);
  };

  const handleSettingsChange = (newSettings: any) => {
    console.log('App: 設定変更:', newSettings);
    setSettings(newSettings);
    
    // 設定をローカルストレージに保存
    localStorage.setItem('dashboard-settings', JSON.stringify(newSettings));
  };

  // プロフィール更新ハンドラー
  const handleProfileUpdate = (newProfile: any) => {
    console.log('App: プロフィール更新:', newProfile);
    setProfile(newProfile);
    localStorage.setItem('user-profile', JSON.stringify(newProfile));
    
    // パスワード変更の場合は認証情報も更新
    if (newProfile.newPassword && newProfile.newPassword === newProfile.confirmPassword) {
      // 実際のアプリケーションでは、ここでサーバーにパスワード変更を送信
      console.log('App: パスワード変更を処理');
      
      // パスワードフィールドをクリア
      setProfile(prev => ({
        ...prev,
        password: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  };

  // データベースを完全にクリーンアップする関数
  const handleClearAllData = async () => {
    if (!confirm('⚠️ 警告: すべてのユーザーデータが削除されます。この操作は取り消せません。\n\n続行しますか？')) {
      return;
    }
    
    try {
      const result = await window.electronAPI.dbClearAllData();
      if (result.success) {
        console.log('データベース完全クリーンアップ成功:', result.message);
        alert(`✅ ${result.message}\n\nアプリケーションを再起動してください。`);
        // ログアウトしてログイン画面に戻る
        setIsLoggedIn(false);
        setCurrentUser('');
        setTeamMembers([]);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
      } else {
        console.error('データベース完全クリーンアップ失敗:', result.message);
        alert(`❌ エラー: ${result.message}`);
      }
    } catch (error) {
      console.error('データベース完全クリーンアップエラー:', error);
      alert('❌ データベース完全クリーンアップ中にエラーが発生しました');
    }
  };

  // ダミーデータを削除する関数
  const handleCleanDummyData = async () => {
    try {
      const result = await window.electronAPI.dbCleanDummyData();
      if (result.success) {
        console.log('ダミーデータ削除成功:', result.message);
        // チームメンバーを再読み込み
        loadTeamMembers();
      } else {
        console.error('ダミーデータ削除失敗:', result.message);
      }
    } catch (error) {
      console.error('ダミーデータ削除エラー:', error);
    }
  };

  // メンバー削除関数
  const handleDeleteMember = async (memberId: string) => {
    if (!isAdmin) {
      alert('管理者権限が必要です');
      return;
    }

    if (!confirm(`ユーザー「${memberId}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      if (window.electronAPI?.dbDeleteUser) {
        const result = await window.electronAPI.dbDeleteUser(memberId);
        if (result.success) {
          console.log('メンバー削除成功:', memberId);
          // チームメンバーを再読み込み
          loadTeamMembers();
        } else {
          alert('メンバーの削除に失敗しました');
        }
      }
    } catch (error) {
      console.error('メンバー削除エラー:', error);
      alert('メンバーの削除中にエラーが発生しました');
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (selectedMember) {
    return (
      <>
        <Dashboard 
          teamMembers={teamMembers}
          onMemberSelect={handleMemberSelect}
          onGoalUpdate={handleGoalUpdate}
          onYearlyGoalUpdate={handleYearlyGoalUpdate}
          isAdmin={isAdmin}
          onDeleteMember={handleDeleteMember}
          onCleanDummyData={handleCleanDummyData}
          onClearAllData={handleClearAllData}
          trackedUser={trackedUser}
          onWorkStart={startWork}
          onWorkBreak={startBreak}
          onWorkFinish={finishWork}
        />
        
        <DetailView 
          member={selectedMember} 
          isOpen={true}
          onClose={handleBackToDashboard}
          onGoalUpdate={handleGoalUpdate}
          onYearlyGoalUpdate={handleYearlyGoalUpdate}
          currentPeriod={currentPeriod}
          onPeriodChange={handlePeriodChangeForDetail}
          isAdmin={isAdmin}
          onDeleteMember={handleDeleteMember}
        />
      </>
    );
  }



  // チームモードの場合
  if (!trackedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  console.log('App: Dashboardに渡すtrackedUser.workStatus:', trackedUser.workStatus);
  console.log('App: Dashboardに渡すtrackedUser全体:', trackedUser);
  
  return (
    <>
      <Dashboard 
        teamMembers={teamMembers}
        onMemberSelect={handleMemberSelect}
        onGoalUpdate={handleGoalUpdate}
        onYearlyGoalUpdate={handleYearlyGoalUpdate}
        isAdmin={isAdmin}
        onDeleteMember={handleDeleteMember}
        onCleanDummyData={handleCleanDummyData}
        onClearAllData={handleClearAllData}
        trackedUser={trackedUser}
        onWorkStart={startWork}
        onWorkBreak={startBreak}
        onWorkFinish={finishWork}
      />
      
      {/* ステータス選択モーダル */}
      <StatusSelectionModal
        isOpen={showStatusSelection}
        onClose={() => setShowStatusSelection(false)}
        onStatusSelect={handleStatusSelection}
      />
    </>
  );
}

export default App;