'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CreditCard, Loader2 } from 'lucide-react';

export function BillingSettings() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const userPlan = session?.user?.plan || 'free';
  const isPro = userPlan === 'pro';

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to create portal session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              プランと請求
            </CardTitle>
            <CardDescription>
              現在のプランの確認とアップグレード
            </CardDescription>
          </div>
          <Badge
            variant={isPro ? 'default' : 'secondary'}
            className={isPro ? 'bg-gradient-to-r from-amber-500 to-orange-500' : ''}
          >
            {isPro && <Crown className="h-3 w-3 mr-1" />}
            {isPro ? 'Pro' : 'Free'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {isPro ? 'Proプラン' : 'Freeプラン'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isPro
                  ? 'スプレッドシートから無制限に取得可能'
                  : 'スプレッドシートから10行まで取得可能'}
              </p>
            </div>
            <p className="text-2xl font-bold">
              {isPro ? '¥980' : '¥0'}
              <span className="text-sm font-normal text-muted-foreground">
                {isPro ? '/月' : ''}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {isPro ? (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              請求管理
            </Button>
          ) : (
            <>
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Proにアップグレード
              </Button>
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" className="w-full">
                  プラン詳細を見る
                </Button>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
