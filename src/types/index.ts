export interface TeamMember {
  id: string;
  name: string;
  focusScore: number;
  currentActivity: string;
  status: 'online' | 'away' | 'offline';
  avatar: string;
  lastUpdate: Date;
  dailyStats: {
    totalHours: number;
    focusHours: number;
    breakHours: number;
  };
  activities: ActivityData[];
  focusHistory: FocusPoint[];
  todayGoal?: string;
  yearlyGoal?: string;
  isWorking?: boolean;
  workStatus?: 'working' | 'break' | 'finished';
  isAdmin?: boolean; // 管理者権限フラグ
  email?: string; // メールアドレス
  createdAt?: Date; // 作成日時
}

export interface ActivityData {
  category: string;
  timeSpent: number;
  percentage: number;
  color: string;
}

export interface FocusPoint {
  time: string;
  score: number;
  focusHours?: number; // 集中時間（時間単位）
}

// データベース関連の型定義
export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface DatabaseActivity {
  id: string;
  userId: string;
  appName: string;
  windowTitle: string;
  focusScore: number;
  timestamp: Date;
  duration: number;
}

export interface DatabaseGoal {
  id: string;
  userId: string;
  todayGoal?: string;
  yearlyGoal?: string;
  updatedAt: Date;
}

export interface DatabaseStats {
  id: string;
  userId: string;
  date: string;
  totalHours: number;
  focusHours: number;
  breakHours: number;
  focusScore: number;
}

// 管理者権限関連
export interface AdminPermissions {
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canViewAllStats: boolean;
  canManageSettings: boolean;
}

export interface InviteData {
  email: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}