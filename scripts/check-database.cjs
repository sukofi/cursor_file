#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// データベースファイルのパス
const dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'vite-react-typescript-starter', 'focus-dashboard.db');

console.log('データベースパス:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('\n=== ユーザーテーブルの内容 ===');
  const users = db.prepare('SELECT * FROM users').all();
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`名前: ${user.name}`);
    console.log(`メール: ${user.email}`);
    console.log(`管理者: ${user.isAdmin ? 'YES' : 'NO'}`);
    console.log(`アクティブ: ${user.isActive ? 'YES' : 'NO'}`);
    console.log(`作成日: ${user.createdAt}`);
    console.log('---');
  });
  
  console.log('\n=== アクティビティテーブルの内容 ===');
  const activities = db.prepare('SELECT * FROM activities').all();
  activities.forEach(activity => {
    console.log(`ID: ${activity.id}`);
    console.log(`ユーザーID: ${activity.userId}`);
    console.log(`タイプ: ${activity.type}`);
    console.log(`開始時刻: ${activity.startTime}`);
    console.log(`終了時刻: ${activity.endTime}`);
    console.log('---');
  });
  
  console.log('\n=== ゴールテーブルの内容 ===');
  const goals = db.prepare('SELECT * FROM goals').all();
  goals.forEach(goal => {
    console.log(`ID: ${goal.id}`);
    console.log(`ユーザーID: ${goal.userId}`);
    console.log(`今日のゴール: ${goal.todayGoal}`);
    console.log(`年間ゴール: ${goal.yearlyGoal}`);
    console.log(`更新日: ${goal.updatedAt}`);
    console.log('---');
  });
  
  console.log('\n=== 統計テーブルの内容 ===');
  const stats = db.prepare('SELECT * FROM stats').all();
  stats.forEach(stat => {
    console.log(`ID: ${stat.id}`);
    console.log(`ユーザーID: ${stat.userId}`);
    console.log(`日付: ${stat.date}`);
    console.log(`総時間: ${stat.totalHours}`);
    console.log(`集中時間: ${stat.focusHours}`);
    console.log(`休憩時間: ${stat.breakHours}`);
    console.log('---');
  });
  
  db.close();
} catch (error) {
  console.error('データベースエラー:', error);
}
