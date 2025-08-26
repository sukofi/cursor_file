import React, { useState, useRef } from 'react';
import { X, Save, Volume2, VolumeX, Bell, BellOff, Clock, User, Palette, Camera, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    autoResetDaily: boolean;
    focusThreshold: number;
  };
  onSettingsChange: (settings: any) => void;
  profile: {
    displayName: string;
    avatar: string;
    email: string;
    password: string;
    newPassword: string;
    confirmPassword: string;
  };
  onProfileUpdate: (profile: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  profile,
  onProfileUpdate
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [localProfile, setLocalProfile] = useState(profile);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onProfileUpdate(localProfile);
    onClose();
  };

  const updateProfile = (key: string, value: any) => {
    setLocalProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateProfile('avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const updateSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 settings-modal">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5" />
            設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* プロフィール設定 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4" />
              プロフィール設定
            </h3>
            
            <div className="space-y-4">
              {/* アバター設定 */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={localProfile.avatar}
                    alt="アバター"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-300 text-sm mb-1">表示名</label>
                  <input
                    type="text"
                    value={localProfile.displayName}
                    onChange={(e) => updateProfile('displayName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="表示名を入力"
                  />
                </div>
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={localProfile.email}
                  onChange={(e) => updateProfile('email', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="メールアドレスを入力"
                />
              </div>

              {/* パスワード変更 */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-white">パスワード変更</h4>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-1">現在のパスワード</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={localProfile.password}
                      onChange={(e) => updateProfile('password', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-10"
                      placeholder="現在のパスワードを入力"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">新しいパスワード</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={localProfile.newPassword}
                      onChange={(e) => updateProfile('newPassword', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-10"
                      placeholder="新しいパスワードを入力"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">新しいパスワード（確認）</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={localProfile.confirmPassword}
                      onChange={(e) => updateProfile('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-10"
                      placeholder="新しいパスワードを再入力"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {localProfile.newPassword && localProfile.confirmPassword && (
                  <div className={`text-sm ${localProfile.newPassword === localProfile.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                    {localProfile.newPassword === localProfile.confirmPassword ? 'パスワードが一致しています' : 'パスワードが一致しません'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 通知設定 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4" />
              通知設定
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {localSettings.soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                  <span className="text-gray-300">サウンド</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {localSettings.notificationsEnabled ? <Bell className="w-4 h-4 text-green-400" /> : <BellOff className="w-4 h-4 text-red-400" />}
                  <span className="text-gray-300">デスクトップ通知</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notificationsEnabled}
                    onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 自動化設定 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              自動化設定
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">日次統計の自動リセット</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoResetDaily}
                    onChange={(e) => updateSetting('autoResetDaily', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 集中度設定 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Palette className="w-4 h-4" />
              集中度設定
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  集中度の閾値 ({localSettings.focusThreshold}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localSettings.focusThreshold}
                  onChange={(e) => updateSetting('focusThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>


        </div>

        <div className="flex gap-3 mt-6">
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
