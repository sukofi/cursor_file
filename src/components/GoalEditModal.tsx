import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface GoalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: string) => void;
  currentGoal?: string;
  memberName: string;
}

export const GoalEditModal: React.FC<GoalEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentGoal = '',
  memberName
}) => {
  const [goal, setGoal] = useState(currentGoal);

  useEffect(() => {
    setGoal(currentGoal);
  }, [currentGoal]);

  const handleSave = () => {
    onSave(goal.trim());
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-white/20 p-6 w-full max-w-md">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">
            {memberName}の今日の目標
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 入力フィールド */}
        <div className="mb-6">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="今日の目標を入力してください..."
            className="w-full h-24 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-yellow-400 transition-colors duration-200"
            autoFocus
          />
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
