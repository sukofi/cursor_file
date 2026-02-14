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
            <h1 className="text-3xl font-bold tracking-tight">
              商取引に関する開示（特定商取引法に基づく表記）
            </h1>
            <p className="text-muted-foreground text-sm">
              特定商取引法に基づき、通信販売に関する表示事項を以下のとおり開示します。
            </p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <dl className="divide-y divide-border">
              {/* 法人名（販売業者） */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">法人名（販売業者）</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  請求があった場合には遅滞なく開示いたします。
                </dd>
              </div>

              {/* 住所 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">住所</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  請求があった場合には速やかに開示いたします。
                </dd>
              </div>

              {/* 電話番号 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">電話番号</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  請求があった場合には速やかに開示いたします。
                  <br />
                  <span className="text-xs text-muted-foreground/80">
                    ※お問い合わせはメールにて受け付けております。対応時間：平日 10:00～18:00（土日祝除く）
                  </span>
                </dd>
              </div>

              {/* メールアドレス */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">メールアドレス</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  nakanowatari@seo-director.com
                  <br />
                  <span className="text-xs text-muted-foreground/80">
                    対応時間：平日 10:00～18:00（土日祝除く）
                  </span>
                </dd>
              </div>

              {/* 運営責任者 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">運営責任者</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  請求があった場合には遅滞なく開示いたします。
                </dd>
              </div>

              {/* 追加手数料（商品代金以外の必要料金） */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">追加手数料</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  商品またはサービスの代金以外に、お客様にご負担いただく手数料はありません。
                  <br />
                  インターネット接続に伴う通信料はお客様のご負担となります。
                </dd>
              </div>

              {/* 交換および返品に関するポリシー */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">交換および返品に関するポリシー</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground space-y-4">
                  <div>
                    <span className="font-medium block mb-1">＜通常の返品・交換（不良品以外）＞</span>
                    本サービスはデジタルコンテンツ（SaaS）のため、決済完了後の返金・返品・交換は原則としてお受けしておりません。
                    解約はいつでも可能です。次回更新日の前に解約手続きを完了していただければ、以降の課金は発生しません。残期間の日割り返金は行っておりません。
                  </div>
                  <div>
                    <span className="font-medium block mb-1">＜不良品・サービス不具合の場合の返品・交換＞</span>
                    サービスに重大な不具合がありご利用いただけない場合には、カスタマーサポート（nakanowatari@seo-director.com）までご連絡ください。
                    内容を確認のうえ、返金またはサービス側の修正・代替提供により対応いたします。
                  </div>
                </dd>
              </div>

              {/* 配達時間（商品の引渡時期・サービスの提供時期） */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">配達時間（引渡・提供時期）</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  決済完了後、直ちにご利用いただけます。
                </dd>
              </div>

              {/* 利用可能な決済手段 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">利用可能な決済手段</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  クレジットカード決済
                </dd>
              </div>

              {/* 決済期間（支払時期） */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">決済期間（お支払時期）</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  クレジットカード決済は申し込み時に即時処理されます。
                  継続課金の場合は、翌月以降は毎月の更新日に自動で決済されます。
                </dd>
              </div>

              {/* 価格（販売価格） */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
                <dt className="font-semibold text-sm md:text-base">価格（販売価格）</dt>
                <dd className="md:col-span-2 text-sm md:text-base text-muted-foreground">
                  各プラン・商品ページに表示している金額（税込）となります。
                </dd>
              </div>

              {/* 動作環境（オプション項目） */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-white/50 dark:bg-white/5">
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
