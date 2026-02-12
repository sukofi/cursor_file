'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

// よくあるセレクタパターン
const PRESET_SELECTORS = [
  { name: 'Pz-LinkCard（内部）', selector: '.lkc-internal-wrap a.lkc-link', category: 'ブログカード' },
  { name: 'Pz-LinkCard（全て）', selector: '.lkc-card a.lkc-link', category: 'ブログカード' },
  { name: 'Cocoon ブログカード', selector: '.blogcard-wrap a', category: 'ブログカード' },
  { name: 'SWELL ブログカード', selector: '.swell-block-blog-card a', category: 'ブログカード' },
  { name: 'JIN ブログカード', selector: '.blogcard-wrap a', category: 'ブログカード' },
  { name: 'AFFINGER ブログカード', selector: '.st-cardbox a', category: 'ブログカード' },
  { name: 'THE THOR ブログカード', selector: '.cardlink a', category: 'ブログカード' },
  { name: '関連記事リンク', selector: '.related-posts a, .related-entry a', category: '関連記事' },
  { name: '本文中リンク', selector: '.entry-content a, article a', category: '本文' },
  { name: '全てのリンク', selector: 'a[href]', category: '全般' },
  { name: 'ショートコード [blogcard]', selector: '[blogcard url=""]', category: 'ショートコード' },
];

export function SelectorSettings() {
  const { selectors, addSelector, updateSelector, removeSelector, toggleSelector } =
    useAppStore();

  const [newName, setNewName] = useState('');
  const [newSelector, setNewSelector] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newSelector.trim()) return;

    addSelector({
      id: `selector-${Date.now()}`,
      name: newName.trim(),
      selector: newSelector.trim(),
      enabled: true,
    });

    setNewName('');
    setNewSelector('');
  };

  const handlePresetSelect = (presetIndex: string) => {
    if (presetIndex === '') return;
    
    const preset = PRESET_SELECTORS[parseInt(presetIndex)];
    if (preset) {
      // 既に同じセレクタがあるかチェック
      const exists = selectors.some(s => s.selector === preset.selector);
      if (exists) {
        alert('このセレクタは既に追加されています');
        setSelectedPreset('');
        return;
      }
      
      addSelector({
        id: `selector-${Date.now()}`,
        name: preset.name,
        selector: preset.selector,
        enabled: true,
      });
      setSelectedPreset('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>内部リンク判定セレクタ</CardTitle>
        <CardDescription>
          内部リンクとしてカウントする要素を設定します。
          有効なセレクタがない場合は全ての&lt;a&gt;タグがカウントされます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* プリセットから追加 */}
        <div className="space-y-2">
          <Label>よくあるパターンから追加</Label>
          <Select value={selectedPreset} onValueChange={handlePresetSelect}>
            <SelectTrigger>
              <SelectValue placeholder="パターンを選択して追加..." />
            </SelectTrigger>
            <SelectContent>
              {PRESET_SELECTORS.map((preset, index) => (
                <SelectItem key={index} value={index.toString()}>
                  <span className="text-muted-foreground text-xs mr-2">[{preset.category}]</span>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 既存セレクタ一覧 */}
        <div className="space-y-2">
          <Label>設定済みセレクタ</Label>
          {selectors.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30">
              セレクタが設定されていません。上のプリセットから選択するか、下の手入力で追加してください。
            </p>
          ) : (
            selectors.map((selector) => (
              <div
                key={selector.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <Checkbox
                  checked={selector.enabled}
                  onCheckedChange={() => toggleSelector(selector.id)}
                />
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    value={selector.name}
                    onChange={(e) =>
                      updateSelector(selector.id, { name: e.target.value })
                    }
                    placeholder="名前"
                    className="h-8"
                  />
                  <Input
                    value={selector.selector}
                    onChange={(e) =>
                      updateSelector(selector.id, { selector: e.target.value })
                    }
                    placeholder="CSSセレクタ"
                    className="h-8 font-mono text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSelector(selector.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* 手入力で追加 */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium mb-2 block">
            手入力で追加
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="名前"
              className="flex-1"
            />
            <Input
              value={newSelector}
              onChange={(e) => setNewSelector(e.target.value)}
              placeholder="CSSセレクタ"
              className="flex-1 font-mono text-sm"
            />
            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || !newSelector.trim()}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            例: <code className="bg-muted px-1 py-0.5 rounded">.my-link a</code>、
            <code className="bg-muted px-1 py-0.5 rounded">{'[shortcode url=""]'}</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
