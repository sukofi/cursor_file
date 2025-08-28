export interface ActivityData {
  appName: string;
  windowTitle: string;
  timestamp: number;
  isActive: boolean;
}

export interface ElectronAPI {
  // 環境変数
  getEnv: (key: string) => string | undefined;
  
  // 認証関連
  authLogin: (email: string, password: string) => Promise<{ success: boolean; user?: any; message?: string }>;
  authRegister: (userData: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string; userId?: string }>;

  authGenerateResetToken: (email: string) => Promise<{ success: boolean; message?: string }>;
  authResetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  
  // アクティビティトラッキング関連
  getCurrentActivity: () => Promise<ActivityData | null>;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  
  // 権限チェック
  hasScreenRecordingPermission: () => Promise<boolean>;
  
  // アクティビティ更新の監視
  onActivityUpdate: (callback: (data: ActivityData) => void) => void;
  
  // 権限通知の監視
  onPermissionNotice: (callback: (data: any) => void) => void;
  
  // リスナーの削除
  removeAllListeners: (channel: string) => void;

  // データベース関連のAPI
  dbGetAllUsers: () => Promise<any[]>;
  dbGetUserById: (userId: string) => Promise<any | null>;
  dbGetUserByEmail: (email: string) => Promise<any | null>;
  dbCreateUser: (userData: any) => Promise<{ success: boolean; userId: string }>;
  dbUpdateUser: (userId: string, updates: any) => Promise<{ success: boolean }>;
  dbDeleteUser: (userId: string) => Promise<{ success: boolean }>;
  dbIsUserAdmin: (userId: string) => Promise<boolean>;
  dbSaveActivity: (activityData: any) => Promise<{ success: boolean; activityId: string }>;
  dbSaveGoal: (goalData: any) => Promise<{ success: boolean; goalId: string }>;
  dbGetGoal: (userId: string) => Promise<any | null>;
  dbSaveStats: (statsData: any) => Promise<{ success: boolean; statsId: string }>;
  dbCreateInvite: (inviteData: any) => Promise<{ success: boolean; inviteId: string }>;
  dbGetInvite: (email: string) => Promise<any | null>;
  dbMarkInviteUsed: (email: string) => Promise<{ success: boolean }>;
  dbGetAllInvites: () => Promise<{ success: boolean; invites?: any[] }>;
  dbGetInviteById: (inviteId: string) => Promise<{ success: boolean; invite?: any }>;
  dbDeleteInvite: (inviteId: string) => Promise<{ success: boolean }>;
  dbGetInvitesByUser: (userId: string) => Promise<{ success: boolean; invites?: any[] }>;
  dbGetActiveInvites: () => Promise<{ success: boolean; invites?: any[] }>;
  
  // 作業時間管理
  dbStartWork: (userId: string, workData: any) => Promise<{ success: boolean }>;
  dbStartBreak: (userId: string) => Promise<{ success: boolean }>;
  dbFinishWork: (userId: string) => Promise<{ success: boolean }>;
  dbUpdateUserGoal: (userId: string, goal: string) => Promise<{ success: boolean }>;
  dbUpdateUserYearlyGoal: (userId: string, yearlyGoal: string) => Promise<{ success: boolean }>;
  dbGetUserGoal: (userId: string) => Promise<{ success: boolean; goal?: { todayGoal?: string; yearlyGoal?: string } }>;
  dbGetUserStats: (userId: string, date: string) => Promise<any | null>;
  dbUpdateUserStats: (userId: string, stats: any) => Promise<{ success: boolean }>;
  dbClearAllData: () => Promise<{ success: boolean; message?: string; deletedCount?: number }>;
  dbCleanDummyData: () => Promise<{ success: boolean; message?: string; deletedCount?: number }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}