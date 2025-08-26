// メール送信サービス
// 無料版のSendGridを使用

interface EmailConfig {
  apiKey?: string;
  fromEmail?: string;
  appUrl?: string;
}

interface InviteEmailData {
  to: string;
  inviteUrl: string;
  invitedBy: string;
  expiresAt: Date;
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig = {}) {
    this.config = {
      apiKey: process.env.SENDGRID_API_KEY || config.apiKey,
      fromEmail: process.env.MAIL_FROM || config.fromEmail || 'noreply@taskrog.com',
      appUrl: process.env.APP_URL || config.appUrl || 'http://localhost:5173',
      ...config
    };
  }

  // 招待メールを送信
  async sendInviteEmail(data: InviteEmailData): Promise<{ success: boolean; message?: string }> {
    try {
      // 開発環境ではメール送信をシミュレート
      if (process.env.NODE_ENV === 'development' || !this.config.apiKey) {
        console.log('開発環境: メール送信をシミュレート');
        console.log('招待メール送信:', {
          to: data.to,
          subject: 'チームへの招待',
          inviteUrl: data.inviteUrl,
          invitedBy: data.invitedBy,
          expiresAt: data.expiresAt
        });
        return { success: true, message: '開発環境: メール送信をシミュレートしました' };
      }

      // SendGridを使用したメール送信
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.config.apiKey);

      const msg = {
        to: data.to,
        from: this.config.fromEmail,
        subject: 'チームへの招待 - Task ROG',
        html: this.generateInviteEmailHTML(data),
        text: this.generateInviteEmailText(data)
      };

      await sgMail.send(msg);
      return { success: true, message: '招待メールを送信しました' };

    } catch (error) {
      console.error('メール送信エラー:', error);
      return { 
        success: false, 
        message: error.response?.body?.errors?.[0]?.message || 'メール送信に失敗しました' 
      };
    }
  }

  // HTML形式の招待メール
  private generateInviteEmailHTML(data: InviteEmailData): string {
    const expiresDate = new Date(data.expiresAt).toLocaleDateString('ja-JP');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>チームへの招待</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Task ROG チームへの招待</h1>
            <p>集中度管理アプリケーション</p>
          </div>
          <div class="content">
            <h2>こんにちは！</h2>
            <p><strong>${data.invitedBy}</strong>さんがあなたをTask ROGチームに招待しました。</p>
            
            <div class="highlight">
              <p><strong>Task ROG</strong>は、チームの集中度と作業効率を管理するアプリケーションです。</p>
              <ul>
                <li>📊 リアルタイム集中度トラッキング</li>
                <li>👥 チームメンバーの作業状況確認</li>
                <li>🎯 目標設定と進捗管理</li>
                <li>⏰ ポモドーロタイマー機能</li>
              </ul>
            </div>

            <p>以下のボタンをクリックして、チームに参加してください：</p>
            
            <div style="text-align: center;">
              <a href="${data.inviteUrl}" class="button">チームに参加する</a>
            </div>

            <p><strong>重要:</strong> この招待リンクは <strong>${expiresDate}</strong> まで有効です。</p>
            
            <p>このメールに心当たりがない場合は、無視していただいて構いません。</p>
          </div>
          <div class="footer">
            <p>Task ROG - チームの集中度管理</p>
            <p>このメールは自動送信されています。返信はできません。</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // テキスト形式の招待メール
  private generateInviteEmailText(data: InviteEmailData): string {
    const expiresDate = new Date(data.expiresAt).toLocaleDateString('ja-JP');
    
    return `
Task ROG チームへの招待

こんにちは！

${data.invitedBy}さんがあなたをTask ROGチームに招待しました。

Task ROGは、チームの集中度と作業効率を管理するアプリケーションです。

以下のリンクからチームに参加してください：
${data.inviteUrl}

この招待リンクは ${expiresDate} まで有効です。

このメールに心当たりがない場合は、無視していただいて構いません。

---
Task ROG - チームの集中度管理
このメールは自動送信されています。
    `;
  }

  // メール送信設定をテスト
  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.config.apiKey) {
        return { success: false, message: 'SendGrid APIキーが設定されていません' };
      }

      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.config.apiKey);

      // テストメールを送信
      const msg = {
        to: 'test@example.com',
        from: this.config.fromEmail,
        subject: 'Task ROG - メール設定テスト',
        text: 'メール送信設定が正常に動作しています。'
      };

      await sgMail.send(msg);
      return { success: true, message: 'メール送信設定が正常です' };

    } catch (error) {
      console.error('メール設定テストエラー:', error);
      return { 
        success: false, 
        message: error.response?.body?.errors?.[0]?.message || 'メール設定テストに失敗しました' 
      };
    }
  }
}

// シングルトンインスタンス
export const emailService = new EmailService();

// 型定義
export interface InviteData {
  to: string;
  inviteUrl: string;
  invitedBy: string;
  expiresAt: Date;
}
