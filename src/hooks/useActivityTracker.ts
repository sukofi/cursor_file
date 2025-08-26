import { useState, useEffect, useRef } from 'react';
import { TeamMember, ActivityData, FocusPoint } from '../types';

interface ActivityMetrics {
  mouseMovements: number;
  mouseClicks: number;
  keystrokes: number;
  activeTime: number;
  idleTime: number;
  currentApp: string;
  urlChanges: number;
}

export const useActivityTracker = (userName: string) => {
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    mouseMovements: 0,
    mouseClicks: 0,
    keystrokes: 0,
    activeTime: 0,
    idleTime: 0,
    currentApp: 'ブラウザ - 集中度ダッシュボード',
    urlChanges: 0
  });

  const [focusHistory, setFocusHistory] = useState<FocusPoint[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [currentFocusScore, setCurrentFocusScore] = useState(85);

  const lastActivityTime = useRef(Date.now());
  const startTime = useRef(Date.now());
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout>();

  // マウス移動の追跡
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mousePositionRef.current.x, 2) +
        Math.pow(e.clientY - mousePositionRef.current.y, 2)
      );
      
      if (distance > 5) { // 小さな動きは無視
        setMetrics(prev => ({
          ...prev,
          mouseMovements: prev.mouseMovements + 1
        }));
        lastActivityTime.current = Date.now();
      }
      
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseClick = () => {
      setMetrics(prev => ({
        ...prev,
        mouseClicks: prev.mouseClicks + 1
      }));
      lastActivityTime.current = Date.now();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
    };
  }, []);

  // キーボード入力の追跡
  useEffect(() => {
    const handleKeyPress = () => {
      setMetrics(prev => ({
        ...prev,
        keystrokes: prev.keystrokes + 1
      }));
      lastActivityTime.current = Date.now();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // URL変更の追跡
  useEffect(() => {
    const handleUrlChange = () => {
      setMetrics(prev => ({
        ...prev,
        urlChanges: prev.urlChanges + 1
      }));
    };

    // ページの可視性変更を監視
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setMetrics(prev => ({
          ...prev,
          currentApp: 'その他のアプリケーション'
        }));
      } else {
        setMetrics(prev => ({
          ...prev,
          currentApp: 'ブラウザ - 集中度ダッシュボード'
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // 集中度スコアの計算
  const calculateFocusScore = (metrics: ActivityMetrics): number => {
    const now = Date.now();
    const totalTime = (now - startTime.current) / 1000 / 60; // 分単位
    const timeSinceLastActivity = (now - lastActivityTime.current) / 1000; // 秒単位

    // アクティビティレベルの計算
    const mouseActivity = Math.min(metrics.mouseMovements / Math.max(totalTime, 1), 50);
    const keyboardActivity = Math.min(metrics.keystrokes / Math.max(totalTime, 1), 100);
    const clickActivity = Math.min(metrics.mouseClicks / Math.max(totalTime, 1), 20);

    // アイドル時間のペナルティ
    const idlePenalty = Math.min(timeSinceLastActivity / 60, 50); // 最大50点減点

    // 基本スコア計算
    let score = 50; // ベーススコア
    score += mouseActivity * 0.3;
    score += keyboardActivity * 0.4;
    score += clickActivity * 0.3;
    score -= idlePenalty;

    // アプリケーションボーナス
    if (metrics.currentApp.includes('ダッシュボード')) {
      score += 10; // 作業関連アプリのボーナス
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // 定期的なデータ更新
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const totalTime = (now - startTime.current) / 1000 / 60;
      const timeSinceLastActivity = (now - lastActivityTime.current) / 1000;

      setMetrics(prev => {
        const newMetrics = {
          ...prev,
          activeTime: timeSinceLastActivity < 30 ? totalTime : prev.activeTime,
          idleTime: timeSinceLastActivity >= 30 ? totalTime - prev.activeTime : prev.idleTime
        };

        const focusScore = calculateFocusScore(newMetrics);
        setCurrentFocusScore(focusScore);

        // 集中度履歴の更新（5分ごと）
        const currentTime = new Date().toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        setFocusHistory(prev => {
          const newHistory = [...prev];
          if (newHistory.length === 0 || 
              new Date().getMinutes() % 5 === 0 && 
              newHistory[newHistory.length - 1]?.time !== currentTime) {
            newHistory.push({ time: currentTime, score: focusScore });
            if (newHistory.length > 8) newHistory.shift();
          }
          return newHistory;
        });

        return newMetrics;
      });

      // アクティビティデータの更新
      setActivities([
        {
          category: 'ダッシュボード操作',
          timeSpent: Math.round((totalTime * 0.6) * 10) / 10,
          percentage: 60,
          color: '#3B82F6'
        },
        {
          category: 'データ分析',
          timeSpent: Math.round((totalTime * 0.25) * 10) / 10,
          percentage: 25,
          color: '#10B981'
        },
        {
          category: 'UI操作',
          timeSpent: Math.round((totalTime * 0.1) * 10) / 10,
          percentage: 10,
          color: '#F59E0B'
        },
        {
          category: 'その他',
          timeSpent: Math.round((totalTime * 0.05) * 10) / 10,
          percentage: 5,
          color: '#8B5CF6'
        }
      ]);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 初期の集中度履歴を設定
  useEffect(() => {
    const initialHistory: FocusPoint[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      initialHistory.push({
        time: time.toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        score: 85 + Math.random() * 10 - 5 // 80-90の範囲でランダム
      });
    }
    setFocusHistory(initialHistory);
  }, []);

  // TeamMemberオブジェクトの生成
  const generateTeamMember = (): TeamMember => {
    const totalHours = Math.round((metrics.activeTime + metrics.idleTime) * 10) / 10;
    const focusHours = Math.round(metrics.activeTime * 10) / 10;
    const breakHours = Math.round(metrics.idleTime * 10) / 10;

    return {
      id: 'current-user',
      name: userName,
      focusScore: currentFocusScore,
      currentActivity: metrics.currentApp,
      status: Date.now() - lastActivityTime.current < 30000 ? 'online' : 'away',
      avatar: '/avatars/current-user.jpg',
      lastUpdate: new Date(),
      dailyStats: {
        totalHours: Math.max(totalHours, 0.1),
        focusHours: Math.max(focusHours, 0),
        breakHours: Math.max(breakHours, 0)
      },
      activities,
      focusHistory
    };
  };

  return {
    metrics,
    currentUser: generateTeamMember(),
    focusScore: currentFocusScore
  };
};