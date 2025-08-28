import { contextBridge, ipcRenderer } from 'electron';

// レンダラープロセスで使用するAPIを定義
const electronAPI = {
  // アクティビティトラッキング関連
  getCurrentActivity: () => ipcRenderer.invoke('get-current-activity'),
  startTracking: () => ipcRenderer.invoke('start-tracking'),
  stopTracking: () => ipcRenderer.invoke('stop-tracking'),
  
  // 権限チェック
  hasScreenRecordingPermission: () => ipcRenderer.invoke('has-screen-recording-permission'),
  
  // アクティビティ更新の監視
  onActivityUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('activity-update', (_, data) => callback(data));
  },
  
  // 権限通知の監視
  onPermissionNotice: (callback: (data: any) => void) => {
    ipcRenderer.on('permission-notice', (_, data) => callback(data));
  },
  
  // リスナーの削除
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// グローバルオブジェクトとしてAPIを公開
contextBridge.exposeInMainWorld('electronAPI', {
  // 認証関連のAPI
  authLogin: (email: string, password: string) => ipcRenderer.invoke('auth-login', email, password),
  authRegister: (userData: { name: string; email: string; password: string }) => ipcRenderer.invoke('auth-register', userData),

  authGenerateResetToken: (email: string) => ipcRenderer.invoke('auth-generate-reset-token', email),
  authResetPassword: (token: string, newPassword: string) => ipcRenderer.invoke('auth-reset-password', token, newPassword),
  
  // アクティビティトラッキング関連
  getCurrentActivity: () => ipcRenderer.invoke('get-current-activity'),
  startTracking: () => ipcRenderer.invoke('start-tracking'),
  stopTracking: () => ipcRenderer.invoke('stop-tracking'),
  
  // 権限チェック
  hasScreenRecordingPermission: () => ipcRenderer.invoke('has-screen-recording-permission'),
  
  // アクティビティ更新の監視
  onActivityUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('activity-update', (_, data) => callback(data));
  },
  
  // 権限通知の監視
  onPermissionNotice: (callback: (data: any) => void) => {
    ipcRenderer.on('permission-notice', (_, data) => callback(data));
  },
  
  // リスナーの削除
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // データベース関連のAPI
  dbGetAllUsers: () => ipcRenderer.invoke('db-get-all-users'),
  dbGetUserById: (userId: string) => ipcRenderer.invoke('db-get-user-by-id', userId),
  dbGetUserByEmail: (email: string) => ipcRenderer.invoke('db-get-user-by-email', email),
  dbCreateUser: (userData: any) => ipcRenderer.invoke('db-create-user', userData),
  dbUpdateUser: (userId: string, updates: any) => ipcRenderer.invoke('db-update-user', userId, updates),
  dbDeleteUser: (userId: string) => ipcRenderer.invoke('db-delete-user', userId),
  dbIsAdmin: (userId: string) => ipcRenderer.invoke('db-is-admin', userId),
  dbIsUserAdmin: (userId: string) => ipcRenderer.invoke('db-is-user-admin', userId),
  dbSaveActivity: (activityData: any) => ipcRenderer.invoke('db-save-activity', activityData),
  dbSaveGoal: (goalData: any) => ipcRenderer.invoke('db-save-goal', goalData),
  dbGetGoal: (userId: string) => ipcRenderer.invoke('db-get-goal', userId),
  dbSaveStats: (statsData: any) => ipcRenderer.invoke('db-save-stats', statsData),
  dbCreateInvite: (inviteData: any) => ipcRenderer.invoke('db-create-invite', inviteData),
  dbGetInvite: (email: string) => ipcRenderer.invoke('db-get-invite', email),
  dbMarkInviteUsed: (email: string) => ipcRenderer.invoke('db-mark-invite-used', email),
  dbClearAllData: () => ipcRenderer.invoke('db-clear-all-data'),
  dbCleanDummyData: () => ipcRenderer.invoke('db-clean-dummy-data'),
  
  // 作業時間管理
  dbStartWork: (userId: string, workData: any) => ipcRenderer.invoke('db-start-work', userId, workData),
  dbStartBreak: (userId: string) => ipcRenderer.invoke('db-start-break', userId),
  dbFinishWork: (userId: string) => ipcRenderer.invoke('db-finish-work', userId),
  dbUpdateUserGoal: (userId: string, goal: string) => ipcRenderer.invoke('db-update-user-goal', userId, goal),
  dbUpdateUserYearlyGoal: (userId: string, yearlyGoal: string) => ipcRenderer.invoke('db-update-user-yearly-goal', userId, yearlyGoal),
  dbGetUserGoal: (userId: string) => ipcRenderer.invoke('db-get-user-goal', userId),
  dbGetUserStats: (userId: string, date: string) => ipcRenderer.invoke('db-get-user-stats', userId, date),
  dbUpdateUserStats: (userId: string, stats: any) => ipcRenderer.invoke('db-update-user-stats', userId, stats),
});

// TypeScript用の型定義
export type ElectronAPI = typeof electronAPI;