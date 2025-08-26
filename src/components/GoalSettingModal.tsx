import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: string) => void;
  currentGoal: string;
  userName: string;
}

export const GoalSettingModal: React.FC<GoalSettingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentGoal,
  userName
}) => {
  const [goal, setGoal] = useState(currentGoal);

  useEffect(() => {
    setGoal(currentGoal);
  }, [currentGoal]);

  const handleSave = () => {
    onSave(goal);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {userName}の今日の目標設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">
            今日の目標
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="今日の目標を入力してください..."
            className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
