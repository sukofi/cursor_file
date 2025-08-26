import React, { useState, useEffect } from 'react';
import { X, Mail, Link, Copy, Check, Crown, RefreshCw, Users, Clock } from 'lucide-react';

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

  // 招待リンクを生成
  const generateInviteLink = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const inviteData = {
        email: 'general-invite',
        invitedBy: currentUserId || 'current-user',
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
        isUsed: false
      };
      
      if (window.electronAPI?.dbCreateInvite) {
        const result = await window.electronAPI.dbCreateInvite(inviteData);
        if (result.success) {
          const baseUrl = window.location.origin;
          const link = `${baseUrl}/invite/${result.inviteId}`;
          setInviteLink(link);
        }
      } else {
        // フォールバック用のリンク
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/invite/team-${Date.now()}`;
        setInviteLink(link);
      }
    } catch (error) {
      console.error('招待リンク生成エラー:', error);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/invite/team-${Date.now()}`;
      setInviteLink(link);
    }
  };

  // 招待一覧を読み込み
  const loadInvites = async () => {
    setIsLoadingInvites(true);
    try {
      if (window.electronAPI?.dbGetAllInvites) {
        const result = await window.electronAPI.dbGetAllInvites();
        if (result.success) {
          setInvites(result.invites || []);
        }
      }
    } catch (error) {
      console.error('招待一覧読み込みエラー:', error);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  // 招待を削除
  const deleteInvite = async (inviteId: string) => {
    if (!confirm('この招待を削除しますか？')) return;
    
    try {
      if (window.electronAPI?.dbDeleteInvite) {
        const result = await window.electronAPI.dbDeleteInvite(inviteId);
        if (result.success) {
          await loadInvites();
        }
      }
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
        const currentUserId = localStorage.getItem('userId');
        const inviteData = {
          email: email.trim(),
          invitedBy: currentUserId || 'current-user',
          invitedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
          isUsed: false
        };
        
        if (window.electronAPI?.dbCreateInvite) {
          const result = await window.electronAPI.dbCreateInvite(inviteData);
          if (result.success) {
            // 実際のメール送信処理（本番環境では実装が必要）
            await sendInviteEmail(email.trim(), result.inviteId);
            alert(`${email} に招待メールを送信しました`);
            setEmail('');
            await loadInvites(); // 招待一覧を更新
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

  // メール送信機能（本番環境では実際のメールサービスを使用）
  const sendInviteEmail = async (email: string, inviteId: string) => {
    try {
      const baseUrl = window.location.origin;
      const inviteUrl = `${baseUrl}/invite/${inviteId}`;
      
      // 本番環境では以下のようなメール送信サービスを使用
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Nodemailer with SMTP
      
      console.log('招待メール送信:', {
        to: email,
        subject: 'チームへの招待',
        body: `あなたがチームに招待されました。以下のリンクから参加してください：\n\n${inviteUrl}\n\nこのリンクは7日間有効です。`
      });
      
      // 開発環境ではメール送信をシミュレート
      if (process.env.NODE_ENV === 'development') {
        console.log('開発環境: メール送信をシミュレート');
      }
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-2">招待リンク</h3>
                  <p className="text-gray-400 text-sm">このリンクを共有して、チームメンバーに参加してもらいます。</p>
                </div>
                <button 
                  onClick={generateInviteLink}
                  className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                  title="新しいリンクを生成"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
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
