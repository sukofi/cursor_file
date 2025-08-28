import { useState, useEffect, useRef, useMemo } from 'react';
import { TeamMember, ActivityData as TeamActivityData, FocusPoint } from '../types';
import { ActivityData } from '../types/electron';
import { ChartPeriod } from '../components/FocusChart';

interface ActivityMetrics {
  mouseMovements: number;
  mouseClicks: number;
  keystrokes: number;
  activeTime: number;
  idleTime: number;
  currentApp: string;
  currentWindowTitle: string;
  appSwitches: number;
  isWorking: boolean;
  workStartTime: number | null;
  workStatus: 'working' | 'break' | 'finished';
}

interface FocusSettings {
  focusThreshold: number;
}

export const useElectronActivityTracker = (userName: string, focusSettings?: FocusSettings) => {
  // プロフィールから表示名を取得（状態として管理）
  const [displayName, setDisplayName] = useState(() => {
    const savedProfile = localStorage.getItem('user-profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        return profile.displayName || userName || 'ユーザー';
      } catch (error) {
        console.error('プロフィールの読み込みに失敗:', error);
      }
    }
    return userName || 'ユーザー';
  });

  // 管理者権限の状態
  const [isAdmin, setIsAdmin] = useState(false);

  // 管理者権限を確認するuseEffect
  useEffect(() => {
    const checkAdminStatus = async () => {
      const userId = localStorage.getItem('userId');
      if (userId && window.electronAPI?.dbIsUserAdmin) {
        try {
          const adminStatus = await window.electronAPI.dbIsUserAdmin(userId);
          console.log('useElectronActivityTracker: 管理者権限確認結果:', adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('useElectronActivityTracker: 管理者権限確認エラー:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, []);

  // プロフィールの変更を監視
  useEffect(() => {
    const checkProfileUpdate = () => {
      const savedProfile = localStorage.getItem('user-profile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          const newDisplayName = profile.displayName || userName || 'ユーザー';
          if (newDisplayName !== displayName) {
            console.log('useElectronActivityTracker: 表示名を更新:', displayName, '→', newDisplayName);
            setDisplayName(newDisplayName);
          }
        } catch (error) {
          console.error('プロフィールの読み込みに失敗:', error);
        }
      }
    };

    // 初回チェック
    checkProfileUpdate();

    // 定期的にチェック（1秒間隔）
    const interval = setInterval(checkProfileUpdate, 1000);

    return () => clearInterval(interval);
  }, [displayName, userName]);

  // プロフィール情報の変更を監視（アバター更新用）
  useEffect(() => {
    const checkProfileAvatar = () => {
      const savedProfile = localStorage.getItem('user-profile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          // プロフィール情報が変更された場合、currentUserを再生成するために強制的に更新
          // これはuseMemoの依存関係をトリガーするため
          const newDisplayName = profile.displayName || userName || 'ユーザー';
          if (newDisplayName !== displayName) {
            setDisplayName(newDisplayName);
          }
        } catch (error) {
          console.error('プロフィールの読み込みに失敗:', error);
        }
      }
    };

    // 初回チェック
    checkProfileAvatar();

    // 定期的にチェック（2秒間隔）
    const interval = setInterval(checkProfileAvatar, 2000);

    return () => clearInterval(interval);
  }, [displayName, userName]);
  
  // Electron APIの存在と機能をチェックする関数
  const isElectronAvailable = () => {
    const api = (window as any).electronAPI;
    if (!api) return false;
    return !!(typeof api.getCurrentActivity === 'function' &&
           typeof api.startTracking === 'function' &&
           typeof api.stopTracking === 'function' &&
           typeof api.hasScreenRecordingPermission === 'function');
  };
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    mouseMovements: 0,
    mouseClicks: 0,
    keystrokes: 0,
    activeTime: 0,
    idleTime: 0,
    currentApp: '集中度ダッシュボード',
    currentWindowTitle: '',
    appSwitches: 0,
    isWorking: true, // デフォルトで作業中に設定
    workStartTime: Date.now(),
    workStatus: 'working' // デフォルトで作業中に設定
  });

  // デバッグ用：初期状態をログ出力
  useEffect(() => {
    console.log('useElectronActivityTracker: 初期状態 - workStatus:', metrics.workStatus);
    console.log('useElectronActivityTracker: Electron API 利用可能:', !!window.electronAPI);
    if (window.electronAPI) {
      console.log('useElectronActivityTracker: Electron API メソッド:', {
        getCurrentActivity: typeof window.electronAPI.getCurrentActivity,
        startTracking: typeof window.electronAPI.startTracking,
        stopTracking: typeof window.electronAPI.stopTracking,
        hasScreenRecordingPermission: typeof window.electronAPI.hasScreenRecordingPermission,
        onActivityUpdate: typeof window.electronAPI.onActivityUpdate
      });
    }
  }, []);

  // 日付変更をチェックして統計をリセットする関数
  const checkAndResetDailyStats = () => {
    const today = new Date().toDateString();
    
    if (lastResetDate.current !== today) {
      console.log('useElectronActivityTracker: 日付変更を検知、統計をリセット');
      lastResetDate.current = today;
      startTime.current = Date.now();
      
      setMetrics(prev => ({
        ...prev,
        mouseMovements: 0,
        mouseClicks: 0,
        keystrokes: 0,
        activeTime: 0,
        idleTime: 0,
        appSwitches: 0
      }));
      
      // 日別データなので履歴はリセットしない（7日分保持）
      setActivities([]);
      setCurrentFocusScore(0);
    }
  };

  const [focusHistory, setFocusHistory] = useState<FocusPoint[]>([]);
  const [dailyHistory, setDailyHistory] = useState<FocusPoint[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<FocusPoint[]>([]);
  const [yearlyHistory, setYearlyHistory] = useState<FocusPoint[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<ChartPeriod>('daily');
  const [activities, setActivities] = useState<TeamActivityData[]>([]);
  const [currentFocusScore, setCurrentFocusScore] = useState(85);
  const [appUsageMap, setAppUsageMap] = useState<Map<string, number>>(new Map());
  const [todayGoal, setTodayGoal] = useState('集中度ダッシュボードの開発');
  const [yearlyGoal, setYearlyGoal] = useState('新しい技術を習得し、プロジェクトを完成させる');
  
  // 目標更新関数
  const updateGoal = (newGoal: string) => {
    console.log('useElectronActivityTracker: 目標更新:', newGoal);
    setTodayGoal(newGoal);
  };

  // 今年の目標更新関数
  const updateYearlyGoal = (newYearlyGoal: string) => {
    console.log('useElectronActivityTracker: 今年の目標更新:', newYearlyGoal);
    setYearlyGoal(newYearlyGoal);
  };

  // 期間変更ハンドラー
  const handlePeriodChange = (period: ChartPeriod) => {
    setCurrentPeriod(period);
  };

  // 期間別データ生成関数
  const generatePeriodData = (period: ChartPeriod): FocusPoint[] => {
    const now = new Date();
    
    switch (period) {
      case 'daily':
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const score = Math.max(0, Math.min(100, 75 + Math.random() * 20)); // 0-100の範囲に制限
          return {
            time: date.toLocaleDateString('ja-JP', { 
              month: 'numeric',
              day: 'numeric',
              weekday: 'short'
            }),
            score: score
          };
        }).reverse();
        
      case 'monthly':
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const score = Math.max(0, Math.min(100, 70 + Math.random() * 25)); // 0-100の範囲に制限
          return {
            time: date.toLocaleDateString('ja-JP', { 
              year: 'numeric',
              month: 'short'
            }),
            score: score
          };
        }).reverse();
        
      case 'yearly':
        return Array.from({ length: 5 }, (_, i) => {
          const year = now.getFullYear() - i;
          const score = Math.max(0, Math.min(100, 65 + Math.random() * 30)); // 0-100の範囲に制限
          return {
            time: `${year}年`,
            score: score
          };
        }).reverse();
        
      default:
        return [];
    }
  };

  // 現在の期間に応じたデータを取得
  const getCurrentPeriodData = (): FocusPoint[] => {
    switch (currentPeriod) {
      case 'daily': return dailyHistory;
      case 'monthly': return monthlyHistory;
      case 'yearly': return yearlyHistory;
      default: return dailyHistory;
    }
  };

  const lastActivityTime = useRef(Date.now());
  const startTime = useRef(Date.now());
  const workStartTimeRef = useRef<number | null>(null); // 作業開始時間を正確に管理
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastApp = useRef<string>('');
  const lastResetDate = useRef<string>('');

  // 作業状態の制御
  const startWork = async () => {
    console.log('useElectronActivityTracker: startWork() 実行');
    console.log('useElectronActivityTracker: Electron環境チェック - window.electronAPI:', !!window.electronAPI);
    
    // Electron環境で現在のアプリ名を取得
    let currentAppName = document.title || 'ブラウザ';
    let currentWindowTitle = document.title || 'ブラウザ';
    
    if (window.electronAPI && typeof window.electronAPI!.getCurrentActivity === 'function') {
      console.log('useElectronActivityTracker: Electron API が利用可能');
      try {
        const activityData = await window.electronAPI!.getCurrentActivity();
        console.log('useElectronActivityTracker: getCurrentActivity 結果:', activityData);
        if (activityData) {
          currentAppName = activityData.appName;
          currentWindowTitle = activityData.windowTitle;
          console.log('Electron: 作業開始時のアプリ名:', activityData);
        }
      } catch (error) {
        console.error('Electron: 作業開始時のアプリ名取得エラー:', error);
      }
    } else {
      console.log('useElectronActivityTracker: Electron API が利用不可 - ブラウザ環境');
    }
    
    // データベースに作業開始を記録
    try {
      if (window.electronAPI?.dbStartWork) {
        await window.electronAPI.dbStartWork('current-user', {
          appName: currentAppName,
          windowTitle: currentWindowTitle,
          startTime: Date.now()
        });
        console.log('useElectronActivityTracker: データベースに作業開始を記録');
      }
    } catch (error) {
      console.error('useElectronActivityTracker: データベース記録エラー:', error);
    }
    
    const now = Date.now();
    workStartTimeRef.current = now; // 作業開始時間を記録
    
    // 作業開始時に時間をリセット
    setMetrics(prev => ({
      ...prev,
      activeTime: 0,
      idleTime: 0
    }));
    
    setMetrics(prev => {
      console.log('useElectronActivityTracker: 作業開始 - 前の状態:', prev.workStatus);
      const newMetrics = {
        ...prev,
        isWorking: true,
        workStartTime: now,
        workStatus: 'working' as const,
        currentApp: currentAppName,
        currentWindowTitle: currentWindowTitle
      };
      console.log('useElectronActivityTracker: 作業開始 - 新しい状態:', newMetrics.workStatus, 'currentApp:', newMetrics.currentApp);
      console.log('useElectronActivityTracker: 作業開始 - 新しいmetrics全体:', newMetrics);
      console.log('useElectronActivityTracker: 作業開始時間設定:', new Date(now).toLocaleTimeString());
      return newMetrics;
    });
  };

  const startBreak = async () => {
    console.log('useElectronActivityTracker: startBreak() 実行');
    
    // データベースに休憩開始を記録
    try {
      if (window.electronAPI?.dbStartBreak) {
        await window.electronAPI.dbStartBreak('current-user');
        console.log('useElectronActivityTracker: データベースに休憩開始を記録');
      }
    } catch (error) {
      console.error('useElectronActivityTracker: データベース記録エラー:', error);
    }
    
    workStartTimeRef.current = null; // 作業開始時間をリセット
    
    setMetrics(prev => {
      console.log('useElectronActivityTracker: 休憩開始 - 前の状態:', prev.workStatus);
      const newMetrics = {
        ...prev,
        isWorking: false,
        workStartTime: null,
        workStatus: 'break' as const,
        currentApp: '休憩中',
        currentWindowTitle: '休憩中'
      };
      console.log('useElectronActivityTracker: 休憩開始 - 新しい状態:', newMetrics.workStatus);
      return newMetrics;
    });
    // 休憩開始時に集中度を0にリセット
    setCurrentFocusScore(0);
  };

  const finishWork = async () => {
    console.log('useElectronActivityTracker: finishWork() 実行');
    
    // データベースに作業終了を記録
    try {
      if (window.electronAPI?.dbFinishWork) {
        await window.electronAPI.dbFinishWork('current-user');
        console.log('useElectronActivityTracker: データベースに作業終了を記録');
      }
    } catch (error) {
      console.error('useElectronActivityTracker: データベース記録エラー:', error);
    }
    
    workStartTimeRef.current = null; // 作業開始時間をリセット
    
    setMetrics(prev => {
      console.log('useElectronActivityTracker: 作業終了 - 前の状態:', prev.workStatus);
      const newMetrics = {
        ...prev,
        isWorking: false,
        workStartTime: null,
        workStatus: 'finished' as const,
        currentApp: '作業終了',
        currentWindowTitle: '作業終了'
      };
      console.log('useElectronActivityTracker: 作業終了 - 新しい状態:', newMetrics.workStatus);
      return newMetrics;
    });
    // 作業終了時に集中度を0にリセット
    setCurrentFocusScore(0);
  };

  // 集中度計算（シンプルな計算）
  const calculateFocusScore = (activityLevel: number): number => {
    const threshold = focusSettings?.focusThreshold || 30; // 閾値を30に下げる
    
    // シンプルな閾値ベースの計算
    let score: number;
    if (activityLevel >= threshold) {
      score = Math.min(100, 70 + (activityLevel - threshold) * 1.5); // より敏感に
    } else {
      score = Math.max(0, (activityLevel / threshold) * 70); // より敏感に
    }
    
    // 最終的に0-100の範囲に制限
    return Math.max(0, Math.min(100, score));
  };

  // アクティビティトラッキング
  useEffect(() => {
    const trackActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime.current;
      
      // マウス移動の検出
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = Math.abs(e.clientX - mousePositionRef.current.x);
        const deltaY = Math.abs(e.clientY - mousePositionRef.current.y);
        
        if (deltaX > 5 || deltaY > 5) {
          lastActivityTime.current = now;
          console.log('useElectronActivityTracker: マウス移動検出', { deltaX, deltaY });
          setMetrics(prev => ({
            ...prev,
            mouseMovements: prev.mouseMovements + 1
          }));
        }
        
        mousePositionRef.current = { x: e.clientX, y: e.clientY };
      };

      // マウスクリックの検出
      const handleMouseClick = () => {
        lastActivityTime.current = now;
        console.log('useElectronActivityTracker: マウスクリック検出');
        setMetrics(prev => ({
          ...prev,
          mouseClicks: prev.mouseClicks + 1
        }));
      };

      // キーストロークの検出
      const handleKeyPress = () => {
        lastActivityTime.current = now;
        console.log('useElectronActivityTracker: キーストローク検出');
        setMetrics(prev => ({
          ...prev,
          keystrokes: prev.keystrokes + 1
        }));
      };

      // Electron環境でのアクティビティ更新
      const handleActivityUpdate = (data: ActivityData) => {
        console.log('useElectronActivityTracker: アクティビティ更新を受信:', data);
        lastActivityTime.current = now;
        
        // 作業中でない場合はアプリ情報を更新しない
        // 現在のmetricsの状態を確認
        const currentMetrics = metrics;
        if (currentMetrics.workStatus !== 'working') {
          console.log('useElectronActivityTracker: 作業中でないためアプリ情報更新をスキップ:', currentMetrics.workStatus);
          return;
        }
        
        // Electronアプリ自体の場合は更新しない（ただし、デバッグ用にログは出力）
        if (data.appName === 'Electron App' || data.appName === '集中度ダッシュボード') {
          console.log('useElectronActivityTracker: Electronアプリのため更新をスキップ:', data.appName);
          return;
        }
        
        // アプリが変更された場合のみログを出力
        if (data.appName !== lastApp.current) {
          console.log('useElectronActivityTracker: アプリケーション変更:', lastApp.current, '→', data.appName);
          lastApp.current = data.appName;
          
          // アプリ切り替え回数をカウント
          setMetrics(prev => ({
            ...prev,
            appSwitches: prev.appSwitches + 1
          }));
        }
        
        setMetrics(prev => ({
          ...prev,
          currentApp: data.appName,
          currentWindowTitle: data.windowTitle
        }));
      };

      // フォーカス変更の検出（ブラウザ環境用）
      const handleFocusChange = () => {
        if (document.hasFocus()) {
          lastActivityTime.current = now;
          // 作業中のみアプリ情報を更新
          const currentMetrics = metrics;
          if (currentMetrics.workStatus === 'working') {
            setMetrics(prev => ({
              ...prev,
              currentApp: document.title || 'ブラウザ',
              currentWindowTitle: document.title || 'ブラウザ'
            }));
          }
        }
      };

      // ページ可視性変更の検出（ブラウザ環境用）
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          lastActivityTime.current = now;
          // 作業中のみアプリ情報を更新
          const currentMetrics = metrics;
          if (currentMetrics.workStatus === 'working') {
            setMetrics(prev => ({
              ...prev,
              currentApp: document.title || 'ブラウザ',
              currentWindowTitle: document.title || 'ブラウザ'
            }));
          }
        }
      };

      // イベントリスナーの追加
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleMouseClick);
      document.addEventListener('keydown', handleKeyPress);
      document.addEventListener('focus', handleFocusChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocusChange);

      // Electron環境でのアクティビティトラッキング開始
      if (window.electronAPI && typeof window.electronAPI.hasScreenRecordingPermission === 'function') {
        console.log('useElectronActivityTracker: Electron環境を検出、アクティビティトラッキングを開始');
        
        // 初期テスト：現在のアクティビティを取得してみる
        window.electronAPI!.getCurrentActivity().then(testData => {
          console.log('useElectronActivityTracker: 初期テスト - 現在のアクティビティ:', testData);
        }).catch(error => {
          console.error('useElectronActivityTracker: 初期テストエラー:', error);
        });
        
        // 権限をチェック
        window.electronAPI.hasScreenRecordingPermission().then(hasPermission => {
          console.log('useElectronActivityTracker: スクリーン録画権限:', hasPermission);
          
          if (hasPermission) {
            window.electronAPI!.startTracking().then(trackingResult => {
              console.log('useElectronActivityTracker: トラッキング開始結果:', trackingResult);
              window.electronAPI!.onActivityUpdate(handleActivityUpdate);
              console.log('useElectronActivityTracker: アクティビティ更新リスナーを設定');
              
              // 初期のアクティビティデータを取得
              window.electronAPI!.getCurrentActivity().then(initialData => {
                if (initialData) {
                  console.log('useElectronActivityTracker: 初期アクティビティデータ:', initialData);
                  handleActivityUpdate(initialData);
                }
              }).catch(error => {
                console.error('useElectronActivityTracker: 初期アクティビティデータ取得エラー:', error);
              });
            }).catch(error => {
              console.error('useElectronActivityTracker: トラッキング開始エラー:', error);
            });
          } else {
            console.log('useElectronActivityTracker: 権限がないため、基本的なトラッキングのみ使用');
            
            // 権限がない場合でも定期的にアクティビティデータを取得（作業中のみ）
            const fallbackInterval = setInterval(() => {
              // 現在のmetricsの状態を確認
              const currentMetrics = metrics;
              if (currentMetrics.workStatus === 'working' && window.electronAPI && typeof window.electronAPI.getCurrentActivity === 'function') {
                window.electronAPI.getCurrentActivity().then(data => {
                  if (data && data.appName !== 'Electron App' && data.appName !== '集中度ダッシュボード') {
                    console.log('useElectronActivityTracker: フォールバックアクティビティデータ:', data);
                    handleActivityUpdate(data);
                  }
                }).catch(error => {
                  console.error('useElectronActivityTracker: フォールバックアクティビティ取得エラー:', error);
                });
              }
            }, 5000); // 5秒ごとにチェック
            
            // クリーンアップ関数に追加
            return () => {
              clearInterval(fallbackInterval);
            };
          }
        }).catch(error => {
          console.error('useElectronActivityTracker: 権限チェックエラー:', error);
        });
      } else {
        console.log('useElectronActivityTracker: ブラウザ環境を検出、ブラウザ用トラッキングを使用');
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleMouseClick);
        document.removeEventListener('keydown', handleKeyPress);
        document.removeEventListener('focus', handleFocusChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocusChange);

        // Electron環境でのクリーンアップ
        if (window.electronAPI && typeof window.electronAPI.stopTracking === 'function') {
          window.electronAPI.stopTracking();
          window.electronAPI.removeAllListeners('activity-update');
        }
      };
    };

    const cleanup = trackActivity();
    return cleanup;
  }, []);

  // 定期的な集中度計算と更新
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // 日付変更をチェック
      checkAndResetDailyStats();
      
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime.current;
      
      // アクティビティレベルの計算（より敏感に）
      const activityLevel = Math.min(100, 
        (metrics.mouseMovements * 0.2 + 
         metrics.mouseClicks * 3 + 
         metrics.keystrokes * 2.5) / 
        Math.max(1, (now - startTime.current) / 30000) // 30秒あたりの活動
      );

      // 集中度の計算（閾値設定を考慮）
      const newFocusScore = calculateFocusScore(activityLevel);

      // デバッグ用ログ（3秒ごと）
      if (Math.floor(now / 3000) % 1 === 0) {
        console.log('useElectronActivityTracker: トラッキング状況', {
          mouseMovements: metrics.mouseMovements,
          mouseClicks: metrics.mouseClicks,
          keystrokes: metrics.keystrokes,
          activityLevel: Math.round(activityLevel),
          currentApp: metrics.currentApp,
          workStatus: metrics.workStatus,
          timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000),
          focusScore: Math.round(newFocusScore),
          activeTime: Math.round(metrics.activeTime * 60), // 分単位で表示
          idleTime: Math.round(metrics.idleTime * 60), // 分単位で表示
          workStartTime: workStartTimeRef.current ? new Date(workStartTimeRef.current).toLocaleTimeString() : '未開始'
        });
      }
      
      // 作業状態に応じた処理
      if (metrics.workStatus === 'break' || metrics.workStatus === 'finished') {
        setCurrentFocusScore(0);
        return;
      } else if (metrics.workStatus === 'working') {
        // 作業中の場合のみ時間を計測
        const isIdle = timeSinceLastActivity > 30000; // 30秒以上活動なし
        
        setMetrics(prev => {
          const newMetrics = {
            ...prev,
            activeTime: prev.activeTime + (isIdle ? 0 : 1/60), // 1秒 = 1/60分（正確な計算）
            idleTime: prev.idleTime + (isIdle ? 1/60 : 0) // 1秒 = 1/60分（正確な計算）
          };

          // アプリ使用時間の更新（作業中の場合のみ）
          if (prev.currentApp && prev.workStatus === 'working') {
            setAppUsageMap(currentMap => {
              const newMap = new Map(currentMap);
              const currentTime = newMap.get(prev.currentApp) || 0;
              newMap.set(prev.currentApp, currentTime + 1/60); // 1秒 = 1/60分（正確な計算）
              return newMap;
            });
          }

          return newMetrics;
        });
      }

      setCurrentFocusScore(newFocusScore);

      // 集中度履歴の更新（期間別データ）
      const today = new Date();
      
      // 日別データの更新
      const todayName = today.toLocaleDateString('ja-JP', { 
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      });
      
      setDailyHistory(prev => {
        const newHistory = [...prev];
        const lastEntry = newHistory[newHistory.length - 1];
        
        if (lastEntry && lastEntry.time === todayName) {
          const updatedScore = Math.round(lastEntry.score * 0.9 + newFocusScore * 0.1);
          lastEntry.score = Math.max(0, Math.min(100, updatedScore)); // 0-100の範囲に制限
        } else {
          const clampedScore = Math.max(0, Math.min(100, newFocusScore)); // 0-100の範囲に制限
          newHistory.push({ time: todayName, score: clampedScore });
          if (newHistory.length > 7) newHistory.shift();
        }
        
        return newHistory;
      });

      // 月別データの更新
      const thisMonthName = today.toLocaleDateString('ja-JP', { 
        year: 'numeric',
        month: 'short'
      });
      
      setMonthlyHistory(prev => {
        const newHistory = [...prev];
        const lastEntry = newHistory[newHistory.length - 1];
        
        if (lastEntry && lastEntry.time === thisMonthName) {
          const updatedScore = Math.round(lastEntry.score * 0.95 + newFocusScore * 0.05);
          lastEntry.score = Math.max(0, Math.min(100, updatedScore)); // 0-100の範囲に制限
        } else {
          const clampedScore = Math.max(0, Math.min(100, newFocusScore)); // 0-100の範囲に制限
          newHistory.push({ time: thisMonthName, score: clampedScore });
          if (newHistory.length > 12) newHistory.shift();
        }
        
        return newHistory;
      });

      // 年別データの更新
      const thisYearName = `${today.getFullYear()}年`;
      
      setYearlyHistory(prev => {
        const newHistory = [...prev];
        const lastEntry = newHistory[newHistory.length - 1];
        
        if (lastEntry && lastEntry.time === thisYearName) {
          const updatedScore = Math.round(lastEntry.score * 0.99 + newFocusScore * 0.01);
          lastEntry.score = Math.max(0, Math.min(100, updatedScore)); // 0-100の範囲に制限
        } else {
          const clampedScore = Math.max(0, Math.min(100, newFocusScore)); // 0-100の範囲に制限
          newHistory.push({ time: thisYearName, score: clampedScore });
          if (newHistory.length > 5) newHistory.shift();
        }
        
        return newHistory;
      });

      // 現在の期間に応じてfocusHistoryを更新
      setFocusHistory(getCurrentPeriodData());

      // アプリ使用時間からアクティビティデータを生成
      const sortedApps = Array.from(appUsageMap.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4);

      const totalUsageTime = Array.from(appUsageMap.values()).reduce((sum, time) => sum + time, 0);
      
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
      
      setActivities(sortedApps.map(([appName, timeInSeconds], index) => ({
        category: appName,
        timeSpent: Math.round((timeInSeconds / 60) * 10) / 10, // 分に変換
        percentage: Math.round((timeInSeconds / Math.max(totalUsageTime, 1)) * 100),
        color: colors[index] || '#6B7280'
      })));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [focusSettings, metrics.workStatus]); // workStatusの変更を監視

  // 期間変更時にfocusHistoryを更新
  useEffect(() => {
    setFocusHistory(getCurrentPeriodData());
  }, [currentPeriod, dailyHistory, monthlyHistory, yearlyHistory]);

  // 初期化
  useEffect(() => {
    // 現在の日付を設定
    lastResetDate.current = new Date().toDateString();
    
    // 環境に応じてアプリ名を設定
    const initializeAppName = async () => {
      console.log('useElectronActivityTracker: 初期化開始 - Electron環境チェック:', !!window.electronAPI);
      
      if (window.electronAPI && typeof window.electronAPI.getCurrentActivity === 'function') {
        console.log('useElectronActivityTracker: Electron環境を検出');
        try {
          const activityData = await window.electronAPI.getCurrentActivity();
          console.log('useElectronActivityTracker: 初期化時のアプリ情報:', activityData);
          if (activityData && activityData.appName) {
            setMetrics(prev => ({
              ...prev,
              currentApp: activityData.appName,
              currentWindowTitle: activityData.windowTitle || ''
            }));
            console.log('useElectronActivityTracker: 初期アプリ名設定:', activityData.appName);
          } else {
            setMetrics(prev => ({
              ...prev,
              currentApp: '集中度ダッシュボード',
              currentWindowTitle: '集中度ダッシュボード'
            }));
          }
        } catch (error) {
          console.error('useElectronActivityTracker: 初期化時のアプリ情報取得エラー:', error);
          setMetrics(prev => ({
            ...prev,
            currentApp: '集中度ダッシュボード',
            currentWindowTitle: '集中度ダッシュボード'
          }));
        }
      } else {
        console.log('useElectronActivityTracker: ブラウザ環境を検出');
        setMetrics(prev => ({
          ...prev,
          currentApp: document.title || 'ブラウザ',
          currentWindowTitle: document.title || 'ブラウザ'
        }));
        console.log('ブラウザ: 初期アプリ名設定:', document.title);
      }
    };

    initializeAppName();
    
    // 期間別データを初期化
    setDailyHistory(generatePeriodData('daily'));
    setMonthlyHistory(generatePeriodData('monthly'));
    setYearlyHistory(generatePeriodData('yearly'));
    
    // 初期の集中度履歴を日別データに設定
    setFocusHistory(generatePeriodData('daily'));
  }, []);

  // TeamMemberオブジェクトの生成
  const generateTeamMember = (): TeamMember => {
    console.log('useElectronActivityTracker: generateTeamMember() 呼び出し');
    // 日付変更をチェック
    checkAndResetDailyStats();
    
    // 作業開始時間からの実際の経過時間を計算
    let actualWorkTime = 0;
    if (workStartTimeRef.current && metrics.workStatus === 'working') {
      const now = Date.now();
      actualWorkTime = (now - workStartTimeRef.current) / (1000 * 60); // 分単位
    }
    
    // 時間を分単位で計算（activeTimeとidleTimeは既に分単位）
    const totalMinutes = Math.round((metrics.activeTime + metrics.idleTime) * 60);
    const focusMinutes = Math.round(metrics.activeTime * 60);
    const breakMinutes = Math.round(metrics.idleTime * 60);

    // 作業状態に応じてアプリ名を調整
    let currentActivity = metrics.currentApp;
    if (metrics.workStatus === 'break') {
      currentActivity = '休憩中';
    } else if (metrics.workStatus === 'finished') {
      currentActivity = '作業終了';
    }

    // 作業状態に応じて集中度を調整（整数に丸める）
    let adjustedFocusScore = Math.round(currentFocusScore);
    // 休憩中や作業終了時でも集中度を0にしない（一時停止状態を表現）
    if (metrics.workStatus === 'break') {
      // 休憩中は最後の集中度を保持（一時停止状態）
      adjustedFocusScore = Math.round(currentFocusScore);
    } else if (metrics.workStatus === 'finished') {
      // 作業終了時のみ0にする
      adjustedFocusScore = 0;
    }

    // プロフィール情報からアバターを取得
    const getAvatarFromProfile = () => {
      const savedProfile = localStorage.getItem('user-profile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          return profile.avatar || '/avatars/current-user.jpg';
        } catch (error) {
          console.error('プロフィールの読み込みに失敗:', error);
        }
      }
      return '/avatars/current-user.jpg';
    };

    const teamMember = {
      id: 'current-user',
      name: displayName,
      focusScore: adjustedFocusScore,
      currentActivity,
      status: (Date.now() - lastActivityTime.current < 30000 ? 'online' : 'away') as 'online' | 'away' | 'offline',
      avatar: getAvatarFromProfile(),
      lastUpdate: new Date(),
      dailyStats: {
        totalHours: Math.max(actualWorkTime / 60, 0), // 実際の作業時間を時間に変換（最小値0に変更）
        focusHours: Math.max(focusMinutes / 60, 0), // 分を時間に変換
        breakHours: Math.max(breakMinutes / 60, 0) // 分を時間に変換
      },
      activities,
      focusHistory: getCurrentPeriodData(),
      todayGoal: todayGoal,
      yearlyGoal: yearlyGoal,
      isWorking: metrics.isWorking,
      workStatus: metrics.workStatus,
      isAdmin: isAdmin // 管理者権限を状態から取得
    };

    console.log('useElectronActivityTracker: generateTeamMember - workStatus:', teamMember.workStatus, 'metrics.workStatus:', metrics.workStatus);

    console.log('useElectronActivityTracker: generateTeamMember - 時間計算詳細:', {
      workStatus: teamMember.workStatus,
      workStartTime: workStartTimeRef.current ? new Date(workStartTimeRef.current).toLocaleTimeString() : '未開始',
      actualWorkTime: Math.round(actualWorkTime * 100) / 100, // 分単位（小数点2桁）
      totalHours: Math.round((actualWorkTime / 60) * 100) / 100, // 時間単位（小数点2桁）
      focusMinutes: focusMinutes,
      breakMinutes: breakMinutes
    });
    return teamMember;
  };

  // currentUserをuseMemoで最適化
  const currentUser = useMemo(() => {
    return generateTeamMember();
  }, [metrics.workStatus, metrics.currentApp, currentFocusScore, todayGoal, yearlyGoal, activities, dailyHistory, monthlyHistory, yearlyHistory, displayName, localStorage.getItem('user-profile'), isAdmin]);

  return {
    metrics,
    currentUser,
    focusScore: currentFocusScore,
    startWork,
    startBreak,
    finishWork,
    updateGoal,
    updateYearlyGoal,
    currentPeriod,
    handlePeriodChange,
    dailyHistory,
    monthlyHistory,
    yearlyHistory
  };
};