const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// データベースファイルのパス
const dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'vite-react-typescript-starter', 'focus-dashboard.db');

console.log('データベースパス:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('\n=== 削除前のユーザーテーブルの内容 ===');
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
  
  console.log('\n=== すべてのユーザー情報を削除 ===');
  
  // 関連するデータを先に削除
  const deleteActivitiesStmt = db.prepare('DELETE FROM activities');
  const deletedActivities = deleteActivitiesStmt.run();
  console.log(`削除されたアクティビティ数: ${deletedActivities.changes}`);
  
  const deleteGoalsStmt = db.prepare('DELETE FROM goals');
  const deletedGoals = deleteGoalsStmt.run();
  console.log(`削除されたゴール数: ${deletedGoals.changes}`);
  
  const deleteStatsStmt = db.prepare('DELETE FROM stats');
  const deletedStats = deleteStatsStmt.run();
  console.log(`削除された統計数: ${deletedStats.changes}`);
  
  const deleteInvitesStmt = db.prepare('DELETE FROM invites');
  const deletedInvites = deleteInvitesStmt.run();
  console.log(`削除された招待数: ${deletedInvites.changes}`);
  
  // 最後にユーザーを削除
  const deleteUsersStmt = db.prepare('DELETE FROM users');
  const deletedUsers = deleteUsersStmt.run();
  console.log(`削除されたユーザー数: ${deletedUsers.changes}`);
  
  const totalDeleted = deletedUsers.changes + deletedActivities.changes + deletedGoals.changes + deletedStats.changes + deletedInvites.changes;
  
  console.log('\n=== 削除後のユーザーテーブルの内容 ===');
  const remainingUsers = db.prepare('SELECT * FROM users').all();
  if (remainingUsers.length === 0) {
    console.log('✅ すべてのユーザーが削除されました');
  } else {
    remainingUsers.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`名前: ${user.name}`);
      console.log(`メール: ${user.email}`);
      console.log(`管理者: ${user.isAdmin ? 'YES' : 'NO'}`);
      console.log(`アクティブ: ${user.isActive ? 'YES' : 'NO'}`);
      console.log(`作成日: ${user.createdAt}`);
      console.log('---');
    });
  }
  
  console.log(`\n✅ データベースのクリーンアップが完了しました（削除件数: ${totalDeleted}）`);
  
  db.close();
} catch (error) {
  console.error('データベースエラー:', error);
}
