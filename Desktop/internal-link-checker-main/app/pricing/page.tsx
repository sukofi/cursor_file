'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronLeft, Loader2 } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '¥0',
    period: '永久無料',
    description: 'まずは試してみたい方向け',
    features: [
      'スプレッドシートから10行まで取得',
      'プロジェクト数: 無制限',
      '内部リンクマトリクス表示',
      'CSVエクスポート',
    ],
    buttonText: '現在のプラン',
    buttonVariant: 'outline' as const,
    isCurrent: true,
    isPro: false,
  },
  {
    name: 'Pro',
    price: '¥980',
    period: '/月',
    description: '本格的に活用したい方向け',
    features: [
      'スプレッドシートから無制限に取得',
      'プロジェクト数: 無制限',
      '内部リンクマトリクス表示',
      'CSVエクスポート',
      '優先サポート',
    ],
    buttonText: 'アップグレード',
    buttonVariant: 'default' as const,
    isCurrent: false,
    isPro: true,
    popular: true,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

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

  const userPlan = session?.user?.plan || 'free';

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            戻る
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">シンプルな料金プラン</h1>
          <p className="text-xl text-muted-foreground">
            必要に応じてアップグレード。いつでもキャンセル可能。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = 
              (plan.isPro && userPlan === 'pro') || 
              (!plan.isPro && userPlan === 'free');

            return (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    人気
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      現在のプラン
                    </Button>
                  ) : plan.isPro ? (
                    <Button
                      className="w-full"
                      onClick={handleUpgrade}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        'アップグレード'
                      )}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      {plan.buttonText}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">よくある質問</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">いつでもキャンセルできますか？</h3>
              <p className="text-muted-foreground">
                はい、いつでもキャンセル可能です。キャンセル後も、現在の請求期間終了まではProプランの機能を利用できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">支払い方法は何が使えますか？</h3>
              <p className="text-muted-foreground">
                クレジットカード（Visa、Mastercard、American Express、JCB）に対応しています。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">無料プランから有料プランへの移行は？</h3>
              <p className="text-muted-foreground">
                ワンクリックでアップグレード可能です。データはそのまま引き継がれます。
              </p>
            </div>
          </div>
        </div>

        <p className="mt-16 text-center text-sm text-muted-foreground">
          <Link href="/terms" className="underline hover:text-foreground">利用規約</Link>
        </p>
      </main>
    </div>
  );
}
