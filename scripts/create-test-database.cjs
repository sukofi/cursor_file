#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const os = require('os');

// データベースファイルのパス
const userDataPath = path.join(os.homedir(), 'Library', 'Application Support', 'vite-react-typescript-starter');
const dbPath = path.join(userDataPath, 'focus-dashboard.db');

console.log('=== SQLiteデータベースの手動作成 ===');
console.log(`データベースファイルの場所: ${dbPath}`);

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
  console.log('✅ ユーザーデータディレクトリを作成しました');
}

try {
  // データベースを作成
  const db = new Database(dbPath);
  console.log('✅ データベース接続成功');

  // テーブルを作成
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT,
      isAdmin BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastLoginAt DATETIME
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      appName TEXT NOT NULL,
      windowTitle TEXT,
      focusScore INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      todayGoal TEXT,
      yearlyGoal TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS stats (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      totalHours REAL DEFAULT 0,
      focusHours REAL DEFAULT 0,
      breakHours REAL DEFAULT 0,
      focusScore INTEGER DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS invites (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      invitedBy TEXT NOT NULL,
      invitedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiresAt DATETIME NOT NULL,
      isUsed BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (invitedBy) REFERENCES users (id)
    )
  `);

  console.log('✅ テーブル作成成功');

  // 初期管理者ユーザーを作成
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE isAdmin = TRUE');
  const result = stmt.get();
  
  if (result.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO users (id, name, email, avatar, isAdmin, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      'admin-001',
      '管理者',
      'admin@example.com',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      1,
      new Date().toISOString()
    );
    
    console.log('✅ 初期管理者ユーザーを作成しました');
  }

  // テストユーザーを追加
  const testUsers = [
    {
      id: 'user-001',
      name: '田中太郎',
      email: 'tanaka@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isAdmin: false
    },
    {
      id: 'user-002',
      name: '佐藤花子',
      email: 'sato@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      isAdmin: false
    }
  ];

  const insertUserStmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, avatar, isAdmin, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  testUsers.forEach(user => {
    insertUserStmt.run(
      user.id,
      user.name,
      user.email,
      user.avatar,
      user.isAdmin ? 1 : 0,
      new Date().toISOString()
    );
  });

  console.log('✅ テストユーザーを追加しました');

  // データベースの内容を確認
  const users = db.prepare('SELECT * FROM users').all();
  console.log('\n📊 作成されたユーザー:');
  users.forEach(user => {
    console.log(`   ${user.isAdmin ? '👑' : '👤'} ${user.name} (${user.email}) - ${user.isAdmin ? '管理者' : '一般ユーザー'}`);
  });

  // テーブル一覧を表示
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
  
  console.log('\n📋 作成されたテーブル:');
  tables.forEach(table => {
    console.log(`   📄 ${table.name}`);
  });

  db.close();
  console.log('\n✅ データベース作成完了');
  console.log(`データベースファイル: ${dbPath}`);

} catch (error) {
  console.error('❌ エラー:', error.message);
  console.error('Stack trace:', error.stack);
}
