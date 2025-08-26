import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import activeWin from 'active-win';
import * as path from 'path';
import { exec } from 'child_process';
import { databaseManager } from './database';

// promisifyの代替実装
function promisifyExec(command: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// CommonJS互換の__dirname
const currentDir = __dirname || path.dirname(require.main?.filename || '');

// プロセス環境の設定
process.env.APP_ROOT = path.join(currentDir, '..');
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;
let activityTracker: NodeJS.Timeout | null = null;
let hasScreenRecordingPermission = false;
let lastActivityData: ActivityData | null = null;
let lastActivityTime = 0;
const CACHE_DURATION = 1000; // 1秒間キャッシュ

interface ActivityData {
  appName: string;
  windowTitle: string;
  timestamp: number;
  isActive: boolean;
}

// アプリ名マッピング（一度だけ定義）
const APP_NAME_MAP: { [key: string]: string } = {
  'Visual Studio Code': 'VS Code',
  'Google Chrome': 'Chrome',
  'Microsoft Edge': 'Edge',
  'Firefox': 'Firefox',
  'Safari': 'Safari',
  'Figma': 'Figma',
  'Slack': 'Slack',
  'Discord': 'Discord',
  'Notion': 'Notion',
  'Spotify': 'Spotify',
  'Terminal': 'ターミナル',
  'iTerm2': 'iTerm2',
  'Finder': 'Finder',
  'Explorer': 'エクスプローラー',
  'Notepad': 'メモ帳',
  'Calculator': '電卓',
  'IntelliJ IDEA': 'IntelliJ IDEA',
  'WebStorm': 'WebStorm',
  'PyCharm': 'PyCharm',
  'Adobe Photoshop': 'Photoshop',
  'Adobe Illustrator': 'Illustrator',
  'Microsoft Word': 'Word',
  'Microsoft Excel': 'Excel',
  'Microsoft PowerPoint': 'PowerPoint',
  'Zoom': 'Zoom',
  'Microsoft Teams': 'Teams',
  'Skype': 'Skype',
};

// 代替のアクティブウィンドウ取得関数（権限なしでも動作）
async function getActiveWindowFallback(): Promise<ActivityData | null> {
  try {
    if (process.platform === 'darwin') {
      const { stdout } = await promisifyExec('osascript -e \'tell application "System Events" to get name of first application process whose frontmost is true\'');
      const appName = stdout.trim();
      
      if (appName && appName !== 'Electron' && appName !== '集中度ダッシュボード') {
        return {
          appName: appName,
          windowTitle: `${appName} Window`,
          timestamp: Date.now(),
          isActive: true,
        };
      }
    }
  } catch (error) {
    // エラーログは最小限に
  }
  
  return null;
}

// キャッシュをチェック
function getCachedActivityData(): ActivityData | null {
  const now = Date.now();
  if (lastActivityData && (now - lastActivityTime) < CACHE_DURATION) {
    return lastActivityData;
  }
  return null;
}

// キャッシュを更新
function updateCache(activityData: ActivityData) {
  lastActivityData = activityData;
  lastActivityTime = Date.now();
}

async function getCurrentActiveWindow(): Promise<ActivityData | null> {
  // キャッシュをチェック
  const cached = getCachedActivityData();
  if (cached) {
    return cached;
  }
  
  // 権限がない場合は、代替方法を試す
  if (!hasScreenRecordingPermission) {
    const fallbackResult = await getActiveWindowFallback();
    if (fallbackResult) {
      updateCache(fallbackResult);
      return fallbackResult;
    }
    
    const defaultData = {
      appName: 'Unknown App',
      windowTitle: 'Unknown Window',
      timestamp: Date.now(),
      isActive: true,
    };
    updateCache(defaultData);
    return defaultData;
  }
  
  // 権限がある場合はactive-winを使用
  try {
    const activeWindow = await activeWin();
    
    if (!activeWindow) {
      return null;
    }

    let appName = activeWindow.owner?.name || 'Unknown';
    
    // Electronアプリ自体を除外
    if (appName === 'Electron' || 
        activeWindow.title?.includes('集中度ダッシュボード') || 
        activeWindow.title?.includes('Dashboard') ||
        activeWindow.title?.includes('task_rog') ||
        activeWindow.title?.includes('Vite')) {
      const electronData = {
        appName: 'Electron App',
        windowTitle: '集中度ダッシュボード',
        timestamp: Date.now(),
        isActive: true,
      };
      updateCache(electronData);
      return electronData;
    }
    
    // アプリ名を正規化
    appName = APP_NAME_MAP[appName] || appName;

    const result = {
      appName,
      windowTitle: activeWindow.title || '',
      timestamp: Date.now(),
      isActive: true,
    };
    
    updateCache(result);
    return result;
  } catch (error) {
    // エラーが発生した場合は代替方法を試す
    const fallbackResult = await getActiveWindowFallback();
    if (fallbackResult) {
      updateCache(fallbackResult);
      return fallbackResult;
    }
    
    // すべての方法が失敗した場合はデフォルト値を返す
    const defaultData = {
      appName: 'Electron App',
      windowTitle: '集中度ダッシュボード',
      timestamp: Date.now(),
      isActive: true,
    };
    updateCache(defaultData);
    return defaultData;
  }
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC!, 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (!process.env.IS_DEV) {
    Menu.setApplicationMenu(null);
  }

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  // 起動時に権限をチェック
  try {
    const testResult = await activeWin();
    if (testResult && testResult.owner && testResult.owner.name) {
      hasScreenRecordingPermission = true;
    } else {
      hasScreenRecordingPermission = false;
    }
  } catch (error) {
    hasScreenRecordingPermission = false;
    
    // 権限設定の案内（開発時のみ）
    if (process.env.IS_DEV && process.platform === 'darwin' && error instanceof Error) {
      if (error.message.includes('screen recording permission') || 
          error.message.includes('Privacy & Security') ||
          error.message.includes('active-win requires')) {
        console.log('=== 権限設定が必要です ===');
        console.log('macOSでのスクリーン録画権限が必要です。');
        console.log('システム環境設定 > セキュリティとプライバシー > プライバシー > スクリーン録画');
        console.log('========================');
        
        if (win) {
          win.webContents.send('permission-notice', {
            type: 'screen-recording',
            message: 'スクリーン録画権限の設定が必要です。'
          });
        }
      }
    }
    
    // 代替方法をテスト
    const fallbackTest = await getActiveWindowFallback();
    if (fallbackTest) {
      console.log('代替方法のテスト成功');
    }
  }

  startActivityTracking();
}

function startActivityTracking() {
  activityTracker = setInterval(async () => {
    try {
      const activityData = await getCurrentActiveWindow();
      
      if (activityData && win) {
        win.webContents.send('activity-update', activityData);
      }
    } catch (error) {
      // エラーが発生した場合は、デフォルトデータを送信
      if (win) {
        const fallbackData = {
          appName: 'Electron App',
          windowTitle: '集中度ダッシュボード',
          timestamp: Date.now(),
          isActive: true,
        };
        win.webContents.send('activity-update', fallbackData);
      }
    }
  }, 2000);
}

function stopActivityTracking() {
  if (activityTracker) {
    clearInterval(activityTracker);
    activityTracker = null;
  }
}

// IPCハンドラーの設定
ipcMain.handle('get-current-activity', async () => {
  return await getCurrentActiveWindow();
});

ipcMain.handle('start-tracking', () => {
  if (!activityTracker) {
    startActivityTracking();
  }
  return true;
});

ipcMain.handle('stop-tracking', () => {
  stopActivityTracking();
  return true;
});

ipcMain.handle('has-screen-recording-permission', () => {
  return hasScreenRecordingPermission;
});

  // 認証関連のIPCハンドラー
  ipcMain.handle('auth-login', async (_, email: string, password: string) => {
    try {
      return await databaseManager.authenticateUser(email, password);
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  });

  ipcMain.handle('auth-register', async (_, userData: { name: string; email: string; password: string }) => {
    try {
      return await databaseManager.registerUser(userData);
    } catch (error) {
      console.error('ユーザー登録エラー:', error);
      throw error;
    }
  });



  ipcMain.handle('auth-generate-reset-token', async (_, email: string) => {
    try {
      return await databaseManager.generateResetToken(email);
    } catch (error) {
      console.error('リセットトークン生成エラー:', error);
      throw error;
    }
  });

  ipcMain.handle('auth-reset-password', async (_, token: string, newPassword: string) => {
    try {
      return await databaseManager.resetPassword(token, newPassword);
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      throw error;
    }
  });

  // データベース関連のIPCハンドラー
  ipcMain.handle('db-get-all-users', async () => {
    try {
      return databaseManager.getAllUsers();
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      throw error;
    }
  });

ipcMain.handle('db-get-user-by-id', async (_, userId: string) => {
  try {
    return databaseManager.getUserById(userId);
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-get-user-by-email', async (_, email: string) => {
  try {
    return databaseManager.getUserByEmail(email);
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-create-user', async (_, userData: any) => {
  try {
    const userId = databaseManager.createUser(userData);
    return { success: true, userId };
  } catch (error) {
    console.error('ユーザー作成エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-update-user', async (_, userId: string, updates: any) => {
  try {
    const success = databaseManager.updateUser(userId, updates);
    return { success };
  } catch (error) {
    console.error('ユーザー更新エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-delete-user', async (_, userId: string) => {
  try {
    const success = databaseManager.deleteUser(userId);
    return { success };
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-is-admin', async (_, userId: string) => {
  try {
    return databaseManager.isAdmin(userId);
  } catch (error) {
    console.error('管理者権限チェックエラー:', error);
    return false;
  }
});

ipcMain.handle('db-is-user-admin', async (_, userId: string) => {
  try {
    return await databaseManager.isUserAdmin(userId);
  } catch (error) {
    console.error('管理者権限確認エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-save-activity', async (_, activityData: any) => {
  try {
    const activityId = databaseManager.saveActivity(activityData);
    return { success: true, activityId };
  } catch (error) {
    console.error('アクティビティ保存エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-save-goal', async (_, goalData: any) => {
  try {
    const goalId = databaseManager.saveGoal(goalData);
    return { success: true, goalId };
  } catch (error) {
    console.error('目標保存エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-get-goal', async (_, userId: string) => {
  try {
    return databaseManager.getGoalByUserId(userId);
  } catch (error) {
    console.error('目標取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-save-stats', async (_, statsData: any) => {
  try {
    const statsId = databaseManager.saveStats(statsData);
    return { success: true, statsId };
  } catch (error) {
    console.error('統計保存エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-create-invite', async (_, inviteData: any) => {
  try {
    const inviteId = databaseManager.createInvite(inviteData);
    return { success: true, inviteId };
  } catch (error) {
    console.error('招待作成エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-get-invite', async (_, email: string) => {
  try {
    return databaseManager.getInviteByEmail(email);
  } catch (error) {
    console.error('招待取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-mark-invite-used', async (_, email: string) => {
  try {
    const success = databaseManager.markInviteAsUsed(email);
    return { success };
  } catch (error) {
    console.error('招待使用済みマークエラー:', error);
    throw error;
  }
});

// 招待管理機能
ipcMain.handle('db-get-all-invites', async () => {
  try {
    const invites = databaseManager.getAllInvites();
    return { success: true, invites };
  } catch (error) {
    console.error('招待一覧取得エラー:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-invite-by-id', async (_, inviteId: string) => {
  try {
    const invite = databaseManager.getInviteById(inviteId);
    return { success: true, invite };
  } catch (error) {
    console.error('招待取得エラー:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-delete-invite', async (_, inviteId: string) => {
  try {
    const success = databaseManager.deleteInvite(inviteId);
    return { success };
  } catch (error) {
    console.error('招待削除エラー:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-invites-by-user', async (_, userId: string) => {
  try {
    const invites = databaseManager.getInvitesByUser(userId);
    return { success: true, invites };
  } catch (error) {
    console.error('ユーザー招待一覧取得エラー:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-active-invites', async () => {
  try {
    const invites = databaseManager.getActiveInvites();
    return { success: true, invites };
  } catch (error) {
    console.error('アクティブ招待一覧取得エラー:', error);
    return { success: false, error: error.message };
  }
});

// 作業時間管理のIPCハンドラー
ipcMain.handle('db-start-work', async (_, userId: string, workData: any) => {
  try {
    const success = databaseManager.startWork(userId, workData);
    return { success };
  } catch (error) {
    console.error('作業開始記録エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-start-break', async (_, userId: string) => {
  try {
    const success = databaseManager.startBreak(userId);
    return { success };
  } catch (error) {
    console.error('休憩開始記録エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-finish-work', async (_, userId: string) => {
  try {
    const success = databaseManager.finishWork(userId);
    return { success };
  } catch (error) {
    console.error('作業終了記録エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-update-user-goal', async (_, userId: string, goal: string) => {
  try {
    const success = databaseManager.updateUserGoal(userId, goal);
    return { success };
  } catch (error) {
    console.error('ユーザー目標更新エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-update-user-yearly-goal', async (_, userId: string, yearlyGoal: string) => {
  try {
    const success = databaseManager.updateUserYearlyGoal(userId, yearlyGoal);
    return { success };
  } catch (error) {
    console.error('ユーザー年間目標更新エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-get-user-stats', async (_, userId: string, date: string) => {
  try {
    return databaseManager.getUserStats(userId, date);
  } catch (error) {
    console.error('ユーザー統計取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-update-user-stats', async (_, userId: string, stats: any) => {
  try {
    const success = databaseManager.updateUserStats(userId, stats);
    return { success };
  } catch (error) {
    console.error('ユーザー統計更新エラー:', error);
    throw error;
  }
});

ipcMain.handle('db-clear-all-data', async () => {
  try {
    return await databaseManager.clearAllData();
  } catch (error) {
    console.error('データベース完全クリーンアップエラー:', error);
    throw error;
  }
});

ipcMain.handle('db-clean-dummy-data', async () => {
  try {
    return await databaseManager.cleanDummyData();
  } catch (error) {
    console.error('ダミーデータ削除エラー:', error);
    throw error;
  }
});

// アプリケーションイベント
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopActivityTracking();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopActivityTracking();
});