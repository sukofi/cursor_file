import React, { useState } from 'react';
import { X, Mail, Link, Copy, Check, Crown } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'link'>('email');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteLink] = useState('https://your-app.com/invite/team-123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        if (window.electronAPI && typeof window.electronAPI.dbCreateInvite === 'function') {
          const inviteData = {
            email: email.trim(),
            invitedBy: 'current-user', // 実際のユーザーIDに置き換える必要があります
            invitedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
            isUsed: false
          };
          
          const result = await window.electronAPI.dbCreateInvite(inviteData);
          if (result.success) {
            alert(`${email} に招待メールを送信しました`);
            setEmail('');
          } else {
            alert('招待の作成に失敗しました');
          }
        } else {
          console.log('招待メールを送信:', email);
          alert(`${email} に招待メールを送信しました`);
          setEmail('');
        }
      } catch (error) {
        console.error('招待作成エラー:', error);
        alert('招待の作成中にエラーが発生しました');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('リンクのコピーに失敗しました:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-white/20 max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            メンバーを追加
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex border-b border-white/10">
          <button onClick={() => setActiveTab('email')} className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'email' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>
            <Mail className="w-4 h-4 inline mr-2" />メール招待
          </button>
          <button onClick={() => setActiveTab('link')} className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'link' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>
            <Link className="w-4 h-4 inline mr-2" />招待リンク
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'email' ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">メールで招待</h3>
                <p className="text-gray-400 text-sm mb-4">チームメンバーのメールアドレスを入力して、直接招待メールを送信します。</p>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-gray-300 text-sm mb-2">メールアドレス</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="example@company.com" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                <button 
                  type="submit" 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isSubmitting 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '送信中...' : '招待メールを送信'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">招待リンク</h3>
                <p className="text-gray-400 text-sm mb-4">このリンクを共有して、チームメンバーに参加してもらいます。</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <input type="text" value={inviteLink} readOnly className="flex-1 bg-transparent text-white text-sm mr-3 focus:outline-none" />
                  <button onClick={handleCopyLink} className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    {copied ? (<><Check className="w-4 h-4" />コピー完了</>) : (<><Copy className="w-4 h-4" />コピー</>)}
                  </button>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold text-sm mb-2">リンクの有効期限</h4>
                <p className="text-gray-300 text-sm">この招待リンクは7日間有効です。期限が切れた場合は新しいリンクを生成してください。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
