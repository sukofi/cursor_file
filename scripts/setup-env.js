#!/usr/bin/env node

/**
 * 環境変数設定支援スクリプト
 * 使用方法: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🔧 環境変数設定支援');
  console.log('========================');
  
  console.log('\n📧 メール送信サービスを選択してください:');
  console.log('1. SendGrid (推奨) - 月100通まで無料');
  console.log('2. Mailgun - 月5,000通まで無料（3ヶ月間）');
  console.log('3. Resend - 月3,000通まで無料');
  console.log('4. Brevo - 月300通まで無料');
  
  const serviceChoice = await question('\n選択 (1-4): ');
  
  let envContent = '# 環境変数設定\n';
  envContent += `NODE_ENV=${process.env.NODE_ENV || 'development'}\n\n`;
  
  switch (serviceChoice) {
    case '1':
      console.log('\n📋 SendGrid設定:');
      console.log('1. https://sendgrid.com/ でアカウント作成');
      console.log('2. Settings → API Keys → Create API Key');
      console.log('3. キー名を入力（例：Task ROG Invites）');
      console.log('4. Full Access または Restricted Access で Mail Send を選択');
      console.log('5. Create & View でAPIキーをコピー');
      
      const sendgridKey = await question('\nSendGrid APIキーを入力: ');
      const sendgridFrom = await question('送信元メールアドレス (例: noreply@yourdomain.com): ');
      const appUrl = await question('アプリケーションURL (例: https://yourdomain.com): ');
      
      envContent += `# SendGrid設定\n`;
      envContent += `SENDGRID_API_KEY=${sendgridKey}\n`;
      envContent += `MAIL_FROM=${sendgridFrom}\n`;
      envContent += `APP_URL=${appUrl}\n`;
      break;
      
    case '2':
      console.log('\n📋 Mailgun設定:');
      console.log('1. https://www.mailgun.com/ でアカウント作成');
      console.log('2. API Keys セクションでキーを確認');
      console.log('3. ドメインを設定');
      
      const mailgunKey = await question('\nMailgun APIキーを入力: ');
      const mailgunDomain = await question('Mailgunドメイン (例: mg.yourdomain.com): ');
      const mailgunFrom = await question('送信元メールアドレス: ');
      
      envContent += `# Mailgun設定\n`;
      envContent += `MAILGUN_API_KEY=${mailgunKey}\n`;
      envContent += `MAILGUN_DOMAIN=${mailgunDomain}\n`;
      envContent += `MAIL_FROM=${mailgunFrom}\n`;
      break;
      
    case '3':
      console.log('\n📋 Resend設定:');
      console.log('1. https://resend.com/ でアカウント作成');
      console.log('2. API Keys セクションでキーを生成');
      
      const resendKey = await question('\nResend APIキーを入力: ');
      const resendFrom = await question('送信元メールアドレス: ');
      
      envContent += `# Resend設定\n`;
      envContent += `RESEND_API_KEY=${resendKey}\n`;
      envContent += `MAIL_FROM=${resendFrom}\n`;
      break;
      
    case '4':
      console.log('\n📋 Brevo設定:');
      console.log('1. https://www.brevo.com/ でアカウント作成');
      console.log('2. SMTP & API → API Keys → Generate a new API key');
      
      const brevoKey = await question('\nBrevo APIキーを入力: ');
      const brevoFrom = await question('送信元メールアドレス: ');
      
      envContent += `# Brevo設定\n`;
      envContent += `BREVO_API_KEY=${brevoKey}\n`;
      envContent += `MAIL_FROM=${brevoFrom}\n`;
      break;
      
    default:
      console.log('❌ 無効な選択です');
      rl.close();
      return;
  }
  
  // .envファイルに保存
  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ 環境変数設定完了！');
  console.log(`📁 設定ファイル: ${envPath}`);
  console.log('\n🚀 次のコマンドでテストしてください:');
  console.log('npm run test:email');
  
  rl.close();
}

// スクリプト実行
if (require.main === module) {
  setupEnvironment().catch(console.error);
}

module.exports = { setupEnvironment };
