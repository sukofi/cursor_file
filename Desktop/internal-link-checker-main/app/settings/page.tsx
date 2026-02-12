'use client';

import Link from 'next/link';
import { SheetSettings } from '@/components/settings/SheetSettings';
import { SelectorSettings } from '@/components/settings/SelectorSettings';
import { BillingSettings } from '@/components/settings/BillingSettings';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">設定</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <BillingSettings />
          <SheetSettings />
          <SelectorSettings />

          <div className="flex justify-end">
            <Link href="/">
              <Button>マトリクス画面へ戻る</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
