import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';
import { DatabaseUser, DatabaseActivity, DatabaseGoal, DatabaseStats, InviteData } from '../src/types';

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'focus-dashboard.db');
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // ユーザーテーブル
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        isAdmin BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLoginAt DATETIME,
        resetToken TEXT,
        resetTokenExpires DATETIME
      )
    `);

    // アクティビティテーブル
    this.db.exec(`
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

    // 目標テーブル
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        todayGoal TEXT,
        yearlyGoal TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);

    // 統計テーブル
    this.db.exec(`
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

    // 招待テーブル
    this.db.exec(`
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

    // 初期管理者ユーザーを作成
    this.createInitialAdmin();
  }

  private createInitialAdmin() {
    // 初期管理者ユーザーの作成を無効化
    console.log('データベース初期化: 初期管理者ユーザーの作成をスキップしました');
    return;
    
    // 既存の管理者ユーザーをチェック
    const adminStmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE isAdmin = TRUE');
    const adminCount = adminStmt.get() as { count: number };
    
    console.log(`データベース初期化: 既存の管理者ユーザー数: ${adminCount.count}`);
    
    if (adminCount.count === 0) {
      console.log('データベース初期化: 管理者ユーザーを作成中...');
      
      const insertStmt = this.db.prepare(`
        INSERT INTO users (id, name, email, password, avatar, isAdmin, isActive, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(
        'admin-001',
        '管理者',
        'admin@example.com',
        'admin123', // 初期パスワード（実際の実装ではハッシュ化）
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        1, // isAdmin = true
        1, // isActive = true
        new Date().toISOString()
      );
      
      console.log('✅ 初期管理者ユーザーを作成しました（メール: admin@example.com, パスワード: admin123）');
    } else {
      console.log('✅ 管理者ユーザーは既に存在します');
    }
    
    // 全ユーザー一覧を確認
    const allUsers = this.db.prepare('SELECT id, name, email, isAdmin, isActive FROM users').all();
    console.log('データベース初期化: 登録済みユーザー一覧:');
    allUsers.forEach((user: any) => {
      console.log(`  - ID: ${user.id}, 名前: ${user.name}, メール: ${user.email}, 管理者: ${user.isAdmin ? 'YES' : 'NO'}, アクティブ: ${user.isActive ? 'YES' : 'NO'}`);
    });
  }

  // ユーザー関連のメソッド
  public getAllUsers(): DatabaseUser[] {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY createdAt DESC');
    return stmt.all() as DatabaseUser[];
  }

  public getUserById(id: string): DatabaseUser | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as DatabaseUser | null;
  }

  public getUserByEmail(email: string): DatabaseUser | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as DatabaseUser | null;
  }

  public createUser(user: Omit<DatabaseUser, 'id' | 'createdAt'>): string {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const stmt = this.db.prepare(`
      INSERT INTO users (id, name, email, avatar, isAdmin, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, user.name, user.email, user.avatar, user.isAdmin, new Date().toISOString());
    return id;
  }

  public updateUser(id: string, updates: Partial<DatabaseUser>): boolean {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt');
    if (fields.length === 0) return false;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    values.push(id);

    const stmt = this.db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  public deleteUser(id: string): boolean {
    // 関連データも削除
    this.db.prepare('DELETE FROM activities WHERE userId = ?').run(id);
    this.db.prepare('DELETE FROM goals WHERE userId = ?').run(id);
    this.db.prepare('DELETE FROM stats WHERE userId = ?').run(id);
    
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  public isAdmin(userId: string): boolean {
    const stmt = this.db.prepare('SELECT isAdmin FROM users WHERE id = ?');
    const result = stmt.get(userId) as { isAdmin: boolean } | null;
    return result?.isAdmin || false;
  }

  // ユーザーの管理者権限を確認するメソッド
  public async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare('SELECT isAdmin FROM users WHERE id = ?');
      const user = stmt.get(userId) as any;
      
      if (!user) {
        console.log(`管理者権限確認: ユーザーが見つかりません (ID: ${userId})`);
        return false;
      }
      
      const isAdmin = Boolean(user.isAdmin);
      console.log(`管理者権限確認: ユーザーID ${userId} の管理者権限 = ${isAdmin}`);
      return isAdmin;
    } catch (error) {
      console.error('管理者権限確認エラー:', error);
      return false;
    }
  }

  // アクティビティ関連のメソッド
  public saveActivity(activity: Omit<DatabaseActivity, 'id'>): string {
    const id = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const stmt = this.db.prepare(`
      INSERT INTO activities (id, userId, appName, windowTitle, focusScore, timestamp, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, activity.userId, activity.appName, activity.windowTitle, 
             activity.focusScore, activity.timestamp.toISOString(), activity.duration);
    return id;
  }

  public getActivitiesByUserId(userId: string, limit: number = 100): DatabaseActivity[] {
    const stmt = this.db.prepare(`
      SELECT * FROM activities 
      WHERE userId = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(userId, limit) as DatabaseActivity[];
  }

  // 目標関連のメソッド
  public saveGoal(goal: Omit<DatabaseGoal, 'id' | 'updatedAt'>): string {
    const id = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO goals (id, userId, todayGoal, yearlyGoal, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, goal.userId, goal.todayGoal, goal.yearlyGoal, new Date().toISOString());
    return id;
  }

  public getGoalByUserId(userId: string): DatabaseGoal | null {
    const stmt = this.db.prepare('SELECT * FROM goals WHERE userId = ?');
    return stmt.get(userId) as DatabaseGoal | null;
  }

  // 統計関連のメソッド
  public saveStats(stats: Omit<DatabaseStats, 'id'>): string {
    const id = `stats-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO stats (id, userId, date, totalHours, focusHours, breakHours, focusScore)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, stats.userId, stats.date, stats.totalHours, stats.focusHours, 
             stats.breakHours, stats.focusScore);
    return id;
  }

  public getStatsByUserId(userId: string, date: string): DatabaseStats | null {
    const stmt = this.db.prepare('SELECT * FROM stats WHERE userId = ? AND date = ?');
    return stmt.get(userId, date) as DatabaseStats | null;
  }

  // 招待関連のメソッド
  public createInvite(invite: Omit<InviteData, 'id'>): string {
    const id = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const stmt = this.db.prepare(`
      INSERT INTO invites (id, email, invitedBy, invitedAt, expiresAt, isUsed)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, invite.email, invite.invitedBy, invite.invitedAt.toISOString(), 
             invite.expiresAt.toISOString(), invite.isUsed);
    return id;
  }

  public getInviteByEmail(email: string): InviteData | null {
    const stmt = this.db.prepare('SELECT * FROM invites WHERE email = ? AND isUsed = FALSE AND expiresAt > datetime("now")');
    return stmt.get(email) as InviteData | null;
  }

  public markInviteAsUsed(email: string): boolean {
    const stmt = this.db.prepare('UPDATE invites SET isUsed = TRUE WHERE email = ?');
    const result = stmt.run(email);
    return result.changes > 0;
  }

  // 招待管理機能
  public getAllInvites(): InviteData[] {
    const stmt = this.db.prepare('SELECT * FROM invites ORDER BY invitedAt DESC');
    return stmt.all() as InviteData[];
  }

  public getInviteById(inviteId: string): InviteData | null {
    const stmt = this.db.prepare('SELECT * FROM invites WHERE id = ?');
    return stmt.get(inviteId) as InviteData | null;
  }

  public deleteInvite(inviteId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM invites WHERE id = ?');
    const result = stmt.run(inviteId);
    return result.changes > 0;
  }

  public getInvitesByUser(userId: string): InviteData[] {
    const stmt = this.db.prepare('SELECT * FROM invites WHERE invitedBy = ? ORDER BY invitedAt DESC');
    return stmt.all(userId) as InviteData[];
  }

  public getActiveInvites(): InviteData[] {
    const stmt = this.db.prepare('SELECT * FROM invites WHERE isUsed = FALSE AND expiresAt > datetime("now") ORDER BY invitedAt DESC');
    return stmt.all() as InviteData[];
  }



  // 作業時間管理のメソッド
  public startWork(userId: string, workData: any): boolean {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET workStatus = 'working', currentActivity = ?, lastWorkStart = ?
      WHERE id = ?
    `);
    const result = stmt.run(workData.appName, new Date().toISOString(), userId);
    return result.changes > 0;
  }

  public startBreak(userId: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET workStatus = 'break', currentActivity = '休憩中', lastBreakStart = ?
      WHERE id = ?
    `);
    const result = stmt.run(new Date().toISOString(), userId);
    return result.changes > 0;
  }

  public finishWork(userId: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET workStatus = 'finished', currentActivity = '作業終了', lastWorkEnd = ?
      WHERE id = ?
    `);
    const result = stmt.run(new Date().toISOString(), userId);
    return result.changes > 0;
  }

  public updateUserGoal(userId: string, goal: string): boolean {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO goals (userId, todayGoal, updatedAt)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(userId, goal, new Date().toISOString());
    return result.changes > 0;
  }

  public updateUserYearlyGoal(userId: string, yearlyGoal: string): boolean {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO goals (userId, yearlyGoal, updatedAt)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(userId, yearlyGoal, new Date().toISOString());
    return result.changes > 0;
  }

  public getUserStats(userId: string, date: string): DatabaseStats | null {
    return this.getStatsByUserId(userId, date);
  }

  public updateUserStats(userId: string, stats: any): boolean {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO stats (userId, date, totalHours, focusHours, breakHours, focusScore)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, stats.date, stats.totalHours, stats.focusHours, 
                           stats.breakHours, stats.focusScore);
    return result.changes > 0;
  }

  // 認証関連のメソッド
  public async authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      console.log(`認証試行: ${email}`);
      
      const stmt = this.db.prepare('SELECT * FROM users WHERE email = ? AND isActive = TRUE');
      const user = stmt.get(email) as any;
      
      console.log(`データベース検索結果: ${user ? 'ユーザー見つかりました' : 'ユーザーが見つかりません'}`);
      
      if (!user) {
        console.log('認証失敗: ユーザーが存在しません');
        return { success: false, message: 'ユーザーが見つかりません' };
      }
      
      console.log(`パスワード検証: 入力=${password}, DB=${user.password}`);
      
      // パスワード検証（実際の実装ではbcrypt等を使用）
      if (user.password !== password) {
        console.log('認証失敗: パスワードが不正です');
        return { success: false, message: 'パスワードが正しくありません' };
      }
      
      // 最終ログイン時刻を更新
      const updateStmt = this.db.prepare('UPDATE users SET lastLoginAt = ? WHERE id = ?');
      updateStmt.run(new Date().toISOString(), user.id);
      
      console.log('✅ 認証成功');
      return { success: true, user };
    } catch (error) {
      console.error('認証エラー:', error);
      return { success: false, message: '認証中にエラーが発生しました' };
    }
  }

  public async registerUser(userData: { name: string; email: string; password: string }): Promise<{ success: boolean; message?: string; userId?: string }> {
    try {
      // メールアドレスの重複チェック
      const checkStmt = this.db.prepare('SELECT id FROM users WHERE email = ?');
      const existingUser = checkStmt.get(userData.email);
      
      if (existingUser) {
        return { success: false, message: 'このメールアドレスは既に登録されています' };
      }
      
      // 管理者権限の自動付与ロジック（最初のユーザーのみ）
      const adminCountStmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE isAdmin = TRUE');
      const adminCount = adminCountStmt.get() as { count: number };
      const isAdmin = adminCount.count === 0; // 管理者が存在しない場合のみ管理者権限を付与
      
      console.log(`ユーザー登録: 管理者数=${adminCount.count}, 新規ユーザーに管理者権限付与=${isAdmin}`);
      
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const insertStmt = this.db.prepare(`
        INSERT INTO users (id, name, email, password, avatar, isAdmin, isActive, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(
        userId,
        userData.name,
        userData.email,
        userData.password, // 実際の実装ではハッシュ化
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isAdmin ? 1 : 0, // 管理者権限を自動付与
        1, // isActive = true
        new Date().toISOString()
      );
      
      const adminMessage = isAdmin ? '（管理者権限が付与されました）' : '';
      return { success: true, message: `ユーザー登録が完了しました${adminMessage}`, userId };
    } catch (error) {
      console.error('ユーザー登録エラー:', error);
      return { success: false, message: 'ユーザー登録中にエラーが発生しました' };
    }
  }

  public async generateResetToken(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const stmt = this.db.prepare('SELECT id FROM users WHERE email = ? AND isActive = TRUE');
      const user = stmt.get(email) as any;
      
      if (!user) {
        return { success: false, message: 'このメールアドレスは登録されていません' };
      }
      
      const resetToken = Math.random().toString(36).substr(2, 15);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後
      
      const updateStmt = this.db.prepare('UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE id = ?');
      updateStmt.run(resetToken, expiresAt.toISOString(), user.id);
      
      return { success: true, message: 'パスワードリセット用のトークンを生成しました' };
    } catch (error) {
      console.error('リセットトークン生成エラー:', error);
      return { success: false, message: 'リセットトークン生成中にエラーが発生しました' };
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const stmt = this.db.prepare('SELECT id FROM users WHERE resetToken = ? AND resetTokenExpires > datetime("now") AND isActive = TRUE');
      const user = stmt.get(token) as any;
      
      if (!user) {
        return { success: false, message: '無効なトークンまたは期限切れです' };
      }
      
      const updateStmt = this.db.prepare('UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?');
      updateStmt.run(newPassword, user.id); // 実際の実装ではハッシュ化
      
      return { success: true, message: 'パスワードが正常にリセットされました' };
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      return { success: false, message: 'パスワードリセット中にエラーが発生しました' };
    }
  }

  // データベースを完全にクリーンアップするメソッド
  public async clearAllData(): Promise<{ success: boolean; message?: string; deletedCount?: number }> {
    try {
      console.log('データベース完全クリーンアップ開始...');
      
      // 関連するデータを先に削除
      const deleteActivitiesStmt = this.db.prepare('DELETE FROM activities');
      const deletedActivities = deleteActivitiesStmt.run();
      console.log(`削除されたアクティビティ数: ${deletedActivities.changes}`);
      
      const deleteGoalsStmt = this.db.prepare('DELETE FROM goals');
      const deletedGoals = deleteGoalsStmt.run();
      console.log(`削除されたゴール数: ${deletedGoals.changes}`);
      
      const deleteStatsStmt = this.db.prepare('DELETE FROM stats');
      const deletedStats = deleteStatsStmt.run();
      console.log(`削除された統計数: ${deletedStats.changes}`);
      
      const deleteInvitesStmt = this.db.prepare('DELETE FROM invites');
      const deletedInvites = deleteInvitesStmt.run();
      console.log(`削除された招待数: ${deletedInvites.changes}`);
      
      // 最後にユーザーを削除
      const deleteUsersStmt = this.db.prepare('DELETE FROM users');
      const deletedUsers = deleteUsersStmt.run();
      console.log(`削除されたユーザー数: ${deletedUsers.changes}`);
      
      const totalDeleted = deletedUsers.changes + deletedActivities.changes + deletedGoals.changes + deletedStats.changes + deletedInvites.changes;
      
      console.log('✅ データベースの完全クリーンアップが完了しました');
      return { 
        success: true, 
        message: `データベースの完全クリーンアップが完了しました（削除件数: ${totalDeleted}）`,
        deletedCount: totalDeleted
      };
    } catch (error) {
      console.error('データベース完全クリーンアップエラー:', error);
      return { success: false, message: 'データベース完全クリーンアップ中にエラーが発生しました' };
    }
  }

  // ダミーデータを削除するメソッド
  public async cleanDummyData(): Promise<{ success: boolean; message?: string; deletedCount?: number }> {
    try {
      console.log('ダミーデータ削除開始...');
      
      // 管理者以外のユーザーを削除
      const deleteUsersStmt = this.db.prepare('DELETE FROM users WHERE isAdmin = FALSE');
      const deletedUsers = deleteUsersStmt.run();
      console.log(`削除されたユーザー数: ${deletedUsers.changes}`);
      
      // 関連するデータも削除
      const deleteActivitiesStmt = this.db.prepare('DELETE FROM activities WHERE userId NOT IN (SELECT id FROM users)');
      const deletedActivities = deleteActivitiesStmt.run();
      console.log(`削除されたアクティビティ数: ${deletedActivities.changes}`);
      
      const deleteGoalsStmt = this.db.prepare('DELETE FROM goals WHERE userId NOT IN (SELECT id FROM users)');
      const deletedGoals = deleteGoalsStmt.run();
      console.log(`削除されたゴール数: ${deletedGoals.changes}`);
      
      const deleteStatsStmt = this.db.prepare('DELETE FROM stats WHERE userId NOT IN (SELECT id FROM users)');
      const deletedStats = deleteStatsStmt.run();
      console.log(`削除された統計数: ${deletedStats.changes}`);
      
      const totalDeleted = deletedUsers.changes + deletedActivities.changes + deletedGoals.changes + deletedStats.changes;
      
      console.log('✅ ダミーデータの削除が完了しました');
      return { 
        success: true, 
        message: `ダミーデータの削除が完了しました（削除件数: ${totalDeleted}）`,
        deletedCount: totalDeleted
      };
    } catch (error) {
      console.error('ダミーデータ削除エラー:', error);
      return { success: false, message: 'ダミーデータ削除中にエラーが発生しました' };
    }
  }

  // データベース接続を閉じる
  public close() {
    this.db.close();
  }
}

export const databaseManager = new DatabaseManager();
