import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Timer, Settings, Volume2, VolumeX } from 'lucide-react';

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  work: number; // 分
  shortBreak: number; // 分
  longBreak: number; // 分
  longBreakInterval: number; // 何セット後に長い休憩
  soundEnabled: boolean;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ isOpen, onClose, settings }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分を秒で
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    soundEnabled: true
  });

  const getTimeString = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeName = (mode: TimerMode) => {
    switch (mode) {
      case 'work': return '作業時間';
      case 'shortBreak': return '短い休憩';
      case 'longBreak': return '長い休憩';
    }
  };

  const getModeColor = (mode: TimerMode) => {
    switch (mode) {
      case 'work': return 'text-red-400';
      case 'shortBreak': return 'text-green-400';
      case 'longBreak': return 'text-blue-400';
    }
  };

  const getModeBgColor = (mode: TimerMode) => {
    switch (mode) {
      case 'work': return 'bg-red-500/20';
      case 'shortBreak': return 'bg-green-500/20';
      case 'longBreak': return 'bg-blue-500/20';
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerSettings[currentMode] * 60);
  };

  const playNotificationSound = () => {
    if (settings?.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const showNotificationPopup = (message: string) => {
    if (settings?.notificationsEnabled) {
      setNotificationMessage(message);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const sendDesktopNotification = (title: string, message: string) => {
    if (settings?.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            });
          }
        });
      }
    }
  };

  const switchMode = (mode: TimerMode) => {
    setCurrentMode(mode);
    setIsRunning(false);
    setTimeLeft(timerSettings[mode] * 60);
  };

  const nextMode = () => {
    if (currentMode === 'work') {
      const nextBreak = (completedSessions + 1) % timerSettings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      setCurrentMode(nextBreak);
      setTimeLeft(timerSettings[nextBreak] * 60);
      
      const breakMessage = nextBreak === 'longBreak' ? '長い休憩の時間です！' : '短い休憩の時間です！';
      showNotificationPopup(breakMessage);
      sendDesktopNotification('ポモドーロタイマー', breakMessage);
      playNotificationSound();
    } else {
      setCurrentMode('work');
      setTimeLeft(timerSettings.work * 60);
      setCompletedSessions(prev => prev + 1);
      
      const workMessage = '作業を再開しましょう！';
      showNotificationPopup(workMessage);
      sendDesktopNotification('ポモドーロタイマー', workMessage);
      playNotificationSound();
    }
    setIsRunning(false);
  };

  // タイマーの実行
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // タイマー終了
            const modeName = getModeName(currentMode);
            const message = `${modeName}が完了しました！`;
            
            showNotificationPopup(message);
            sendDesktopNotification('ポモドーロタイマー', message);
            playNotificationSound();
            
            setIsRunning(false);
            nextMode();
            return timerSettings[currentMode] * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentMode, timerSettings]);

  // 初期化時にタイマー設定を更新
  useEffect(() => {
    setTimeLeft(timerSettings[currentMode] * 60);
  }, [currentMode, timerSettings]);

  // 通知権限の要求
  useEffect(() => {
    if (settings?.notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings?.notificationsEnabled]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Timer className="w-5 h-5" />
              ポモドーロタイマー
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* モード選択 */}
          <div className="flex gap-2 mb-6">
            {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => switchMode(mode)}
                className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                  currentMode === mode
                    ? `${getModeBgColor(mode)} ${getModeColor(mode)}`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {getModeName(mode)}
              </button>
            ))}
          </div>

          {/* タイマー表示 */}
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold mb-2 ${getModeColor(currentMode)}`}>
              {getTimeString(timeLeft)}
            </div>
            <div className="text-gray-400">
              {getModeName(currentMode)} - {completedSessions}セッション完了
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="flex gap-3 mb-6">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                開始
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg transition-colors"
              >
                <Pause className="w-5 h-5" />
                一時停止
              </button>
            )}
            <button
              onClick={resetTimer}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* 設定ボタン */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            タイマー設定
          </button>

          {/* 設定パネル */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-3">タイマー設定</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">作業時間 (分)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={timerSettings.work}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, work: parseInt(e.target.value) || 25 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">短い休憩 (分)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={timerSettings.shortBreak}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">長い休憩 (分)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={timerSettings.longBreak}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">長い休憩の間隔 (セット)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={timerSettings.longBreakInterval}
                    onChange={(e) => setTimerSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) || 4 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 通知設定の表示 */}
          <div className="mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              {settings?.soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
              <span>サウンド: {settings?.soundEnabled ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {settings?.notificationsEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
              <span>通知: {settings?.notificationsEnabled ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 通知ポップアップ */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            <span>{notificationMessage}</span>
          </div>
        </div>
      )}

      {/* 音声ファイル */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>
    </>
  );
};
