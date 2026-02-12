'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import type { Project, SheetSettings, SelectorConfig } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  editingProject: Project | null;
}

const defaultSheetSettings: SheetSettings = {
  spreadsheetId: '',
  sheetName: 'Sheet1',
  keywordColumn: 'A',
  urlColumn: 'B',
  genreColumn: '',
};

const defaultSelectors: SelectorConfig[] = [
  {
    id: 'default-lkc-internal',
    name: 'リンクカード（内部）',
    selector: '.lkc-internal-wrap a.lkc-link',
    enabled: true,
  },
  {
    id: 'default-blogcard-shortcode',
    name: 'ブログカード（ショートコード）',
    selector: '[blogcard url=""]',
    enabled: false,
  },
  {
    id: 'default-blogcard-css',
    name: 'ブログカード（CSS）',
    selector: '.blogcard a, a.blogcard',
    enabled: false,
  },
];

export function ProjectModal({ open, onClose, editingProject }: ProjectModalProps) {
  const { addProject, updateProject, selectProject } = useAppStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [keywordColumn, setKeywordColumn] = useState('A');
  const [urlColumn, setUrlColumn] = useState('B');
  const [genreColumn, setGenreColumn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編集モードの場合、既存の値をセット
  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || '');
      setSpreadsheetId(editingProject.sheetSettings.spreadsheetId);
      setSheetName(editingProject.sheetSettings.sheetName);
      setKeywordColumn(editingProject.sheetSettings.keywordColumn);
      setUrlColumn(editingProject.sheetSettings.urlColumn);
      setGenreColumn(editingProject.sheetSettings.genreColumn || '');
    } else {
      // 新規作成の場合はリセット
      setName('');
      setDescription('');
      setSpreadsheetId(defaultSheetSettings.spreadsheetId);
      setSheetName(defaultSheetSettings.sheetName);
      setKeywordColumn(defaultSheetSettings.keywordColumn);
      setUrlColumn(defaultSheetSettings.urlColumn);
      setGenreColumn(defaultSheetSettings.genreColumn ?? '');
    }
    setError(null);
  }, [editingProject, open]);

  // スプレッドシートIDを抽出
  const extractSpreadsheetId = (input: string): string => {
    // URLの場合はIDを抽出
    const urlMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    // そのままIDとして扱う
    return input.trim();
  };

  const handleSubmit = async () => {
    // バリデーション
    if (!name.trim()) {
      setError('プロジェクト名を入力してください');
      return;
    }
    
    const extractedId = extractSpreadsheetId(spreadsheetId);
    if (!extractedId) {
      setError('スプレッドシートIDまたはURLを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const sheetSettings: SheetSettings = {
        spreadsheetId: extractedId,
        sheetName: sheetName || 'Sheet1',
        keywordColumn: keywordColumn || 'A',
        urlColumn: urlColumn || 'B',
        genreColumn: genreColumn || '',
      };

      if (editingProject) {
        // 更新
        await updateProject(editingProject.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          sheetSettings,
        });
      } else {
        // 新規作成
        const newId = await addProject({
          name: name.trim(),
          description: description.trim() || undefined,
          sheetSettings,
          selectors: defaultSelectors,
        });
        // 作成したプロジェクトを選択して開く
        selectProject(newId);
      }

      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingProject ? 'プロジェクトを編集' : '新規プロジェクト'}
          </DialogTitle>
          <DialogDescription>
            スプレッドシートの設定を保存して、いつでもアクセスできます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* プロジェクト名 */}
          <div className="space-y-2">
            <Label htmlFor="name">プロジェクト名 *</Label>
            <Input
              id="name"
              placeholder="例: メインブログ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Input
              id="description"
              placeholder="例: WordPressメインブログの内部リンク管理"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* スプレッドシートID/URL */}
          <div className="space-y-2">
            <Label htmlFor="spreadsheetId">スプレッドシートID または URL *</Label>
            <Input
              id="spreadsheetId"
              placeholder="https://docs.google.com/spreadsheets/d/xxx... または ID"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              GoogleスプレッドシートのURLまたはIDを入力
            </p>
          </div>

          {/* シート名 */}
          <div className="space-y-2">
            <Label htmlFor="sheetName">シート名</Label>
            <Input
              id="sheetName"
              placeholder="Sheet1"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
          </div>

          {/* 列設定 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="keywordColumn">キーワード列</Label>
              <Input
                id="keywordColumn"
                placeholder="A"
                value={keywordColumn}
                onChange={(e) => setKeywordColumn(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urlColumn">URL列</Label>
              <Input
                id="urlColumn"
                placeholder="B"
                value={urlColumn}
                onChange={(e) => setUrlColumn(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genreColumn">ジャンル列</Label>
              <Input
                id="genreColumn"
                placeholder="C（任意）"
                value={genreColumn}
                onChange={(e) => setGenreColumn(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {editingProject ? '更新' : '作成して開く'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
