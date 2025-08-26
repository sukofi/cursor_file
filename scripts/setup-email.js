#!/usr/bin/env node

/**
 * メール送信サービス設定テストスクリプト
 * 使用方法: node scripts/setup-email.js
 */

import { emailService } from '../src/services/emailService.ts';

async function testEmailSetup() {
  console.log('📧 メール送信サービス設定テスト');
  console.log('=====================================');
  
  // 環境変数の確認
  console.log('\n🔍 環境変数確認:');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '設定済み' : '未設定');
  console.log('MAIL_FROM:', process.env.MAIL_FROM || '未設定');
  console.log('APP_URL:', process.env.APP_URL || '未設定');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  
  // メール送信テスト
  console.log('\n🧪 メール送信テスト:');
  try {
    const result = await emailService.sendInviteEmail({
      to: 'test@example.com',
      inviteUrl: 'https://example.com/invite/test123',
      invitedBy: 'テストユーザー',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    if (result.success) {
      console.log('✅ メール送信テスト成功:', result.message);
    } else {
      console.log('❌ メール送信テスト失敗:', result.message);
    }
  } catch (error) {
    console.log('❌ メール送信テストエラー:', error.message);
  }
  
  // 接続テスト
  console.log('\n🔗 接続テスト:');
  try {
    const testResult = await emailService.testConnection();
    if (testResult.success) {
      console.log('✅ 接続テスト成功:', testResult.message);
    } else {
      console.log('❌ 接続テスト失敗:', testResult.message);
    }
  } catch (error) {
    console.log('❌ 接続テストエラー:', error.message);
  }
  
  console.log('\n📋 設定手順:');
  console.log('1. SendGridでアカウント作成: https://sendgrid.com/');
  console.log('2. APIキーを生成: Settings → API Keys → Create API Key');
  console.log('3. 環境変数を設定: SENDGRID_API_KEY=your_api_key');
  console.log('4. 送信元メールを設定: MAIL_FROM=noreply@yourdomain.com');
}

// スクリプト実行
testEmailSetup().catch(console.error);
