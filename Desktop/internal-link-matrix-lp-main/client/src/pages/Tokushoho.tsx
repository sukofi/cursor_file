
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Tokushoho() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">特定商取引法に基づく表記</h1>
            <p className="text-muted-foreground text-sm">
              特定商取引法に基づき、以下のとおり開示等の事項を表示します。
            </p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <dl className="divide-y divide-border">
              {/* 販売業者 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">販売業者</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  ご請求があり次第提供致しますので、必要な方はお問い合わせください。
                </dd>
              </div>

              {/* 代表責任者 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">運営統括責任者</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  ご請求があり次第提供致しますので、必要な方はお問い合わせください。
                </dd>
              </div>

              {/* 所在地 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">所在地</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  ご請求があり次第提供致しますので、必要な方はお問い合わせください。
                </dd>
              </div>

              {/* 電話番号 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">電話番号</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  ご請求があり次第提供致しますので、必要な方はお問い合わせください。
                  <br />
                  <span className="text-xs text-muted-foreground/80">
                    ※電話でのお問い合わせは受け付けておりません。お問い合わせはメールにてお願いいたします。
                  </span>
                </dd>
              </div>

              {/* メールアドレス */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">メールアドレス</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  nakanowatari@seo-director.com
                </dd>
              </div>

              {/* 販売価格 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">販売価格</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  各プランの紹介ページに記載している価格となります。
                </dd>
              </div>

              {/* 商品代金以外の必要料金 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">商品代金以外の必要料金</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  消費税、およびサイトの閲覧、お問い合わせ等の電子メールの送受信時などに、所定の通信料が発生いたします。
                </dd>
              </div>

              {/* 支払方法 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">お支払方法</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  クレジットカード決済
                </dd>
              </div>

              {/* 支払時期 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">お支払時期</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  <span className="font-medium">クレジットカード決済：</span>
                  <br />
                  初回お申し込み時に決済が完了します。翌月以降は毎月同日に自動更新されます。
                </dd>
              </div>

              {/* 商品の引渡時期 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">商品の引渡時期</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  決済完了後、直ちにご利用いただけます。
                </dd>
              </div>

              {/* 返品・交換について */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">返品・キャンセルについて</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground space-y-2">
                  <p>
                    <span className="font-medium">返金・交換：</span>
                    <br />
                    デジタルコンテンツの性質上、決済完了後の返金・返品・交換はお受けできません。
                  </p>
                  <p>
                    <span className="font-medium">解約：</span>
                    <br />
                    いつでも解約可能です。次回更新日までに解約手続きを行っていただければ、次回の課金は発生しません。
                    残期間分の日割り返金は行っておりません。
                  </p>
                </dd>
              </div>

              {/* 動作環境 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50">
                <dt className="font-semibold text-sm md:text-base">動作環境</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  インターネット接続環境のあるPC、スマートフォン、タブレット等の端末でご利用いただけます。
                  <br />
                  推奨ブラウザ：Google Chrome 最新版
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
