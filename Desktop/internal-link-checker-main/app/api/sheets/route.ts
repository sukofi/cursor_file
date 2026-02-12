import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/stripe';
import {
  getColumnInfo,
  getSheetNames,
  getArticles,
  extractSpreadsheetId,
} from '@/lib/google-sheets';

// ビルド時の page data 収集をスキップ（googleapis 等のランタイム依存を避ける）
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 認証チェック
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // アクセストークンを取得
  const accessToken = session.accessToken;
  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: '再ログインが必要です。一度ログアウトしてから再度ログインしてください。' },
      { status: 401 }
    );
  }

  // トークンエラーチェック
  if (session.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      { success: false, error: 'セッションの有効期限が切れました。再度ログインしてください。' },
      { status: 401 }
    );
  }

  // ユーザーのプラン情報を取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  const userPlan = (user?.plan || 'free') as keyof typeof PLANS;
  const maxRows = PLANS[userPlan].maxRows;

  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const spreadsheetIdInput = searchParams.get('spreadsheetId');
  const sheetName = searchParams.get('sheetName') || 'Sheet1';
  const keywordColumn = searchParams.get('keywordColumn') || 'A';
  const urlColumn = searchParams.get('urlColumn') || 'B';
  const genreColumn = searchParams.get('genreColumn') || '';

  if (!spreadsheetIdInput) {
    return NextResponse.json(
      { success: false, error: 'spreadsheetId is required' },
      { status: 400 }
    );
  }

  const spreadsheetId = extractSpreadsheetId(spreadsheetIdInput);

  try {
    switch (action) {
      case 'sheets': {
        // シート名一覧を取得
        const sheets = await getSheetNames(accessToken, spreadsheetId);
        return NextResponse.json({ success: true, sheets });
      }

      case 'columns': {
        // 列情報を取得
        const columns = await getColumnInfo(accessToken, spreadsheetId, sheetName);
        return NextResponse.json({ success: true, columns });
      }

      case 'articles':
      default: {
        // 記事データを取得
        const allArticles = await getArticles(
          accessToken,
          spreadsheetId,
          sheetName,
          keywordColumn,
          urlColumn,
          genreColumn || undefined
        );
        
        // プランに応じて行数を制限
        const totalRows = allArticles.length;
        const isLimited = totalRows > maxRows;
        const articles = isLimited ? allArticles.slice(0, maxRows) : allArticles;
        
        return NextResponse.json({ 
          success: true, 
          data: articles,
          meta: {
            totalRows,
            returnedRows: articles.length,
            isLimited,
            plan: userPlan,
            maxRows: maxRows === Infinity ? null : maxRows,
          }
        });
      }
    }
  } catch (error) {
    console.error('Sheets API error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // より分かりやすいエラーメッセージ
    let userMessage = message;
    if (message.includes('invalid_grant') || message.includes('Token has been expired')) {
      userMessage = 'セッションの有効期限が切れました。再度ログインしてください。';
    } else if (message.includes('permission') || message.includes('403')) {
      userMessage = 'このスプレッドシートへのアクセス権限がありません。自分のスプレッドシートか、共有されているスプレッドシートを指定してください。';
    } else if (message.includes('not found') || message.includes('404')) {
      userMessage = 'スプレッドシートが見つかりません。IDまたはURLを確認してください。';
    }

    return NextResponse.json(
      { success: false, error: userMessage },
      { status: 500 }
    );
  }
}
