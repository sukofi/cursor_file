import React, { useState, useEffect } from 'react';
import { X, Mail, Link, Copy, Check, Crown, RefreshCw, Users, Clock } from 'lucide-react';
import { emailService } from '../services/emailService';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InviteData {
  id: string;
  email: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'link' | 'manage'>('email');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);

    // 招待リンクを生成（完全に無効化）
  const generateInviteLink = async () => {
    try {
      // 完全にダミーリンク
      const link = `http://localhost:5173/invite/disabled-${Date.now()}`;
      setInviteLink(link);
      console.log('招待機能は現在無効化されています:', link);
    } catch (error) {
      console.error('招待リンク生成エラー:', error);
      const link = `http://localhost:5173/invite/disabled-${Date.now()}`;
      setInviteLink(link);
    }
  };

  // 招待一覧を読み込み（完全に無効化）
  const loadInvites = async () => {
    setIsLoadingInvites(true);
    try {
      // 完全にダミーデータ
      const dummyInvites = [
        {
          id: 'disabled-1',
          email: '機能無効化中',
          invitedBy: 'system',
          invitedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isUsed: false
        }
      ];
      setInvites(dummyInvites);
      console.log('招待機能は現在無効化されています');
    } catch (error) {
      console.error('招待一覧読み込みエラー:', error);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  // 招待を削除（完全に無効化）
  const deleteInvite = async (inviteId: string) => {
    if (!confirm('この招待を削除しますか？')) return;
    
    try {
      // 完全に無効化
      console.log('招待機能は現在無効化されています:', inviteId);
      alert('招待機能は現在メンテナンス中です');
      await loadInvites();
    } catch (error) {
      console.error('招待削除エラー:', error);
    }
  };

  // コンポーネントマウント時に招待リンクを生成
  useEffect(() => {
    if (isOpen && activeTab === 'link') {
      generateInviteLink();
    }
  }, [isOpen, activeTab]);

  // 招待管理タブが選択された時に招待一覧を読み込み
  useEffect(() => {
    if (isOpen && activeTab === 'manage') {
      loadInvites();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // 完全に無効化
        console.log('招待機能は現在無効化されています:', email);
        alert('招待機能は現在メンテナンス中です。後でお試しください。');
        setEmail('');
      } catch (error) {
        console.error('招待作成エラー:', error);
        alert('招待機能は現在利用できません');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // メール送信機能（無料のSendGridサービスを使用）
  const sendInviteEmail = async (email: string, inviteId: string) => {
    try {
      const baseUrl = window.location.origin;
      const inviteUrl = `${baseUrl}/invite/${inviteId}`;
      
      // 現在のユーザー名を取得
      const currentUserId = localStorage.getItem('userId');
      const currentUserName = localStorage.getItem('userName') || 'チームメンバー';
      
      const result = await emailService.sendInviteEmail({
        to: email,
        inviteUrl,
        invitedBy: currentUserName,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      
      if (!result.success) {
        throw new Error(result.message || 'メール送信に失敗しました');
      }
      
      return result;
    } catch (error) {
      console.error('メール送信エラー:', error);
      throw error;
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
          <button 
            onClick={() => setActiveTab('email')} 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'email' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Mail className="w-4 h-4 inline mr-2" />メール招待
          </button>
          <button 
            onClick={() => setActiveTab('link')} 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'link' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Link className="w-4 h-4 inline mr-2" />招待リンク
          </button>
          <button 
            onClick={() => setActiveTab('manage')} 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'manage' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Users className="w-4 h-4 inline mr-2" />招待管理
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
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
          ) : activeTab === 'link' ? (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-400">
                      招待機能は現在メンテナンス中です
                    </h3>
                    <div className="mt-2 text-sm text-yellow-300">
                      <p>現在、招待機能は利用できません。後でお試しください。</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-2">招待リンク（無効化中）</h3>
                  <p className="text-gray-400 text-sm">このリンクを共有して、チームメンバーに参加してもらいます。</p>
                </div>
                <button 
                  onClick={generateInviteLink}
                  className="p-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 cursor-not-allowed"
                  title="機能無効化中"
                  disabled
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <input type="text" value={inviteLink} readOnly className="flex-1 bg-transparent text-white text-sm mr-3 focus:outline-none" />
                  <button onClick={handleCopyLink} className="flex items-center gap-2 bg-gray-500 text-white px-3 py-2 rounded-lg cursor-not-allowed text-sm" disabled>
                    {copied ? (<><Check className="w-4 h-4" />コピー完了</>) : (<><Copy className="w-4 h-4" />コピー</>)}
                  </button>
                </div>
              </div>
              <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
                <h4 className="text-gray-400 font-semibold text-sm mb-2">機能無効化中</h4>
                <p className="text-gray-400 text-sm">招待機能は現在メンテナンス中です。後でお試しください。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-2">招待管理</h3>
                  <p className="text-gray-400 text-sm">送信した招待の状況を確認できます。</p>
                </div>
                <button 
                  onClick={loadInvites}
                  className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                  disabled={isLoadingInvites}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingInvites ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {isLoadingInvites ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                  <p className="text-gray-400 mt-2">読み込み中...</p>
                </div>
              ) : invites.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">まだ招待はありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div key={invite.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-medium">{invite.email}</span>
                            {invite.isUsed && (
                              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">使用済み</span>
                            )}
                            {isExpired(invite.expiresAt) && (
                              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">期限切れ</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>招待日: {formatDate(invite.invitedAt)}</span>
                            <span>期限: {formatDate(invite.expiresAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteInvite(invite.id)}
                            className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-200"
                            title="削除"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
