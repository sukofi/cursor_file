const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// データベースファイルのパス（Electronと同じ場所）
const dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'focus-dashboard.db');

console.log('データベースパス:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('\n=== データベース接続成功 ===');
  
  // テーブル一覧を取得
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\nテーブル一覧:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  
  // usersテーブルの構造を確認
  if (tables.find(t => t.name === 'users')) {
    console.log('\n=== usersテーブル構造 ===');
    const columns = db.prepare("PRAGMA table_info(users)").all();
    columns.forEach(col => {
      console.log(`${col.name}: ${col.type} (NOT NULL: ${col.notnull ? 'YES' : 'NO'})`);
    });
    
    // ユーザー一覧を取得
    console.log('\n=== 登録済みユーザー ===');
    const users = db.prepare("SELECT id, name, email, isAdmin, isActive FROM users").all();
    users.forEach(user => {
      console.log(`ID: ${user.id}, 名前: ${user.name}, メール: ${user.email}, 管理者: ${user.isAdmin ? 'YES' : 'NO'}, アクティブ: ${user.isActive ? 'YES' : 'NO'}`);
    });
  } else {
    console.log('\nusersテーブルが存在しません');
  }
  
  db.close();
  console.log('\n=== データベース接続終了 ===');
  
} catch (error) {
  console.error('データベースエラー:', error);
}
