import React, { useState } from 'react';
import { Play, Coffee, CheckCircle, X, Loader2 } from 'lucide-react';

interface StatusSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusSelect: (status: 'working' | 'break' | 'finished') => void;
}

export const StatusSelectionModal: React.FC<StatusSelectionModalProps> = ({
  isOpen,
  onClose,
  onStatusSelect
}) => {
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleStatusSelect = async (status: 'working' | 'break' | 'finished') => {
    setLoadingStatus(status);
    try {
      await onStatusSelect(status);
    } finally {
      setLoadingStatus(null);
    }
  };

  const statusOptions = [
    {
      id: 'working',
      title: '作業開始',
      description: '集中して作業を開始します',
      icon: Play,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      id: 'break',
      title: '休憩開始',
      description: '少し休憩を取ります',
      icon: Coffee,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      id: 'finished',
      title: '作業終了',
      description: '今日の作業を終了します',
      icon: CheckCircle,
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            今日の作業を開始しましょう
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 説明文 */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          どの状態で開始しますか？
        </p>

        {/* ステータス選択ボタン */}
        <div className="space-y-3">
          {statusOptions.map((option) => {
            const IconComponent = option.icon;
            const isLoading = loadingStatus === option.id;
            const isDisabled = loadingStatus !== null;
            
            return (
              <button
                key={option.id}
                onClick={() => handleStatusSelect(option.id as 'working' | 'break' | 'finished')}
                disabled={isDisabled}
                className={`w-full p-4 rounded-lg flex items-center space-x-4 transition-all duration-200 ${option.color} ${option.textColor} hover:scale-105 hover:shadow-lg ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <IconComponent size={24} />
                )}
                <div className="text-left">
                  <div className="font-semibold">
                    {isLoading ? '処理中...' : option.title}
                  </div>
                  <div className="text-sm opacity-90">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 後で選択ボタン */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            後で選択する
          </button>
        </div>
      </div>
    </div>
  );
};
