'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ColumnInfo } from '@/types';

export function SheetSettings() {
  const { sheetSettings, setSheetSettings } = useAppStore();
  
  const [sheets, setSheets] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spreadsheetInput, setSpreadsheetInput] = useState(sheetSettings.spreadsheetId);

  // シート一覧を取得
  const fetchSheets = async (spreadsheetId: string) => {
    if (!spreadsheetId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `/api/sheets?action=sheets&spreadsheetId=${encodeURIComponent(spreadsheetId)}`
      );
      const data = await res.json();
      
      if (data.success) {
        setSheets(data.sheets);
        if (data.sheets.length > 0 && !sheetSettings.sheetName) {
          setSheetSettings({ sheetName: data.sheets[0] });
        }
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('シート一覧の取得に失敗しました');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 列情報を取得
  const fetchColumns = async () => {
    if (!sheetSettings.spreadsheetId || !sheetSettings.sheetName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `/api/sheets?action=columns&spreadsheetId=${encodeURIComponent(
          sheetSettings.spreadsheetId
        )}&sheetName=${encodeURIComponent(sheetSettings.sheetName)}`
      );
      const data = await res.json();
      
      if (data.success) {
        setColumns(data.columns);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('列情報の取得に失敗しました');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // スプレッドシートIDが変更されたらシート一覧を取得
  useEffect(() => {
    if (sheetSettings.spreadsheetId) {
      fetchSheets(sheetSettings.spreadsheetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchSheets は ID 変更時のみ実行したい
  }, [sheetSettings.spreadsheetId]);

  // シート名が変更されたら列情報を取得
  useEffect(() => {
    if (sheetSettings.spreadsheetId && sheetSettings.sheetName) {
      fetchColumns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchColumns はシート変更時のみ実行したい
  }, [sheetSettings.spreadsheetId, sheetSettings.sheetName]);

  const handleConnect = () => {
    setSheetSettings({ spreadsheetId: spreadsheetInput });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>スプレッドシート設定</CardTitle>
        <CardDescription>
          Google スプレッドシートのURLまたはIDを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* スプレッドシートID入力 */}
        <div className="space-y-2">
          <Label htmlFor="spreadsheet-id">スプレッドシート URL / ID</Label>
          <div className="flex gap-2">
            <Input
              id="spreadsheet-id"
              placeholder="https://docs.google.com/spreadsheets/d/xxxxx または ID"
              value={spreadsheetInput}
              onChange={(e) => setSpreadsheetInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleConnect} disabled={loading || !spreadsheetInput}>
              {loading ? '接続中...' : '接続'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* シート選択 */}
        {sheets.length > 0 && (
          <div className="space-y-2">
            <Label>シート名</Label>
            <Select
              value={sheetSettings.sheetName}
              onValueChange={(value) => setSheetSettings({ sheetName: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="シートを選択" />
              </SelectTrigger>
              <SelectContent>
                {sheets.map((sheet) => (
                  <SelectItem key={sheet} value={sheet}>
                    {sheet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 列選択 */}
        {columns.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>キーワード列</Label>
                <Select
                  value={sheetSettings.keywordColumn}
                  onValueChange={(value) => setSheetSettings({ keywordColumn: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="列を選択" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[300px]">
                    {columns.map((col) => (
                      <SelectItem key={col.letter} value={col.letter}>
                        <div className="truncate">
                          <span className="font-medium">{col.letter}</span>: {col.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>URL列</Label>
                <Select
                  value={sheetSettings.urlColumn}
                  onValueChange={(value) => setSheetSettings({ urlColumn: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="列を選択" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[300px]">
                    {columns.map((col) => (
                      <SelectItem key={col.letter} value={col.letter}>
                        <div className="truncate">
                          <span className="font-medium">{col.letter}</span>: {col.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ジャンル列（任意）</Label>
                <Select
                  value={sheetSettings.genreColumn || 'none'}
                  onValueChange={(value) => setSheetSettings({ genreColumn: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="列を選択" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[300px]">
                    <SelectItem value="none">なし</SelectItem>
                    {columns.map((col) => (
                      <SelectItem key={col.letter} value={col.letter}>
                        <div className="truncate">
                          <span className="font-medium">{col.letter}</span>: {col.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 選択中の列のサンプル値表示 */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md space-y-1">
              <div><strong>KW列:</strong> {columns.find(c => c.letter === sheetSettings.keywordColumn)?.sampleValue || '-'}</div>
              <div><strong>URL列:</strong> {columns.find(c => c.letter === sheetSettings.urlColumn)?.sampleValue || '-'}</div>
              {sheetSettings.genreColumn && (
                <div><strong>ジャンル列:</strong> {columns.find(c => c.letter === sheetSettings.genreColumn)?.sampleValue || '-'}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
